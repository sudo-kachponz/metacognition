"""
LSL (Lab Streaming Layer) stream consumer for the BCI platform.

Manages connection to a live or simulated EEG stream, buffers incoming
samples into a ring buffer, and yields fixed-length epochs for the
inference pipeline.

Usage:
    manager = LSLStreamManager()
    await manager.connect()
    await manager.start_acquisition()
    epoch = await manager.get_epoch()
"""

from __future__ import annotations

import asyncio
import logging
import math
import threading
import time
from collections import deque
from typing import Optional

import numpy as np

from app.core.config import settings

logger = logging.getLogger(__name__)


class MockEEGGenerator:
    """
    Synthetic EEG signal generator for development without hardware.

    Generates realistic multi-channel signals with:
        - Alpha (10 Hz), Beta (20 Hz), Theta (6 Hz), Delta (2 Hz) oscillations
        - 1/f pink noise (physiological background)
        - Gaussian white noise (sensor noise)
        - Random amplitude modulation per channel
    """

    def __init__(self, n_channels: int, sfreq: float):
        self.n_channels = n_channels
        self.sfreq = sfreq
        self._t: float = 0.0

        # Random per-channel parameters
        rng = np.random.default_rng(42)
        self._alpha_amp = rng.uniform(5.0, 15.0, n_channels)   # µV
        self._beta_amp = rng.uniform(2.0, 8.0, n_channels)
        self._theta_amp = rng.uniform(3.0, 10.0, n_channels)
        self._delta_amp = rng.uniform(8.0, 20.0, n_channels)
        self._phases = rng.uniform(0, 2 * np.pi, (n_channels, 4))
        self._noise_level = rng.uniform(1.0, 3.0, n_channels)

    def generate(self, n_samples: int) -> np.ndarray:
        """
        Generate n_samples of synthetic EEG data.

        Returns
        -------
        np.ndarray
            Shape (n_channels, n_samples), values in µV.
        """
        t = np.arange(n_samples) / self.sfreq + self._t
        self._t += n_samples / self.sfreq

        data = np.zeros((self.n_channels, n_samples))

        for ch in range(self.n_channels):
            # Oscillatory components
            alpha = self._alpha_amp[ch] * np.sin(
                2 * np.pi * 10 * t + self._phases[ch, 0]
            )
            beta = self._beta_amp[ch] * np.sin(
                2 * np.pi * 20 * t + self._phases[ch, 1]
            )
            theta = self._theta_amp[ch] * np.sin(
                2 * np.pi * 6 * t + self._phases[ch, 2]
            )
            delta = self._delta_amp[ch] * np.sin(
                2 * np.pi * 2 * t + self._phases[ch, 3]
            )

            # Pink noise (1/f)
            pink = self._generate_pink_noise(n_samples) * self._noise_level[ch]

            # White noise
            white = np.random.randn(n_samples) * self._noise_level[ch] * 0.5

            data[ch] = alpha + beta + theta + delta + pink + white

        return data

    @staticmethod
    def _generate_pink_noise(n_samples: int) -> np.ndarray:
        """Generate 1/f pink noise via spectral shaping."""
        white = np.random.randn(n_samples)
        fft = np.fft.rfft(white)
        freqs = np.fft.rfftfreq(n_samples)
        freqs[0] = 1.0  # avoid division by zero
        fft = fft / np.sqrt(freqs)
        return np.fft.irfft(fft, n=n_samples)


class LSLStreamManager:
    """
    Manages LSL EEG stream acquisition and buffering.

    Supports both real pylsl streams and mock synthetic data.
    Runs acquisition in a background thread, delivers epochs via
    an asyncio.Queue for consumption by FastAPI WebSocket handlers.
    """

    def __init__(
        self,
        stream_name: str = "",
        stream_type: str = "",
        buffer_seconds: float = 0.0,
        use_mock: bool = True,
        n_channels: int = 0,
        sfreq: float = 0.0,
    ):
        self.stream_name = stream_name or settings.LSL_STREAM_NAME
        self.stream_type = stream_type or settings.LSL_STREAM_TYPE
        self.buffer_seconds = buffer_seconds or settings.LSL_BUFFER_SECONDS
        self.use_mock = use_mock if use_mock is not None else settings.LSL_USE_MOCK
        self.n_channels = n_channels or settings.N_EEG_CHANNELS
        self.sfreq = sfreq or settings.EEG_SFREQ

        self._buffer_size = int(self.buffer_seconds * self.sfreq)
        self._epoch_size = int(settings.EPOCH_DURATION_S * self.sfreq)

        # Ring buffer: deque of (timestamp, sample_vector) tuples
        self._buffer: deque = deque(maxlen=self._buffer_size)

        # Epoch delivery queue
        self._epoch_queue: asyncio.Queue[np.ndarray] = asyncio.Queue(maxsize=32)

        # Threading
        self._running = False
        self._connected = False
        self._thread: Optional[threading.Thread] = None
        self._inlet = None  # pylsl.StreamInlet if real
        self._mock_gen: Optional[MockEEGGenerator] = None

        logger.info(
            "LSLStreamManager: name=%s, type=%s, buffer=%.1fs (%d samples), mock=%s",
            self.stream_name,
            self.stream_type,
            self.buffer_seconds,
            self._buffer_size,
            self.use_mock,
        )

    def is_connected(self) -> bool:
        return self._connected

    async def connect(self) -> bool:
        """
        Connect to an LSL stream or initialize mock generator.

        Returns True if connection succeeded.
        """
        if self.use_mock:
            self._mock_gen = MockEEGGenerator(self.n_channels, self.sfreq)
            self._connected = True
            logger.info("Connected to MOCK EEG stream (%d ch @ %.0f Hz)", self.n_channels, self.sfreq)
            return True

        # Real LSL connection
        try:
            from pylsl import StreamInlet, resolve_stream

            logger.info("Resolving LSL stream: name=%s, type=%s ...", self.stream_name, self.stream_type)
            streams = resolve_stream("type", self.stream_type, minimum=1, timeout=10.0)

            if not streams:
                logger.error("No LSL stream found with type=%s", self.stream_type)
                return False

            # Find the right stream by name
            target = None
            for s in streams:
                if s.name() == self.stream_name or not self.stream_name:
                    target = s
                    break
            if target is None:
                target = streams[0]

            self._inlet = StreamInlet(target, max_buflen=int(self.buffer_seconds))
            self.n_channels = target.channel_count()
            self.sfreq = target.nominal_srate()
            self._epoch_size = int(settings.EPOCH_DURATION_S * self.sfreq)
            self._buffer_size = int(self.buffer_seconds * self.sfreq)
            self._buffer = deque(maxlen=self._buffer_size)

            self._connected = True
            logger.info(
                "Connected to LSL stream: %s (%d ch @ %.0f Hz)",
                target.name(), self.n_channels, self.sfreq,
            )
            return True

        except ImportError:
            logger.error("pylsl not installed. Falling back to mock mode.")
            self.use_mock = True
            return await self.connect()
        except Exception as e:
            logger.error("Failed to connect to LSL stream: %s", e)
            return False

    async def start_acquisition(self) -> None:
        """Start the background acquisition thread."""
        if self._running:
            logger.warning("Acquisition already running")
            return

        if not self._connected:
            raise RuntimeError("Not connected. Call connect() first.")

        self._running = True
        self._thread = threading.Thread(
            target=self._acquisition_loop,
            daemon=True,
            name="LSL-Acquisition",
        )
        self._thread.start()
        logger.info("Acquisition thread started")

    async def get_epoch(self) -> Optional[np.ndarray]:
        """
        Get the next epoch from the buffer.

        Returns
        -------
        np.ndarray or None
            Shape (n_channels, epoch_size), or None if no data available.
        """
        try:
            return await asyncio.wait_for(self._epoch_queue.get(), timeout=2.0)
        except asyncio.TimeoutError:
            return None

    async def stop(self) -> None:
        """Stop acquisition and clean up."""
        self._running = False
        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=3.0)
        self._connected = False
        logger.info("Acquisition stopped")

    # ── Background acquisition loop ──────────────────────────────────

    def _acquisition_loop(self) -> None:
        """Runs in a background thread. Pulls samples and fills epochs."""
        # Get or create event loop for queue operations
        loop = asyncio.new_event_loop()
        chunk_size = int(self.sfreq * 0.02)  # 20ms chunks (10 samples @ 500 Hz)

        while self._running:
            try:
                if self.use_mock and self._mock_gen:
                    # Generate mock data
                    chunk = self._mock_gen.generate(chunk_size)
                    timestamps = np.arange(chunk_size) / self.sfreq + time.time()

                    for i in range(chunk_size):
                        self._buffer.append((timestamps[i], chunk[:, i]))

                    # Sleep to simulate real-time
                    time.sleep(chunk_size / self.sfreq)

                elif self._inlet is not None:
                    # Pull from real LSL stream
                    samples, timestamps = self._inlet.pull_chunk(
                        timeout=0.1, max_samples=chunk_size
                    )
                    if samples:
                        for ts, sample in zip(timestamps, samples):
                            self._buffer.append((ts, np.array(sample)))

                # Check if we have enough for an epoch
                if len(self._buffer) >= self._epoch_size:
                    self._extract_and_queue_epoch(loop)

            except Exception as e:
                logger.error("Acquisition error: %s", e)
                if not self._running:
                    break
                time.sleep(0.5)  # backoff on error

        loop.close()

    def _extract_and_queue_epoch(self, loop: asyncio.AbstractEventLoop) -> None:
        """Extract an epoch from the buffer and put it on the queue."""
        # Take the most recent epoch_size samples
        buf_list = list(self._buffer)
        recent = buf_list[-self._epoch_size:]

        epoch = np.array([s[1] for s in recent]).T  # (n_channels, epoch_size)

        # Non-blocking put
        try:
            self._epoch_queue.put_nowait(epoch)
        except asyncio.QueueFull:
            # Drop oldest epoch if queue is full
            try:
                self._epoch_queue.get_nowait()
            except asyncio.QueueEmpty:
                pass
            try:
                self._epoch_queue.put_nowait(epoch)
            except asyncio.QueueFull:
                pass

        # Advance buffer (remove half an epoch to get 50% overlap)
        half = self._epoch_size // 2
        for _ in range(min(half, len(self._buffer))):
            self._buffer.popleft()


# Singleton instance
lsl_manager = LSLStreamManager()

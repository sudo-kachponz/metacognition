"""
Production inference wrapper for the BCI Speech Decoder.

Provides the `InferenceEngine` class that FastAPI endpoints call for
real-time, low-latency decoding of EEG data.

Usage:
    engine = InferenceEngine()
    await engine.initialize("supervised")
    result = await engine.predict(eeg_window)
"""

from __future__ import annotations

import asyncio
import logging
import time
from typing import Optional

import numpy as np
import torch

from app.core.config import settings
from app.models.schemas import DecoderMode, LatencyStats, PredictionResponse
from app.services.models import BaseDecoder, build_model
from app.services.pipeline import EEGPreprocessor, PreprocessConfig

logger = logging.getLogger(__name__)


# ── 50-word BCI vocabulary (Bahasa Indonesia) ─────────────────────────
VOCABULARY: list[str] = [
    # Affirmation (5)
    "ya", "tidak", "mau", "oke", "tolong",
    # Basic needs (10)
    "air", "makan", "tidur", "duduk", "berdiri",
    "bantu", "obat", "sakit", "panas", "dingin",
    # Feelings (8)
    "senang", "sedih", "takut", "marah", "lelah",
    "lapar", "haus", "nyaman",
    # Social (7)
    "halo", "terima kasih", "maaf", "selamat pagi",
    "selamat malam", "sampai jumpa", "permisi",
    # Medical (6)
    "dokter", "perawat", "rumah sakit", "pemeriksaan",
    "terapi", "istirahat",
    # Family (5)
    "ibu", "bapak", "anak", "keluarga", "teman",
    # Directions (5)
    "kanan", "kiri", "atas", "bawah", "sini",
    # Time (4)
    "sekarang", "nanti", "kemarin", "besok",
]


class InferenceEngine:
    """
    Production-ready inference service.

    Manages model loading, preprocessing, prediction, and latency tracking.
    Thread-safe via asyncio.Lock for concurrent request handling.
    """

    def __init__(self) -> None:
        self._model: Optional[BaseDecoder] = None
        self._mode: Optional[DecoderMode] = None
        self._device: torch.device = torch.device("cpu")
        self._preprocessor: Optional[EEGPreprocessor] = None
        self._lock = asyncio.Lock()
        self._is_initialized = False

        # Latency tracking (exponential moving average)
        self._ema_inference_ms: float = 0.0
        self._ema_e2e_ms: float = 0.0
        self._ema_alpha: float = 0.1

    @property
    def is_initialized(self) -> bool:
        return self._is_initialized

    @property
    def current_mode(self) -> Optional[DecoderMode]:
        return self._mode

    @property
    def device(self) -> torch.device:
        return self._device

    async def initialize(
        self,
        decoder_mode: DecoderMode,
        device: str = "auto",
    ) -> None:
        """
        Load decoder weights into memory and warm up.

        Parameters
        ----------
        decoder_mode : DecoderMode
            One of 'supervised', 'unsupervised', 'rl'.
        device : str
            'auto', 'cuda', or 'cpu'.
        """
        async with self._lock:
            t0 = time.perf_counter()

            # Resolve device
            if device == "auto":
                self._device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            else:
                self._device = torch.device(device)

            logger.info("Initializing InferenceEngine: mode=%s, device=%s", decoder_mode, self._device)

            # Build model
            self._model = build_model(
                mode=decoder_mode,
                n_channels=settings.N_EEG_CHANNELS,
                n_classes=settings.N_CLASSES,
                seq_len=int(settings.EPOCH_DURATION_S * settings.EEG_SFREQ),
            )

            # Try to load weights if available
            weights_dir = settings.MODEL_WEIGHTS_DIR
            weight_file = f"{weights_dir}/{decoder_mode}_decoder.pt"
            try:
                self._model.load_weights(weight_file)
                logger.info("Loaded pretrained weights from %s", weight_file)
            except FileNotFoundError:
                logger.warning(
                    "No weights found at %s — using random initialization", weight_file
                )

            self._model = self._model.to(self._device)
            self._model.eval()
            self._mode = decoder_mode

            # Initialize preprocessor
            self._preprocessor = EEGPreprocessor(
                PreprocessConfig(
                    sfreq=settings.EEG_SFREQ,
                    n_channels=settings.N_EEG_CHANNELS,
                    epoch_duration_s=settings.EPOCH_DURATION_S,
                )
            )

            # Warm-up: run a dummy inference
            dummy = torch.randn(
                1,
                settings.N_EEG_CHANNELS,
                int(settings.EPOCH_DURATION_S * settings.EEG_SFREQ),
                device=self._device,
            )
            with torch.no_grad():
                _ = self._model(dummy)

            self._is_initialized = True
            elapsed = (time.perf_counter() - t0) * 1000
            logger.info(
                "InferenceEngine ready in %.1f ms (%d params on %s)",
                elapsed,
                self._model.count_parameters(),
                self._device,
            )

    async def predict(self, eeg_window: np.ndarray) -> PredictionResponse:
        """
        Run inference on an EEG window.

        Parameters
        ----------
        eeg_window : np.ndarray
            Shape (n_channels, n_samples). Raw EEG in microvolts.

        Returns
        -------
        PredictionResponse
            Decoded word, confidence, logits, latency, and decoder mode.
        """
        if not self._is_initialized or self._model is None or self._preprocessor is None:
            raise RuntimeError("InferenceEngine not initialized. Call initialize() first.")

        t_start = time.perf_counter()

        async with self._lock:
            # 1. Preprocess
            tensor = self._preprocessor.preprocess_epoch(eeg_window)
            tensor = tensor.to(self._device)

            # 2. Inference
            t_infer = time.perf_counter()
            with torch.no_grad():
                logits = self._model(tensor)  # (1, n_classes)
            t_infer_end = time.perf_counter()

            # 3. Decode
            probs = torch.softmax(logits, dim=-1)
            confidence, idx = probs.max(dim=-1)

            word_idx = idx.item()
            decoded_word = VOCABULARY[word_idx] if word_idx < len(VOCABULARY) else f"<UNK:{word_idx}>"

            # 4. Latency tracking
            inference_ms = (t_infer_end - t_infer) * 1000
            e2e_ms = (time.perf_counter() - t_start) * 1000

            self._ema_inference_ms = (
                self._ema_alpha * inference_ms
                + (1 - self._ema_alpha) * self._ema_inference_ms
            )
            self._ema_e2e_ms = (
                self._ema_alpha * e2e_ms + (1 - self._ema_alpha) * self._ema_e2e_ms
            )

        return PredictionResponse(
            decoded_word=decoded_word,
            confidence=round(confidence.item(), 4),
            logits=logits.squeeze(0).cpu().tolist(),
            latency=LatencyStats(
                endToEndMs=round(e2e_ms, 2),
                inferenceMs=round(inference_ms, 2),
                impedanceHz=settings.EEG_SFREQ,
            ),
            decoder_mode=self._mode or "supervised",
        )

    async def switch_decoder(self, new_mode: DecoderMode) -> None:
        """Switch to a different decoder model."""
        if new_mode == self._mode:
            logger.info("Already using %s decoder, skipping switch", new_mode)
            return
        logger.info("Switching decoder: %s → %s", self._mode, new_mode)
        await self.initialize(new_mode, device=str(self._device))

    def get_latency_stats(self) -> LatencyStats:
        """Get the exponential moving average latency statistics."""
        return LatencyStats(
            endToEndMs=round(self._ema_e2e_ms, 2),
            inferenceMs=round(self._ema_inference_ms, 2),
            impedanceHz=settings.EEG_SFREQ,
        )

    async def shutdown(self) -> None:
        """Release model from GPU memory."""
        async with self._lock:
            if self._model is not None:
                del self._model
                self._model = None
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            self._is_initialized = False
            logger.info("InferenceEngine shut down")


# Singleton instance
inference_engine = InferenceEngine()

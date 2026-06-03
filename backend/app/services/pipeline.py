"""
EEG Preprocessing Pipeline for the BCI Speech Decoder.

Provides a reusable `EEGPreprocessor` class that takes raw EEG arrays
and outputs model-ready PyTorch tensors. Uses MNE-Python for signal
processing under the hood.

Usage:
    preprocessor = EEGPreprocessor(sfreq=500, n_channels=64)
    tensor = preprocessor.preprocess_epoch(raw_array)
    # tensor.shape → (1, 64, 500)  for a 1-second epoch
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Optional

import numpy as np
import torch

logger = logging.getLogger(__name__)


@dataclass
class PreprocessConfig:
    """Configuration for the EEG preprocessing pipeline."""

    sfreq: float = 500.0
    n_channels: int = 64

    # Band-pass filter
    l_freq: float = 0.5       # Hz, high-pass cutoff
    h_freq: float = 50.0      # Hz, low-pass cutoff

    # Notch filter (Indonesian power line = 50 Hz)
    notch_freqs: list[float] = field(default_factory=lambda: [50.0, 100.0])

    # Artifact rejection
    reject_threshold_uv: float = 100.0  # ±µV

    # Epoching
    epoch_duration_s: float = 1.0
    epoch_overlap_s: float = 0.0

    # Normalization
    normalize: bool = True


class EEGPreprocessor:
    """
    Production EEG preprocessing pipeline.

    Stages:
        1. Band-pass filter (0.5–50 Hz, FIR)
        2. Notch filter (50 Hz + harmonics)
        3. Common average re-reference (CAR)
        4. Artifact rejection (amplitude thresholding)
        5. Per-channel z-score normalization
        6. Conversion to PyTorch tensor
    """

    def __init__(self, config: Optional[PreprocessConfig] = None) -> None:
        self.config = config or PreprocessConfig()
        self._epoch_samples = int(self.config.epoch_duration_s * self.config.sfreq)
        logger.info(
            "EEGPreprocessor initialized: %d channels @ %.0f Hz, "
            "epoch=%d samples, bandpass=[%.1f, %.1f] Hz",
            self.config.n_channels,
            self.config.sfreq,
            self._epoch_samples,
            self.config.l_freq,
            self.config.h_freq,
        )

    # ── Public API ────────────────────────────────────────────────────

    def preprocess_raw(self, raw_data: np.ndarray) -> np.ndarray:
        """
        Apply the full preprocessing pipeline to a raw EEG array.

        Parameters
        ----------
        raw_data : np.ndarray
            Shape (n_channels, n_samples). Values in microvolts.

        Returns
        -------
        np.ndarray
            Cleaned, filtered, normalized array of same shape.
        """
        data = raw_data.astype(np.float64).copy()

        # 1. Band-pass filter
        data = self._bandpass_filter(data)

        # 2. Notch filter
        data = self._notch_filter(data)

        # 3. Common average reference
        data = self._rereference_car(data)

        # 4. Artifact rejection (zero out bad segments)
        data = self._reject_artifacts(data)

        # 5. Normalization
        if self.config.normalize:
            data = self._normalize(data)

        return data

    def preprocess_epoch(self, epoch: np.ndarray) -> torch.Tensor:
        """
        Preprocess a single epoch and return a model-ready tensor.

        Parameters
        ----------
        epoch : np.ndarray
            Shape (n_channels, n_samples) or (n_samples,) for single channel.

        Returns
        -------
        torch.Tensor
            Shape (1, n_channels, n_samples) — batch dimension included.
        """
        if epoch.ndim == 1:
            epoch = epoch.reshape(1, -1)

        cleaned = self.preprocess_raw(epoch)
        tensor = torch.from_numpy(cleaned).float().unsqueeze(0)
        return tensor

    def extract_epochs(self, continuous: np.ndarray) -> list[np.ndarray]:
        """
        Segment continuous EEG into fixed-length epochs.

        Parameters
        ----------
        continuous : np.ndarray
            Shape (n_channels, total_samples).

        Returns
        -------
        list[np.ndarray]
            Each element has shape (n_channels, epoch_samples).
        """
        n_channels, total_samples = continuous.shape
        step = int(
            (self.config.epoch_duration_s - self.config.epoch_overlap_s)
            * self.config.sfreq
        )
        step = max(step, 1)

        epochs = []
        for start in range(0, total_samples - self._epoch_samples + 1, step):
            end = start + self._epoch_samples
            epochs.append(continuous[:, start:end])

        logger.debug("Extracted %d epochs from %d samples", len(epochs), total_samples)
        return epochs

    # ── Private processing stages ─────────────────────────────────────

    def _bandpass_filter(self, data: np.ndarray) -> np.ndarray:
        """Apply FIR band-pass filter using MNE or scipy fallback."""
        try:
            from mne.filter import filter_data
            return filter_data(
                data,
                sfreq=self.config.sfreq,
                l_freq=self.config.l_freq,
                h_freq=self.config.h_freq,
                method="fir",
                fir_design="firwin",
                verbose=False,
            )
        except ImportError:
            logger.warning("MNE not available, using scipy butterworth filter")
            return self._scipy_bandpass(data)

    def _scipy_bandpass(self, data: np.ndarray) -> np.ndarray:
        """Fallback bandpass using scipy Butterworth filter."""
        from scipy.signal import butter, sosfiltfilt

        nyq = self.config.sfreq / 2.0
        low = self.config.l_freq / nyq
        high = self.config.h_freq / nyq
        sos = butter(5, [low, high], btype="band", output="sos")
        return sosfiltfilt(sos, data, axis=-1)

    def _notch_filter(self, data: np.ndarray) -> np.ndarray:
        """Apply notch filter at power line frequency and harmonics."""
        if not self.config.notch_freqs:
            return data

        try:
            from mne.filter import notch_filter
            return notch_filter(
                data,
                Fs=self.config.sfreq,
                freqs=np.array(self.config.notch_freqs),
                verbose=False,
            )
        except ImportError:
            from scipy.signal import iirnotch, sosfiltfilt
            for freq in self.config.notch_freqs:
                if freq >= self.config.sfreq / 2:
                    continue
                b, a = iirnotch(freq, Q=30.0, fs=self.config.sfreq)
                # Convert to sos for numerical stability
                from scipy.signal import tf2sos
                sos = tf2sos(b, a)
                data = sosfiltfilt(sos, data, axis=-1)
            return data

    @staticmethod
    def _rereference_car(data: np.ndarray) -> np.ndarray:
        """Common Average Reference: subtract mean across channels."""
        mean = data.mean(axis=0, keepdims=True)
        return data - mean

    def _reject_artifacts(self, data: np.ndarray) -> np.ndarray:
        """
        Zero out time points where any channel exceeds the threshold.
        In production, this would use ICA or more sophisticated methods.
        """
        threshold = self.config.reject_threshold_uv
        bad_mask = np.any(np.abs(data) > threshold, axis=0)
        n_bad = bad_mask.sum()
        if n_bad > 0:
            logger.debug(
                "Artifact rejection: zeroed %d / %d samples (%.1f%%)",
                n_bad, data.shape[1], 100 * n_bad / data.shape[1],
            )
            data[:, bad_mask] = 0.0
        return data

    @staticmethod
    def _normalize(data: np.ndarray) -> np.ndarray:
        """Per-channel z-score normalization."""
        mean = data.mean(axis=-1, keepdims=True)
        std = data.std(axis=-1, keepdims=True)
        std = np.where(std < 1e-8, 1.0, std)  # avoid division by zero
        return (data - mean) / std

#!/usr/bin/env python
"""
01 — EEG Preprocessing Pipeline Demo
=====================================
Run this as a standalone script or convert to Jupyter notebook.

Demonstrates:
    1. Loading/generating synthetic EEG data
    2. Full preprocessing pipeline (bandpass, notch, CAR, artifact rejection)
    3. Visualization of raw vs. cleaned signals
    4. Spectral analysis (PSD before/after)
    5. Epoching continuous data

Usage:
    conda activate mozart
    cd backend
    python notebooks/01_preprocessing_demo.py
"""

import sys
sys.path.insert(0, "..")

import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from app.services.pipeline import EEGPreprocessor, PreprocessConfig
from app.services.lsl_stream import MockEEGGenerator

# ── 1. Generate synthetic EEG data ───────────────────────────────────

print("=" * 60)
print("EEG Preprocessing Pipeline Demo")
print("=" * 60)

SFREQ = 500.0
N_CHANNELS = 64
DURATION_S = 10.0
n_samples = int(SFREQ * DURATION_S)

gen = MockEEGGenerator(n_channels=N_CHANNELS, sfreq=SFREQ)
raw_data = gen.generate(n_samples)
print(f"\n✓ Generated synthetic EEG: {raw_data.shape} ({N_CHANNELS} channels × {n_samples} samples)")
print(f"  Duration: {DURATION_S}s @ {SFREQ} Hz")
print(f"  Amplitude range: [{raw_data.min():.1f}, {raw_data.max():.1f}] µV")

# ── 2. Initialize preprocessor ──────────────────────────────────────

config = PreprocessConfig(
    sfreq=SFREQ,
    n_channels=N_CHANNELS,
    l_freq=0.5,
    h_freq=50.0,
    notch_freqs=[50.0],
    reject_threshold_uv=100.0,
    normalize=True,
    epoch_duration_s=1.0,
)
preprocessor = EEGPreprocessor(config)

# ── 3. Preprocess ────────────────────────────────────────────────────

cleaned = preprocessor.preprocess_raw(raw_data)
print(f"\n✓ Preprocessed data: {cleaned.shape}")
print(f"  Cleaned amplitude range: [{cleaned.min():.3f}, {cleaned.max():.3f}]")

# ── 4. Visualize raw vs cleaned (first 4 channels, first 2 seconds) ─

fig, axes = plt.subplots(4, 2, figsize=(14, 8), sharex="col")
t = np.arange(int(2 * SFREQ)) / SFREQ

for i in range(4):
    samples = int(2 * SFREQ)
    axes[i, 0].plot(t, raw_data[i, :samples], linewidth=0.5, color="steelblue")
    axes[i, 0].set_ylabel(f"Ch {i}")
    if i == 0:
        axes[i, 0].set_title("Raw EEG (µV)")

    axes[i, 1].plot(t, cleaned[i, :samples], linewidth=0.5, color="seagreen")
    if i == 0:
        axes[i, 1].set_title("Cleaned (z-scored)")

axes[3, 0].set_xlabel("Time (s)")
axes[3, 1].set_xlabel("Time (s)")
plt.tight_layout()
plt.savefig("notebooks/fig_01_raw_vs_cleaned.png", dpi=150)
plt.close()
print("✓ Saved figure: notebooks/fig_01_raw_vs_cleaned.png")

# ── 5. Power Spectral Density ────────────────────────────────────────

from scipy.signal import welch

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))

# PSD of raw data (channel 0)
f_raw, psd_raw = welch(raw_data[0], fs=SFREQ, nperseg=1024)
ax1.semilogy(f_raw, psd_raw, color="steelblue")
ax1.set_xlabel("Frequency (Hz)")
ax1.set_ylabel("PSD (µV²/Hz)")
ax1.set_title("Raw EEG — Channel 0")
ax1.set_xlim(0, 60)
ax1.axvline(50, color="red", linestyle="--", alpha=0.5, label="50 Hz line noise")
ax1.legend()

# PSD of cleaned data (before normalization — reprocess without normalize)
config_no_norm = PreprocessConfig(sfreq=SFREQ, n_channels=N_CHANNELS, normalize=False)
pp_no_norm = EEGPreprocessor(config_no_norm)
cleaned_no_norm = pp_no_norm.preprocess_raw(raw_data)
f_clean, psd_clean = welch(cleaned_no_norm[0], fs=SFREQ, nperseg=1024)
ax2.semilogy(f_clean, psd_clean, color="seagreen")
ax2.set_xlabel("Frequency (Hz)")
ax2.set_ylabel("PSD (µV²/Hz)")
ax2.set_title("Cleaned EEG — Channel 0")
ax2.set_xlim(0, 60)
ax2.axvline(50, color="red", linestyle="--", alpha=0.5, label="50 Hz (removed)")
ax2.legend()

plt.tight_layout()
plt.savefig("notebooks/fig_01_psd_comparison.png", dpi=150)
plt.close()
print("✓ Saved figure: notebooks/fig_01_psd_comparison.png")

# ── 6. Epoching ──────────────────────────────────────────────────────

epochs = preprocessor.extract_epochs(cleaned)
print(f"\n✓ Extracted {len(epochs)} epochs of shape {epochs[0].shape}")

# Convert one epoch to tensor
import torch
tensor = preprocessor.preprocess_epoch(raw_data[:, :500])
print(f"✓ Epoch tensor shape: {tensor.shape}, dtype: {tensor.dtype}")

print("\n" + "=" * 60)
print("Demo complete! Check the saved figures.")
print("=" * 60)

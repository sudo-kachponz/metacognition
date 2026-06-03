import pytest
import numpy as np
import torch
from app.services.pipeline import EEGPreprocessor, PreprocessConfig

def test_preprocess_config_defaults():
    config = PreprocessConfig()
    assert config.sfreq == 500.0
    assert config.n_channels == 64
    assert config.l_freq == 0.5
    assert config.h_freq == 50.0

def test_preprocess_raw_shapes():
    preprocessor = EEGPreprocessor()
    raw = np.random.randn(64, 1000) * 10.0
    cleaned = preprocessor.preprocess_raw(raw)
    assert cleaned.shape == raw.shape
    assert cleaned.dtype == np.float64

def test_preprocess_epoch():
    preprocessor = EEGPreprocessor()
    epoch = np.random.randn(64, 500) * 10.0
    tensor = preprocessor.preprocess_epoch(epoch)
    
    assert isinstance(tensor, torch.Tensor)
    assert tensor.shape == (1, 64, 500)
    assert tensor.dtype == torch.float32

def test_extract_epochs():
    config = PreprocessConfig(epoch_duration_s=1.0, epoch_overlap_s=0.5, sfreq=100)
    preprocessor = EEGPreprocessor(config)
    
    # 5 seconds of continuous data (500 samples)
    continuous = np.random.randn(64, 500)
    epochs = preprocessor.extract_epochs(continuous)
    
    # Epoch duration: 1s = 100 samples
    # Step size: 1s - 0.5s = 0.5s = 50 samples
    # Epoch windows starting at sample: 0, 50, 100, 150, 200, 250, 300, 350, 400
    # Last window ends at 400 + 100 = 500
    # Total epochs: (500 - 100) / 50 + 1 = 9 epochs
    assert len(epochs) == 9
    assert epochs[0].shape == (64, 100)

def test_z_score_normalization():
    config = PreprocessConfig(normalize=True)
    preprocessor = EEGPreprocessor(config)
    
    raw = np.random.randn(64, 500) * 10.0 + 5.0  # mean non-zero, std non-one
    cleaned = preprocessor.preprocess_raw(raw)
    
    # Check mean is close to 0 and std is close to 1
    assert np.allclose(cleaned.mean(axis=-1), 0.0, atol=1e-7)
    # Exclude flat channels or edge conditions
    assert np.allclose(cleaned.std(axis=-1), 1.0, atol=1e-2)

import pytest
import numpy as np
from app.services.inference import InferenceEngine, VOCABULARY
from app.models.schemas import PredictionResponse

@pytest.mark.asyncio
async def test_inference_engine_lifecycle():
    engine = InferenceEngine()
    assert not engine.is_initialized
    
    # Initialize in CPU mode for fast/reliable unit tests
    await engine.initialize("supervised", device="cpu")
    assert engine.is_initialized
    assert engine.current_mode == "supervised"
    assert str(engine.device) == "cpu"
    
    # Switch decoder
    await engine.switch_decoder("rl")
    assert engine.current_mode == "rl"
    
    # Shutdown
    await engine.shutdown()
    assert not engine.is_initialized

@pytest.mark.asyncio
async def test_inference_predict():
    engine = InferenceEngine()
    await engine.initialize("supervised", device="cpu")
    
    # Mock EEG input: 64 channels, 500 samples
    eeg = np.random.randn(64, 500)
    
    result = await engine.predict(eeg)
    assert isinstance(result, PredictionResponse)
    assert result.decoded_word in VOCABULARY
    assert 0.0 <= result.confidence <= 1.0
    assert len(result.logits) == 50
    assert result.latency.inference_ms > 0.0
    assert result.latency.end_to_end_ms > 0.0
    
    await engine.shutdown()

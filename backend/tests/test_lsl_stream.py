import pytest
import numpy as np
import asyncio
from app.services.lsl_stream import LSLStreamManager, MockEEGGenerator

def test_mock_eeg_generator():
    gen = MockEEGGenerator(n_channels=64, sfreq=500.0)
    data = gen.generate(100)
    assert data.shape == (64, 100)
    assert data.dtype == np.float64

@pytest.mark.asyncio
async def test_lsl_stream_manager_mock():
    # Use small buffer/mock settings for unit test speed
    manager = LSLStreamManager(
        use_mock=True,
        n_channels=64,
        sfreq=100.0,
        buffer_seconds=1.0,
    )
    
    connected = await manager.connect()
    assert connected
    assert manager.is_connected()
    
    await manager.start_acquisition()
    
    # Wait for a couple of epochs to populate (epoch size is 100 samples)
    # The background loop generates 20ms chunks (2 samples @ 100Hz) and sleeps
    await asyncio.sleep(1.5)
    
    epoch = await manager.get_epoch()
    assert epoch is not None
    assert epoch.shape == (64, 100)
    
    await manager.stop()
    assert not manager.is_connected()

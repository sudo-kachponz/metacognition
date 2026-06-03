import pytest
import tempfile
from pathlib import Path
import torch
from app.services.models import build_model, EEGFormer, EEGMAE, DecisionTransformer

@pytest.mark.parametrize("mode, expected_class", [
    ("supervised", EEGFormer),
    ("unsupervised", EEGMAE),
    ("rl", DecisionTransformer),
])
def test_build_model(mode, expected_class):
    model = build_model(mode, n_channels=64, n_classes=50, seq_len=500)
    assert isinstance(model, expected_class)
    assert model.n_channels == 64
    assert model.n_classes == 50
    assert model.seq_len == 500

def test_eeg_former_forward():
    model = build_model("supervised", n_channels=64, n_classes=50, seq_len=500)
    x = torch.randn(4, 64, 500)
    out = model(x)
    assert out.shape == (4, 50)

def test_eeg_mae_forward_and_pretrain():
    model = build_model("unsupervised", n_channels=64, n_classes=50, seq_len=500)
    x = torch.randn(4, 64, 500)
    
    # Pretraining output shapes
    recon, mask = model.forward_pretrain(x)
    # n_patches = (500 - 25) // 12 + 1 = 40
    # patch dim = 64 * 25 = 1600
    assert recon.shape == (4, 40, 1600)
    assert mask.shape == (4, 40)
    
    # Classification output shape
    out = model(x)
    assert out.shape == (4, 50)

def test_decision_transformer_forward():
    model = build_model("rl", n_channels=64, n_classes=50, seq_len=500)
    
    # Simple classification mode forward pass
    x = torch.randn(4, 64, 500)
    out = model(x)
    assert out.shape == (4, 50)
    
    # Sequence mode forward pass
    # batch=4, steps=3
    states = torch.randn(4, 3, 64, 500)
    returns = torch.randn(4, 3, 1)
    actions = torch.randint(0, 50, (4, 3))
    timesteps = torch.arange(3).unsqueeze(0).repeat(4, 1)
    
    out_seq = model(states, returns_to_go=returns, actions=actions, timesteps=timesteps)
    assert out_seq.shape == (4, 50)

def test_save_load_weights():
    model = build_model("supervised", n_channels=64, n_classes=50, seq_len=500)
    original_param = next(model.parameters()).clone()
    
    with tempfile.TemporaryDirectory() as tmpdir:
        weight_file = Path(tmpdir) / "test_weights.pt"
        model.save_weights(weight_file)
        assert weight_file.exists()
        
        # Instantiate new model and load
        model2 = build_model("supervised", n_channels=64, n_classes=50, seq_len=500)
        model2.load_weights(weight_file)
        
        loaded_param = next(model2.parameters())
        assert torch.allclose(original_param, loaded_param)

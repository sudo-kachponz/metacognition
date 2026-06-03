"""
PyTorch model architectures for the BCI Speech Decoder.

Three decoder architectures, all sharing a common base interface:
  1. EEGFormer    — supervised baseline (spatial + temporal transformer)
  2. EEGMAE       — masked autoencoder for self-supervised pretraining
  3. DecisionTransformer — RL-based decoder via sequence modeling

Usage:
    from app.services.models import EEGFormer, EEGMAE, DecisionTransformer

    model = EEGFormer(n_channels=64, n_classes=50, seq_len=500)
    logits = model(eeg_tensor)  # (batch, n_classes)
"""

from __future__ import annotations

import logging
import math
from pathlib import Path
from typing import Optional

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch import Tensor

logger = logging.getLogger(__name__)


# ═══════════════════════════════════════════════════════════════════════
# Shared utilities
# ═══════════════════════════════════════════════════════════════════════

class PositionalEncoding(nn.Module):
    """Sinusoidal positional encoding for transformer inputs."""

    def __init__(self, d_model: int, max_len: int = 2048, dropout: float = 0.1):
        super().__init__()
        self.dropout = nn.Dropout(p=dropout)

        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len, dtype=torch.float).unsqueeze(1)
        div_term = torch.exp(
            torch.arange(0, d_model, 2).float() * (-math.log(10000.0) / d_model)
        )
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        pe = pe.unsqueeze(0)  # (1, max_len, d_model)
        self.register_buffer("pe", pe)

    def forward(self, x: Tensor) -> Tensor:
        x = x + self.pe[:, : x.size(1)]
        return self.dropout(x)


class PatchEmbedding(nn.Module):
    """
    Convert EEG time-series into temporal patches.

    Input:  (batch, n_channels, seq_len)
    Output: (batch, n_patches, d_model)
    """

    def __init__(
        self,
        n_channels: int,
        d_model: int,
        patch_size: int = 25,
        stride: int = 12,
    ):
        super().__init__()
        self.patch_size = patch_size
        self.stride = stride
        self.proj = nn.Linear(n_channels * patch_size, d_model)
        self.norm = nn.LayerNorm(d_model)

    def forward(self, x: Tensor) -> Tensor:
        # x: (B, C, T)
        B, C, T = x.shape
        # Unfold into patches: (B, C, n_patches, patch_size)
        patches = x.unfold(dimension=2, size=self.patch_size, step=self.stride)
        n_patches = patches.size(2)
        # Reshape: (B, n_patches, C * patch_size)
        patches = patches.permute(0, 2, 1, 3).contiguous().view(B, n_patches, -1)
        # Project to d_model
        return self.norm(self.proj(patches))


class SpatialAttention(nn.Module):
    """
    Learn inter-channel spatial relationships.

    Applies multi-head self-attention across the channel dimension.
    Input:  (batch, n_channels, seq_len)
    Output: (batch, n_channels, seq_len)
    """

    def __init__(self, n_channels: int, n_heads: int = 8, dropout: float = 0.1):
        super().__init__()
        self.attn = nn.MultiheadAttention(
            embed_dim=n_channels, num_heads=n_heads, dropout=dropout, batch_first=True
        )
        self.norm = nn.LayerNorm(n_channels)

    def forward(self, x: Tensor) -> Tensor:
        # x: (B, C, T) → transpose to (B, T, C) for channel-wise attention
        x_t = x.permute(0, 2, 1)
        attn_out, _ = self.attn(x_t, x_t, x_t)
        x_t = self.norm(x_t + attn_out)
        return x_t.permute(0, 2, 1)


# ═══════════════════════════════════════════════════════════════════════
# Base Decoder
# ═══════════════════════════════════════════════════════════════════════

class BaseDecoder(nn.Module):
    """Abstract base class for all BCI decoders."""

    def __init__(self, n_channels: int, n_classes: int, seq_len: int):
        super().__init__()
        self.n_channels = n_channels
        self.n_classes = n_classes
        self.seq_len = seq_len

    def count_parameters(self) -> int:
        """Count total trainable parameters."""
        return sum(p.numel() for p in self.parameters() if p.requires_grad)

    def save_weights(self, path: str | Path) -> None:
        """Save model weights to disk."""
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        torch.save(self.state_dict(), path)
        logger.info("Saved weights to %s (%.2f MB)", path, path.stat().st_size / 1e6)

    def load_weights(self, path: str | Path, strict: bool = True) -> None:
        """Load model weights from disk."""
        path = Path(path)
        state_dict = torch.load(path, map_location="cpu", weights_only=True)
        self.load_state_dict(state_dict, strict=strict)
        logger.info("Loaded weights from %s", path)


# ═══════════════════════════════════════════════════════════════════════
# 1. EEGFormer — Supervised Baseline
# ═══════════════════════════════════════════════════════════════════════

class EEGFormer(BaseDecoder):
    """
    Supervised EEG Transformer for speech decoding.

    Architecture:
        1. Spatial attention across channels
        2. Temporal patch embedding
        3. Transformer encoder (temporal attention)
        4. Global average pooling → classification head

    ~2.5M parameters with default settings.
    """

    def __init__(
        self,
        n_channels: int = 64,
        n_classes: int = 50,
        seq_len: int = 500,
        d_model: int = 256,
        n_heads: int = 8,
        n_layers: int = 4,
        dim_ff: int = 512,
        dropout: float = 0.1,
        patch_size: int = 25,
        patch_stride: int = 12,
    ):
        super().__init__(n_channels, n_classes, seq_len)

        # Spatial attention
        # We need n_channels to be divisible by n_heads for spatial attention
        spatial_heads = min(n_heads, n_channels)
        while n_channels % spatial_heads != 0 and spatial_heads > 1:
            spatial_heads -= 1
        self.spatial_attn = SpatialAttention(n_channels, n_heads=spatial_heads, dropout=dropout)

        # Patch embedding
        self.patch_embed = PatchEmbedding(n_channels, d_model, patch_size, patch_stride)

        # Positional encoding
        max_patches = (seq_len - patch_size) // patch_stride + 1
        self.pos_enc = PositionalEncoding(d_model, max_len=max_patches + 10, dropout=dropout)

        # CLS token
        self.cls_token = nn.Parameter(torch.randn(1, 1, d_model) * 0.02)

        # Transformer encoder
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=d_model,
            nhead=n_heads,
            dim_feedforward=dim_ff,
            dropout=dropout,
            activation="gelu",
            batch_first=True,
            norm_first=True,
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=n_layers)

        # Classification head
        self.head = nn.Sequential(
            nn.LayerNorm(d_model),
            nn.Linear(d_model, d_model),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(d_model, n_classes),
        )

        self._init_weights()
        logger.info("EEGFormer: %d params", self.count_parameters())

    def _init_weights(self) -> None:
        for p in self.parameters():
            if p.dim() > 1:
                nn.init.xavier_uniform_(p)

    def forward(self, x: Tensor) -> Tensor:
        """
        Forward pass.

        Parameters
        ----------
        x : Tensor
            Shape (batch, n_channels, seq_len)

        Returns
        -------
        Tensor
            Logits, shape (batch, n_classes)
        """
        # 1. Spatial attention
        x = self.spatial_attn(x)

        # 2. Patch embedding
        x = self.patch_embed(x)  # (B, n_patches, d_model)

        # 3. Prepend CLS token
        B = x.size(0)
        cls = self.cls_token.expand(B, -1, -1)
        x = torch.cat([cls, x], dim=1)

        # 4. Positional encoding + Transformer
        x = self.pos_enc(x)
        x = self.transformer(x)

        # 5. Classification from CLS token
        cls_out = x[:, 0]
        return self.head(cls_out)


# ═══════════════════════════════════════════════════════════════════════
# 2. EEGMAE — Masked Autoencoder
# ═══════════════════════════════════════════════════════════════════════

class EEGMAE(BaseDecoder):
    """
    EEG Masked Autoencoder for self-supervised representation learning.

    Architecture:
        Encoder: processes only visible (unmasked) patches
        Decoder: reconstructs all patches from visible + mask tokens
        Fine-tuning: attach classification head to encoder

    ~5M parameters with default settings.
    """

    def __init__(
        self,
        n_channels: int = 64,
        n_classes: int = 50,
        seq_len: int = 500,
        # Encoder
        enc_d_model: int = 384,
        enc_n_heads: int = 8,
        enc_n_layers: int = 6,
        enc_dim_ff: int = 768,
        # Decoder
        dec_d_model: int = 192,
        dec_n_heads: int = 4,
        dec_n_layers: int = 2,
        dec_dim_ff: int = 384,
        # Masking
        mask_ratio: float = 0.75,
        # General
        dropout: float = 0.1,
        patch_size: int = 25,
        patch_stride: int = 12,
    ):
        super().__init__(n_channels, n_classes, seq_len)

        self.mask_ratio = mask_ratio
        self.patch_size = patch_size

        # Patch embedding (shared)
        self.patch_embed = PatchEmbedding(n_channels, enc_d_model, patch_size, patch_stride)

        # Calculate number of patches
        self.n_patches = (seq_len - patch_size) // patch_stride + 1

        # Encoder positional encoding
        self.enc_pos = PositionalEncoding(enc_d_model, max_len=self.n_patches + 10, dropout=dropout)

        # Encoder transformer
        enc_layer = nn.TransformerEncoderLayer(
            d_model=enc_d_model,
            nhead=enc_n_heads,
            dim_feedforward=enc_dim_ff,
            dropout=dropout,
            activation="gelu",
            batch_first=True,
            norm_first=True,
        )
        self.encoder = nn.TransformerEncoder(enc_layer, num_layers=enc_n_layers)
        self.enc_norm = nn.LayerNorm(enc_d_model)

        # Decoder
        self.enc_to_dec = nn.Linear(enc_d_model, dec_d_model)
        self.mask_token = nn.Parameter(torch.randn(1, 1, dec_d_model) * 0.02)
        self.dec_pos = PositionalEncoding(dec_d_model, max_len=self.n_patches + 10, dropout=dropout)

        dec_layer = nn.TransformerEncoderLayer(
            d_model=dec_d_model,
            nhead=dec_n_heads,
            dim_feedforward=dec_dim_ff,
            dropout=dropout,
            activation="gelu",
            batch_first=True,
            norm_first=True,
        )
        self.decoder = nn.TransformerEncoder(dec_layer, num_layers=dec_n_layers)

        # Reconstruction head: predict the raw patch values
        self.reconstruct_head = nn.Linear(dec_d_model, n_channels * patch_size)

        # Classification head (for fine-tuning)
        self.cls_head = nn.Sequential(
            nn.LayerNorm(enc_d_model),
            nn.Linear(enc_d_model, enc_d_model // 2),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(enc_d_model // 2, n_classes),
        )

        self._init_weights()
        logger.info("EEGMAE: %d params", self.count_parameters())

    def _init_weights(self) -> None:
        for p in self.parameters():
            if p.dim() > 1:
                nn.init.xavier_uniform_(p)

    def _random_masking(
        self, x: Tensor
    ) -> tuple[Tensor, Tensor, Tensor]:
        """
        Randomly mask patches.

        Returns: visible patches, mask indices, restore indices
        """
        B, N, D = x.shape
        n_keep = max(1, int(N * (1 - self.mask_ratio)))

        # Random permutation per sample
        noise = torch.rand(B, N, device=x.device)
        ids_shuffle = torch.argsort(noise, dim=1)
        ids_restore = torch.argsort(ids_shuffle, dim=1)

        # Keep only first n_keep
        ids_keep = ids_shuffle[:, :n_keep]
        x_visible = torch.gather(
            x, dim=1, index=ids_keep.unsqueeze(-1).expand(-1, -1, D)
        )

        # Binary mask: 0 = keep, 1 = mask
        mask = torch.ones(B, N, device=x.device)
        mask[:, :n_keep] = 0
        mask = torch.gather(mask, dim=1, index=ids_restore)

        return x_visible, mask, ids_restore

    def forward_pretrain(self, x: Tensor) -> tuple[Tensor, Tensor]:
        """
        Pretraining forward pass with masking.

        Parameters
        ----------
        x : Tensor
            Shape (batch, n_channels, seq_len)

        Returns
        -------
        tuple[Tensor, Tensor]
            (reconstruction, mask) for computing MSE loss
        """
        # Patch embedding
        patches = self.patch_embed(x)  # (B, N, enc_d)

        # Random masking
        visible, mask, ids_restore = self._random_masking(patches)

        # Encode visible patches
        visible = self.enc_pos(visible)
        encoded = self.encoder(visible)
        encoded = self.enc_norm(encoded)

        # Project to decoder dimension
        dec_tokens = self.enc_to_dec(encoded)

        # Append mask tokens and unshuffle
        B, N_vis, D_dec = dec_tokens.shape
        N_total = patches.size(1)
        n_mask = N_total - N_vis

        mask_tokens = self.mask_token.expand(B, n_mask, -1)
        full = torch.cat([dec_tokens, mask_tokens], dim=1)

        # Unshuffle to original order
        full = torch.gather(
            full,
            dim=1,
            index=ids_restore.unsqueeze(-1).expand(-1, -1, D_dec),
        )

        # Decode
        full = self.dec_pos(full)
        decoded = self.decoder(full)

        # Reconstruct
        reconstruction = self.reconstruct_head(decoded)  # (B, N, C*P)

        return reconstruction, mask

    def forward(self, x: Tensor) -> Tensor:
        """
        Classification forward pass (fine-tuning mode).

        Uses the encoder only, averages patch embeddings, applies cls_head.
        """
        patches = self.patch_embed(x)
        patches = self.enc_pos(patches)
        encoded = self.encoder(patches)
        encoded = self.enc_norm(encoded)

        # Global average pooling
        pooled = encoded.mean(dim=1)
        return self.cls_head(pooled)


# ═══════════════════════════════════════════════════════════════════════
# 3. DecisionTransformer — RL-based Decoder
# ═══════════════════════════════════════════════════════════════════════

class DecisionTransformer(BaseDecoder):
    """
    Decision Transformer for BCI speech decoding.

    Treats decoding as a sequence-modeling problem:
        State  = EEG embedding
        Action = decoded word
        Return = accuracy metric (return-to-go)

    Uses a GPT-2 style causal transformer to predict actions
    conditioned on desired returns and past states.

    ~3M parameters with default settings.
    """

    def __init__(
        self,
        n_channels: int = 64,
        n_classes: int = 50,
        seq_len: int = 500,
        d_model: int = 256,
        n_heads: int = 4,
        n_layers: int = 4,
        dim_ff: int = 512,
        dropout: float = 0.1,
        max_episode_len: int = 20,
        patch_size: int = 25,
        patch_stride: int = 12,
    ):
        super().__init__(n_channels, n_classes, seq_len)

        self.d_model = d_model
        self.max_episode_len = max_episode_len

        # EEG state encoder (patch embedding → mean pool → project)
        self.patch_embed = PatchEmbedding(n_channels, d_model, patch_size, patch_stride)
        self.state_encoder = nn.Sequential(
            nn.LayerNorm(d_model),
            nn.Linear(d_model, d_model),
            nn.GELU(),
        )

        # Embedding layers
        self.return_embed = nn.Sequential(
            nn.Linear(1, d_model),
            nn.GELU(),
        )
        self.action_embed = nn.Embedding(n_classes + 1, d_model)  # +1 for padding
        self.timestep_embed = nn.Embedding(max_episode_len + 1, d_model)

        # GPT-2 style causal transformer
        decoder_layer = nn.TransformerEncoderLayer(
            d_model=d_model,
            nhead=n_heads,
            dim_feedforward=dim_ff,
            dropout=dropout,
            activation="gelu",
            batch_first=True,
            norm_first=True,
        )
        self.transformer = nn.TransformerEncoder(decoder_layer, num_layers=n_layers)

        # Layer norm
        self.ln = nn.LayerNorm(d_model)

        # Prediction heads
        self.action_head = nn.Linear(d_model, n_classes)
        self.state_pred_head = nn.Linear(d_model, d_model)

        # Positional encoding for the full sequence (R, S, A interleaved)
        self.pos_enc = PositionalEncoding(d_model, max_len=3 * max_episode_len + 10, dropout=dropout)

        self._init_weights()
        logger.info("DecisionTransformer: %d params", self.count_parameters())

    def _init_weights(self) -> None:
        for p in self.parameters():
            if p.dim() > 1:
                nn.init.xavier_uniform_(p)

    def _encode_state(self, eeg: Tensor) -> Tensor:
        """Encode raw EEG into a state embedding vector."""
        # eeg: (B, C, T) or (B, K, C, T) for sequence of K states
        if eeg.dim() == 3:
            eeg = eeg.unsqueeze(1)  # (B, 1, C, T)

        B, K, C, T = eeg.shape
        eeg_flat = eeg.view(B * K, C, T)
        patches = self.patch_embed(eeg_flat)  # (B*K, n_patches, d_model)
        pooled = patches.mean(dim=1)  # (B*K, d_model)
        encoded = self.state_encoder(pooled)  # (B*K, d_model)
        return encoded.view(B, K, self.d_model)

    def forward(
        self,
        x: Tensor,
        returns_to_go: Optional[Tensor] = None,
        actions: Optional[Tensor] = None,
        timesteps: Optional[Tensor] = None,
    ) -> Tensor:
        """
        Forward pass.

        For simple classification (single step), just pass x.
        For full RL sequence, pass all arguments.

        Parameters
        ----------
        x : Tensor
            EEG data, shape (batch, n_channels, seq_len) or
            (batch, K, n_channels, seq_len) for K-step sequence.
        returns_to_go : Tensor, optional
            Shape (batch, K, 1). Desired future returns.
        actions : Tensor, optional
            Shape (batch, K). Past action indices.
        timesteps : Tensor, optional
            Shape (batch, K). Step indices.

        Returns
        -------
        Tensor
            Action logits, shape (batch, n_classes)
        """
        B = x.size(0)

        # Simple classification mode (single-step)
        if returns_to_go is None:
            state_emb = self._encode_state(x)  # (B, 1, d)
            state_emb = self.ln(state_emb)
            return self.action_head(state_emb[:, 0])

        # Full RL sequence mode
        K = returns_to_go.size(1)

        # Encode states
        state_emb = self._encode_state(x)  # (B, K, d)

        # Encode returns, actions, timesteps
        return_emb = self.return_embed(returns_to_go)  # (B, K, d)
        action_emb = self.action_embed(actions)  # (B, K, d)
        time_emb = self.timestep_embed(timesteps)  # (B, K, d)

        # Add timestep embeddings
        state_emb = state_emb + time_emb
        return_emb = return_emb + time_emb
        action_emb = action_emb + time_emb

        # Interleave: [R1, S1, A1, R2, S2, A2, ...]
        tokens = torch.stack([return_emb, state_emb, action_emb], dim=2)
        tokens = tokens.view(B, 3 * K, self.d_model)

        # Positional encoding
        tokens = self.pos_enc(tokens)

        # Causal mask
        seq_len = tokens.size(1)
        causal_mask = torch.triu(
            torch.ones(seq_len, seq_len, device=tokens.device), diagonal=1
        ).bool()

        # Transform
        out = self.transformer(tokens, mask=causal_mask)
        out = self.ln(out)

        # Extract state positions (indices 1, 4, 7, ...) for action prediction
        state_indices = torch.arange(1, 3 * K, 3, device=out.device)
        state_outputs = out[:, state_indices]

        # Predict action from the last state
        return self.action_head(state_outputs[:, -1])


# ═══════════════════════════════════════════════════════════════════════
# Model registry
# ═══════════════════════════════════════════════════════════════════════

MODEL_REGISTRY: dict[str, type[BaseDecoder]] = {
    "supervised": EEGFormer,
    "unsupervised": EEGMAE,
    "rl": DecisionTransformer,
}


def build_model(
    mode: str,
    n_channels: int = 64,
    n_classes: int = 50,
    seq_len: int = 500,
    **kwargs,
) -> BaseDecoder:
    """
    Factory function to build a decoder by mode string.

    Parameters
    ----------
    mode : str
        One of 'supervised', 'unsupervised', 'rl'.
    """
    cls = MODEL_REGISTRY.get(mode)
    if cls is None:
        raise ValueError(f"Unknown decoder mode: {mode!r}. Choose from {list(MODEL_REGISTRY)}")
    return cls(n_channels=n_channels, n_classes=n_classes, seq_len=seq_len, **kwargs)

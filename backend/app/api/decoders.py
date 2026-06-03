"""
Decoder management and single-shot inference API routes.

Endpoints:
    GET  /api/v1/decoders          — List available decoder models
    POST /api/v1/decoders/predict  — Run single-shot inference
    POST /api/v1/decoders/switch   — Switch active decoder mode
"""

from __future__ import annotations

import logging

import numpy as np
from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    DecoderInfo,
    DecoderMode,
    PredictionRequest,
    PredictionResponse,
)
from app.services.inference import inference_engine

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/decoders", tags=["Decoders"])

# ── Static decoder registry ──────────────────────────────────────────

DECODERS: list[DecoderInfo] = [
    DecoderInfo(
        id="eeg-former-v1",
        mode="supervised",
        displayName="EEG-Former (Supervised)",
        description="Spatial + temporal transformer for supervised speech decoding. "
        "Best accuracy on labeled data.",
        available=True,
    ),
    DecoderInfo(
        id="eeg-mae-v1",
        mode="unsupervised",
        displayName="EEG-MAE (Self-Supervised)",
        description="Masked autoencoder for unsupervised EEG representation learning. "
        "Pretrain on unlabeled data, fine-tune on small labeled sets.",
        available=True,
    ),
    DecoderInfo(
        id="decision-transformer-v1",
        mode="rl",
        displayName="Decision Transformer (RL)",
        description="Reinforcement learning decoder using sequence modeling. "
        "Adapts online to patient-specific neural patterns.",
        available=True,
    ),
]


@router.get("", response_model=list[DecoderInfo])
async def list_decoders() -> list[DecoderInfo]:
    """List all available decoder models and their status."""
    return DECODERS


@router.post("/predict", response_model=PredictionResponse)
async def predict(body: PredictionRequest) -> PredictionResponse:
    """
    Run single-shot inference on an EEG window.

    Expects body.eeg_window to be a 2D array of shape (n_channels, n_samples).
    """
    if not inference_engine.is_initialized:
        raise HTTPException(
            status_code=503,
            detail="Inference engine not initialized. Start a session first.",
        )

    try:
        eeg = np.array(body.eeg_window, dtype=np.float64)
    except (ValueError, TypeError) as e:
        raise HTTPException(status_code=400, detail=f"Invalid EEG data: {e}")

    if eeg.ndim != 2:
        raise HTTPException(
            status_code=400,
            detail=f"Expected 2D EEG array (channels × samples), got {eeg.ndim}D",
        )

    # Switch decoder if requested
    if body.decoder_mode and body.decoder_mode != inference_engine.current_mode:
        await inference_engine.switch_decoder(body.decoder_mode)

    result = await inference_engine.predict(eeg)
    return result


@router.post("/switch")
async def switch_decoder(mode: DecoderMode) -> dict:
    """Switch the active decoder model."""
    await inference_engine.switch_decoder(mode)
    return {"status": "ok", "active_decoder": mode}

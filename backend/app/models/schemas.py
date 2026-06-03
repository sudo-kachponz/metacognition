"""
Pydantic v2 schemas for the BCI Speech Decoder API.

These mirror the TypeScript types in frontend/lib/types.ts exactly.
"""

from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


# ── Core type aliases ─────────────────────────────────────────────────

DecoderMode = Literal["supervised", "unsupervised", "rl"]
SessionStatus = Literal["idle", "calibrating", "running", "paused", "archived"]


# ── Decoder ───────────────────────────────────────────────────────────

class DecoderInfo(BaseModel):
    """Describes an available decoder model."""
    id: str
    mode: DecoderMode
    display_name: str = Field(alias="displayName", default="")
    description: str = ""
    available: bool = False

    model_config = {"populate_by_name": True}


# ── Session ───────────────────────────────────────────────────────────

class SessionInfo(BaseModel):
    """A single recording / decoding session."""
    id: str
    patient_id: str = Field(alias="patientId", default="")
    decoder_mode: DecoderMode = Field(alias="decoderMode", default="supervised")
    started_at: str = Field(alias="startedAt", default="")
    ended_at: Optional[str] = Field(alias="endedAt", default=None)
    status: SessionStatus = "idle"

    model_config = {"populate_by_name": True}


class SessionCreate(BaseModel):
    """Request body for creating a new session."""
    patient_id: str
    decoder_mode: DecoderMode = "supervised"


class SessionStatusUpdate(BaseModel):
    """Request body for changing session status."""
    status: SessionStatus


# ── Latency ───────────────────────────────────────────────────────────

class LatencyStats(BaseModel):
    """Timing metrics pushed to the frontend."""
    end_to_end_ms: float = Field(alias="endToEndMs", default=0.0)
    inference_ms: float = Field(alias="inferenceMs", default=0.0)
    impedance_hz: float = Field(alias="impedanceHz", default=0.0)

    model_config = {"populate_by_name": True}


# ── EEG Frame ─────────────────────────────────────────────────────────

class EEGFrame(BaseModel):
    """A single EEG data frame pushed via WebSocket."""
    timestamp: float
    data: list[list[float]]  # channels × samples
    ttl: Optional[int] = None


# ── Flashcard ─────────────────────────────────────────────────────────

class Flashcard(BaseModel):
    """A vocabulary cue card for the speech paradigm."""
    id: str
    text: str
    audio_url: Optional[str] = Field(alias="audioUrl", default=None)
    duration_ms: int = Field(alias="durationMs", default=2000)

    model_config = {"populate_by_name": True}


# ── Prediction ────────────────────────────────────────────────────────

class PredictionRequest(BaseModel):
    """Single-shot inference request."""
    eeg_window: list[list[float]] = Field(
        ..., description="EEG data: shape (n_channels, n_samples)"
    )
    decoder_mode: Optional[DecoderMode] = None


class PredictionResponse(BaseModel):
    """Inference result."""
    decoded_word: str
    confidence: float
    logits: list[float]
    latency: LatencyStats
    decoder_mode: DecoderMode


# ── Health ────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    """Health check response."""
    status: str = "ok"
    version: str = ""
    decoder_loaded: bool = False
    lsl_connected: bool = False
    device: str = "cpu"

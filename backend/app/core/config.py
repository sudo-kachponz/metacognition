"""
Application configuration via Pydantic Settings.

Reads from environment variables or a .env file in the backend root.
"""

from __future__ import annotations

from pathlib import Path
from typing import Literal, Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


# Resolve the backend root (two levels up from this file)
_BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    """Central configuration for the BCI backend."""

    model_config = SettingsConfigDict(
        env_file=str(_BACKEND_ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ── Application ──────────────────────────────────────────────────
    APP_NAME: str = "BCI Speech Decoder API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True

    # ── CORS ─────────────────────────────────────────────────────────
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # ── Decoder defaults ─────────────────────────────────────────────
    DEFAULT_DECODER_MODE: Literal["supervised", "unsupervised", "rl"] = "supervised"
    MODEL_WEIGHTS_DIR: str = str(_BACKEND_ROOT / "weights")
    N_EEG_CHANNELS: int = 64
    EEG_SFREQ: float = 500.0
    N_CLASSES: int = 50  # vocabulary size (50 words)
    EPOCH_DURATION_S: float = 1.0  # 1-second windows

    # ── LSL ───────────────────────────────────────────────────────────
    LSL_STREAM_NAME: str = "BCI_EEG"
    LSL_STREAM_TYPE: str = "EEG"
    LSL_BUFFER_SECONDS: float = 2.0
    LSL_USE_MOCK: bool = True  # True = synthetic stream for dev

    # ── InfluxDB (time-series EEG storage) ────────────────────────────
    INFLUXDB_URL: str = "http://localhost:8086"
    INFLUXDB_TOKEN: str = ""
    INFLUXDB_ORG: str = "bci-lab"
    INFLUXDB_BUCKET: str = "eeg_data"

    # ── PostgreSQL (metadata) ─────────────────────────────────────────
    POSTGRES_DSN: str = "postgresql+asyncpg://bci:bci@localhost:5432/bci"

    # ── Ollama (optional RL reward predictor) ─────────────────────────
    OLLAMA_ENABLED: bool = False
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "qwen3:8b"

    # ── Device ────────────────────────────────────────────────────────
    DEVICE: str = "auto"  # "auto" | "cuda" | "cpu"


# Singleton settings instance
settings = Settings()

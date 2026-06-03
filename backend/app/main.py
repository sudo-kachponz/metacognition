"""
BCI Speech Decoder Platform — FastAPI Application Entry Point.

Mounts all API routers, configures CORS and lifespan events.

Run:
    conda activate mozart
    cd backend
    uvicorn app.main:app --reload --port 8000
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.models.schemas import HealthResponse

# Import routers
from app.api.sessions import router as sessions_router
from app.api.decoders import router as decoders_router
from app.api.stream import router as stream_router

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


# ── Lifespan event handler ────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle events."""
    # ── Startup ──
    logger.info("=" * 60)
    logger.info("  %s v%s", settings.APP_NAME, settings.APP_VERSION)
    logger.info("  Device: %s", settings.DEVICE)
    logger.info("  Default decoder: %s", settings.DEFAULT_DECODER_MODE)
    logger.info("  LSL mock mode: %s", settings.LSL_USE_MOCK)
    logger.info("=" * 60)

    # Pre-load the default decoder
    from app.services.inference import inference_engine
    try:
        await inference_engine.initialize(
            decoder_mode=settings.DEFAULT_DECODER_MODE,
            device=settings.DEVICE,
        )
    except Exception as e:
        logger.error("Failed to initialize inference engine: %s", e)
        logger.warning("Server starting without inference engine — predictions will fail")

    yield

    # ── Shutdown ──
    logger.info("Shutting down...")
    from app.services.inference import inference_engine as engine
    from app.services.lsl_stream import lsl_manager
    await engine.shutdown()
    await lsl_manager.stop()
    logger.info("Goodbye!")


# ── FastAPI app ───────────────────────────────────────────────────────

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "Real-time EEG speech decoder for the BCI platform. "
        "Supports EEG-Former (supervised), EEG-MAE (unsupervised), "
        "and Decision Transformer (RL) decoders."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Mount routers ─────────────────────────────────────────────────────

app.include_router(sessions_router, prefix="/api/v1")
app.include_router(decoders_router, prefix="/api/v1")
app.include_router(stream_router, prefix="/api/v1")


# ── Health check ──────────────────────────────────────────────────────

@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check() -> HealthResponse:
    """Service health check."""
    from app.services.inference import inference_engine
    from app.services.lsl_stream import lsl_manager

    return HealthResponse(
        status="ok",
        version=settings.APP_VERSION,
        decoder_loaded=inference_engine.is_initialized,
        lsl_connected=lsl_manager.is_connected(),
        device=str(inference_engine.device) if inference_engine.is_initialized else "none",
    )


@app.get("/", tags=["System"])
async def root():
    """API root — redirects to docs."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/health",
    }

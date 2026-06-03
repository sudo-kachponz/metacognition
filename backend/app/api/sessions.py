"""
Session management API routes.

Endpoints:
    POST   /api/v1/sessions          — Create a new session
    GET    /api/v1/sessions           — List all sessions
    GET    /api/v1/sessions/{id}      — Get session by ID
    PATCH  /api/v1/sessions/{id}      — Update session status
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException

from app.models.schemas import SessionCreate, SessionInfo, SessionStatusUpdate

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/sessions", tags=["Sessions"])

# ── In-memory session store (replace with Postgres in production) ─────
_sessions: dict[str, SessionInfo] = {}


@router.post("", response_model=SessionInfo, status_code=201)
async def create_session(body: SessionCreate) -> SessionInfo:
    """Create a new decoding session."""
    session = SessionInfo(
        id=str(uuid.uuid4()),
        patientId=body.patient_id,
        decoderMode=body.decoder_mode,
        startedAt=datetime.now(timezone.utc).isoformat(),
        status="idle",
    )
    _sessions[session.id] = session
    logger.info("Created session %s for patient %s", session.id, body.patient_id)
    return session


@router.get("", response_model=list[SessionInfo])
async def list_sessions(
    patient_id: Optional[str] = None,
    status: Optional[str] = None,
) -> list[SessionInfo]:
    """List all sessions, optionally filtered by patient or status."""
    result = list(_sessions.values())
    if patient_id:
        result = [s for s in result if s.patient_id == patient_id]
    if status:
        result = [s for s in result if s.status == status]
    return result


@router.get("/{session_id}", response_model=SessionInfo)
async def get_session(session_id: str) -> SessionInfo:
    """Get a session by ID."""
    session = _sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")
    return session


@router.patch("/{session_id}", response_model=SessionInfo)
async def update_session_status(
    session_id: str, body: SessionStatusUpdate
) -> SessionInfo:
    """Update session status (e.g., idle → running → archived)."""
    session = _sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")

    old_status = session.status
    session.status = body.status

    if body.status == "archived" and not session.ended_at:
        session.ended_at = datetime.now(timezone.utc).isoformat()

    logger.info("Session %s: %s → %s", session_id, old_status, body.status)
    return session

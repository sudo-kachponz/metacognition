// Thin client around the FastAPI backend.
// All requests route through Next.js rewrites in dev → /api/backend/*
// In production, the rewrite target is the backend service in docker-compose.

import type { SessionInfo, LatencyStats, DecoderInfo } from './types';

const BASE = '/api/backend';

async function jsonFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    // TODO: replace with real session token in (b)/(c) auth model
    credentials: 'include',
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API ${res.status} ${path}: ${body}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  health: () => jsonFetch<{ status: 'ok' | 'degraded'; components: Record<string, string> }>('/health'),
  startSession: (patientId: string, decoderMode: SessionInfo['decoderMode']) =>
    jsonFetch<SessionInfo>('/session/start', { method: 'POST', body: JSON.stringify({ patientId, decoderMode }) }),
  stopSession: (sessionId: string) =>
    jsonFetch<SessionInfo>('/session/stop', { method: 'POST', body: JSON.stringify({ sessionId }) }),
  getLatency: () => jsonFetch<LatencyStats>('/metrics/latency'),
  listDecoders: () => jsonFetch<DecoderInfo[]>('/decoders'),
};

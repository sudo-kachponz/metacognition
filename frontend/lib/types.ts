// Shared types for the BCI platform.
// These mirror the Pydantic schemas in backend/app/models/schemas.py.

export type DecoderMode = 'supervised' | 'unsupervised' | 'rl';

export interface DecoderInfo {
  id: string;
  mode: DecoderMode;
  displayName: string;
  description: string;
  /** Whether the model weights are actually loadable right now. */
  available: boolean;
}

export interface SessionInfo {
  id: string;
  patientId: string;
  decoderMode: DecoderMode;
  startedAt: string; // ISO
  endedAt?: string;
  status: 'idle' | 'calibrating' | 'running' | 'paused' | 'archived';
}

export interface LatencyStats {
  /** ms, end-to-end cue → audio feedback */
  endToEndMs: number;
  /** ms, decoder inference only */
  inferenceMs: number;
  /** Impedance sampling rate, Hz */
  impedanceHz: number;
}

export interface EEGFrame {
  /** Sample timestamp (LSL local clock seconds). */
  timestamp: number;
  /** Channels × samples for this frame. */
  data: number[][];
  /** Optional TTL trigger code. */
  ttl?: number;
}

export interface Flashcard {
  id: string;
  text: string;        // e.g. "apel" (apple)
  audioUrl?: string;
  /** Configurable display duration in ms. */
  durationMs: number;
}

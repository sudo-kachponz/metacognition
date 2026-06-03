'use client';

import { create } from 'zustand';
import type { DecoderMode, SessionInfo, LatencyStats } from './types';

interface BCIState {
  patientId: string | null;
  session: SessionInfo | null;
  decoderMode: DecoderMode;
  latency: LatencyStats;
  setPatient: (id: string) => void;
  setSession: (s: SessionInfo | null) => void;
  setDecoderMode: (m: DecoderMode) => void;
  setLatency: (l: LatencyStats) => void;
}

export const useBCIStore = create<BCIState>((set) => ({
  patientId: null,
  session: null,
  decoderMode: 'supervised',
  latency: { endToEndMs: 0, inferenceMs: 0, impedanceHz: 0 },
  setPatient: (id) => set({ patientId: id }),
  setSession: (session) => set({ session }),
  setDecoderMode: (decoderMode) => set({ decoderMode }),
  setLatency: (latency) => set({ latency }),
}));

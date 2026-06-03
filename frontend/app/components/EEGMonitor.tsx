// EEG Monitor placeholder.
// REAL: would subscribe to an LSL stream via WebSocket (backend relays pylsl inlet).
// STUB: renders a static sine-wave canvas to verify layout sizing.
// The LSL subscription contract is defined here but not connected.

'use client';

import { useEffect, useRef } from 'react';
import type { EEGFrame } from '@/lib/types';

interface EEGMonitorProps {
  /** Channel count to display. */
  channels?: number;
  /** Height per channel row in px. */
  rowHeight?: number;
  /** Called when a new frame arrives from the backend. */
  onFrame?: (frame: EEGFrame) => void;
}

export function EEGMonitor({ channels = 8, rowHeight = 40, onFrame }: EEGMonitorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // STUB: draw animated sine waves to verify canvas sizing.
  // Replace with real WebSocket LSL stream in production.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    let t = 0;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      for (let ch = 0; ch < channels; ch++) {
        const y0 = ch * rowHeight + rowHeight / 2;
        ctx.strokeStyle = `hsl(${(ch * 360) / channels}, 70%, 50%)`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
          const val = Math.sin((x + t) * 0.03 + ch * 0.5) * (rowHeight * 0.35);
          if (x === 0) ctx.moveTo(x, y0 + val);
          else ctx.lineTo(x, y0 + val);
        }
        ctx.stroke();
      }

      t += 2;
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [channels, rowHeight]);

  // NOTE: Real implementation would look like:
  // useEffect(() => {
  //   const ws = new WebSocket(`ws://${backend}/ws/eeg`);
  //   ws.onmessage = (e) => {
  //     const frame: EEGFrame = JSON.parse(e.data);
  //     onFrame?.(frame);
  //     // push frame into a ring buffer, redraw canvas from buffer
  //   };
  //   return () => ws.close();
  // }, []);

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="mb-2 text-sm font-medium text-muted-foreground">
        EEG Monitor — {channels} channel (stub waveform)
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={channels * rowHeight}
        className="w-full bg-background"
        aria-label="Visualisasi gelombang EEG real-time"
      />
    </div>
  );
}

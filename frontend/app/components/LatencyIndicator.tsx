// Latency indicator — visual gauge for end-to-end and inference latency.
// Green: < target, Yellow: near target, Red: over target.

'use client';

import type { LatencyStats } from '@/lib/types';

interface LatencyIndicatorProps {
  stats: LatencyStats;
  /** Target end-to-end latency in ms. */
  targetE2E?: number;
  /** Target inference latency in ms. */
  targetInference?: number;
}

function Gauge({ label, valueMs, targetMs }: { label: string; valueMs: number; targetMs: number }) {
  const ratio = valueMs / targetMs;
  const color = ratio <= 1 ? 'bg-green-500' : ratio <= 1.5 ? 'bg-yellow-500' : 'bg-red-500';
  const widthPct = Math.min((ratio / 2) * 100, 100); // max out bar at 2× target

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-medium">{valueMs.toFixed(1)} ms</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted">
        <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${widthPct}%` }} />
      </div>
      <div className="text-xs text-muted-foreground">Target: {targetMs} ms</div>
    </div>
  );
}

export function LatencyIndicator({
  stats,
  targetE2E = 300,
  targetInference = 50,
}: LatencyIndicatorProps) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm space-y-3">
      <div className="text-sm font-medium">Latensi Sistem</div>
      <Gauge label="End-to-End" valueMs={stats.endToEndMs} targetMs={targetE2E} />
      <Gauge label="Inferensi Decoder" valueMs={stats.inferenceMs} targetMs={targetInference} />
      <div className="text-xs text-muted-foreground">
        Impedance: {stats.impedanceHz.toFixed(0)} Hz
      </div>
    </div>
  );
}

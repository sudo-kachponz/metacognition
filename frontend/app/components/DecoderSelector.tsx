// Decoder selector dropdown.
// Lists the three decoder families. The `available` flag indicates whether
// the backend reports that model weights are loaded — currently always false
// for research-stub decoders.

'use client';

import { useBCIStore } from '@/lib/store';
import type { DecoderMode, DecoderInfo } from '@/lib/types';

const DECODERS: DecoderInfo[] = [
  {
    id: 'eeg-former',
    mode: 'supervised',
    displayName: 'EEG-Former / BrainBERT',
    description: 'Supervised fine-tuning pada data BCI pasien.',
    available: false, // STUB: no weights loaded yet
  },
  {
    id: 'eeg-mae',
    mode: 'unsupervised',
    displayName: 'EEG-MAE + Riemannian',
    description: 'Pre-trained masked autoencoder + geometri Riemannian.',
    available: false,
  },
  {
    id: 'decision-tf',
    mode: 'rl',
    displayName: 'Decision Transformer',
    description: 'Reinforcement learning dengan reward dari LLM predictor.',
    available: false,
  },
];

export function DecoderSelector() {
  const { decoderMode, setDecoderMode } = useBCIStore();

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <label htmlFor="decoder-select" className="mb-2 block text-sm font-medium">
        Pilih Decoder
      </label>
      <select
        id="decoder-select"
        value={decoderMode}
        onChange={(e) => setDecoderMode(e.target.value as DecoderMode)}
        className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {DECODERS.map((d) => (
          <option key={d.id} value={d.mode} disabled={!d.available}>
            {d.displayName} {!d.available ? '(belum tersedia)' : ''}
          </option>
        ))}
      </select>
      {DECODERS.filter((d) => d.mode === decoderMode).map((d) => (
        <p key={d.id} className="mt-2 text-xs text-muted-foreground">
          {d.description}
        </p>
      ))}
    </div>
  );
}

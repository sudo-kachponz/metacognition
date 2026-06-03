// Live decoder page — assembles the main BCI session view.
// EEGMonitor + DecoderSelector + FlashcardDisplay + LatencyIndicator.

'use client';

import { EEGMonitor } from '@/app/components/EEGMonitor';
import { DecoderSelector } from '@/app/components/DecoderSelector';
import { FlashcardDisplay } from '@/app/components/FlashcardDisplay';
import { LatencyIndicator } from '@/app/components/LatencyIndicator';
import { useBCIStore } from '@/lib/store';
import type { Flashcard } from '@/lib/types';

// STUB flashcard deck — replace with backend-provided deck per patient.
const STUB_CARDS: Flashcard[] = [
  { id: '1', text: 'Apel', durationMs: 3000 },
  { id: '2', text: 'Rumah', durationMs: 3000 },
  { id: '3', text: 'Air', durationMs: 3000 },
  { id: '4', text: 'Makan', durationMs: 3000 },
];

export default function LiveDecoderPage() {
  const { latency } = useBCIStore();

  function handleCueOnset(card: Flashcard, timestampMs: number) {
    // STUB: in production, POST this to backend for TTL alignment logging.
    console.log(`[STUB] Cue onset: "${card.text}" at ${timestampMs.toFixed(2)} ms`);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Live Decoder</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: EEG + latency */}
        <div className="space-y-4 lg:col-span-2">
          <EEGMonitor channels={16} onFrame={(f) => console.log('[EEG frame]', f.timestamp)} />
          <LatencyIndicator stats={latency} />
        </div>

        {/* Right: controls */}
        <div className="space-y-4">
          <DecoderSelector />
          <FlashcardDisplay cards={STUB_CARDS} onCueOnset={handleCueOnset} />
        </div>
      </div>
    </div>
  );
}

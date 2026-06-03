// Flashcard display component for visual/auditory cue presentation.
// REAL: displays a word/image, plays audio cue, logs TTL timestamp to backend.
// STUB: renders the card UI and logs the timestamp, but audio is a placeholder.
//
// TTL timestamp alignment:
// The cue onset is marked client-side (performance.now()) and also
// confirmed by the backend via TTL trigger code from the BrainProducts
// stimulus tracker. The difference between these two timestamps is the
// "cue alignment jitter" metric. This is NOT just a UI timer — it drives
// the decoder's ground-truth label alignment.

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Flashcard } from '@/lib/types';

interface FlashcardDisplayProps {
  cards: Flashcard[];
  /** Callback fired when a card is shown, with performance timestamp (ms). */
  onCueOnset?: (card: Flashcard, timestampMs: number) => void;
  /** Font size in rem. */
  fontSize?: number;
  /** Background contrast: 'normal' | 'high'. */
  contrast?: 'normal' | 'high';
}

export function FlashcardDisplay({
  cards,
  onCueOnset,
  fontSize = 3,
  contrast = 'normal',
}: FlashcardDisplayProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const card = cards[index];

  const showNext = useCallback(() => {
    if (!card) return;
    setVisible(true);
    const onset = performance.now();
    onCueOnset?.(card, onset);

    timerRef.current = setTimeout(() => {
      setVisible(false);
      setIndex((i) => (i + 1) % cards.length);
    }, card.durationMs);
  }, [card, cards.length, onCueOnset]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const bg = contrast === 'high' ? 'bg-black text-white' : 'bg-card text-card-foreground';

  return (
    <div className={`flex flex-col items-center justify-center rounded-lg border p-8 shadow-sm ${bg}`} style={{ minHeight: '200px' }}>
      {visible && card ? (
        <span className="font-bold" style={{ fontSize: `${fontSize}rem` }} aria-live="assertive">
          {card.text}
        </span>
      ) : (
        <span className="text-muted-foreground">Tekan tombol untuk menampilkan kartu berikutnya</span>
      )}
      <button
        onClick={showNext}
        className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        aria-label="Tampilkan flashcard berikutnya"
      >
        Tampilkan
      </button>
      {/* TODO: audio cue playback via Web Audio API + card.audioUrl */}
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { Brain } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[ErrorBoundary]', error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <Brain className="h-12 w-12 text-destructive" />
      <h2 className="text-xl font-bold">Terjadi Kesalahan</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        {error.message || 'Komponen gagal dimuat. Silakan coba lagi.'}
      </p>
      <button
        onClick={reset}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Coba Lagi
      </button>
    </div>
  );
}

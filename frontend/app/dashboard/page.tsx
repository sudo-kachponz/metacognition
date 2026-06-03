'use client';

// Dashboard home — overview cards + quick actions.

import { Activity, Brain, Clock, Zap } from 'lucide-react';
import { useBCIStore } from '@/lib/store';

function StatCard({ label, value, unit, icon: Icon }: { label: string; value: string; unit?: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="mt-1 text-2xl font-bold">
        {value}
        {unit && <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  // In a real app, these come from the backend via useSWR / React Query.
  const { session, decoderMode, latency } = useBCIStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang di NeuroSuara. Pilih aksi di sidebar untuk memulai.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Status Sesi" value={session?.status ?? 'Idle'} icon={Activity} />
        <StatCard label="Decoder" value={decoderMode} icon={Brain} />
        <StatCard label="Latensi E2E" value={String(latency.endToEndMs || '—')} unit="ms" icon={Clock} />
        <StatCard label="Inferensi" value={String(latency.inferenceMs || '—')} unit="ms" icon={Zap} />
      </div>

      <div className="rounded-lg border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
        Belum ada sesi aktif. Buka <strong>Live Decoder</strong> untuk memulai sesi BCI baru.
      </div>
    </div>
  );
}

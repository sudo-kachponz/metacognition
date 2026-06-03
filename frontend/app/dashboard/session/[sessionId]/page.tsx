// Deep link to a specific BCI session by ID.
// In production, this fetches the session from the backend and renders
// its associated EEG data, decoder outputs, and flashcard logs.

interface SessionPageProps {
  params: { sessionId: string };
}

export default function SessionPage({ params }: SessionPageProps) {
  return (
    <div>
      <h1 className="text-xl font-bold">Sesi: {params.sessionId}</h1>
      <p className="mt-2 text-muted-foreground">
        Placeholder — session detail view for session <code>{params.sessionId}</code>.
      </p>
      {/* TODO: fetch GET /sessions/{sessionId}, render session replay */}
    </div>
  );
}

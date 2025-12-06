interface ChatPageProps {
  params: { matchId: string };
}

export default function ChatPage({ params }: ChatPageProps) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 space-y-6">
      <h1 className="text-3xl font-semibold">Realtime Chat</h1>
      <p className="text-muted-foreground">Unlocked chat. Messages stay ephemeral and private.</p>
      <div className="text-sm text-muted-foreground">Match: {params.matchId}</div>
    </main>
  );
}

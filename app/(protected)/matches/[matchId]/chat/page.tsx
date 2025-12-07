'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUserId, useSupabaseBrowser } from '@/lib/supabase/client';

type ChatMessage = {
  id: string;
  body: string;
  sender_id: string;
  created_at: string;
};

interface ChatPageProps {
  params: { matchId: string };
}

export default function ChatPage({ params }: ChatPageProps) {
  const supabase = useSupabaseBrowser();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [body, setBody] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [status, setStatus] = useState('Đang tải...');
  const [isSending, startTransition] = useTransition();
  const [allowed, setAllowed] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const matchId = params.matchId;

  const scrollToBottom = useCallback(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const init = async () => {
      const uid = await getCurrentUserId(supabase);
      setUserId(uid);
      if (!uid) {
        setStatus('Cần đăng nhập.');
        return;
      }

      const { data: match } = await supabase
        .from('matches')
        .select('status')
        .eq('id', matchId)
        .maybeSingle();

      if (!match) {
        setStatus('Không tìm thấy match.');
        return;
      }

      if (match.status !== 'chat_unlocked' && match.status !== 'revealed') {
        setStatus('Chat chưa mở. Chuyển về Blind Mail.');
        router.push(`/matches/${matchId}/blind-mail`);
        return;
      }

      setAllowed(true);
      setStatus('');

      const { data: initial } = await supabase
        .from('messages')
        .select('id, body, sender_id, created_at, type')
        .eq('match_id', matchId)
        .eq('type', 'chat')
        .order('created_at', { ascending: true });

      if (initial) {
        setMessages(initial as ChatMessage[]);
        scrollToBottom();
      }

      channel = supabase
        .channel(`chat-${matchId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` },
          (payload) => {
            const record = payload.new as { id: string; body: string; sender_id: string; created_at: string; type: string };
            if (record.type === 'chat') {
              setMessages((prev) => [...prev, { id: record.id, body: record.body, sender_id: record.sender_id, created_at: record.created_at }]);
              setTimeout(scrollToBottom, 50);
            }
          }
        )
        .subscribe();
    };

    init();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [matchId, router, scrollToBottom, supabase]);

  const sendMessage = () => {
    if (!body.trim() || !userId || !allowed) return;
    startTransition(async () => {
      setStatus('');
      const { error } = await supabase.from('messages').insert({
        match_id: matchId,
        sender_id: userId,
        type: 'chat',
        body,
      });
      if (error) {
        setStatus('Gửi thất bại.');
        return;
      }
      setBody('');
      setTimeout(scrollToBottom, 50);
    });
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-3xl px-6 py-12 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Chat</p>
          <h1 className="text-3xl font-semibold">Realtime Chat</h1>
          <p className="text-sm text-slate-400">Match: {matchId}</p>
        </div>

        {status && <div className="text-sm text-amber-300">{status}</div>}

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg">
          <div
            ref={listRef}
            className="max-h-[520px] min-h-[360px] overflow-y-auto px-4 py-4 space-y-3"
          >
            {messages.map((m) => {
              const isMine = m.sender_id === userId;
              return (
                <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                      isMine
                        ? 'bg-emerald-500/80 text-emerald-950'
                        : 'bg-slate-800 text-slate-100 border border-slate-700'
                    }`}
                  >
                    <p>{m.body}</p>
                    <p className="mt-1 text-[10px] opacity-70">{new Date(m.created_at).toLocaleTimeString()}</p>
                  </div>
                </div>
              );
            })}
            {messages.length === 0 && <p className="text-sm text-slate-500">Chưa có tin nhắn.</p>}
          </div>

          <div className="border-t border-slate-800 px-4 py-3 flex items-center gap-3">
            <input
              type="text"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={!allowed}
              placeholder={allowed ? 'Nhắn gì đó tử tế...' : 'Chat chưa mở'}
              className="flex-1 rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
            />
            <button
              type="button"
              disabled={!allowed || isSending || !body.trim()}
              onClick={sendMessage}
              className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 shadow-md disabled:opacity-50"
            >
              Gửi
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

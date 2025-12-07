'use client';

import { useEffect, useState, useTransition } from 'react';
import { getCurrentUserId, useSupabaseBrowser } from '@/lib/supabase/client';
import { unlockChat } from '@/server/actions/match';
import { useCallback } from 'react';

interface BlindMailPageProps {
  params: { matchId: string };
}

type Icebreaker = { id: string; prompt: string };

type Letter = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

const icebreakers: Icebreaker[] = [
  { id: '1', prompt: 'Kỷ niệm ngẫu nhiên nào khiến bạn mỉm cười mỗi lần nghĩ tới?' },
  { id: '2', prompt: 'Nếu ngày mai bạn thức dậy ở một thành phố lạ, bạn sẽ làm gì đầu tiên?' },
  { id: '3', prompt: 'Một cuốn sách/bài hát đã thay đổi góc nhìn của bạn?' },
];

export default function BlindMailPage({ params }: BlindMailPageProps) {
  const supabase = useSupabaseBrowser();
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<Icebreaker>(() => icebreakers[0]);
  const [userId, setUserId] = useState<string | null>(null);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [canUnlock, setCanUnlock] = useState(false);
  const [matchStatus, setMatchStatus] = useState<string>('pending');
  const [isUnlocking, startTransition] = useTransition();

  const matchId = params.matchId;

  const refreshLetters = useCallback(
    async (uid: string) => {
      const { data: msgs } = await supabase
        .from('messages')
        .select('id, sender_id, body, created_at, type')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });
      if (msgs) {
        const onlyLetters = msgs.filter((m) => m.type === 'letter') as Letter[];
        setLetters(onlyLetters);
        const myLetters = onlyLetters.filter((l) => l.sender_id === uid).length;
        const theirLetters = onlyLetters.filter((l) => l.sender_id !== uid).length;
        setCanUnlock(myLetters >= 3 && theirLetters >= 3);
      }
    },
    [matchId, supabase]
  );

  useEffect(() => {
    // Rotate icebreaker at mount for freshness
    setSuggestion(icebreakers[Math.floor(Math.random() * icebreakers.length)]);
    getCurrentUserId(supabase).then(setUserId);
  }, [supabase]);

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      const { data: m } = await supabase.from('matches').select('*').eq('id', matchId).maybeSingle();
      if (m) {
        setMatchStatus(m.status);
      }
      await refreshLetters(userId);
    };
    load();
  }, [matchId, refreshLetters, supabase, userId]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`blind-mail-${matchId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` },
        (payload) => {
          const record = payload.new as { id: string; sender_id: string; body: string; created_at: string; type: string };
          if (record.type === 'letter') {
            setLetters((prev) => {
              const next = [...prev, { id: record.id, sender_id: record.sender_id, body: record.body, created_at: record.created_at }];
              const myLetters = next.filter((l) => l.sender_id === userId).length;
              const theirLetters = next.filter((l) => l.sender_id !== userId).length;
              setCanUnlock(myLetters >= 3 && theirLetters >= 3);
              return next;
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'matches', filter: `id=eq.${matchId}` },
        (payload) => {
          const record = payload.new as { status?: string };
          if (record.status) setMatchStatus(record.status);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, supabase, userId]);

  const sendLetter = async () => {
    if (!body.trim() || !userId) return;
    if (body.trim().length < 100) {
      setStatus('Thư cần tối thiểu 100 ký tự.');
      return;
    }
    setIsSending(true);
    setStatus(null);
    try {
      const { error } = await supabase.from('messages').insert({
        match_id: matchId,
        sender_id: userId,
        type: 'letter',
        body,
      });
      if (error) throw error;
      setBody('');
      setStatus('Đã gửi thư. Chờ phản hồi...');
      await refreshLetters(userId);
    } catch (err) {
      setStatus('Gửi thất bại. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      <div className="mx-auto max-w-3xl px-6 py-12 space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-rose-500 opacity-80" />
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-neutral-400">Blind Mail</p>
            <h1 className="text-3xl font-semibold">Write a letter</h1>
            <p className="text-sm text-neutral-400">Match: {matchId}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 shadow-lg">
          <div className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-neutral-400">Tone: slow, thoughtful. No typing indicators.</div>
            <button
              type="button"
              onClick={() => setSuggestion(icebreakers[Math.floor(Math.random() * icebreakers.length)])}
              className="text-xs text-neutral-300 hover:text-white underline"
            >
              Đổi gợi ý
            </button>
          </div>

          <div className="px-6 py-4 space-y-3">
            <div className="rounded-xl bg-neutral-800/60 px-4 py-3 text-sm text-neutral-200">
              <div className="text-xs uppercase tracking-[0.2em] text-neutral-400 mb-1">Icebreaker</div>
              <p>{suggestion.prompt}</p>
            </div>

            <textarea
              className="min-h-[240px] w-full resize-none rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-base text-neutral-50 placeholder:text-neutral-600 focus:border-indigo-400 focus:outline-none"
              placeholder="Viết thư của bạn..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <p className="text-xs text-neutral-500 text-right">{body.trim().length}/100 ký tự tối thiểu</p>
          </div>

          <div className="border-t border-neutral-800 px-6 py-4 flex items-center justify-between">
            <p className="text-xs text-neutral-500">Letters are delivered slowly—be intentional.</p>
            <button
              type="button"
              onClick={sendLetter}
              disabled={isSending || !body.trim() || body.trim().length < 100}
              className="rounded-full bg-gradient-to-r from-indigo-500 via-rose-500 to-amber-400 px-6 py-2 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSending ? 'Đang gửi...' : 'Send Letter'}
            </button>
          </div>
        </div>

        {status && <div className="text-sm text-neutral-300">{status}</div>}

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 px-6 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-300">Hộp thư</p>
            <p className="text-xs text-neutral-500">Trạng thái: {matchStatus}</p>
          </div>
          <ul className="space-y-2 max-h-[320px] overflow-y-auto pr-2">
            {letters.map((l) => (
              <li key={l.id} className="rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3">
                <p className="text-xs text-neutral-500 mb-1">{new Date(l.created_at).toLocaleString()}</p>
                <p className="text-sm text-neutral-100 leading-relaxed">{l.body}</p>
              </li>
            ))}
            {letters.length === 0 && (
              <li className="text-sm text-neutral-500">Chưa có thư nào.</li>
            )}
          </ul>

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-neutral-400">Cần ≥3 thư mỗi bên để mở Chat.</p>
            <button
              type="button"
              disabled={!canUnlock || isUnlocking || matchStatus === 'chat_unlocked'}
              onClick={() =>
                startTransition(async () => {
                  try {
                    await unlockChat(matchId);
                    setMatchStatus('chat_unlocked');
                  } catch (err) {
                    console.error(err);
                    setStatus('Không mở được chat, thử lại sau.');
                  }
                })
              }
              className="rounded-full border border-neutral-700 px-4 py-2 text-xs font-semibold text-neutral-100 disabled:opacity-50"
            >
              {matchStatus === 'chat_unlocked' ? 'Chat đã mở' : 'Unlock Chat' }
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { getCurrentUserId, useSupabaseBrowser } from '@/lib/supabase/client';

interface BlindMailPageProps {
  params: { matchId: string };
}

type Icebreaker = { id: string; prompt: string };

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

  const matchId = params.matchId;

  useEffect(() => {
    // Rotate icebreaker at mount for freshness
    setSuggestion(icebreakers[Math.floor(Math.random() * icebreakers.length)]);
    getCurrentUserId(supabase).then(setUserId);
  }, [supabase]);

  const sendLetter = async () => {
    if (!body.trim() || !userId) return;
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
          </div>

          <div className="border-t border-neutral-800 px-6 py-4 flex items-center justify-between">
            <p className="text-xs text-neutral-500">Letters are delivered slowly—be intentional.</p>
            <button
              type="button"
              onClick={sendLetter}
              disabled={isSending || !body.trim()}
              className="rounded-full bg-gradient-to-r from-indigo-500 via-rose-500 to-amber-400 px-6 py-2 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSending ? 'Đang gửi...' : 'Send Letter'}
            </button>
          </div>
        </div>

        {status && <div className="text-sm text-neutral-300">{status}</div>}
      </div>
    </main>
  );
}

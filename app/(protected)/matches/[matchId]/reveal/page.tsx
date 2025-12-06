'use client';

import { useEffect, useState } from 'react';
import { getCurrentUserId, useSupabaseBrowser } from '@/lib/supabase/client';
import { requestReveal } from '@/server/actions/reveal';

interface RevealPageProps {
  params: { matchId: string };
}

export default function RevealPage({ params }: RevealPageProps) {
  const supabase = useSupabaseBrowser();
  const [igHandle, setIgHandle] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Chưa reveal');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchIG = async () => {
    setIsLoading(true);
    // When status is revealed, partner row is visible; fetch via profiles (RLS will block otherwise)
    const { data: matches } = await supabase
      .from('matches')
      .select('id, status, user_a, user_b')
      .eq('id', params.matchId)
      .maybeSingle();

    if (matches?.status === 'revealed') {
      // Get partner profile including real_instagram (RLS ensures only revealed pairs)
      const { data: me } = await supabase.from('profiles').select('user_id').limit(1);
      const meId = me?.[0]?.user_id;
      const partnerId = meId === matches?.user_a ? matches?.user_b : matches?.user_a;
      if (partnerId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('real_instagram')
          .eq('user_id', partnerId)
          .maybeSingle();
        setIgHandle(profile?.real_instagram ?? null);
        setStatus('Revealed');
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    getCurrentUserId(supabase).then(setUserId);
    fetchIG();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRevealClick = async () => {
    try {
      setStatus('Đang yêu cầu...');
      if (!userId) throw new Error('No user id');
      await requestReveal(params.matchId, userId);
      setStatus('Đã gửi yêu cầu reveal. Chờ đối phương.');
      await fetchIG();
    } catch (err) {
      console.error(err);
      setStatus('Lỗi khi yêu cầu reveal');
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-3xl px-6 py-12 space-y-6">
        <h1 className="text-3xl font-semibold">Reveal phase</h1>
        <p className="text-slate-400">Cả hai phải đồng ý. Khi trạng thái match = revealed, IG sẽ hiện ở đây.</p>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-6 py-5 space-y-4">
          <div className="text-sm text-slate-400">Match: {params.matchId}</div>
          <div className="text-lg font-semibold">Instagram: {igHandle ?? 'Ẩn'}</div>
          <button
            type="button"
            onClick={handleRevealClick}
            className="rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-5 py-2 text-sm font-semibold text-white shadow-md hover:brightness-110"
          >
            Tôi muốn Reveal
          </button>
          <div className="text-sm text-slate-300">{status}</div>
          {isLoading && <div className="text-xs text-slate-500">Đang kiểm tra trạng thái...</div>}
        </div>
      </div>
    </main>
  );
}

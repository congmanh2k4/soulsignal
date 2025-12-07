'use client';

import { useCallback, useEffect, useState } from 'react';
import { getCurrentUserId, useSupabaseBrowser } from '@/lib/supabase/client';
import { requestReveal } from '@/server/actions/reveal';

interface RevealPageProps {
  params: { matchId: string };
}

export default function RevealPage({ params }: RevealPageProps) {
  const supabase = useSupabaseBrowser();
  const [igHandle, setIgHandle] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Chưa reveal');
  const [actionMessage, setActionMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const [daysSinceStart, setDaysSinceStart] = useState(0);
  const [canRequest, setCanRequest] = useState(false);
  const [matchStatus, setMatchStatus] = useState<string>('pending');

  const loadState = useCallback(async () => {
    setIsLoading(true);
    setActionMessage('');
    const uid = await getCurrentUserId(supabase);
    setUserId(uid);
    if (!uid) {
      setStatus('Cần đăng nhập.');
      setIsLoading(false);
      return;
    }

    const { data: match } = await supabase
      .from('matches')
      .select('id, status, user_a, user_b, created_at')
      .eq('id', params.matchId)
      .maybeSingle();

    if (!match) {
      setStatus('Không tìm thấy ghép.');
      setIsLoading(false);
      return;
    }

    setMatchStatus(match.status ?? 'pending');

    const { count } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('match_id', params.matchId);

    const messageTotal = count ?? 0;
    setMessageCount(messageTotal);

    const days = match.created_at
      ? Math.floor((Date.now() - new Date(match.created_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    setDaysSinceStart(days);

    const eligible = messageTotal >= 50 || days >= 3 || match.status === 'revealed';
    setCanRequest(eligible && match.status !== 'rejected');

    const partnerId = uid === match.user_a ? match.user_b : match.user_a;
    if (match.status === 'revealed' && partnerId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('real_instagram')
        .eq('user_id', partnerId)
        .maybeSingle();
      setIgHandle(profile?.real_instagram ?? null);
      setStatus('Đã reveal.');
    } else {
      setIgHandle(null);
      setStatus(
        eligible
          ? 'Đủ điều kiện, cần cả hai cùng bấm reveal.'
          : 'Cần ≥50 tin nhắn hoặc ≥3 ngày để mở reveal.'
      );
    }

    setIsLoading(false);
  }, [params.matchId, supabase]);

  useEffect(() => {
    loadState();
  }, [loadState]);

  const handleRevealClick = async () => {
    if (!userId) {
      setActionMessage('Cần đăng nhập.');
      return;
    }
    if (!canRequest) {
      setActionMessage('Chưa đủ điều kiện reveal.');
      return;
    }
    try {
      setActionMessage('Đang yêu cầu...');
      await requestReveal(params.matchId, userId);
      setActionMessage('Đã gửi yêu cầu. Chờ đối phương đồng ý.');
      await loadState();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi khi yêu cầu reveal';
      setActionMessage(message);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-3xl px-6 py-12 space-y-6">
        <h1 className="text-3xl font-semibold">Reveal phase</h1>
        <p className="text-slate-400">Cả hai phải đồng ý. Khi match = revealed, IG sẽ hiện ở đây.</p>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-6 py-5 space-y-4">
          <div className="text-sm text-slate-400">Match: {params.matchId}</div>
          <div className="text-sm text-slate-400">Trạng thái: {matchStatus}</div>
          <div className="text-lg font-semibold">Instagram: {igHandle ?? 'Ẩn'}</div>
          <div className="text-sm text-slate-300">Tin nhắn: {messageCount} / 50 · Ngày: {daysSinceStart} / 3</div>
          <div className="text-xs text-slate-500">Reveal mở khi đủ 50 tin nhắn hoặc sau 3 ngày. Cần cả hai cùng bấm.</div>
          <button
            type="button"
            onClick={handleRevealClick}
            disabled={!canRequest || isLoading}
            className="rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-5 py-2 text-sm font-semibold text-white shadow-md hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Tôi muốn Reveal
          </button>
          <div className="text-sm text-slate-300">{status}</div>
          {actionMessage && <div className="text-sm text-amber-300">{actionMessage}</div>}
          {isLoading && <div className="text-xs text-slate-500">Đang kiểm tra trạng thái...</div>}
        </div>
      </div>
    </main>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { getCurrentUserId, useSupabaseBrowser } from '@/lib/supabase/client';

type MatchRow = {
  id: string;
  status: 'pending' | 'talking_via_mail' | 'chat_unlocked' | 'revealed' | 'rejected';
  user_a: string;
  user_b: string;
  created_at?: string;
};

type ProfileRow = {
  user_id: string;
  display_name: string;
  personality_answers?: any;
};

export default function DashboardPage() {
  const supabase = useSupabaseBrowser();
  const [match, setMatch] = useState<MatchRow | null>(null);
  const [partner, setPartner] = useState<ProfileRow | null>(null);
  const [isRevealEnabled, setIsRevealEnabled] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [daysSinceStart, setDaysSinceStart] = useState(0);
  const [compatibility, setCompatibility] = useState(62);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const meId = await getCurrentUserId(supabase);
      if (!meId) {
        setLoading(false);
        return;
      }

      const { data: matches, error } = await supabase
        .from('matches')
        .select('*')
        .or(`user_a.eq.${meId},user_b.eq.${meId}`)
        .order('created_at', { ascending: false })
        .limit(1);
      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }
      const m = matches?.[0];
      setMatch(m ?? null);
      if (!m) {
        setLoading(false);
        return;
      }

      const partnerId = meId === m.user_a ? m.user_b : m.user_a;
      let partnerProfile: ProfileRow | null = null;
      if (partnerId) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name, personality_answers')
          .eq('user_id', partnerId)
          .limit(1);
        partnerProfile = profiles?.[0] ?? null;
        setPartner(partnerProfile);
      }

      const { data: messages } = await supabase
        .from('messages')
        .select('id, created_at')
        .eq('match_id', m.id);
      const count = messages?.length ?? 0;
      setMessageCount(count);

      let days = 0;
      if (m.created_at) {
        const start = new Date(m.created_at).getTime();
        const now = Date.now();
        days = Math.floor((now - start) / (1000 * 60 * 60 * 24));
        setDaysSinceStart(days);
      }

      setIsRevealEnabled(count >= 50 || days >= 3 || m.status === 'revealed');
      setCompatibility(estimateCompatibility(partnerProfile?.personality_answers));
      setLoading(false);
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-12 space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sky-500 to-emerald-500" />
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Dashboard</p>
            <h1 className="text-3xl font-semibold">Your current match</h1>
          </div>
        </div>

        {loading && <p className="text-slate-400">Loading...</p>}
        {!loading && !match && <p className="text-slate-400">Chưa có match nào.</p>}

        {match && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
            <div className="flex items-start justify-between px-6 py-4 border-b border-slate-800">
              <div>
                <p className="text-sm text-slate-400">Match ID</p>
                <p className="font-semibold">{match.id}</p>
                <p className="text-xs text-slate-500 mt-1">Trạng thái: {match.status}</p>
              </div>
              <CompatibilityBadge percent={compatibility} />
            </div>

            <div className="px-6 py-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-slate-800" />
                <div>
                  <p className="text-sm text-slate-400">Partner</p>
                  <p className="text-lg font-semibold">{partner?.display_name ?? 'Ẩn danh'}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-slate-400">
                <Tag label={`Messages: ${messageCount}`} />
                <Tag label={`Days: ${daysSinceStart}`} />
                <Tag label={`Phase: ${match.status}`} />
              </div>
            </div>

            <div className="border-t border-slate-800 px-6 py-4 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Nút reveal sáng khi ≥50 tin nhắn hoặc sau 3 ngày.
              </div>
              <button
                type="button"
                disabled={!isRevealEnabled}
                className="rounded-full px-5 py-2 text-sm font-semibold shadow-md transition disabled:cursor-not-allowed disabled:border disabled:border-slate-700 disabled:text-slate-500 bg-gradient-to-r from-amber-500 to-rose-500 text-white enabled:hover:brightness-110"
              >
                Reveal Instagram
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1 text-xs text-slate-300">
      {label}
    </span>
  );
}

function CompatibilityBadge({ percent }: { percent: number }) {
  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-right">
      <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">Match score</p>
      <p className="text-2xl font-bold text-emerald-100">{percent}%</p>
    </div>
  );
}

function estimateCompatibility(personality: any): number {
  // Rough heuristic: use answer count variance to create a pseudo score; fallback 62
  if (!personality) return 62;
  if (Array.isArray(personality)) {
    const base = 55 + Math.min(15, personality.length * 2);
    return Math.min(95, base);
  }
  return 68;
}

'use client';

import { useEffect, useState } from 'react';
import { useSupabaseBrowser } from '@/lib/supabase/client';

type Profile = {
  user_id: string;
  display_name: string;
  real_instagram: string;
  bio: string | null;
  personality_answers: Record<string, unknown>[] | Record<string, unknown> | null;
  anon_avatar_url: string | null;
};

const defaultQuestions = [
  'Điều gì khiến bạn xúc động gần đây?',
  'Một ngày hoàn hảo của bạn là gì?',
  'Bạn trân trọng điều gì nhất ở tình bạn?',
  'Kỷ niệm nào khiến bạn mỉm cười?',
  'Điều gì làm bạn thấy an tâm?',
];

export default function ProfilePage() {
  const supabase = useSupabaseBrowser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [ig, setIg] = useState('');
  const [bio, setBio] = useState('');
  const [avatarSeed, setAvatarSeed] = useState('');
  const [answers, setAnswers] = useState<string[]>(Array(defaultQuestions.length).fill(''));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: me, error: err } = await supabase
        .from('profiles')
        .select('user_id, display_name, real_instagram, bio, personality_answers, anon_avatar_url')
        .limit(1)
        .maybeSingle();
      if (err) {
        setError(err.message);
      } else if (me) {
        setProfile(me as Profile);
        setDisplayName(me.display_name);
        setIg(me.real_instagram);
        setBio(me.bio ?? '');
        setAvatarSeed(me.anon_avatar_url ?? '');
        if (Array.isArray(me.personality_answers)) {
          const arr = me.personality_answers as Record<string, unknown>[];
          setAnswers(arr.map((a) => (typeof a.answer === 'string' ? a.answer : '')));
        }
      }
      setLoading(false);
    };
    load();
  }, [supabase]);

  const saveProfile = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const qa = defaultQuestions.map((q, i) => ({ question: q, answer: answers[i] || '' }));
      const { error: upsertError } = await supabase.from('profiles').upsert({
        user_id: profile?.user_id,
        display_name: displayName,
        real_instagram: ig,
        bio,
        anon_avatar_url: avatarSeed ? `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(avatarSeed)}` : null,
        personality_answers: qa,
      });
      if (upsertError) throw upsertError;
      setMessage('Đã lưu hồ sơ.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lưu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Onboarding</p>
        <h1 className="text-3xl font-semibold">Thiết lập hồ sơ ẩn danh</h1>
        <p className="text-muted-foreground">Nhập IG (khóa), avatar ảo, 5 câu hỏi sâu, và bio.</p>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800">Tên hiển thị</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
            placeholder="Một biệt danh an toàn"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800">Instagram (private)</label>
          <input
            value={ig}
            onChange={(e) => setIg(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
            placeholder="@yourhandle"
          />
          <p className="text-xs text-slate-500">Chỉ lộ khi cả hai cùng Reveal.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800">Avatar ảo (DiceBear seed)</label>
          <input
            value={avatarSeed}
            onChange={(e) => setAvatarSeed(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
            placeholder="ví dụ: moon-owl"
          />
          {avatarSeed && (
            <img
              src={`https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(avatarSeed)}`}
              alt="Avatar preview"
              className="h-16 w-16 rounded-lg border border-slate-200"
            />
          )}
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-800">Deep Questions (5 câu)</label>
          {defaultQuestions.map((q, i) => (
            <div key={q} className="space-y-2">
              <p className="text-sm text-slate-600">{q}</p>
              <textarea
                value={answers[i]}
                onChange={(e) => setAnswers((prev) => {
                  const copy = [...prev];
                  copy[i] = e.target.value;
                  return copy;
                })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                rows={2}
              />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800">Bio ngắn</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
            rows={3}
            placeholder="Giữ bí mật liên hệ, tập trung vào câu chuyện."
          />
        </div>

        <button
          type="button"
          onClick={saveProfile}
          disabled={loading}
          className="w-full rounded-full bg-gradient-to-r from-indigo-500 via-rose-500 to-amber-400 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:brightness-110 disabled:opacity-60"
        >
          {loading ? 'Đang lưu...' : 'Lưu hồ sơ'}
        </button>

        {message && <p className="text-sm text-emerald-600">{message}</p>}
        {error && <p className="text-sm text-rose-600">{error}</p>}
      </div>
    </main>
  );
}

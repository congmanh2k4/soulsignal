'use client';

import { useEffect, useState } from 'react';
import { useSupabaseBrowser } from '@/lib/supabase/client';

export default function SignUpPage() {
  const supabase = useSupabaseBrowser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [igHandle, setIgHandle] = useState('');
   const [redirectTo, setRedirectTo] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogle = async (redirect?: string) => {
    setError(null);
    setMessage(null);
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirect,
        },
      });
      if (authError) throw authError;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'OAuth failed';
      setError(msg);
    }
  };

  // Compute redirect URL on client to avoid window undefined during SSR
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRedirectTo(`${window.location.origin}/callback`);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const { error: signError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            real_instagram: igHandle.trim(),
          },
          emailRedirectTo: redirectTo,
        },
      });
      if (signError) throw signError;
      setMessage('Check your email to confirm (or log in if confirmation is disabled).');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign-up failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-6 py-16 space-y-8">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">SoulSignal</p>
        <h1 className="text-3xl font-semibold">Create account</h1>
        <p className="text-slate-500">
          Join with email, keep your IG handle private until both of you choose to reveal.
        </p>
      </div>

      <button
        type="button"
        onClick={() => signInWithGoogle(redirectTo)}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400"
      >
        <span role="img" aria-label="google">🔐</span>
        Continue with Google
      </button>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none"
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none"
            placeholder="At least 6 characters"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800" htmlFor="ig">
            Instagram handle (private)
          </label>
          <input
            id="ig"
            type="text"
            value={igHandle}
            onChange={(e) => setIgHandle(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none"
            placeholder="@yourhandle"
          />
          <p className="text-xs text-slate-500">Chỉ dùng để xác thực và chỉ reveal khi cả hai đồng ý.</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-gradient-to-r from-indigo-500 via-rose-500 to-amber-400 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:brightness-110 disabled:opacity-60"
        >
          {loading ? 'Signing up...' : 'Sign up'}
        </button>

        {message && <p className="text-sm text-emerald-600">{message}</p>}
        {error && <p className="text-sm text-rose-600">{error}</p>}
      </form>
    </main>
  );
}

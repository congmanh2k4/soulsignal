'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { useSupabaseBrowser } from '@/lib/supabase/client';

export default function SignInPage() {
  const supabase = useSupabaseBrowser();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [redirectTo, setRedirectTo] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRedirectTo(`${window.location.origin}/callback`);
    }
  }, []);

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const { error: signError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signError) throw signError;
      setMessage('Đăng nhập thành công. Đang chuyển...');
      router.replace('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign-in failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-6 py-16 space-y-8">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">SoulSignal</p>
        <h1 className="text-3xl font-semibold">Sign in</h1>
        <p className="text-slate-500">Authenticate để tiếp tục hành trình blind mail → chat → reveal.</p>
      </div>

      <form onSubmit={handleSignIn} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-800">
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
          <label htmlFor="password" className="text-sm font-medium text-slate-800">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none"
            placeholder="********"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-gradient-to-r from-indigo-500 via-rose-500 to-amber-400 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:brightness-110 disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        {message && <p className="text-sm text-emerald-600">{message}</p>}
        {error && <p className="text-sm text-rose-600">{error}</p>}

        <p className="text-sm text-slate-500">
          Chưa có tài khoản?{' '}
          <Link href="/sign-up" className="text-indigo-600 hover:underline">
            Tạo tài khoản
          </Link>
        </p>
      </form>
    </main>
  );
}

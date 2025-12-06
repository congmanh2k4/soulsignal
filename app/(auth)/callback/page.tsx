'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseBrowser } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const supabase = useSupabaseBrowser();
  const router = useRouter();
  const [status, setStatus] = useState<'working' | 'done' | 'error'>('working');
  const [message, setMessage] = useState('Đang hoàn tất phiên đăng nhập...');

  useEffect(() => {
    const exchange = async () => {
      const url = typeof window !== 'undefined' ? new URL(window.location.href) : null;
      const code = url?.searchParams.get('code');
      if (!code) {
        setStatus('error');
        setMessage('Thiếu mã xác thực. Vui lòng thử lại.');
        return;
      }
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        setStatus('error');
        setMessage(error.message);
        return;
      }
      setStatus('done');
      setMessage('Đã xác thực. Đang chuyển...');
      router.replace('/dashboard');
    };
    exchange();
  }, [router, supabase]);

  return (
    <main className="mx-auto max-w-md px-6 py-16 space-y-4">
      <h1 className="text-2xl font-semibold">Completing sign-in…</h1>
      <p className="text-muted-foreground">{message}</p>
      {status === 'error' && (
        <p className="text-sm text-rose-600">Vui lòng thử lại hoặc dùng link mới.</p>
      )}
    </main>
  );
}

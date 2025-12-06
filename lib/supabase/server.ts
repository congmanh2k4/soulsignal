import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client. For full session handling, switch to @supabase/auth-helpers-nextjs.
export const supabaseServer = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Missing Supabase server env');
  return createClient(url, key, {
    global: {
      headers: {
        'X-Client-Info': 'soulsignal-server',
      },
    },
  });
};

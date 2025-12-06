import { useMemo } from 'react';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Browser client factory. Throws early if env is missing to avoid silent failures.
export const supabaseBrowser = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Missing Supabase browser env');
  return createClient(url, key);
};

// React hook so we reuse a memoized client per component tree.
export const useSupabaseBrowser = (): SupabaseClient => {
  const client = useMemo(() => supabaseBrowser(), []);
  return client;
};

// Helper: fetch authenticated user id once; returns null if not signed in.
export async function getCurrentUserId(client: SupabaseClient): Promise<string | null> {
  const { data, error } = await client.auth.getUser();
  if (error || !data?.user) return null;
  return data.user.id;
}

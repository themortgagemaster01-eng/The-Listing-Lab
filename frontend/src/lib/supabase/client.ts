import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser-side Supabase client factory.
 *
 * No live Supabase project exists yet — `NEXT_PUBLIC_SUPABASE_URL` and
 * `NEXT_PUBLIC_SUPABASE_ANON_KEY` are unset in every environment until
 * Robert adds them as Vercel env vars. `getSupabaseClient()` returns `null`
 * (never throws) when either is missing, so callers must check for `null`
 * and fall back to `src/lib/mock-data.ts` — exactly what the app does today.
 *
 * Usage:
 *   const supabase = getSupabaseClient();
 *   if (!supabase) {
 *     // no backend configured yet — use mock data
 *   }
 */

let cachedClient: SupabaseClient | null | undefined;

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient !== undefined) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    cachedClient = null;
    return null;
  }

  cachedClient = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  return cachedClient;
}

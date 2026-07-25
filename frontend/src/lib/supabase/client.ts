import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser-side Supabase client factory.
 *
 * IMPORTANT — Next.js can only inline `NEXT_PUBLIC_`-prefixed env vars into
 * browser bundles. Supabase's newer project setup issues keys named
 * `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` (no `NEXT_PUBLIC_` prefix) —
 * those are fine for server-side code (see `./server.ts`) but are INVISIBLE
 * to this browser client unless duplicated under `NEXT_PUBLIC_` names too.
 * So: when adding Vercel env vars for browser access, also add
 * `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or
 * the legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` name) with the same values as
 * `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY`. This module checks the
 * `NEXT_PUBLIC_` names in publishable/anon-key order and falls back to
 * `null` (never throws) if neither is set, so callers must check for `null`
 * and fall back to `src/lib/mock-data.ts` — exactly what the app does today.
 *
 * Usage:
 *   const supabase = getSupabaseClient();
 *   if (!supabase) {
 *     // no backend configured yet — use mock data
 *   }
 */

let cachedClient: SupabaseClient | null | undefined;

const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(publicUrl && publicKey);

export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient !== undefined) return cachedClient;

  const url = publicUrl;
  const anonKey = publicKey;

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

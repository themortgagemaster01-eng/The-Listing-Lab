import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

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
 * AUTH NOTE (added when building real sign-in/sign-up): this now uses
 * `createBrowserClient` from `@supabase/ssr` instead of plain
 * `@supabase/supabase-js` `createClient`. Functionally identical for every
 * existing use of this client (storage uploads, table reads, etc.) — the
 * only difference is `createBrowserClient` also writes the auth session to a
 * cookie (not just localStorage), which is what lets `middleware.ts` and
 * Server Components (`src/lib/supabase/session.ts`) see that a user is
 * signed in. Without this, `supabase.auth.signInWithPassword()` here would
 * work client-side but the server would never know about it.
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

  // Cookie sync (session visible to the server) is `createBrowserClient`'s
  // default behavior — no extra options needed for that. `persistSession`/
  // `autoRefreshToken` also default to `true`.
  cachedClient = createBrowserClient(url, anonKey);

  return cachedClient;
}

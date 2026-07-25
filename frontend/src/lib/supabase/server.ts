import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client factory — for use in Server Components,
 * Route Handlers, and Server Actions only (uses the service role key, which
 * must never reach the browser bundle). Do NOT import this module from a
 * "use client" component or anything bundled into client JS — that is
 * enforced by convention only right now. If that becomes a real risk later,
 * add the tiny `server-only` package and `import "server-only"` at the top
 * of this file to make an accidental client import a build-time error.
 *
 * Same graceful-degradation contract as `./client.ts`: returns `null`
 * (never throws) when `NEXT_PUBLIC_SUPABASE_URL` or
 * `SUPABASE_SERVICE_ROLE_KEY` is absent, which is the case everywhere until
 * Robert provisions a real Supabase project. Callers must check for `null`
 * and fall back to mock data.
 */

let cachedClient: SupabaseClient | null | undefined;

export const isSupabaseServerConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
);

export function getSupabaseServerClient(): SupabaseClient | null {
  if (cachedClient !== undefined) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    cachedClient = null;
    return null;
  }

  cachedClient = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedClient;
}

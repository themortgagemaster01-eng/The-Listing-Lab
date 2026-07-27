import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client factory — for use in Server Components,
 * Route Handlers, and Server Actions only (uses the secret/service-role key,
 * which must never reach the browser bundle). Do NOT import this module
 * from a "use client" component or anything bundled into client JS — that
 * is enforced by convention only right now. If that becomes a real risk
 * later, add the tiny `server-only` package and `import "server-only"` at
 * the top of this file to make an accidental client import a build-time
 * error.
 *
 * Reads plain (non-`NEXT_PUBLIC_`) env var names, since server code is never
 * bundled to the browser and doesn't need that prefix. Supports both
 * Supabase's newer key naming (`SUPABASE_URL` / `SUPABASE_SECRET_KEY`) and
 * the legacy naming (`SUPABASE_SERVICE_ROLE_KEY`) so this works regardless
 * of which convention was used when adding Vercel env vars — checks the
 * newer names first.
 *
 * Same graceful-degradation contract as `./client.ts`: returns `null`
 * (never throws) when the URL or secret key is absent, which is the case
 * everywhere until Robert adds real Vercel env vars. Callers must check for
 * `null` and fall back to mock data.
 *
 * CACHING BUG FIX (second round, found during Robert's draft/publish live
 * re-verification): `export const dynamic = "force-dynamic"` on
 * `src/app/site/[slug]/page.tsx` was expected to make Next.js pass
 * `cache: "no-store"` to every `fetch` call made inside that route by
 * default — but that only reliably applies to fetches Next's own patched
 * `fetch` can see making NO explicit cache decision of their own.
 * `@supabase/supabase-js`'s internal HTTP client evidently doesn't hit that
 * path consistently in practice: live testing showed each freshly deployed
 * instance serving one correct fresh read, then silently freezing on that
 * same response for every request afterward — a textbook per-instance fetch
 * cache, not a CDN/edge cache (confirmed via `x-vercel-cache: MISS` on every
 * request) and not stale data in Postgres (confirmed via a direct read
 * against the same table/slug returning the fresh row every time). So this
 * client now passes its OWN `fetch` override to `createClient`, forcing
 * `cache: "no-store"` explicitly on every request this client makes —
 * removing any dependency on Next.js inferring that from route config.
 */

let cachedClient: SupabaseClient | null | undefined;

const serverUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseServerConfigured = Boolean(serverUrl && secretKey);

export function getSupabaseServerClient(): SupabaseClient | null {
  if (cachedClient !== undefined) return cachedClient;

  const url = serverUrl;
  const serviceRoleKey = secretKey;

  if (!url || !serviceRoleKey) {
    cachedClient = null;
    return null;
  }

  cachedClient = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      // Explicit, unconditional no-store — see header comment above. Never
      // rely on Next.js's implicit per-route fetch-cache default here.
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });

  return cachedClient;
}

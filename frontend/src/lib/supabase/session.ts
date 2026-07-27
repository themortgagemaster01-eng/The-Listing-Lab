import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { cache } from "react";

import { roleLabel } from "@/lib/auth/roles";

/**
 * Server Component-safe way to read "who is signed in" — used by
 * `src/app/(app)/layout.tsx` (route protection) and
 * `src/app/(app)/dashboard/page.tsx` (real greeting/avatar instead of the
 * hardcoded `currentUser` mock).
 *
 * Deliberately separate from `./server.ts`: that file's client uses the
 * SECRET service-role key for admin-style backend reads/writes and must
 * never be involved in a user's own session. This file uses the PUBLIC
 * anon/publishable key plus the request's cookies — the same client a
 * signed-in user's own browser would be allowed to use — so it can only
 * ever see that one user's session, never anyone else's data.
 *
 * Read-only by construction: `setAll` below is a no-op because Server
 * Components cannot write cookies in Next.js. That's fine for reading the
 * current user, but it means this client can NOT refresh an expiring
 * session token — `middleware.ts` does that (it runs on every request and
 * CAN write cookies), so by the time a Server Component runs, the session
 * cookie is already current.
 */

const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * `false` only when Robert hasn't added the Supabase env vars at all (e.g. a
 * fresh local checkout). In that case `(app)/layout.tsx` intentionally does
 * NOT redirect to `/login` — same graceful "fall back to mock data instead
 * of breaking" convention used everywhere else in this app
 * (`src/lib/supabase/client.ts`, `./server.ts`). In production, where the
 * env vars are set, this is `true` and the real redirect-when-signed-out
 * gate is fully active.
 */
export const isSupabaseSessionConfigured = Boolean(publicUrl && publicKey);

export interface AuthUserSummary {
  id: string;
  /** `user_metadata.full_name` if set at sign-up, else the email's local part. */
  name: string;
  email: string;
  /** Display label for `user_metadata.role` (see `src/lib/auth/roles.ts`), or "". */
  roleLabel: string;
  avatarUrl?: string;
}

function getSessionReadClient() {
  if (!publicUrl || !publicKey) return null;

  const cookieStore = cookies();

  return createServerClient(publicUrl, publicKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        // No-op — see file header comment. Session refresh happens in
        // middleware.ts, not here.
      },
    },
  });
}

/**
 * Returns the signed-in user for the current request, or `null` if signed
 * out (or Supabase isn't configured at all — see
 * `isSupabaseSessionConfigured`). Wrapped in React's `cache()` so calling
 * this from both `(app)/layout.tsx` and a page it wraps (e.g.
 * `dashboard/page.tsx`) in the same request hits Supabase once, not twice.
 */
export const getAuthUser = cache(async (): Promise<AuthUserSummary | null> => {
  const supabase = getSessionReadClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const fullName = typeof metadata.full_name === "string" ? metadata.full_name : undefined;
  const role = typeof metadata.role === "string" ? metadata.role : undefined;
  const avatarUrl = typeof metadata.avatar_url === "string" ? metadata.avatar_url : undefined;

  return {
    id: user.id,
    name: fullName || user.email?.split("@")[0] || "there",
    email: user.email ?? "",
    roleLabel: roleLabel(role),
    avatarUrl,
  };
});

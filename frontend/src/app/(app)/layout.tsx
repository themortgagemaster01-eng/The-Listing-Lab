import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { getAuthUser, isSupabaseSessionConfigured } from "@/lib/supabase/session";

/**
 * Route-group layout for every signed-in route: `/dashboard`,
 * `/ai-command-center`, and `/property/[id]/...`. Lives in a route group —
 * `(app)` — so it applies to all three without adding a path segment to
 * any of their URLs. The actual shell markup lives in `AppShell`.
 *
 * AUTH GATE (second layer): `middleware.ts` is the primary gate and runs
 * BEFORE this layout even renders, but this redirect stays as defense in
 * depth — if middleware's matcher ever misses a route, or someone deep-links
 * straight into a Server Component render, this still catches it. Skipped
 * entirely when Supabase isn't configured at all (see
 * `isSupabaseSessionConfigured`'s doc comment) so a fresh local checkout
 * without env vars still works, same graceful-degradation convention as the
 * rest of this app.
 *
 * TEMPORARY (Robert, 2026-07-27): matches `AUTH_GATE_ENABLED` in
 * `middleware.ts` — auth enforcement disabled on both gates so testing
 * isn't blocked by a sign-in issue. `getAuthUser()` still runs, so
 * `AppShell` gets a real user when one exists and `null` otherwise (the
 * same shape it already handles in local/no-Supabase mode). Flip both
 * flags back to `true` to restore protection.
 */
const AUTH_GATE_ENABLED = false;

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();

  if (AUTH_GATE_ENABLED && isSupabaseSessionConfigured && !user) {
    redirect("/login");
  }

  return <AppShell user={user}>{children}</AppShell>;
}

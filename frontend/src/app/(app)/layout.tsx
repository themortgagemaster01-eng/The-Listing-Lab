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
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();

  if (isSupabaseSessionConfigured && !user) {
    redirect("/login");
  }

  return <AppShell user={user}>{children}</AppShell>;
}

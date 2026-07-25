import { AppShell } from "@/components/layout/AppShell";

/**
 * Route-group layout for every signed-in route: `/dashboard`,
 * `/ai-command-center`, and `/property/[id]/...`. Lives in a route group —
 * `(app)` — so it applies to all three without adding a path segment to
 * any of their URLs. The actual shell markup lives in `AppShell`.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

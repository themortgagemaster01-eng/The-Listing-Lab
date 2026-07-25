import { Sidebar } from "@/components/layout/Sidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

/**
 * Shared app shell (sidebar + mobile bottom nav + page padding) for every
 * signed-in route: `/dashboard`, `/ai-command-center`, and
 * `/property/[id]/...`. Extracted from `src/app/(app)/layout.tsx` so the
 * shell itself is a reusable, testable component rather than logic living
 * directly inside the route-group layout file.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-[272px]">
        <main className="mx-auto max-w-[1600px] px-4 pb-24 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-8">
          {children}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}

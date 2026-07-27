import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";

/**
 * Route-level loading state for `/dashboard`. `DashboardPage` is an async
 * Server Component that calls `getAuthUser()` (a real Supabase network
 * round-trip) before it can render a name into the header — without this
 * file, Next.js shows a blank page while that call is in flight. Mirrors the
 * page's real shape (header, search bar, stats row, two-column grid) so
 * nothing visually "jumps" once the real content mounts. Same pattern as
 * `property/[id]/loading.tsx`.
 */
export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <LoadingSkeleton className="h-16 w-full rounded-2xl" />
      <LoadingSkeleton className="h-24 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <LoadingSkeleton className="h-24 rounded-2xl" />
        <LoadingSkeleton className="h-24 rounded-2xl" />
        <LoadingSkeleton className="h-24 rounded-2xl" />
        <LoadingSkeleton className="h-24 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="space-y-6 lg:col-span-2">
          <LoadingSkeleton className="h-64 w-full rounded-2xl" />
          <LoadingSkeleton className="h-40 w-full rounded-2xl" />
        </div>
        <div className="space-y-6">
          <LoadingSkeleton className="h-48 w-full rounded-2xl" />
          <LoadingSkeleton className="h-40 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

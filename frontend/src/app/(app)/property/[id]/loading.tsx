import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";

/**
 * Route-level loading state for `/property/[id]/...`. `PropertyLayout`
 * (`layout.tsx` in this segment) does a real Supabase read for properties
 * created via `/property/new` (see `src/lib/property/loader.ts`) — without
 * this file, Next.js shows nothing at all while that read is in flight.
 * Mirrors the hero header (photo banner) + tab bar + content shape so the
 * page doesn't visually "jump" once the real content mounts.
 */
export default function PropertyWorkspaceLoading() {
  return (
    <div className="space-y-6">
      <LoadingSkeleton className="h-52 w-full rounded-3xl sm:h-64 lg:h-80" />
      <LoadingSkeleton className="h-10 w-full max-w-2xl rounded-xl" />
      <div className="space-y-4">
        <LoadingSkeleton className="h-32 w-full rounded-2xl" />
        <LoadingSkeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  );
}

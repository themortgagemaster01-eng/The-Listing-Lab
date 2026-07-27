import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";

/**
 * Route-level loading state for `/brand-center`. `BrandCenterPage` is an
 * async Server Component that calls `getAuthUser()` before handing off to
 * `BrandCenterForm` — without this file, Next.js shows a blank page during
 * that call. Mirrors the real layout (2-column: form sections on the left,
 * sticky completion + preview panel on the right) so nothing visually
 * "jumps" once the real form mounts. Same pattern as
 * `property/[id]/loading.tsx` and `dashboard/loading.tsx`.
 */
export default function BrandCenterLoading() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
      <div className="space-y-6 lg:col-span-2">
        <LoadingSkeleton className="h-72 w-full rounded-2xl" />
        <LoadingSkeleton className="h-56 w-full rounded-2xl" />
        <LoadingSkeleton className="h-40 w-full rounded-2xl" />
        <LoadingSkeleton className="h-40 w-full rounded-2xl" />
      </div>
      <div className="space-y-6">
        <LoadingSkeleton className="h-64 w-full rounded-2xl" />
        <LoadingSkeleton className="h-80 w-full rounded-2xl" />
      </div>
    </div>
  );
}

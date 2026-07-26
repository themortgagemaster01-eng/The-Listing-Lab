"use client";

import { Folder } from "lucide-react";

import { PropertyCard } from "@/components/dashboard/PropertyCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { useToast } from "@/components/shared/Toast";
import { properties } from "@/lib/mock-data";

/** "Recent Property Labs" section: header, "View all" link, and a scrollable property card row. */
export function RecentPropertyLabs() {
  const { showToast } = useToast();

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Recent Property Labs</h2>
        <button
          type="button"
          onClick={() => showToast("A full Property Labs list view is coming soon.")}
          className="rounded-lg text-sm font-medium text-navy-700 transition-colors hover:text-gold-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:text-gold-400 dark:hover:text-gold-300"
        >
          View all
        </button>
      </div>

      {properties.length === 0 ? (
        <EmptyState
          icon={Folder}
          title="No Property Labs yet"
          description="Create your first Property Lab to start generating flyers, payment snapshots, and more."
          className="mt-4"
        />
      ) : (
        <div className="-mx-4 mt-4 flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide snap-x sm:mx-0 sm:px-0">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </section>
  );
}

import { PropertyCard } from "@/components/dashboard/PropertyCard";
import { properties } from "@/lib/mock-data";

/** "Recent Property Labs" section: header, "View all" link, and a scrollable property card row. */
export function RecentPropertyLabs() {
  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Recent Property Labs</h2>
        <button
          type="button"
          className="text-sm font-medium text-navy-700 transition-colors hover:text-gold-600 dark:text-gold-400 dark:hover:text-gold-300"
        >
          View all
        </button>
      </div>

      <div className="-mx-4 mt-4 flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide snap-x sm:mx-0 sm:px-0">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </section>
  );
}

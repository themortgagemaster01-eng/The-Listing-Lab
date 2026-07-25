import Link from "next/link";
import { Clock3 } from "lucide-react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";
import type { ActivityItem } from "@/types";

interface ActivityFeedProps {
  items: ActivityItem[];
  /** Optional section heading, e.g. "Recent Activity" or "Activity Timeline". */
  title?: string;
  /** When provided, "view all" navigates here; otherwise it renders as a decorative affordance. */
  viewAllHref?: string;
  viewAllLabel?: string;
  emptyMessage?: string;
  className?: string;
}

/**
 * Reusable list of activity rows — icon, title, subtitle, relative
 * timestamp. Generalized from the dashboard-only `RecentActivityPanel` so
 * the same component powers the dashboard's "Recent Activity" panel, a
 * Property Workspace's "Activity Timeline" tab, and the Overview tab's
 * recent-activity preview.
 */
export function ActivityFeed({
  items,
  title,
  viewAllHref,
  viewAllLabel = "View all activity",
  emptyMessage = "Nothing has happened here yet.",
  className,
}: ActivityFeedProps) {
  return (
    <section className={className}>
      {title && <h2 className="text-lg font-semibold text-foreground">{title}</h2>}

      <DashboardCard className={cn(title && "mt-4", "overflow-hidden p-0")} contentClassName="mt-0">
        {items.length === 0 ? (
          <EmptyState
            icon={Clock3}
            title="No activity yet"
            description={emptyMessage}
            className="rounded-none border-0"
          />
        ) : (
          <div className="divide-y divide-border">
            {items.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${activity.iconBadgeClass}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{activity.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{activity.subtitle}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{activity.timestamp}</span>
                </div>
              );
            })}
          </div>
        )}
      </DashboardCard>

      {viewAllHref ? (
        <Link
          href={viewAllHref}
          className="mt-3 inline-block text-sm font-medium text-navy-700 transition-colors hover:text-gold-600 dark:text-gold-400 dark:hover:text-gold-300"
        >
          {viewAllLabel}
        </Link>
      ) : (
        <button
          type="button"
          className="mt-3 text-sm font-medium text-navy-700 transition-colors hover:text-gold-600 dark:text-gold-400 dark:hover:text-gold-300"
        >
          {viewAllLabel}
        </button>
      )}
    </section>
  );
}

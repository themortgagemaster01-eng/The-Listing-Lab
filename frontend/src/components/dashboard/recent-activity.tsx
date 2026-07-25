import { recentActivity } from "@/lib/mock-data";

/** Full-width list of recent activity rows with icon, title, address, and relative timestamp. */
export function RecentActivity() {
  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>

      <div className="mt-4 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
        {recentActivity.map((activity) => {
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

      <button
        type="button"
        className="mt-3 text-sm font-medium text-navy-700 transition-colors hover:text-gold-600 dark:text-gold-400 dark:hover:text-gold-300"
      >
        View all activity
      </button>
    </section>
  );
}

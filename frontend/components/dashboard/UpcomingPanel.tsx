import { Plus } from "lucide-react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { upcomingEvents } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/** Right-column panel: upcoming calendar events with date blocks and status dots. */
export function UpcomingPanel() {
  return (
    <DashboardCard title="Upcoming" action={{ label: "View calendar" }}>
      <div className="space-y-1">
        {upcomingEvents.map((event) => (
          <div
            key={event.id}
            className="flex items-center gap-3 rounded-xl px-1 py-2.5 transition-colors hover:bg-muted"
          >
            <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-muted text-navy-800 dark:text-white">
              <span className="text-[10px] font-semibold uppercase leading-none text-muted-foreground">
                {event.month}
              </span>
              <span className="text-base font-bold leading-tight">{event.day}</span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", event.statusColor)} />
                <p className="truncate text-sm font-semibold text-foreground">{event.title}</p>
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{event.location}</p>
            </div>

            <span className="shrink-0 text-xs font-medium text-muted-foreground">{event.time}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="mt-3 flex items-center gap-1.5 text-sm font-medium text-navy-700 transition-colors hover:text-gold-600 dark:text-gold-400 dark:hover:text-gold-300"
      >
        <Plus className="h-4 w-4" />
        Add new event
      </button>
    </DashboardCard>
  );
}

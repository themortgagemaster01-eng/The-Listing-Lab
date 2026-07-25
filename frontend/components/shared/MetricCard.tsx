import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  sublabel?: string;
  icon?: LucideIcon;
  /** Slightly larger/bolder treatment for a "total" or headline row. */
  emphasis?: boolean;
  className?: string;
}

/**
 * Plain label + value building block, smaller and simpler than
 * `StatTile` (no icon badge / trend). Used for line items in the Payments
 * and Closing Costs calculators.
 */
export function MetricCard({ label, value, sublabel, icon: Icon, emphasis, className }: MetricCardProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3",
        emphasis && "border-gold-300 bg-gold-50 dark:border-gold-500/40 dark:bg-gold-500/10",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground",
              emphasis && "bg-gold-100 text-gold-600 dark:bg-gold-500/15 dark:text-gold-400"
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div>
          <p className={cn("text-xs text-muted-foreground", emphasis && "font-medium text-foreground")}>
            {label}
          </p>
          {sublabel && <p className="mt-0.5 text-[11px] text-muted-foreground">{sublabel}</p>}
        </div>
      </div>
      <p
        className={cn(
          "shrink-0 text-sm font-semibold text-foreground",
          emphasis && "text-base font-bold text-navy-800 dark:text-gold-400"
        )}
      >
        {value}
      </p>
    </div>
  );
}

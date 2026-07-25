import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface DashboardCardAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface DashboardCardProps {
  /** Optional header title. When omitted, no header row is rendered. */
  title?: string;
  /** Optional trailing header action, rendered as a link or button. */
  action?: DashboardCardAction;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
}

/**
 * Generic rounded/bordered dashboard panel wrapper: consistent padding,
 * radius, shadow, and an optional header row with a "View all"-style
 * trailing action. Used by every dashboard/workspace panel so chrome never
 * gets copy-pasted between components.
 */
export function DashboardCard({
  title,
  action,
  className,
  contentClassName,
  children,
}: DashboardCardProps) {
  return (
    <div className={cn("rounded-2xl border border-border bg-surface p-5 shadow-soft", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3">
          {title && <h3 className="text-sm font-semibold text-foreground">{title}</h3>}
          {action &&
            (action.href ? (
              <Link
                href={action.href}
                className="shrink-0 text-xs font-medium text-navy-700 transition-colors hover:text-gold-600 dark:text-gold-400 dark:hover:text-gold-300"
              >
                {action.label}
              </Link>
            ) : (
              <button
                type="button"
                onClick={action.onClick}
                className="shrink-0 text-xs font-medium text-navy-700 transition-colors hover:text-gold-600 dark:text-gold-400 dark:hover:text-gold-300"
              >
                {action.label}
              </button>
            ))}
        </div>
      )}
      <div className={cn(title || action ? "mt-4" : undefined, contentClassName)}>{children}</div>
    </div>
  );
}

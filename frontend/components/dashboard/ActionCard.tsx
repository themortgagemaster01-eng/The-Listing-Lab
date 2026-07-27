"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { DURATIONS_S } from "@/lib/design-tokens";
import { useToast } from "@/components/shared/Toast";
import { cn } from "@/lib/utils";
import type { QuickAction } from "@/types";

interface ActionCardProps {
  action: QuickAction;
  index: number;
}

/**
 * A single quick-action / deep-link tile: icon badge, title, subtitle.
 * Used on the dashboard's Quick Actions grid (`QuickActionsGrid`) and on a
 * Property Workspace's Overview tab "Jump back in" links.
 *
 * Three states:
 *   - `action.href` set → navigates there.
 *   - `action.comingSoon` set → visually muted, non-navigating, shows a
 *     "Soon" badge, and surfaces a toast on click (same "never do nothing
 *     on click" convention as `ComingSoonButton`) instead of silently being
 *     dead or pretending to be a real link.
 *   - neither → decorative, non-interactive placeholder tile (legacy
 *     fallback, kept for any caller that doesn't set either).
 */
export function ActionCard({ action, index }: ActionCardProps) {
  const Icon = action.icon;
  const { showToast } = useToast();

  const inner = (
    <>
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${action.iconBadgeClass}`}>
        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="text-xs font-semibold leading-snug text-foreground sm:text-sm">{action.title}</p>
          {action.comingSoon && (
            <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
              Soon
            </span>
          )}
        </div>
        <p className="mt-0.5 hidden text-xs text-muted-foreground sm:block">{action.subtitle}</p>
      </div>
    </>
  );

  if (action.comingSoon) {
    return (
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATIONS_S.base, delay: index * 0.03 }}
        onClick={() => showToast(`${action.title} is coming soon.`)}
        className={cn(
          "flex h-full flex-col items-start gap-2.5 rounded-2xl border border-dashed border-border bg-surface/60 p-3.5 text-left opacity-80 shadow-none transition-colors hover:border-gold-300 hover:opacity-100 sm:gap-3 sm:p-5",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        )}
      >
        {inner}
      </motion.button>
    );
  }

  const className =
    "flex flex-col items-start gap-2.5 rounded-2xl border border-border bg-surface p-3.5 text-left shadow-soft transition-colors hover:border-gold-300 sm:gap-3 sm:p-5";

  if (action.href) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATIONS_S.base, delay: index * 0.03 }}
        whileHover={{ y: -3 }}
        className="h-full"
      >
        <Link href={action.href} className={`h-full w-full ${className}`}>
          {inner}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATIONS_S.base, delay: index * 0.03 }}
      whileHover={{ y: -3 }}
      className={className}
    >
      {inner}
    </motion.button>
  );
}

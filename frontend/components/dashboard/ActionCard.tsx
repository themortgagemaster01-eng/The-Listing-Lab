"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { DURATIONS_S } from "@/lib/design-tokens";
import type { QuickAction } from "@/types";

interface ActionCardProps {
  action: QuickAction;
  index: number;
}

/**
 * A single quick-action / deep-link tile: icon badge, title, subtitle.
 * Used on the dashboard's Quick Actions grid (`QuickActionsGrid`) and on a
 * Property Workspace's Overview tab "Jump back in" links. When the action
 * has an `href` it navigates there; otherwise it's a decorative placeholder
 * tile.
 */
export function ActionCard({ action, index }: ActionCardProps) {
  const Icon = action.icon;

  const inner = (
    <>
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${action.iconBadgeClass}`}>
        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
      </div>
      <div>
        <p className="text-xs font-semibold leading-snug text-foreground sm:text-sm">{action.title}</p>
        <p className="mt-0.5 hidden text-xs text-muted-foreground sm:block">{action.subtitle}</p>
      </div>
    </>
  );

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

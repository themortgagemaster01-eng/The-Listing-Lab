"use client";

import { motion } from "framer-motion";

import { DURATIONS_S } from "@/lib/design-tokens";
import type { StatCard as StatCardType } from "@/types";

interface StatTileProps {
  stat: StatCardType;
  index: number;
}

/** A single KPI card: icon badge, large number, label, and a green trend line. */
export function StatTile({ stat, index }: StatTileProps) {
  const Icon = stat.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATIONS_S.base, delay: index * 0.05 }}
      whileHover={{ y: -3 }}
      className="flex min-w-[190px] flex-1 shrink-0 flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-soft snap-start"
    >
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.iconBadgeClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{stat.label}</p>
      </div>
      <p className="text-xs font-medium text-success">{stat.trendLabel}</p>
    </motion.div>
  );
}

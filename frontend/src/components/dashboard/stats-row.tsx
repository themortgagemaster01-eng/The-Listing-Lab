"use client";

import { StatCard } from "@/components/dashboard/stat-card";
import { stats } from "@/lib/mock-data";

/** Horizontally-scrollable row of 5 equal-width KPI stat cards. */
export function StatsRow() {
  return (
    <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide snap-x sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-5">
      {stats.map((stat, index) => (
        <StatCard key={stat.id} stat={stat} index={index} />
      ))}
    </div>
  );
}

"use client";

import { BarChart3, ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/shared/Toast";

/**
 * Dashboard hero banner spotlighting AI Comparative Market Analysis (CMA) —
 * per Robert's 2026-07-28 "six flagship tools" update, CMA is now the lead
 * flagship feature and gets top-level billing on the dashboard, ahead of
 * `SearchCommandBar`. It is not built yet (see `docs/FUTURE_FEATURES.md`,
 * where it now sits at the top of the build-priority queue, ahead of every
 * other not-yet-started item), so this is a promo/placeholder banner rather
 * than a real entry point — clicking it surfaces the same "coming soon"
 * toast convention used by `ComingSoonButton` elsewhere in the app, and it
 * intentionally does not link anywhere.
 *
 * This is additive to, not a replacement for, the "AI Comparative Market
 * Analysis (CMA)" tile at the top of the toolbox grid (`QuickActionsGrid` /
 * `toolboxCategories` in `src/lib/mock-data.ts`) — the banner is the
 * headline placement, the tile is the toolbox-grid placement, both point at
 * the same not-yet-built feature.
 */
export function FlagshipBanner() {
  const { showToast } = useToast();

  return (
    <button
      type="button"
      onClick={() => showToast("AI CMA is coming soon — it's the top of our build queue.")}
      className="group flex w-full flex-col items-start gap-3 rounded-3xl border-2 border-gold-500 bg-gradient-to-br from-navy-800 to-navy-900 p-6 text-left shadow-soft-lg transition-transform duration-base hover:-translate-y-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-8"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold-500/15 text-gold-400">
          <BarChart3 className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-lg font-semibold text-white sm:text-xl">
              AI Comparative Market Analysis
            </h2>
            <Badge variant="gold">Coming Soon</Badge>
          </div>
          <p className="mt-1 text-sm text-navy-100">
            Our new flagship tool — a branded CMA in minutes, not hours. Top of the build queue.
          </p>
        </div>
      </div>

      <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-gold-400 transition-transform group-hover:translate-x-0.5">
        Learn more
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </span>
    </button>
  );
}

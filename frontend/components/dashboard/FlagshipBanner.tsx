import Link from "next/link";
import { BarChart3, ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EXAMPLE_PROPERTY_ID } from "@/lib/mock-data";

/**
 * Dashboard hero banner spotlighting AI Comparative Market Analysis (CMA) —
 * per Robert's 2026-07-28 "six flagship tools" update, CMA is the lead
 * flagship feature and gets top-level billing on the dashboard, ahead of
 * `SearchCommandBar`. BUILT 2026-07-28 (provider-based architecture — see
 * `src/lib/market-comp/`) — this now links straight into the real wizard on
 * the example property rather than showing a "coming soon" toast.
 *
 * This is additive to, not a replacement for, the "AI Comparative Market
 * Analysis (CMA)" tile at the top of the toolbox grid (`QuickActionsGrid` /
 * `toolboxCategories` in `src/lib/mock-data.ts`) — the banner is the
 * headline placement, the tile is the toolbox-grid placement, both now point
 * at the same real feature.
 */
export function FlagshipBanner() {
  return (
    <Link
      href={`/property/${EXAMPLE_PROPERTY_ID}/market-comp`}
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
            <Badge variant="gold">Flagship</Badge>
          </div>
          <p className="mt-1 text-sm text-navy-100">
            Our flagship tool — a branded CMA in minutes, not hours.
          </p>
        </div>
      </div>

      <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-gold-400 transition-transform group-hover:translate-x-0.5">
        Start a CMA
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </span>
    </Link>
  );
}

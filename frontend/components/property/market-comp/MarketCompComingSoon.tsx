import { BarChart3 } from "lucide-react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { EmptyState } from "@/components/shared/EmptyState";

/**
 * "Coming Soon" stub for Market Comp Analysis (v1.1) — reuses the
 * `DashboardCard`/`EmptyState` patterns already established across the app
 * rather than a bespoke layout. No working form, no button behind it — see
 * `src/lib/market-comp/types.ts` and `src/lib/market-comp/generate.ts` for
 * the scaffolding this stub sits in front of.
 */
export function MarketCompComingSoon() {
  return (
    <DashboardCard title="Market Comp Analysis">
      <EmptyState
        icon={BarChart3}
        title="Coming in v1.1"
        description="Pull nearby comparable sales, price-per-sqft trends, and an AI-written pricing narrative for this listing — planned for a future release."
        className="mt-4"
      />
    </DashboardCard>
  );
}

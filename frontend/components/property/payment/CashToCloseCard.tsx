import { Receipt } from "lucide-react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { MetricCard } from "@/components/shared/MetricCard";
import type { ClosingCostLineItem, LoanProgramResult } from "@/lib/payment/types";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

interface CashToCloseCardProps {
  closingCosts: ClosingCostLineItem[];
  totalClosingCosts: number;
  programResults: LoanProgramResult[];
}

/**
 * "Cash Needed to Close" card — extends the legacy
 * `components/property/ClosingCostsTab.tsx` NY-specific line items (title
 * insurance, NY transfer tax, attorney fees, municipal/tax search,
 * recording fees, loan origination) with a per-program cash-to-close
 * breakdown (down payment + those same closing costs).
 *
 * Financed fees (FHA's upfront MIP, VA's funding fee) are intentionally
 * NOT included here — they're rolled into the loan balance instead of paid
 * in cash at closing, so each program's `cashToClose` figure already
 * excludes them (see `src/lib/payment/calculations.ts`).
 */
export function CashToCloseCard({ closingCosts, totalClosingCosts, programResults }: CashToCloseCardProps) {
  return (
    <DashboardCard title="Cash Needed to Close" contentClassName="mt-4 space-y-5">
      <div className="space-y-2.5">
        {closingCosts.map((item) => (
          <MetricCard key={item.label} label={item.label} value={currency.format(item.amount)} icon={Receipt} />
        ))}
        <MetricCard label="Total Estimated Closing Costs" value={currency.format(totalClosingCosts)} icon={Receipt} emphasis />
      </div>

      <div className="border-t border-border pt-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Cash to Close by Program
        </p>
        <div className="space-y-2">
          {programResults.map((p) => (
            <div
              key={p.program}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{p.label}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {currency.format(p.downPaymentAmount)} down + {currency.format(totalClosingCosts)} closing costs
                  {p.financedFeeAmount > 0 ? ` (${currency.format(p.financedFeeAmount)} financed, not shown here)` : ""}
                </p>
              </div>
              <p className="shrink-0 text-base font-bold text-navy-800 dark:text-gold-400">
                {currency.format(p.cashToClose)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        These are rough estimates for illustrative purposes only and will vary by lender, title company, and
        municipality. Actual closing costs will be provided in your Loan Estimate.
      </p>
    </DashboardCard>
  );
}

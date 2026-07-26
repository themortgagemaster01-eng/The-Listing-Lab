import { DashboardCard } from "@/components/shared/DashboardCard";
import type { LoanProgramResult } from "@/lib/payment/types";
import { cn } from "@/lib/utils";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const currencyPrecise = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

interface MetricRow {
  label: string;
  render: (p: LoanProgramResult) => string;
  emphasis?: boolean;
}

function mortgageInsuranceLabel(p: LoanProgramResult): string {
  if (p.program === "va") return p.financedFeeAmount > 0 ? "VA Funding Fee (financed)" : "None";
  if (p.program === "fha") return "MIP (upfront financed + monthly)";
  return "PMI (monthly)";
}

function mortgageInsuranceValue(p: LoanProgramResult): string {
  if (p.program === "va") return p.financedFeeAmount > 0 ? currency.format(p.financedFeeAmount) : "None";
  if (p.program === "fha") {
    return `${currency.format(p.financedFeeAmount)} + ${currencyPrecise.format(p.monthlyMortgageInsurance)}/mo`;
  }
  return p.monthlyMortgageInsurance > 0 ? `${currencyPrecise.format(p.monthlyMortgageInsurance)}/mo` : "None";
}

const METRIC_ROWS: MetricRow[] = [
  { label: "Rate", render: (p) => `${p.ratePercent}%` },
  { label: "Term", render: (p) => `${p.termYears} yrs` },
  { label: "Down Payment", render: (p) => `${currency.format(p.downPaymentAmount)} (${p.downPaymentPercent.toFixed(1)}%)` },
  { label: "Loan Amount", render: (p) => currency.format(p.totalLoanAmount) },
  { label: "Monthly P&I", render: (p) => currencyPrecise.format(p.monthlyPI) },
  { label: "PMI / MIP / Funding Fee", render: mortgageInsuranceValue },
  { label: "Total Monthly Payment", render: (p) => currency.format(p.totalMonthly), emphasis: true },
  { label: "Cash Needed to Close", render: (p) => currency.format(p.cashToClose), emphasis: true },
];

interface LoanComparisonTableProps {
  programResults: LoanProgramResult[];
}

/**
 * Side-by-side loan program comparison. Renders as a real table on desktop
 * (`sm:` and up) and as stacked, individually-scrollable cards on mobile —
 * an explicit spec requirement so a 3-5 column table never overflows
 * unreadably on a phone screen. Both layouts render from the same
 * `METRIC_ROWS` definition so they can't drift out of sync.
 */
export function LoanComparisonTable({ programResults }: LoanComparisonTableProps) {
  return (
    <DashboardCard title="Loan Program Comparison" contentClassName="mt-4">
      {/* Desktop / tablet: real side-by-side table */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[520px] border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="w-40 border-b border-border pb-3 text-left text-xs font-medium text-muted-foreground">
                &nbsp;
              </th>
              {programResults.map((p) => (
                <th key={p.program} className="border-b border-border px-3 pb-3 text-left">
                  <span className="text-sm font-semibold text-foreground">{p.label}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {METRIC_ROWS.map((row) => (
              <tr key={row.label}>
                <td className="whitespace-nowrap border-b border-border py-2.5 text-xs text-muted-foreground">
                  {row.label}
                </td>
                {programResults.map((p) => (
                  <td
                    key={p.program}
                    className={cn(
                      "border-b border-border px-3 py-2.5 text-sm",
                      row.emphasis ? "font-semibold text-navy-800 dark:text-gold-400" : "text-foreground"
                    )}
                  >
                    {row.render(p)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards, one per program */}
      <div className="space-y-4 sm:hidden">
        {programResults.map((p) => (
          <div key={p.program} className="rounded-xl border border-border bg-background p-4">
            <p className="mb-3 text-sm font-semibold text-foreground">{p.label}</p>
            <dl className="space-y-2">
              {METRIC_ROWS.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3">
                  <dt className="text-xs text-muted-foreground">{row.label}</dt>
                  <dd
                    className={cn(
                      "text-right text-sm",
                      row.emphasis ? "font-semibold text-navy-800 dark:text-gold-400" : "text-foreground"
                    )}
                  >
                    {row.render(p)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      {programResults.some((p) => p.notes.length > 0) && (
        <div className="mt-4 space-y-1.5 border-t border-border pt-4">
          {programResults
            .filter((p) => p.notes.length > 0)
            .map((p) => (
              <p key={p.program} className="text-[11px] leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">{p.label}:</span> {p.notes.join(" ")}
              </p>
            ))}
        </div>
      )}
    </DashboardCard>
  );
}

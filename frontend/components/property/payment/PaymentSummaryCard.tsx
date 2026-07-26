import { Banknote, Building2, Home, Landmark, Percent, ShieldCheck } from "lucide-react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { MetricCard } from "@/components/shared/MetricCard";
import type { LoanProgramResult } from "@/lib/payment/types";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const currencyPrecise = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

interface PaymentSummaryCardProps {
  /** The featured program's computed breakdown — typically the first/primary selected program. */
  program: LoanProgramResult;
}

/**
 * The polished "client presentation" hero card — P&I / taxes / insurance /
 * HOA (only when present) / total, styled prominently via `MetricCard`'s
 * `emphasis` prop, same treatment the legacy
 * `components/property/PaymentsTab.tsx` calculator used for its "Estimated
 * Total Monthly Payment" row.
 */
export function PaymentSummaryCard({ program }: PaymentSummaryCardProps) {
  const mortgageInsuranceLabel = program.program === "fha" ? "Mortgage Insurance (MIP, est.)" : "PMI (est.)";

  return (
    <DashboardCard
      title={`Estimated Monthly Payment — ${program.label}`}
      action={{ label: `${program.termYears}-yr fixed at ${program.ratePercent}%` }}
    >
      <div className="space-y-2.5">
        <MetricCard
          label="Principal & Interest"
          value={currencyPrecise.format(program.monthlyPI)}
          icon={Home}
          sublabel={`Loan amount: ${currency.format(program.totalLoanAmount)}`}
        />
        <MetricCard label="Property Tax" value={currencyPrecise.format(program.monthlyTax)} icon={Landmark} />
        <MetricCard label="Home Insurance" value={currencyPrecise.format(program.monthlyInsurance)} icon={ShieldCheck} />
        {program.monthlyMortgageInsurance > 0 && (
          <MetricCard
            label={mortgageInsuranceLabel}
            value={currencyPrecise.format(program.monthlyMortgageInsurance)}
            icon={Percent}
            sublabel={program.program === "fha" ? "Annual MIP, illustrative" : "Applies since down payment is under 20%"}
          />
        )}
        {/* HOA is optional — never render a $0 row when the property has none. */}
        {program.monthlyHoa > 0 && (
          <MetricCard label="HOA" value={currencyPrecise.format(program.monthlyHoa)} icon={Building2} />
        )}
        <MetricCard
          label="Estimated Total Monthly Payment"
          value={currency.format(program.totalMonthly)}
          icon={Banknote}
          emphasis
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-5 text-sm sm:grid-cols-4">
        <div>
          <p className="text-xs text-muted-foreground">Down Payment</p>
          <p className="mt-0.5 font-semibold text-foreground">
            {currency.format(program.downPaymentAmount)} ({program.downPaymentPercent.toFixed(1)}%)
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Loan Amount</p>
          <p className="mt-0.5 font-semibold text-foreground">{currency.format(program.totalLoanAmount)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Loan Term</p>
          <p className="mt-0.5 font-semibold text-foreground">{program.termYears} years</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Interest Rate</p>
          <p className="mt-0.5 font-semibold text-foreground">{program.ratePercent}%</p>
        </div>
      </div>
    </DashboardCard>
  );
}

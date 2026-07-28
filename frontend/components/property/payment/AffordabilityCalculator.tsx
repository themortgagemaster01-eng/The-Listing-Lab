"use client";

import * as React from "react";
import { Home, TrendingUp, Wallet } from "lucide-react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { MetricCard } from "@/components/shared/MetricCard";
import { Input } from "@/components/ui/input";
import { parseNumberField } from "@/lib/flyer/mappers";
import { calculateAffordability } from "@/lib/payment/calculations";
import { emptyAffordabilityInput, type AffordabilityInput, type PaymentFormData } from "@/lib/payment/types";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const labelClass = "mb-1.5 block text-xs font-medium text-muted-foreground";

interface AffordabilityCalculatorProps {
  form: PaymentFormData;
  onChange: (next: PaymentFormData) => void;
}

/**
 * "How much can my buyer afford?" — the reverse of every other Mortgage
 * Center section (which start from a purchase price). Reuses the rate,
 * term, down payment %, and tax/insurance/HOA already entered in Payment
 * Calculator so estimates stay consistent across sections instead of
 * asking the Realtor to re-enter the same assumptions. See
 * `calculateAffordability` in `calculations.ts` for the underlying math
 * (the standard 28/36 debt-to-income guideline).
 */
export function AffordabilityCalculator({ form, onChange }: AffordabilityCalculatorProps) {
  const input: AffordabilityInput = form.affordability ?? emptyAffordabilityInput();
  const primaryRate = form.programs.conventional.ratePercent;

  const result = React.useMemo(
    () =>
      calculateAffordability(input, {
        ratePercent: parseNumberField(primaryRate) ?? 6.5,
        termYears: parseNumberField(form.loanTermYears) ?? 30,
        downPaymentPercent: parseNumberField(form.downPaymentPercent) ?? 20,
        annualPropertyTax: parseNumberField(form.propertyTaxAnnual) ?? 0,
        annualHomeInsurance: parseNumberField(form.homeInsuranceAnnual) ?? 0,
        monthlyHoa: parseNumberField(form.hoaMonthly) ?? 0,
      }),
    [
      input,
      primaryRate,
      form.loanTermYears,
      form.downPaymentPercent,
      form.propertyTaxAnnual,
      form.homeInsuranceAnnual,
      form.hoaMonthly,
    ]
  );

  function updateInput(patch: Partial<AffordabilityInput>) {
    onChange({ ...form, affordability: { ...input, ...patch } });
  }

  return (
    <div className="space-y-6">
      <DashboardCard title="Buyer Income & Debts">
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Buyer&apos;s Annual Income</label>
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                $
              </span>
              <Input
                inputMode="numeric"
                value={input.annualIncome}
                onChange={(e) => updateInput({ annualIncome: e.target.value })}
                placeholder="e.g. 120000"
                className="pl-7"
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Other Monthly Debts (car, student loans, credit cards)</label>
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                $
              </span>
              <Input
                inputMode="numeric"
                value={input.monthlyDebts}
                onChange={(e) => updateInput({ monthlyDebts: e.target.value })}
                placeholder="e.g. 450"
                className="pl-7"
              />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Uses the rate, term, down payment %, and tax/insurance/HOA already entered in Payment
            Calculator, so estimates stay consistent across every Mortgage Center section.
          </p>
        </div>
      </DashboardCard>

      <DashboardCard title="Estimated Affordability" action={{ label: "Based on the 28/36 rule" }}>
        {result.isAffordableAtAll ? (
          <div className="space-y-2.5">
            <MetricCard
              label="Max Monthly Housing Payment"
              value={currency.format(result.maxMonthlyHousingPayment)}
              icon={Wallet}
              sublabel="Capped at 28% of gross income, or 36% of income minus other debts — whichever is lower"
            />
            <MetricCard label="Max Loan Amount" value={currency.format(result.maxLoanAmount)} icon={TrendingUp} />
            <MetricCard
              label="Estimated Max Purchase Price"
              value={currency.format(result.maxPurchasePrice)}
              icon={Home}
              emphasis
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Enter the buyer&apos;s annual income above to see an estimated affordable purchase price.
            {result.monthlyDebts > 0 && result.monthlyIncome > 0
              ? " Current monthly debts leave little to no room under the 36% guideline — consider paying down debt first."
              : ""}
          </p>
        )}
      </DashboardCard>
    </div>
  );
}

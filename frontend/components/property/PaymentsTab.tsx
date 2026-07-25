"use client";

import * as React from "react";
import Image from "next/image";
import { Banknote, Home, Landmark, Percent, ShieldCheck, Sparkles } from "lucide-react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { MetricCard } from "@/components/shared/MetricCard";
import { ComingSoonButton } from "@/components/property/ComingSoonButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Property } from "@/types";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const currencyPrecise = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

interface PaymentsTabProps {
  property: Property;
}

/** Standard fixed-rate amortization formula for the monthly principal & interest payment. */
function calculateMonthlyPI(loanAmount: number, annualRatePercent: number, termYears: number) {
  const monthlyRate = annualRatePercent / 100 / 12;
  const numPayments = termYears * 12;
  if (numPayments <= 0) return 0;
  if (monthlyRate === 0) return loanAmount / numPayments;
  const factor = Math.pow(1 + monthlyRate, numPayments);
  return (loanAmount * (monthlyRate * factor)) / (factor - 1);
}

export function PaymentsTab({ property }: PaymentsTabProps) {
  const defaultPrice = property.price ?? 500000;
  const defaultTax = property.annualPropertyTax ?? Math.round(defaultPrice * 0.0125);
  const defaultInsurance = property.annualHomeInsurance ?? 1500;

  const [purchasePrice, setPurchasePrice] = React.useState(defaultPrice);
  const [downPaymentPercent, setDownPaymentPercent] = React.useState(20);
  const [interestRate, setInterestRate] = React.useState(6.5);
  const [propertyTaxAnnual, setPropertyTaxAnnual] = React.useState(defaultTax);
  const [homeInsuranceAnnual, setHomeInsuranceAnnual] = React.useState(defaultInsurance);
  const [loanTermYears, setLoanTermYears] = React.useState<15 | 30>(30);
  const [showSummary, setShowSummary] = React.useState(false);

  const downPaymentAmount = React.useMemo(
    () => (purchasePrice * downPaymentPercent) / 100,
    [purchasePrice, downPaymentPercent]
  );
  const loanAmount = Math.max(purchasePrice - downPaymentAmount, 0);

  const monthlyPI = React.useMemo(
    () => calculateMonthlyPI(loanAmount, interestRate, loanTermYears),
    [loanAmount, interestRate, loanTermYears]
  );
  const monthlyTax = propertyTaxAnnual / 12;
  const monthlyInsurance = homeInsuranceAnnual / 12;
  const monthlyPmi = downPaymentPercent < 20 ? (loanAmount * 0.005) / 12 : 0;
  const totalMonthly = monthlyPI + monthlyTax + monthlyInsurance + monthlyPmi;

  function handleDownPaymentAmountChange(amount: number) {
    if (purchasePrice <= 0) return;
    const percent = (amount / purchasePrice) * 100;
    setDownPaymentPercent(Math.min(Math.max(percent, 0), 100));
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
      <DashboardCard title="Loan Details">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Purchase Price</label>
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                $
              </span>
              <Input
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(Number(e.target.value) || 0)}
                className="pl-7"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Down Payment ($)</label>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  value={Math.round(downPaymentAmount)}
                  onChange={(e) => handleDownPaymentAmountChange(Number(e.target.value) || 0)}
                  className="pl-7"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Down Payment (%)</label>
              <div className="relative mt-1.5">
                <Input
                  type="number"
                  value={Number(downPaymentPercent.toFixed(1))}
                  onChange={(e) =>
                    setDownPaymentPercent(Math.min(Math.max(Number(e.target.value) || 0, 0), 100))
                  }
                  className="pr-7"
                />
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  %
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Interest Rate</label>
            <div className="relative mt-1.5">
              <Input
                type="number"
                step="0.125"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value) || 0)}
                className="pr-7"
              />
              <Percent className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Loan Term</label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {[30, 15].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setLoanTermYears(term as 15 | 30)}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                    loanTermYears === term
                      ? "border-gold-400 bg-gold-50 text-navy-800 dark:bg-gold-500/10 dark:text-gold-400"
                      : "border-border bg-background text-muted-foreground hover:border-gold-300"
                  }`}
                >
                  {term}-Year Fixed
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Property Tax / yr</label>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  value={propertyTaxAnnual}
                  onChange={(e) => setPropertyTaxAnnual(Number(e.target.value) || 0)}
                  className="pl-7"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Home Insurance / yr</label>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  value={homeInsuranceAnnual}
                  onChange={(e) => setHomeInsuranceAnnual(Number(e.target.value) || 0)}
                  className="pl-7"
                />
              </div>
            </div>
          </div>
        </div>
      </DashboardCard>

      <div className="space-y-6">
        <DashboardCard title="Estimated Monthly Payment">
          <div className="space-y-2.5">
            <MetricCard
              label="Principal & Interest"
              value={currencyPrecise.format(monthlyPI)}
              icon={Home}
              sublabel={`${loanTermYears}-yr fixed at ${interestRate}%`}
            />
            <MetricCard label="Property Tax" value={currencyPrecise.format(monthlyTax)} icon={Landmark} />
            <MetricCard
              label="Home Insurance"
              value={currencyPrecise.format(monthlyInsurance)}
              icon={ShieldCheck}
            />
            {monthlyPmi > 0 && (
              <MetricCard
                label="PMI (est.)"
                value={currencyPrecise.format(monthlyPmi)}
                icon={Percent}
                sublabel="Applies since down payment is under 20%"
              />
            )}
            <MetricCard
              label="Estimated Total Monthly Payment"
              value={currency.format(totalMonthly)}
              icon={Banknote}
              emphasis
            />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-5 text-sm sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Loan Amount</p>
              <p className="mt-0.5 font-semibold text-foreground">{currency.format(loanAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Down Payment</p>
              <p className="mt-0.5 font-semibold text-foreground">
                {currency.format(downPaymentAmount)} ({downPaymentPercent.toFixed(1)}%)
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Loan Term</p>
              <p className="mt-0.5 font-semibold text-foreground">{loanTermYears} years</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Interest Rate</p>
              <p className="mt-0.5 font-semibold text-foreground">{interestRate}%</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button type="button" variant="gold" size="lg" onClick={() => setShowSummary(true)}>
              <Sparkles className="h-4 w-4" />
              Generate Payment Sheet
            </Button>
          </div>
        </DashboardCard>

        {showSummary && (
          <DashboardCard className="overflow-hidden p-0">
            <div className="relative h-32 w-full sm:h-40">
              <Image
                src={property.imageUrl}
                alt={property.address}
                fill
                sizes="800px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-navy-950/60" />
              <div className="absolute inset-0 flex flex-col justify-center px-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">
                  Payment Snapshot
                </p>
                <h3 className="mt-1 font-display text-xl font-semibold text-white sm:text-2xl">
                  {property.address}
                </h3>
              </div>
            </div>
            <div className="space-y-4 p-6">
              <div className="flex items-baseline justify-between">
                <p className="text-sm text-muted-foreground">Estimated Monthly Payment</p>
                <p className="text-2xl font-bold text-navy-800 dark:text-gold-400">
                  {currency.format(totalMonthly)}/mo
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">Purchase Price</p>
                  <p className="font-semibold text-foreground">{currency.format(purchasePrice)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Down Payment</p>
                  <p className="font-semibold text-foreground">{currency.format(downPaymentAmount)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Rate / Term</p>
                  <p className="font-semibold text-foreground">
                    {interestRate}% / {loanTermYears}yr
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Prepared By</p>
                  <p className="font-semibold text-foreground">Robert Castro</p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-4">
                <p className="text-xs text-muted-foreground">
                  Movement Mortgage · Estimate only, not a commitment to lend.
                </p>
                <ComingSoonButton variant="outline" size="sm" message="PDF export is coming soon">
                  Download PDF
                </ComingSoonButton>
              </div>
            </div>
          </DashboardCard>
        )}
      </div>
    </div>
  );
}

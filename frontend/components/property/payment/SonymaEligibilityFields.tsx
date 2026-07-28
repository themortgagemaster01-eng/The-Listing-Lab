"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import type { SonymaEligibilityInput } from "@/lib/payment/types";
import { cn } from "@/lib/utils";

const labelClass = "mb-1.5 block text-xs font-medium text-muted-foreground";

interface FieldProps {
  label: string;
  className?: string;
  children: React.ReactNode;
}

function Field({ label, className, children }: FieldProps) {
  return (
    <div className={className}>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

interface SonymaEligibilityFieldsProps {
  value: SonymaEligibilityInput;
  onChange: (patch: Partial<SonymaEligibilityInput>) => void;
}

/**
 * Real SONYMA eligibility inputs, backed by user-entered figures rather
 * than a hardcoded county table (see `evaluateSonymaEligibility` in
 * `calculations.ts` for why). Extracted from `PaymentInputsForm.tsx` so it
 * can live in its own "SONYMA / DPA" Mortgage Center section
 * (`SonymaEligibilityCard.tsx`) instead of being buried inline under the
 * loan-program comparison list.
 */
export function SonymaEligibilityFields({ value, onChange }: SonymaEligibilityFieldsProps) {
  return (
    <div className="space-y-3 rounded-lg border border-gold-200 bg-background p-3 dark:border-gold-500/30">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Eligibility Check</p>

      <label className="flex cursor-pointer items-start gap-2">
        <input
          type="checkbox"
          checked={value.isEligibleBuyerType}
          onChange={(e) => onChange({ isEligibleBuyerType: e.target.checked })}
          className="mt-0.5 h-3.5 w-3.5 rounded border-border accent-gold-500"
        />
        <span className="text-[11px] leading-relaxed text-muted-foreground">
          Buyer is a first-time homebuyer, or purchasing in a designated SONYMA target area
        </span>
      </label>

      <Field label="Household Size">
        <div className="grid grid-cols-2 gap-1.5">
          {(["1-2", "3+"] as const).map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => onChange({ householdSize: size })}
              className={cn(
                "rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors",
                value.householdSize === size
                  ? "border-gold-400 bg-gold-50 text-navy-800 dark:bg-gold-500/10 dark:text-gold-400"
                  : "border-border bg-background text-muted-foreground hover:border-gold-300"
              )}
            >
              {size}-person household
            </button>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Household Income / yr">
          <Input
            inputMode="numeric"
            value={value.annualIncome}
            onChange={(e) => onChange({ annualIncome: e.target.value })}
            placeholder="e.g. 95000"
            className="h-9 text-sm"
          />
        </Field>
        <Field label="County Income Limit">
          <Input
            inputMode="numeric"
            value={value.countyIncomeLimit}
            onChange={(e) => onChange({ countyIncomeLimit: e.target.value })}
            placeholder="Look up county"
            className="h-9 text-sm"
          />
        </Field>
      </div>

      <Field label="County Purchase Price Limit">
        <Input
          inputMode="numeric"
          value={value.countyPurchasePriceLimit}
          onChange={(e) => onChange({ countyPurchasePriceLimit: e.target.value })}
          placeholder="Look up county"
          className="h-9 text-sm"
        />
      </Field>

      <a
        href="https://hcr.ny.gov/income-limits"
        target="_blank"
        rel="noreferrer"
        className="inline-block text-[11px] font-medium text-gold-600 underline underline-offset-2 hover:text-gold-700 dark:text-gold-400"
      >
        View current SONYMA income &amp; purchase price limits by county →
      </a>
    </div>
  );
}

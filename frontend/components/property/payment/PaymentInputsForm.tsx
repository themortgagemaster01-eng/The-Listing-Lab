"use client";

import * as React from "react";
import { Percent } from "lucide-react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { Input } from "@/components/ui/input";
import { FlyerAutoSaveIndicator, type SaveStatus } from "@/components/property/flyer/FlyerAutoSaveIndicator";
import { parseNumberField } from "@/lib/flyer/mappers";
import { LOAN_PROGRAM_DESCRIPTIONS, LOAN_PROGRAM_LABELS, type LoanProgram, type PaymentFormData } from "@/lib/payment/types";
import { cn } from "@/lib/utils";

const ALL_PROGRAMS: LoanProgram[] = ["conventional", "fha", "va", "homestyle", "sonyma"];

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

interface PaymentInputsFormProps {
  form: PaymentFormData;
  onChange: (next: PaymentFormData) => void;
  saveStatus: SaveStatus;
}

/**
 * Purchase price / down payment / taxes / insurance / HOA / loan term +
 * loan program picker (Phase — Payment Snapshot spec item #5). Down payment
 * $ and % stay two-way synced exactly like the legacy
 * `components/property/PaymentsTab.tsx` calculator did. Every field
 * auto-saves via the parent's debounced persistence; there is no explicit
 * Save button (mirrors `FlyerPropertyForm.tsx`).
 */
export function PaymentInputsForm({ form, onChange, saveStatus }: PaymentInputsFormProps) {
  function setPurchasePrice(value: string) {
    const price = parseNumberField(value) ?? 0;
    const percent = parseNumberField(form.downPaymentPercent) ?? 0;
    const amount = (price * percent) / 100;
    onChange({ ...form, purchasePrice: value, downPaymentAmount: String(Math.round(amount)) });
  }

  function setDownPaymentAmount(value: string) {
    const price = parseNumberField(form.purchasePrice) ?? 0;
    const amount = parseNumberField(value) ?? 0;
    const percent = price > 0 ? Math.min(Math.max((amount / price) * 100, 0), 100) : parseNumberField(form.downPaymentPercent) ?? 0;
    onChange({ ...form, downPaymentAmount: value, downPaymentPercent: percent.toFixed(1) });
  }

  function setDownPaymentPercent(value: string) {
    const price = parseNumberField(form.purchasePrice) ?? 0;
    const percent = Math.min(Math.max(parseNumberField(value) ?? 0, 0), 100);
    const amount = (price * percent) / 100;
    // Store the clamped value (not the raw keystroke) so the displayed
    // percent always matches the amount it produced — mirrors the legacy
    // `PaymentsTab.tsx` calculator, which clamped on every change too.
    onChange({ ...form, downPaymentPercent: String(percent), downPaymentAmount: String(Math.round(amount)) });
  }

  function toggleProgram(program: LoanProgram) {
    if (program === "conventional") return; // Conventional is always on — every snapshot needs a baseline column.
    onChange({
      ...form,
      programs: {
        ...form.programs,
        [program]: { ...form.programs[program], enabled: !form.programs[program].enabled },
      },
    });
  }

  function setProgramRate(program: LoanProgram, rate: string) {
    onChange({
      ...form,
      programs: { ...form.programs, [program]: { ...form.programs[program], ratePercent: rate } },
    });
  }

  return (
    <DashboardCard title="Payment Inputs" className="relative" contentClassName="mt-4 space-y-5">
      <div className="absolute right-5 top-5">
        <FlyerAutoSaveIndicator status={saveStatus} />
      </div>

      <div>
        <label className={labelClass}>Purchase Price</label>
        <div className="relative mt-1.5">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
          <Input
            inputMode="numeric"
            value={form.purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            placeholder="725000"
            className="pl-7"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Down Payment ($)">
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
            <Input
              inputMode="numeric"
              value={form.downPaymentAmount}
              onChange={(e) => setDownPaymentAmount(e.target.value)}
              className="pl-7"
            />
          </div>
        </Field>
        <Field label="Down Payment (%)">
          <div className="relative">
            <Input
              inputMode="numeric"
              value={form.downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(e.target.value)}
              className="pr-7"
            />
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
          </div>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Property Tax / yr">
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
            <Input
              inputMode="numeric"
              value={form.propertyTaxAnnual}
              onChange={(e) => onChange({ ...form, propertyTaxAnnual: e.target.value })}
              className="pl-7"
            />
          </div>
        </Field>
        <Field label="Home Insurance / yr">
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
            <Input
              inputMode="numeric"
              value={form.homeInsuranceAnnual}
              onChange={(e) => onChange({ ...form, homeInsuranceAnnual: e.target.value })}
              className="pl-7"
            />
          </div>
        </Field>
      </div>

      <Field label="HOA / mo (optional — leave blank if none)">
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
          <Input
            inputMode="numeric"
            value={form.hoaMonthly}
            onChange={(e) => onChange({ ...form, hoaMonthly: e.target.value })}
            placeholder="None"
            className="pl-7"
          />
        </div>
      </Field>

      <div>
        <label className={labelClass}>Loan Term</label>
        <div className="mt-1.5 grid grid-cols-2 gap-2">
          {[30, 15].map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => onChange({ ...form, loanTermYears: String(term) })}
              className={cn(
                "rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                Number(form.loanTermYears) === term
                  ? "border-gold-400 bg-gold-50 text-navy-800 dark:bg-gold-500/10 dark:text-gold-400"
                  : "border-border bg-background text-muted-foreground hover:border-gold-300"
              )}
            >
              {term}-Year Fixed
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Loan Programs to Compare
        </p>
        <div className="space-y-2.5">
          {ALL_PROGRAMS.map((program) => {
            const config = form.programs[program];
            const isConventional = program === "conventional";
            return (
              <div
                key={program}
                className={cn(
                  "rounded-xl border p-3 transition-colors",
                  config.enabled ? "border-gold-300 bg-gold-50 dark:border-gold-500/40 dark:bg-gold-500/10" : "border-border bg-background"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <label className="flex flex-1 cursor-pointer items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={config.enabled}
                      disabled={isConventional}
                      onChange={() => toggleProgram(program)}
                      className="mt-0.5 h-4 w-4 rounded border-border accent-gold-500 disabled:opacity-60"
                    />
                    <span>
                      <span className="block text-sm font-medium text-foreground">
                        {LOAN_PROGRAM_LABELS[program]}
                        {isConventional && <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">(always shown)</span>}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-muted-foreground">{LOAN_PROGRAM_DESCRIPTIONS[program]}</span>
                    </span>
                  </label>
                  {config.enabled && (
                    <div className="relative w-24 shrink-0">
                      <Input
                        inputMode="decimal"
                        value={config.ratePercent}
                        onChange={(e) => setProgramRate(program, e.target.value)}
                        className="h-9 pr-6 text-sm"
                      />
                      <Percent className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardCard>
  );
}

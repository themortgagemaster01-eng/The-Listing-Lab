"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { SonymaEligibilityFields } from "@/components/property/payment/SonymaEligibilityFields";
import { parseNumberField } from "@/lib/flyer/mappers";
import { evaluateSonymaEligibility } from "@/lib/payment/calculations";
import {
  emptySonymaEligibilityInput,
  type PaymentFormData,
  type SonymaEligibilityInput,
} from "@/lib/payment/types";

interface SonymaEligibilityCardProps {
  form: PaymentFormData;
  onChange: (next: PaymentFormData) => void;
}

/**
 * Dedicated "SONYMA / DPA" Mortgage Center section — combines the
 * eligibility-input fields (`SonymaEligibilityFields`, extracted from
 * `PaymentInputsForm.tsx`) with the live computed verdict
 * (`evaluateSonymaEligibility`) and a toggle to include SONYMA in the
 * Compare Loan Options table, so a Realtor can check eligibility here
 * without first hunting for the SONYMA checkbox buried in the loan-program
 * list.
 */
export function SonymaEligibilityCard({ form, onChange }: SonymaEligibilityCardProps) {
  const eligibility = form.sonymaEligibility ?? emptySonymaEligibilityInput();
  const purchasePrice = parseNumberField(form.purchasePrice) ?? 0;
  const notes = evaluateSonymaEligibility(eligibility, purchasePrice);
  const sonymaEnabled = form.programs.sonyma.enabled;

  function updateEligibility(patch: Partial<SonymaEligibilityInput>) {
    onChange({ ...form, sonymaEligibility: { ...eligibility, ...patch } });
  }

  function toggleSonymaProgram() {
    onChange({
      ...form,
      programs: { ...form.programs, sonyma: { ...form.programs.sonyma, enabled: !sonymaEnabled } },
    });
  }

  return (
    <div className="space-y-6">
      <DashboardCard title="SONYMA / Down Payment Assistance">
        <p className="text-sm text-muted-foreground">
          NY State down-payment assistance for eligible buyers. Enter your buyer&apos;s numbers and
          your county&apos;s current limits below to check eligibility.
        </p>

        <label className="mt-4 flex cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-background p-3">
          <input
            type="checkbox"
            checked={sonymaEnabled}
            onChange={toggleSonymaProgram}
            className="h-4 w-4 rounded border-border accent-gold-500"
          />
          <span className="text-sm font-medium text-foreground">Include SONYMA in Compare Loan Options</span>
        </label>

        <div className="mt-4">
          <SonymaEligibilityFields value={eligibility} onChange={updateEligibility} />
        </div>
      </DashboardCard>

      <DashboardCard title="Eligibility Read">
        <ul className="space-y-2.5">
          {notes.map((note, i) => {
            const isWarning = /not eligible|exceed/i.test(note);
            const Icon = isWarning ? AlertTriangle : CheckCircle2;
            return (
              <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${isWarning ? "text-red-500" : "text-emerald-500"}`} />
                <span>{note}</span>
              </li>
            );
          })}
        </ul>
      </DashboardCard>
    </div>
  );
}

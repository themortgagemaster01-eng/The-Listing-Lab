"use client";

import { Suspense } from "react";

import { PaymentSnapshotWizard } from "@/components/property/payment/PaymentSnapshotWizard";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import type { Property } from "@/types";

interface PaymentToolsTabProps {
  property: Property;
}

/**
 * Mortgage Center tab host. Previously split "Payments" and "Closing
 * Costs" into a segmented control backed by two separate, disagreeing
 * calculators (`PaymentsTab` + `ClosingCostsTab` — now superseded/unused,
 * kept in the repo only for reference), then briefly consolidated into one
 * single scrollable page. `PaymentSnapshotWizard` now IS Mortgage Center
 * proper: a modular collection of six calculators (Payment Calculator,
 * Compare Loan Options, Cash to Close, Affordability, SONYMA/DPA, Share/
 * Export) navigated via a tab bar, sharing one set of purchase inputs.
 *
 * Wrapped in Suspense because that tab bar (`MortgageCenterNav.tsx`) reads/
 * writes the active section via `useSearchParams()` — same requirement as
 * `LoginForm.tsx`'s `?redirectTo=` handling in `src/app/login/page.tsx`.
 */
export function PaymentToolsTab({ property }: PaymentToolsTabProps) {
  return (
    <Suspense fallback={<LoadingSkeleton className="h-96 w-full rounded-2xl" />}>
      <PaymentSnapshotWizard property={property} />
    </Suspense>
  );
}

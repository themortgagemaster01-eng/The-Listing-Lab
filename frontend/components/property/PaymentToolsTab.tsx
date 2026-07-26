"use client";

import { PaymentSnapshotWizard } from "@/components/property/payment/PaymentSnapshotWizard";
import type { Property } from "@/types";

interface PaymentToolsTabProps {
  property: Property;
  /**
   * Kept for backwards-compat with the page.tsx `?section=` query param the
   * old Payments/Closing Costs segmented control used — no longer branches
   * on anything since the Payment Snapshot wizard folds both into one page
   * (one source of truth for "what will this cost the buyer" instead of two
   * calculators that could disagree).
   */
  initialSection?: string;
}

/**
 * Payment Tools tab host. Previously split "Payments" and "Closing Costs"
 * into a segmented control backed by two separate, disagreeing calculators
 * (`PaymentsTab` + `ClosingCostsTab` — now superseded/unused, kept in the
 * repo only for reference). The Payment Snapshot wizard
 * (`components/property/payment/PaymentSnapshotWizard.tsx`) replaces both
 * with a single client-presentation-ready page: payment inputs, a
 * multi-loan-program comparison, a cash-to-close breakdown (which absorbs
 * the old Closing Costs tab's NY-specific line items), and PDF export.
 */
export function PaymentToolsTab({ property }: PaymentToolsTabProps) {
  return <PaymentSnapshotWizard property={property} />;
}

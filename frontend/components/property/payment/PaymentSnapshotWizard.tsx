"use client";

import * as React from "react";

import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { FlyerAutoSaveIndicator, type SaveStatus } from "@/components/property/flyer/FlyerAutoSaveIndicator";
import { PaymentInputsForm } from "@/components/property/payment/PaymentInputsForm";
import { PaymentSummaryCard } from "@/components/property/payment/PaymentSummaryCard";
import { LoanComparisonTable } from "@/components/property/payment/LoanComparisonTable";
import { CashToCloseCard } from "@/components/property/payment/CashToCloseCard";
import { PaymentExportPanel } from "@/components/property/payment/PaymentExportPanel";
import * as flyerPersistence from "@/lib/flyer/persistence";
import { seedFormFromProperty } from "@/lib/flyer/mappers";
import type { PropertyFormData } from "@/lib/flyer/types";
import * as paymentPersistence from "@/lib/payment/persistence";
import { buildPaymentSnapshotResults } from "@/lib/payment/calculations";
import { emptyPaymentForm, type PaymentSnapshotRecord } from "@/lib/payment/types";
import { loadBrandProfile } from "@/lib/brand/persistence";
import { emptyBrandProfileForm, type BrandProfileFormData } from "@/lib/brand/types";
import { useDebouncedSave } from "@/lib/hooks/use-debounced-save";
import type { Property } from "@/types";

interface PaymentSnapshotWizardProps {
  property: Property;
}

function newSnapshotId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `payment-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Seeds a brand-new snapshot's inputs from the property's own defaults, mirroring the legacy `PaymentsTab.tsx` calculator's starting values. */
function createDraftSnapshot(property: Property): PaymentSnapshotRecord {
  const id = newSnapshotId();
  const now = new Date().toISOString();
  const defaultPrice = property.price ?? 500000;
  const defaultTax = property.annualPropertyTax ?? Math.round(defaultPrice * 0.0125);
  const defaultInsurance = property.annualHomeInsurance ?? 1500;
  const defaultDownPercent = 20;

  return {
    id,
    marketingAssetId: id,
    propertyId: property.id,
    title: property.address || "Untitled Payment Snapshot",
    inputs: emptyPaymentForm({
      purchasePrice: String(defaultPrice),
      downPaymentAmount: String(Math.round((defaultPrice * defaultDownPercent) / 100)),
      downPaymentPercent: String(defaultDownPercent),
      propertyTaxAnnual: String(defaultTax),
      homeInsuranceAnnual: String(defaultInsurance),
    }),
    results: null,
    pdfUrl: null,
    status: "draft",
    version: 1,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Top-level Payment Snapshot page: inputs → summary → comparison →
 * cash-to-close → export, all on one scrollable page (a single
 * well-organized page reads better here than the Flyer Generator's
 * multi-step wizard — there's no AI-copy step or template gallery to
 * sequence). Owns persistence the same way `FlyerGeneratorWizard.tsx`
 * does: debounced auto-save through `src/lib/payment/persistence.ts`,
 * identical behavior whether Supabase is configured or not.
 *
 * Property/agent info (address, price, agent name/email/phone/photo/
 * application link) is read from the SAME property form the Flyer
 * Studio edits (`src/lib/flyer/persistence.ts` `loadPropertyForm`) —
 * one source of truth for property data, edited in one place
 * (Marketing Assets → Flyers → Details), consumed read-only here.
 *
 * NMLS number / mortgage company / licensed states are read, read-only, from
 * the account-level Brand Center profile (`src/lib/brand/persistence.ts`)
 * — the "Mortgage (optional)" section built specifically to power this —
 * rather than duplicated into per-property inputs.
 */
export function PaymentSnapshotWizard({ property }: PaymentSnapshotWizardProps) {
  const propertyId = property.id;
  const [loaded, setLoaded] = React.useState(false);
  const [propertyForm, setPropertyForm] = React.useState<PropertyFormData>(() => seedFormFromProperty(property));
  const [snapshot, setSnapshot] = React.useState<PaymentSnapshotRecord | null>(null);
  const [allSnapshots, setAllSnapshots] = React.useState<PaymentSnapshotRecord[]>([]);
  const [brandProfile, setBrandProfile] = React.useState<BrandProfileFormData>(() => emptyBrandProfileForm());

  const snapshotsRef = React.useRef(allSnapshots);
  React.useEffect(() => {
    snapshotsRef.current = allSnapshots;
  }, [allSnapshots]);

  // ---- initial load ----
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const [savedPropertyForm, savedSnapshots, savedBrandProfile] = await Promise.all([
        flyerPersistence.loadPropertyForm(propertyId),
        paymentPersistence.loadPaymentSnapshots(propertyId),
        loadBrandProfile(),
      ]);
      if (cancelled) return;

      setPropertyForm(savedPropertyForm ?? seedFormFromProperty(property));
      setBrandProfile(savedBrandProfile);

      if (savedSnapshots.length > 0) {
        setAllSnapshots(savedSnapshots);
        setSnapshot(savedSnapshots[0]);
      } else {
        const draft = createDraftSnapshot(property);
        setAllSnapshots([draft]);
        setSnapshot(draft);
      }
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
    // Intentionally only depends on propertyId — re-running on every `property` object identity change would clobber in-progress edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  const activeInputs = snapshot?.inputs ?? null;
  const results = React.useMemo(
    () => (activeInputs ? buildPaymentSnapshotResults(activeInputs) : null),
    [activeInputs]
  );

  function updateInputs(nextInputs: PaymentSnapshotRecord["inputs"]) {
    setSnapshot((prev) => (prev ? { ...prev, inputs: nextInputs } : prev));
  }

  // ---- auto-save: payment snapshot inputs (+ freshly computed results) ----
  const saveStatus: SaveStatus = useDebouncedSave(
    snapshot?.inputs ?? null,
    async (inputs) => {
      if (!snapshot || !inputs) return;
      const computedResults = buildPaymentSnapshotResults(inputs);
      const updated: PaymentSnapshotRecord = {
        ...snapshot,
        inputs,
        results: computedResults,
        title: propertyForm.address || snapshot.title,
        updatedAt: new Date().toISOString(),
      };
      const nextAll = snapshotsRef.current.some((s) => s.id === updated.id)
        ? snapshotsRef.current.map((s) => (s.id === updated.id ? updated : s))
        : [updated, ...snapshotsRef.current];
      setSnapshot(updated);
      setAllSnapshots(nextAll);
      await paymentPersistence.savePaymentSnapshot(propertyId, updated, nextAll);
    },
    { enabled: loaded && !!snapshot, delay: 700 }
  );

  if (!loaded || !snapshot || !results) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton className="h-12 w-full rounded-2xl" />
        <LoadingSkeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const primary = results.programResults[0];
  const heroPhotoUrl = property.imageUrl || null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Payment Snapshot</h2>
          <p className="text-sm text-muted-foreground">
            A polished, client-ready payment comparison you can email to a buyer.
          </p>
        </div>
        <FlyerAutoSaveIndicator status={saveStatus} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
        <PaymentInputsForm form={snapshot.inputs} onChange={updateInputs} saveStatus={saveStatus} />

        <div className="space-y-6">
          {primary && <PaymentSummaryCard program={primary} />}
          <LoanComparisonTable programResults={results.programResults} />
          <CashToCloseCard
            closingCosts={results.closingCosts}
            totalClosingCosts={results.totalClosingCosts}
            programResults={results.programResults}
          />
          <PaymentExportPanel
            property={propertyForm}
            heroPhotoUrl={heroPhotoUrl}
            results={results}
            brandProfile={brandProfile}
          />
        </div>
      </div>
    </div>
  );
}

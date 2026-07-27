"use client";

import * as React from "react";
import { AlertTriangle, Download, Loader2 } from "lucide-react";

import { PaymentSummaryCard } from "@/components/property/payment/PaymentSummaryCard";
import { LoanComparisonTable } from "@/components/property/payment/LoanComparisonTable";
import { Button } from "@/components/ui/button";
import { buildPaymentSnapshotResults } from "@/lib/payment/calculations";
import { PAYMENT_SNAPSHOT_DISCLAIMER, type PaymentFormData } from "@/lib/payment/types";
import { generatePaymentSnapshotPdfBlob } from "@/lib/pdf/generatePaymentSnapshotPdfBlob";
import { downloadBlob } from "@/lib/pdf/generateFlyerPdfBlob";
import type { PropertyFormData } from "@/lib/flyer/types";

interface PublicPaymentSnapshotSectionProps {
  inputs: PaymentFormData;
  property: PropertyFormData;
  heroPhotoUrl: string | null;
}

/**
 * The public site's interactive Payment Snapshot widget — the one piece of
 * client-side JS on an otherwise fully server-rendered marketing page (see
 * `src/app/site/[slug]/page.tsx`'s header comment on why this stays a
 * Server Component everywhere else). Computes live results from the
 * snapshot's saved `inputs` via `buildPaymentSnapshotResults` — the exact
 * same pure function the real Payment Snapshot feature uses — so the
 * numbers a home buyer sees here can never drift from what the Realtor
 * built. Reuses `PaymentSummaryCard`/`LoanComparisonTable` directly (both
 * are plain presentational components with no client-only dependencies)
 * rather than a second, parallel set of components.
 */
export function PublicPaymentSnapshotSection({ inputs, property, heroPhotoUrl }: PublicPaymentSnapshotSectionProps) {
  const [downloading, setDownloading] = React.useState(false);
  const [downloadError, setDownloadError] = React.useState<string | null>(null);

  const results = React.useMemo(() => buildPaymentSnapshotResults(inputs), [inputs]);
  const primary = results.programResults[0] ?? null;

  async function handleDownload() {
    setDownloading(true);
    setDownloadError(null);
    try {
      const blob = await generatePaymentSnapshotPdfBlob({ property, heroPhotoUrl, results });
      const filename = `${(property.address || "listing").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-payment-snapshot.pdf`;
      downloadBlob(blob, filename);
    } catch {
      setDownloadError("Couldn't generate the PDF — please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-5">
      {primary && <PaymentSummaryCard program={primary} />}
      <LoanComparisonTable programResults={results.programResults} />

      <p className="rounded-xl border border-border bg-background px-4 py-3 text-xs leading-relaxed text-muted-foreground">
        {PAYMENT_SNAPSHOT_DISCLAIMER} Contact {property.agentName || "your agent"} for an accurate, personalized quote.
      </p>

      {downloadError && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-red-500">
          <AlertTriangle className="h-3.5 w-3.5" />
          {downloadError}
        </p>
      )}

      <Button
        type="button"
        variant="gold"
        size="lg"
        onClick={handleDownload}
        disabled={downloading || !primary}
        className="focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2"
      >
        {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        {downloading ? "Preparing PDF…" : "Download Branded PDF"}
      </Button>
    </div>
  );
}

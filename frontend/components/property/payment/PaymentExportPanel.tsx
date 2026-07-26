"use client";

import * as React from "react";
import Image from "next/image";
import { AlertTriangle, Download, Loader2 } from "lucide-react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { Button } from "@/components/ui/button";
import { generatePaymentSnapshotPdfBlob } from "@/lib/pdf/generatePaymentSnapshotPdfBlob";
import { downloadBlob } from "@/lib/pdf/generateFlyerPdfBlob";
import type { PropertyFormData } from "@/lib/flyer/types";
import { PAYMENT_SNAPSHOT_DISCLAIMER, type PaymentSnapshotResults } from "@/lib/payment/types";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

interface PaymentExportPanelProps {
  property: PropertyFormData;
  heroPhotoUrl: string | null;
  results: PaymentSnapshotResults;
}

/**
 * Live preview + "Download PDF" — mirrors `FlyerExportPanel.tsx`'s
 * structure/states exactly (`downloading`/`downloadError`, same
 * "Preparing PDF…" button copy). The disclaimer required by the feature
 * spec is shown here on-screen (in addition to the PDF footer — see
 * `PaymentSnapshotPdfDocument.tsx`) so a Realtor never presents this
 * without it, whether or not they ever export the PDF.
 */
export function PaymentExportPanel({ property, heroPhotoUrl, results }: PaymentExportPanelProps) {
  const [downloading, setDownloading] = React.useState(false);
  const [downloadError, setDownloadError] = React.useState<string | null>(null);

  const primary = results.programResults[0] ?? null;

  async function handleDownload() {
    if (!primary) return;
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
    <DashboardCard title="Preview & Export" contentClassName="mt-4 space-y-5">
      <div className="mx-auto max-w-md overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
        <div className="relative h-32 w-full sm:h-40">
          {heroPhotoUrl ? (
            <Image src={heroPhotoUrl} alt={property.address || "Property"} fill sizes="480px" className="object-cover" />
          ) : (
            <div className="h-full w-full bg-navy-900" />
          )}
          <div className="absolute inset-0 bg-navy-950/60" />
          <div className="absolute inset-0 flex flex-col justify-center px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">Payment Snapshot</p>
            <h3 className="mt-1 font-display text-xl font-semibold text-white sm:text-2xl">
              {property.address || "Untitled Property"}
            </h3>
          </div>
        </div>
        <div className="space-y-3 p-5">
          {primary ? (
            <>
              <div className="flex items-baseline justify-between">
                <p className="text-sm text-muted-foreground">Est. Monthly Payment ({primary.label})</p>
                <p className="text-2xl font-bold text-navy-800 dark:text-gold-400">
                  {currency.format(primary.totalMonthly)}/mo
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">Down Payment</p>
                  <p className="font-semibold text-foreground">{currency.format(primary.downPaymentAmount)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Rate / Term</p>
                  <p className="font-semibold text-foreground">
                    {primary.ratePercent}% / {primary.termYears}yr
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cash to Close</p>
                  <p className="font-semibold text-foreground">{currency.format(primary.cashToClose)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Prepared By</p>
                  <p className="font-semibold text-foreground">{property.agentName || "—"}</p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Add payment inputs to see a preview.</p>
          )}
        </div>
      </div>

      <p className="rounded-xl border border-border bg-background px-4 py-3 text-xs leading-relaxed text-muted-foreground">
        {PAYMENT_SNAPSHOT_DISCLAIMER} Contact {property.agentName || "your agent"} for an accurate, personalized quote.
      </p>

      {downloadError && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-red-500">
          <AlertTriangle className="h-3.5 w-3.5" />
          {downloadError}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="gold"
          size="lg"
          onClick={handleDownload}
          disabled={downloading || !primary}
          className="flex-1 sm:flex-initial"
        >
          {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {downloading ? "Preparing PDF…" : "Download PDF"}
        </Button>
      </div>
    </DashboardCard>
  );
}

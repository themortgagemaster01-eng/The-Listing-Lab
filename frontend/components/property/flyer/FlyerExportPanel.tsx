"use client";

import * as React from "react";
import { AlertTriangle, Download, Loader2, RotateCcw } from "lucide-react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import { FlyerLivePreview } from "@/components/property/flyer/FlyerLivePreview";
import { generateFlyerPdfBlob, downloadBlob } from "@/lib/pdf/generateFlyerPdfBlob";
import type { FlyerPhoto, FlyerRecord, PropertyFormData } from "@/lib/flyer/types";
import { resolveFlyerText } from "@/lib/flyer/types";

interface FlyerExportPanelProps {
  form: PropertyFormData;
  photos: FlyerPhoto[];
  flyer: FlyerRecord;
  onStartOver: () => void;
}

/** Template preview + PDF export + "start over" (Phase 2 spec items #5/#6). */
export function FlyerExportPanel({ form, photos, flyer, onStartOver }: FlyerExportPanelProps) {
  const [downloading, setDownloading] = React.useState(false);
  const [downloadError, setDownloadError] = React.useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const text = resolveFlyerText(flyer);

  async function handleDownload() {
    if (!text) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      const blob = await generateFlyerPdfBlob({ form, photos, flyer, text });
      const filename = `${(form.address || "listing").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-flyer.pdf`;
      downloadBlob(blob, filename);
    } catch {
      setDownloadError("Couldn't generate the PDF — please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <DashboardCard title="Preview & Export" contentClassName="mt-4 space-y-5">
      <div className="mx-auto max-w-md">
        <FlyerLivePreview template={flyer.template} form={form} photos={photos} text={text} />
      </div>

      {downloadError && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-red-500">
          <AlertTriangle className="h-3.5 w-3.5" />
          {downloadError}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="gold" size="lg" onClick={handleDownload} disabled={downloading || !text} className="flex-1 sm:flex-initial">
          {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {downloading ? "Preparing PDF…" : "Download PDF"}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => setConfirmOpen(true)}>
          <RotateCcw className="h-4 w-4" />
          Start Over
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Version {flyer.version} · {flyer.history.length > 0 ? `${flyer.history.length} earlier version${flyer.history.length === 1 ? "" : "s"} kept` : "First generation"}
      </p>

      <Modal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Start a new flyer?"
        description="This creates a brand-new flyer for this property. Your property details and photos are kept — only the AI copy, template choice, and this flyer's history reset."
      >
        <div className="mt-4 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={() => {
              setConfirmOpen(false);
              onStartOver();
            }}
          >
            Start New Flyer
          </Button>
        </div>
      </Modal>
    </DashboardCard>
  );
}

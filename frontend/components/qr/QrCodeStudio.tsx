"use client";

import * as React from "react";
import { Check, Download, Link2, QrCode as QrCodeIcon } from "lucide-react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/shared/Toast";
import { downloadBlob } from "@/lib/pdf/generateFlyerPdfBlob";
import { buildPropertyQrUrl } from "@/lib/pdf/qrcode";
import { generateQrPngDataUrl, generateQrSvgMarkup } from "@/lib/qr/generate";
import { properties } from "@/lib/mock-data";

type Mode = "custom" | "property";

function slugifyFilename(text: string): string {
  return (
    text
      .replace(/^https?:\/\//, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "qr-code"
  );
}

/**
 * QR Code Studio — the standalone QR generator promised by the dashboard
 * Toolbox's "Property Marketing" category and the sidebar's "QR Codes" nav
 * item (both previously dead links / `comingSoon` tiles). Unlike the
 * decorative, non-scannable placeholder in `components/property/QrCodesTab.tsx`
 * (a per-property tab, left as-is — separate concern), this generates a
 * real, scannable QR code client-side via the `qrcode` package already used
 * elsewhere in the app (`src/lib/pdf/qrcode.ts`, `WebsiteGeneratorWizard.tsx`).
 *
 * Two ways to pick a destination:
 *  - Custom Link: paste any URL (a published property website, a mortgage
 *    application link, anything) — the primary, always-available mode.
 *  - From a Property: quick-fill with one of the demo Property Labs'
 *    internal workspace link (`buildPropertyQrUrl`). Deliberately NOT
 *    guessing at a public `/site/{slug}` URL for these, since most demo
 *    properties don't have a real published website — that would be
 *    fabricating a link that doesn't resolve to real content.
 */
export function QrCodeStudio() {
  const { showToast } = useToast();
  const [mode, setMode] = React.useState<Mode>("custom");
  const [customUrl, setCustomUrl] = React.useState("");
  const [selectedPropertyId, setSelectedPropertyId] = React.useState(properties[0]?.id ?? "");
  const [caption, setCaption] = React.useState("");
  const [pngDataUrl, setPngDataUrl] = React.useState<string | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const destination =
    mode === "custom" ? customUrl.trim() : buildPropertyQrUrl(selectedPropertyId || properties[0]?.id || "");

  const selectedProperty = properties.find((p) => p.id === selectedPropertyId);

  React.useEffect(() => {
    if (!destination) {
      setPngDataUrl(null);
      return;
    }
    let cancelled = false;
    setIsGenerating(true);
    generateQrPngDataUrl(destination)
      .then((dataUrl) => {
        if (!cancelled) setPngDataUrl(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setPngDataUrl(null);
      })
      .finally(() => {
        if (!cancelled) setIsGenerating(false);
      });
    return () => {
      cancelled = true;
    };
  }, [destination]);

  async function handleDownloadPng() {
    if (!destination) return;
    const dataUrl = pngDataUrl ?? (await generateQrPngDataUrl(destination));
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    downloadBlob(blob, `${slugifyFilename(destination)}-qr.png`);
    showToast("QR code downloaded.");
  }

  async function handleDownloadSvg() {
    if (!destination) return;
    const svg = await generateQrSvgMarkup(destination);
    const blob = new Blob([svg], { type: "image/svg+xml" });
    downloadBlob(blob, `${slugifyFilename(destination)}-qr.svg`);
    showToast("QR code (SVG) downloaded.");
  }

  async function handleCopyLink() {
    if (!destination) return;
    try {
      await navigator.clipboard.writeText(destination);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Couldn't copy — select and copy the link manually.");
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start lg:gap-8">
      <div className="space-y-6 lg:col-span-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-800 dark:text-white">QR Code Studio</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate a real, scannable QR code for a yard sign, flyer, or open house handout in under a
            minute.
          </p>
        </div>

        <DashboardCard title="Destination">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("custom")}
              className={`flex-1 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                mode === "custom"
                  ? "border-gold-400 bg-gold-50 text-navy-900 dark:bg-gold-500/10 dark:text-white"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              Custom Link
            </button>
            <button
              type="button"
              onClick={() => setMode("property")}
              className={`flex-1 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                mode === "property"
                  ? "border-gold-400 bg-gold-50 text-navy-900 dark:bg-gold-500/10 dark:text-white"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              From a Property
            </button>
          </div>

          <div className="mt-4">
            {mode === "custom" ? (
              <>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Link to encode
                </label>
                <Input
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://the-listing-lab.vercel.app/site/your-listing"
                  inputMode="url"
                />
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  Paste a published property website link, a mortgage application link, or any other URL.
                </p>
              </>
            ) : (
              <>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Property
                </label>
                <select
                  value={selectedPropertyId}
                  onChange={(e) => setSelectedPropertyId(e.target.value)}
                  className="flex h-11 w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:border-gold-400"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.address} — {p.cityStateZip}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  Links to {selectedProperty ? selectedProperty.address : "this property"}
                  &rsquo;s workspace in Listing Lab.
                </p>
              </>
            )}
          </div>

          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Caption (optional, shown under the code on print materials)
            </label>
            <Input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Scan to view the listing"
            />
          </div>
        </DashboardCard>
      </div>

      <div className="lg:sticky lg:top-6">
        <DashboardCard title="Preview">
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="flex h-56 w-56 items-center justify-center rounded-2xl border border-border bg-white p-4 shadow-soft">
              {destination && pngDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={pngDataUrl} alt={`QR code linking to ${destination}`} className="h-full w-full" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
                  <QrCodeIcon className="h-8 w-8" />
                  <p className="text-xs">
                    {isGenerating ? "Generating…" : "Enter a link to generate a QR code"}
                  </p>
                </div>
              )}
            </div>

            {caption && destination && <p className="text-sm font-medium text-foreground">{caption}</p>}

            {destination && (
              <p className="max-w-[14rem] truncate text-center text-xs text-muted-foreground" title={destination}>
                {destination}
              </p>
            )}

            <div className="flex w-full flex-col gap-2">
              <Button
                type="button"
                onClick={handleDownloadPng}
                disabled={!destination}
                className="w-full"
              >
                <Download className="h-4 w-4" />
                Download PNG
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleDownloadSvg}
                disabled={!destination}
                className="w-full"
              >
                <Download className="h-4 w-4" />
                Download SVG
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={handleCopyLink}
                disabled={!destination}
                className="w-full"
              >
                {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
                {copied ? "Copied" : "Copy Link"}
              </Button>
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}

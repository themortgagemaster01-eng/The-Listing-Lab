"use client";

import * as React from "react";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Loader2,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/shared/Toast";
import { CompsFilePrepError, prepareCompsFile } from "@/lib/market-comp/prepare-file-upload";
import { COMPS_PROVIDERS } from "@/lib/market-comp/providers/registry";
import { MARKET_COMP_DISCLAIMER } from "@/lib/market-comp/types";
import type { CompsProviderId, MarketComp, MarketCompAnalysisResult } from "@/lib/market-comp/types";
import type { Property } from "@/types";

type Step = "source" | "input" | "grid" | "report";

interface SourceOption {
  id: CompsProviderId;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SOURCE_OPTIONS: SourceOption[] = [
  { id: "manual", label: "Manual Entry", description: "Type in comps by hand", icon: Plus },
  { id: "csv-import", label: "CSV Import", description: "Upload a .csv export from your MLS or spreadsheet tool", icon: FileText },
  { id: "excel-import", label: "Excel Import", description: "Upload a .xlsx or .xls comp sheet", icon: FileSpreadsheet },
  { id: "pdf-import", label: "PDF Import", description: "Upload a comp sheet PDF — AI reads the table for you", icon: FileText },
  { id: "mls-api", label: "MLS API", description: "Coming soon — needs a licensed MLS API connection", icon: BarChart3 },
  { id: "licensed-data-api", label: "Licensed Data Provider", description: "Coming soon — needs a licensed data contract", icon: BarChart3 },
];

interface ManualDraftRow {
  address: string;
  soldPrice: string;
  soldDate: string;
  beds: string;
  baths: string;
  sqft: string;
  propertyType: string;
  distanceMiles: string;
}

const EMPTY_MANUAL_ROW: ManualDraftRow = {
  address: "",
  soldPrice: "",
  soldDate: "",
  beds: "",
  baths: "",
  sqft: "",
  propertyType: "Single Family",
  distanceMiles: "",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

interface MarketCompWizardProps {
  property: Property;
}

/**
 * AI Comparative Market Analysis (CMA) — guided 4-step walkthrough: pick a
 * comps source, provide input for that source (manual form or file upload),
 * review/edit the normalized comp grid, then generate an AI-written report.
 *
 * Deliberately mirrors the provider-agnostic architecture underneath it:
 * every source (`COMPS_PROVIDERS[id]`) returns the exact same
 * `{comps, warnings}` shape, so steps 3 and 4 of this wizard never branch on
 * which source was used — only step 2 (the input UI) is source-specific.
 */
export function MarketCompWizard({ property }: MarketCompWizardProps) {
  const { showToast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [step, setStep] = React.useState<Step>("source");
  const [sourceId, setSourceId] = React.useState<CompsProviderId | null>(null);

  const [manualRows, setManualRows] = React.useState<ManualDraftRow[]>([]);
  const [manualDraft, setManualDraft] = React.useState<ManualDraftRow>(EMPTY_MANUAL_ROW);

  const [fetching, setFetching] = React.useState(false);
  const [fetchError, setFetchError] = React.useState<string | null>(null);
  const [comps, setComps] = React.useState<MarketComp[]>([]);
  const [warnings, setWarnings] = React.useState<string[]>([]);

  const [analyzing, setAnalyzing] = React.useState(false);
  const [analyzeError, setAnalyzeError] = React.useState<string | null>(null);
  const [report, setReport] = React.useState<MarketCompAnalysisResult | null>(null);

  function selectSource(id: CompsProviderId) {
    const provider = COMPS_PROVIDERS[id];
    if (!provider.isImplemented) {
      showToast(`${provider.label} isn't connected yet — try manual entry, CSV, Excel, or PDF import.`);
      return;
    }
    setSourceId(id);
    setFetchError(null);
    setStep("input");
  }

  function addManualRow() {
    if (!manualDraft.address.trim() || !manualDraft.soldPrice || !manualDraft.sqft) {
      showToast("Address, sold price, and square footage are required for each comp.");
      return;
    }
    setManualRows((prev) => [...prev, manualDraft]);
    setManualDraft(EMPTY_MANUAL_ROW);
  }

  function removeManualRow(index: number) {
    setManualRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function submitManualRows() {
    if (manualRows.length === 0) {
      showToast("Add at least one comp first.");
      return;
    }
    setFetching(true);
    setFetchError(null);
    try {
      const result = await COMPS_PROVIDERS.manual.fetch({
        comps: manualRows.map((r) => ({
          address: r.address,
          soldPrice: Number(r.soldPrice) || 0,
          soldDate: r.soldDate,
          beds: Number(r.beds) || 0,
          baths: Number(r.baths) || 0,
          sqft: Number(r.sqft) || 0,
          propertyType: r.propertyType,
          distanceMiles: Number(r.distanceMiles) || 0,
        })),
      });
      setComps(result.comps);
      setWarnings(result.warnings);
      if (result.comps.length === 0) {
        setFetchError("None of those rows could be used — check address, sold price, and sqft.");
        return;
      }
      setStep("grid");
    } finally {
      setFetching(false);
    }
  }

  async function handleFilePicked(fileList: FileList | null) {
    if (!fileList || fileList.length === 0 || !sourceId) return;
    const file = fileList[0];
    if (sourceId !== "csv-import" && sourceId !== "excel-import" && sourceId !== "pdf-import") return;

    setFetching(true);
    setFetchError(null);
    try {
      const input = await prepareCompsFile(file, sourceId);
      const result = await COMPS_PROVIDERS[sourceId].fetch(input);
      setComps(result.comps);
      setWarnings(result.warnings);
      if (result.comps.length === 0) {
        setFetchError(result.warnings[0] || "No usable comps were found in that file.");
        return;
      }
      setStep("grid");
    } catch (err) {
      setFetchError(
        err instanceof CompsFilePrepError ? err.message : err instanceof Error ? err.message : "Couldn't process that file."
      );
    } finally {
      setFetching(false);
    }
  }

  function removeCompRow(index: number) {
    setComps((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleGenerateReport() {
    if (comps.length === 0) return;
    setAnalyzing(true);
    setAnalyzeError(null);
    setStep("report");

    try {
      const response = await fetch("/api/ai/generate-cma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: property.id, comps }),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error || "CMA generation failed.");
      }
      setReport(json.result as MarketCompAnalysisResult);
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : "CMA generation failed unexpectedly.");
    } finally {
      setAnalyzing(false);
    }
  }

  function handleStartOver() {
    setSourceId(null);
    setManualRows([]);
    setManualDraft(EMPTY_MANUAL_ROW);
    setComps([]);
    setWarnings([]);
    setFetchError(null);
    setAnalyzeError(null);
    setReport(null);
    setStep("source");
  }

  const sourceLabel = sourceId ? COMPS_PROVIDERS[sourceId].label : "";

  return (
    <div className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept={sourceId === "csv-import" ? ".csv,text/csv" : sourceId === "excel-import" ? ".xlsx,.xls" : sourceId === "pdf-import" ? ".pdf" : undefined}
        className="hidden"
        onChange={(e) => {
          void handleFilePicked(e.target.files);
          e.target.value = "";
        }}
      />

      {/* Step indicator */}
      <div className="flex flex-wrap gap-2">
        {(["source", "input", "grid", "report"] as Step[]).map((s, i) => (
          <span
            key={s}
            className={
              "rounded-full px-3 py-1.5 text-xs font-semibold " +
              (s === step ? "bg-navy-950 text-white dark:bg-gold-500 dark:text-navy-950" : "bg-muted text-muted-foreground")
            }
          >
            {i + 1}. {s === "source" ? "Source" : s === "input" ? "Comps" : s === "grid" ? "Review" : "Report"}
          </span>
        ))}
      </div>

      {step === "source" && (
        <DashboardCard title="Choose a comps source">
          <p className="mb-4 text-sm text-muted-foreground">
            Pull comparable sales for {property.address} from any of these sources — the AI report works identically
            no matter which one you pick.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {SOURCE_OPTIONS.map((opt) => {
              const provider = COMPS_PROVIDERS[opt.id];
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => selectSource(opt.id)}
                  className={
                    "flex items-start gap-3 rounded-xl border p-4 text-left transition-colors " +
                    (provider.isImplemented
                      ? "border-border bg-surface hover:border-gold-400 hover:bg-gold-50 dark:hover:bg-gold-500/10"
                      : "border-border bg-muted/40 opacity-70")
                  }
                >
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-navy-700 dark:text-gold-400" />
                  <span>
                    <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      {opt.label}
                      {!provider.isImplemented && <Badge variant="neutral">Coming Soon</Badge>}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{opt.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </DashboardCard>
      )}

      {step === "input" && sourceId === "manual" && (
        <DashboardCard title="Add comps manually">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                placeholder="Address *"
                value={manualDraft.address}
                onChange={(e) => setManualDraft((d) => ({ ...d, address: e.target.value }))}
                className="h-10 rounded-xl border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
              />
              <input
                placeholder="Sold price *"
                type="number"
                value={manualDraft.soldPrice}
                onChange={(e) => setManualDraft((d) => ({ ...d, soldPrice: e.target.value }))}
                className="h-10 rounded-xl border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
              />
              <input
                placeholder="Sold date"
                value={manualDraft.soldDate}
                onChange={(e) => setManualDraft((d) => ({ ...d, soldDate: e.target.value }))}
                className="h-10 rounded-xl border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
              />
              <input
                placeholder="Sqft *"
                type="number"
                value={manualDraft.sqft}
                onChange={(e) => setManualDraft((d) => ({ ...d, sqft: e.target.value }))}
                className="h-10 rounded-xl border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
              />
              <input
                placeholder="Beds"
                type="number"
                value={manualDraft.beds}
                onChange={(e) => setManualDraft((d) => ({ ...d, beds: e.target.value }))}
                className="h-10 rounded-xl border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
              />
              <input
                placeholder="Baths"
                type="number"
                value={manualDraft.baths}
                onChange={(e) => setManualDraft((d) => ({ ...d, baths: e.target.value }))}
                className="h-10 rounded-xl border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
              />
              <input
                placeholder="Property type"
                value={manualDraft.propertyType}
                onChange={(e) => setManualDraft((d) => ({ ...d, propertyType: e.target.value }))}
                className="h-10 rounded-xl border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
              />
              <input
                placeholder="Distance (miles)"
                type="number"
                value={manualDraft.distanceMiles}
                onChange={(e) => setManualDraft((d) => ({ ...d, distanceMiles: e.target.value }))}
                className="h-10 rounded-xl border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
              />
            </div>
            <Button type="button" variant="outline" onClick={addManualRow}>
              <Plus className="h-4 w-4" />
              Add Comp
            </Button>

            {manualRows.length > 0 && (
              <div className="space-y-2">
                {manualRows.map((r, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3 text-sm">
                    <span className="min-w-0 truncate">
                      {r.address} — ${Number(r.soldPrice).toLocaleString()} · {r.sqft} sqft
                    </span>
                    <button type="button" onClick={() => removeManualRow(i)} className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Remove">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {fetchError && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{fetchError}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep("source")}>
                Back
              </Button>
              <Button type="button" variant="gold" onClick={submitManualRows} disabled={fetching || manualRows.length === 0}>
                {fetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Continue with {manualRows.length} Comp{manualRows.length === 1 ? "" : "s"}
              </Button>
            </div>
          </div>
        </DashboardCard>
      )}

      {step === "input" && (sourceId === "csv-import" || sourceId === "excel-import" || sourceId === "pdf-import") && (
        <DashboardCard title={`Upload for ${sourceLabel}`}>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {sourceId === "pdf-import"
                ? "Upload a comp sheet PDF — the AI reads the table and extracts each sold comp automatically."
                : "Upload a file with columns like Address, Sold Price, Sold Date, Beds, Baths, and Sqft — column names don't need to match exactly."}
            </p>
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={fetching}>
              {fetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {fetching ? "Processing…" : "Choose File"}
            </Button>

            {fetchError && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{fetchError}</p>
              </div>
            )}

            <Button type="button" variant="outline" onClick={() => setStep("source")}>
              Back
            </Button>
          </div>
        </DashboardCard>
      )}

      {step === "grid" && (
        <DashboardCard title="Review comps">
          <div className="space-y-4">
            {warnings.length > 0 && (
              <div className="space-y-1 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
                {warnings.map((w, i) => (
                  <p key={i}>{w}</p>
                ))}
              </div>
            )}

            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Address</th>
                    <th className="px-3 py-2">Sold</th>
                    <th className="px-3 py-2">Bd/Ba</th>
                    <th className="px-3 py-2">Sqft</th>
                    <th className="px-3 py-2">$/Sqft</th>
                    <th className="px-3 py-2">Source</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {comps.map((c, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 font-medium text-foreground">{c.address}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {formatCurrency(c.soldPrice)}
                        <span className="block text-xs text-muted-foreground">{c.soldDate}</span>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{c.beds}/{c.baths}</td>
                      <td className="px-3 py-2 text-muted-foreground">{c.sqft.toLocaleString()}</td>
                      <td className="px-3 py-2 text-muted-foreground">${c.pricePerSqft}</td>
                      <td className="px-3 py-2">
                        <Badge variant="neutral">{COMPS_PROVIDERS[c.source].label}</Badge>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button type="button" onClick={() => removeCompRow(i)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Remove comp">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep("source")}>
                Back
              </Button>
              <Button type="button" variant="gold" onClick={handleGenerateReport} disabled={comps.length === 0}>
                <Sparkles className="h-4 w-4" />
                Generate CMA Report
              </Button>
            </div>
          </div>
        </DashboardCard>
      )}

      {step === "report" && (
        <DashboardCard title="CMA report">
          {analyzing && (
            <div className="space-y-3">
              <LoadingSkeleton className="h-20 w-full rounded-xl" />
              <LoadingSkeleton className="h-20 w-full rounded-xl" />
              <p className="text-sm text-muted-foreground">Analyzing comps…</p>
            </div>
          )}

          {!analyzing && analyzeError && (
            <div className="space-y-4">
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{analyzeError}</p>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep("grid")}>
                  Back
                </Button>
                <Button type="button" variant="gold" onClick={handleGenerateReport}>
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {!analyzing && !analyzeError && report && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-gold-400 bg-gold-50 p-6 text-center dark:bg-gold-500/10">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Suggested Price Range</p>
                <p className="mt-2 font-display text-3xl font-semibold text-navy-800 dark:text-gold-400">
                  {formatCurrency(report.suggestedPriceRange?.low ?? 0)} – {formatCurrency(report.suggestedPriceRange?.high ?? 0)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">Based on {report.comps.length} comparable sale{report.comps.length === 1 ? "" : "s"}</p>
              </div>

              <div className="rounded-xl border border-border bg-surface p-4">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">AI Narrative</p>
                <p className="text-sm leading-relaxed text-foreground">{report.aiNarrative}</p>
              </div>

              <div className="rounded-xl border border-border bg-muted/50 p-4">
                <p className="text-xs leading-relaxed text-muted-foreground">{MARKET_COMP_DISCLAIMER}</p>
              </div>

              <p className="text-xs text-muted-foreground">Generated {new Date(report.generatedAt).toLocaleString()}</p>

              <Button type="button" variant="outline" onClick={handleStartOver}>
                <RotateCcw className="h-4 w-4" />
                Start New CMA
              </Button>
            </div>
          )}
        </DashboardCard>
      )}
    </div>
  );
}

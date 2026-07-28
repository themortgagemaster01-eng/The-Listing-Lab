"use client";

import * as React from "react";
import { AlertTriangle, Camera, CheckCircle2, FileText, Loader2, RotateCcw, ShieldCheck, Upload, X } from "lucide-react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/shared/Toast";
import { MAX_DOCUMENTS, prepareIncomeDocument, UploadPrepError } from "@/lib/income/prepare-upload";
import {
  INCOME_ANALYZER_DISCLAIMER,
  INCOME_DOC_TYPE_LABELS,
  type IncomeDocType,
  type IncomeDocumentInput,
  type IncomeEstimateResult,
} from "@/lib/income/types";
import type { Property } from "@/types";

type Step = "upload" | "review" | "summary";

const STEP_LABELS: Record<Step, string> = {
  upload: "1. Upload Documents",
  review: "2. Review & Confirm",
  summary: "3. Summary",
};

const DOC_TYPE_OPTIONS: IncomeDocType[] = ["paystub", "w2", "tax-return", "1099", "bank-statement", "other"];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

interface IncomeAnalyzerWizardProps {
  property: Property;
}

/**
 * AI Income Analyzer — guided 3-step walkthrough: upload/photo-capture
 * income documents, review the AI's extracted estimate (with mandatory
 * human confirmation of the final monthly gross figure before it's treated
 * as "done"), then a summary screen with the required disclaimer.
 *
 * PRIVACY BY DESIGN, non-negotiable per Robert's 2026-07-28 spec: documents
 * picked in Step 1 live only in this component's React state (`docs`) and
 * are sent once to `/api/ai/analyze-income`, which itself never persists
 * them (see that route's header comment). Closing this wizard, navigating
 * away, or clicking "Start Over" all just let `docs` and the AI response
 * fall out of scope — there is no explicit "delete" step because nothing
 * was ever written anywhere durable. The one opt-in exception (saving the
 * original files) is offered honestly in Step 3 as not-yet-connected to
 * real storage — see the checkbox's helper text and
 * `docs/FUTURE_FEATURES.md` for why.
 */
export function IncomeAnalyzerWizard({ property }: IncomeAnalyzerWizardProps) {
  const { showToast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);

  const [step, setStep] = React.useState<Step>("upload");
  const [docs, setDocs] = React.useState<IncomeDocumentInput[]>([]);
  const [pendingDocType, setPendingDocType] = React.useState<IncomeDocType>("paystub");
  const [preparing, setPreparing] = React.useState(false);

  const [analyzing, setAnalyzing] = React.useState(false);
  const [analyzeError, setAnalyzeError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<IncomeEstimateResult | null>(null);
  const [confirmedMonthly, setConfirmedMonthly] = React.useState<string>("");

  const [saveDocsOptIn, setSaveDocsOptIn] = React.useState(false);

  async function handleFilesPicked(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    if (docs.length + fileList.length > MAX_DOCUMENTS) {
      showToast(`You can analyze up to ${MAX_DOCUMENTS} documents at a time.`);
      return;
    }

    setPreparing(true);
    try {
      const prepared = await Promise.all(
        Array.from(fileList).map((file) => prepareIncomeDocument(file, pendingDocType))
      );
      setDocs((prev) => [...prev, ...prepared]);
    } catch (err) {
      showToast(err instanceof UploadPrepError ? err.message : "Couldn't process one of those files.");
    } finally {
      setPreparing(false);
    }
  }

  function removeDoc(id: string) {
    setDocs((prev) => prev.filter((d) => d.id !== id));
  }

  function updateDocType(id: string, docType: IncomeDocType) {
    setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, docType } : d)));
  }

  async function handleAnalyze() {
    if (docs.length === 0) return;
    setAnalyzing(true);
    setAnalyzeError(null);
    setStep("review");

    try {
      const response = await fetch("/api/ai/analyze-income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documents: docs.map((d) => ({
            fileName: d.fileName,
            mimeType: d.mimeType,
            docType: d.docType,
            dataUrl: d.dataUrl,
          })),
        }),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error || "Analysis failed.");
      }
      const estimate = json.result as IncomeEstimateResult;
      setResult(estimate);
      setConfirmedMonthly(Math.round(estimate.suggestedMonthlyGross).toString());
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : "Analysis failed unexpectedly.");
    } finally {
      setAnalyzing(false);
    }
  }

  function handleConfirm() {
    if (!confirmedMonthly || Number.isNaN(Number(confirmedMonthly))) {
      showToast("Enter a valid monthly gross income before continuing.");
      return;
    }
    setStep("summary");
  }

  function handleStartOver() {
    setDocs([]);
    setResult(null);
    setAnalyzeError(null);
    setConfirmedMonthly("");
    setSaveDocsOptIn(false);
    setStep("upload");
  }

  function handleSaveDocsClick() {
    if (!saveDocsOptIn) return;
    // See file header + docs/FUTURE_FEATURES.md: secure document storage
    // for this opt-in path isn't wired up yet (it needs its own
    // private/RLS-scoped Supabase Storage bucket, not the existing public
    // buckets). Being explicit here rather than silently pretending to save.
    showToast("Secure document storage isn't connected yet — nothing was saved. This has been flagged to Robert.");
  }

  const confirmedNumber = Number(confirmedMonthly) || 0;

  return (
    <div className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        multiple
        className="hidden"
        onChange={(e) => {
          void handleFilesPicked(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          void handleFilesPicked(e.target.files);
          e.target.value = "";
        }}
      />

      {/* Step indicator */}
      <div className="flex flex-wrap gap-2">
        {(["upload", "review", "summary"] as Step[]).map((s) => (
          <span
            key={s}
            className={
              "rounded-full px-3 py-1.5 text-xs font-semibold " +
              (s === step
                ? "bg-navy-950 text-white dark:bg-gold-500 dark:text-navy-950"
                : "bg-muted text-muted-foreground")
            }
          >
            {STEP_LABELS[s]}
          </span>
        ))}
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-border bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
        <p>
          Documents are analyzed instantly and are <strong className="text-foreground">not saved anywhere</strong> —
          they exist only in this browser tab and this one request, and are discarded immediately after your
          estimate is generated, unless you explicitly choose to save them in the last step.
        </p>
      </div>

      {step === "upload" && (
        <DashboardCard title="Upload income documents">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Add paystubs, W-2s, tax returns, 1099s, or bank statements for {property.address}&rsquo;s buyer — photos
              or PDFs both work.
            </p>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Document type for next upload</label>
              <select
                value={pendingDocType}
                onChange={(e) => setPendingDocType(e.target.value as IncomeDocType)}
                className="h-11 w-full max-w-xs rounded-xl border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
              >
                {DOC_TYPE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {INCOME_DOC_TYPE_LABELS[opt]}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={preparing}
              >
                <Upload className="h-4 w-4" />
                Upload files
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => cameraInputRef.current?.click()}
                disabled={preparing}
              >
                <Camera className="h-4 w-4" />
                Take a photo
              </Button>
              {preparing && (
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing…
                </span>
              )}
            </div>

            {docs.length > 0 && (
              <div className="space-y-2">
                {docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3"
                  >
                    {doc.previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- transient in-memory data URL, not a Next/Image-optimizable remote asset
                      <img src={doc.previewUrl} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{doc.fileName}</p>
                      <select
                        value={doc.docType}
                        onChange={(e) => updateDocType(doc.id, e.target.value as IncomeDocType)}
                        className="mt-1 h-8 rounded-lg border border-border bg-background px-2 text-xs text-foreground"
                      >
                        {DOC_TYPE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {INCOME_DOC_TYPE_LABELS[opt]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDoc(doc.id)}
                      className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      aria-label={`Remove ${doc.fileName}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <Button
              type="button"
              variant="gold"
              onClick={handleAnalyze}
              disabled={docs.length === 0 || preparing}
            >
              Analyze {docs.length > 0 ? `${docs.length} Document${docs.length === 1 ? "" : "s"}` : "Documents"}
            </Button>
          </div>
        </DashboardCard>
      )}

      {step === "review" && (
        <DashboardCard title="Review & confirm estimate">
          {analyzing && (
            <div className="space-y-3">
              <LoadingSkeleton className="h-20 w-full rounded-xl" />
              <LoadingSkeleton className="h-20 w-full rounded-xl" />
              <p className="text-sm text-muted-foreground">Reading documents…</p>
            </div>
          )}

          {!analyzing && analyzeError && (
            <div className="space-y-4">
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{analyzeError}</p>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep("upload")}>
                  Back
                </Button>
                <Button type="button" variant="gold" onClick={handleAnalyze}>
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {!analyzing && !analyzeError && result && (
            <div className="space-y-5">
              {result.isDemoData && (
                <Badge variant="gold">Demo data — no OpenAI key configured</Badge>
              )}

              <div className="space-y-2">
                {result.documents.map((doc, i) => (
                  <div key={i} className="rounded-xl border border-border bg-surface p-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-foreground">{doc.fileName}</span>
                      <span className="text-xs text-muted-foreground">{INCOME_DOC_TYPE_LABELS[doc.docType]}</span>
                    </div>
                    <p className="mt-1 text-muted-foreground">
                      {doc.source ?? "Source not identified"} ·{" "}
                      {doc.estimatedMonthlyGross != null
                        ? `${formatCurrency(doc.estimatedMonthlyGross)}/mo`
                        : "amount not found"}
                    </p>
                    {doc.notes && <p className="mt-1 text-xs italic text-muted-foreground">{doc.notes}</p>}
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground">{result.confidenceNote}</p>

              <div className="rounded-xl border border-gold-400 bg-gold-50 p-4 dark:bg-gold-500/10">
                <label className="mb-1.5 block text-sm font-semibold text-foreground">
                  Confirm estimated monthly gross income
                </label>
                <p className="mb-3 text-xs text-muted-foreground">
                  Review the figure below and correct it if anything looks off before finalizing — this is the
                  number that will appear on the summary.
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-foreground">$</span>
                  <input
                    type="number"
                    value={confirmedMonthly}
                    onChange={(e) => setConfirmedMonthly(e.target.value)}
                    className="h-12 w-48 rounded-xl border border-border bg-surface px-3 text-lg font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                  />
                  <span className="text-sm text-muted-foreground">/ month</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep("upload")}>
                  Back
                </Button>
                <Button type="button" variant="gold" onClick={handleConfirm}>
                  <CheckCircle2 className="h-4 w-4" />
                  Confirm & Continue
                </Button>
              </div>
            </div>
          )}
        </DashboardCard>
      )}

      {step === "summary" && (
        <DashboardCard title="Income estimate summary">
          <div className="space-y-5">
            <div className="rounded-2xl border border-gold-400 bg-gold-50 p-6 text-center dark:bg-gold-500/10">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Estimated Gross Monthly Income
              </p>
              <p className="mt-2 font-display text-4xl font-semibold text-navy-800 dark:text-gold-400">
                {formatCurrency(confirmedNumber)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatCurrency(confirmedNumber * 12)} estimated annual gross
              </p>
            </div>

            <div className="text-xs text-muted-foreground">
              Based on {docs.length} document{docs.length === 1 ? "" : "s"} (
              {Array.from(new Set(docs.map((d) => INCOME_DOC_TYPE_LABELS[d.docType]))).join(", ")}) · Generated{" "}
              {new Date().toLocaleDateString()}
            </div>

            <div className="rounded-xl border border-border bg-muted/50 p-4">
              <p className="text-xs leading-relaxed text-muted-foreground">{INCOME_ANALYZER_DISCLAIMER}</p>
            </div>

            <div className="rounded-xl border border-border bg-surface p-4">
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={saveDocsOptIn}
                  onChange={(e) => setSaveDocsOptIn(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-gold-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                />
                <span>
                  <span className="font-medium text-foreground">Save the uploaded documents to this property.</span>{" "}
                  <span className="text-muted-foreground">
                    Off by default — nothing is saved unless you check this box. (Secure document storage for this
                    option isn&rsquo;t connected yet; checking it won&rsquo;t save anything today, but nothing is
                    ever saved silently either way.)
                  </span>
                </span>
              </label>
              {saveDocsOptIn && (
                <Button type="button" variant="outline" size="sm" className="mt-3" onClick={handleSaveDocsClick}>
                  Save Documents
                </Button>
              )}
            </div>

            <Button type="button" variant="outline" onClick={handleStartOver}>
              <RotateCcw className="h-4 w-4" />
              Analyze More Documents
            </Button>
          </div>
        </DashboardCard>
      )}
    </div>
  );
}

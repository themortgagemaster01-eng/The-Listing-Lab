import { PAYMENT_SNAPSHOT_DISCLAIMER } from "@/lib/payment/types";

/**
 * AI Income Analyzer types — shared between the client wizard
 * (`components/property/income/IncomeAnalyzerWizard.tsx`), the in-memory-only
 * API route (`src/app/api/ai/analyze-income/route.ts`), and the AI service
 * (`src/lib/ai/income-service.ts`).
 *
 * PRIVACY BY DESIGN (non-negotiable, per Robert's 2026-07-28 spec and
 * `docs/PRODUCT_PRINCIPLES.md` rule #9): every one of these types describes
 * data that lives in browser memory / a single request's server memory only.
 * None of it is ever written to Supabase — there is no `income_documents`
 * table, no `income-documents` storage bucket, no persistence path in this
 * file or anywhere in `src/app/api/ai/analyze-income/route.ts`. The one
 * narrow exception (saving the *original uploaded files*, opt-in, off by
 * default) is a real gap flagged in `docs/FUTURE_FEATURES.md` — it isn't
 * built yet, on purpose, because it needs its own private/RLS-scoped
 * Supabase Storage bucket rather than reusing the existing public buckets.
 * See `IncomeAnalyzerWizard.tsx`'s "save documents" checkbox for how that
 * gap is surfaced honestly in the UI instead of silently doing nothing.
 */

export type IncomeDocType = "paystub" | "w2" | "tax-return" | "1099" | "bank-statement" | "other";

export const INCOME_DOC_TYPE_LABELS: Record<IncomeDocType, string> = {
  paystub: "Paystub",
  w2: "W-2",
  "tax-return": "Tax Return",
  "1099": "1099",
  "bank-statement": "Bank Statement",
  other: "Other",
};

export type IncomePayFrequency =
  | "weekly"
  | "biweekly"
  | "semimonthly"
  | "monthly"
  | "annual"
  | "unknown";

/**
 * One uploaded document, fully in-memory on the client. `dataUrl` is a
 * base64 data URL built in the browser (see
 * `src/lib/income/prepare-upload.ts`) — this object is never written to
 * IndexedDB/localStorage, only ever held in React state, and is sent to the
 * analyze API once, then discarded from client state when the wizard resets
 * or unmounts (normal garbage collection — nothing explicit to clean up
 * because nothing durable was ever created).
 */
export interface IncomeDocumentInput {
  id: string;
  fileName: string;
  mimeType: string;
  docType: IncomeDocType;
  dataUrl: string;
  /** Small preview thumbnail shown in the upload step; same lifetime as `dataUrl`. */
  previewUrl: string;
}

/** What the AI (or the mock fallback) extracted from a single document. */
export interface ExtractedDocumentIncome {
  fileName: string;
  docType: IncomeDocType;
  /** Employer name (paystub/W-2) or income source description (1099/bank statement), if identifiable. */
  source: string | null;
  payFrequency: IncomePayFrequency;
  /** The raw gross amount as it appears on the document for its stated period (e.g. "this paystub's gross"), if found. */
  grossAmountFound: number | null;
  /** `grossAmountFound` normalized to a monthly figure using `payFrequency`. */
  estimatedMonthlyGross: number | null;
  /** Model's plain-English caveats about this specific document (e.g. "YTD figure — may include bonus/overtime"). */
  notes: string | null;
}

/** Full result of one analyze-income call — always the same shape whether OpenAI is configured or not (see `income-service.ts`). */
export interface IncomeEstimateResult {
  documents: ExtractedDocumentIncome[];
  /** Sum of `estimatedMonthlyGross` across all documents — this is a starting point, not the final number; the wizard always lets the user review/edit it before it's "confirmed." */
  suggestedMonthlyGross: number;
  /** Plain-English summary of how the estimate was built and what to double check. */
  confidenceNote: string;
  /** True when this came from the no-API-key mock fallback rather than a real model call. */
  isDemoData: boolean;
}

/**
 * The final, user-confirmed result — what actually gets shown/exported.
 * `confirmedMonthlyGross` may differ from `suggestedMonthlyGross` because the
 * wizard's Review step lets the agent correct it before finalizing, per
 * Robert's explicit requirement that the flow "confirms estimated monthly
 * gross salary back to the user before finalizing."
 */
export interface IncomeAnalysisSummary {
  confirmedMonthlyGross: number;
  confirmedAnnualGross: number;
  documentCount: number;
  documentTypesUsed: IncomeDocType[];
  generatedAt: string;
  disclaimer: string;
}

/** Reuses the exact same disclaimer already required on every Mortgage Center surface (UI + PDF) — one shared string, never re-worded per feature. */
export const INCOME_ANALYZER_DISCLAIMER = PAYMENT_SNAPSHOT_DISCLAIMER;

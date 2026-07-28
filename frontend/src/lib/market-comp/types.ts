/**
 * Market Comp Analysis / AI CMA — TYPES ONLY, provider-abstraction design
 * pass (2026-07-28). Still NOT built for real (see
 * `src/lib/market-comp/generate.ts`'s stub and
 * `components/property/market-comp/MarketCompComingSoon.tsx`'s UI stub) —
 * this file is the "already-agreed-upon shape" the real implementation
 * slots into, same purpose as the original v1.1 version of this file, now
 * extended per Robert's explicit 2026-07-28 direction:
 *
 *   - No hard-coded single data source (Zillow, etc.) — scraping is a real
 *     ToS/legal risk and is explicitly out of scope, not just undesirable.
 *   - A provider abstraction (`CompsProvider<T>` below) so comp data can
 *     come from MLS API access (future), licensed data providers like
 *     RentCast/ATTOM (future), or — shipping first, because they need no
 *     external contract — manual entry, CSV import, Excel import, and PDF
 *     import (parsing a comp sheet the agent already has, e.g. exported
 *     from their MLS or from Zillow's own UI).
 *   - The AI analysis engine (`generateMarketCompAnalysis`) sits on top of
 *     this abstraction and only ever sees the normalized `MarketComp[]`
 *     output — never a provider, a provider id, or a source-specific input
 *     shape — so it is structurally incapable of special-casing by source.
 *
 * This mirrors the `generateAsset`/`AIService` dispatcher pattern in
 * `src/lib/ai/asset-service.ts`: one small set of shared types, one
 * dispatch point (`COMPS_PROVIDERS` in `providers/registry.ts`, not yet
 * created), swappable implementations behind it.
 */

/** A single comparable sale, normalized to one shape regardless of which provider produced it. */
export interface MarketComp {
  address: string;
  soldPrice: number;
  /** ISO date string. */
  soldDate: string;
  beds: number;
  baths: number;
  sqft: number;
  propertyType: string;
  distanceMiles: number;
  /** Always derived (`soldPrice / sqft`), never accepted as raw input from any provider — see `CompsProvider` implementations. */
  pricePerSqft: number;
  /** Which provider produced this comp — powers a provenance badge in the comp grid UI and lets `generate.ts` mention it in the AI narrative (e.g. "comps sourced from your uploaded CSV") without ever branching its analysis logic on it. */
  source: CompsProviderId;
  /** Optional provider-specific breadcrumb for user trust/debugging — e.g. "row 4 of uploaded CSV", "extracted from page 2 of PDF". Never required, never parsed by anything downstream. */
  sourceNote?: string;
}

/**
 * Every comp data source the product will ever support, real or future.
 * `manual` / `csv-import` / `excel-import` / `pdf-import` ship first — they
 * need no external contract. `mls-api` and `licensed-data-api` are real,
 * named slots in this union from day one (so nothing about the type system
 * changes when they're built) but have no working provider behind them yet
 * — see `CompsProvider.isImplemented`.
 */
export type CompsProviderId = "manual" | "csv-import" | "excel-import" | "pdf-import" | "mls-api" | "licensed-data-api";

/** What every provider returns, regardless of input shape — the one place all sources converge before the AI engine ever sees them. */
export interface CompsProviderResult {
  comps: MarketComp[];
  /** Non-fatal issues to surface in the UI (e.g. "3 rows skipped — missing sold price", "2 comps outside the requested radius were dropped"). Never thrown as errors — a partial, imperfect comp set is still useful; a provider should only throw for total failure (unreadable file, API unreachable, etc.). */
  warnings: string[];
}

/**
 * The provider interface itself. `TInput` is intentionally NOT one
 * lowercase-common-denominator shape across every source — manual entry,
 * a file upload, and an MLS query have genuinely different natural inputs,
 * and forcing them into one shape would make every provider's input mostly
 * dead/ignored fields. What's shared instead is the *contract*: a `fetch`
 * method, a stable `id`/`label` for the UI's source picker, an
 * `isImplemented` flag so the UI can greet real-but-not-yet-built sources
 * honestly (per `docs/PRODUCT_PRINCIPLES.md`'s "Coming Soon, not fake"
 * convention — no separate feature-flag system needed), and — critically —
 * the same `CompsProviderResult` return shape every time. Swapping which
 * provider backs a given `CompsProviderId` never touches calling code.
 */
export interface CompsProvider<TInput> {
  id: CompsProviderId;
  label: string;
  isImplemented: boolean;
  fetch(input: TInput): Promise<CompsProviderResult>;
}

/** Input for the `manual` provider — the agent types in comps by hand via a form. `pricePerSqft`/`source` are always derived/assigned by the provider, never accepted from the caller. */
export interface ManualCompsInput {
  comps: Array<Omit<MarketComp, "pricePerSqft" | "source" | "sourceNote">>;
}

/**
 * Input shared by `csv-import`, `excel-import`, and `pdf-import` — a single
 * uploaded file, in-memory only (same base64-data-URL convention as
 * `src/lib/income/types.ts`'s `IncomeDocumentInput`, and likely built with
 * the same client-side prep helper — see the implementation-phase note in
 * the design writeup about extracting a shared `prepare-file-upload.ts`
 * rather than duplicating `src/lib/income/prepare-upload.ts`). Unlike
 * income documents, comp data is generally public record (sold prices,
 * addresses), so there's no non-negotiable non-persistence requirement
 * here the way there is for Income Analyzer — but the default is still
 * "don't persist the raw upload," just as a matter of not hoarding files
 * server-side for no reason. What DOES get saved normally, like any other
 * generated asset, is the final CMA report output.
 */
export interface FileImportCompsInput {
  fileName: string;
  mimeType: string;
  dataUrl: string;
}

/**
 * Input shared by the two not-yet-implemented API-backed providers
 * (`mls-api`, `licensed-data-api`) — this is essentially the original
 * (2026-07-27) `MarketCompFilters` shape, kept as its own named type since
 * only these two providers will ever actually use it as real query params;
 * the import-based providers below don't have "filters" in this sense —
 * whatever comps are in the file are the comps.
 */
export interface MlsQueryCompsInput {
  subjectAddress: string;
  radiusMiles: number;
  dateRangeMonths: number;
  bedsMin?: number;
  bedsMax?: number;
  bathsMin?: number;
  bathsMax?: number;
  sqftTolerancePercent?: number;
  propertyType?: string;
}

/** @deprecated Superseded by `MlsQueryCompsInput` (same shape, renamed to make clear it's specific to the two API-backed providers, not a universal "how comps are filtered" type). Kept only so nothing importing the old name breaks before call sites are updated at implementation time. */
export type MarketCompFilters = MlsQueryCompsInput;

export type ManualCompsProvider = CompsProvider<ManualCompsInput>;
export type CsvImportCompsProvider = CompsProvider<FileImportCompsInput>;
export type ExcelImportCompsProvider = CompsProvider<FileImportCompsInput>;
export type PdfImportCompsProvider = CompsProvider<FileImportCompsInput>;
export type MlsApiCompsProvider = CompsProvider<MlsQueryCompsInput>;
export type LicensedDataCompsProvider = CompsProvider<MlsQueryCompsInput>;

/**
 * Full result of running a Market Comp Analysis for one subject property.
 * `generate.ts`'s `generateMarketCompAnalysis` takes an already-fetched
 * `MarketComp[]` (the output of whichever provider ran) rather than a
 * provider or filters — see that file's updated header comment. `filters`
 * is now optional and only meaningfully populated when the comps came from
 * `mls-api`/`licensed-data-api`; it's `null` for manual/import-sourced
 * analyses, which is expected, not a bug.
 */
export interface MarketCompAnalysisResult {
  subjectPropertyId: string;
  filters: MlsQueryCompsInput | null;
  comps: MarketComp[];
  /** AI-written narrative summarizing the comp set — `null` until generated. */
  aiNarrative: string | null;
  suggestedPriceRange: { low: number; high: number } | null;
  /** ISO datetime string of when this analysis was generated. */
  generatedAt: string;
}

/**
 * Section labels for the (future) Market Comp Analysis PDF export, per the
 * full spec Robert has saved separately. Labels only — no rendering logic,
 * no `@react-pdf/renderer` document component exists for this yet (compare
 * to the real `src/lib/pdf/PaymentSnapshotPdfDocument.tsx`).
 */
export const MARKET_COMP_PDF_SECTIONS = [
  "Executive Summary",
  "Subject Property",
  "Market Snapshot",
  "Comp Grid",
  "Map",
  "Price per Sqft",
  "Days on Market",
  "Trends",
  "Suggested Pricing",
  "AI Narrative",
  "Branding",
  "QR",
  "Contact",
] as const;

export type MarketCompPdfSection = (typeof MARKET_COMP_PDF_SECTIONS)[number];

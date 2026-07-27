/**
 * Market Comp Analysis — TYPES ONLY, v1.1 scaffolding.
 *
 * This feature is explicitly NOT built for real yet (see
 * `src/lib/market-comp/generate.ts`'s stub and
 * `components/property/market-comp/MarketCompComingSoon.tsx`'s UI stub) —
 * this file exists so the eventual real implementation has an
 * already-agreed-upon shape to slot into, not because any of it is wired
 * up to a real comp data source, AI narrative call, or PDF export today.
 */

/** A single comparable sale pulled from a (future) comp data source. */
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
  pricePerSqft: number;
}

/** User-selected criteria for pulling/filtering comps around the subject property. */
export interface MarketCompFilters {
  radiusMiles: number;
  dateRangeMonths: number;
  bedsMin: number;
  bedsMax: number;
  bathsMin: number;
  bathsMax: number;
  sqftTolerancePercent: number;
  propertyType: string;
}

/** Full result of running a Market Comp Analysis for one subject property. */
export interface MarketCompAnalysisResult {
  subjectPropertyId: string;
  filters: MarketCompFilters;
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

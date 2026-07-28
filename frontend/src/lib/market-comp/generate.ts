import type { MarketComp, MarketCompAnalysisResult, MlsQueryCompsInput } from "@/lib/market-comp/types";

/**
 * Stub entry point for the AI CMA analysis engine — NOT implemented yet.
 * Exists so the real implementation has an already-agreed function
 * signature to slot into later (see `src/lib/ai/asset-service.ts`'s header
 * comment for why this isn't wired into that dispatcher yet either).
 *
 * SIGNATURE UPDATED (2026-07-28, provider-abstraction design pass): this
 * now takes an already-fetched, already-normalized `comps: MarketComp[]`
 * — the output of whichever `CompsProvider` ran (manual entry, CSV/Excel/
 * PDF import, or, later, an MLS/licensed-data API) — instead of taking
 * filters and pulling comps itself. This is the whole point of the
 * provider abstraction: this function does comp selection/adjustment/
 * narrative generation on a plain array of normalized comps and never
 * knows or cares which source produced them, so adding a new provider
 * later (MLS API, licensed data) requires zero changes here. `filters` is
 * now optional context for the narrative (e.g. "using comps within 1 mile,
 * sold in the last 6 months") — only meaningful when the comps came from
 * an API-backed provider; `null` for manual/import-sourced runs.
 */
export async function generateMarketCompAnalysis(
  propertyId: string,
  comps: MarketComp[],
  filters: MlsQueryCompsInput | null = null
): Promise<MarketCompAnalysisResult> {
  throw new Error("AI CMA analysis is not yet implemented — provider interface designed 2026-07-28, awaiting sign-off before implementation.");
}

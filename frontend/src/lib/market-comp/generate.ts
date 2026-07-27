import type { MarketCompAnalysisResult, MarketCompFilters } from "@/lib/market-comp/types";

/**
 * Stub entry point for Market Comp Analysis generation — v1.1, NOT
 * implemented. Exists purely so the real implementation has an
 * already-agreed function signature to slot into later (see
 * `src/lib/ai/asset-service.ts`'s header comment for why this isn't wired
 * into that dispatcher yet either). Always throws.
 */
export async function generateMarketCompAnalysis(
  propertyId: string,
  filters: MarketCompFilters
): Promise<MarketCompAnalysisResult> {
  throw new Error("Market Comp Analysis is not yet implemented — planned for v1.1.");
}

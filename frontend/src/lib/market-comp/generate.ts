import { getOpenAIClient } from "@/lib/ai/openai-client";
import { describeOpenAiError } from "@/lib/ai/openai-error";
import type { MarketComp, MarketCompAnalysisResult, MlsQueryCompsInput } from "@/lib/market-comp/types";

/**
 * Real implementation of the AI CMA analysis engine, built 2026-07-28 on
 * top of the provider-abstraction types Robert signed off on. Structurally
 * source-agnostic by design: this function only ever sees the normalized
 * `comps: MarketComp[]` array, never a provider or provider id, so it is
 * incapable of special-casing by source (manual entry vs. CSV vs. Excel vs.
 * PDF vs., later, a real MLS/licensed-data API all flow through identically).
 *
 * Two separate concerns, deliberately kept apart:
 *   1. `suggestedPriceRange` — computed deterministically from the comp
 *      sold-price distribution (25th/75th percentile), never from the AI.
 *      Numbers a user might act on shouldn't depend on a model not
 *      hallucinating math.
 *   2. `aiNarrative` — a written summary of the comp set and what it
 *      suggests about pricing/market conditions. This is the one part that
 *      calls OpenAI, using the same "always return a usable result, demo
 *      content if unconfigured" convention as the rest of the AI surfaces
 *      (`src/lib/ai/ai-service.ts`).
 */

function percentile(sortedValues: number[], p: number): number {
  if (sortedValues.length === 0) return 0;
  if (sortedValues.length === 1) return sortedValues[0];
  const idx = (sortedValues.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sortedValues[lo];
  const frac = idx - lo;
  return sortedValues[lo] + (sortedValues[hi] - sortedValues[lo]) * frac;
}

function computeSuggestedPriceRange(comps: MarketComp[]): { low: number; high: number } {
  const prices = comps.map((c) => c.soldPrice).sort((a, b) => a - b);
  if (prices.length < 3) {
    // Too few comps for a meaningful percentile split — use the full min/max span.
    return { low: Math.round(prices[0]), high: Math.round(prices[prices.length - 1]) };
  }
  return {
    low: Math.round(percentile(prices, 0.25)),
    high: Math.round(percentile(prices, 0.75)),
  };
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function describeCompsForPrompt(comps: MarketComp[], filters: MlsQueryCompsInput | null): string {
  const lines = comps.map(
    (c, i) =>
      `${i + 1}. ${c.address} — sold $${c.soldPrice.toLocaleString()} on ${c.soldDate}, ${c.beds}bd/${c.baths}ba, ${c.sqft.toLocaleString()} sqft ($${c.pricePerSqft}/sqft), ${c.propertyType}${c.distanceMiles ? `, ${c.distanceMiles} mi away` : ""}`
  );

  const parts = [`Comparable sales (${comps.length}):`, ...lines];

  if (filters) {
    parts.push(
      "",
      `Search context: within ${filters.radiusMiles} miles, sold in the last ${filters.dateRangeMonths} months` +
        (filters.propertyType ? `, property type ${filters.propertyType}` : "")
    );
  }

  return parts.join("\n");
}

function buildDemoNarrative(comps: MarketComp[], priceRange: { low: number; high: number }): string {
  const medianPpsf = median(comps.map((c) => c.pricePerSqft));
  return (
    `[Demo narrative — connect an OpenAI API key for a real AI-written summary] ` +
    `Based on ${comps.length} comparable sale${comps.length === 1 ? "" : "s"}, recent sold prices in this area cluster ` +
    `around $${priceRange.low.toLocaleString()}–$${priceRange.high.toLocaleString()}, with a median of roughly $${medianPpsf}/sqft. ` +
    `Review the comp grid below for individual sale details.`
  );
}

const SYSTEM_PROMPT = `You are a real estate market analyst writing the narrative section of a Comparative Market Analysis (CMA) for a real estate agent's client. Given a list of comparable sold properties, write a concise, professional 2-4 sentence summary covering: the general price range and price-per-sqft trend these comps suggest, and any notable pattern (e.g. tight clustering, wide spread, one outlier). Do not invent facts not present in the data. Do not state a specific "recommended list price" — that judgment belongs to the agent. Respond as JSON only: { "narrative": string }.`;

export async function generateMarketCompAnalysis(
  propertyId: string,
  comps: MarketComp[],
  filters: MlsQueryCompsInput | null = null
): Promise<MarketCompAnalysisResult> {
  if (comps.length === 0) {
    throw new Error("Can't generate a CMA with zero comps — add at least one comparable sale first.");
  }

  const suggestedPriceRange = computeSuggestedPriceRange(comps);

  const client = getOpenAIClient();
  let aiNarrative: string;

  if (!client) {
    aiNarrative = buildDemoNarrative(comps, suggestedPriceRange);
  } else {
    try {
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: describeCompsForPrompt(comps, filters) },
        ],
      });

      const raw = completion.choices[0]?.message?.content;
      if (!raw) {
        throw new Error("OpenAI response contained no content.");
      }

      let parsed: { narrative: string };
      try {
        parsed = JSON.parse(raw);
      } catch (err) {
        throw new Error(`Failed to parse OpenAI JSON response: ${(err as Error).message}`);
      }

      aiNarrative = parsed.narrative;
    } catch (err) {
      const { logMessage, userMessage } = describeOpenAiError(err);
      console.error(`[Realtor Toolbox] AI CMA narrative generation failed: ${logMessage}`);
      throw new Error(userMessage);
    }
  }

  return {
    subjectPropertyId: propertyId,
    filters,
    comps,
    aiNarrative,
    suggestedPriceRange,
    generatedAt: new Date().toISOString(),
  };
}

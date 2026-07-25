import { getOpenAIClient } from "@/lib/ai/openai-client";
import type { FlyerTextContent } from "@/lib/supabase/types";

/**
 * Generic AI service abstraction. Every exported function here returns the
 * exact same shape whether `OPENAI_API_KEY` is configured or not — callers
 * (the future Flyer Generator UI, and any other AI-generated-content
 * feature) should never need to branch on mock-vs-real. When no key is
 * configured, functions return clearly-labeled "[Demo]" content built from
 * the real input fields, so the app stays fully demoable.
 */

/** Property fields used as input to every generation function below. */
export interface PropertyAiInput {
  address: string;
  cityStateZip?: string;
  propertyType?: string;
  keyFeatures?: string[];
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  lotSize?: string;
  yearBuilt?: number;
}

export interface HeadlineResult {
  headline: string;
  luxuryHeadline: string;
}

export interface DescriptionResult {
  description: string;
  featureBullets: string[];
  neighborhoodHighlights: string;
  callToAction: string;
}

export type FlyerTextResult = FlyerTextContent;

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function formatPrice(price?: number): string | null {
  if (price == null) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

function propertyTypeLabel(input: PropertyAiInput): string {
  return input.propertyType?.trim() || "home";
}

function defaultFeatureBullets(input: PropertyAiInput): string[] {
  const bullets: string[] = [];
  if (input.bedrooms != null && input.bathrooms != null) {
    bullets.push(`${input.bedrooms} Bedrooms · ${input.bathrooms} Baths`);
  }
  if (input.squareFeet != null) {
    bullets.push(`${input.squareFeet.toLocaleString()} sqft of living space`);
  }
  if (input.lotSize) {
    bullets.push(`Set on ${input.lotSize}`);
  }
  if (input.yearBuilt != null) {
    bullets.push(`Built in ${input.yearBuilt}`);
  }
  if (input.keyFeatures?.length) {
    bullets.push(...input.keyFeatures);
  }
  return bullets;
}

/**
 * Calls the OpenAI Chat Completions API and parses a JSON object response.
 * Centralizes the "ask for JSON, parse it, throw a clear error if the model
 * didn't comply" logic so `generateHeadline`/`generateDescription` stay
 * focused on prompt content.
 */
async function requestJson<T>(params: { system: string; user: string }): Promise<T> {
  const client = getOpenAIClient();
  if (!client) {
    throw new Error("OpenAI client requested without OPENAI_API_KEY configured — check isOpenAIConfigured first.");
  }

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: params.system },
      { role: "user", content: params.user },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("OpenAI response contained no content.");
  }

  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    throw new Error(`Failed to parse OpenAI JSON response: ${(err as Error).message}`);
  }
}

function describeInputForPrompt(input: PropertyAiInput): string {
  const parts = [
    `Address: ${input.address}${input.cityStateZip ? `, ${input.cityStateZip}` : ""}`,
    `Property type: ${propertyTypeLabel(input)}`,
  ];
  const price = formatPrice(input.price);
  if (price) parts.push(`Price: ${price}`);
  if (input.bedrooms != null) parts.push(`Bedrooms: ${input.bedrooms}`);
  if (input.bathrooms != null) parts.push(`Bathrooms: ${input.bathrooms}`);
  if (input.squareFeet != null) parts.push(`Square feet: ${input.squareFeet}`);
  if (input.lotSize) parts.push(`Lot size: ${input.lotSize}`);
  if (input.yearBuilt != null) parts.push(`Year built: ${input.yearBuilt}`);
  if (input.keyFeatures?.length) parts.push(`Key features: ${input.keyFeatures.join(", ")}`);
  return parts.join("\n");
}

// ---------------------------------------------------------------------------
// AIService
// ---------------------------------------------------------------------------

export const AIService = {
  /**
   * Generates a standard headline and a separate, more luxury-toned
   * headline for the same property.
   */
  async generateHeadline(input: PropertyAiInput): Promise<HeadlineResult> {
    if (!getOpenAIClient()) {
      const type = propertyTypeLabel(input);
      return {
        headline: `[Demo] Stunning ${type} at ${input.address}`,
        luxuryHeadline: `[Demo] An Extraordinary Offering at ${input.address}`,
      };
    }

    return requestJson<HeadlineResult>({
      system:
        "You are an expert real estate copywriter. Given property details, write two headlines for a marketing flyer: " +
        '`headline` (a punchy, standard real-estate listing headline) and `luxuryHeadline` (a more evocative, high-end/luxury-toned ' +
        "alternative for the same property). Respond as JSON: { \"headline\": string, \"luxuryHeadline\": string }.",
      user: describeInputForPrompt(input),
    });
  },

  /**
   * Generates the flyer body copy: description, feature bullets,
   * neighborhood highlights, and a call to action.
   */
  async generateDescription(input: PropertyAiInput): Promise<DescriptionResult> {
    if (!getOpenAIClient()) {
      const type = propertyTypeLabel(input);
      const price = formatPrice(input.price);
      return {
        description:
          `[Demo] Welcome to ${input.address}, a beautifully presented ${type}` +
          `${price ? ` offered at ${price}` : ""}. This description is placeholder demo copy — ` +
          `connect an OpenAI API key to generate real AI copy from this property's details.`,
        featureBullets: defaultFeatureBullets(input),
        neighborhoodHighlights: `[Demo] Conveniently located near shopping, dining, and top-rated schools in ${
          input.cityStateZip || "the area"
        }.`,
        callToAction: "[Demo] Schedule your private showing today.",
      };
    }

    return requestJson<DescriptionResult>({
      system:
        "You are an expert real estate copywriter. Given property details, write flyer body copy. Respond as JSON: " +
        '{ "description": string (a 2-4 sentence listing description), "featureBullets": string[] (short punchy feature bullets), ' +
        '"neighborhoodHighlights": string (1-2 sentences about the surrounding area), "callToAction": string (a short closing CTA) }.',
      user: describeInputForPrompt(input),
    });
  },

  /**
   * Convenience wrapper combining `generateHeadline` and
   * `generateDescription` into the single shape the Flyer Generator UI
   * consumes directly.
   */
  async generateFlyerText(input: PropertyAiInput): Promise<FlyerTextResult> {
    const [{ headline, luxuryHeadline }, { description, featureBullets, neighborhoodHighlights, callToAction }] =
      await Promise.all([this.generateHeadline(input), this.generateDescription(input)]);

    return {
      headline,
      luxuryHeadline,
      description,
      featureBullets,
      neighborhoodHighlights,
      callToAction,
    };
  },
};

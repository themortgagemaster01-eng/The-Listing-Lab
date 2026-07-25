import { AIService, type PropertyAiInput, type FlyerTextResult } from "@/lib/ai/ai-service";

/**
 * Generic entry point for "generate a marketing asset" requests, mirroring
 * the shared `marketing_assets` table (one row type per asset_type, with
 * type-specific data in a child table — see supabase/migrations/0001_init.sql).
 *
 * This is intentionally a single switch-like dispatcher rather than one
 * function per asset type: the Flyer Generator UI (and, later, Social Post /
 * Property Website / Payment Snapshot generators) can all call this one
 * function with a `type` discriminant instead of the caller needing to know
 * which service function maps to which feature.
 *
 * Only `'flyer'` is implemented today. Adding Payment Snapshot, Website, or
 * Social Media support later means adding a new `case` below that calls
 * that feature's own generation function — NOT restructuring this function
 * or its signature.
 */

export type AssetType = "flyer" | "social_post" | "website" | "payment_snapshot";

export interface GenerateAssetParams {
  type: AssetType;
  propertyId: string;
  inputs: Record<string, any>;
}

export type GenerateAssetResult<T extends AssetType> = T extends "flyer" ? FlyerTextResult : never;

export async function generateAsset<T extends AssetType>(
  params: GenerateAssetParams & { type: T }
): Promise<GenerateAssetResult<T>> {
  const { type, inputs } = params;

  switch (type) {
    case "flyer": {
      const result = await AIService.generateFlyerText(inputs as PropertyAiInput);
      return result as GenerateAssetResult<T>;
    }

    // Future cases — each should call its own dedicated generation function
    // once that feature is built, following the same pattern as 'flyer':
    //   case "social_post":
    //     return AIService.generateSocialPost(inputs) as GenerateAssetResult<T>;
    //   case "website":
    //     return AIService.generateWebsiteCopy(inputs) as GenerateAssetResult<T>;
    //   case "payment_snapshot":
    //     return AIService.generatePaymentSnapshot(inputs) as GenerateAssetResult<T>;

    default:
      throw new Error(`Not yet implemented for type: ${type}`);
  }
}

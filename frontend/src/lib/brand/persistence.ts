import { isSupabaseConfigured } from "@/lib/supabase/client";
import { describeSupabaseError } from "@/lib/supabase/errors";
import { emptyBrandProfileForm, type BrandProfileFormData } from "@/lib/brand/types";
import { loadBrandProfileLocal, saveBrandProfileLocal } from "@/lib/brand/local-store";
import { fetchBrandProfileSupabase, saveBrandProfileSupabase, uploadBrandAssetToStorage } from "@/lib/brand/supabase-store";

/**
 * The ONE place the Brand Center UI branches on Supabase-vs-local
 * persistence — same "always resolves successfully, falls back to
 * localStorage on any failure" contract as `src/lib/flyer/persistence.ts`.
 * UI components never import `local-store.ts` / `supabase-store.ts`
 * directly.
 */

export async function loadBrandProfile(): Promise<BrandProfileFormData> {
  if (isSupabaseConfigured) {
    try {
      const remote = await fetchBrandProfileSupabase();
      if (remote) return remote;
      return emptyBrandProfileForm();
    } catch (err) {
      console.error(
        `[Listing Lab] Supabase read from 'brand_profiles' failed: ${describeSupabaseError(err)}. Falling back to local storage.`
      );
    }
  }
  return loadBrandProfileLocal() ?? emptyBrandProfileForm();
}

export async function saveBrandProfile(form: BrandProfileFormData): Promise<void> {
  saveBrandProfileLocal(form);
  if (isSupabaseConfigured) {
    try {
      await saveBrandProfileSupabase(form);
    } catch (err) {
      console.error(
        `[Listing Lab] Supabase write to 'brand_profiles' failed: ${describeSupabaseError(err)}. Changes were saved to local storage only.`
      );
    }
  }
}

/** Uploads an image (as a data URL) for a Brand Center asset field. Falls back to returning the data URL itself (stored inline) when Supabase isn't configured or the upload fails. */
export async function uploadBrandAsset(assetName: string, dataUrl: string): Promise<string> {
  if (isSupabaseConfigured) {
    try {
      return await uploadBrandAssetToStorage(assetName, dataUrl);
    } catch (err) {
      console.error(
        `[Listing Lab] Supabase Storage upload for brand asset '${assetName}' failed: ${describeSupabaseError(err)}. Using the local data URL instead.`
      );
    }
  }
  return dataUrl;
}

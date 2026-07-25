import { isSupabaseConfigured } from "@/lib/supabase/client";
import { describeSupabaseError } from "@/lib/supabase/errors";
import type { FlyerPhoto, FlyerRecord, PropertyFormData } from "@/lib/flyer/types";
import {
  loadFlyersLocal,
  loadPhotosLocal,
  loadPropertyFormLocal,
  savePropertyFormLocal,
  savePhotosLocal,
  saveFlyersLocal,
} from "@/lib/flyer/local-store";
import {
  fetchPropertyFormSupabase,
  savePropertyFormSupabase,
  fetchPhotosSupabase,
  savePhotosSupabase,
  fetchFlyersSupabase,
  saveFlyerSupabase,
  deleteFlyerSupabase,
} from "@/lib/flyer/supabase-store";

/**
 * The ONE place the Flyer Generator UI branches on Supabase-vs-local
 * persistence (per the task's "everything must degrade gracefully"
 * constraint — every function here always resolves successfully, falling
 * back to `localStorage` if Supabase is unconfigured OR if a Supabase call
 * throws for any reason, e.g. the "mock slug id isn't a real uuid" gap
 * documented in `supabase-store.ts`). UI components never import
 * `local-store.ts` / `supabase-store.ts` directly.
 *
 * Every fallback below is logged with `console.error` via
 * `describeSupabaseError` (real code/message/details from the Supabase
 * client — bad key, wrong project, missing table because migrations
 * haven't been run, network failure, etc.) so a failure is loud and
 * specific in server/browser logs, even though the user-facing behavior
 * stays a silent, graceful fallback to local storage.
 */

// ---------------------------------------------------------------------------
// Property form
// ---------------------------------------------------------------------------

export async function loadPropertyForm(propertyId: string): Promise<PropertyFormData | null> {
  if (isSupabaseConfigured) {
    try {
      const remote = await fetchPropertyFormSupabase(propertyId);
      if (remote) return remote;
    } catch (err) {
      console.error(
        `[Listing Lab] Supabase read from 'properties' failed: ${describeSupabaseError(err)}. Falling back to local storage.`
      );
    }
  }
  return loadPropertyFormLocal(propertyId);
}

export async function savePropertyForm(propertyId: string, form: PropertyFormData): Promise<void> {
  savePropertyFormLocal(propertyId, form);
  if (isSupabaseConfigured) {
    try {
      await savePropertyFormSupabase(propertyId, form);
    } catch (err) {
      console.error(
        `[Listing Lab] Supabase write to 'properties' failed: ${describeSupabaseError(err)}. Falling back to local storage (local copy already saved).`
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Photos
// ---------------------------------------------------------------------------

export async function loadPhotos(propertyId: string): Promise<FlyerPhoto[]> {
  if (isSupabaseConfigured) {
    try {
      return await fetchPhotosSupabase(propertyId);
    } catch (err) {
      console.error(
        `[Listing Lab] Supabase read from 'photos' failed: ${describeSupabaseError(err)}. Falling back to local storage.`
      );
    }
  }
  return loadPhotosLocal(propertyId);
}

export async function savePhotos(propertyId: string, photos: FlyerPhoto[]): Promise<FlyerPhoto[]> {
  savePhotosLocal(propertyId, photos);
  if (isSupabaseConfigured) {
    try {
      const resolved = await savePhotosSupabase(propertyId, photos);
      savePhotosLocal(propertyId, resolved);
      return resolved;
    } catch (err) {
      console.error(
        `[Listing Lab] Supabase write to 'photos' (or 'property-photos' storage bucket) failed: ${describeSupabaseError(err)}. Falling back to local storage (local copy already saved).`
      );
    }
  }
  return photos;
}

// ---------------------------------------------------------------------------
// Flyers
// ---------------------------------------------------------------------------

export async function loadFlyers(propertyId: string): Promise<FlyerRecord[]> {
  if (isSupabaseConfigured) {
    try {
      const remote = await fetchFlyersSupabase(propertyId);
      if (remote.length > 0) return remote;
    } catch (err) {
      console.error(
        `[Listing Lab] Supabase read from 'marketing_assets'/'flyers' failed: ${describeSupabaseError(err)}. Falling back to local storage.`
      );
    }
  }
  return loadFlyersLocal(propertyId);
}

export async function saveFlyer(propertyId: string, flyer: FlyerRecord, allFlyers: FlyerRecord[]): Promise<void> {
  saveFlyersLocal(propertyId, allFlyers);
  if (isSupabaseConfigured) {
    try {
      const cover = await loadPhotos(propertyId);
      const thumbnailUrl = cover.find((p) => p.isCover)?.url ?? cover[0]?.url ?? null;
      await saveFlyerSupabase(flyer, thumbnailUrl);
    } catch (err) {
      console.error(
        `[Listing Lab] Supabase write to 'marketing_assets'/'flyers' failed: ${describeSupabaseError(err)}. Falling back to local storage (local copy already saved).`
      );
    }
  }
}

export async function deleteFlyer(propertyId: string, flyer: FlyerRecord, remaining: FlyerRecord[]): Promise<void> {
  saveFlyersLocal(propertyId, remaining);
  if (isSupabaseConfigured) {
    try {
      await deleteFlyerSupabase(flyer);
    } catch (err) {
      console.error(
        `[Listing Lab] Supabase delete from 'marketing_assets'/'flyers' failed: ${describeSupabaseError(err)}. Falling back to local storage (local copy already reflects the deletion).`
      );
    }
  }
}

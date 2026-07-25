import { isSupabaseConfigured } from "@/lib/supabase/client";
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
 */

// ---------------------------------------------------------------------------
// Property form
// ---------------------------------------------------------------------------

export async function loadPropertyForm(propertyId: string): Promise<PropertyFormData | null> {
  if (isSupabaseConfigured) {
    try {
      const remote = await fetchPropertyFormSupabase(propertyId);
      if (remote) return remote;
    } catch {
      // Fall through to local storage below.
    }
  }
  return loadPropertyFormLocal(propertyId);
}

export async function savePropertyForm(propertyId: string, form: PropertyFormData): Promise<void> {
  savePropertyFormLocal(propertyId, form);
  if (isSupabaseConfigured) {
    try {
      await savePropertyFormSupabase(propertyId, form);
    } catch {
      // Local copy above already has the latest edits — safe to ignore here.
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
    } catch {
      // Fall through to local storage below.
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
    } catch {
      // Local copy above already has the latest state.
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
    } catch {
      // Fall through to local storage below.
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
    } catch {
      // Local copy above already has the latest state.
    }
  }
}

export async function deleteFlyer(propertyId: string, flyer: FlyerRecord, remaining: FlyerRecord[]): Promise<void> {
  saveFlyersLocal(propertyId, remaining);
  if (isSupabaseConfigured) {
    try {
      await deleteFlyerSupabase(flyer);
    } catch {
      // Local copy above already reflects the deletion.
    }
  }
}

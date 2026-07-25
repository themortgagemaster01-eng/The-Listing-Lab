import type { PropertyFormData, FlyerPhoto, FlyerRecord } from "@/lib/flyer/types";

/**
 * `localStorage`-backed persistence for the Flyer Generator's "no Supabase
 * configured" demo mode — same approach as `src/context/theme-context.tsx`
 * (guard every access behind `typeof window`, JSON in/out, namespaced key).
 *
 * `localStorage` writes can throw (quota exceeded — realistic here since
 * photos are stored as base64 data URLs) or be unavailable (SSR, privacy
 * mode). Every write is wrapped so a failure degrades to an in-memory-only
 * cache for the current page session rather than crashing the app or
 * losing the user's edits mid-session.
 */

const memoryFallback = new Map<string, string>();

function readKey(key: string): string | null {
  if (typeof window === "undefined") return memoryFallback.get(key) ?? null;
  try {
    return window.localStorage.getItem(key) ?? memoryFallback.get(key) ?? null;
  } catch {
    return memoryFallback.get(key) ?? null;
  }
}

function writeKey(key: string, value: string): void {
  memoryFallback.set(key, value);
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Quota exceeded or storage disabled — memoryFallback above still holds
    // the latest value for the rest of this page session.
  }
}

function formKey(propertyId: string) {
  return `listing-lab:flyer:form:${propertyId}`;
}
function photosKey(propertyId: string) {
  return `listing-lab:flyer:photos:${propertyId}`;
}
function flyersKey(propertyId: string) {
  return `listing-lab:flyer:records:${propertyId}`;
}

export function loadPropertyFormLocal(propertyId: string): PropertyFormData | null {
  const raw = readKey(formKey(propertyId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PropertyFormData;
  } catch {
    return null;
  }
}

export function savePropertyFormLocal(propertyId: string, form: PropertyFormData): void {
  writeKey(formKey(propertyId), JSON.stringify(form));
}

export function loadPhotosLocal(propertyId: string): FlyerPhoto[] {
  const raw = readKey(photosKey(propertyId));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as FlyerPhoto[];
  } catch {
    return [];
  }
}

export function savePhotosLocal(propertyId: string, photos: FlyerPhoto[]): void {
  writeKey(photosKey(propertyId), JSON.stringify(photos));
}

export function loadFlyersLocal(propertyId: string): FlyerRecord[] {
  const raw = readKey(flyersKey(propertyId));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as FlyerRecord[];
  } catch {
    return [];
  }
}

export function saveFlyersLocal(propertyId: string, flyers: FlyerRecord[]): void {
  writeKey(flyersKey(propertyId), JSON.stringify(flyers));
}

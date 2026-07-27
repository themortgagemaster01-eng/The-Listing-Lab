import type { WebsiteRecord } from "@/lib/website/types";

/**
 * `localStorage`-backed persistence for the Property Website Generator's
 * "no Supabase configured" demo mode — identical approach to
 * `src/lib/payment/local-store.ts` (guard every access behind `typeof
 * window`, JSON in/out, namespaced key, in-memory fallback so a write never
 * throws/crashes the UI even if `localStorage` is unavailable or over
 * quota).
 *
 * Unlike `payment/local-store.ts` (which stores an array of snapshots),
 * this stores a single record — a property has at most one "current"
 * website (see `WebsiteRecord`'s header comment).
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

function removeKey(key: string): void {
  memoryFallback.delete(key);
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Same "best-effort" contract as writeKey above.
  }
}

function websiteKey(propertyId: string) {
  return `listing-lab:website:record:${propertyId}`;
}

export function loadWebsiteLocal(propertyId: string): WebsiteRecord | null {
  const raw = readKey(websiteKey(propertyId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as WebsiteRecord;
  } catch {
    return null;
  }
}

export function saveWebsiteLocal(propertyId: string, record: WebsiteRecord): void {
  writeKey(websiteKey(propertyId), JSON.stringify(record));
}

export function deleteWebsiteLocal(propertyId: string): void {
  removeKey(websiteKey(propertyId));
}

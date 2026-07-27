import type { BrandProfileFormData } from "@/lib/brand/types";

/**
 * `localStorage`-backed fallback for Brand Center — same pattern as
 * `src/lib/flyer/local-store.ts` (guard every access behind `typeof
 * window`, JSON in/out, namespaced key, in-memory fallback if
 * `localStorage` throws). Used when Supabase isn't configured, or a
 * Supabase call fails, so the form never loses the user's edits.
 *
 * Keyed by a single fixed key (not per-property, unlike the flyer store) —
 * Brand Center is one profile per browser in local/demo mode, matching the
 * one-profile-per-account shape it has once Supabase is configured.
 */

const STORAGE_KEY = "listing-lab:brand:profile";
const memoryFallback = new Map<string, string>();

function readKey(): string | null {
  if (typeof window === "undefined") return memoryFallback.get(STORAGE_KEY) ?? null;
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? memoryFallback.get(STORAGE_KEY) ?? null;
  } catch {
    return memoryFallback.get(STORAGE_KEY) ?? null;
  }
}

function writeKey(value: string): void {
  memoryFallback.set(STORAGE_KEY, value);
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Quota exceeded or storage disabled — memoryFallback still holds the
    // latest value for the rest of this page session.
  }
}

export function loadBrandProfileLocal(): BrandProfileFormData | null {
  const raw = readKey();
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BrandProfileFormData;
  } catch {
    return null;
  }
}

export function saveBrandProfileLocal(form: BrandProfileFormData): void {
  writeKey(JSON.stringify(form));
}

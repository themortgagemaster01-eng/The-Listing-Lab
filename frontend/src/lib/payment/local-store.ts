import type { PaymentSnapshotRecord } from "@/lib/payment/types";

/**
 * `localStorage`-backed persistence for the Payment Snapshot feature's "no
 * Supabase configured" demo mode — identical approach to
 * `src/lib/flyer/local-store.ts` (guard every access behind `typeof
 * window`, JSON in/out, namespaced key, in-memory fallback so a write never
 * throws/crashes the UI even if `localStorage` is unavailable or over
 * quota).
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

function snapshotsKey(propertyId: string) {
  return `listing-lab:payment:snapshots:${propertyId}`;
}

export function loadPaymentSnapshotsLocal(propertyId: string): PaymentSnapshotRecord[] {
  const raw = readKey(snapshotsKey(propertyId));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as PaymentSnapshotRecord[];
  } catch {
    return [];
  }
}

export function savePaymentSnapshotsLocal(propertyId: string, snapshots: PaymentSnapshotRecord[]): void {
  writeKey(snapshotsKey(propertyId), JSON.stringify(snapshots));
}

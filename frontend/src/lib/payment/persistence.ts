import { isSupabaseConfigured } from "@/lib/supabase/client";
import { describeSupabaseError } from "@/lib/supabase/errors";
import type { PaymentSnapshotRecord } from "@/lib/payment/types";
import { loadPaymentSnapshotsLocal, savePaymentSnapshotsLocal } from "@/lib/payment/local-store";
import {
  fetchPaymentSnapshotsSupabase,
  savePaymentSnapshotSupabase,
  deletePaymentSnapshotSupabase,
} from "@/lib/payment/supabase-store";

/**
 * The ONE place the Payment Snapshot UI branches on Supabase-vs-local
 * persistence — mirrors `src/lib/flyer/persistence.ts` exactly, including
 * its philosophy: every function here always resolves successfully. A
 * Supabase write is best-effort — on failure it's logged via
 * `describeSupabaseError` (loud/specific in logs) and silently falls back
 * to `localStorage`, whose write already happened first. UI components
 * never import `local-store.ts` / `supabase-store.ts` directly.
 */

export async function loadPaymentSnapshots(propertyId: string): Promise<PaymentSnapshotRecord[]> {
  if (isSupabaseConfigured) {
    try {
      const remote = await fetchPaymentSnapshotsSupabase(propertyId);
      if (remote.length > 0) return remote;
    } catch (err) {
      console.error(
        `[Listing Lab] Supabase read from 'marketing_assets'/'payment_snapshots' failed: ${describeSupabaseError(err)}. Falling back to local storage.`
      );
    }
  }
  return loadPaymentSnapshotsLocal(propertyId);
}

export async function savePaymentSnapshot(
  propertyId: string,
  snapshot: PaymentSnapshotRecord,
  allSnapshots: PaymentSnapshotRecord[]
): Promise<void> {
  savePaymentSnapshotsLocal(propertyId, allSnapshots);
  if (isSupabaseConfigured) {
    try {
      await savePaymentSnapshotSupabase(snapshot);
    } catch (err) {
      console.error(
        `[Listing Lab] Supabase write to 'marketing_assets'/'payment_snapshots' failed: ${describeSupabaseError(err)}. Falling back to local storage (local copy already saved).`
      );
    }
  }
}

export async function deletePaymentSnapshot(
  propertyId: string,
  snapshot: PaymentSnapshotRecord,
  remaining: PaymentSnapshotRecord[]
): Promise<void> {
  savePaymentSnapshotsLocal(propertyId, remaining);
  if (isSupabaseConfigured) {
    try {
      await deletePaymentSnapshotSupabase(snapshot);
    } catch (err) {
      console.error(
        `[Listing Lab] Supabase delete from 'marketing_assets'/'payment_snapshots' failed: ${describeSupabaseError(err)}. Falling back to local storage (local copy already reflects the deletion).`
      );
    }
  }
}

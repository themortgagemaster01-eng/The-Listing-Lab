import { getSupabaseClient } from "@/lib/supabase/client";
import { mapPaymentSnapshotRow, type PaymentSnapshotRow } from "@/lib/supabase/types";
import type { PaymentFormData, PaymentSnapshotRecord, PaymentSnapshotResults } from "@/lib/payment/types";

/**
 * Supabase-backed persistence for the Payment Snapshot feature. Used by
 * `src/lib/payment/persistence.ts` only when `isSupabaseConfigured` is
 * true — never imported directly by UI components. Mirrors
 * `src/lib/flyer/supabase-store.ts`'s `marketing_assets` + child-table
 * pattern exactly (see that file's header comment for the "mock slug id
 * isn't a real uuid" known gap, which applies identically here).
 */

function requireClient() {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase is not configured.");
  return client;
}

interface MarketingAssetWithSnapshot {
  id: string;
  property_id: string;
  title: string | null;
  thumbnail_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  payment_snapshots: PaymentSnapshotRow[] | PaymentSnapshotRow | null;
}

function toSnapshotRecord(row: MarketingAssetWithSnapshot): PaymentSnapshotRecord | null {
  const snapshotRow = Array.isArray(row.payment_snapshots) ? row.payment_snapshots[0] : row.payment_snapshots;
  if (!snapshotRow) return null;
  const snapshot = mapPaymentSnapshotRow(snapshotRow);
  return {
    id: snapshot.id,
    marketingAssetId: row.id,
    propertyId: row.property_id,
    title: row.title ?? "Untitled Payment Snapshot",
    inputs: snapshot.inputs as unknown as PaymentFormData,
    results: (snapshot.results as unknown as PaymentSnapshotResults) ?? null,
    pdfUrl: snapshot.pdfUrl,
    status: (row.status as PaymentSnapshotRecord["status"]) || "draft",
    version: snapshot.version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchPaymentSnapshotsSupabase(propertyId: string): Promise<PaymentSnapshotRecord[]> {
  const client = requireClient();
  const { data, error } = await client
    .from("marketing_assets")
    .select("*, payment_snapshots(*)")
    .eq("property_id", propertyId)
    .eq("asset_type", "payment_snapshot")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return ((data as MarketingAssetWithSnapshot[]) ?? [])
    .map(toSnapshotRecord)
    .filter((record): record is PaymentSnapshotRecord => record !== null);
}

export async function savePaymentSnapshotSupabase(record: PaymentSnapshotRecord): Promise<void> {
  const client = requireClient();

  const { error: assetErr } = await client.from("marketing_assets").upsert(
    {
      id: record.marketingAssetId,
      property_id: record.propertyId,
      asset_type: "payment_snapshot",
      title: record.title,
      thumbnail_url: null,
      status: record.status,
    },
    { onConflict: "id" }
  );
  if (assetErr) throw assetErr;

  const { error: snapshotErr } = await client.from("payment_snapshots").upsert(
    {
      id: record.id,
      marketing_asset_id: record.marketingAssetId,
      property_id: record.propertyId,
      inputs: record.inputs,
      results: record.results,
      pdf_url: record.pdfUrl,
      version: record.version,
    },
    { onConflict: "id" }
  );
  if (snapshotErr) throw snapshotErr;
}

export async function deletePaymentSnapshotSupabase(record: PaymentSnapshotRecord): Promise<void> {
  const client = requireClient();
  // Cascades to the `payment_snapshots` row via `on delete cascade`.
  const { error } = await client.from("marketing_assets").delete().eq("id", record.marketingAssetId);
  if (error) throw error;
}

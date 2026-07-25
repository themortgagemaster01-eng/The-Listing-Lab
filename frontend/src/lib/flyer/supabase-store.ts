import { getSupabaseClient } from "@/lib/supabase/client";
import {
  mapFlyerRow,
  mapPhotoRow,
  mapPropertyRow,
  type FlyerRow,
  type PhotoRow,
  type PropertyRow,
} from "@/lib/supabase/types";
import { emptyPropertyForm, type FlyerPhoto, type FlyerRecord, type PropertyFormData } from "@/lib/flyer/types";
import { parseIntField, parseNumberField } from "@/lib/flyer/mappers";

/**
 * Supabase-backed persistence for the Flyer Generator. Used by
 * `src/lib/flyer/persistence.ts` only when `isSupabaseConfigured` is true —
 * never imported directly by UI components.
 *
 * KNOWN GAP (documented rather than silently broken, same spirit as the
 * gaps called out in `mapPropertyRowToMockProperty`): `properties.id` is a
 * real Postgres `uuid`, but every property currently in the app comes from
 * the slug ids in `src/lib/mock-data.ts` (e.g. `"123-main-street"`), and
 * there is no "create a real Supabase property" flow yet anywhere in the
 * app. These functions are written to be correct against the schema in
 * `supabase/migrations/0001_init.sql` for whenever that flow exists, but
 * until then, calling them with a mock slug id will fail (uuid parse error)
 * — `persistence.ts` catches that and falls back to local/mock storage so
 * the UI never breaks either way.
 */

const PHOTOS_BUCKET = "property-photos";

function requireClient() {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase is not configured.");
  return client;
}

// ---------------------------------------------------------------------------
// Property form
// ---------------------------------------------------------------------------

function propertyRowToForm(row: PropertyRow): PropertyFormData {
  const mapped = mapPropertyRow(row);
  return emptyPropertyForm({
    address: mapped.address,
    mlsNumber: mapped.mlsNumber ?? "",
    price: mapped.price != null ? String(mapped.price) : "",
    bedrooms: mapped.bedrooms != null ? String(mapped.bedrooms) : "",
    bathrooms: mapped.bathrooms != null ? String(mapped.bathrooms) : "",
    squareFeet: mapped.squareFeet != null ? String(mapped.squareFeet) : "",
    lotSize: mapped.lotSize ?? "",
    yearBuilt: mapped.yearBuilt != null ? String(mapped.yearBuilt) : "",
    propertyType: mapped.propertyType ?? "",
    keyFeatures: mapped.keyFeatures,
    agentName: mapped.agentName ?? "",
    agentEmail: mapped.agentEmail ?? "",
    agentPhone: mapped.agentPhone ?? "",
    agentPhotoUrl: mapped.agentPhotoUrl ?? "",
  });
}

export async function fetchPropertyFormSupabase(propertyId: string): Promise<PropertyFormData | null> {
  const client = requireClient();
  const { data, error } = await client.from("properties").select("*").eq("id", propertyId).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return propertyRowToForm(data as PropertyRow);
}

export async function savePropertyFormSupabase(propertyId: string, form: PropertyFormData): Promise<void> {
  const client = requireClient();
  const payload = {
    id: propertyId,
    address: form.address,
    mls_number: form.mlsNumber || null,
    price: parseNumberField(form.price) ?? null,
    bedrooms: parseIntField(form.bedrooms) ?? null,
    bathrooms: parseNumberField(form.bathrooms) ?? null,
    square_feet: parseIntField(form.squareFeet) ?? null,
    lot_size: form.lotSize || null,
    year_built: parseIntField(form.yearBuilt) ?? null,
    property_type: form.propertyType || null,
    key_features: form.keyFeatures,
    agent_name: form.agentName || null,
    agent_email: form.agentEmail || null,
    agent_phone: form.agentPhone || null,
    agent_photo_url: form.agentPhotoUrl || null,
  };
  const { error } = await client.from("properties").upsert(payload, { onConflict: "id" });
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Photo storage upload helper (shared by photos + agent headshot)
// ---------------------------------------------------------------------------

/** Uploads a data URL to Supabase Storage and returns its public URL. Falls back to the data URL itself on any failure. */
export async function uploadDataUrlToStorage(path: string, dataUrl: string): Promise<string> {
  const client = requireClient();
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const { error } = await client.storage.from(PHOTOS_BUCKET).upload(path, blob, {
    upsert: true,
    contentType: blob.type || "image/jpeg",
  });
  if (error) throw error;
  const { data } = client.storage.from(PHOTOS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// ---------------------------------------------------------------------------
// Photos
// ---------------------------------------------------------------------------

export async function fetchPhotosSupabase(propertyId: string): Promise<FlyerPhoto[]> {
  const client = requireClient();
  const { data, error } = await client
    .from("photos")
    .select("*")
    .eq("property_id", propertyId)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data as PhotoRow[]).map((row) => {
    const mapped = mapPhotoRow(row);
    return { id: mapped.id, url: mapped.url, displayOrder: mapped.displayOrder, isCover: mapped.isCover };
  });
}

/**
 * Upserts the full photo list for a property (uploads any photo whose
 * `url` is still a local data URL, then writes all rows' order/cover
 * state). Simplistic "replace the set" approach — fine at this scale
 * (a handful of listing photos), not built for high-frequency concurrent
 * editors.
 */
export async function savePhotosSupabase(propertyId: string, photos: FlyerPhoto[]): Promise<FlyerPhoto[]> {
  const client = requireClient();
  const resolved: FlyerPhoto[] = [];

  for (const photo of photos) {
    let url = photo.url;
    if (url.startsWith("data:")) {
      const path = `${propertyId}/${photo.id}.jpg`;
      url = await uploadDataUrlToStorage(path, url);
    }
    resolved.push({ ...photo, url });
  }

  const { data: existing, error: fetchErr } = await client
    .from("photos")
    .select("id")
    .eq("property_id", propertyId);
  if (fetchErr) throw fetchErr;

  const keepIds = new Set(resolved.map((p) => p.id));
  const toDelete = ((existing as { id: string }[]) ?? []).filter((row) => !keepIds.has(row.id)).map((row) => row.id);
  if (toDelete.length > 0) {
    const { error: deleteErr } = await client.from("photos").delete().in("id", toDelete);
    if (deleteErr) throw deleteErr;
  }

  if (resolved.length > 0) {
    const payload = resolved.map((photo) => ({
      id: photo.id,
      property_id: propertyId,
      storage_path: photo.url.startsWith("data:") ? "" : photo.url,
      url: photo.url,
      display_order: photo.displayOrder,
      is_cover: photo.isCover,
    }));
    const { error: upsertErr } = await client.from("photos").upsert(payload, { onConflict: "id" });
    if (upsertErr) throw upsertErr;
  }

  return resolved;
}

// ---------------------------------------------------------------------------
// Flyers (marketing_assets + flyers)
// ---------------------------------------------------------------------------

interface MarketingAssetWithFlyer {
  id: string;
  property_id: string;
  title: string | null;
  thumbnail_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  flyers: FlyerRow[] | FlyerRow | null;
}

function toFlyerRecord(row: MarketingAssetWithFlyer): FlyerRecord | null {
  const flyerRow = Array.isArray(row.flyers) ? row.flyers[0] : row.flyers;
  if (!flyerRow) return null;
  const flyer = mapFlyerRow(flyerRow);
  return {
    id: flyer.id,
    marketingAssetId: row.id,
    propertyId: row.property_id,
    title: row.title ?? "Untitled Flyer",
    template: (flyer.template as FlyerRecord["template"]) || "modern",
    aiGeneratedText: flyer.aiGeneratedText,
    userEditedText: flyer.userEditedText,
    pdfDataUrl: null,
    pdfUrl: flyer.pdfUrl,
    status: (row.status as FlyerRecord["status"]) || "draft",
    version: flyer.version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    history: [],
  };
}

export async function fetchFlyersSupabase(propertyId: string): Promise<FlyerRecord[]> {
  const client = requireClient();
  const { data, error } = await client
    .from("marketing_assets")
    .select("*, flyers(*)")
    .eq("property_id", propertyId)
    .eq("asset_type", "flyer")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return ((data as MarketingAssetWithFlyer[]) ?? [])
    .map(toFlyerRecord)
    .filter((record): record is FlyerRecord => record !== null);
}

export async function saveFlyerSupabase(record: FlyerRecord, thumbnailUrl: string | null): Promise<void> {
  const client = requireClient();

  const { error: assetErr } = await client.from("marketing_assets").upsert(
    {
      id: record.marketingAssetId,
      property_id: record.propertyId,
      asset_type: "flyer",
      title: record.title,
      thumbnail_url: thumbnailUrl,
      status: record.status,
    },
    { onConflict: "id" }
  );
  if (assetErr) throw assetErr;

  const { error: flyerErr } = await client.from("flyers").upsert(
    {
      id: record.id,
      marketing_asset_id: record.marketingAssetId,
      property_id: record.propertyId,
      template: record.template,
      ai_generated_text: record.aiGeneratedText,
      user_edited_text: record.userEditedText,
      pdf_path: null,
      pdf_url: record.pdfUrl,
      version: record.version,
    },
    { onConflict: "id" }
  );
  if (flyerErr) throw flyerErr;
}

export async function deleteFlyerSupabase(record: FlyerRecord): Promise<void> {
  const client = requireClient();
  // Cascades to the `flyers` row via `on delete cascade`.
  const { error } = await client.from("marketing_assets").delete().eq("id", record.marketingAssetId);
  if (error) throw error;
}

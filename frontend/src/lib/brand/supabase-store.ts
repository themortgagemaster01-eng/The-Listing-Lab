import { getSupabaseClient } from "@/lib/supabase/client";
import { mapBrandProfileRow, type BrandProfileRow } from "@/lib/supabase/types";
import { brandProfileToForm, type BrandProfileFormData } from "@/lib/brand/types";

/**
 * Supabase-backed persistence for Brand Center. Used by
 * `src/lib/brand/persistence.ts` only when `isSupabaseConfigured` is true —
 * never imported directly by UI components. See `supabase/migrations/
 * 0006_add_brand_profiles.sql` for the table + RLS policies (one row per
 * `auth.users.id`, readable/writable only by its own owner).
 */

/** Reuses the same Storage bucket as property photos (see `src/lib/flyer/supabase-store.ts`) under a `brand-assets/{userId}/...` prefix, rather than requiring a brand-new bucket to be created manually first. */
const ASSETS_BUCKET = "property-photos";

function requireClient() {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase is not configured.");
  return client;
}

async function requireUserId(): Promise<string> {
  const client = requireClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) throw new Error("No signed-in user.");
  return user.id;
}

export async function fetchBrandProfileSupabase(): Promise<BrandProfileFormData | null> {
  const client = requireClient();
  const userId = await requireUserId();
  const { data, error } = await client
    .from("brand_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return brandProfileToForm(mapBrandProfileRow(data as BrandProfileRow));
}

export async function saveBrandProfileSupabase(form: BrandProfileFormData): Promise<void> {
  const client = requireClient();
  const userId = await requireUserId();

  const payload = {
    user_id: userId,
    headshot_url: form.headshotUrl || null,
    logo_url: form.logoUrl || null,
    signature_url: form.signatureUrl || null,
    bio: form.bio || null,
    brokerage_name: form.brokerageName || null,
    designations: form.designations,
    languages: form.languages,
    service_areas: form.serviceAreas,
    phone: form.phone || null,
    email: form.email || null,
    website: form.website || null,
    booking_link: form.bookingLink || null,
    nmls_number: form.nmlsNumber || null,
    mortgage_company: form.mortgageCompany || null,
    application_url: form.applicationUrl || null,
    license_states: form.licenseStates,
    facebook_url: form.facebookUrl || null,
    instagram_url: form.instagramUrl || null,
    linkedin_url: form.linkedinUrl || null,
    youtube_url: form.youtubeUrl || null,
  };

  const { error } = await client.from("brand_profiles").upsert(payload, { onConflict: "user_id" });
  if (error) throw error;
}

/** Uploads a data URL (headshot/logo/signature) to Storage and returns its public URL. */
export async function uploadBrandAssetToStorage(assetName: string, dataUrl: string): Promise<string> {
  const client = requireClient();
  const userId = await requireUserId();
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const path = `brand-assets/${userId}/${assetName}-${Date.now()}.jpg`;
  const { error } = await client.storage.from(ASSETS_BUCKET).upload(path, blob, {
    upsert: true,
    contentType: blob.type || "image/jpeg",
  });
  if (error) throw error;
  const { data } = client.storage.from(ASSETS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

import { getSupabaseClient } from "@/lib/supabase/client";
import { describeSupabaseError } from "@/lib/supabase/errors";
import type { MarketingAssetType, WebsiteRow } from "@/lib/supabase/types";
import { buildWebsiteSlug } from "@/lib/website/slug";

/**
 * Generic, reusable lifecycle operations for ANY `marketing_assets` row,
 * regardless of `asset_type` — Robert's explicit direction is that the
 * Property Website Generator should be the reference implementation for
 * this shared model, so its Publish/Unpublish/Republish logic is built AS
 * calls into this module rather than as website-specific inline Supabase
 * writes. See `WebsiteGeneratorWizard.tsx`'s `handlePublish`/`handleUnpublish`
 * for the only current caller.
 *
 * Mirrors the dispatch style already established by
 * `src/lib/ai/asset-service.ts`'s `generateAsset` (a single function per
 * operation, switching on `asset_type` only where the child-table shape
 * genuinely differs — `duplicateAsset` below), and reuses
 * `getSupabaseClient` / `describeSupabaseError` exactly as every other
 * Supabase-backed store in this codebase (see e.g.
 * `src/lib/website/supabase-store.ts`).
 *
 * Only `'website'` has a real, working implementation of the type-specific
 * operations (`duplicateAsset`). Flyer / Payment Snapshot / Social Post are
 * NOT retrofitted onto this module in this pass (Robert was explicit that's
 * not needed now) — their cases exist only as a typed "not yet implemented"
 * stub so the dispatch shape is ready when they do adopt it.
 *
 * These functions write directly to Supabase via `getSupabaseClient()` and
 * throw on failure — unlike `src/lib/website/persistence.ts`, there is no
 * localStorage fallback layer here. Callers that need the
 * "best-effort, never throw, log-and-fall-back" contract (e.g. the wizard's
 * autosave) should keep using their feature's own `persistence.ts` for
 * anything these functions don't cover, and treat calls into this module as
 * an explicit, user-initiated action worth surfacing an error for on
 * failure.
 */

function requireClient() {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase is not configured.");
  return client;
}

/** Same "safe if `crypto.randomUUID` isn't available" fallback used project-wide — see e.g. `WebsiteGeneratorWizard.tsx`'s `newWebsiteId`. */
function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `asset-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Publishes (or re-publishes) a `marketing_assets` row: sets
 * `lifecycle_state = 'published'` (the real 5-value shared-lifecycle
 * field — NOT the legacy `status` column) and stamps `published_at` the
 * FIRST time this row ever goes live (never overwritten/cleared on
 * subsequent republishes, unpublishes, or archives — it records "first
 * went live", not "currently live").
 *
 * DELIBERATE CHOICE — does NOT bump `marketing_assets.version` here. A
 * publish doesn't inherently mean the content changed (e.g. the very first
 * Publish click is going live with the version that already exists); a
 * genuine content change is what should bump the version, via
 * `createNewVersion` below, called by whichever code path actually detects
 * one. Conflating "published" with "new version" would bump the counter on
 * every routine republish even when nothing changed, which isn't useful as
 * a change-tracking signal. (Note this is distinct from
 * `websites.version`/`flyers.version`/`payment_snapshots.version` on the
 * child tables, which the Website Generator wizard still bumps itself on
 * every republish, per its own existing convention — see
 * `WebsiteGeneratorWizard.tsx`'s `handlePublish`.)
 */
export async function publishAsset(marketingAssetId: string): Promise<void> {
  const client = requireClient();

  const { data: existing, error: fetchErr } = await client
    .from("marketing_assets")
    .select("published_at")
    .eq("id", marketingAssetId)
    .single();
  if (fetchErr) throw new Error(`publishAsset: failed to read marketing_assets ${marketingAssetId}: ${describeSupabaseError(fetchErr)}`);

  const update: { lifecycle_state: string; published_at?: string } = {
    lifecycle_state: "published",
  };
  if (!existing?.published_at) {
    update.published_at = new Date().toISOString();
  }

  const { error } = await client.from("marketing_assets").update(update).eq("id", marketingAssetId);
  if (error) throw new Error(`publishAsset: failed to update marketing_assets ${marketingAssetId}: ${describeSupabaseError(error)}`);
}

/**
 * Takes a `marketing_assets` row down without discarding it — sets
 * `lifecycle_state = 'archived'` unconditionally. This is deliberately a
 * plain, unconditional set (no "only if currently published/edited"
 * guard) — that transition-rule judgment call belongs to the pure,
 * side-effect-free helpers in `src/lib/website/lifecycle.ts` (`unpublish`),
 * which callers should consult BEFORE deciding to call this function, the
 * same way `WebsiteGeneratorWizard.tsx` already does for its local/UI
 * state.
 */
export async function archiveAsset(marketingAssetId: string): Promise<void> {
  const client = requireClient();
  const { error } = await client.from("marketing_assets").update({ lifecycle_state: "archived" }).eq("id", marketingAssetId);
  if (error) throw new Error(`archiveAsset: failed to update marketing_assets ${marketingAssetId}: ${describeSupabaseError(error)}`);
}

/**
 * Increments the PARENT `marketing_assets.version` counter by 1. Generic
 * and type-dispatch-free by design — unlike `duplicateAsset`, this needs
 * no per-`asset_type` branching, since `version` (added in this pass —
 * see `0004_add_websites.sql`) now lives on the shared parent row rather
 * than only on a typed child table.
 *
 * Not currently called from anywhere (no code path detects "this asset's
 * content changed" yet) — built so it's ready once one does.
 */
export async function createNewVersion(marketingAssetId: string): Promise<void> {
  const client = requireClient();
  const { data: existing, error: fetchErr } = await client
    .from("marketing_assets")
    .select("version")
    .eq("id", marketingAssetId)
    .single();
  if (fetchErr) throw new Error(`createNewVersion: failed to read marketing_assets ${marketingAssetId}: ${describeSupabaseError(fetchErr)}`);

  const nextVersion = (existing?.version ?? 1) + 1;
  const { error } = await client.from("marketing_assets").update({ version: nextVersion }).eq("id", marketingAssetId);
  if (error) throw new Error(`createNewVersion: failed to update marketing_assets ${marketingAssetId}: ${describeSupabaseError(error)}`);
}

/**
 * Bulk-flags every `marketing_assets` row belonging to a property as
 * possibly out of date (`is_stale = true`). Generic — no per-type
 * dispatch needed, this is a single `UPDATE ... WHERE property_id = ...`.
 *
 * IMPORTANT — this is ONLY the reusable primitive. Robert was explicit
 * that actually WIRING this up to "property edited -> auto-flag its
 * assets stale" is a backlog item, not part of this pass. Nothing calls
 * this function yet.
 */
export async function markAssetsStale(propertyId: string): Promise<void> {
  const client = requireClient();
  const { error } = await client.from("marketing_assets").update({ is_stale: true }).eq("property_id", propertyId);
  if (error) throw new Error(`markAssetsStale: failed to update marketing_assets for property ${propertyId}: ${describeSupabaseError(error)}`);
}

interface MarketingAssetCore {
  id: string;
  property_id: string;
  asset_type: MarketingAssetType;
  title: string | null;
  thumbnail_url: string | null;
}

/**
 * Clones a `marketing_assets` row plus its typed child row, returning the
 * new marketing_assets id. Dispatches on `asset_type` — like
 * `generateAsset` in `src/lib/ai/asset-service.ts` — because the child
 * table shape (and what "duplicate" even means) genuinely differs per
 * type. Only `'website'` is implemented for real in this pass.
 *
 * The duplicate always starts life as a fresh, unpublished draft
 * (`lifecycle_state: 'draft'`, `status: 'draft'`, `published_at: null`,
 * `version: 1`, `is_stale: false`) regardless of the source row's state —
 * "duplicate" makes a new independent copy to iterate on, it does not
 * clone publish status or history.
 */
export async function duplicateAsset(marketingAssetId: string): Promise<string> {
  const client = requireClient();

  const { data: source, error: fetchErr } = await client
    .from("marketing_assets")
    .select("id, property_id, asset_type, title, thumbnail_url")
    .eq("id", marketingAssetId)
    .single();
  if (fetchErr) throw new Error(`duplicateAsset: failed to read marketing_assets ${marketingAssetId}: ${describeSupabaseError(fetchErr)}`);
  const sourceAsset = source as MarketingAssetCore;

  switch (sourceAsset.asset_type) {
    case "website":
      return duplicateWebsiteAsset(client, sourceAsset);

    case "flyer":
    case "payment_snapshot":
    case "social_post":
      throw new Error(`duplicateAsset not yet implemented for type: ${sourceAsset.asset_type}`);

    default:
      throw new Error(`duplicateAsset not yet implemented for type: ${sourceAsset.asset_type}`);
  }
}

async function duplicateWebsiteAsset(
  client: ReturnType<typeof requireClient>,
  sourceAsset: MarketingAssetCore
): Promise<string> {
  const { data: websiteRow, error: websiteErr } = await client
    .from("websites")
    .select("*")
    .eq("marketing_asset_id", sourceAsset.id)
    .single();
  if (websiteErr) throw new Error(`duplicateAsset: failed to read websites row for ${sourceAsset.id}: ${describeSupabaseError(websiteErr)}`);
  const source = websiteRow as WebsiteRow;

  const { data: propertyRow, error: propertyErr } = await client
    .from("properties")
    .select("address, city_state_zip")
    .eq("id", sourceAsset.property_id)
    .single();
  if (propertyErr) throw new Error(`duplicateAsset: failed to read property ${sourceAsset.property_id}: ${describeSupabaseError(propertyErr)}`);

  const newAssetId = newId();
  const newWebsiteId = newId();
  // `buildWebsiteSlug`'s uniqueness suffix is derived from the id string
  // passed as its third argument — passing the freshly generated
  // `newWebsiteId` (instead of the shared `property_id`, which would
  // regenerate the EXACT same slug as the source row and collide with
  // `websites.slug`'s unique constraint) is what makes this a genuinely
  // fresh, unique slug for the duplicate.
  const newSlug = buildWebsiteSlug(propertyRow?.address ?? "", propertyRow?.city_state_zip ?? "", newWebsiteId);

  const { error: assetInsertErr } = await client.from("marketing_assets").insert({
    id: newAssetId,
    property_id: sourceAsset.property_id,
    asset_type: "website",
    title: sourceAsset.title,
    thumbnail_url: sourceAsset.thumbnail_url,
    status: "draft",
    lifecycle_state: "draft",
    published_at: null,
    version: 1,
    is_stale: false,
  });
  if (assetInsertErr) throw new Error(`duplicateAsset: failed to insert marketing_assets ${newAssetId}: ${describeSupabaseError(assetInsertErr)}`);

  const { error: websiteInsertErr } = await client.from("websites").insert({
    id: newWebsiteId,
    marketing_asset_id: newAssetId,
    property_id: sourceAsset.property_id,
    slug: newSlug,
    theme: source.theme,
    is_published: false,
    version: 1,
  });
  if (websiteInsertErr) throw new Error(`duplicateAsset: failed to insert websites ${newWebsiteId}: ${describeSupabaseError(websiteInsertErr)}`);

  return newAssetId;
}

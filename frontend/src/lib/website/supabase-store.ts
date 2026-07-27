import { getSupabaseClient } from "@/lib/supabase/client";
import { mapWebsiteRow, type AssetLifecycleState, type WebsiteRow } from "@/lib/supabase/types";
import type { WebsitePublishedSnapshot, WebsiteRecord, WebsiteTheme } from "@/lib/website/types";
import { isReachable } from "@/lib/website/lifecycle";

/**
 * Supabase-backed persistence for the Property Website Generator. Used by
 * `src/lib/website/persistence.ts` only when `isSupabaseConfigured` is
 * true — never imported directly by UI components. Mirrors
 * `src/lib/payment/supabase-store.ts`'s `marketing_assets` + child-table
 * pattern exactly (see that file's header comment for the "mock slug id
 * isn't a real uuid" known gap, which applies identically here).
 */

function requireClient() {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase is not configured.");
  return client;
}

interface MarketingAssetWithWebsite {
  id: string;
  property_id: string;
  title: string | null;
  thumbnail_url: string | null;
  status: string;
  lifecycle_state: AssetLifecycleState;
  created_at: string;
  updated_at: string;
  websites: WebsiteRow[] | WebsiteRow | null;
}

function toWebsiteRecord(row: MarketingAssetWithWebsite): WebsiteRecord | null {
  const websiteRow = Array.isArray(row.websites) ? row.websites[0] : row.websites;
  if (!websiteRow) return null;
  const website = mapWebsiteRow(websiteRow);
  return {
    id: website.id,
    marketingAssetId: row.id,
    propertyId: row.property_id,
    slug: website.slug,
    theme: (website.theme as WebsiteTheme) || "estate",
    lifecycleState: row.lifecycle_state,
    // Cast at this boundary, same convention as `theme` above — the generic
    // Supabase row layer (`src/lib/supabase/types.ts`) deliberately keeps
    // this as `unknown` to avoid a dependency cycle with this feature-
    // specific module. `null` until the first Publish.
    publishedSnapshot: (website.publishedSnapshot as WebsitePublishedSnapshot | null) ?? null,
    version: website.version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Fetches the single "current" website record for a property, or `null` if none exists yet. */
export async function fetchWebsiteSupabase(propertyId: string): Promise<WebsiteRecord | null> {
  const client = requireClient();
  const { data, error } = await client
    .from("marketing_assets")
    .select("*, websites(*)")
    .eq("property_id", propertyId)
    .eq("asset_type", "website")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return toWebsiteRecord(data as MarketingAssetWithWebsite);
}

export async function saveWebsiteSupabase(record: WebsiteRecord): Promise<void> {
  const client = requireClient();

  // `lifecycle_state` (on marketing_assets) is the source of truth for
  // publish status — see WebsiteRecord's doc comment in
  // `src/lib/website/types.ts`. `status` (the older, informal
  // 'draft'/'final' column Flyer/Payment Snapshot still use unmigrated) is
  // still written here too, purely because it's a NOT NULL column with its
  // own check constraint — it's derived from lifecycleState (via
  // `isReachable`, since `status: 'final'` historically meant "done/live",
  // which now maps to "published" OR "edited" — see
  // `src/lib/website/lifecycle.ts`), never an independent input. Nothing
  // actually queries this column for websites today; it's written purely
  // for schema-constraint compatibility with the Flyer/Payment Snapshot
  // convention.
  const reachable = isReachable(record.lifecycleState);
  // `websites.is_published` is a narrower, literal boolean (strictly
  // `lifecycle_state === 'published'`, NOT `isReachable`) — see that
  // column's own doc comment in `supabase/migrations/0004_add_websites.sql`
  // for why it's kept as the original "Realtor clicked Publish at least
  // once and hasn't unpublished since" meaning rather than being widened to
  // match the reachability gate.
  const isPublished = record.lifecycleState === "published";

  const { error: assetErr } = await client.from("marketing_assets").upsert(
    {
      id: record.marketingAssetId,
      property_id: record.propertyId,
      asset_type: "website",
      title: null,
      thumbnail_url: null,
      status: reachable ? "final" : "draft",
      lifecycle_state: record.lifecycleState,
    },
    { onConflict: "id" }
  );
  if (assetErr) throw assetErr;

  const { error: websiteErr } = await client.from("websites").upsert(
    {
      id: record.id,
      marketing_asset_id: record.marketingAssetId,
      property_id: record.propertyId,
      slug: record.slug,
      theme: record.theme,
      // Derived purely from lifecycleState at write time — never set
      // independently, so it can never drift (see the `websites.is_published`
      // column comment in supabase/migrations/0004_add_websites.sql).
      is_published: isPublished,
      version: record.version,
      // The draft/publish separation's actual content — see
      // `WebsitePublishedSnapshot`'s doc comment in `src/lib/website/types.ts`.
      // Written ONLY by `WebsiteGeneratorWizard.tsx`'s publish/publish-changes
      // handler; every other write path (autosave of a draft theme change)
      // passes through the record's EXISTING `publishedSnapshot` unchanged so
      // a draft-only save can never alter what's publicly visible.
      published_snapshot: record.publishedSnapshot,
    },
    { onConflict: "id" }
  );
  if (websiteErr) throw websiteErr;
}

export async function deleteWebsiteSupabase(record: WebsiteRecord): Promise<void> {
  const client = requireClient();
  // Cascades to the `websites` row via `on delete cascade`.
  const { error } = await client.from("marketing_assets").delete().eq("id", record.marketingAssetId);
  if (error) throw error;
}

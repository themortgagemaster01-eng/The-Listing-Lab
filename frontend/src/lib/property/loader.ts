import { getSupabaseServerClient } from "@/lib/supabase/server";
import { describeSupabaseError } from "@/lib/supabase/errors";
import { mapPropertyRowToMockProperty, type PropertyRow, type PhotoRow } from "@/lib/supabase/types";
import { getPropertyById } from "@/lib/mock-data";
import type { Property } from "@/types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Generic stand-in hero photo for a real property that has no photos uploaded yet. */
const PLACEHOLDER_IMAGE_URL =
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1600&q=80";

/**
 * Resolves a property for the `/property/[id]` workspace (used by the shared
 * layout and every tab's page.tsx — see the comment on `getPropertyById` in
 * `src/lib/mock-data.ts` for why this split exists).
 *
 * Two kinds of ids can reach this function:
 *   - The original demo/mock properties (`src/lib/mock-data.ts`), which use
 *     slug ids like `"123-main-street"` and are never looked up in
 *     Supabase — they're static demo content, not real listings.
 *   - Real properties created via `/property/new`
 *     (`src/lib/flyer/persistence.ts` `createProperty`), which get a real
 *     Postgres `uuid` and live in the `properties` table.
 *
 * Dispatches on id shape so both kinds resolve through the same call site
 * across every property page, without those pages needing to know which
 * kind of property they're rendering.
 */
export async function loadPropertyForWorkspace(id: string): Promise<Property | undefined> {
  if (!UUID_RE.test(id)) {
    return getPropertyById(id);
  }

  const client = getSupabaseServerClient();
  if (!client) return undefined;

  try {
    const { data: propertyRow, error: propertyErr } = await client
      .from("properties")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (propertyErr) throw propertyErr;
    if (!propertyRow) return undefined;

    const { data: photoRows, error: photosErr } = await client
      .from("photos")
      .select("*")
      .eq("property_id", id)
      .order("display_order", { ascending: true });
    if (photosErr) throw photosErr;

    const { count: assetCount, error: countErr } = await client
      .from("marketing_assets")
      .select("*", { count: "exact", head: true })
      .eq("property_id", id);
    if (countErr) throw countErr;

    const photos = ((photoRows as PhotoRow[]) ?? []).map((p) => p.url);
    const cover =
      ((photoRows as PhotoRow[]) ?? []).find((p) => p.is_cover)?.url ?? photos[0] ?? PLACEHOLDER_IMAGE_URL;

    return mapPropertyRowToMockProperty(propertyRow as PropertyRow, {
      imageUrl: cover,
      photos,
      assetCount: assetCount ?? 0,
    });
  } catch (err) {
    console.error(
      `[Listing Lab] Supabase read failed while loading property ${id} for the workspace: ${describeSupabaseError(err)}.`
    );
    return undefined;
  }
}

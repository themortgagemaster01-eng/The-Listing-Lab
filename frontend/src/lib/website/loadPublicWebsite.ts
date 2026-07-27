import { getSupabaseServerClient } from "@/lib/supabase/server";
import { describeSupabaseError } from "@/lib/supabase/errors";
import {
  mapFlyerRow,
  mapPaymentSnapshotRow,
  mapPropertyRowToMockProperty,
  mapWebsiteRow,
  type FlyerRow,
  type PaymentSnapshotRow,
  type PhotoRow,
  type PropertyRow,
  type WebsiteRow,
} from "@/lib/supabase/types";
import { resolveFlyerText } from "@/lib/flyer/types";
import type { FlyerTextContent } from "@/lib/supabase/types";
import type { PaymentFormData } from "@/lib/payment/types";
import type { WebsiteTheme } from "@/lib/website/types";
import type { Property } from "@/types";

/** Generic stand-in hero photo for a real property that has no photos uploaded yet — same asset `src/lib/property/loader.ts` uses. */
const PLACEHOLDER_IMAGE_URL =
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1600&q=80";

export interface PublicWebsiteData {
  slug: string;
  theme: WebsiteTheme;
  property: Property;
  /** The property's most-recently-updated flyer's resolved copy (user edits win over AI text), or `null` if no flyer exists yet — the Description section must be omitted entirely in that case, never fabricated. */
  flyerText: FlyerTextContent | null;
  /** The property's most-recently-updated Payment Snapshot's saved inputs, or `null` if none exists — the Payment Snapshot section must be omitted entirely in that case. */
  paymentSnapshotInputs: PaymentFormData | null;
}

interface MarketingAssetWithFlyer {
  flyers: FlyerRow[] | FlyerRow | null;
}
interface MarketingAssetWithSnapshot {
  payment_snapshots: PaymentSnapshotRow[] | PaymentSnapshotRow | null;
}

/**
 * Server-side, read-only loader for the public `/site/[slug]` page
 * (`src/app/site/[slug]/page.tsx`) — no auth (there is no real
 * authenticated-user model in this app yet, a known, separately-tracked
 * gap), so this is intentionally callable by anyone who knows the slug,
 * same as any real "public listing site" would be.
 *
 * Returns `null` (caller must `notFound()`) when:
 *   - Supabase isn't configured at all — a published site's data lives in
 *     the database, not `localStorage` (`localStorage` is per-browser and
 *     invisible to this Server Component — see the header comment on
 *     `src/lib/website/persistence.ts` for the full explanation of this
 *     inherent limit, not a bug introduced here).
 *   - no `websites` row matches the slug, OR its parent `marketing_assets`
 *     row's `lifecycle_state` is not "reachable" per
 *     `isReachable`/`src/lib/website/lifecycle.ts` (`'published'` or
 *     `'edited'` — see that file's header comment for why `'edited'` is
 *     included: a plain field edit on a live site must NOT take it down,
 *     only an explicit Unpublish, which moves the record to `'archived'`,
 *     does) — see the "gate" query below, which joins `marketing_assets`
 *     and filters on `lifecycle_state` directly rather than trusting
 *     `websites.is_published` on its own. The two can never actually
 *     disagree for the `'published'` case (`is_published` is always
 *     derived from `lifecycle_state === 'published'` at write time — see
 *     `saveWebsiteSupabase` in `src/lib/website/supabase-store.ts`), but
 *     `is_published` alone can't express "reachable because edited", so
 *     `lifecycle_state` is the only authoritative check here.
 *   - the parent `properties` row is somehow missing (shouldn't happen —
 *     `on delete cascade` — but handled defensively).
 *
 * The flyer/payment-snapshot lookups are independent, fresh reads (no FK
 * from `websites` to either) — see 0004_add_websites.sql's header comment
 * for why. Both are optional; their respective public-page sections are
 * simply omitted when absent, never faked.
 *
 * DESIGN DECISION — live data vs. a frozen "last published" snapshot:
 * once a published site is edited (autosaves to `lifecycle_state:
 * 'edited'`, see `src/lib/website/lifecycle.ts`), this loader intentionally
 * keeps reading CURRENT/live property, flyer, and payment-snapshot data on
 * every request — it does NOT freeze a snapshot at publish time and serve
 * that until the Realtor clicks "Republish". `lifecycle_state` only gates
 * WHETHER the page is reachable at all (published/edited = reachable;
 * draft/generated/archived = 404), not WHAT content it shows — since
 * content is always live either way, `'published'` vs `'edited'` produce
 * byte-identical output for a visitor; the distinction only drives the
 * Realtor-facing badge/button copy in `WebsiteGeneratorWizard.tsx`.
 * Rejected alternative: snapshot the assembled page content into a jsonb
 * column on `websites` at publish time and read that snapshot instead of
 * live tables whenever `lifecycle_state` is `'edited'`. That's the more
 * "literally correct" reading of a Draft/Generated/Edited/Published state
 * machine (a published site's *content* would then genuinely freeze until
 * Republish, matching what "Republish" implies), but it's meaningfully more
 * complex (a new jsonb column, a snapshot-assembly step at publish time,
 * and a branch here choosing snapshot-vs-live per section) for a v1 feature
 * whose stated goal is "60 seconds, no friction." Since editing a website
 * record today only ever means "change the theme" (there's no other
 * editable field on `WebsiteRecord` yet — description/features/payment
 * numbers all come from the Flyer/Payment Snapshot features, which already
 * publish their OWN edits live immediately with no draft/review step of
 * their own), a Realtor changing the theme without immediately clicking
 * Republish is a minor, low-stakes edge case, not a "stale numbers on a
 * live listing" risk. If Robert wants the frozen-snapshot behavior later
 * (e.g. once this record grows more independently-editable fields), the
 * jsonb-snapshot approach above is the recommended path — flag for his
 * review.
 */
export async function loadPublicWebsiteBySlug(slug: string): Promise<PublicWebsiteData | null> {
  const client = getSupabaseServerClient();
  if (!client) return null;

  try {
    // Authoritative reachability gate: join the parent `marketing_assets`
    // row and filter on its `lifecycle_state` directly (see this
    // function's header comment, and `isReachable` in
    // `src/lib/website/lifecycle.ts`, for why both `'published'` and
    // `'edited'` count as reachable). `!inner` makes the join required, so
    // a `websites` row whose parent `marketing_assets` row isn't in that
    // set is excluded outright rather than coming back with a null
    // `marketing_assets` field.
    const { data: websiteRow, error: websiteErr } = await client
      .from("websites")
      .select("*, marketing_assets!inner(lifecycle_state)")
      .eq("slug", slug)
      .in("marketing_assets.lifecycle_state", ["published", "edited"])
      .maybeSingle();
    if (websiteErr) throw websiteErr;
    if (!websiteRow) return null;

    const website = mapWebsiteRow(websiteRow as WebsiteRow);

    const { data: propertyRow, error: propertyErr } = await client
      .from("properties")
      .select("*")
      .eq("id", website.propertyId)
      .maybeSingle();
    if (propertyErr) throw propertyErr;
    if (!propertyRow) return null;

    const { data: photoRows, error: photosErr } = await client
      .from("photos")
      .select("*")
      .eq("property_id", website.propertyId)
      .order("display_order", { ascending: true });
    if (photosErr) throw photosErr;

    const photos = ((photoRows as PhotoRow[]) ?? []).map((p) => p.url);
    const cover = ((photoRows as PhotoRow[]) ?? []).find((p) => p.is_cover)?.url ?? photos[0] ?? PLACEHOLDER_IMAGE_URL;

    const property = mapPropertyRowToMockProperty(propertyRow as PropertyRow, {
      imageUrl: cover,
      photos,
      assetCount: 0,
    });

    // Most-recently-updated flyer, if any — reused verbatim, never regenerated.
    const { data: flyerAssetRows, error: flyerErr } = await client
      .from("marketing_assets")
      .select("*, flyers(*)")
      .eq("property_id", website.propertyId)
      .eq("asset_type", "flyer")
      .order("updated_at", { ascending: false })
      .limit(1);
    if (flyerErr) throw flyerErr;
    const flyerAsset = ((flyerAssetRows as MarketingAssetWithFlyer[]) ?? [])[0];
    const flyerRow = flyerAsset ? (Array.isArray(flyerAsset.flyers) ? flyerAsset.flyers[0] : flyerAsset.flyers) : null;
    const flyer = flyerRow ? mapFlyerRow(flyerRow) : null;
    const flyerText = flyer ? resolveFlyerText(flyer) : null;

    // Most-recently-updated Payment Snapshot, if any — same calculation
    // function (`buildPaymentSnapshotResults`) as the real feature runs
    // client-side against these saved inputs, so numbers can never drift.
    const { data: snapshotAssetRows, error: snapshotErr } = await client
      .from("marketing_assets")
      .select("*, payment_snapshots(*)")
      .eq("property_id", website.propertyId)
      .eq("asset_type", "payment_snapshot")
      .order("updated_at", { ascending: false })
      .limit(1);
    if (snapshotErr) throw snapshotErr;
    const snapshotAsset = ((snapshotAssetRows as MarketingAssetWithSnapshot[]) ?? [])[0];
    const snapshotRow = snapshotAsset
      ? Array.isArray(snapshotAsset.payment_snapshots)
        ? snapshotAsset.payment_snapshots[0]
        : snapshotAsset.payment_snapshots
      : null;
    const snapshot = snapshotRow ? mapPaymentSnapshotRow(snapshotRow) : null;

    return {
      slug: website.slug,
      theme: (website.theme as WebsiteTheme) || "estate",
      property,
      flyerText,
      paymentSnapshotInputs: snapshot ? (snapshot.inputs as unknown as PaymentFormData) : null,
    };
  } catch (err) {
    console.error(
      `[Listing Lab] Supabase read failed while loading the public website for slug "${slug}": ${describeSupabaseError(err)}.`
    );
    return null;
  }
}

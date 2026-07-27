import { getSupabaseServerClient } from "@/lib/supabase/server";
import { describeSupabaseError } from "@/lib/supabase/errors";
import { mapWebsiteRow, type WebsiteRow } from "@/lib/supabase/types";
import type { WebsitePublishedSnapshot, WebsiteTheme } from "@/lib/website/types";
import type { FlyerTextContent } from "@/lib/supabase/types";
import type { PaymentFormData } from "@/lib/payment/types";
import type { Property } from "@/types";

export interface PublicWebsiteData {
  slug: string;
  theme: WebsiteTheme;
  property: Property;
  /** From the published snapshot — `null` only if the snapshot itself never captured a flyer (i.e. none existed at the time of the last Publish). The Description section must be omitted entirely in that case, never fabricated. */
  flyerText: FlyerTextContent | null;
  /** From the published snapshot — `null` only if the snapshot itself never captured a Payment Snapshot. The Payment Snapshot section must be omitted entirely in that case. */
  paymentSnapshotInputs: PaymentFormData | null;
}

interface WebsiteRowWithGate extends WebsiteRow {
  marketing_assets: { lifecycle_state: string } | { lifecycle_state: string }[];
}

/**
 * Server-side, read-only loader for the public `/site/{slug}` page
 * (`src/app/site/[slug]/page.tsx`) — no auth (there is no real
 * authenticated-user model in this app yet, a known, separately-tracked
 * gap), so this is intentionally callable by anyone who knows the slug,
 * same as any real "public listing site" would be.
 *
 * DRAFT/PUBLISH SEPARATION (rewritten per Robert's explicit correction —
 * SUPERSEDES this function's original design, which read `properties` /
 * `photos` / `flyers` / `payment_snapshots` live on every request):
 * this loader now reads ONLY `websites.published_snapshot` — a frozen
 * `WebsitePublishedSnapshot` (see that type's doc comment in
 * `src/lib/website/types.ts`) written exclusively by
 * `WebsiteGeneratorWizard.tsx`'s `handlePublish`, on an explicit Publish
 * Website / Publish Changes click. It performs NO live joins against
 * `properties`, `photos`, `flyers`, or `payment_snapshots` at all anymore —
 * editing any of those after this website was published can never change
 * what this function returns, by construction, until the Realtor explicitly
 * republishes. This is standard CMS draft/publish behavior
 * (WordPress/Webflow/Squarespace): a published page's content is stable
 * until someone explicitly re-publishes it, no matter what changes
 * elsewhere in the meantime.
 *
 * (The REJECTED "live data" alternative — reading current tables and
 * treating `lifecycleState` as the only gate — was this function's original
 * v1 design, chosen for simplicity when the only editable field was
 * `theme`. Robert's later, explicit requirement overrides that: he wants
 * real draft/publish separation, not a live-always page. This snapshot
 * design is that correction, not a variant on the old one.)
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
 *     included: a plain draft edit must not take a live site down, and
 *     since `edited` still only ever serves `published_snapshot`, keeping
 *     it reachable is safe by construction) — the query below joins
 *     `marketing_assets` and filters on `lifecycle_state` directly.
 *   - the matched row's `published_snapshot` is null — defensively treated
 *     as "nothing to show" (should not happen for a reachable row, since
 *     Publish always writes one, but a page must never render empty/blank
 *     content that only LOOKS like a real listing).
 */
export async function loadPublicWebsiteBySlug(slug: string): Promise<PublicWebsiteData | null> {
  const client = getSupabaseServerClient();
  if (!client) return null;

  try {
    // `!inner` makes the `marketing_assets` join required, so a `websites`
    // row whose parent isn't in the reachable set is excluded outright
    // rather than coming back with a null `marketing_assets` field.
    const { data: websiteRow, error: websiteErr } = await client
      .from("websites")
      .select("*, marketing_assets!inner(lifecycle_state)")
      .eq("slug", slug)
      .in("marketing_assets.lifecycle_state", ["published", "edited"])
      .maybeSingle();
    if (websiteErr) throw websiteErr;
    if (!websiteRow) return null;

    const website = mapWebsiteRow(websiteRow as WebsiteRowWithGate);
    const snapshot = website.publishedSnapshot as WebsitePublishedSnapshot | null;
    if (!snapshot) return null;

    return {
      slug: website.slug,
      theme: snapshot.theme || "estate",
      property: snapshot.property,
      flyerText: snapshot.flyerText,
      paymentSnapshotInputs: snapshot.paymentSnapshotInputs,
    };
  } catch (err) {
    console.error(
      `[Listing Lab] Supabase read failed while loading the public website for slug "${slug}": ${describeSupabaseError(err)}.`
    );
    return null;
  }
}

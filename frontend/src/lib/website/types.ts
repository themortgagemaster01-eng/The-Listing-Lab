/**
 * Client-facing types for the Property Website Generator ("Listing
 * Presentation Site") feature (`components/property/website/*`), mirroring
 * the structure of `src/lib/payment/types.ts` exactly: a `*Record` type
 * mirroring `PaymentSnapshotRecord`'s shape (id/marketingAssetId/
 * propertyId/…/version), and persistence (`src/lib/website/persistence.ts`)
 * as the only place that maps between this shape and the raw Supabase row
 * shape (`src/lib/supabase/types.ts` `WebsiteRow`).
 *
 * Unlike flyers/payment snapshots (which support multiple records per
 * property), a property has at most one "current" website record —
 * republishing updates the same record rather than creating a new one.
 */

import type { AssetLifecycleState, FlyerTextContent } from "@/lib/supabase/types";
import type { PaymentFormData } from "@/lib/payment/types";
import type { Property } from "@/types";

export type { AssetLifecycleState };

export type WebsiteTheme = "estate" | "minimal" | "showcase";

export const WEBSITE_THEME_LABELS: Record<WebsiteTheme, string> = {
  estate: "Estate",
  minimal: "Minimal",
  showcase: "Showcase",
};

export const WEBSITE_THEME_DESCRIPTIONS: Record<WebsiteTheme, string> = {
  estate: "Full-bleed hero, editorial feel",
  minimal: "Clean grid, lots of white space",
  showcase: "Gallery-forward, gold accents",
};

/**
 * The exact, self-contained content a home buyer sees on the public site —
 * frozen at the moment of the last Publish/Publish Changes click (see
 * `WebsiteGeneratorWizard.tsx`'s `handlePublish`), NOT re-derived from live
 * `properties`/`flyers`/`payment_snapshots` rows at request time.
 *
 * This is the entire mechanism behind Robert's explicit draft/publish
 * separation requirement (standard CMS behavior — WordPress/Webflow/
 * Squarespace): editing the property, its flyer, or its Payment Snapshot
 * AFTER the website is published must never silently change what a visitor
 * sees. `src/lib/website/loadPublicWebsite.ts` reads ONLY this snapshot
 * (stored as `websites.published_snapshot`, see
 * `supabase/migrations/0005_add_website_published_snapshot.sql`) — never the
 * live tables. Structurally identical to `PublicWebsiteData` (minus `slug`,
 * which lives on the parent `WebsiteRecord` and never changes) so the loader
 * can hand it straight to `PublicSiteView` with no reshaping.
 */
export interface WebsitePublishedSnapshot {
  property: Property;
  flyerText: FlyerTextContent | null;
  paymentSnapshotInputs: PaymentFormData | null;
  theme: WebsiteTheme;
}

/**
 * A single property website (one `marketing_assets` row + its child
 * `websites` row, flattened into one client-side object) — mirrors
 * `PaymentSnapshotRecord`. There is at most one per property; the record
 * exists (auto-populated, `lifecycleState: "generated"`) before the Realtor
 * ever clicks "Publish Website" so theme selection can autosave from the
 * start without ever being publicly reachable.
 *
 * `lifecycleState` (shared asset lifecycle model — see
 * `src/lib/website/lifecycle.ts` for the transition rules and
 * `AssetLifecycleState`'s doc comment in `src/lib/supabase/types.ts`) is
 * the SOURCE OF TRUTH for whether this site is live — it replaced a plain
 * `isPublished: boolean` field. The `websites` table still has its own
 * `is_published` column for query convenience, but that column is always
 * derived from `lifecycleState` at write time
 * (`src/lib/website/supabase-store.ts`) and must never be set
 * independently — use `isReachable(record.lifecycleState)` from
 * `src/lib/website/lifecycle.ts` wherever app code previously read
 * `.isPublished` (note: `isReachable` is true for BOTH `"published"` and
 * `"edited"` — see that function's doc comment for why a plain field edit
 * must not take a live site down).
 *
 * `publishedSnapshot` (draft/publish separation — see
 * `WebsitePublishedSnapshot`'s doc comment above) is the SEPARATE source of
 * truth for WHAT CONTENT is publicly visible. `lifecycleState`/`isReachable`
 * only gate whether the site is reachable AT ALL; `publishedSnapshot` is
 * what it actually shows once reachable. The wizard's own live-assembled
 * preview data (property/flyer/payment-snapshot/theme, always fresh) can
 * freely diverge from `publishedSnapshot` while the Realtor drafts — see
 * `WebsiteGeneratorWizard.tsx`'s `hasPendingChanges` for how that drift is
 * detected and surfaced as a "Save Draft" vs. "Publish Changes" choice.
 */
export interface WebsiteRecord {
  id: string;
  marketingAssetId: string;
  propertyId: string;
  /** The public URL segment — the live site is served at `/site/{slug}`. Generated once via `src/lib/website/slug.ts` and kept stable afterward. */
  slug: string;
  theme: WebsiteTheme;
  /** Source of truth for publish status — see this interface's doc comment above and `src/lib/website/lifecycle.ts`. */
  lifecycleState: AssetLifecycleState;
  /** Source of truth for publish CONTENT — see this interface's doc comment above. `null` until the first Publish. */
  publishedSnapshot: WebsitePublishedSnapshot | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

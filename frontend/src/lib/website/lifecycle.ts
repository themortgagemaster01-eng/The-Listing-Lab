import type { AssetLifecycleState } from "@/lib/supabase/types";

/**
 * Transition helpers for the Website Generator's use of the shared asset
 * lifecycle model (`marketing_assets.lifecycle_state` — see that column's
 * doc comment in `src/lib/supabase/types.ts` and the header comment on
 * `supabase/migrations/0004_add_websites.sql`): Draft -> Generated ->
 * Edited -> Published -> Archived.
 *
 * These are the ONLY place `WebsiteGeneratorWizard.tsx` should decide how
 * `lifecycleState` moves between states, so the rules stay consistent and
 * are easy to reuse once another asset type (Flyer, Payment Snapshot,
 * Social Media) adopts the same model.
 *
 * IMPORTANT — REVISED MEANING OF `lifecycleState` vs. content (draft/publish
 * separation, per Robert's explicit correction): this file's ORIGINAL
 * version treated `lifecycleState` as controlling both WHETHER the site was
 * reachable AND, implicitly, WHAT it showed (the public page read live
 * property/flyer/payment-snapshot data, so `edited` and `published` were
 * documented as producing "byte-identical output for a visitor"). That is
 * no longer true. As of `WebsitePublishedSnapshot`
 * (`src/lib/website/types.ts`) and `0005_add_website_published_snapshot.sql`,
 * `lifecycleState` here ONLY controls REACHABILITY (`isReachable` below) —
 * a separate, explicit `WebsiteRecord.publishedSnapshot` field controls
 * CONTENT, and is written ONLY by an explicit Publish/Publish Changes click
 * (see `WebsiteGeneratorWizard.tsx`'s `handlePublish`). A record sitting at
 * `edited` is still fully reachable, but a visitor sees the LAST PUBLISHED
 * SNAPSHOT, not the Realtor's in-progress draft — this is precisely how
 * WordPress/Webflow/Squarespace-style draft/publish separation works, and
 * is what makes it safe for `edited` to remain reachable at all: nothing a
 * Realtor drafts can ever reach a visitor until they explicitly publish it.
 *
 *   - A freshly auto-populated website record (nothing has been generated
 *     or reviewed by the Realtor yet, but the record is real/complete) is
 *     created directly as `generated` — see `createDraftWebsite` in
 *     `WebsiteGeneratorWizard.tsx`. There's no separate "click Generate"
 *     step for this feature (it's pure assembly of already-generated
 *     content), so `draft` is reachable only as the database column's
 *     default value before the client ever writes a row.
 *   - `syncLifecycleWithDrift` (replaces the old `markFieldEdited`) is the
 *     single place that decides whether a record currently sitting at
 *     `published` or `edited` should be at `edited` instead — driven by
 *     whether the wizard's live-assembled data (property/flyer/payment
 *     snapshot/theme, always fresh) currently DIFFERS from
 *     `publishedSnapshot` (see `WebsiteGeneratorWizard.tsx`'s
 *     `hasPendingChanges`), not by tracking individual field edits. This is
 *     deliberately more general than the original theme-only tracking: it
 *     also catches the property, flyer, or Payment Snapshot changing
 *     ELSEWHERE (a different tab) after this website was published — any of
 *     those now correctly surface as "you have unpublished changes" here
 *     too, exactly matching Robert's requirement that editing the PROPERTY
 *     (not just the website's own theme picker) must never silently reach
 *     the public site.
 *   - `publish` always moves straight to `published` — this single
 *     function backs both the "Publish Website" (first time) and "Publish
 *     Changes" (subsequent) actions. Both write a fresh
 *     `publishedSnapshot` from current data — see `handlePublish`.
 *   - `unpublish` moves `published` -> `archived`, NOT `published` ->
 *     `edited` as a literal reading of Robert's original transition table
 *     stated. Reasoning, still valid under the new content model:
 *     `syncLifecycleWithDrift` can ALSO move a record to `edited` (when
 *     drafted content diverges from the last snapshot). If Unpublish
 *     produced that same `edited` value, `loadPublicWebsiteBySlug`'s
 *     reachability gate could not tell "Realtor explicitly clicked
 *     Unpublish" apart from "Realtor merely has an undrafted change" — the
 *     two would collapse to the same state. Routing Unpublish to the
 *     otherwise-unused `archived` state instead keeps `edited` meaning ONLY
 *     "still reachable, has a draft that hasn't been published yet", and
 *     `archived` meaning ONLY "explicitly taken down, not reachable at
 *     all" — Robert's own "Republish (edited / archived -> published)"
 *     wording already anticipated exactly this pairing.
 *   - `isReachable` (backing `loadPublicWebsiteBySlug`'s public-page gate
 *     AND this wizard's "show Copy Link / View Live Site / Download QR /
 *     Unpublish" block) is true for `published` OR `edited` — both mean
 *     "currently live", and — per the revised model above — both serve the
 *     exact same `publishedSnapshot` content regardless of any in-progress
 *     draft. `draft`, `generated`, and `archived` are not reachable.
 */

/**
 * Recomputes whether a record currently sitting at `published` or `edited`
 * should reflect an unpublished draft — a no-op for every other state
 * (`draft`/`generated`/`archived` are left exactly as they are; drafting
 * before a first publish, or while unpublished, doesn't need this signal).
 * Called by `WebsiteGeneratorWizard.tsx` any time its live-assembled data or
 * the record's `publishedSnapshot` changes. Purely reflects `hasPendingChanges`
 * — see that constant's definition in `WebsiteGeneratorWizard.tsx` for
 * exactly what "diverged" means. Does NOT affect public reachability (see
 * `isReachable`) or what content the public page shows (see
 * `WebsitePublishedSnapshot`'s doc comment in `src/lib/website/types.ts`) —
 * it only drives the wizard's own "Save Draft" / "Publish Changes" prompt.
 */
export function syncLifecycleWithDrift(
  state: AssetLifecycleState,
  hasPendingChanges: boolean
): AssetLifecycleState {
  if (state !== "published" && state !== "edited") return state;
  return hasPendingChanges ? "edited" : "published";
}

/** Publish or re-publish — always resolves to `published` regardless of the prior state. */
export function publish(_state: AssetLifecycleState): AssetLifecycleState {
  return "published";
}

/** Explicitly takes a live site down without discarding it — `published` (or `edited`, i.e. "live with an unpublished draft") -> `archived`; otherwise a no-op (nothing to unpublish). */
export function unpublish(state: AssetLifecycleState): AssetLifecycleState {
  return state === "published" || state === "edited" ? "archived" : state;
}

/** Whether the public `/site/[slug]` page should currently be reachable for this record — see this file's header comment for why `edited` counts as reachable (it still only ever serves `publishedSnapshot`, never the draft). */
export function isReachable(state: AssetLifecycleState): boolean {
  return state === "published" || state === "edited";
}

/** Whether this record is showing fully up-to-date status with no pending "click Publish Changes" reminder. */
export function isFullySynced(state: AssetLifecycleState): boolean {
  return state === "published";
}

/** Whether this record has gone live at least once before (drives the "Publish Website" vs. "Republish Website" button label). */
export function everPublished(state: AssetLifecycleState): boolean {
  return state === "published" || state === "edited" || state === "archived";
}

export interface LifecycleDescription {
  label: string;
  detail: string;
  badgeVariant: "success" | "pending" | "gold";
}

/** Human-facing status pill copy for the wizard header — see `WebsiteGeneratorWizard.tsx`. */
export function describeLifecycle(state: AssetLifecycleState): LifecycleDescription {
  switch (state) {
    case "published":
      return { label: "Live", detail: "Visitors can reach this site right now.", badgeVariant: "success" };
    case "edited":
      return {
        label: "Live · unpublished changes",
        detail:
          "The site is still live, but visitors still see your last published version — click Publish Changes below to push your latest edits live.",
        badgeVariant: "success",
      };
    case "archived":
      return {
        label: "Unpublished",
        detail: "This site isn't publicly reachable right now. Republish to bring it back online.",
        badgeVariant: "pending",
      };
    case "generated":
    case "draft":
    default:
      return { label: "Preview — not yet public", detail: "Review the site below, then publish when you're ready.", badgeVariant: "gold" };
  }
}

/** Primary action button label for the current lifecycle state when there is nothing else to choose between (see `WebsiteGeneratorWizard.tsx`'s `hasPendingChanges` branch for the "Save Draft" / "Publish Changes" two-button case, which does not use this helper). */
export function publishButtonLabel(state: AssetLifecycleState): string {
  return everPublished(state) ? "Republish Website" : "Publish Website";
}

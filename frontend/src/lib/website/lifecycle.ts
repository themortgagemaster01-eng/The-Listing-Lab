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
 * A DELIBERATE DEVIATION from a literal reading of Robert's transition
 * table, flagged here because it resolves a real contradiction between two
 * of his own explicit requirements — see the "Unpublish" bullet below for
 * the reasoning:
 *
 *   - A freshly auto-populated website record (nothing has been generated
 *     or reviewed by the Realtor yet, but the record is real/complete) is
 *     created directly as `generated` — see `createDraftWebsite` in
 *     `WebsiteGeneratorWizard.tsx`. There's no separate "click Generate"
 *     step for this feature (it's pure assembly of already-generated
 *     content), so `draft` is reachable only as the database column's
 *     default value before the client ever writes a row.
 *   - `markFieldEdited` only actually changes anything when the CURRENT
 *     state is `published`: a field edit moves it to `edited`. Pre-publish
 *     edits (theme selection before ever publishing) stay at `generated` —
 *     there is no user-visible difference yet between "auto-generated,
 *     untouched" and "auto-generated, then tweaked" until the record has
 *     gone live at least once.
 *   - `publish` always moves straight to `published` — this single
 *     function backs both the "Publish" and "Republish" buttons (see
 *     `everPublished`/`publishButtonLabel` below for the label-only
 *     distinction the UI draws between them).
 *   - `unpublish` moves `published` -> `archived`, NOT `published` ->
 *     `edited` as Robert's transition table literally states. Reasoning:
 *     Robert's brief also explicitly requires that a plain field edit on a
 *     live site must NOT take the site down ("the site should NOT
 *     auto-unpublish just because a field changed... the PUBLIC page keeps
 *     serving the last-published content"). But `markFieldEdited` ALSO
 *     moves `published` -> `edited` on every autosave. If Unpublish
 *     produced that exact same `edited` value, `loadPublicWebsite.ts`'s
 *     reachability gate could not tell "Realtor explicitly clicked
 *     Unpublish" apart from "Realtor merely changed the theme" — the two
 *     literally collapse to the same state, so satisfying one of Robert's
 *     requirements necessarily breaks the other under a literal reading.
 *     Routing Unpublish to the otherwise-unused `archived` state instead
 *     resolves this cleanly: `edited` now ALWAYS means "still reachable,
 *     diverged since last Republish" (a field edit never takes the site
 *     down), and `archived` ALWAYS means "explicitly taken down, not
 *     reachable" (Unpublish reliably works). This also finally gives
 *     `archived` a real producer — Robert's own "Republish (edited /
 *     archived -> published)" wording already anticipated exactly this
 *     pairing. Flagged here for Robert's review in case he intended
 *     something else by "Unpublish -> edited".
 *   - `isReachable` (backing `loadPublicWebsite.ts`'s public-page gate AND
 *     this wizard's "show Copy Link / View Live Site / Download QR /
 *     Unpublish" block) is true for `published` OR `edited` — both mean
 *     "currently live", matching the option-(b) design documented in
 *     `loadPublicWebsite.ts`: the public page always reads current/live
 *     data regardless of state, so `edited` vs `published` carries NO
 *     content difference for a visitor, only an internal "you have an
 *     unacknowledged change" reminder for the Realtor. `draft`,
 *     `generated`, and `archived` are not reachable.
 */

/** Marks a record as diverged since its last Republish — a no-op unless the record is currently `published`. Does NOT affect public reachability (see `isReachable`). */
export function markFieldEdited(state: AssetLifecycleState): AssetLifecycleState {
  return state === "published" ? "edited" : state;
}

/** Publish or re-publish — always resolves to `published` regardless of the prior state. */
export function publish(_state: AssetLifecycleState): AssetLifecycleState {
  return "published";
}

/** Explicitly takes a live site down without discarding it — `published` (or `edited`, i.e. "live with pending changes") -> `archived`; otherwise a no-op (nothing to unpublish). */
export function unpublish(state: AssetLifecycleState): AssetLifecycleState {
  return state === "published" || state === "edited" ? "archived" : state;
}

/** Whether the public `/site/[slug]` page should currently be reachable for this record — see this file's header comment for why `edited` counts as reachable. */
export function isReachable(state: AssetLifecycleState): boolean {
  return state === "published" || state === "edited";
}

/** Whether this record is showing fully up-to-date status with no pending "click Republish" reminder. */
export function isFullySynced(state: AssetLifecycleState): boolean {
  return state === "published";
}

/** Whether this record has gone live at least once before (drives the "Publish" vs. "Republish" button label). */
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
        detail: "The site is still up and already shows this change — click Republish to clear this reminder and update your version history.",
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

/** Primary action button label for the current lifecycle state. */
export function publishButtonLabel(state: AssetLifecycleState): string {
  if (state === "published") return "Update Live Site";
  if (everPublished(state)) return "Republish Website";
  return "Publish Website";
}

import type { PublicWebsiteData } from "@/lib/website/loadPublicWebsite";
import type { WebsitePublishedSnapshot } from "@/lib/website/types";

/**
 * Small, dedicated helpers for the draft/publish separation's snapshot
 * mechanism (see `WebsitePublishedSnapshot`'s doc comment in
 * `src/lib/website/types.ts`) — kept out of `WebsiteGeneratorWizard.tsx` so
 * the "what counts as a real content change" logic is independently
 * reviewable and reusable.
 */

/** Builds the `WebsitePublishedSnapshot` that a Publish/Publish Changes click should write, from the wizard's own live-assembled `PublicWebsiteData` (see `WebsiteGeneratorWizard.tsx`'s `previewData`). Deliberately drops `slug` — that lives on the parent `WebsiteRecord` and never changes. */
export function buildSnapshotFromPreview(data: PublicWebsiteData): WebsitePublishedSnapshot {
  return {
    property: data.property,
    flyerText: data.flyerText,
    paymentSnapshotInputs: data.paymentSnapshotInputs,
    theme: data.theme,
  };
}

/**
 * Deterministic, key-order-independent stringify. Plain `JSON.stringify` is
 * NOT safe for comparing a freshly-built snapshot against one that has
 * round-tripped through Postgres `jsonb` — `jsonb` does not guarantee
 * preserving object key insertion order, so two snapshots with identical
 * VALUES can produce different `JSON.stringify` output purely from key
 * reordering, which would falsely flag "pending changes" that don't really
 * exist. Recursively sorts object keys (arrays keep their order — order is
 * semantically meaningful there, e.g. `photos`/`keyFeatures`) before
 * stringifying so the comparison only reflects real content differences.
 */
function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  if (value !== null && typeof value === "object") {
    const keys = Object.keys(value as Record<string, unknown>).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify((value as Record<string, unknown>)[k])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

/** Whether two snapshots (or a live-assembled candidate vs. a stored one) represent the same content — see `stableStringify` for why this isn't just `JSON.stringify(a) === JSON.stringify(b)`. `null` only equals `null`. */
export function snapshotsEqual(a: WebsitePublishedSnapshot | null, b: WebsitePublishedSnapshot | null): boolean {
  if (a === null || b === null) return a === b;
  return stableStringify(a) === stableStringify(b);
}

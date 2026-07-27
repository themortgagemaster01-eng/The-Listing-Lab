/**
 * Slug generation for the Property Website Generator's public URL
 * (`/site/{slug}`). Extracted from the original mock `PropertyWebsiteTab.tsx`
 * (kept byte-for-byte identical in behavior) so both the real wizard and
 * any future code share one implementation instead of it being trapped in
 * a component file.
 */

/** Base slug from address + city — NOT guaranteed globally unique on its own (see `buildWebsiteSlug` below). */
export function slugify(address: string, cityStateZip: string): string {
  const city = cityStateZip.split(",")[0] ?? "";
  return `${address}-${city}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Short, deterministic suffix derived from a property id — appended to
 * every generated slug so two properties that happen to share the same
 * address + city text (unlikely but possible with demo/mock data) can
 * never collide, without needing an async "is this slug taken?" round
 * trip. Deterministic means the same property always regenerates the same
 * suffix, so slug generation stays idempotent.
 */
function shortIdSuffix(propertyId: string): string {
  const cleaned = propertyId.replace(/[^a-zA-Z0-9]/g, "");
  if (cleaned.length > 0) return cleaned.slice(-6).toLowerCase();
  // Extremely defensive fallback for a propertyId with no alphanumeric
  // characters at all — should never happen in practice (uuids and mock
  // slug ids are both alphanumeric), but a slug must never end up empty.
  let hash = 0;
  for (let i = 0; i < propertyId.length; i += 1) {
    hash = (hash * 31 + propertyId.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36).slice(0, 6);
}

/**
 * The full slug a website record should use — `slugify(address,
 * cityStateZip)` plus the property-id-derived suffix, satisfying the
 * `websites.slug` unique constraint (`supabase/migrations/0004_add_websites.sql`)
 * for real without a collision-check query. Generated once when a
 * property's website record is first created (see
 * `WebsiteGeneratorWizard.tsx`) and kept stable afterward so a published
 * link never breaks under the Realtor's feet.
 */
export function buildWebsiteSlug(address: string, cityStateZip: string, propertyId: string): string {
  const base = slugify(address, cityStateZip) || "listing";
  return `${base}-${shortIdSuffix(propertyId)}`;
}

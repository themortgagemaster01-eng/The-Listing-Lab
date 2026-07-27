/**
 * Builds the full public URL for a published Listing Presentation Site,
 * given its slug — mirrors `buildPropertyQrUrl` in `src/lib/pdf/qrcode.ts`
 * (same `NEXT_PUBLIC_APP_URL` env var, same fallback base). Used by the
 * wizard (Copy Link / View Live Site / QR code) and by the public page
 * itself (its own "QR code for print materials" section).
 */
export function buildWebsitePublicUrl(slug: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://the-listing-lab.vercel.app";
  return `${base.replace(/\/$/, "")}/site/${slug}`;
}

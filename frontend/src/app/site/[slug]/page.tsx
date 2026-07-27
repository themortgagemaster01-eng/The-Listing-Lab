import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { loadPublicWebsiteBySlug } from "@/lib/website/loadPublicWebsite";
import { buildWebsitePublicUrl } from "@/lib/website/url";
import { generateQrCodeDataUrl } from "@/lib/pdf/qrcode";
import { PublicSiteView } from "@/components/property/website/PublicSiteView";

interface SitePageProps {
  params: { slug: string };
}

/**
 * The public, unauthenticated "Listing Presentation Site" — a real home
 * buyer's landing page for one property, reachable at `/site/{slug}`
 * (outside the `(app)` route group on purpose, see
 * `src/app/(app)/property/[id]/layout.tsx`'s comment: that layout wraps
 * every signed-in page in `AppShell`'s dashboard chrome, which this page
 * must NOT have — it's a full-bleed, self-contained marketing page).
 *
 * HARD PERFORMANCE/ACCESSIBILITY REQUIREMENTS (Lighthouse Performance >= 90,
 * Accessibility >= 90) drove every choice below:
 *   - This page and every section except `PublicPaymentSnapshotSection` is
 *     a Server Component — zero client JS shipped for hero/gallery/
 *     description/features/agent/QR/contact. No Framer Motion here (used
 *     freely elsewhere in the app, deliberately skipped on this one page).
 *   - `next/image` for every photo, `priority` ONLY on the hero (the
 *     page's LCP element) so no other image competes for early bandwidth.
 *   - Real semantic HTML: one `<h1>` (the address), `<h2>` per section,
 *     `<header>`/`<main>`/`<section>`/`<footer>`, alt text on every image.
 *   - Every interactive element (there are few — mostly plain `<a>` links)
 *     keeps the app's `focus-visible:ring-2` convention.
 *   - The 3 lead-capture CTAs are honest `mailto:`/`tel:`/real-URL links
 *     (see `src/lib/website/lead-cta.ts`) — no client JS, no fake form.
 *
 * Every section is genuinely optional and gets omitted (never rendered
 * empty/fake) when its underlying data doesn't exist — see
 * `loadPublicWebsiteBySlug`'s JSDoc for exactly what's reused vs. omitted.
 *
 * The actual hero/gallery/description/etc. markup lives in
 * `components/property/website/PublicSiteView.tsx` — extracted out of this
 * file so `WebsiteGeneratorWizard.tsx`'s Preview Mode can render the exact
 * same sections (never a separate "mockup") before the site is ever
 * published. This file's only remaining job is the Server-Component data
 * load (`loadPublicWebsiteBySlug`) and the async QR code render.
 */
export async function generateMetadata({ params }: SitePageProps): Promise<Metadata> {
  const data = await loadPublicWebsiteBySlug(params.slug);
  if (!data) return { title: "Listing Not Found | The Listing Lab" };
  const { property, flyerText } = data;
  return {
    title: `${property.address} | ${property.cityStateZip}`,
    description: flyerText?.description ?? `View this listing at ${property.address}, ${property.cityStateZip}.`,
  };
}

export default async function PublicSitePage({ params }: SitePageProps) {
  const data = await loadPublicWebsiteBySlug(params.slug);
  if (!data) notFound();

  const publicUrl = buildWebsitePublicUrl(data.slug);
  const qrDataUrl = await generateQrCodeDataUrl(publicUrl);

  return <PublicSiteView data={data} publicUrl={publicUrl} qrDataUrl={qrDataUrl} />;
}

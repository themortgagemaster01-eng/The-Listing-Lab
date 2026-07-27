import Image from "next/image";
import { BedDouble, Bath, Ruler, CalendarDays, Mail, Phone, QrCode as QrCodeIcon, Trees } from "lucide-react";

import { buildLeadCtaMailto } from "@/lib/website/lead-cta";
import { formatCurrency } from "@/lib/flyer/mappers";
import { emptyPropertyForm } from "@/lib/flyer/types";
import { PublicPaymentSnapshotSection } from "@/components/property/website/PublicPaymentSnapshotSection";
import type { PublicWebsiteData } from "@/lib/website/loadPublicWebsite";

export interface PublicSiteViewProps {
  /** Everything the public page needs to render — same shape `loadPublicWebsiteBySlug` returns for the real, live page. */
  data: PublicWebsiteData;
  /** The full public URL this site is (or will be) reachable at — used for the QR section and the on-page copy, not fetched here. */
  publicUrl: string;
  /** A pre-rendered QR PNG data URL pointing at `publicUrl`, or `null` to omit the "Share This Listing" section entirely (e.g. while it's still generating). */
  qrDataUrl: string | null;
}

/**
 * The actual "Listing Presentation Site" page body — hero, gallery,
 * description, property details, payment snapshot, agent, QR, and contact
 * sections — extracted verbatim out of `src/app/site/[slug]/page.tsx` so it
 * can be shared, unmodified, by TWO callers:
 *   1. `src/app/site/[slug]/page.tsx` itself (a Server Component) — the
 *      real, live public page.
 *   2. `WebsiteGeneratorWizard.tsx`'s Preview Mode (a Client Component) —
 *      rendering the SAME sections, with the SAME data-shape contract, in
 *      an unpublished/pre-publish context, at a chosen device width. This
 *      is deliberate: the preview must never be a separate, divergent
 *      "mockup" of the real page that can silently drift out of sync with
 *      it — it IS the real page's rendering code, just fed draft data and
 *      shown inside a width-constrained frame instead of served at
 *      `/site/{slug}`.
 *
 * No `"use client"` directive here on purpose — this component has no
 * client-only APIs of its own (the one exception, the interactive Payment
 * Snapshot widget, is already its own `"use client"` boundary in
 * `PublicPaymentSnapshotSection`). That lets it keep rendering as a Server
 * Component with zero extra client JS when used from `page.tsx`, while
 * still being perfectly usable inside a `"use client"` tree (the wizard) —
 * Next.js/React render a plain component on the client automatically when
 * it's imported into client-component code, no directive needed on this
 * file for that to work.
 */
export function PublicSiteView({ data, publicUrl, qrDataUrl }: PublicSiteViewProps) {
  const { property, flyerText, paymentSnapshotInputs } = data;

  const photos = property.photos && property.photos.length > 0 ? property.photos : [];
  const heroPhoto = photos[0] || property.imageUrl;
  const galleryPhotos = photos.length > 1 ? photos : [];
  const priceLabel = formatCurrency(property.price ?? null);

  const agentName = property.listingAgent || null;
  const agentEmail = property.agentEmail || null;
  const agentPhone = property.agentPhone || null;
  const agentPhotoUrl = property.agentPhotoUrl || null;

  const requestShowingUrl = buildLeadCtaMailto(
    { agentEmail, agentPhone },
    { address: property.address, cityStateZip: property.cityStateZip },
    "Request a Showing"
  );
  const askQuestionUrl = buildLeadCtaMailto(
    { agentEmail, agentPhone },
    { address: property.address, cityStateZip: property.cityStateZip },
    "Ask a Question"
  );
  const preApprovedUrl =
    property.agentApplicationUrl ||
    buildLeadCtaMailto(
      { agentEmail, agentPhone },
      { address: property.address, cityStateZip: property.cityStateZip },
      "Get Pre-Approved"
    );

  // Shape needed by `generatePaymentSnapshotPdfBlob` (reused from the real
  // feature) — built from the same read-only property/agent data already
  // available here, not a second form.
  const propertyFormForPdf = emptyPropertyForm({
    address: property.address,
    cityStateZip: property.cityStateZip,
    price: property.price != null ? String(property.price) : "",
    agentName: agentName ?? "",
    agentEmail: agentEmail ?? "",
    agentPhone: agentPhone ?? "",
    agentPhotoUrl: agentPhotoUrl ?? "",
    agentApplicationUrl: property.agentApplicationUrl ?? "",
  });

  const ctaLinkClass =
    "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950";
  const primaryCtaClass = `${ctaLinkClass} bg-gold-500 text-navy-950 hover:bg-gold-400`;
  const secondaryCtaClass = `${ctaLinkClass} border border-white/30 text-white hover:bg-white/10 focus-visible:ring-offset-navy-950`;

  return (
    <>
      <header className="relative h-[65vh] min-h-[420px] w-full sm:h-[82vh]">
        <Image
          src={heroPhoto}
          alt={`Exterior photo of ${property.address}`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/95 via-navy-950/25 to-navy-950/10" />
        <div className="absolute inset-x-0 bottom-0 px-4 pb-10 sm:px-10 sm:pb-16">
          <div className="mx-auto max-w-5xl">
            {priceLabel && <p className="text-base font-semibold text-gold-300 sm:text-lg">{priceLabel}</p>}
            <h1 className="mt-1 font-display text-3xl font-bold leading-tight text-white sm:text-5xl">
              {property.address}
            </h1>
            <p className="mt-2 text-base text-white/85 sm:text-lg">{property.cityStateZip}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#contact" className={primaryCtaClass}>
                Request a Showing
              </a>
              <a href="#contact" className={secondaryCtaClass}>
                Ask a Question
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-16 px-4 py-12 sm:px-6 sm:py-16">
        {galleryPhotos.length > 0 && (
          <section aria-labelledby="gallery-heading">
            <h2 id="gallery-heading" className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
              Gallery
            </h2>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {galleryPhotos.map((url, index) => (
                <div key={`${url}-${index}`} className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                  <Image
                    src={url}
                    alt={`Photo ${index + 1} of ${property.address}`}
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {flyerText && (
          <section aria-labelledby="description-heading">
            <h2 id="description-heading" className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
              About This Home
            </h2>
            {flyerText.headline && (
              <p className="mt-3 text-lg font-medium text-navy-800 dark:text-gold-400">{flyerText.headline}</p>
            )}
            <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-muted-foreground">
              {flyerText.description}
            </p>
            {flyerText.featureBullets && flyerText.featureBullets.length > 0 && (
              <ul className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {flyerText.featureBullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2 text-sm text-foreground">
                    <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <section aria-labelledby="features-heading">
          <h2 id="features-heading" className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
            Property Details
          </h2>
          <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {property.beds != null && (
              <div className="rounded-2xl border border-border bg-surface p-4">
                <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <BedDouble className="h-4 w-4" aria-hidden="true" /> Bedrooms
                </dt>
                <dd className="mt-1 text-lg font-semibold text-foreground">{property.beds}</dd>
              </div>
            )}
            {property.baths != null && (
              <div className="rounded-2xl border border-border bg-surface p-4">
                <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Bath className="h-4 w-4" aria-hidden="true" /> Bathrooms
                </dt>
                <dd className="mt-1 text-lg font-semibold text-foreground">{property.baths}</dd>
              </div>
            )}
            {property.sqft != null && (
              <div className="rounded-2xl border border-border bg-surface p-4">
                <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Ruler className="h-4 w-4" aria-hidden="true" /> Square Feet
                </dt>
                <dd className="mt-1 text-lg font-semibold text-foreground">{property.sqft.toLocaleString()}</dd>
              </div>
            )}
            {property.lotSize && (
              <div className="rounded-2xl border border-border bg-surface p-4">
                <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Trees className="h-4 w-4" aria-hidden="true" /> Lot Size
                </dt>
                <dd className="mt-1 text-lg font-semibold text-foreground">{property.lotSize}</dd>
              </div>
            )}
            {property.yearBuilt != null && (
              <div className="rounded-2xl border border-border bg-surface p-4">
                <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarDays className="h-4 w-4" aria-hidden="true" /> Year Built
                </dt>
                <dd className="mt-1 text-lg font-semibold text-foreground">{property.yearBuilt}</dd>
              </div>
            )}
          </dl>
          {property.keyFeatures && property.keyFeatures.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {property.keyFeatures.map((feature) => (
                <li
                  key={feature}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  {feature}
                </li>
              ))}
            </ul>
          )}
        </section>

        {paymentSnapshotInputs && (
          <section aria-labelledby="payment-heading">
            <h2 id="payment-heading" className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
              Estimated Payment
            </h2>
            <div className="mt-6">
              <PublicPaymentSnapshotSection
                inputs={paymentSnapshotInputs}
                property={propertyFormForPdf}
                heroPhotoUrl={heroPhoto}
              />
            </div>
          </section>
        )}

        <section aria-labelledby="agent-heading" className="rounded-3xl bg-navy-950 p-8 text-white sm:p-12">
          <h2 id="agent-heading" className="font-display text-2xl font-semibold sm:text-3xl">
            Presented By
          </h2>
          <div className="mt-6 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            {agentPhotoUrl && (
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-gold-400">
                <Image src={agentPhotoUrl} alt={agentName ? `Headshot of ${agentName}` : "Agent headshot"} fill sizes="80px" className="object-cover" />
              </div>
            )}
            <div className="space-y-1.5">
              {agentName && <p className="text-lg font-semibold">{agentName}</p>}
              {agentPhone && (
                <a
                  href={`tel:${agentPhone.replace(/[^0-9+]/g, "")}`}
                  className="flex items-center gap-2 text-sm text-white/85 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" /> {agentPhone}
                </a>
              )}
              {agentEmail && (
                <a
                  href={`mailto:${agentEmail}`}
                  className="flex items-center gap-2 text-sm text-white/85 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" /> {agentEmail}
                </a>
              )}
              {!agentName && !agentPhone && !agentEmail && (
                <p className="text-sm text-white/70">Contact information coming soon.</p>
              )}
            </div>
          </div>
        </section>

        {qrDataUrl && (
          <section aria-labelledby="qr-heading">
            <h2 id="qr-heading" className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
              Share This Listing
            </h2>
            <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-6 sm:flex-row">
              {/* eslint-disable-next-line @next/next/no-img-element -- small pre-rendered data-URL PNG, next/image adds no value here */}
              <img src={qrDataUrl} alt={`QR code linking to ${publicUrl}`} className="h-32 w-32 rounded-lg border border-border bg-white p-1.5" />
              <div className="text-sm text-muted-foreground">
                <p className="flex items-center gap-1.5 font-medium text-foreground">
                  <QrCodeIcon className="h-4 w-4" aria-hidden="true" /> Scan to view on your phone
                </p>
                <p className="mt-1">Great for yard signs, open house handouts, and printed flyers.</p>
              </div>
            </div>
          </section>
        )}

        <section id="contact" aria-labelledby="contact-heading" className="rounded-3xl border border-border bg-surface p-8 text-center sm:p-12">
          <h2 id="contact-heading" className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
            Get In Touch
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Interested in {property.address}? Reach out below and {agentName || "the listing agent"} will follow up.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {requestShowingUrl && (
              <a
                href={requestShowingUrl}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold-500 px-5 py-3 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2"
              >
                Request a Showing
              </a>
            )}
            {askQuestionUrl && (
              <a
                href={askQuestionUrl}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2"
              >
                Ask a Question
              </a>
            )}
            {preApprovedUrl && (
              <a
                href={preApprovedUrl}
                target={property.agentApplicationUrl ? "_blank" : undefined}
                rel={property.agentApplicationUrl ? "noopener noreferrer" : undefined}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2"
              >
                Get Pre-Approved
              </a>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-surface px-4 py-8 text-center text-xs text-muted-foreground sm:px-6">
        <p>{property.address}, {property.cityStateZip}</p>
        <p className="mt-1">Presented by {agentName || "The Listing Lab"}.</p>
      </footer>
    </>
  );
}

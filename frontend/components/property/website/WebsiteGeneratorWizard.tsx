"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Copy, Download, ExternalLink, EyeOff, QrCode as QrCodeIcon, Sparkles } from "lucide-react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/shared/Toast";
import { TemplateGalleryCard, type TemplateOption } from "@/components/property/TemplateGalleryCard";
import { FlyerAutoSaveIndicator, type SaveStatus } from "@/components/property/flyer/FlyerAutoSaveIndicator";
import { WebsiteDevicePreview, type PreviewDevice } from "@/components/property/website/WebsiteDevicePreview";
import { Button } from "@/components/ui/button";
import * as flyerPersistence from "@/lib/flyer/persistence";
import { seedFormFromProperty, seedPhotosFromProperty, parseIntField, parseNumberField } from "@/lib/flyer/mappers";
import { resolveFlyerText, type FlyerPhoto, type FlyerRecord, type PropertyFormData } from "@/lib/flyer/types";
import * as paymentPersistence from "@/lib/payment/persistence";
import type { PaymentSnapshotRecord } from "@/lib/payment/types";
import * as websitePersistence from "@/lib/website/persistence";
import { buildWebsiteSlug } from "@/lib/website/slug";
import { buildWebsitePublicUrl } from "@/lib/website/url";
import { WEBSITE_THEME_DESCRIPTIONS, WEBSITE_THEME_LABELS, type WebsiteRecord, type WebsiteTheme } from "@/lib/website/types";
import { describeLifecycle, everPublished, isReachable, markFieldEdited, publish, publishButtonLabel, unpublish } from "@/lib/website/lifecycle";
import type { PublicWebsiteData } from "@/lib/website/loadPublicWebsite";
import { generateQrCodeDataUrl } from "@/lib/pdf/qrcode";
import { downloadBlob } from "@/lib/pdf/generateFlyerPdfBlob";
import { useDebouncedSave } from "@/lib/hooks/use-debounced-save";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { describeSupabaseError } from "@/lib/supabase/errors";
import { publishAsset, archiveAsset } from "@/lib/assets/asset-lifecycle-service";
import type { Property } from "@/types";

const THEMES: TemplateOption[] = (["estate", "minimal", "showcase"] as WebsiteTheme[]).map((id) => ({
  id,
  name: WEBSITE_THEME_LABELS[id],
  description: WEBSITE_THEME_DESCRIPTIONS[id],
  swatchClass:
    id === "estate"
      ? "bg-gradient-to-br from-navy-900 to-navy-700"
      : id === "minimal"
        ? "bg-gradient-to-br from-slate-100 to-slate-300"
        : "bg-gradient-to-br from-gold-400 to-gold-600",
}));

interface WebsiteGeneratorWizardProps {
  property: Property;
}

function newWebsiteId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `website-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** A freshly auto-populated record starts life as `"generated"` — see `src/lib/website/lifecycle.ts`'s header comment for why this feature has no separate `"draft"` step of its own. */
function createDraftWebsite(propertyId: string, form: PropertyFormData): WebsiteRecord {
  const id = newWebsiteId();
  const now = new Date().toISOString();
  return {
    id,
    marketingAssetId: id,
    propertyId,
    slug: buildWebsiteSlug(form.address, form.cityStateZip, propertyId),
    theme: "estate",
    lifecycleState: "generated",
    version: 1,
    createdAt: now,
    updatedAt: now,
  };
}

function mostRecentlyUpdated<T extends { updatedAt: string }>(records: T[]): T | null {
  if (records.length === 0) return null;
  return [...records].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
}

/**
 * Top-level "Listing Presentation Site" wizard — a Generate -> Review ->
 * Publish flow, not a page builder. Every field auto-populates from what
 * already exists for this property (agent info + photos from the Flyer
 * Generator's shared property form, description/features from the
 * property's most recent flyer, the payment comparison from its most
 * recent Payment Snapshot) and the record lands in a `"generated"` state —
 * genuinely reviewable via Preview Mode below, but NOT publicly reachable —
 * until the Realtor explicitly clicks Publish. The only decision left is
 * which theme to use; everything else is assembly, not authoring.
 *
 * Owns persistence the same way `PaymentSnapshotWizard.tsx` does:
 * debounced auto-save of the website record (theme selection) through
 * `src/lib/website/persistence.ts`. Publish/Unpublish are separate,
 * immediate (non-debounced) actions that move `lifecycleState` through the
 * shared asset lifecycle model — see `src/lib/website/lifecycle.ts` for the
 * exact transition rules this component drives.
 */
export function WebsiteGeneratorWizard({ property }: WebsiteGeneratorWizardProps) {
  const propertyId = property.id;
  const { showToast } = useToast();

  const [loaded, setLoaded] = React.useState(false);
  const [propertyForm, setPropertyForm] = React.useState<PropertyFormData>(() => seedFormFromProperty(property));
  const [photos, setPhotos] = React.useState<FlyerPhoto[]>(() => seedPhotosFromProperty(property));
  const [latestFlyer, setLatestFlyer] = React.useState<FlyerRecord | null>(null);
  const [latestSnapshot, setLatestSnapshot] = React.useState<PaymentSnapshotRecord | null>(null);
  const [website, setWebsite] = React.useState<WebsiteRecord | null>(null);
  const [publishing, setPublishing] = React.useState(false);
  const [qrDataUrl, setQrDataUrl] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [previewDevice, setPreviewDevice] = React.useState<PreviewDevice>("desktop");

  // ---- initial load: everything this feature reuses, read-only ----
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const [savedForm, savedPhotos, flyers, snapshots, savedWebsite] = await Promise.all([
        flyerPersistence.loadPropertyForm(propertyId),
        flyerPersistence.loadPhotos(propertyId),
        flyerPersistence.loadFlyers(propertyId),
        paymentPersistence.loadPaymentSnapshots(propertyId),
        websitePersistence.loadPropertyWebsite(propertyId),
      ]);
      if (cancelled) return;

      const form = savedForm ?? seedFormFromProperty(property);
      setPropertyForm(form);
      setPhotos(savedPhotos.length > 0 ? savedPhotos : seedPhotosFromProperty(property));
      setLatestFlyer(mostRecentlyUpdated(flyers));
      setLatestSnapshot(mostRecentlyUpdated(snapshots));

      const record = savedWebsite ?? createDraftWebsite(propertyId, form);
      setWebsite(record);
      // The slug (and therefore the public URL) is generated once and kept
      // stable for the record's whole life, so the QR code can be rendered
      // up front — in Preview Mode it shows what visitors WILL scan once
      // published, it isn't gated on lifecycleState the way the "Copy
      // Link"/"View Live Site"/"Download QR Code" actions are below.
      try {
        setQrDataUrl(await generateQrCodeDataUrl(buildWebsitePublicUrl(record.slug)));
      } catch {
        // Non-critical — every other affordance still works without a QR image.
      }
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
    // Intentionally only depends on propertyId — re-running on every `property` object identity change would clobber in-progress edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  // ---- auto-save: website record (currently just theme selection) ----
  const saveStatus: SaveStatus = useDebouncedSave(
    website,
    async (record) => {
      if (!record) return;
      await websitePersistence.savePropertyWebsite(propertyId, record);
    },
    { enabled: loaded && !!website, delay: 700 }
  );

  const flyerText = latestFlyer ? resolveFlyerText(latestFlyer) : null;

  // The exact same data shape the public `/site/[slug]` page reads —
  // assembled from this wizard's own already-loaded client state so
  // Preview Mode renders the REAL `PublicSiteView` sections (see that
  // component's header comment), never a second, divergent mockup.
  const previewData: PublicWebsiteData = React.useMemo(() => {
    const previewProperty: Property = {
      id: propertyId,
      address: propertyForm.address,
      cityStateZip: propertyForm.cityStateZip,
      status: property.status,
      assetCount: property.assetCount,
      imageUrl: photos[0]?.url || property.imageUrl,
      price: parseNumberField(propertyForm.price),
      beds: parseIntField(propertyForm.bedrooms),
      baths: parseNumberField(propertyForm.bathrooms),
      sqft: parseIntField(propertyForm.squareFeet),
      yearBuilt: parseIntField(propertyForm.yearBuilt),
      lotSize: propertyForm.lotSize || undefined,
      mlsNumber: propertyForm.mlsNumber || undefined,
      photos: photos.map((p) => p.url),
      listingAgent: propertyForm.agentName || undefined,
      propertyType: propertyForm.propertyType || undefined,
      keyFeatures: propertyForm.keyFeatures,
      agentEmail: propertyForm.agentEmail || undefined,
      agentPhone: propertyForm.agentPhone || undefined,
      agentPhotoUrl: propertyForm.agentPhotoUrl || undefined,
      agentApplicationUrl: propertyForm.agentApplicationUrl || undefined,
    };
    return {
      slug: website?.slug ?? "",
      theme: website?.theme ?? "estate",
      property: previewProperty,
      flyerText,
      paymentSnapshotInputs: latestSnapshot?.inputs ?? null,
    };
  }, [propertyId, propertyForm, photos, property.status, property.assetCount, property.imageUrl, website?.slug, website?.theme, flyerText, latestSnapshot]);

  function selectTheme(theme: WebsiteTheme) {
    setWebsite((prev) =>
      prev
        ? { ...prev, theme, lifecycleState: markFieldEdited(prev.lifecycleState), updatedAt: new Date().toISOString() }
        : prev
    );
  }

  async function handlePublish() {
    if (!website) return;
    setPublishing(true);
    try {
      // Whether this record has gone live at least once BEFORE this click —
      // deliberately `everPublished`, not `isReachable`: publishing from
      // `archived` (Unpublish's target state — see `src/lib/website/lifecycle.ts`)
      // is a genuine republish and should bump the version counter too,
      // even though `archived` isn't currently "reachable".
      const isRepublish = everPublished(website.lifecycleState);
      const updated: WebsiteRecord = {
        ...website,
        lifecycleState: publish(website.lifecycleState),
        // Bumped only on an actual republish (matches flyers'/payment
        // snapshots' "version" convention) — the very first publish keeps
        // version 1. This is the CHILD `websites.version` counter, kept as
        // its own existing convention — see the doc comment on
        // `marketing_assets.version` in `0004_add_websites.sql` for why the
        // new parent-row counter is intentionally NOT bumped here too.
        version: isRepublish ? website.version + 1 : website.version,
        updatedAt: new Date().toISOString(),
      };
      setWebsite(updated);
      // Persist the child `websites` row (theme/slug/version/is_published)
      // plus the localStorage fallback copy first, so the parent
      // `marketing_assets` row is guaranteed to exist before the generic
      // service below reads/updates it (matters on a very first publish
      // that races ahead of the debounced autosave).
      await websitePersistence.savePropertyWebsite(propertyId, updated);
      // The actual, authoritative lifecycle transition + `published_at`
      // stamp now goes through the shared, reusable lifecycle service
      // (`src/lib/assets/asset-lifecycle-service.ts`) instead of website-
      // specific inline Supabase writes — this is the same generic
      // function any other asset type can call once it adopts this model.
      // Best-effort: `saveWebsiteSupabase` above already wrote
      // `lifecycle_state` too (it has to, for record-creation and the
      // field-edit-while-live autosave path — see that file's comments),
      // so a failure here is logged, not fatal, and mainly costs the new
      // `published_at` stamp rather than the publish itself.
      if (isSupabaseConfigured) {
        try {
          await publishAsset(website.marketingAssetId);
        } catch (err) {
          console.error(`[Listing Lab] publishAsset failed for ${website.marketingAssetId}: ${describeSupabaseError(err)}`);
        }
      }
      showToast(isRepublish ? "Live site updated." : "Your Listing Presentation Site is live.");
    } finally {
      setPublishing(false);
    }
  }

  async function handleUnpublish() {
    if (!website) return;
    setPublishing(true);
    try {
      const updated: WebsiteRecord = {
        ...website,
        lifecycleState: unpublish(website.lifecycleState),
        updatedAt: new Date().toISOString(),
      };
      setWebsite(updated);
      await websitePersistence.savePropertyWebsite(propertyId, updated);
      // Same reasoning as `handlePublish` above — route the authoritative
      // DB write through the shared, reusable `archiveAsset` function.
      if (isSupabaseConfigured) {
        try {
          await archiveAsset(website.marketingAssetId);
        } catch (err) {
          console.error(`[Listing Lab] archiveAsset failed for ${website.marketingAssetId}: ${describeSupabaseError(err)}`);
        }
      }
      showToast("Site unpublished — it's no longer publicly reachable. Republish any time to bring it back.");
    } finally {
      setPublishing(false);
    }
  }

  async function handleCopy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      showToast("Couldn't copy the link — copy it manually instead.");
    }
  }

  async function handleDownloadQr(url: string) {
    try {
      const dataUrl = qrDataUrl ?? (await generateQrCodeDataUrl(url));
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const filename = `${(propertyForm.address || "listing").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-qr-code.png`;
      downloadBlob(blob, filename);
    } catch {
      showToast("Couldn't download the QR code — please try again.");
    }
  }

  if (!loaded || !website) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton className="h-12 w-full rounded-2xl" />
        <LoadingSkeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  const publicUrl = buildWebsitePublicUrl(website.slug);
  // `published` OR `edited` — both mean the site is currently reachable at
  // `/site/[slug]`; see `isReachable`'s doc comment in
  // `src/lib/website/lifecycle.ts` for why a plain field edit doesn't take
  // a live site down.
  const reachable = isReachable(website.lifecycleState);
  const lifecycle = describeLifecycle(website.lifecycleState);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Listing Presentation Site</h2>
          <p className="text-sm text-muted-foreground">
            A one-click public website for this listing — auto-populated from your flyer copy and Payment Snapshot.
          </p>
        </div>
        <FlyerAutoSaveIndicator status={saveStatus} />
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3">
        <Badge variant={lifecycle.badgeVariant}>{lifecycle.label}</Badge>
        <p className="text-sm text-muted-foreground">{lifecycle.detail}</p>
      </div>

      {!flyerText && (
        <div className="rounded-2xl border border-dashed border-border bg-background px-4 py-3 text-sm text-muted-foreground">
          No flyer yet for this property — generate one first to auto-populate your site&apos;s description and feature
          bullets.{" "}
          <Link href={`/property/${propertyId}/marketing-assets`} className="font-medium text-navy-700 underline-offset-4 hover:underline dark:text-gold-400">
            Go to Flyer Generator
          </Link>
        </div>
      )}
      {!latestSnapshot && (
        <div className="rounded-2xl border border-dashed border-border bg-background px-4 py-3 text-sm text-muted-foreground">
          No Payment Snapshot yet — the site will publish without a Payment Snapshot section until you create one.{" "}
          <Link href={`/property/${propertyId}/payment-tools`} className="font-medium text-navy-700 underline-offset-4 hover:underline dark:text-gold-400">
            Go to Payment Tools
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
        <DashboardCard title="Themes">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
            {THEMES.map((theme) => (
              <TemplateGalleryCard
                key={theme.id}
                template={theme}
                selected={theme.id === website.theme}
                onSelect={() => selectTheme(theme.id as WebsiteTheme)}
              />
            ))}
          </div>
        </DashboardCard>

        <DashboardCard
          title={reachable ? "Live Preview" : "Preview — not yet public"}
          contentClassName="mt-4 flex flex-col gap-5"
        >
          <WebsiteDevicePreview
            data={previewData}
            publicUrl={publicUrl}
            qrDataUrl={qrDataUrl}
            device={previewDevice}
            onDeviceChange={setPreviewDevice}
          />

          {reachable && (
            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-2 text-sm">
                <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate font-medium text-foreground">{publicUrl}</span>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => handleCopy(publicUrl)}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied!" : "Copy Link"}
                </Button>
                <Button type="button" variant="outline" size="sm" asChild>
                  <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    View Live Site
                  </a>
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => handleDownloadQr(publicUrl)}>
                  <Download className="h-4 w-4" />
                  Download QR Code
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={handleUnpublish} disabled={publishing}>
                  <EyeOff className="h-4 w-4" />
                  Unpublish
                </Button>
              </div>
            </div>
          )}

          {reachable && qrDataUrl && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-background p-4 sm:flex-row sm:items-center">
              {/* eslint-disable-next-line @next/next/no-img-element -- small pre-rendered data-URL PNG, next/image adds no value here */}
              <img src={qrDataUrl} alt={`QR code linking to ${publicUrl}`} className="h-28 w-28 rounded-lg border border-border bg-white p-1.5" />
              <div className="text-sm text-muted-foreground">
                <p className="flex items-center gap-1.5 font-medium text-foreground">
                  <QrCodeIcon className="h-4 w-4" /> Scan for print materials
                </p>
                <p className="mt-1">Drop this QR code on flyers, signs, or open house handouts.</p>
              </div>
            </div>
          )}

          <Button type="button" variant="gold" size="lg" onClick={handlePublish} disabled={publishing} className="w-full sm:w-auto sm:self-start">
            <Sparkles className="h-4 w-4" />
            {publishing ? "Publishing…" : publishButtonLabel(website.lifecycleState)}
          </Button>
          {!reachable && everPublished(website.lifecycleState) && (
            <p className="text-xs text-muted-foreground">
              This site was previously live. Republishing updates the same URL — nothing to re-enter.
            </p>
          )}
        </DashboardCard>
      </div>
    </div>
  );
}

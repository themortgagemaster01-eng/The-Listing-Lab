"use client";

import * as React from "react";

import { formatCurrency, formatStatsLine, parseNumberField } from "@/lib/flyer/mappers";
import type { FlyerPhoto, PropertyFormData } from "@/lib/flyer/types";
import type { FlyerTemplate, FlyerTextContent } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

/**
 * On-screen live preview for the four flyer templates (Phase 2 spec item
 * #5) — rendered with the user's ACTUAL uploaded photos and (possibly
 * edited) AI copy, not generic placeholder mockups. Deliberately mirrors
 * the layout structure of `src/lib/pdf/FlyerPdfDocument.tsx` (full-bleed
 * hero vs. photo grid vs. single bordered photo; serif vs. bold sans-serif
 * emphasis; layout density) so what the user picks here is what they get
 * in the exported PDF.
 *
 * Rendered at a fixed base pixel size (Letter-ish aspect ratio) and scaled
 * via `ResizeObserver` + CSS transform to fit whatever container it's
 * dropped into — the same content renders pixel-identically whether it's a
 * small gallery thumbnail or the large "current template" preview.
 */

const BASE_WIDTH = 800;
const BASE_HEIGHT = 1035;

function useContainerScale(baseWidth: number) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(0.3);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      if (el.offsetWidth > 0) setScale(el.offsetWidth / baseWidth);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [baseWidth]);

  return { ref, scale };
}

interface FlyerLivePreviewProps {
  template: FlyerTemplate;
  form: PropertyFormData;
  photos: FlyerPhoto[];
  text: FlyerTextContent | null;
  className?: string;
}

const FALLBACK_TEXT: FlyerTextContent = {
  headline: "Your AI-generated headline will appear here",
  luxuryHeadline: "An elevated, luxury-toned alternative headline",
  description: "Generate AI copy to see your listing description here.",
  featureBullets: ["Feature bullets will appear here"],
  neighborhoodHighlights: "Neighborhood highlights will appear here.",
  callToAction: "Schedule your private showing today.",
};

export function FlyerLivePreview({ template, form, photos, text, className }: FlyerLivePreviewProps) {
  const { ref, scale } = useContainerScale(BASE_WIDTH);
  const content = text ?? FALLBACK_TEXT;
  const ordered = [...photos].sort((a, b) => {
    if (a.isCover !== b.isCover) return a.isCover ? -1 : 1;
    return a.displayOrder - b.displayOrder;
  });
  const price = formatCurrency(parseNumberField(form.price));
  const stats = formatStatsLine(form);

  return (
    <div
      ref={ref}
      className={cn("relative w-full overflow-hidden rounded-xl border border-border bg-white shadow-sm", className)}
      style={{ aspectRatio: `${BASE_WIDTH} / ${BASE_HEIGHT}` }}
    >
      <div
        style={{
          width: BASE_WIDTH,
          height: BASE_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
        className="bg-white text-[#0c1930]"
      >
        {template === "luxury" && <LuxuryPreview form={form} photos={ordered} text={content} price={price} stats={stats} />}
        {template === "modern" && <ModernPreview form={form} photos={ordered} text={content} price={price} stats={stats} />}
        {template === "classic" && <ClassicPreview form={form} photos={ordered} text={content} price={price} stats={stats} />}
        {template === "minimal" && <MinimalPreview form={form} photos={ordered} text={content} price={price} stats={stats} />}
      </div>
    </div>
  );
}

interface TemplateInnerProps {
  form: PropertyFormData;
  photos: FlyerPhoto[];
  text: FlyerTextContent;
  price: string | null;
  stats: string;
}

function PhotoOrPlaceholder({ url, className }: { url?: string; className?: string }) {
  if (!url) return <div className={cn("bg-navy-100", className)} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="" className={cn("object-cover", className)} />;
}

function LuxuryPreview({ form, photos, text, price, stats }: TemplateInnerProps) {
  return (
    <div style={{ width: BASE_WIDTH, height: BASE_HEIGHT }} className="flex flex-col font-serif">
      <div className="relative" style={{ height: 420 }}>
        <PhotoOrPlaceholder url={photos[0]?.url} className="h-full w-full" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950 via-navy-950/70 to-transparent px-10 pb-8 pt-24">
          {price && <p className="text-lg font-semibold text-gold-400">{price}</p>}
          <h2 className="mt-1 text-4xl font-semibold leading-tight text-white">{text.luxuryHeadline || text.headline}</h2>
          <p className="mt-2 text-sm text-white/85">
            {form.address}
            {form.cityStateZip ? `, ${form.cityStateZip}` : ""}
            {stats ? `   ·   ${stats}` : ""}
          </p>
        </div>
      </div>
      <div className="flex flex-1 gap-8 px-10 py-8">
        <div className="flex-[1.4]">
          <p className="mb-2 text-xs font-bold tracking-widest text-gold-600">THE OFFERING</p>
          <p className="text-sm leading-relaxed text-navy-900">{text.description}</p>
          <ul className="mt-4 space-y-1.5">
            {text.featureBullets.slice(0, 6).map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-navy-900">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                {b}
              </li>
            ))}
          </ul>
          <p className="mb-1 mt-4 text-xs font-bold tracking-widest text-gold-600">THE NEIGHBORHOOD</p>
          <p className="text-xs leading-relaxed text-navy-400">{text.neighborhoodHighlights}</p>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          {photos.slice(1, 3).map((p, i) => (
            <PhotoOrPlaceholder key={i} url={p.url} className="h-32 w-full rounded-sm" />
          ))}
          <div className="mt-2 rounded-sm bg-navy-900 p-4">
            <p className="text-sm font-semibold text-gold-400">{text.callToAction}</p>
            <p className="mt-1 text-[11px] text-white/60">
              MLS# {form.mlsNumber || "—"} · {form.propertyType || "Residential"}
            </p>
          </div>
        </div>
      </div>
      <AgentFooterLuxury form={form} />
    </div>
  );
}

function ModernPreview({ form, photos, text, price, stats }: TemplateInnerProps) {
  const grid = photos.slice(1, 4);
  return (
    <div style={{ width: BASE_WIDTH, height: BASE_HEIGHT }} className="flex flex-col font-sans">
      <div className="flex" style={{ height: 260 }}>
        <PhotoOrPlaceholder url={photos[0]?.url} className="h-full flex-[2]" />
        <div className="flex flex-1 flex-col gap-0.5">
          {grid.length > 0 ? (
            grid.map((p, i) => <PhotoOrPlaceholder key={i} url={p.url} className="w-full flex-1" />)
          ) : (
            <div className="h-full w-full bg-navy-800" />
          )}
        </div>
      </div>
      <div className="bg-navy-950 px-10 py-4">
        <h2 className="text-2xl font-extrabold text-white">{text.headline}</h2>
        <div className="mt-1 flex items-center justify-between">
          <p className="text-sm text-white/70">
            {form.address}
            {form.cityStateZip ? `, ${form.cityStateZip}` : ""}
          </p>
          {price && <p className="text-lg font-extrabold text-gold-400">{price}</p>}
        </div>
      </div>
      <div className="bg-gold-500 px-10 py-2">
        <p className="text-xs font-bold text-navy-950">
          {stats}
          {form.lotSize ? `   ·   Lot: ${form.lotSize}` : ""}
          {form.yearBuilt ? `   ·   Built ${form.yearBuilt}` : ""}
        </p>
      </div>
      <div className="flex flex-1 gap-6 px-10 py-6">
        <div className="flex-[1.3]">
          <p className="text-sm leading-relaxed text-navy-900">{text.description}</p>
          <ul className="mt-3 grid grid-cols-1 gap-1.5">
            {text.featureBullets.slice(0, 8).map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-navy-900">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                {b}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-1 flex-col gap-3">
          <div className="rounded-sm bg-surface-secondary p-4">
            <p className="mb-1 text-xs font-bold text-navy-800">NEIGHBORHOOD</p>
            <p className="text-xs leading-relaxed text-navy-400">{text.neighborhoodHighlights}</p>
          </div>
          <div className="rounded-sm bg-navy-900 p-4">
            <p className="text-sm font-bold text-gold-400">{text.callToAction}</p>
          </div>
        </div>
      </div>
      <AgentFooterModern form={form} />
    </div>
  );
}

function ClassicPreview({ form, photos, text, price, stats }: TemplateInnerProps) {
  return (
    <div style={{ width: BASE_WIDTH, height: BASE_HEIGHT }} className="flex flex-col items-center px-12 py-10 font-serif">
      <p className="text-xs font-bold tracking-[0.3em] text-gold-600">FOR SALE</p>
      <h2 className="mt-2 text-center text-3xl font-bold text-navy-900">{text.headline}</h2>
      <p className="mt-1 text-sm text-navy-400">
        {form.address}
        {form.cityStateZip ? `, ${form.cityStateZip}` : ""}
      </p>

      <div className="mt-5 w-full border-4 border-gold-500 p-1">
        <PhotoOrPlaceholder url={photos[0]?.url} className="h-64 w-full" />
      </div>

      <div className="mt-5 flex w-full items-center justify-center gap-8 border-y border-gold-200 py-3">
        {price && <p className="text-lg font-bold text-navy-900">{price}</p>}
        {stats && <p className="text-sm text-navy-400">{stats}</p>}
        {form.mlsNumber && <p className="text-sm text-navy-400">MLS# {form.mlsNumber}</p>}
      </div>

      <p className="mt-5 text-justify text-sm leading-relaxed text-navy-900">{text.description}</p>

      <div className="mt-5 flex w-full gap-10">
        <div className="flex-1">
          <p className="mb-2 text-xs font-bold text-gold-600">FEATURES</p>
          <ul className="space-y-1.5">
            {text.featureBullets.slice(0, 6).map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-navy-900">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                {b}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1">
          <p className="mb-2 text-xs font-bold text-gold-600">THE NEIGHBORHOOD</p>
          <p className="text-sm leading-relaxed text-navy-400">{text.neighborhoodHighlights}</p>
        </div>
      </div>

      <p className="mt-6 text-center text-base font-bold text-navy-900">{text.callToAction}</p>

      <div className="mt-auto w-full border-t border-border pt-4">
        <AgentFooterClassic form={form} />
      </div>
    </div>
  );
}

function MinimalPreview({ form, photos, text, price, stats }: TemplateInnerProps) {
  const gallery = photos.slice(1, 4);
  return (
    <div style={{ width: BASE_WIDTH, height: BASE_HEIGHT }} className="flex flex-col px-12 py-10 font-sans">
      <div className="mb-4 flex items-center gap-2">
        <span className="h-px w-7 bg-gold-500" />
        <span className="text-xs font-bold tracking-[0.3em] text-gold-600">NEW LISTING</span>
      </div>
      <h2 className="mb-1.5 text-4xl font-normal leading-tight text-navy-950">{text.headline}</h2>
      <div className="mb-5 flex items-end justify-between">
        <p className="text-sm text-navy-400">
          {form.address}
          {form.cityStateZip ? `, ${form.cityStateZip}` : ""}
          {stats ? `   ·   ${stats}` : ""}
        </p>
        {price && <p className="text-xl font-bold text-navy-950">{price}</p>}
      </div>

      <PhotoOrPlaceholder url={photos[0]?.url} className="h-56 w-full" />
      {gallery.length > 0 && (
        <div className="mt-1 flex gap-1">
          {gallery.map((p, i) => (
            <PhotoOrPlaceholder key={i} url={p.url} className="h-16 flex-1" />
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-1 gap-8">
        <div className="flex-[1.3]">
          <p className="text-sm leading-relaxed text-navy-900">{text.description}</p>
          <ul className="mt-4 space-y-1.5">
            {text.featureBullets.slice(0, 8).map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-navy-900">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                {b}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1">
          <div className="border border-gold-200 p-4">
            <p className="mb-1.5 text-xs font-bold tracking-widest text-gold-600">THE NEIGHBORHOOD</p>
            <p className="text-xs leading-relaxed text-navy-400">{text.neighborhoodHighlights}</p>
            <div className="my-3 h-px bg-gold-200" />
            <p className="text-sm font-bold text-navy-950">{text.callToAction}</p>
            <p className="mt-1 text-[11px] text-navy-400">
              MLS# {form.mlsNumber || "—"} · {form.propertyType || "Residential"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-auto border-t border-border pt-4">
        <AgentFooterMinimal form={form} />
      </div>
    </div>
  );
}

function AgentFooterLuxury({ form }: { form: PropertyFormData }) {
  return (
    <div className="flex items-center justify-between px-10 pb-6">
      <AgentBlock form={form} dark />
      <QrPlaceholder dark />
    </div>
  );
}
function AgentFooterModern({ form }: { form: PropertyFormData }) {
  return (
    <div className="flex items-center justify-between px-10 pb-6">
      <AgentBlock form={form} />
      <QrPlaceholder />
    </div>
  );
}
function AgentFooterClassic({ form }: { form: PropertyFormData }) {
  return (
    <div className="flex items-center justify-between">
      <AgentBlock form={form} />
      <QrPlaceholder />
    </div>
  );
}
function AgentFooterMinimal({ form }: { form: PropertyFormData }) {
  return (
    <div className="flex items-center justify-between">
      <AgentBlock form={form} />
      <QrPlaceholder />
    </div>
  );
}

function AgentBlock({ form, dark }: { form: PropertyFormData; dark?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {form.agentPhotoUrl ? (
        <PhotoOrPlaceholder url={form.agentPhotoUrl} className="h-10 w-10 rounded-full" />
      ) : (
        <div className={cn("h-10 w-10 rounded-full", dark ? "bg-white/20" : "bg-navy-100")} />
      )}
      <div>
        <p className={cn("text-sm font-bold", dark ? "text-white" : "text-navy-900")}>{form.agentName || "Listing Agent"}</p>
        <p className={cn("text-xs", dark ? "text-white/70" : "text-navy-400")}>
          {form.agentPhone}
          {form.agentPhone && form.agentEmail ? " · " : ""}
          {form.agentEmail}
        </p>
      </div>
    </div>
  );
}

function QrPlaceholder({ dark }: { dark?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={cn("h-14 w-14 rounded-sm border", dark ? "border-white/30 bg-white/10" : "border-border bg-navy-50")} />
      <p className={cn("text-[10px]", dark ? "text-white/60" : "text-navy-400")}>Scan for details</p>
    </div>
  );
}

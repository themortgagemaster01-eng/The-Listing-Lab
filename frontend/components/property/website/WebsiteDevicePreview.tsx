"use client";

import * as React from "react";
import { Laptop, Smartphone, Tablet } from "lucide-react";

import { cn } from "@/lib/utils";
import { PublicSiteView, type PublicSiteViewProps } from "@/components/property/website/PublicSiteView";

export type PreviewDevice = "desktop" | "tablet" | "mobile";

const DEVICE_WIDTHS: Record<PreviewDevice, number> = {
  desktop: 1200,
  tablet: 768,
  mobile: 390,
};

const DEVICE_OPTIONS: { id: PreviewDevice; label: string; icon: typeof Laptop }[] = [
  { id: "desktop", label: "Desktop", icon: Laptop },
  { id: "tablet", label: "Tablet", icon: Tablet },
  { id: "mobile", label: "Mobile", icon: Smartphone },
];

/**
 * Preview Mode's device-width toggle + width-constrained frame around the
 * REAL `PublicSiteView` sections (see that component's header comment) —
 * not a second, parallel mockup. Renders `PublicSiteView` inside a
 * `max-width`-clamped, centered container that shrinks to the chosen
 * device's width (1200 / 768 / 390px), so the Realtor sees actual current
 * copy/photos/payment numbers reflow and shrink to roughly the space
 * available on that device, before ever clicking Publish.
 *
 * HONEST LIMITATION (documented per Robert's explicit request to call this
 * out rather than silently ship an approximation): Tailwind's `sm:`/`lg:`
 * responsive classes used throughout `PublicSiteView` are real CSS
 * `@media` viewport-width queries, not container-width queries — this repo
 * has no container-query plugin installed (`tailwindcss` v3.4, no
 * `@tailwindcss/container-queries`), and adding one/an iframe-based preview
 * with cross-document stylesheet cloning was judged more risk than value
 * for a first pass (see the project report). So constraining THIS
 * wrapper's `max-width` narrows the real content and proportionally
 * shrinks/reflows anything sized off the container (grid item widths,
 * image aspect ratios, text wrapping) accurately, but it will NOT flip a
 * `sm:grid-cols-3` gallery down to its mobile `grid-cols-2` column count
 * unless the Realtor's actual browser window is also that narrow — the
 * column COUNT breakpoints are keyed off the real browser viewport, not
 * this frame. Still meaningfully "real" (actual sections, actual data,
 * actual proportional narrowing) rather than the old static mock-browser-
 * chrome placeholder it replaces — just not 100% pixel-perfect device
 * emulation. Flagged for Robert: a true per-breakpoint-accurate preview
 * would need either an `<iframe>` (real separate viewport) or a container-
 * query rewrite of `PublicSiteView`'s responsive classes.
 */
export function WebsiteDevicePreview({
  data,
  publicUrl,
  qrDataUrl,
  device,
  onDeviceChange,
}: PublicSiteViewProps & { device: PreviewDevice; onDeviceChange: (device: PreviewDevice) => void }) {
  return (
    <div className="space-y-4">
      <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-background p-1">
        {DEVICE_OPTIONS.map((option) => {
          const Icon = option.icon;
          const active = device === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onDeviceChange(option.id)}
              aria-pressed={active}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                active ? "bg-navy-900 text-white shadow-soft dark:bg-navy-700" : "text-muted-foreground hover:bg-muted"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-muted/40 p-4 sm:p-6">
        <div
          className="mx-auto overflow-hidden rounded-2xl border border-border bg-white shadow-soft transition-[max-width] duration-300 dark:bg-navy-950"
          style={{ maxWidth: DEVICE_WIDTHS[device] }}
        >
          {/* Decorative browser chrome — purely cosmetic framing around the real, live-rendered sections below, not a substitute for them. */}
          <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-2.5">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
            </div>
            <div className="ml-2 flex flex-1 items-center gap-1.5 truncate rounded-full bg-background px-3 py-1 text-xs text-muted-foreground">
              {publicUrl.replace(/^https?:\/\//, "")}
            </div>
          </div>
          <div className="max-h-[640px] overflow-y-auto">
            <PublicSiteView data={data} publicUrl={publicUrl} qrDataUrl={qrDataUrl} />
          </div>
        </div>
      </div>
    </div>
  );
}

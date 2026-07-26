"use client";

import * as React from "react";
import Image from "next/image";
import { Check, Circle, Copy, ExternalLink, Sparkles } from "lucide-react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { useToast } from "@/components/shared/Toast";
import { TemplateGalleryCard, type TemplateOption } from "@/components/property/TemplateGalleryCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Property } from "@/types";

const THEMES: TemplateOption[] = [
  {
    id: "estate",
    name: "Estate",
    description: "Full-bleed hero, editorial feel",
    swatchClass: "bg-gradient-to-br from-navy-900 to-navy-700",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean grid, lots of white space",
    swatchClass: "bg-gradient-to-br from-slate-100 to-slate-300",
  },
  {
    id: "showcase",
    name: "Showcase",
    description: "Gallery-forward, gold accents",
    swatchClass: "bg-gradient-to-br from-gold-400 to-gold-600",
  },
];

function slugify(address: string, cityStateZip: string) {
  const city = cityStateZip.split(",")[0] ?? "";
  return `${address}-${city}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface PropertyWebsiteTabProps {
  property: Property;
}

export function PropertyWebsiteTab({ property }: PropertyWebsiteTabProps) {
  const { showToast } = useToast();
  const [selectedId, setSelectedId] = React.useState(THEMES[0].id);
  const [copied, setCopied] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const selectedTheme = THEMES.find((t) => t.id === selectedId) ?? THEMES[0];
  const url = `listinglab.io/${slugify(property.address, property.cityStateZip)}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(`https://${url}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API can fail silently in unsupported contexts (e.g. insecure
      // origin, permission denied) — surface that instead of pretending it worked.
      showToast("Couldn't copy the link — copy it manually instead.");
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
      <DashboardCard title="Themes">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
          {THEMES.map((theme) => (
            <TemplateGalleryCard
              key={theme.id}
              template={theme}
              selected={theme.id === selectedId}
              onSelect={() => setSelectedId(theme.id)}
            />
          ))}
        </div>
      </DashboardCard>

      <DashboardCard title="Preview" contentClassName="mt-4 flex flex-col gap-5">
        {/* Mock browser chrome */}
        <div className="overflow-hidden rounded-2xl border border-border shadow-soft">
          <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-2.5">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
            </div>
            <div className="ml-2 flex flex-1 items-center gap-1.5 rounded-full bg-background px-3 py-1 text-xs text-muted-foreground">
              <Circle className="h-2.5 w-2.5 fill-success text-success" />
              {url}
            </div>
          </div>

          <div className="relative h-56 w-full sm:h-72">
            {!imageLoaded && <LoadingSkeleton className="absolute inset-0" />}
            <Image
              src={property.imageUrl}
              alt={`Property website preview for ${property.address}`}
              fill
              sizes="(max-width: 1024px) 100vw, 800px"
              className={cn("object-cover", !imageLoaded && "opacity-0")}
              onLoad={() => setImageLoaded(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">
                {selectedTheme.name} Theme
              </p>
              <h3 className="mt-1 font-display text-2xl font-semibold text-white sm:text-3xl">
                {property.address}
              </h3>
              <p className="mt-1 text-sm text-white/85">{property.cityStateZip}</p>
            </div>
          </div>

          <div className="space-y-3 bg-surface p-5 sm:p-8">
            <p className="text-sm leading-relaxed text-muted-foreground">{property.description}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {["Gallery", "Details", "Neighborhood", "Schedule a Tour", "Contact"].map((section) => (
                <span
                  key={section}
                  className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  {section}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm">
            <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="font-medium text-foreground">https://{url}</span>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy Link"}
          </Button>
        </div>

        <Button
          type="button"
          variant="gold"
          size="lg"
          onClick={() => showToast("Full Property Website generation is coming soon.")}
          className="w-full sm:w-auto sm:self-start"
        >
          <Sparkles className="h-4 w-4" />
          Generate {selectedTheme.name} Website
        </Button>
      </DashboardCard>
    </div>
  );
}

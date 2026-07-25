"use client";

import * as React from "react";
import Image from "next/image";
import { Download, Sparkles } from "lucide-react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { TemplateGalleryCard, type TemplateOption } from "@/components/property/TemplateGalleryCard";
import { ComingSoonButton } from "@/components/property/ComingSoonButton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Property } from "@/types";

const TEMPLATES: TemplateOption[] = [
  {
    id: "modern-luxury",
    name: "Modern Luxury",
    description: "Full-bleed photo, gold accents",
    swatchClass: "bg-gradient-to-br from-navy-900 to-navy-700",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional layout, serif type",
    swatchClass: "bg-gradient-to-br from-gold-100 to-gold-300",
  },
  {
    id: "bold-minimal",
    name: "Bold Minimal",
    description: "White space, sans-serif",
    swatchClass: "bg-gradient-to-br from-slate-100 to-slate-300",
  },
  {
    id: "open-house",
    name: "Open House",
    description: "Event date front and center",
    swatchClass: "bg-gradient-to-br from-gold-400 to-gold-600",
  },
];

function buildBullets(property: Property): string[] {
  const bullets: string[] = [];
  if (property.beds != null && property.baths != null) {
    bullets.push(`${property.beds} Bedrooms · ${property.baths} Baths`);
  }
  if (property.sqft != null) {
    bullets.push(`${property.sqft.toLocaleString()} sqft of thoughtfully designed living space`);
  }
  if (property.lotSize) {
    bullets.push(`Set on ${property.lotSize}`);
  }
  if (property.yearBuilt) {
    bullets.push(`Built in ${property.yearBuilt}`);
  }
  return bullets;
}

interface FlyersTabProps {
  property: Property;
}

export function FlyersTab({ property }: FlyersTabProps) {
  const [selectedId, setSelectedId] = React.useState(TEMPLATES[0].id);
  const [generating, setGenerating] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const selectedTemplate = TEMPLATES.find((t) => t.id === selectedId) ?? TEMPLATES[0];
  const bullets = buildBullets(property);
  const price = property.price
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
        property.price
      )
    : null;

  function handleGenerate() {
    setGenerating(true);
    window.setTimeout(() => setGenerating(false), 1400);
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
      <DashboardCard title="Templates">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
          {TEMPLATES.map((template) => (
            <TemplateGalleryCard
              key={template.id}
              template={template}
              selected={template.id === selectedId}
              onSelect={() => setSelectedId(template.id)}
            />
          ))}
        </div>
      </DashboardCard>

      <DashboardCard title="Preview" contentClassName="mt-4 flex flex-col gap-5">
        <div className="overflow-hidden rounded-2xl border border-border shadow-soft">
          <div className="relative h-64 w-full sm:h-80">
            {!imageLoaded && <LoadingSkeleton className="absolute inset-0" />}
            <Image
              src={property.imageUrl}
              alt={`Flyer preview for ${property.address}`}
              fill
              sizes="(max-width: 1024px) 100vw, 800px"
              className={cn("object-cover", !imageLoaded && "opacity-0")}
              onLoad={() => setImageLoaded(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
              {price && <p className="text-sm font-semibold text-gold-300 sm:text-base">{price}</p>}
              <h3 className="mt-1 font-display text-2xl font-semibold text-white sm:text-4xl">
                {property.headline ?? property.address}
              </h3>
              <p className="mt-1 text-sm text-white/85 sm:text-base">
                {property.address}, {property.cityStateZip}
              </p>
            </div>
          </div>

          <div className="space-y-4 bg-surface p-5 sm:p-8">
            <p className="text-sm leading-relaxed text-muted-foreground">{property.description}</p>
            {bullets.length > 0 && (
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {bullets.map((bullet) => (
                  <li key={bullet} className="flex items-center gap-2 text-sm text-foreground">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
            {property.listingAgent && (
              <p className="border-t border-border pt-4 text-xs font-medium text-muted-foreground">
                Listed by {property.listingAgent}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="gold"
            size="lg"
            onClick={handleGenerate}
            disabled={generating}
            className="flex-1 sm:flex-initial"
          >
            <Sparkles className="h-4 w-4" />
            {generating ? "Generating…" : `Generate ${selectedTemplate.name} Flyer`}
          </Button>
          <ComingSoonButton
            variant="outline"
            size="lg"
            icon={Download}
            message="PDF export is coming soon"
          >
            Download PDF
          </ComingSoonButton>
        </div>
      </DashboardCard>
    </div>
  );
}

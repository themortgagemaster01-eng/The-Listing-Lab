"use client";

import * as React from "react";
import Image from "next/image";
import { Download, Instagram, Facebook, Sparkles } from "lucide-react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { ComingSoonButton } from "@/components/property/ComingSoonButton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Property } from "@/types";

interface SocialFormat {
  id: string;
  name: string;
  platform: string;
  icon: typeof Instagram;
  aspect: string;
  caption: string;
}

function buildFormats(property: Property): SocialFormat[] {
  const shortAddress = property.address;
  return [
    {
      id: "ig-post",
      name: "Instagram Post",
      platform: "Instagram",
      icon: Instagram,
      aspect: "aspect-square",
      caption: `Just listed ✨ ${shortAddress} — ${property.headline ?? "a must-see home"}. ${
        property.beds ?? ""
      } bed / ${property.baths ?? ""} bath, ${property.sqft?.toLocaleString() ?? ""} sqft. DM for a private showing! #JustListed #${property.cityStateZip.split(",")[0].replace(/\s/g, "")}RealEstate`,
    },
    {
      id: "ig-story",
      name: "Instagram Story / Reel Cover",
      platform: "Instagram",
      icon: Instagram,
      aspect: "aspect-[9/16]",
      caption: `Swipe up for the full tour of ${shortAddress} 🏡 Open house this weekend!`,
    },
    {
      id: "fb-post",
      name: "Facebook Post",
      platform: "Facebook",
      icon: Facebook,
      aspect: "aspect-[4/3]",
      caption: `New on the market: ${shortAddress}, ${property.cityStateZip}. ${property.description?.slice(
        0,
        140
      )}… Reach out to schedule your tour.`,
    },
  ];
}

interface SocialPostsTabProps {
  property: Property;
}

export function SocialPostsTab({ property }: SocialPostsTabProps) {
  const formats = React.useMemo(() => buildFormats(property), [property]);
  const [selectedId, setSelectedId] = React.useState(formats[0].id);
  const [generating, setGenerating] = React.useState(false);
  const selected = formats.find((f) => f.id === selectedId) ?? formats[0];

  function handleGenerate() {
    setGenerating(true);
    window.setTimeout(() => setGenerating(false), 1400);
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
      <DashboardCard title="Formats">
        <div className="space-y-3">
          {formats.map((format) => {
            const Icon = format.icon;
            const active = format.id === selectedId;
            return (
              <button
                key={format.id}
                type="button"
                onClick={() => setSelectedId(format.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-colors",
                  active
                    ? "border-gold-400 bg-gold-50 shadow-soft dark:bg-gold-500/10"
                    : "border-border bg-surface hover:border-gold-300"
                )}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{format.name}</p>
                  <p className="text-xs text-muted-foreground">{format.platform}</p>
                </div>
              </button>
            );
          })}
        </div>
      </DashboardCard>

      <DashboardCard title="Preview" contentClassName="mt-4 flex flex-col gap-5">
        <div className="mx-auto w-full max-w-sm">
          <div className={cn("relative w-full overflow-hidden rounded-2xl border border-border shadow-soft", selected.aspect)}>
            <Image
              src={property.imageUrl}
              alt={`${selected.name} preview for ${property.address}`}
              fill
              sizes="384px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gold-300">Just Listed</p>
              <p className="mt-0.5 font-display text-lg font-semibold text-white">{property.address}</p>
            </div>
          </div>
        </div>

        <DashboardCard title="Caption" className="border-dashed">
          <p className="text-sm leading-relaxed text-muted-foreground">{selected.caption}</p>
        </DashboardCard>

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
            {generating ? "Generating…" : `Generate ${selected.name}`}
          </Button>
          <ComingSoonButton variant="outline" size="lg" icon={Download} message="Image export is coming soon">
            Download Image
          </ComingSoonButton>
        </div>
      </DashboardCard>
    </div>
  );
}

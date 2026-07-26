"use client";

import * as React from "react";
import Image from "next/image";
import { Check, Sparkles } from "lucide-react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Property } from "@/types";

const STYLES = [
  { id: "modern", label: "Modern", swatchClass: "bg-gradient-to-br from-slate-100 to-slate-300" },
  { id: "traditional", label: "Traditional", swatchClass: "bg-gradient-to-br from-amber-100 to-amber-300" },
  { id: "scandinavian", label: "Scandinavian", swatchClass: "bg-gradient-to-br from-stone-50 to-stone-200" },
  { id: "luxury", label: "Luxury", swatchClass: "bg-gradient-to-br from-gold-400 to-gold-600" },
];

const ROOM_PHOTOS = [
  "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
];

interface VirtualStagingTabProps {
  property: Property;
}

export function VirtualStagingTab({ property }: VirtualStagingTabProps) {
  const [selectedStyle, setSelectedStyle] = React.useState("modern");
  const rooms = property.photos && property.photos.length > 1 ? property.photos.slice(0, 2) : ROOM_PHOTOS;

  return (
    <div className="space-y-6">
      <DashboardCard title="Choose a Staging Style">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STYLES.map((style) => {
            const active = style.id === selectedStyle;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => setSelectedStyle(style.id)}
                className={cn(
                  "relative overflow-hidden rounded-2xl border p-3 text-left transition-colors",
                  active
                    ? "border-gold-400 bg-gold-50 shadow-soft dark:bg-gold-500/10"
                    : "border-border bg-surface hover:border-gold-300"
                )}
              >
                <div className={cn("h-14 w-full rounded-xl", style.swatchClass)} />
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{style.label}</span>
                  {active && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gold-500 text-white">
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </DashboardCard>

      <DashboardCard
        title="Rooms"
        action={{ label: "Coming soon" }}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {rooms.map((src, index) => (
            <div key={src} className="overflow-hidden rounded-2xl border border-border">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={src}
                  alt={`Room ${index + 1} for virtual staging`}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover"
                />
                <span className="absolute left-3 top-3 rounded-full bg-navy-950/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                  Room {index + 1}
                </span>
              </div>
              <div className="flex items-center justify-between p-3">
                <p className="text-xs text-muted-foreground">
                  Preview with <span className="font-semibold text-foreground capitalize">{selectedStyle}</span>{" "}
                  staging
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled
                  title="AI virtual staging is coming soon"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Stage Room
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>
    </div>
  );
}

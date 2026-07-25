"use client";

import * as React from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { cn } from "@/lib/utils";
import type { Property } from "@/types";

interface AiEnhanceTabProps {
  property: Property;
}

export function AiEnhanceTab({ property }: AiEnhanceTabProps) {
  const [sliderPosition, setSliderPosition] = React.useState(50);

  return (
    <div className="space-y-6">
      <DashboardCard title="AI Photo Enhancement">
        <div className="relative aspect-video w-full select-none overflow-hidden rounded-2xl border border-border">
          {/* Before */}
          <Image
            src={property.imageUrl}
            alt={`${property.address} — before enhancement`}
            fill
            sizes="(max-width: 1024px) 100vw, 900px"
            className="object-cover"
          />
          {/* After: clipped overlay with a brightness/contrast/saturation boost to visually read as "enhanced" */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
          >
            <Image
              src={property.imageUrl}
              alt={`${property.address} — after AI enhancement`}
              fill
              sizes="(max-width: 1024px) 100vw, 900px"
              className="object-cover"
              style={{ filter: "brightness(1.12) contrast(1.08) saturate(1.2)" }}
            />
          </div>

          <span className="absolute left-3 top-3 rounded-full bg-navy-950/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
            Before
          </span>
          <span className="absolute right-3 top-3 rounded-full bg-gold-500/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-navy-950">
            After
          </span>

          <div
            className="absolute inset-y-0 w-0.5 bg-white shadow-soft-lg"
            style={{ left: `${sliderPosition}%` }}
          />

          <input
            type="range"
            min={0}
            max={100}
            value={sliderPosition}
            onChange={(e) => setSliderPosition(Number(e.target.value))}
            aria-label="Before/after comparison slider"
            className={cn(
              "absolute inset-x-0 bottom-4 mx-auto block w-[85%] cursor-pointer accent-gold-500"
            )}
          />
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-xl border border-border bg-background p-4">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
          <p className="text-sm text-muted-foreground">
            Drag the slider to preview the enhancement effect. Real AI-powered lighting, sky, and
            color correction is coming in a future update — for now this is a visual preview only.
          </p>
        </div>
      </DashboardCard>
    </div>
  );
}

"use client";

import * as React from "react";
import Image from "next/image";
import { UploadCloud } from "lucide-react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { TabSegmentedControl, type SegmentOption } from "@/components/property/TabSegmentedControl";
import { AiEnhanceTab } from "@/components/property/AiEnhanceTab";
import { VirtualStagingTab } from "@/components/property/VirtualStagingTab";
import { cn } from "@/lib/utils";
import type { Property } from "@/types";

const FILLER_PHOTOS = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80",
];

const SECTIONS: SegmentOption<"library" | "ai-enhance" | "virtual-staging">[] = [
  { id: "library", label: "Photo Library" },
  { id: "ai-enhance", label: "AI Enhance" },
  { id: "virtual-staging", label: "Virtual Staging" },
];

type SectionId = (typeof SECTIONS)[number]["id"];

function PhotoTile({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = React.useState(false);
  return (
    <div className="group relative aspect-square overflow-hidden rounded-2xl border border-border">
      {!loaded && <LoadingSkeleton className="absolute inset-0" />}
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 50vw, 25vw"
        className={cn(
          "object-cover transition-transform duration-500 group-hover:scale-105",
          !loaded && "opacity-0"
        )}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

function PhotoLibrarySection({ property }: { property: Property }) {
  const gallery = (property.photos && property.photos.length > 0 ? property.photos : [property.imageUrl]).concat(
    FILLER_PHOTOS
  );

  return (
    <DashboardCard title="Photo Library" action={{ label: `${gallery.length} photos` }}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <button
          type="button"
          className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-background text-center transition-colors hover:border-gold-400 hover:bg-gold-50 dark:hover:bg-gold-500/5"
        >
          <UploadCloud className="h-6 w-6 text-muted-foreground" />
          <span className="px-3 text-xs font-medium text-muted-foreground">Upload Photos</span>
        </button>

        {gallery.map((src, index) => (
          <PhotoTile key={`${src}-${index}`} src={src} alt={`${property.address} photo ${index + 1}`} />
        ))}
      </div>
    </DashboardCard>
  );
}

interface PhotosTabProps {
  property: Property;
  /** Pre-selects a sub-section, e.g. from a `?section=ai-enhance` deep link. */
  initialSection?: string;
}

/**
 * Photos tab host: folds the former standalone "AI Enhance" and "Virtual
 * Staging" tabs in as sub-sections of Photos (all three are photo-related
 * tools), switched via a segmented control instead of separate top-level
 * routes.
 */
export function PhotosTab({ property, initialSection }: PhotosTabProps) {
  const resolvedInitial = SECTIONS.some((s) => s.id === initialSection) ? (initialSection as SectionId) : "library";
  const [section, setSection] = React.useState<SectionId>(resolvedInitial);

  return (
    <div className="space-y-6">
      <TabSegmentedControl options={SECTIONS} value={section} onChange={setSection} />

      {section === "library" && <PhotoLibrarySection property={property} />}
      {section === "ai-enhance" && <AiEnhanceTab property={property} />}
      {section === "virtual-staging" && <VirtualStagingTab property={property} />}
    </div>
  );
}

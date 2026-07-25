"use client";

import * as React from "react";

import { TabSegmentedControl, type SegmentOption } from "@/components/property/TabSegmentedControl";
import { FlyersTab } from "@/components/property/FlyersTab";
import { PropertyWebsiteTab } from "@/components/property/PropertyWebsiteTab";
import type { Property } from "@/types";

const SECTIONS: SegmentOption<"flyers" | "website">[] = [
  { id: "flyers", label: "Flyers" },
  { id: "website", label: "Property Website" },
];

type SectionId = (typeof SECTIONS)[number]["id"];

interface MarketingAssetsTabProps {
  property: Property;
  initialSection?: string;
}

/**
 * Marketing Assets tab host: folds the former standalone "Flyers" and
 * "Property Website" tabs in as sub-sections, switched via a segmented
 * control instead of separate top-level routes.
 */
export function MarketingAssetsTab({ property, initialSection }: MarketingAssetsTabProps) {
  const resolvedInitial = SECTIONS.some((s) => s.id === initialSection) ? (initialSection as SectionId) : "flyers";
  const [section, setSection] = React.useState<SectionId>(resolvedInitial);

  return (
    <div className="space-y-6">
      <TabSegmentedControl options={SECTIONS} value={section} onChange={setSection} />

      {section === "flyers" ? <FlyersTab property={property} /> : <PropertyWebsiteTab property={property} />}
    </div>
  );
}

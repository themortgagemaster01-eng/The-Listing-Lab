"use client";

import { WebsiteGeneratorWizard } from "@/components/property/website/WebsiteGeneratorWizard";
import type { Property } from "@/types";

interface PropertyWebsiteTabProps {
  property: Property;
}

/**
 * Property Website sub-section of Marketing Assets (the "Listing
 * Presentation Site" feature). Thin host around `WebsiteGeneratorWizard`,
 * same pattern as `FlyersTab` hosting `FlyerGeneratorWizard` and
 * `PaymentToolsTab` hosting `PaymentSnapshotWizard` — this component used
 * to contain a mock preview-only stub; the real wizard now owns all of the
 * logic previously here (theme picker, slug generation, mock browser
 * chrome preview).
 */
export function PropertyWebsiteTab({ property }: PropertyWebsiteTabProps) {
  return <WebsiteGeneratorWizard property={property} />;
}

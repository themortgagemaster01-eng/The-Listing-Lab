"use client";

import { FlyerGeneratorWizard } from "@/components/property/flyer/FlyerGeneratorWizard";
import type { Property } from "@/types";

interface FlyersTabProps {
  property: Property;
}

/**
 * Flyers sub-section of Marketing Assets (Phase 2: AI Flyer Generator).
 * Thin host around `FlyerGeneratorWizard`, which owns the saved-flyers
 * gallery and the full property-details → photos → AI copy →
 * template/export wizard — see that file for the feature's real logic.
 */
export function FlyersTab({ property }: FlyersTabProps) {
  return <FlyerGeneratorWizard property={property} />;
}

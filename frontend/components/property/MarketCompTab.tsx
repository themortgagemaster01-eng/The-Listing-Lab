"use client";

import { MarketCompWizard } from "@/components/property/market-comp/MarketCompWizard";
import type { Property } from "@/types";

interface MarketCompTabProps {
  property: Property;
}

/** AI Comparative Market Analysis tab host — thin wrapper matching the `IncomeAnalyzerTab`/`PaymentToolsTab` convention. */
export function MarketCompTab({ property }: MarketCompTabProps) {
  return <MarketCompWizard property={property} />;
}

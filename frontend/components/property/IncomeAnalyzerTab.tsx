"use client";

import { IncomeAnalyzerWizard } from "@/components/property/income/IncomeAnalyzerWizard";
import type { Property } from "@/types";

interface IncomeAnalyzerTabProps {
  property: Property;
}

/** AI Income Analyzer tab host — thin wrapper matching the `PaymentToolsTab`/`FlyersTab` convention. */
export function IncomeAnalyzerTab({ property }: IncomeAnalyzerTabProps) {
  return <IncomeAnalyzerWizard property={property} />;
}

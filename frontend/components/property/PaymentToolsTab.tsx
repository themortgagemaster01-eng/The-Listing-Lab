"use client";

import * as React from "react";

import { TabSegmentedControl, type SegmentOption } from "@/components/property/TabSegmentedControl";
import { PaymentsTab } from "@/components/property/PaymentsTab";
import { ClosingCostsTab } from "@/components/property/ClosingCostsTab";
import type { Property } from "@/types";

const SECTIONS: SegmentOption<"payments" | "closing-costs">[] = [
  { id: "payments", label: "Payments" },
  { id: "closing-costs", label: "Closing Costs" },
];

type SectionId = (typeof SECTIONS)[number]["id"];

interface PaymentToolsTabProps {
  property: Property;
  initialSection?: string;
}

/**
 * Payment Tools tab host: folds the former standalone "Payments" and
 * "Closing Costs" tabs in as sub-sections. The mortgage calculator
 * (`PaymentsTab`) is the default/star section — Closing Costs is one click
 * away via the segmented control, never buried behind extra navigation.
 */
export function PaymentToolsTab({ property, initialSection }: PaymentToolsTabProps) {
  const resolvedInitial = SECTIONS.some((s) => s.id === initialSection) ? (initialSection as SectionId) : "payments";
  const [section, setSection] = React.useState<SectionId>(resolvedInitial);

  return (
    <div className="space-y-6">
      <TabSegmentedControl options={SECTIONS} value={section} onChange={setSection} />

      {section === "payments" ? <PaymentsTab property={property} /> : <ClosingCostsTab property={property} />}
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OverviewTab } from "@/components/property/OverviewTab";
import { getPropertyById } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Overview | Listing Lab" };

export default function PropertyOverviewPage({ params }: { params: { id: string } }) {
  const property = getPropertyById(params.id);
  if (!property) notFound();
  return <OverviewTab property={property} />;
}

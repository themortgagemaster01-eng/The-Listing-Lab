import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ActivityTimelineTab } from "@/components/property/ActivityTimelineTab";
import { getPropertyById } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Activity Timeline | Listing Lab" };

export default function ActivityTimelinePage({ params }: { params: { id: string } }) {
  const property = getPropertyById(params.id);
  if (!property) notFound();
  return <ActivityTimelineTab property={property} />;
}

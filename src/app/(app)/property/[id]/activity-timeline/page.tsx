import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ActivityTimelineTab } from "@/components/property/ActivityTimelineTab";
import { loadPropertyForWorkspace } from "@/lib/property/loader";

export const metadata: Metadata = { title: "Activity Timeline | Listing Lab" };

export default async function ActivityTimelinePage({ params }: { params: { id: string } }) {
  const property = await loadPropertyForWorkspace(params.id);
  if (!property) notFound();
  return <ActivityTimelineTab property={property} />;
}

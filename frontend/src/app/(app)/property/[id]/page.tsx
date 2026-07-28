import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OverviewTab } from "@/components/property/OverviewTab";
import { loadPropertyForWorkspace } from "@/lib/property/loader";

export const metadata: Metadata = { title: "Overview | Realtor Toolbox" };

export default async function PropertyOverviewPage({ params }: { params: { id: string } }) {
  const property = await loadPropertyForWorkspace(params.id);
  if (!property) notFound();
  return <OverviewTab property={property} />;
}

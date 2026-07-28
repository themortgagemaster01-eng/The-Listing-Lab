import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PhotosTab } from "@/components/property/PhotosTab";
import { loadPropertyForWorkspace } from "@/lib/property/loader";

export const metadata: Metadata = { title: "Photos | Realtor Toolbox" };

export default async function PhotosPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { section?: string };
}) {
  const property = await loadPropertyForWorkspace(params.id);
  if (!property) notFound();
  return <PhotosTab property={property} initialSection={searchParams.section} />;
}

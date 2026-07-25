import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PhotosTab } from "@/components/property/PhotosTab";
import { getPropertyById } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Photos | Listing Lab" };

export default function PhotosPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { section?: string };
}) {
  const property = getPropertyById(params.id);
  if (!property) notFound();
  return <PhotosTab property={property} initialSection={searchParams.section} />;
}

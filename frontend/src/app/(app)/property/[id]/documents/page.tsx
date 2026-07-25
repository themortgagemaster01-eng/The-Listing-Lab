import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DocumentsTab } from "@/components/property/DocumentsTab";
import { getPropertyById } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Documents | Listing Lab" };

export default function DocumentsPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { section?: string };
}) {
  const property = getPropertyById(params.id);
  if (!property) notFound();
  return <DocumentsTab property={property} initialSection={searchParams.section} />;
}

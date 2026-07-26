import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DocumentsTab } from "@/components/property/DocumentsTab";
import { loadPropertyForWorkspace } from "@/lib/property/loader";

export const metadata: Metadata = { title: "Documents | Listing Lab" };

export default async function DocumentsPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { section?: string };
}) {
  const property = await loadPropertyForWorkspace(params.id);
  if (!property) notFound();
  return <DocumentsTab property={property} initialSection={searchParams.section} />;
}

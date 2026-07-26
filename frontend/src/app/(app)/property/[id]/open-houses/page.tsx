import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OpenHousesTab } from "@/components/property/OpenHousesTab";
import { loadPropertyForWorkspace } from "@/lib/property/loader";

export const metadata: Metadata = { title: "Open Houses | Listing Lab" };

export default async function OpenHousesPage({ params }: { params: { id: string } }) {
  const property = await loadPropertyForWorkspace(params.id);
  if (!property) notFound();
  return <OpenHousesTab property={property} />;
}

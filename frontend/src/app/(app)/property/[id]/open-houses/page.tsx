import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OpenHousesTab } from "@/components/property/OpenHousesTab";
import { getPropertyById } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Open Houses | Listing Lab" };

export default function OpenHousesPage({ params }: { params: { id: string } }) {
  const property = getPropertyById(params.id);
  if (!property) notFound();
  return <OpenHousesTab property={property} />;
}

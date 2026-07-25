import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MarketingAssetsTab } from "@/components/property/MarketingAssetsTab";
import { getPropertyById } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Marketing Assets | Listing Lab" };

export default function MarketingAssetsPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { section?: string };
}) {
  const property = getPropertyById(params.id);
  if (!property) notFound();
  return <MarketingAssetsTab property={property} initialSection={searchParams.section} />;
}

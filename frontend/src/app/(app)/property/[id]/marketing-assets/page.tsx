import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MarketingAssetsTab } from "@/components/property/MarketingAssetsTab";
import { loadPropertyForWorkspace } from "@/lib/property/loader";

export const metadata: Metadata = { title: "Marketing Assets | Realtor Toolbox" };

export default async function MarketingAssetsPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { section?: string };
}) {
  const property = await loadPropertyForWorkspace(params.id);
  if (!property) notFound();
  return <MarketingAssetsTab property={property} initialSection={searchParams.section} />;
}

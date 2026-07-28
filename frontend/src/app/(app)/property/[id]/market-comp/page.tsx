import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MarketCompTab } from "@/components/property/MarketCompTab";
import { loadPropertyForWorkspace } from "@/lib/property/loader";

export const metadata: Metadata = { title: "AI Comparative Market Analysis | Realtor Toolbox" };

export default async function MarketCompPage({ params }: { params: { id: string } }) {
  const property = await loadPropertyForWorkspace(params.id);
  if (!property) notFound();
  return <MarketCompTab property={property} />;
}

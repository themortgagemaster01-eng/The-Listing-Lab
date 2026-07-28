import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { IncomeAnalyzerTab } from "@/components/property/IncomeAnalyzerTab";
import { loadPropertyForWorkspace } from "@/lib/property/loader";

export const metadata: Metadata = { title: "AI Income Analyzer | Realtor Toolbox" };

export default async function IncomeAnalyzerPage({ params }: { params: { id: string } }) {
  const property = await loadPropertyForWorkspace(params.id);
  if (!property) notFound();
  return <IncomeAnalyzerTab property={property} />;
}

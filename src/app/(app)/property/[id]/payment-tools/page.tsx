import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PaymentToolsTab } from "@/components/property/PaymentToolsTab";
import { loadPropertyForWorkspace } from "@/lib/property/loader";

export const metadata: Metadata = { title: "Payment Tools | Listing Lab" };

export default async function PaymentToolsPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { section?: string };
}) {
  const property = await loadPropertyForWorkspace(params.id);
  if (!property) notFound();
  return <PaymentToolsTab property={property} initialSection={searchParams.section} />;
}

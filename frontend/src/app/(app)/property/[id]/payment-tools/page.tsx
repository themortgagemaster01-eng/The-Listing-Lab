import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PaymentToolsTab } from "@/components/property/PaymentToolsTab";
import { loadPropertyForWorkspace } from "@/lib/property/loader";

export const metadata: Metadata = { title: "Mortgage Center | Listing Lab" };

export default async function PaymentToolsPage({ params }: { params: { id: string } }) {
  const property = await loadPropertyForWorkspace(params.id);
  if (!property) notFound();
  return <PaymentToolsTab property={property} />;
}

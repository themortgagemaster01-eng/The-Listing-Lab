import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PaymentToolsTab } from "@/components/property/PaymentToolsTab";
import { getPropertyById } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Payment Tools | Listing Lab" };

export default function PaymentToolsPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { section?: string };
}) {
  const property = getPropertyById(params.id);
  if (!property) notFound();
  return <PaymentToolsTab property={property} initialSection={searchParams.section} />;
}

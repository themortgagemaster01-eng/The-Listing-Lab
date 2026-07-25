import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { QrCodesTab } from "@/components/property/QrCodesTab";
import { getPropertyById } from "@/lib/mock-data";

export const metadata: Metadata = { title: "QR Codes | Listing Lab" };

export default function QrCodesPage({ params }: { params: { id: string } }) {
  const property = getPropertyById(params.id);
  if (!property) notFound();
  return <QrCodesTab property={property} />;
}

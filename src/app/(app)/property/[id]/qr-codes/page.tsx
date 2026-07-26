import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { QrCodesTab } from "@/components/property/QrCodesTab";
import { loadPropertyForWorkspace } from "@/lib/property/loader";

export const metadata: Metadata = { title: "QR Codes | Listing Lab" };

export default async function QrCodesPage({ params }: { params: { id: string } }) {
  const property = await loadPropertyForWorkspace(params.id);
  if (!property) notFound();
  return <QrCodesTab property={property} />;
}

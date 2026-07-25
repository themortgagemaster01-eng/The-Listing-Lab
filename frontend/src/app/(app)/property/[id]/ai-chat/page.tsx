import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AiChatTab } from "@/components/property/AiChatTab";
import { getPropertyById } from "@/lib/mock-data";

export const metadata: Metadata = { title: "AI Chat | Listing Lab" };

export default function AiChatPage({ params }: { params: { id: string } }) {
  const property = getPropertyById(params.id);
  if (!property) notFound();
  return <AiChatTab property={property} />;
}

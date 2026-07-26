import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AiChatTab } from "@/components/property/AiChatTab";
import { loadPropertyForWorkspace } from "@/lib/property/loader";

export const metadata: Metadata = { title: "AI Chat | Listing Lab" };

export default async function AiChatPage({ params }: { params: { id: string } }) {
  const property = await loadPropertyForWorkspace(params.id);
  if (!property) notFound();
  return <AiChatTab property={property} />;
}

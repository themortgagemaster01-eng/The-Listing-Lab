import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SocialPostsTab } from "@/components/property/SocialPostsTab";
import { loadPropertyForWorkspace } from "@/lib/property/loader";

export const metadata: Metadata = { title: "Social Media | Realtor Toolbox" };

export default async function SocialMediaPage({ params }: { params: { id: string } }) {
  const property = await loadPropertyForWorkspace(params.id);
  if (!property) notFound();
  return <SocialPostsTab property={property} />;
}

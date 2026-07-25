import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SocialPostsTab } from "@/components/property/SocialPostsTab";
import { getPropertyById } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Social Media | Listing Lab" };

export default function SocialMediaPage({ params }: { params: { id: string } }) {
  const property = getPropertyById(params.id);
  if (!property) notFound();
  return <SocialPostsTab property={property} />;
}

import { notFound } from "next/navigation";

import { PropertyHeader } from "@/components/property/PropertyHeader";
import { PropertyTabs } from "@/components/property/PropertyTabs";
import { getPropertyById } from "@/lib/mock-data";

interface PropertyLayoutProps {
  children: React.ReactNode;
  params: { id: string };
}

/**
 * Shared wrapper for every `/property/[id]/...` route: the hero header and
 * tab nav render here, once, so switching tabs only swaps the page content
 * below — no header flicker/re-render.
 */
export default function PropertyLayout({ children, params }: PropertyLayoutProps) {
  const property = getPropertyById(params.id);
  if (!property) {
    notFound();
  }

  return (
    <div className="animate-fade-slide-in space-y-6">
      <PropertyHeader property={property} />
      <PropertyTabs propertyId={property.id} />
      <div>{children}</div>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BedDouble, Bath, Folder, Ruler } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { Property } from "@/types";

interface PropertyHeaderProps {
  property: Property;
}

function formatPrice(price?: number) {
  if (!price) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Shared banner header for the Property Workspace: hero photo, back
 * affordance, status badge, address, and key facts. Rendered once by the
 * `[id]` layout so it never re-renders when the active tab changes.
 */
export function PropertyHeader({ property }: PropertyHeaderProps) {
  const price = formatPrice(property.price);

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-soft">
      <div className="relative h-52 w-full overflow-hidden sm:h-64 lg:h-80">
        <Image
          src={property.imageUrl}
          alt={`Exterior photo of ${property.address}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1600px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/10 to-transparent" />

        <Link
          href="/dashboard"
          className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-navy-950/60 px-3.5 py-2 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-navy-950/80 sm:left-6 sm:top-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>

        <Badge
          variant={property.status === "ACTIVE" ? "active" : "draft"}
          className="absolute right-4 top-4 sm:right-6 sm:top-6"
        >
          {property.status}
        </Badge>

        <div className="absolute inset-x-0 bottom-0 px-4 pb-4 sm:px-6 sm:pb-6">
          {price && (
            <p className="text-sm font-semibold text-gold-300 sm:text-base">{price}</p>
          )}
          <h1 className="mt-0.5 text-2xl font-bold text-white sm:text-3xl">{property.address}</h1>
          <p className="mt-1 text-sm text-white/80 sm:text-base">{property.cityStateZip}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border px-4 py-4 sm:px-6">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Folder className="h-4 w-4" />
          <span>{property.assetCount} Assets</span>
        </div>
        {property.beds != null && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <BedDouble className="h-4 w-4" />
            <span>{property.beds} Beds</span>
          </div>
        )}
        {property.baths != null && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Bath className="h-4 w-4" />
            <span>{property.baths} Baths</span>
          </div>
        )}
        {property.sqft != null && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Ruler className="h-4 w-4" />
            <span>{property.sqft.toLocaleString()} sqft</span>
          </div>
        )}
        {property.mlsNumber && (
          <div className="ml-auto text-xs font-medium text-muted-foreground">
            MLS# {property.mlsNumber}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Folder, MoreVertical } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { Property } from "@/types";

interface PropertyCardProps {
  property: Property;
  /** Override the destination; defaults to `/property/[property.id]`. */
  href?: string;
}

/**
 * Property lab card: photo with status pill overlay, address, asset count,
 * and an overflow menu affordance. Wrapped in a Next.js `Link` to the
 * property's workspace, which is what makes "Recent Property Labs"
 * clickable.
 */
export function PropertyCard({ property, href }: PropertyCardProps) {
  return (
    <motion.article
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group w-[280px] shrink-0 overflow-hidden rounded-2xl border border-border bg-surface shadow-soft snap-start sm:w-[300px]"
    >
      <Link href={href ?? `/property/${property.id}`} className="block cursor-pointer">
        <div className="relative h-40 w-full overflow-hidden">
          <Image
            src={property.imageUrl}
            alt={`Exterior photo of ${property.address}`}
            fill
            sizes="(max-width: 640px) 280px, 300px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <Badge
            variant={property.status === "ACTIVE" ? "active" : "draft"}
            className="absolute left-3 top-3"
          >
            {property.status}
          </Badge>
        </div>

        <div className="flex items-start justify-between gap-2 p-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{property.address}</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{property.cityStateZip}</p>
            <div className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Folder className="h-3.5 w-3.5" />
              <span>{property.assetCount} Assets</span>
            </div>
          </div>
          <button
            type="button"
            aria-label="More options"
            onClick={(event) => event.preventDefault()}
            className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </Link>
    </motion.article>
  );
}

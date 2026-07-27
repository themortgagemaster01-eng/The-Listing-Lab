"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

interface PropertyTabsProps {
  propertyId: string;
}

/**
 * Ordered list of Property Workspace tabs — consolidated from the original
 * 14 into 10 top-level categories (formerly-standalone tabs like AI
 * Enhance, Virtual Staging, Flyers, Property Website, Closing Costs, Buyer
 * Packet, Seller Packet, and Notes now live as sub-sections or panels
 * inside these). "Overview" (empty slug) is the workspace index route.
 */
const TABS = [
  { label: "Overview", slug: "" },
  { label: "Photos", slug: "photos" },
  { label: "Marketing Assets", slug: "marketing-assets" },
  { label: "AI Chat", slug: "ai-chat" },
  { label: "Mortgage Center", slug: "payment-tools" },
  { label: "Documents", slug: "documents" },
  { label: "QR Codes", slug: "qr-codes" },
  { label: "Open Houses", slug: "open-houses" },
  { label: "Social Media", slug: "social-media" },
  { label: "Activity Timeline", slug: "activity-timeline" },
] as const;

export function PropertyTabs({ propertyId }: PropertyTabsProps) {
  const pathname = usePathname();

  return (
    <div className="-mx-4 border-b border-border px-4 sm:mx-0 sm:px-0">
      <nav className="flex gap-1 overflow-x-auto pb-px scrollbar-hide">
        {TABS.map((tab) => {
          const href = tab.slug ? `/property/${propertyId}/${tab.slug}` : `/property/${propertyId}`;
          const active = pathname === href;
          return (
            <Link
              key={tab.label}
              href={href}
              className={cn(
                "relative shrink-0 whitespace-nowrap rounded-lg px-3.5 py-3 text-sm font-medium transition-colors duration-fast",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                active
                  ? "text-navy-800 dark:text-gold-400"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              {active && (
                <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-gold-500" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

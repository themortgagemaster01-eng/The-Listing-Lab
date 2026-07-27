"use client";

import {
  BarChart3,
  Calendar,
  Camera,
  ClipboardList,
  CreditCard,
  FileSignature,
  FileSpreadsheet,
  FileText,
  Home,
  Instagram,
  MonitorPlay,
  PartyPopper,
  QrCode,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { ActionCard } from "@/components/dashboard/ActionCard";
import { ActivityFeed } from "@/components/shared/ActivityFeed";
import { MetricCard } from "@/components/shared/MetricCard";
import { NotesTab } from "@/components/property/NotesTab";
import { getPropertyActivity } from "@/lib/mock-data";
import type { Property, QuickAction } from "@/types";

/** Deterministic, per-property "days on market" mock value (no `daysOnMarket` field on `Property` yet). */
function daysOnMarket(propertyId: string) {
  let hash = 0;
  for (let i = 0; i < propertyId.length; i += 1) {
    hash = (hash * 31 + propertyId.charCodeAt(i)) >>> 0;
  }
  return 4 + (hash % 45);
}

function buildQuickLinks(propertyId: string): QuickAction[] {
  return [
    {
      id: "ql-photos",
      title: "Photos",
      subtitle: "Manage & enhance photos",
      icon: Camera,
      iconBadgeClass: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400",
      href: `/property/${propertyId}/photos`,
    },
    {
      id: "ql-marketing",
      title: "Marketing Assets",
      subtitle: "Flyers & website",
      icon: FileText,
      iconBadgeClass: "bg-gold-100 text-gold-600 dark:bg-gold-500/15 dark:text-gold-400",
      href: `/property/${propertyId}/marketing-assets`,
    },
    {
      id: "ql-ai-chat",
      title: "AI Chat",
      subtitle: "Ask about this listing",
      icon: Sparkles,
      iconBadgeClass: "bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400",
      href: `/property/${propertyId}/ai-chat`,
    },
    {
      id: "ql-payment-tools",
      title: "Payment Tools",
      subtitle: "Payments & closing costs",
      icon: CreditCard,
      iconBadgeClass: "bg-success-50 text-success dark:bg-success/15 dark:text-green-400",
      href: `/property/${propertyId}/payment-tools`,
    },
    {
      id: "ql-documents",
      title: "Documents",
      subtitle: "Buyer & seller packets",
      icon: FileSpreadsheet,
      iconBadgeClass: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
      href: `/property/${propertyId}/documents`,
    },
    {
      id: "ql-qr-codes",
      title: "QR Codes",
      subtitle: "Printable listing link",
      icon: QrCode,
      iconBadgeClass: "bg-navy-800 text-white dark:bg-navy-700",
      href: `/property/${propertyId}/qr-codes`,
    },
    {
      id: "ql-open-houses",
      title: "Open Houses",
      subtitle: "Schedule & sign-in sheets",
      icon: PartyPopper,
      iconBadgeClass: "bg-gold-100 text-gold-600 dark:bg-gold-500/15 dark:text-gold-400",
      href: `/property/${propertyId}/open-houses`,
    },
    {
      id: "ql-social",
      title: "Social Media",
      subtitle: "Instagram & Facebook posts",
      icon: Instagram,
      iconBadgeClass: "bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400",
      href: `/property/${propertyId}/social-media`,
    },
    // Visual-reservation-only tiles for planned-but-not-yet-built features
    // (see the task brief: "Listing Presentation" here is deliberately a
    // different, more elaborate future concept than the Property Website
    // Generator / "Listing Presentation Site" that IS real today under
    // Marketing Assets → Property Website). `comingSoon: true` makes
    // `ActionCard` render these muted, non-navigating, with a toast on
    // click instead of a dead or fake link.
    {
      id: "ql-market-comp",
      title: "Market Comp Analysis",
      subtitle: "Nearby comps & pricing",
      icon: BarChart3,
      iconBadgeClass: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
      comingSoon: true,
    },
    {
      id: "ql-open-house-kit",
      title: "Open House Kit",
      subtitle: "Sign-in sheets & handouts",
      icon: ClipboardList,
      iconBadgeClass: "bg-gold-100 text-gold-600 dark:bg-gold-500/15 dark:text-gold-400",
      comingSoon: true,
    },
    {
      id: "ql-listing-presentation",
      title: "Listing Presentation",
      subtitle: "Seller pitch deck",
      icon: MonitorPlay,
      iconBadgeClass: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400",
      comingSoon: true,
    },
    {
      id: "ql-buyer-offer-package",
      title: "Buyer Offer Package",
      subtitle: "Offer letter & pre-approval",
      icon: FileSignature,
      iconBadgeClass: "bg-success-50 text-success dark:bg-success/15 dark:text-green-400",
      comingSoon: true,
    },
  ];
}

interface OverviewTabProps {
  property: Property;
}

/**
 * Overview tab — new default/index route for a Property Workspace. A
 * property-scoped summary: key stats, quick links into every other tab, a
 * recent-activity preview, and the former standalone "Notes" tab folded in
 * as a side panel (Notes didn't make the new top-level tab list, so its
 * working add-note functionality is preserved here instead of deleted).
 */
export function OverviewTab({ property }: OverviewTabProps) {
  const quickLinks = buildQuickLinks(property.id);
  const activity = getPropertyActivity(property).slice(0, 4);
  const dom = daysOnMarket(property.id);
  const price = property.price
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
        property.price
      )
    : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="Assets" value={String(property.assetCount)} icon={Home} />
        <MetricCard label="Days on Market" value={String(dom)} icon={Calendar} />
        <MetricCard label="Status" value={property.status === "ACTIVE" ? "Active" : "Draft"} icon={ShieldCheck} />
        {price && <MetricCard label="List Price" value={price} icon={CreditCard} />}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section>
            <h2 className="text-lg font-semibold text-foreground">Jump back in</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {quickLinks.map((action, index) => (
                <ActionCard key={action.id} action={action} index={index} />
              ))}
            </div>
          </section>

          <ActivityFeed
            items={activity}
            title="Recent Activity"
            viewAllHref={`/property/${property.id}/activity-timeline`}
            viewAllLabel="View full timeline"
          />
        </div>

        <div className="lg:col-span-1">
          <NotesTab property={property} />
        </div>
      </div>
    </div>
  );
}

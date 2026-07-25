"use client";

import * as React from "react";
import {
  BarChart3,
  FileHeart,
  FileSignature,
  FileSpreadsheet,
  FileText,
  Home,
  ListChecks,
  Scale,
} from "lucide-react";

import { GeneratedDocList, type GeneratedDoc } from "@/components/property/GeneratedDocList";
import { TabSegmentedControl, type SegmentOption } from "@/components/property/TabSegmentedControl";
import type { Property } from "@/types";

function buildDocumentsDocs(property: Property): GeneratedDoc[] {
  return [
    {
      id: "listing-agreement",
      title: "Listing Agreement",
      date: "Jul 10, 2026",
      sizeLabel: "410 KB",
      icon: FileSignature,
      iconBadgeClass: "bg-navy-800 text-white dark:bg-navy-700",
    },
    {
      id: "disclosure",
      title: "Property Disclosure Statement",
      date: "Jul 10, 2026",
      sizeLabel: "620 KB",
      icon: Scale,
      iconBadgeClass: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
    },
    {
      id: "mls-sheet",
      title: `MLS Data Sheet — ${property.address}`,
      date: "Jul 11, 2026",
      sizeLabel: "180 KB",
      icon: FileSpreadsheet,
      iconBadgeClass: "bg-gold-100 text-gold-600 dark:bg-gold-500/15 dark:text-gold-400",
    },
    {
      id: "inspection",
      title: "Pre-Listing Inspection Report",
      date: "Jul 8, 2026",
      sizeLabel: "4.6 MB",
      icon: FileText,
      iconBadgeClass: "bg-success-50 text-success dark:bg-success/15 dark:text-green-400",
    },
  ];
}

function buildBuyerDocs(property: Property): GeneratedDoc[] {
  return [
    {
      id: "buyer-guide",
      title: `Buyer's Guide — ${property.address}`,
      date: "Jul 18, 2026",
      sizeLabel: "2.4 MB",
      icon: FileHeart,
      iconBadgeClass: "bg-gold-100 text-gold-600 dark:bg-gold-500/15 dark:text-gold-400",
    },
    {
      id: "buyer-checklist",
      title: "Home Buying Checklist",
      date: "Jul 18, 2026",
      sizeLabel: "310 KB",
      icon: ListChecks,
      iconBadgeClass: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400",
    },
    {
      id: "buyer-financing",
      title: "Financing Options Overview",
      date: "Jul 15, 2026",
      sizeLabel: "540 KB",
      icon: FileText,
      iconBadgeClass: "bg-success-50 text-success dark:bg-success/15 dark:text-green-400",
    },
  ];
}

function buildSellerDocs(property: Property): GeneratedDoc[] {
  return [
    {
      id: "seller-net-sheet",
      title: `Seller Net Sheet — ${property.address}`,
      date: "Jul 20, 2026",
      sizeLabel: "1.1 MB",
      icon: BarChart3,
      iconBadgeClass: "bg-navy-800 text-white dark:bg-navy-700",
    },
    {
      id: "seller-prep-guide",
      title: "Listing Prep & Staging Guide",
      date: "Jul 19, 2026",
      sizeLabel: "3.2 MB",
      icon: Home,
      iconBadgeClass: "bg-gold-100 text-gold-600 dark:bg-gold-500/15 dark:text-gold-400",
    },
    {
      id: "seller-cma",
      title: "Comparative Market Analysis",
      date: "Jul 12, 2026",
      sizeLabel: "890 KB",
      icon: FileText,
      iconBadgeClass: "bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400",
    },
  ];
}

const SECTIONS: SegmentOption<"documents" | "buyer-packet" | "seller-packet">[] = [
  { id: "documents", label: "Documents" },
  { id: "buyer-packet", label: "Buyer Packet" },
  { id: "seller-packet", label: "Seller Packet" },
];

type SectionId = (typeof SECTIONS)[number]["id"];

interface DocumentsTabProps {
  property: Property;
  initialSection?: string;
}

/**
 * Documents tab host: folds the former standalone "Documents", "Buyer
 * Packet", and "Seller Packet" tabs in as sub-sections of one page, each
 * still rendered through the shared `GeneratedDocList`.
 */
export function DocumentsTab({ property, initialSection }: DocumentsTabProps) {
  const resolvedInitial = SECTIONS.some((s) => s.id === initialSection) ? (initialSection as SectionId) : "documents";
  const [section, setSection] = React.useState<SectionId>(resolvedInitial);

  const docs =
    section === "documents"
      ? buildDocumentsDocs(property)
      : section === "buyer-packet"
        ? buildBuyerDocs(property)
        : buildSellerDocs(property);

  const title = SECTIONS.find((s) => s.id === section)?.label ?? "Documents";

  return (
    <div className="space-y-6">
      <TabSegmentedControl options={SECTIONS} value={section} onChange={setSection} />
      <GeneratedDocList title={title} docs={docs} />
    </div>
  );
}

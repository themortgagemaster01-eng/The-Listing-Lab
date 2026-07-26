import type { LucideIcon } from "lucide-react";

/** A single navigation item shown in the sidebar or mobile tab bar. */
export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

/** A labeled group of nav items rendered under a small uppercase section heading. */
export interface NavSection {
  label: string;
  items: NavItem[];
}

/** Status of a property lab / listing workspace. */
export type PropertyStatus = "ACTIVE" | "DRAFT";

/**
 * A single property lab / listing. The dashboard card only needs the first
 * six fields; everything below is used to flesh out the Property Workspace
 * (`/property/[id]`) — headline copy, financial defaults for the Payments
 * calculator, and a small photo gallery.
 */
export interface Property {
  id: string;
  address: string;
  cityStateZip: string;
  status: PropertyStatus;
  assetCount: number;
  imageUrl: string;
  price?: number;
  beds?: number;
  baths?: number;
  sqft?: number;
  yearBuilt?: number;
  lotSize?: string;
  mlsNumber?: string;
  headline?: string;
  description?: string;
  photos?: string[];
  listingAgent?: string;
  annualPropertyTax?: number;
  annualHomeInsurance?: number;
  /**
   * Fields added for the AI Flyer Generator (`components/property/flyer/*`).
   * All optional so the existing mock properties (`src/lib/mock-data.ts`)
   * keep compiling untouched — the Flyer Generator's own persistence layer
   * (`src/lib/flyer/*`) fills these in from its property-info form and
   * treats them as the source of truth once a user has edited them.
   */
  propertyType?: string;
  keyFeatures?: string[];
  agentEmail?: string;
  agentPhone?: string;
  agentPhotoUrl?: string;
  /**
   * Agent's mortgage application/contact link (Payment Snapshot feature —
   * `components/property/payment/*`). Optional, same pattern as
   * `agentPhotoUrl` above. Used as the Payment Snapshot PDF's QR code
   * target; falls back to a mailto:/tel: link built from agentEmail/
   * agentPhone when blank (see src/lib/pdf/qrcode.ts).
   */
  agentApplicationUrl?: string;
}

/** A top-level KPI stat card on the dashboard. */
export interface StatCard {
  id: string;
  label: string;
  value: number;
  trendLabel: string;
  icon: LucideIcon;
  iconBadgeClass: string;
}

/** A single row in the "Recent Activity" feed. */
export interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  timestamp: string;
  icon: LucideIcon;
  iconBadgeClass: string;
}

/** A notification shown in the header bell dropdown. */
export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

/** An upcoming calendar event shown in the "Upcoming" panel. */
export interface UpcomingEvent {
  id: string;
  month: string;
  day: string;
  title: string;
  location: string;
  time: string;
  statusColor: string;
}

/** A suggestion pill in the AI Assistant panel. */
export interface AiSuggestion {
  id: string;
  label: string;
  icon: LucideIcon;
}

/** A single quick-action card/tile. */
export interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconBadgeClass: string;
  /** Optional destination. When present, the tile navigates there. */
  href?: string;
}

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

/** A single property lab / listing card shown on the dashboard. */
export interface Property {
  id: string;
  address: string;
  cityStateZip: string;
  status: PropertyStatus;
  assetCount: number;
  imageUrl: string;
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
}

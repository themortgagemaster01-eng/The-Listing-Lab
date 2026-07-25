import {
  LayoutGrid,
  FolderKanban,
  Sparkles,
  Megaphone,
  Camera,
  CreditCard,
  FileText,
  LayoutTemplate,
  QrCode,
  Users,
  User,
  Settings,
  Wallet,
  Home,
  Image as ImageIcon,
  Download,
  UsersRound,
  Wand2,
  Instagram,
  FileSpreadsheet,
  PartyPopper,
  ArrowUpRight,
} from "lucide-react";
import type {
  NavSection,
  NavItem,
  Property,
  StatCard,
  ActivityItem,
  NotificationItem,
  UpcomingEvent,
  AiSuggestion,
  QuickAction,
} from "@/types";

/** Standalone top nav item, always shown above the sectioned nav groups. */
export const dashboardNavItem: NavItem = {
  label: "Dashboard",
  href: "/dashboard",
  icon: LayoutGrid,
};

/** Sidebar navigation, grouped into labeled sections. */
export const navSections: NavSection[] = [
  {
    label: "Property Labs",
    items: [
      { label: "Property Labs", href: "/dashboard/property-labs", icon: FolderKanban },
      { label: "AI Command Center", href: "/dashboard/ai-command-center", icon: Sparkles },
      { label: "Marketing Center", href: "/dashboard/marketing-center", icon: Megaphone },
      { label: "AI Photos", href: "/dashboard/ai-photos", icon: Camera },
      { label: "Payments", href: "/dashboard/payments", icon: CreditCard },
      { label: "Documents", href: "/dashboard/documents", icon: FileText },
      { label: "Templates", href: "/dashboard/templates", icon: LayoutTemplate },
      { label: "QR Codes", href: "/dashboard/qr-codes", icon: QrCode },
      { label: "Contacts", href: "/dashboard/contacts", icon: Users },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Profile", href: "/dashboard/profile", icon: User },
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
      { label: "Billing", href: "/dashboard/billing", icon: Wallet },
    ],
  },
];

/** Mock "logged in" agent shown in the sidebar profile row and header avatar. */
export const currentUser = {
  name: "Robert Castro",
  subtitle: "Movement Mortgage",
  avatarUrl: "https://i.pravatar.cc/150?img=12",
};

export const stats: StatCard[] = [
  {
    id: "property-labs",
    label: "Property Labs",
    value: 12,
    trendLabel: "↑ 2 this week",
    icon: Home,
    iconBadgeClass: "bg-navy-800 text-white dark:bg-navy-700",
  },
  {
    id: "marketing-assets",
    label: "Marketing Assets",
    value: 48,
    trendLabel: "↑ 12 this week",
    icon: ImageIcon,
    iconBadgeClass: "bg-gold-100 text-gold-600 dark:bg-gold-500/15 dark:text-gold-400",
  },
  {
    id: "ai-generations",
    label: "AI Generations",
    value: 36,
    trendLabel: "↑ 18 this week",
    icon: Sparkles,
    iconBadgeClass: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400",
  },
  {
    id: "downloads",
    label: "Downloads",
    value: 24,
    trendLabel: "↑ 7 this week",
    icon: Download,
    iconBadgeClass: "bg-success-50 text-success dark:bg-success/15 dark:text-green-400",
  },
  {
    id: "active-clients",
    label: "Active Clients",
    value: 8,
    trendLabel: "↑ 1 this week",
    icon: UsersRound,
    iconBadgeClass: "bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400",
  },
];

export const properties: Property[] = [
  {
    id: "prop-1",
    address: "123 Main Street",
    cityStateZip: "Mahopac, NY 10541",
    status: "ACTIVE",
    assetCount: 14,
    imageUrl:
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "prop-2",
    address: "45 Oak Ridge Road",
    cityStateZip: "Somers, NY 10589",
    status: "ACTIVE",
    assetCount: 9,
    imageUrl:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "prop-3",
    address: "78 Lakeview Drive",
    cityStateZip: "Carmel, NY 10512",
    status: "DRAFT",
    assetCount: 6,
    imageUrl:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "prop-4",
    address: "19 Ridgefield Lane",
    cityStateZip: "North Salem, NY 10560",
    status: "ACTIVE",
    assetCount: 11,
    imageUrl:
      "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=800&q=80",
  },
];

export const aiSuggestions: AiSuggestion[] = [
  { id: "sug-1", label: "Create a luxury flyer", icon: FileSpreadsheet },
  { id: "sug-2", label: "Stage a living room photo", icon: Wand2 },
  { id: "sug-3", label: "Generate Instagram post", icon: Instagram },
  { id: "sug-4", label: "Create payment options", icon: CreditCard },
  { id: "sug-5", label: "Build open house package", icon: PartyPopper },
];

export const upcomingEvents: UpcomingEvent[] = [
  {
    id: "evt-1",
    month: "MAY",
    day: "22",
    title: "Open House",
    location: "123 Main Street, Mahopac",
    time: "12:00 – 3:00 PM",
    statusColor: "bg-gold-500",
  },
  {
    id: "evt-2",
    month: "MAY",
    day: "24",
    title: "Client Walkthrough",
    location: "45 Oak Ridge Road, Somers",
    time: "10:00 – 10:45 AM",
    statusColor: "bg-navy-600 dark:bg-navy-200",
  },
  {
    id: "evt-3",
    month: "MAY",
    day: "27",
    title: "Listing Photo Shoot",
    location: "19 Ridgefield Lane, North Salem",
    time: "2:00 – 4:00 PM",
    statusColor: "bg-success",
  },
];

export const quickActions: QuickAction[] = [
  {
    id: "qa-1",
    title: "New Property Lab",
    subtitle: "Start a new listing",
    icon: FolderKanban,
    iconBadgeClass: "bg-navy-800 text-white dark:bg-navy-700",
  },
  {
    id: "qa-2",
    title: "Generate Flyer",
    subtitle: "Create a listing flyer",
    icon: FileText,
    iconBadgeClass: "bg-gold-100 text-gold-600 dark:bg-gold-500/15 dark:text-gold-400",
  },
  {
    id: "qa-3",
    title: "AI Photo Enhance",
    subtitle: "Improve your photos",
    icon: Camera,
    iconBadgeClass: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400",
  },
  {
    id: "qa-4",
    title: "Virtual Staging",
    subtitle: "Stage any room",
    icon: Wand2,
    iconBadgeClass: "bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400",
  },
  {
    id: "qa-5",
    title: "Payment Snapshot",
    subtitle: "Create payment sheet",
    icon: CreditCard,
    iconBadgeClass: "bg-success-50 text-success dark:bg-success/15 dark:text-green-400",
  },
  {
    id: "qa-6",
    title: "Closing Costs",
    subtitle: "Estimate closing costs",
    icon: Wallet,
    iconBadgeClass: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
  },
  {
    id: "qa-7",
    title: "Buyer Packet",
    subtitle: "Create buyer guide",
    icon: FileSpreadsheet,
    iconBadgeClass: "bg-gold-100 text-gold-600 dark:bg-gold-500/15 dark:text-gold-400",
  },
  {
    id: "qa-8",
    title: "Seller Packet",
    subtitle: "Create seller guide",
    icon: FileText,
    iconBadgeClass: "bg-navy-800 text-white dark:bg-navy-700",
  },
  {
    id: "qa-9",
    title: "Social Post",
    subtitle: "Create social content",
    icon: Instagram,
    iconBadgeClass: "bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400",
  },
];

export const recentActivity: ActivityItem[] = [
  {
    id: "act-1",
    title: "Luxury flyer created",
    subtitle: "123 Main Street",
    timestamp: "2m ago",
    icon: FileText,
    iconBadgeClass: "bg-gold-100 text-gold-600 dark:bg-gold-500/15 dark:text-gold-400",
  },
  {
    id: "act-2",
    title: "AI enhancement completed",
    subtitle: "123 Main Street",
    timestamp: "15m ago",
    icon: Sparkles,
    iconBadgeClass: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400",
  },
  {
    id: "act-3",
    title: "Instagram post generated",
    subtitle: "45 Oak Ridge Road",
    timestamp: "1h ago",
    icon: Instagram,
    iconBadgeClass: "bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400",
  },
  {
    id: "act-4",
    title: "Payment snapshot created",
    subtitle: "78 Lakeview Drive",
    timestamp: "2h ago",
    icon: CreditCard,
    iconBadgeClass: "bg-success-50 text-success dark:bg-success/15 dark:text-green-400",
  },
  {
    id: "act-5",
    title: "Open house package created",
    subtitle: "19 Ridgefield Lane",
    timestamp: "3h ago",
    icon: PartyPopper,
    iconBadgeClass: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
  },
];

export const notifications: NotificationItem[] = [
  {
    id: "notif-1",
    title: "AI enhancement complete",
    description: "3 photos for 123 Main Street are ready to review.",
    timestamp: "15m ago",
    read: false,
  },
  {
    id: "notif-2",
    title: "New client message",
    description: "Sarah Kim asked a question about 45 Oak Ridge Road.",
    timestamp: "1h ago",
    read: false,
  },
  {
    id: "notif-3",
    title: "Open house reminder",
    description: "123 Main Street open house starts tomorrow at 12:00 PM.",
    timestamp: "3h ago",
    read: false,
  },
];

export const quickActionsFooterCta = {
  label: "Open AI Command Center",
  icon: ArrowUpRight,
};

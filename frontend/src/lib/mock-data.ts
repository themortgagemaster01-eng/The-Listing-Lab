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
  Globe,
  BadgeCheck,
  TrendingUp,
  Palette,
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
  ToolboxCategory,
} from "@/types";

/** The fully-built-out example property used across dashboard shortcuts and demos. */
export const EXAMPLE_PROPERTY_ID = "123-main-street";

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
      { label: "AI Command Center", href: "/ai-command-center", icon: Sparkles },
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
      // Persistent, account-level setup step — deliberately NOT part of the
      // "Property Labs" toolbox section above (or the future 3-category
      // Marketing / Mortgage & Buyer Tools / Business Growth nav), since
      // it's a one-time profile every asset reads from, not a generator
      // tool in its own right. See `components/brand/BrandCenterForm.tsx`.
      { label: "Brand Center", href: "/brand-center", icon: BadgeCheck },
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
    id: "123-main-street",
    address: "123 Main Street",
    cityStateZip: "Mahopac, NY 10541",
    status: "ACTIVE",
    assetCount: 14,
    imageUrl:
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1600&q=80",
    price: 725000,
    beds: 4,
    baths: 3,
    sqft: 2840,
    yearBuilt: 2006,
    lotSize: "0.92 acres",
    mlsNumber: "H6312045",
    headline: "Sun-Drenched Colonial on a Private Cul-de-Sac",
    description:
      "Welcome home to 123 Main Street, a beautifully maintained colonial tucked at the end of a quiet cul-de-sac in Mahopac. This 4-bedroom, 3-bath retreat blends timeless architectural details with thoughtful, modern updates throughout. The chef's kitchen opens to a sun-filled great room with soaring ceilings, while the finished lower level offers flexible space for a home office, gym, or media room. Outside, a expansive deck overlooks a fully fenced, professionally landscaped yard — perfect for entertaining or quiet evenings at home.",
    photos: [
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1200&q=80",
    ],
    listingAgent: "Robert Castro · Movement Mortgage",
    annualPropertyTax: 10800,
    annualHomeInsurance: 1850,
  },
  {
    id: "45-oak-ridge-road",
    address: "45 Oak Ridge Road",
    cityStateZip: "Somers, NY 10589",
    status: "ACTIVE",
    assetCount: 9,
    imageUrl:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80",
    price: 899000,
    beds: 5,
    baths: 4,
    sqft: 3620,
    yearBuilt: 2011,
    lotSize: "1.4 acres",
    mlsNumber: "H6318827",
    headline: "Grand Modern Farmhouse with Resort-Style Grounds",
    description:
      "This striking modern farmhouse sits on 1.4 private acres in Somers, offering five bedrooms, four baths, and a light-filled open floor plan built for entertaining. A chef's kitchen with an oversized island flows into the family room, and the primary suite is a true retreat with a spa-inspired bath. Outdoor living shines with a covered porch and heated in-ground pool.",
    photos: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80",
    ],
    listingAgent: "Robert Castro · Movement Mortgage",
    annualPropertyTax: 13200,
    annualHomeInsurance: 2100,
  },
  {
    id: "78-lakeview-drive",
    address: "78 Lakeview Drive",
    cityStateZip: "Carmel, NY 10512",
    status: "DRAFT",
    assetCount: 6,
    imageUrl:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80",
    price: 549000,
    beds: 3,
    baths: 2,
    sqft: 1980,
    yearBuilt: 1998,
    lotSize: "0.5 acres",
    mlsNumber: "H6321190",
    headline: "Charming Lakeside Cottage with Private Dock",
    description:
      "Tucked along the shore of Lake Carmel, this 3-bedroom cottage offers easy lake living with a private dock, an open-concept living area, and walls of windows framing the water views. A wraparound deck makes the most of every season, and the detached bonus room is ideal as a studio or guest suite.",
    photos: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=80",
    ],
    listingAgent: "Robert Castro · Movement Mortgage",
    annualPropertyTax: 7400,
    annualHomeInsurance: 1400,
  },
  {
    id: "19-ridgefield-lane",
    address: "19 Ridgefield Lane",
    cityStateZip: "North Salem, NY 10560",
    status: "ACTIVE",
    assetCount: 11,
    imageUrl:
      "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1600&q=80",
    price: 1150000,
    beds: 5,
    baths: 5,
    sqft: 4400,
    yearBuilt: 2015,
    lotSize: "2.1 acres",
    mlsNumber: "H6329914",
    headline: "Sprawling Estate Retreat with Sweeping Views",
    description:
      "Set behind gates on over two private acres, this North Salem estate delivers five bedrooms, five baths, and an entertainer's kitchen anchored by a marble waterfall island. A wall of glass off the great room opens to a bluestone terrace, outdoor kitchen, and sweeping hillside views beyond the tree line.",
    photos: [
      "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566752734-2a0cd53a76d3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
    ],
    listingAgent: "Robert Castro · Movement Mortgage",
    annualPropertyTax: 17600,
    annualHomeInsurance: 2600,
  },
];

/** Look up a property by its slug id. Returns `undefined` when no match exists. */
export function getPropertyById(id: string): Property | undefined {
  return properties.find((property) => property.id === id);
}

export const aiSuggestions: AiSuggestion[] = [
  { id: "sug-1", label: "Create a luxury flyer", icon: FileSpreadsheet },
  { id: "sug-2", label: "Stage a living room photo", icon: Wand2 },
  { id: "sug-3", label: "Generate Instagram post", icon: Instagram },
  { id: "sug-4", label: "Create payment options", icon: CreditCard },
  { id: "sug-5", label: "Build open house package", icon: PartyPopper },
];

/** Example commands shown in the hero `CommandBar` dropdown on the dashboard. */
export const commandBarSuggestions: AiSuggestion[] = [
  { id: "cmd-1", label: "Create a luxury flyer", icon: FileSpreadsheet },
  { id: "cmd-2", label: "Generate Instagram Reel", icon: Instagram },
  { id: "cmd-3", label: "Make payment options for $725,000 at 6.5%", icon: CreditCard },
  { id: "cmd-4", label: "Create an open house package", icon: PartyPopper },
  { id: "cmd-5", label: "Generate property website", icon: Globe },
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

/**
 * The dashboard toolbox, grouped into the product's toolbox categories
 * (Property Marketing, Mortgage Center, Client PDF Center, Income Analyzer,
 * Realtor Website Builder, Mortgage Market Dashboard, Brand Center) per
 * Robert's 2026-07-27 product-direction update. This is a navigation/
 * visibility update, not a build list: tiles for real, shipped tools carry
 * an `href` and deep-link into the example property (123 Main Street) —
 * the same demo-shortcut convention used since Phase 2 — while tiles for
 * modules that don't exist yet are `comingSoon: true` (muted, "Soon"
 * badge, toast on click — see `ActionCard.tsx`) rather than hidden or
 * faked. See `docs/PRODUCT_PRINCIPLES.md` for the hard boundary on what
 * this app will never build (CRM, email marketing, transaction
 * management, accounting, MLS replacement, calendar platform) and
 * `docs/FUTURE_FEATURES.md` for what's behind each "Coming Soon" tile.
 */
export const toolboxCategories: ToolboxCategory[] = [
  {
    id: "property-marketing",
    label: "Property Marketing",
    actions: [
      {
        id: "tb-flyer-studio",
        title: "Flyer Studio",
        subtitle: "Design & export listing flyers",
        icon: FileText,
        iconBadgeClass: "bg-gold-100 text-gold-600 dark:bg-gold-500/15 dark:text-gold-400",
        href: `/property/${EXAMPLE_PROPERTY_ID}/marketing-assets?section=flyers`,
      },
      {
        id: "tb-property-websites",
        title: "Property Websites",
        subtitle: "One-click listing site",
        icon: Globe,
        iconBadgeClass: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
        href: `/property/${EXAMPLE_PROPERTY_ID}/marketing-assets?section=website`,
      },
      {
        id: "tb-open-house-package",
        title: "Open House Package",
        subtitle: "Sign-in sheets & handouts",
        icon: PartyPopper,
        iconBadgeClass: "bg-navy-800 text-white dark:bg-navy-700",
        comingSoon: true,
      },
      {
        id: "tb-qr-codes",
        title: "QR Codes",
        subtitle: "Standalone QR generator",
        icon: QrCode,
        iconBadgeClass: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400",
        comingSoon: true,
      },
      {
        id: "tb-ai-photo-enhance",
        title: "AI Photo Enhancement",
        subtitle: "Improve your photos",
        icon: Camera,
        iconBadgeClass: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400",
        comingSoon: true,
      },
      {
        id: "tb-virtual-staging",
        title: "Virtual Staging",
        subtitle: "Stage any room",
        icon: Wand2,
        iconBadgeClass: "bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400",
        comingSoon: true,
      },
    ],
  },
  {
    id: "mortgage-center",
    label: "Mortgage Center",
    actions: [
      {
        id: "tb-mc-calculator",
        title: "Payment Calculator",
        subtitle: "Monthly P&I by program",
        icon: CreditCard,
        iconBadgeClass: "bg-success-50 text-success dark:bg-success/15 dark:text-green-400",
        href: `/property/${EXAMPLE_PROPERTY_ID}/payment-tools?section=calculator`,
      },
      {
        id: "tb-mc-compare",
        title: "Compare Loan Options",
        subtitle: "Side-by-side programs",
        icon: Wallet,
        iconBadgeClass: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
        href: `/property/${EXAMPLE_PROPERTY_ID}/payment-tools?section=compare`,
      },
      {
        id: "tb-mc-cash-to-close",
        title: "Cash to Close",
        subtitle: "Closing costs & totals",
        icon: FileSpreadsheet,
        iconBadgeClass: "bg-gold-100 text-gold-600 dark:bg-gold-500/15 dark:text-gold-400",
        href: `/property/${EXAMPLE_PROPERTY_ID}/payment-tools?section=cash-to-close`,
      },
      {
        id: "tb-mc-affordability",
        title: "Affordability",
        subtitle: "What can your buyer afford?",
        icon: Home,
        iconBadgeClass: "bg-navy-800 text-white dark:bg-navy-700",
        href: `/property/${EXAMPLE_PROPERTY_ID}/payment-tools?section=affordability`,
      },
      {
        id: "tb-mc-sonyma",
        title: "SONYMA / DPA",
        subtitle: "NY down-payment assistance",
        icon: BadgeCheck,
        iconBadgeClass: "bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400",
        href: `/property/${EXAMPLE_PROPERTY_ID}/payment-tools?section=sonyma`,
      },
    ],
  },
  {
    id: "client-pdf-center",
    label: "Client PDF Center",
    actions: [
      {
        id: "tb-pdf-center",
        title: "Client PDF Center",
        subtitle: "Buyer reports, net sheets & guides",
        icon: FileText,
        iconBadgeClass: "bg-gold-100 text-gold-600 dark:bg-gold-500/15 dark:text-gold-400",
        comingSoon: true,
      },
    ],
  },
  {
    id: "income-analyzer",
    label: "Income Analyzer",
    actions: [
      {
        id: "tb-income-analyzer",
        title: "Income Analyzer",
        subtitle: "Analyze buyer income documents",
        icon: FileSpreadsheet,
        iconBadgeClass: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
        comingSoon: true,
      },
    ],
  },
  {
    id: "realtor-website-builder",
    label: "Realtor Website Builder",
    actions: [
      {
        id: "tb-realtor-website-builder",
        title: "Realtor Website Builder",
        subtitle: "Your own agent website",
        icon: Globe,
        iconBadgeClass: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400",
        comingSoon: true,
      },
    ],
  },
  {
    id: "mortgage-market-dashboard",
    label: "Mortgage Market Dashboard",
    actions: [
      {
        id: "tb-mortgage-market-dashboard",
        title: "Mortgage Market Dashboard",
        subtitle: "Rates, news & talking points",
        icon: TrendingUp,
        iconBadgeClass: "bg-navy-800 text-white dark:bg-navy-700",
        comingSoon: true,
      },
    ],
  },
  {
    id: "brand-center",
    label: "Brand Center",
    actions: [
      {
        id: "tb-brand-center",
        title: "Brand Center",
        subtitle: "Your profile, colors & logo",
        icon: Palette,
        iconBadgeClass: "bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400",
        href: "/brand-center",
      },
    ],
  },
];

/**
 * Deterministic per-property activity timeline. Powers the property-scoped
 * "Activity Timeline" tab and the Overview tab's recent-activity preview
 * (both rendered via the shared `ActivityFeed` component).
 */
export function getPropertyActivity(property: Property): ActivityItem[] {
  return [
    {
      id: `${property.id}-act-1`,
      title: "Flyer generated",
      subtitle: property.address,
      timestamp: "1h ago",
      icon: FileText,
      iconBadgeClass: "bg-gold-100 text-gold-600 dark:bg-gold-500/15 dark:text-gold-400",
    },
    {
      id: `${property.id}-act-2`,
      title: "Photo uploaded",
      subtitle: property.address,
      timestamp: "3h ago",
      icon: ImageIcon,
      iconBadgeClass: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400",
    },
    {
      id: `${property.id}-act-3`,
      title: "Payment snapshot created",
      subtitle: property.address,
      timestamp: "Yesterday",
      icon: CreditCard,
      iconBadgeClass: "bg-success-50 text-success dark:bg-success/15 dark:text-green-400",
    },
    {
      id: `${property.id}-act-4`,
      title: "AI photo enhancement completed",
      subtitle: property.address,
      timestamp: "2 days ago",
      icon: Sparkles,
      iconBadgeClass: "bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400",
    },
    {
      id: `${property.id}-act-5`,
      title: "QR code generated",
      subtitle: property.address,
      timestamp: "3 days ago",
      icon: QrCode,
      iconBadgeClass: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
    },
  ];
}

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
  href: "/ai-command-center",
};

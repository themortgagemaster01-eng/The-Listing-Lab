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
  BarChart3,
  MapPin,
  Scale,
  BookOpen,
  ClipboardList,
  Building2,
  PencilLine,
  RefreshCw,
  Presentation,
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
 * The dashboard toolbox, grouped into the product's toolbox categories.
 *
 * Ordering per Robert's 2026-07-28 "six flagship tools" update (supersedes
 * the same-day-earlier "Realtor Toolbox master vision" category order):
 * **AI Comparative Market Analysis (CMA)** is now the lead flagship
 * feature and sits first, followed by Marketing Studio, Client
 * Presentation Center, Realtor Website Builder, AI Assistant, and
 * Educational Mortgage Tools (renamed from "Mortgage Tools") — those six,
 * in that order, are the top-level flagship framing. Brand Center and AI
 * Income Analyzer remain fully part of the product but are explicitly
 * secondary/utility-tier per Robert, not part of the six-flagship
 * ordering — they're kept at the end of this array, unchanged, pending a
 * possible future repositioning decision he's still confirming.
 *
 * CMA itself was previously just one report type inside Client
 * Presentation Center (`tb-cpc-cma`); it's been promoted to its own
 * top-level category and removed from Client Presentation Center's list
 * to avoid duplication. It isn't built yet — see the top of
 * `docs/FUTURE_FEATURES.md`, where it's now the top build priority ahead
 * of everything else not yet started — so its tile is `comingSoon: true`,
 * and it also gets a dedicated hero banner on the dashboard (see
 * `components/dashboard/FlagshipBanner.tsx`).
 *
 * This is a navigation/visibility update, not a build list: tiles for real,
 * shipped tools carry an `href` and deep-link into the example property
 * (123 Main Street) — the same demo-shortcut convention used since Phase 2
 * — while tiles for modules that don't exist yet are `comingSoon: true`
 * (muted, "Soon" badge, toast on click — see `ActionCard.tsx`) rather than
 * hidden or faked.
 *
 * Property Websites (`tb-property-websites`) is a known exception: the
 * 2026-07-28 vision doc's "Do Not Build" list includes "property listing
 * websites," which directly conflicts with this already-built,
 * already-verified feature. Per Robert's explicit instruction, it stays
 * exactly as-is here — untouched, still real, still linked — slotted into
 * Marketing Studio since that's where it naturally sits among the other
 * listing-marketing tools. See `docs/PRODUCT_PRINCIPLES.md` → "Do Not
 * Build" for the full flagged conflict and `docs/FUTURE_FEATURES.md` for
 * what's behind each other "Coming Soon" tile.
 */
export const toolboxCategories: ToolboxCategory[] = [
  {
    id: "ai-cma",
    label: "AI Comparative Market Analysis (CMA)",
    actions: [
      {
        id: "tb-cma",
        title: "AI CMA",
        subtitle: "Branded comparative market analysis",
        icon: BarChart3,
        iconBadgeClass: "bg-gold-100 text-gold-600 dark:bg-gold-500/15 dark:text-gold-400",
        comingSoon: true,
      },
    ],
  },
  {
    id: "marketing-studio",
    label: "Marketing Studio",
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
        id: "tb-open-house-kit",
        title: "Open House Kit",
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
        href: "/dashboard/qr-codes",
      },
      {
        id: "tb-social-graphics",
        title: "Social Graphics",
        subtitle: "Sized, on-brand social posts",
        icon: Instagram,
        iconBadgeClass: "bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400",
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
    id: "client-presentation-center",
    label: "Client Presentation Center",
    actions: [
      {
        id: "tb-cpc-market-reports",
        title: "Market Reports",
        subtitle: "Premium branded PDF",
        icon: TrendingUp,
        iconBadgeClass: "bg-navy-800 text-white dark:bg-navy-700",
        comingSoon: true,
      },
      {
        id: "tb-cpc-buyer-seller-guides",
        title: "Buyer & Seller Guides",
        subtitle: "Premium branded PDF",
        icon: BookOpen,
        iconBadgeClass: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
        comingSoon: true,
      },
      {
        id: "tb-cpc-offer-comparison",
        title: "Offer Comparison",
        subtitle: "Side-by-side offer breakdown",
        icon: Scale,
        iconBadgeClass: "bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400",
        comingSoon: true,
      },
      {
        id: "tb-cpc-home-value-reports",
        title: "Home Value Reports",
        subtitle: "Premium branded PDF",
        icon: Home,
        iconBadgeClass: "bg-success-50 text-success dark:bg-success/15 dark:text-green-400",
        comingSoon: true,
      },
      {
        id: "tb-cpc-neighborhood-reports",
        title: "Neighborhood Reports",
        subtitle: "Premium branded PDF",
        icon: MapPin,
        iconBadgeClass: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400",
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
        subtitle: "Personal & brokerage/team sites",
        icon: Globe,
        iconBadgeClass: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400",
        comingSoon: true,
      },
    ],
  },
  {
    id: "ai-assistant",
    label: "AI Assistant",
    actions: [
      {
        id: "tb-aia-listing-descriptions",
        title: "Listing Descriptions",
        subtitle: "AI-written from your details",
        icon: PencilLine,
        iconBadgeClass: "bg-gold-100 text-gold-600 dark:bg-gold-500/15 dark:text-gold-400",
        comingSoon: true,
      },
      {
        id: "tb-aia-mls-rewrites",
        title: "MLS Rewrites",
        subtitle: "Polish an existing MLS listing",
        icon: RefreshCw,
        iconBadgeClass: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
        comingSoon: true,
      },
      {
        id: "tb-aia-inspection-summaries",
        title: "Inspection Summaries",
        subtitle: "Plain-English report recap",
        icon: ClipboardList,
        iconBadgeClass: "bg-success-50 text-success dark:bg-success/15 dark:text-green-400",
        comingSoon: true,
      },
      {
        id: "tb-aia-hoa-summaries",
        title: "HOA Summaries",
        subtitle: "Plain-English HOA docs recap",
        icon: Building2,
        iconBadgeClass: "bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400",
        comingSoon: true,
      },
      {
        id: "tb-aia-marketing-copy",
        title: "Marketing Copy",
        subtitle: "On-brand copy, any format",
        icon: Megaphone,
        iconBadgeClass: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400",
        comingSoon: true,
      },
      {
        id: "tb-aia-presentation-generation",
        title: "Presentation Generation",
        subtitle: "Full client presentation decks",
        icon: Presentation,
        iconBadgeClass: "bg-navy-800 text-white dark:bg-navy-700",
        comingSoon: true,
      },
    ],
  },
  {
    id: "educational-mortgage-tools",
    label: "Educational Mortgage Tools",
    actions: [
      {
        id: "tb-mt-calculator",
        title: "Payment Calculator",
        subtitle: "Monthly P&I by program",
        icon: CreditCard,
        iconBadgeClass: "bg-success-50 text-success dark:bg-success/15 dark:text-green-400",
        href: `/property/${EXAMPLE_PROPERTY_ID}/payment-tools?section=calculator`,
      },
      {
        id: "tb-mt-compare",
        title: "Compare Loan Options",
        subtitle: "Side-by-side programs",
        icon: Wallet,
        iconBadgeClass: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
        href: `/property/${EXAMPLE_PROPERTY_ID}/payment-tools?section=compare`,
      },
      {
        id: "tb-mt-cash-to-close",
        title: "Cash to Close",
        subtitle: "Closing costs & totals",
        icon: FileSpreadsheet,
        iconBadgeClass: "bg-gold-100 text-gold-600 dark:bg-gold-500/15 dark:text-gold-400",
        href: `/property/${EXAMPLE_PROPERTY_ID}/payment-tools?section=cash-to-close`,
      },
      {
        id: "tb-mt-affordability",
        title: "Affordability",
        subtitle: "What can your buyer afford?",
        icon: Home,
        iconBadgeClass: "bg-navy-800 text-white dark:bg-navy-700",
        href: `/property/${EXAMPLE_PROPERTY_ID}/payment-tools?section=affordability`,
      },
      {
        id: "tb-mt-sonyma",
        title: "SONYMA / DPA",
        subtitle: "NY down-payment assistance",
        icon: BadgeCheck,
        iconBadgeClass: "bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400",
        href: `/property/${EXAMPLE_PROPERTY_ID}/payment-tools?section=sonyma`,
      },
      {
        id: "tb-mt-rate-news",
        title: "Mortgage Rate News",
        subtitle: "Current rate movement & context",
        icon: TrendingUp,
        iconBadgeClass: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
        comingSoon: true,
      },
    ],
  },
  // Secondary/utility tier (Robert, 2026-07-28): part of the product, but
  // deliberately NOT part of the six-flagship top-level framing above.
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
  {
    id: "ai-income-analyzer",
    label: "AI Income Analyzer",
    actions: [
      {
        id: "tb-ai-income-analyzer",
        title: "AI Income Analyzer",
        subtitle: "Analyze buyer income documents",
        icon: FileSpreadsheet,
        iconBadgeClass: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
        comingSoon: true,
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

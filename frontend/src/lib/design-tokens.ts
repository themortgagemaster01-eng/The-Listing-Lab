/**
 * Single source of truth for Listing Lab's design tokens — colors, type
 * scale, radius, shadows, spacing, animation durations, and icon sizes.
 * `tailwind.config.ts` mirrors the color/radius/shadow/duration tokens into
 * Tailwind's theme so utility classes like `bg-navy-800` or `duration-fast`
 * work directly in `className`; this file exists so the *same* values are
 * importable in TS/TSX (Framer Motion `transition` props, status-badge
 * lookups, etc.) instead of hardcoding magic numbers a second time.
 *
 * Per `docs/DESIGN_RULES.md`: always match existing spacing, radius,
 * shadows, and animation feel — this file is what "existing" means.
 */

/** Navy / gold / success color families. Mirrors the CSS custom properties in `globals.css`. */
export const COLORS = {
  navy: {
    50: "#eef2f7",
    100: "#dbe3ee",
    200: "#b3c2d9",
    400: "#4a6182",
    600: "#1c3556",
    700: "#142943",
    800: "#0f1f3d",
    900: "#0c1930",
    950: "#0a1628",
    DEFAULT: "#0f1f3d",
  },
  gold: {
    50: "#faf6ed",
    100: "#f3e9d0",
    200: "#e6d3a3",
    400: "#d4af6a",
    500: "#c9a463",
    600: "#b08a45",
    DEFAULT: "#c9a463",
  },
  success: {
    50: "#ecfdf3",
    DEFAULT: "#16a34a",
  },
} as const;

/**
 * Status → badge variant + display label. `active` / `draft` are live
 * today (Property Lab cards, the Property Workspace header). `pending`
 * (e.g. an offer-pending listing) and `archived` (a closed-out Property
 * Lab) are formalized here for future use — see `components/ui/badge.tsx`.
 */
export const STATUS_TOKENS = {
  active: { variant: "active", label: "Active" },
  draft: { variant: "draft", label: "Draft" },
  pending: { variant: "pending", label: "Pending" },
  archived: { variant: "archived", label: "Archived" },
} as const;

export type StatusToken = keyof typeof STATUS_TOKENS;

/**
 * Border radius scale. Confirms the xl/2xl/3xl scale used for cards, photo
 * tiles, and hero panels throughout the app. Small controls (icon-only
 * overflow buttons, tooltip chips) intentionally use Tailwind's default
 * `rounded-lg`/`rounded-md` — that's a distinct, smaller-tier affordance,
 * not an inconsistency.
 */
export const RADIUS = {
  lg: "0.5rem",
  xl: "0.875rem",
  "2xl": "1.25rem",
  "3xl": "1.75rem",
  full: "9999px",
} as const;

/** Elevation scale — matches `boxShadow` in `tailwind.config.ts`. */
export const SHADOWS = {
  soft: "0 2px 8px -2px rgba(10, 22, 40, 0.06), 0 8px 24px -8px rgba(10, 22, 40, 0.08)",
  softLg: "0 8px 30px -8px rgba(10, 22, 40, 0.12), 0 20px 48px -12px rgba(10, 22, 40, 0.14)",
  goldGlow: "0 0 0 3px rgba(201, 164, 99, 0.18)",
} as const;

/**
 * 4px/8px spacing scale. Tailwind's default `spacing` scale already follows
 * this (`1` = 0.25rem = 4px, `2` = 0.5rem = 8px, …) — this constant
 * documents/confirms that rather than reinventing a parallel scale. Use
 * Tailwind spacing utilities (`p-4`, `gap-6`, `px-3.5`, …) directly; reach
 * for this only when a raw pixel value is needed outside a className.
 */
export const SPACING_PX = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

/**
 * Animation duration tokens — in milliseconds (`DURATIONS`, for Tailwind's
 * `duration-fast`/`duration-base`/`duration-slow` utilities) and in seconds
 * (`DURATIONS_S`, ready to drop into a Framer Motion `transition={{ duration }}`).
 * Every one-off `duration: 0.2` etc. in a `motion.*` component should
 * reference one of these instead.
 */
export const DURATIONS = {
  fast: 150,
  base: 300,
  slow: 500,
} as const;

export const DURATIONS_S = {
  fast: DURATIONS.fast / 1000,
  base: DURATIONS.base / 1000,
  slow: DURATIONS.slow / 1000,
} as const;

export type DurationToken = keyof typeof DURATIONS;

/**
 * Standard lucide-react icon sizes. Icons are sized via `h-* w-*` Tailwind
 * classes (not the `size` prop) to stay consistent with the rest of the
 * app — this documents the convention:
 *   sm (16px / `h-4 w-4`) → inline in buttons, small badges, list rows
 *   md (20px / `h-5 w-5`) → default icon size — nav items, card headers
 *   lg (24px / `h-6 w-6`) → hero/feature icons, empty states, large badges
 */
export const ICON_SIZES = {
  sm: { px: 16, className: "h-4 w-4" },
  md: { px: 20, className: "h-5 w-5" },
  lg: { px: 24, className: "h-6 w-6" },
} as const;

export type IconSizeToken = keyof typeof ICON_SIZES;

/** Typographic scale in use across the app (Tailwind's default `fontSize` scale), annotated with how each step is actually used here. */
export const TYPOGRAPHY = {
  xs: { class: "text-xs", usage: "Meta text, timestamps, helper copy" },
  sm: { class: "text-sm", usage: "Body copy, form labels, buttons" },
  base: { class: "text-base", usage: "Default body text" },
  lg: { class: "text-lg", usage: "Section headings (Quick Actions, Recent Activity)" },
  xl: { class: "text-xl", usage: "Card/panel titles" },
  "2xl": { class: "text-2xl", usage: "Page/mobile hero headings" },
  "3xl": { class: "text-3xl", usage: "Desktop hero headings" },
  display: { class: "font-display", usage: "Playfair Display serif — property headlines / flyer / website hero type only" },
} as const;

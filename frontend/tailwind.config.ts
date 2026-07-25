import type { Config } from "tailwindcss";

/**
 * Tailwind theme extension. Colors/radius/shadows/durations here mirror
 * `src/lib/design-tokens.ts` — that file is the source of truth for values
 * referenced in TS/TSX (Framer Motion durations, etc.); this file is what
 * makes the same values available as utility classes (`bg-navy-800`,
 * `duration-fast`, `rounded-2xl`, `shadow-soft`, …).
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "serif"],
      },
      colors: {
        navy: {
          DEFAULT: "var(--color-navy)",
          50: "var(--color-navy-50)",
          100: "var(--color-navy-100)",
          200: "var(--color-navy-200)",
          400: "var(--color-navy-400)",
          600: "var(--color-navy-600)",
          700: "var(--color-navy-700)",
          800: "var(--color-navy-800)",
          900: "var(--color-navy-900)",
          950: "var(--color-navy-950)",
        },
        gold: {
          DEFAULT: "var(--color-gold)",
          50: "var(--color-gold-50)",
          100: "var(--color-gold-100)",
          200: "var(--color-gold-200)",
          400: "var(--color-gold-400)",
          500: "var(--color-gold-500)",
          600: "var(--color-gold-600)",
        },
        success: {
          DEFAULT: "var(--color-success)",
          50: "var(--color-success-50)",
        },
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        surface: "var(--color-surface)",
        "surface-secondary": "var(--color-surface-secondary)",
        border: "var(--color-border)",
        muted: "var(--color-muted)",
        "muted-foreground": "var(--color-muted-foreground)",
      },
      // Border radius scale — xl/2xl/3xl are the "card tier" radii used
      // throughout the app; smaller controls use Tailwind's default scale.
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        soft: "0 2px 8px -2px rgba(10, 22, 40, 0.06), 0 8px 24px -8px rgba(10, 22, 40, 0.08)",
        "soft-lg": "0 8px 30px -8px rgba(10, 22, 40, 0.12), 0 20px 48px -12px rgba(10, 22, 40, 0.14)",
        "gold-glow": "0 0 0 3px rgba(201, 164, 99, 0.18)",
      },
      // Animation duration tokens — matches `DURATIONS` in
      // `src/lib/design-tokens.ts`. Use `duration-fast` / `duration-base` /
      // `duration-slow` instead of an arbitrary `duration-[220ms]` value.
      transitionDuration: {
        fast: "150ms",
        base: "300ms",
        slow: "500ms",
      },
      keyframes: {
        "fade-slide-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-slide-in": "fade-slide-in 0.5s ease-out both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

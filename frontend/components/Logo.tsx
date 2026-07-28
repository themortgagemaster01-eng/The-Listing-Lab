import * as React from "react";

import { cn } from "@/lib/utils";

export type LogoVariant = "sidebar" | "login" | "compact";

interface LogoProps {
  variant?: LogoVariant;
  className?: string;
}

const monogramSizes: Record<LogoVariant, number> = {
  sidebar: 40,
  login: 56,
  compact: 32,
};

const wordmarkTextSizes: Record<LogoVariant, string> = {
  sidebar: "text-xl",
  login: "text-3xl",
  compact: "text-lg",
};

/**
 * "LL" monogram forming a house silhouette: left L solid (navy or white
 * depending on background), right L a gold gradient. The two L tops form a
 * diagonal roofline, with a small chimney block on the upper right.
 */
function Monogram({ size, onDark }: { size: number; onDark: boolean }) {
  const gradientId = React.useId();
  const solidFill = onDark ? "#ffffff" : "#0f1f3d";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <defs>
        <linearGradient id={gradientId} x1="24" y1="4" x2="42" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e6d3a3" />
          <stop offset="55%" stopColor="#d4af6a" />
          <stop offset="100%" stopColor="#b08a45" />
        </linearGradient>
      </defs>

      {/* Chimney block, upper right of the roofline */}
      <rect x="31.5" y="6" width="5" height="10" rx="1" fill={`url(#${gradientId})`} />

      {/* Left L: solid fill, angled top forms the left roof slope */}
      <path
        d="M9 40 L9 15 L24 6 L24 13.5 L16.5 18 L16.5 32 L26 32 L26 40 Z"
        fill={solidFill}
      />

      {/* Right L (mirrored): gold gradient, angled top forms the right roof slope */}
      <path
        d="M39 40 L39 15 L24 6 L24 13.5 L31.5 18 L31.5 32 L22 32 L22 40 Z"
        fill={`url(#${gradientId})`}
      />
    </svg>
  );
}

/**
 * Reusable "Realtor Toolbox" logo lockup. Renders the house-silhouette
 * monogram plus wordmark for `sidebar` / `login` variants, or an icon-only
 * mark for `compact` (mobile header) placements. The monogram glyph itself
 * is unchanged from the "Listing Lab" rebrand — it reads as an abstract
 * house silhouette, not literal initials, so it still works here.
 */
export function Logo({ variant = "sidebar", className }: LogoProps) {
  const onDark = variant === "sidebar";
  const size = monogramSizes[variant];

  if (variant === "compact") {
    return (
      <div className={cn("inline-flex items-center justify-center", className)}>
        <Monogram size={size} onDark={false} />
      </div>
    );
  }

  return (
    <div className={cn("inline-flex flex-col", className)}>
      <div className="flex items-center gap-3">
        <Monogram size={size} onDark={onDark} />
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display font-semibold tracking-wide",
              wordmarkTextSizes[variant]
            )}
          >
            <span className={onDark ? "text-white" : "text-navy-800"}>REALTOR</span>{" "}
            <span className="text-gold-500">TOOLBOX</span>
          </span>
        </div>
      </div>
      {variant === "sidebar" && (
        <p
          className={cn(
            "mt-2 text-[9px] font-semibold uppercase tracking-[0.18em]",
            onDark ? "text-navy-200/70" : "text-muted-foreground"
          )}
        >
          Built for Realtors. Powered by AI.
        </p>
      )}
    </div>
  );
}

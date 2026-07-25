import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide transition-colors",
  {
    variants: {
      variant: {
        active: "bg-navy-900/90 text-white backdrop-blur-sm dark:bg-navy-950/90",
        draft: "bg-white/90 text-navy-700 backdrop-blur-sm dark:bg-navy-800/90 dark:text-navy-100",
        // Formalized alongside active/draft (see STATUS_TOKENS in
        // src/lib/design-tokens.ts) for future use — not wired to any
        // property status yet.
        pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
        archived: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-400",
        gold: "bg-gold-100 text-gold-600 dark:bg-gold-500/15 dark:text-gold-400",
        success: "bg-success-50 text-success dark:bg-success/15 dark:text-green-400",
        neutral: "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

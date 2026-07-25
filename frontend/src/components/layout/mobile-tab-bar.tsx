"use client";

import { Folder, LayoutGrid, Menu, Plus, Sparkles, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface TabItem {
  id: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  elevated: boolean;
}

const tabs: TabItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutGrid, active: true, elevated: false },
  { id: "property-labs", label: "Property Labs", icon: Folder, active: false, elevated: false },
  { id: "create", label: "Create", icon: Plus, active: false, elevated: true },
  { id: "ai-command", label: "AI Command", icon: Sparkles, active: false, elevated: false },
  { id: "more", label: "More", icon: Menu, active: false, elevated: false },
];

/**
 * Fixed bottom tab bar, replaces the sidebar entirely below the `lg`
 * breakpoint. Only "Dashboard" is a real, active destination in Phase 1 —
 * the rest are visual affordances for future routes.
 */
export function MobileTabBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur-lg lg:hidden">
      <div className="mx-auto flex max-w-xl items-end justify-between px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;

          if (tab.elevated) {
            return (
              <button
                key={tab.id}
                type="button"
                aria-label={tab.label}
                className="relative flex flex-1 flex-col items-center"
              >
                <motion.span
                  whileTap={{ scale: 0.92 }}
                  className="-mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-navy-950 text-white shadow-soft-lg ring-4 ring-background dark:bg-gold-500 dark:text-navy-950"
                >
                  <Icon className="h-6 w-6" />
                </motion.span>
                <span className="mt-1 text-[10px] font-medium text-muted-foreground">
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              type="button"
              aria-label={tab.label}
              className="flex flex-1 flex-col items-center gap-1 py-1.5"
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  tab.active ? "text-navy-800 dark:text-gold-400" : "text-muted-foreground"
                )}
                strokeWidth={tab.active ? 2.4 : 2}
              />
              <span
                className={cn(
                  "text-[10px] font-medium",
                  tab.active ? "text-navy-800 dark:text-gold-400" : "text-muted-foreground"
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

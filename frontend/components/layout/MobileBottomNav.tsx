"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Folder, LayoutGrid, Menu, Sparkles, type LucideIcon } from "lucide-react";

import { FloatingCreateButton } from "@/components/layout/FloatingCreateButton";
import { cn } from "@/lib/utils";

interface TabItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
}

const tabs: TabItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutGrid, href: "/dashboard" },
  { id: "property-labs", label: "Property Labs", icon: Folder },
  { id: "ai-command", label: "AI Command", icon: Sparkles, href: "/ai-command-center" },
  { id: "more", label: "More", icon: Menu },
];

// Split around the elevated center "Create" button: 2 tabs, button, 2 tabs.
const leftTabs = tabs.slice(0, 2);
const rightTabs = tabs.slice(2);

function TabButton({ tab, active }: { tab: TabItem; active: boolean }) {
  const Icon = tab.icon;
  const content = (
    <>
      <Icon
        className={cn("h-5 w-5", active ? "text-navy-800 dark:text-gold-400" : "text-muted-foreground")}
        strokeWidth={active ? 2.4 : 2}
      />
      <span
        className={cn(
          "text-[10px] font-medium",
          active ? "text-navy-800 dark:text-gold-400" : "text-muted-foreground"
        )}
      >
        {tab.label}
      </span>
    </>
  );

  const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl";

  if (tab.href) {
    return (
      <Link
        href={tab.href}
        aria-label={tab.label}
        className={cn("flex flex-1 flex-col items-center gap-1 py-1.5", focusRing)}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-label={tab.label}
      className={cn("flex flex-1 flex-col items-center gap-1 py-1.5", focusRing)}
    >
      {content}
    </button>
  );
}

/**
 * Fixed bottom tab bar, replaces the sidebar entirely below the `lg`
 * breakpoint. "Dashboard" and "AI Command" are real, active destinations;
 * "Property Labs" / "More" remain visual affordances for future routes. The
 * elevated center button is `FloatingCreateButton`, which opens a
 * quick-create sheet.
 */
export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur-lg lg:hidden">
      <div className="mx-auto flex max-w-xl items-end justify-between px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        {leftTabs.map((tab) => (
          <TabButton key={tab.id} tab={tab} active={!!tab.href && pathname?.startsWith(tab.href)} />
        ))}

        <FloatingCreateButton />

        {rightTabs.map((tab) => (
          <TabButton key={tab.id} tab={tab} active={!!tab.href && pathname?.startsWith(tab.href)} />
        ))}
      </div>
    </nav>
  );
}

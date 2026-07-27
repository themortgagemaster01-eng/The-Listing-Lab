"use client";

import { usePathname } from "next/navigation";

import { Logo } from "@/components/Logo";
import { NavLink } from "@/components/layout/NavLink";
import { UserMenu } from "@/components/layout/UserMenu";
import { dashboardNavItem, navSections } from "@/lib/mock-data";
import type { AuthUserSummary } from "@/lib/supabase/session";

/**
 * Routes that already have a real page behind them. Sidebar items outside
 * this set intentionally render as inert affordances (no `href`) since their
 * destinations don't exist yet in this phase of the build.
 */
const LIVE_ROUTES = new Set<string>([dashboardNavItem.href, "/ai-command-center"]);

interface SidebarProps {
  user?: AuthUserSummary | null;
}

/** Fixed, full-height desktop sidebar. Hidden below the `lg` breakpoint. */
export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[272px] flex-col bg-navy-950 px-4 py-6 lg:flex">
      <div className="px-2">
        <Logo variant="sidebar" />
      </div>

      <nav className="mt-8 flex-1 space-y-6 overflow-y-auto pr-1">
        <div>
          <NavLink
            label={dashboardNavItem.label}
            icon={dashboardNavItem.icon}
            href={dashboardNavItem.href}
            active={pathname === dashboardNavItem.href}
          />
        </div>

        {navSections.map((section) => (
          <div key={section.label}>
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-navy-200/50">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isLive = LIVE_ROUTES.has(item.href);
                return (
                  <NavLink
                    key={item.label}
                    label={item.label}
                    icon={item.icon}
                    href={isLive ? item.href : undefined}
                    active={isLive && pathname?.startsWith(item.href)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="pt-4">
        <UserMenu user={user} />
      </div>
    </aside>
  );
}

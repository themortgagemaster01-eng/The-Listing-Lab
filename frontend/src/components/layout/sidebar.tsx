"use client";

import { usePathname } from "next/navigation";

import { Logo } from "@/components/shared/logo";
import { NavLink } from "@/components/layout/nav-link";
import { UserMenu } from "@/components/layout/user-menu";
import { dashboardNavItem, navSections } from "@/lib/mock-data";

/** Fixed, full-height desktop sidebar. Hidden below the `lg` breakpoint. */
export function Sidebar() {
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
              {section.items.map((item) => (
                <NavLink key={item.label} label={item.label} icon={item.icon} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="pt-4">
        <UserMenu />
      </div>
    </aside>
  );
}

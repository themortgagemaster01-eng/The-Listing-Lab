"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { MORTGAGE_CENTER_SECTIONS, type MortgageCenterSection } from "@/lib/payment/types";
import { cn } from "@/lib/utils";

interface MortgageCenterNavProps {
  active: MortgageCenterSection;
}

/**
 * Horizontal, mobile-scrollable tab bar for Mortgage Center's six modular
 * sections (Payment Calculator, Compare Loan Options, Cash to Close,
 * Affordability, SONYMA/DPA, Share/Export) — replaces the old single
 * scrollable page. The active section lives in the URL (`?section=`) so it
 * survives reloads and can be shared/deep-linked, updated via client-side
 * navigation only (all Mortgage Center state already lives client-side in
 * `PaymentSnapshotWizard`, so no server round-trip is needed).
 */
export function MortgageCenterNav({ active }: MortgageCenterNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function goToSection(section: MortgageCenterSection) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("section", section);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="-mx-1 flex gap-1.5 overflow-x-auto pb-1">
      {MORTGAGE_CENTER_SECTIONS.map((section) => (
        <button
          key={section.id}
          type="button"
          onClick={() => goToSection(section.id)}
          className={cn(
            "shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors",
            active === section.id
              ? "border-gold-400 bg-gold-50 text-navy-800 dark:bg-gold-500/10 dark:text-gold-400"
              : "border-border bg-background text-muted-foreground hover:border-gold-300"
          )}
        >
          {section.label}
        </button>
      ))}
    </div>
  );
}

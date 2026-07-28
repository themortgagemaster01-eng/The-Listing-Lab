"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { ActionCard } from "@/components/dashboard/ActionCard";
import { toolboxCategories, quickActionsFooterCta } from "@/lib/mock-data";

/**
 * The dashboard's toolbox: every module in the product, grouped into
 * labeled categories (Property Marketing, Mortgage Center, Client PDF
 * Center, Income Analyzer, Realtor Website Builder, Mortgage Market
 * Dashboard, Brand Center) rather than one flat grid — per Robert's
 * 2026-07-27 product-direction update. Real, shipped tools link out
 * (`ActionCard`'s `href`); modules that don't exist yet render muted with
 * a "Soon" badge (`comingSoon: true`) instead of being hidden or faked, so
 * the full toolbox direction stays visible. This is a navigation update
 * only — no placeholder pages were built for the "Soon" tiles. See
 * `src/lib/mock-data.ts` (`toolboxCategories`) for the underlying data.
 */
export function QuickActionsGrid() {
  const FooterIcon = quickActionsFooterCta.icon;

  return (
    <section className="space-y-5">
      <h2 className="text-lg font-semibold text-foreground">Your Toolbox</h2>

      <div className="space-y-5">
        {toolboxCategories.map((category) => (
          <div key={category.id}>
            <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {category.label}
            </h3>
            <div className="grid grid-cols-3 gap-3 lg:grid-cols-3">
              {category.actions.map((action, index) => (
                <ActionCard key={action.id} action={action} index={index} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <motion.div whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.99 }}>
        <Link
          href={quickActionsFooterCta.href}
          className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-navy-950 px-6 py-4 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-navy-900 dark:bg-navy-800 dark:hover:bg-navy-700"
        >
          <span aria-hidden="true">✨</span>
          {quickActionsFooterCta.label}
          <FooterIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </motion.div>
    </section>
  );
}

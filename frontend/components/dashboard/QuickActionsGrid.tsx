"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { ActionCard } from "@/components/dashboard/ActionCard";
import { quickActions, quickActionsFooterCta } from "@/lib/mock-data";

/** 3-column (desktop) / compact grid (mobile) of quick-action tiles, plus an AI Command Center CTA. */
export function QuickActionsGrid() {
  const FooterIcon = quickActionsFooterCta.icon;

  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>

      <div className="mt-4 grid grid-cols-3 gap-3 lg:grid-cols-3">
        {quickActions.map((action, index) => (
          <ActionCard key={action.id} action={action} index={index} />
        ))}
      </div>

      <motion.div whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.99 }}>
        <Link
          href={quickActionsFooterCta.href}
          className="group mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-navy-950 px-6 py-4 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-navy-900 dark:bg-navy-800 dark:hover:bg-navy-700"
        >
          <span aria-hidden="true">✨</span>
          {quickActionsFooterCta.label}
          <FooterIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </motion.div>
    </section>
  );
}

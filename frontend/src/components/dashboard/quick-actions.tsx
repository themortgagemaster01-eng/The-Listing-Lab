"use client";

import { motion } from "framer-motion";

import { quickActions, quickActionsFooterCta } from "@/lib/mock-data";

/** 3-column (desktop) / compact grid (mobile) of quick-action tiles, plus an AI Command Center CTA. */
export function QuickActions() {
  const FooterIcon = quickActionsFooterCta.icon;

  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>

      <div className="mt-4 grid grid-cols-3 gap-3 lg:grid-cols-3">
        {quickActions.map((action, index) => {
          const Icon = action.icon;

          return (
            <motion.button
              key={action.id}
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
              whileHover={{ y: -3 }}
              className="flex flex-col items-start gap-2.5 rounded-2xl border border-border bg-surface p-3.5 text-left shadow-soft transition-colors hover:border-gold-300 sm:gap-3 sm:p-5"
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${action.iconBadgeClass}`}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold leading-snug text-foreground sm:text-sm">
                  {action.title}
                </p>
                <p className="mt-0.5 hidden text-xs text-muted-foreground sm:block">
                  {action.subtitle}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      <motion.button
        type="button"
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.99 }}
        className="group mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-navy-950 px-6 py-4 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-navy-900 dark:bg-navy-800 dark:hover:bg-navy-700"
      >
        <span aria-hidden="true">✨</span>
        {quickActionsFooterCta.label}
        <FooterIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </motion.button>
    </section>
  );
}

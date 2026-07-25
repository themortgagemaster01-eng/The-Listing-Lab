"use client";

import { motion } from "framer-motion";
import { ChevronRight, Sparkles } from "lucide-react";

import { aiSuggestions, currentUser } from "@/lib/mock-data";

/** Right-column panel: AI greeting plus a vertical list of suggestion pill-buttons. */
export function AiAssistantPanel() {
  const firstName = currentUser.name.split(" ")[0];

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 text-white">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">AI Assistant</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Hello {firstName}! I&apos;m here to help you create amazing marketing materials. What
            can I help you with?
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {aiSuggestions.map((suggestion, index) => {
          const Icon = suggestion.icon;
          return (
            <motion.button
              key={suggestion.id}
              type="button"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
              whileHover={{ x: 3 }}
              className="flex w-full items-center gap-3 rounded-xl border border-border bg-background px-3.5 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:border-gold-300 hover:bg-gold-50 dark:hover:bg-gold-500/10"
            >
              <Icon className="h-4 w-4 shrink-0 text-gold-600 dark:text-gold-400" />
              <span className="flex-1">{suggestion.label}</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

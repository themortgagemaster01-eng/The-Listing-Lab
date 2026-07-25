"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mic, Sparkles } from "lucide-react";

import { DURATIONS_S } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import { commandBarSuggestions } from "@/lib/mock-data";

interface SearchCommandBarProps {
  className?: string;
}

/**
 * The visual centerpiece of the dashboard: a large hero AI command input
 * with a soft gold glow border. On focus it drops a panel of example
 * command chips; clicking one just populates the input (mock/demo
 * interaction — no command is actually executed). This is the elevated
 * hero search/command bar — not to be confused with the smaller
 * `AICommandWidget` sidebar panel.
 */
export function SearchCommandBar({ className }: SearchCommandBarProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [value, setValue] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
      if (event.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSuggestionClick(label: string) {
    setValue(label);
    setIsOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Gradient border wrapper: 1.5px padding creates the glowing border illusion */}
      <div className="rounded-3xl bg-gradient-to-r from-gold-400/70 via-gold-200/40 to-gold-500/70 p-[1.5px] shadow-gold-glow">
        <div
          className={cn(
            "flex items-center gap-3 rounded-3xl bg-surface px-5 py-4 transition-shadow sm:px-7 sm:py-5",
            isOpen && "shadow-soft-lg"
          )}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 text-white sm:h-12 sm:w-12">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder="What would you like to create today?"
            className="h-full flex-1 bg-transparent text-base font-medium text-foreground placeholder:text-muted-foreground/80 placeholder:font-normal focus:outline-none sm:text-lg"
          />

          <span className="hidden shrink-0 items-center rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground sm:inline-flex">
            ⌘K
          </span>
          <button
            type="button"
            aria-label="Voice input"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:hidden"
          >
            <Mic className="h-4 w-4" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: DURATIONS_S.fast }}
            className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-2xl border border-border bg-surface p-2 shadow-soft-lg"
          >
            <p className="px-3 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Try asking
            </p>
            {commandBarSuggestions.map((suggestion) => {
              const Icon = suggestion.icon;
              return (
                <button
                  key={suggestion.id}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSuggestionClick(suggestion.label)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-gold-50 dark:hover:bg-gold-500/10"
                >
                  <Icon className="h-4 w-4 shrink-0 text-gold-600 dark:text-gold-400" />
                  <span className="flex-1">{suggestion.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

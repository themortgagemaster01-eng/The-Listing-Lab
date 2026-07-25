"use client";

import * as React from "react";
import { Mic, Search } from "lucide-react";

import { cn } from "@/lib/utils";

interface CommandBarProps {
  className?: string;
  /** Show the trailing mic icon (mobile) instead of the ⌘K hint pill (desktop). */
  variant?: "desktop" | "mobile";
}

/**
 * Prominent pill input used to kick off AI generation flows. Supports
 * Cmd/Ctrl+K to focus from anywhere on the page.
 */
export function CommandBar({ className, variant = "desktop" }: CommandBarProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      className={cn(
        "flex h-12 w-full items-center gap-2 rounded-full border border-border bg-surface px-4 shadow-soft transition-shadow focus-within:shadow-soft-lg focus-within:ring-2 focus-within:ring-gold-400/60",
        className
      )}
    >
      <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
      <input
        ref={inputRef}
        type="text"
        placeholder="What would you like to create today?"
        className="h-full flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
      {variant === "desktop" ? (
        <span className="hidden shrink-0 items-center rounded-full border border-border bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground sm:inline-flex">
          ⌘K
        </span>
      ) : (
        <button
          type="button"
          aria-label="Voice input"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Mic className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

"use client";

import { Check, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface FlyerAutoSaveIndicatorProps {
  status: SaveStatus;
  className?: string;
}

/**
 * Small, understated auto-save indicator (Phase 2 spec item #2 — "Saved" /
 * "Saving…", no explicit save button). Deliberately not a toast: it should
 * read as ambient status, not an interruption, per the
 * Apple/Linear/Notion restraint called for in `docs/DESIGN_RULES.md`.
 */
export function FlyerAutoSaveIndicator({ status, className }: FlyerAutoSaveIndicatorProps) {
  if (status === "idle") return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium transition-colors duration-fast",
        status === "error" ? "text-red-500" : "text-muted-foreground",
        className
      )}
    >
      {status === "saving" && (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          Saving…
        </>
      )}
      {status === "saved" && (
        <>
          <Check className="h-3 w-3 text-success" />
          Saved
        </>
      )}
      {status === "error" && "Couldn't save — retrying"}
    </span>
  );
}

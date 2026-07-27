"use client";

import { Check } from "lucide-react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { cn } from "@/lib/utils";
import type { BrandCompletion } from "@/lib/brand/types";

interface BrandCompletionPanelProps {
  completion: BrandCompletion;
  activeSection: string;
  onSelectSection: (key: string) => void;
}

/**
 * Live completion checklist — overall percentage + a checkbox-style row per
 * section, each showing "x / y filled". Renders WHILE the Realtor fills the
 * form out (not just on a summary screen afterward), per Robert's explicit
 * "the payoff needs to be obvious in the moment" note. Clicking a section
 * jumps the form to it.
 */
export function BrandCompletionPanel({ completion, activeSection, onSelectSection }: BrandCompletionPanelProps) {
  return (
    <DashboardCard title="Profile Complete">
      <div className="mb-5">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-navy-800 dark:text-white">{completion.overallPercent}%</span>
          <span className="text-xs text-muted-foreground">
            {completion.filledFields} of {completion.totalFields} fields
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gold-500 transition-all duration-base"
            style={{ width: `${completion.overallPercent}%` }}
          />
        </div>
      </div>

      <div className="space-y-1">
        {completion.sections.map((section) => {
          const done = section.filled === section.total && section.total > 0;
          const isActive = section.key === activeSection;
          return (
            <button
              key={section.key}
              type="button"
              onClick={() => onSelectSection(section.key)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                isActive ? "bg-gold-50 dark:bg-gold-500/10" : "hover:bg-muted"
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2",
                  done
                    ? "border-gold-500 bg-gold-500 text-white"
                    : "border-border bg-surface text-transparent"
                )}
              >
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
              <span className="flex-1 text-sm font-medium text-foreground">{section.label}</span>
              <span className="text-xs text-muted-foreground">
                {section.filled}/{section.total}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-5 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
        Every flyer, website, CMA, and mortgage report will automatically use this branding.
      </p>
    </DashboardCard>
  );
}

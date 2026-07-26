"use client";

import { cn } from "@/lib/utils";

export interface SegmentOption<T extends string = string> {
  id: T;
  label: string;
}

interface TabSegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/**
 * Small pill-style segmented control used to switch between folded
 * sub-sections within a single Property Workspace tab (Photos ↔ AI Enhance
 * ↔ Virtual Staging, Flyers ↔ Property Website, Payments ↔ Closing Costs,
 * Documents ↔ Buyer Packet ↔ Seller Packet) without adding more top-level
 * routes.
 */
export function TabSegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: TabSegmentedControlProps<T>) {
  return (
    <div
      className={cn(
        "inline-flex flex-wrap gap-1 rounded-2xl border border-border bg-surface p-1 shadow-soft",
        className
      )}
    >
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={cn(
            "rounded-xl px-3.5 py-2 text-sm font-medium transition-colors duration-fast",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            value === option.id
              ? "bg-navy-950 text-white dark:bg-gold-500 dark:text-navy-950"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

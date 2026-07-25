"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export interface TemplateOption {
  id: string;
  name: string;
  description: string;
  swatchClass: string;
}

interface TemplateGalleryCardProps {
  template: TemplateOption;
  selected: boolean;
  onSelect: () => void;
}

/** A single selectable template-style card used by Flyers / Social Posts / Property Website. */
export function TemplateGalleryCard({ template, selected, onSelect }: TemplateGalleryCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border p-4 text-left transition-colors",
        selected
          ? "border-gold-400 bg-gold-50 shadow-soft dark:bg-gold-500/10"
          : "border-border bg-surface hover:border-gold-300"
      )}
    >
      <div className={cn("h-20 w-full rounded-xl", template.swatchClass)} />
      <div className="mt-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">{template.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{template.description}</p>
        </div>
        {selected && (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-500 text-white">
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
        )}
      </div>
    </motion.button>
  );
}

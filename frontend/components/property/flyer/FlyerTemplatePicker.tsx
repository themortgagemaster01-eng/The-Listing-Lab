"use client";

import { Check } from "lucide-react";

import { FlyerLivePreview } from "@/components/property/flyer/FlyerLivePreview";
import { FLYER_TEMPLATES, type FlyerPhoto, type PropertyFormData } from "@/lib/flyer/types";
import type { FlyerTemplate, FlyerTextContent } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

interface FlyerTemplatePickerProps {
  selected: FlyerTemplate;
  onSelect: (template: FlyerTemplate) => void;
  form: PropertyFormData;
  photos: FlyerPhoto[];
  text: FlyerTextContent | null;
}

/**
 * Template gallery (Phase 2 spec item #5) — three real, distinct layouts
 * (Luxury / Modern / Classic, see `FlyerLivePreview.tsx`), each thumbnail
 * rendered with the property's actual photos + generated copy rather than
 * a generic swatch.
 */
export function FlyerTemplatePicker({ selected, onSelect, form, photos, text }: FlyerTemplatePickerProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {FLYER_TEMPLATES.map((template) => {
        const isSelected = template.id === selected;
        return (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template.id)}
            className={cn(
              "relative overflow-hidden rounded-2xl border p-3 text-left transition-colors",
              isSelected ? "border-gold-400 bg-gold-50 shadow-soft dark:bg-gold-500/10" : "border-border bg-surface hover:border-gold-300"
            )}
          >
            <FlyerLivePreview template={template.id} form={form} photos={photos} text={text} />
            <div className="mt-3 flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-foreground">{template.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{template.description}</p>
              </div>
              {isSelected && (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-500 text-white">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

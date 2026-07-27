"use client";

import * as React from "react";
import { X } from "lucide-react";

import { Input } from "@/components/ui/input";

interface TagListInputProps {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}

/**
 * Generic chip/tag input — type a value, press Enter (or blur the field) to
 * add it as a removable chip. Extracted from the `KeyFeaturesInput` pattern
 * in `components/property/flyer/FlyerPropertyForm.tsx` and generalized (no
 * hardcoded "feature" wording) for reuse across Brand Center's several
 * array fields (designations, languages, service areas, license states).
 */
export function TagListInput({ values, onChange, placeholder }: TagListInputProps) {
  const [draft, setDraft] = React.useState("");

  function addValue() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (values.includes(trimmed)) {
      setDraft("");
      return;
    }
    onChange([...values, trimmed]);
    setDraft("");
  }

  return (
    <div>
      {values.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {values.map((value) => (
            <span
              key={value}
              className="inline-flex items-center gap-1.5 rounded-full bg-gold-50 px-3 py-1.5 text-xs font-medium text-gold-600 dark:bg-gold-500/10 dark:text-gold-400"
            >
              {value}
              <button
                type="button"
                onClick={() => onChange(values.filter((v) => v !== value))}
                className="rounded-full p-0.5 hover:bg-gold-200/60 dark:hover:bg-gold-500/20"
                aria-label={`Remove ${value}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            addValue();
          }
        }}
        onBlur={addValue}
        placeholder={placeholder}
      />
    </div>
  );
}

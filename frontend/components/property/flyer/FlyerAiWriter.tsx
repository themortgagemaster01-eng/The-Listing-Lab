"use client";

import * as React from "react";
import { AlertTriangle, Plus, RefreshCw, Sparkles, X } from "lucide-react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FlyerTextContent } from "@/lib/supabase/types";

export type AiWriterStatus = "idle" | "loading" | "ready" | "error";

interface FlyerAiWriterProps {
  status: AiWriterStatus;
  text: FlyerTextContent | null;
  errorMessage?: string | null;
  onGenerate: () => void;
  onChange: (next: FlyerTextContent) => void;
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="flex w-full resize-y rounded-xl border border-border bg-surface px-4 py-2.5 text-sm leading-relaxed text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:border-gold-400"
      />
    </div>
  );
}

/**
 * AI writing step (Phase 2 spec item #4). Calls into
 * `/api/ai/generate-flyer-text` (via the parent wizard, which owns the
 * fetch + persistence) and renders every field of the result — headline,
 * luxury headline, description, feature bullets, neighborhood highlights,
 * call to action — as editable inputs pre-filled with the AI output, plus
 * a Regenerate affordance and a friendly retry-able error state.
 */
export function FlyerAiWriter({ status, text, errorMessage, onGenerate, onChange }: FlyerAiWriterProps) {
  function set<K extends keyof FlyerTextContent>(key: K, value: FlyerTextContent[K]) {
    if (!text) return;
    onChange({ ...text, [key]: value });
  }

  function setBullet(index: number, value: string) {
    if (!text) return;
    const next = [...text.featureBullets];
    next[index] = value;
    set("featureBullets", next);
  }

  function removeBullet(index: number) {
    if (!text) return;
    set(
      "featureBullets",
      text.featureBullets.filter((_, i) => i !== index)
    );
  }

  function addBullet() {
    if (!text) return;
    set("featureBullets", [...text.featureBullets, ""]);
  }

  return (
    <DashboardCard
      title="AI Listing Copy"
      action={
        text
          ? {
              label: status === "loading" ? "Regenerating…" : "Regenerate",
              onClick: status === "loading" ? undefined : onGenerate,
            }
          : undefined
      }
      contentClassName="mt-4"
    >
      {status === "loading" && !text && (
        <div className="space-y-3">
          <LoadingSkeleton className="h-8 w-2/3 rounded-lg" />
          <LoadingSkeleton className="h-24 w-full rounded-lg" />
          <LoadingSkeleton className="h-4 w-full rounded-lg" />
          <LoadingSkeleton className="h-4 w-5/6 rounded-lg" />
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-red-200 bg-red-50/60 px-6 py-10 text-center dark:border-red-500/20 dark:bg-red-500/5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-500 dark:bg-red-500/15">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Couldn&apos;t generate copy right now</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {errorMessage || "Something went wrong talking to the AI service. Your property details are safe — just try again."}
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={onGenerate}>
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      )}

      {status === "idle" && !text && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-background px-6 py-10 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold-100 text-gold-600 dark:bg-gold-500/15 dark:text-gold-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Let AI write your flyer copy</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Generates a headline, a luxury alternative, description, feature bullets, neighborhood highlights, and a call to action from the property details you entered.
            </p>
          </div>
          <Button type="button" variant="gold" onClick={onGenerate}>
            <Sparkles className="h-4 w-4" />
            Generate AI Copy
          </Button>
        </div>
      )}

      {text && (
        <div className="space-y-5">
          {status === "loading" && (
            <p className="flex items-center gap-2 text-xs font-medium text-gold-600 dark:text-gold-400">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              Regenerating — your current copy stays until the new version is ready.
            </p>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Headline</label>
              <Input value={text.headline} onChange={(e) => set("headline", e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Luxury Headline</label>
              <Input value={text.luxuryHeadline} onChange={(e) => set("luxuryHeadline", e.target.value)} />
            </div>
          </div>

          <TextAreaField label="Description" value={text.description} onChange={(v) => set("description", v)} rows={4} />

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Feature Bullets</label>
            <div className="space-y-2">
              {text.featureBullets.map((bullet, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={bullet} onChange={(e) => setBullet(i, e.target.value)} />
                  <button
                    type="button"
                    onClick={() => removeBullet(i)}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Remove bullet"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addBullet}
                className="flex items-center gap-1.5 text-xs font-semibold text-navy-700 hover:underline dark:text-gold-400"
              >
                <Plus className="h-3.5 w-3.5" />
                Add bullet
              </button>
            </div>
          </div>

          <TextAreaField
            label="Neighborhood Highlights"
            value={text.neighborhoodHighlights}
            onChange={(v) => set("neighborhoodHighlights", v)}
            rows={2}
          />

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Call to Action</label>
            <Input value={text.callToAction} onChange={(e) => set("callToAction", e.target.value)} />
          </div>
        </div>
      )}
    </DashboardCard>
  );
}

"use client";

import { FileText, Plus } from "lucide-react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { FLYER_TEMPLATES, resolveFlyerText, type FlyerPhoto, type FlyerRecord } from "@/lib/flyer/types";
import { cn } from "@/lib/utils";

interface SavedFlyersListProps {
  flyers: FlyerRecord[];
  photos: FlyerPhoto[];
  activeFlyerId: string | null;
  onOpen: (flyerId: string) => void;
  onNew: () => void;
}

function templateLabel(id: FlyerRecord["template"]) {
  return FLYER_TEMPLATES.find((t) => t.id === id)?.name ?? id;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

/**
 * Marketing Assets → Flyers list (Phase 2 spec item #7) — every generated
 * flyer shows up here as a card with a thumbnail; clicking reopens the
 * wizard with everything (property details, photos, AI copy, template)
 * exactly as left, without re-uploading or regenerating anything.
 */
export function SavedFlyersList({ flyers, photos, activeFlyerId, onOpen, onNew }: SavedFlyersListProps) {
  const cover = [...photos].sort((a, b) => {
    if (a.isCover !== b.isCover) return a.isCover ? -1 : 1;
    return a.displayOrder - b.displayOrder;
  })[0];

  return (
    <DashboardCard
      title="Flyers"
      action={{ label: "New Flyer", onClick: onNew }}
      contentClassName="mt-4"
    >
      {flyers.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No flyers generated yet"
          description="Create your first AI-written flyer for this listing — pick a template, generate copy, and export a print-ready PDF."
          actionLabel="Create Flyer"
          onAction={onNew}
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {flyers.map((flyer) => {
            const text = resolveFlyerText(flyer);
            return (
              <button
                key={flyer.id}
                type="button"
                onClick={() => onOpen(flyer.id)}
                className={cn(
                  "group flex flex-col overflow-hidden rounded-2xl border text-left transition-colors",
                  flyer.id === activeFlyerId ? "border-gold-400 shadow-soft" : "border-border hover:border-gold-300"
                )}
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-navy-100">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover.url} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : null}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/90 to-transparent p-2.5">
                    <p className="truncate text-xs font-semibold text-white">{templateLabel(flyer.template)}</p>
                  </div>
                  <span className="absolute right-2 top-2 rounded-full bg-navy-950/80 px-2 py-0.5 text-[10px] font-medium text-gold-400">
                    v{flyer.version}
                  </span>
                </div>
                <div className="p-3">
                  <p className="truncate text-xs font-semibold text-foreground">{text?.headline || flyer.title}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">Updated {formatDate(flyer.updatedAt)}</p>
                </div>
              </button>
            );
          })}
          <button
            type="button"
            onClick={onNew}
            className="flex aspect-[4/5] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-background text-center transition-colors hover:border-gold-400 hover:bg-gold-50 dark:hover:bg-gold-500/5"
          >
            <Plus className="h-5 w-5 text-muted-foreground" />
            <span className="px-3 text-xs font-medium text-muted-foreground">New Flyer</span>
          </button>
        </div>
      )}
      <div className="mt-3 sm:hidden">
        <Button type="button" variant="outline" size="sm" onClick={onNew} className="w-full">
          <Plus className="h-4 w-4" />
          New Flyer
        </Button>
      </div>
    </DashboardCard>
  );
}

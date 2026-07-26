"use client";

import { Download, FileText, type LucideIcon } from "lucide-react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ComingSoonButton } from "@/components/property/ComingSoonButton";

export interface GeneratedDoc {
  id: string;
  title: string;
  date: string;
  sizeLabel: string;
  icon: LucideIcon;
  iconBadgeClass: string;
}

interface GeneratedDocListProps {
  title: string;
  docs: GeneratedDoc[];
}

/** Styled "generated document" list used by Buyer Packet, Seller Packet, and Documents. */
export function GeneratedDocList({ title, docs }: GeneratedDocListProps) {
  return (
    <DashboardCard title={title} action={{ label: `${docs.length} files` }}>
      {docs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents generated yet"
          description="Generated files for this section will show up here."
        />
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
          {docs.map((doc) => {
            const Icon = doc.icon;
            return (
              <div key={doc.id} className="flex items-center gap-3 bg-background px-4 py-3.5">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${doc.iconBadgeClass}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{doc.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Generated {doc.date} · {doc.sizeLabel}
                  </p>
                </div>
                <ComingSoonButton
                  variant="ghost"
                  size="sm"
                  icon={Download}
                  message="Download is coming soon"
                  aria-label={`Download ${doc.title}`}
                />
              </div>
            );
          })}
        </div>
      )}
    </DashboardCard>
  );
}

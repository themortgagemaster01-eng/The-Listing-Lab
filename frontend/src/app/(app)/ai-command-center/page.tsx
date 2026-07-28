import type { Metadata } from "next";
import { Sparkles, Wand2, FileSpreadsheet, Instagram, CreditCard } from "lucide-react";

import { DashboardCard } from "@/components/shared/DashboardCard";

export const metadata: Metadata = {
  title: "AI Command Center | Realtor Toolbox",
};

const previewCapabilities = [
  {
    icon: FileSpreadsheet,
    title: "Multi-asset generation",
    description: "Queue flyers, social posts, and websites from a single prompt.",
  },
  {
    icon: Wand2,
    title: "Guided AI staging",
    description: "Describe a room and get styled staging options back instantly.",
  },
  {
    icon: Instagram,
    title: "Campaign scheduling",
    description: "Plan a full social rollout for a listing in one conversation.",
  },
  {
    icon: CreditCard,
    title: "Financial snapshots",
    description: "Ask for payment or closing cost sheets in plain English.",
  },
];

/** Simple, on-brand "coming soon" placeholder for the full AI Command Center. */
export default function AiCommandCenterPage() {
  return (
    <div className="animate-fade-slide-in space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-navy-800 dark:text-white">
          AI Command Center
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          One place to direct every AI generation across your Property Labs.
        </p>
      </div>

      <DashboardCard className="overflow-hidden p-0">
        <div className="relative flex flex-col items-center gap-4 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 px-6 py-16 text-center sm:px-10">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-gold-400/10 blur-3xl" />
            <div className="absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-gold-500/10 blur-3xl" />
          </div>

          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 text-white shadow-gold-glow">
            <Sparkles className="h-8 w-8" />
          </div>
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
              Coming Soon
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
              The full Command Center is on its way
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-navy-100/80">
              Soon you&apos;ll be able to direct every AI generation — flyers, staging, social,
              payments, and more — from one conversation. For now, the hero command bar on your
              Dashboard is the fastest way to kick off a request.
            </p>
          </div>
        </div>
      </DashboardCard>

      <div>
        <h3 className="text-lg font-semibold text-foreground">What&apos;s coming</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {previewCapabilities.map((capability) => {
            const Icon = capability.icon;
            return (
              <DashboardCard key={capability.title}>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-600 dark:bg-gold-500/15 dark:text-gold-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{capability.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{capability.description}</p>
                  </div>
                </div>
              </DashboardCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}

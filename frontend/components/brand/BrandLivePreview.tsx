"use client";

import { Facebook, Globe, Instagram, Linkedin, Mail, Phone, Youtube } from "lucide-react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { getInitials } from "@/lib/utils";
import type { BrandProfileFormData } from "@/lib/brand/types";

interface BrandLivePreviewProps {
  name: string;
  form: BrandProfileFormData;
}

const SOCIAL_LINKS: { key: keyof BrandProfileFormData; icon: typeof Facebook }[] = [
  { key: "facebookUrl", icon: Facebook },
  { key: "instagramUrl", icon: Instagram },
  { key: "linkedinUrl", icon: Linkedin },
  { key: "youtubeUrl", icon: Youtube },
];

/**
 * A live, always-visible preview of how this profile will render as the
 * branding footer on a generated asset (flyer / website / report) — updates
 * on every keystroke so the payoff of filling in Brand Center is visible in
 * the moment, not just after saving. Deliberately a simplified mock-up
 * (not pixel-identical to any one asset's real footer) since several of
 * those asset templates don't read from Brand Center yet.
 */
export function BrandLivePreview({ name, form }: BrandLivePreviewProps) {
  const hasSocial = SOCIAL_LINKS.some(({ key }) => form[key]);

  return (
    <DashboardCard title="Live Preview" className="sticky top-6">
      <p className="mb-4 text-xs text-muted-foreground">
        How your branding will appear on every flyer, website, and report.
      </p>

      <div className="rounded-2xl border border-border bg-navy-950 p-5 text-white shadow-soft">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-navy-800 text-sm font-semibold text-gold-400">
            {form.headshotUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.headshotUrl} alt={name} className="h-full w-full object-cover" />
            ) : (
              getInitials(name || "Your Name")
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{name || "Your Name"}</p>
            <p className="truncate text-xs text-navy-200">
              {form.brokerageName || "Your Brokerage"}
            </p>
            {form.designations.length > 0 && (
              <p className="mt-0.5 truncate text-[11px] font-medium text-gold-400">
                {form.designations.join(" · ")}
              </p>
            )}
          </div>
          {form.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.logoUrl} alt="Brokerage logo" className="ml-auto h-8 w-8 shrink-0 object-contain" />
          )}
        </div>

        <div className="mt-4 space-y-1.5 border-t border-white/10 pt-4 text-xs text-navy-100">
          {form.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 shrink-0 text-gold-400" />
              <span className="truncate">{form.phone}</span>
            </div>
          )}
          {form.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 shrink-0 text-gold-400" />
              <span className="truncate">{form.email}</span>
            </div>
          )}
          {form.website && (
            <div className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 shrink-0 text-gold-400" />
              <span className="truncate">{form.website}</span>
            </div>
          )}
          {!form.phone && !form.email && !form.website && (
            <p className="text-navy-300/70">Add contact info to see it here.</p>
          )}
        </div>

        {form.nmlsNumber && (
          <p className="mt-3 text-[10px] text-navy-300/80">
            NMLS #{form.nmlsNumber}
            {form.mortgageCompany ? ` · ${form.mortgageCompany}` : ""}
          </p>
        )}

        {hasSocial && (
          <div className="mt-3 flex gap-2 border-t border-white/10 pt-3">
            {SOCIAL_LINKS.filter(({ key }) => form[key]).map(({ key, icon: Icon }) => (
              <span key={key} className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                <Icon className="h-3.5 w-3.5 text-gold-400" />
              </span>
            ))}
          </div>
        )}
      </div>

      {form.bio && (
        <p className="mt-4 line-clamp-4 text-xs leading-relaxed text-muted-foreground">{form.bio}</p>
      )}
    </DashboardCard>
  );
}

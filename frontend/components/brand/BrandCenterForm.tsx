"use client";

import * as React from "react";
import { Camera, Image as ImageIcon, PenTool } from "lucide-react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TagListInput } from "@/components/brand/TagListInput";
import { BrandCompletionPanel } from "@/components/brand/BrandCompletionPanel";
import { BrandLivePreview } from "@/components/brand/BrandLivePreview";
import { FlyerAutoSaveIndicator } from "@/components/property/flyer/FlyerAutoSaveIndicator";
import { useDebouncedSave } from "@/lib/hooks/use-debounced-save";
import { resizeImageFile } from "@/lib/flyer/image-resize";
import { loadBrandProfile, saveBrandProfile, uploadBrandAsset } from "@/lib/brand/persistence";
import { BRAND_SECTIONS, computeBrandCompletion, emptyBrandProfileForm, type BrandProfileFormData } from "@/lib/brand/types";
import { cn } from "@/lib/utils";

const labelClass = "mb-1.5 block text-xs font-medium text-muted-foreground";

interface FieldProps {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}

function Field({ label, hint, className, children }: FieldProps) {
  return (
    <div className={className}>
      <label className={labelClass}>{label}</label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

interface ImageUploadSlotProps {
  label: string;
  value: string;
  onUpload: (dataUrl: string) => void;
  icon: React.ComponentType<{ className?: string }>;
  shape?: "circle" | "square";
}

function ImageUploadSlot({ label, value, onUpload, icon: Icon, shape = "square" }: ImageUploadSlotProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError(null);
    try {
      const resized = await resizeImageFile(file, { maxDimension: 800, quality: 0.9 });
      onUpload(resized.dataUrl);
    } catch {
      setError("Couldn't read that image — try another file.");
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex h-20 w-20 items-center justify-center overflow-hidden border-2 border-dashed border-border bg-background text-muted-foreground transition-colors hover:border-gold-400",
          shape === "circle" ? "rounded-full" : "rounded-2xl",
          value && "border-solid border-border"
        )}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt={label} className="h-full w-full object-cover" />
        ) : (
          <Icon className="h-6 w-6" />
        )}
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <span className="text-[11px] text-muted-foreground">{label}</span>
      {error && <span className="text-[11px] text-red-500">{error}</span>}
    </div>
  );
}

interface BrandCenterFormProps {
  /** The signed-in user's display name, sourced from auth (see `src/lib/supabase/session.ts`) — not editable here since it's set at sign-up. Used by the live preview only. */
  userName: string;
}

/**
 * Brand Center (V1): a one-time-setup, always-editable profile of the
 * Realtor/Loan Officer's branding, split into 4 sections (Professional
 * Identity, Contact, Mortgage-optional, Social). Auto-saves via the same
 * debounce pattern as the Flyer Generator's property form
 * (`useDebouncedSave`) — no explicit Save button.
 *
 * Per Robert's explicit refinement: the completion checklist and live
 * preview render ALONGSIDE the form (not after it), so the payoff of
 * filling a field in is visible the moment it's typed, not just on a
 * summary screen.
 */
export function BrandCenterForm({ userName }: BrandCenterFormProps) {
  const [form, setForm] = React.useState<BrandProfileFormData>(emptyBrandProfileForm());
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeSection, setActiveSection] = React.useState<string>("identity");

  React.useEffect(() => {
    let cancelled = false;
    loadBrandProfile().then((loaded) => {
      if (!cancelled) {
        setForm(loaded);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const saveStatus = useDebouncedSave(form, saveBrandProfile, { enabled: !isLoading });
  const completion = computeBrandCompletion(form);

  function set<K extends keyof BrandProfileFormData>(key: K, value: BrandProfileFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleImageUpload(field: "headshotUrl" | "logoUrl" | "signatureUrl", dataUrl: string) {
    // Show the local preview immediately, then swap in the hosted URL once
    // the upload resolves (or keep the data URL if Supabase isn't
    // configured / the upload fails — `uploadBrandAsset` always resolves).
    set(field, dataUrl);
    const hostedUrl = await uploadBrandAsset(field, dataUrl);
    setForm((prev) => (prev[field] === dataUrl ? { ...prev, [field]: hostedUrl } : prev));
  }

  function scrollToSection(key: string) {
    setActiveSection(key);
    document.getElementById(`brand-section-${key}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start lg:gap-8">
      <div className="space-y-6 lg:col-span-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-navy-800 dark:text-white">Brand Center</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Set this up once — every generated asset pulls your branding from here.
            </p>
          </div>
          <FlyerAutoSaveIndicator status={saveStatus} />
        </div>

        {/* Professional Identity */}
        <div id="brand-section-identity" className="scroll-mt-6" onFocusCapture={() => setActiveSection("identity")}>
        <DashboardCard title={BRAND_SECTIONS[0]!.label} contentClassName="space-y-5">
          <div className="flex flex-wrap gap-6">
            <ImageUploadSlot
              label="Headshot"
              value={form.headshotUrl}
              onUpload={(dataUrl) => handleImageUpload("headshotUrl", dataUrl)}
              icon={Camera}
              shape="circle"
            />
            <ImageUploadSlot
              label="Logo"
              value={form.logoUrl}
              onUpload={(dataUrl) => handleImageUpload("logoUrl", dataUrl)}
              icon={ImageIcon}
            />
            <ImageUploadSlot
              label="Signature"
              value={form.signatureUrl}
              onUpload={(dataUrl) => handleImageUpload("signatureUrl", dataUrl)}
              icon={PenTool}
            />
          </div>

          <Field label="Bio">
            <Textarea
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
              placeholder="A couple sentences buyers and sellers will see on your listing websites."
              rows={4}
            />
          </Field>

          <Field label="Brokerage">
            <Input
              value={form.brokerageName}
              onChange={(e) => set("brokerageName", e.target.value)}
              placeholder="Movement Mortgage"
            />
          </Field>

          <Field label="Designations" hint="e.g. ABR, CRS, SRES">
            <TagListInput
              values={form.designations}
              onChange={(next) => set("designations", next)}
              placeholder="Type a designation, press Enter"
            />
          </Field>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Languages Spoken">
              <TagListInput
                values={form.languages}
                onChange={(next) => set("languages", next)}
                placeholder="Type a language, press Enter"
              />
            </Field>
            <Field label="Service Areas">
              <TagListInput
                values={form.serviceAreas}
                onChange={(next) => set("serviceAreas", next)}
                placeholder="Type a neighborhood/area, press Enter"
              />
            </Field>
          </div>
        </DashboardCard>
        </div>

        {/* Contact */}
        <div id="brand-section-contact" className="scroll-mt-6" onFocusCapture={() => setActiveSection("contact")}>
        <DashboardCard title={BRAND_SECTIONS[1]!.label} contentClassName="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Phone">
            <Input
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="(555) 123-4567"
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="you@realty.com"
            />
          </Field>
          <Field label="Website">
            <Input
              type="url"
              value={form.website}
              onChange={(e) => set("website", e.target.value)}
              placeholder="https://yoursite.com"
            />
          </Field>
          <Field label="Booking Link">
            <Input
              type="url"
              value={form.bookingLink}
              onChange={(e) => set("bookingLink", e.target.value)}
              placeholder="https://calendly.com/you"
            />
          </Field>
        </DashboardCard>
        </div>

        {/* Mortgage (optional) */}
        <div id="brand-section-mortgage" className="scroll-mt-6" onFocusCapture={() => setActiveSection("mortgage")}>
        <DashboardCard title={BRAND_SECTIONS[2]!.label} contentClassName="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="NMLS #">
            <Input value={form.nmlsNumber} onChange={(e) => set("nmlsNumber", e.target.value)} placeholder="1234567" />
          </Field>
          <Field label="Mortgage Company">
            <Input
              value={form.mortgageCompany}
              onChange={(e) => set("mortgageCompany", e.target.value)}
              placeholder="Movement Mortgage"
            />
          </Field>
          <Field label="Application Link">
            <Input
              type="url"
              value={form.applicationUrl}
              onChange={(e) => set("applicationUrl", e.target.value)}
              placeholder="https://apply.movement.com/you"
            />
          </Field>
          <Field label="Licensed States" hint="e.g. NY, NJ, CT" className="sm:col-span-2">
            <TagListInput
              values={form.licenseStates}
              onChange={(next) => set("licenseStates", next)}
              placeholder="Type a state, press Enter"
            />
          </Field>
        </DashboardCard>
        </div>

        {/* Social */}
        <div id="brand-section-social" className="scroll-mt-6" onFocusCapture={() => setActiveSection("social")}>
        <DashboardCard title={BRAND_SECTIONS[3]!.label} contentClassName="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Facebook">
            <Input
              type="url"
              value={form.facebookUrl}
              onChange={(e) => set("facebookUrl", e.target.value)}
              placeholder="https://facebook.com/you"
            />
          </Field>
          <Field label="Instagram">
            <Input
              type="url"
              value={form.instagramUrl}
              onChange={(e) => set("instagramUrl", e.target.value)}
              placeholder="https://instagram.com/you"
            />
          </Field>
          <Field label="LinkedIn">
            <Input
              type="url"
              value={form.linkedinUrl}
              onChange={(e) => set("linkedinUrl", e.target.value)}
              placeholder="https://linkedin.com/in/you"
            />
          </Field>
          <Field label="YouTube">
            <Input
              type="url"
              value={form.youtubeUrl}
              onChange={(e) => set("youtubeUrl", e.target.value)}
              placeholder="https://youtube.com/@you"
            />
          </Field>
        </DashboardCard>
        </div>
      </div>

      <div className="space-y-6 lg:sticky lg:top-6">
        <BrandCompletionPanel completion={completion} activeSection={activeSection} onSelectSection={scrollToSection} />
        <BrandLivePreview name={userName} form={form} />
      </div>
    </div>
  );
}

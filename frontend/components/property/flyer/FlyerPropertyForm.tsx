"use client";

import * as React from "react";
import { Camera, Plus, X } from "lucide-react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { Input } from "@/components/ui/input";
import { FlyerAutoSaveIndicator, type SaveStatus } from "@/components/property/flyer/FlyerAutoSaveIndicator";
import { resizeImageFile } from "@/lib/flyer/image-resize";
import type { PropertyFormData } from "@/lib/flyer/types";
import { cn } from "@/lib/utils";

const PROPERTY_TYPES = [
  "Single Family",
  "Condo",
  "Townhouse",
  "Multi-Family",
  "Land",
  "Luxury Estate",
];

const selectClass =
  "flex h-11 w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:border-gold-400";

const labelClass = "mb-1.5 block text-xs font-medium text-muted-foreground";

interface FieldProps {
  label: string;
  className?: string;
  children: React.ReactNode;
}

function Field({ label, className, children }: FieldProps) {
  return (
    <div className={className}>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

function KeyFeaturesInput({
  features,
  onChange,
}: {
  features: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = React.useState("");

  function addFeature() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (features.includes(trimmed)) {
      setDraft("");
      return;
    }
    onChange([...features, trimmed]);
    setDraft("");
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {features.map((feature) => (
          <span
            key={feature}
            className="inline-flex items-center gap-1.5 rounded-full bg-gold-50 px-3 py-1.5 text-xs font-medium text-gold-600 dark:bg-gold-500/10 dark:text-gold-400"
          >
            {feature}
            <button
              type="button"
              onClick={() => onChange(features.filter((f) => f !== feature))}
              className="rounded-full p-0.5 hover:bg-gold-200/60 dark:hover:bg-gold-500/20"
              aria-label={`Remove ${feature}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addFeature();
            }
          }}
          placeholder="e.g. Chef's Kitchen, Pool, Home Office"
          className="flex-1"
        />
        <button
          type="button"
          onClick={addFeature}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-foreground transition-colors hover:bg-muted"
          aria-label="Add feature"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

interface FlyerPropertyFormProps {
  form: PropertyFormData;
  onChange: (next: PropertyFormData) => void;
  saveStatus: SaveStatus;
}

/** Property information form — Phase 2 spec item #2. Every field auto-saves via the parent's debounced persistence; there is no explicit Save button. */
export function FlyerPropertyForm({ form, onChange, saveStatus }: FlyerPropertyFormProps) {
  const agentPhotoInputRef = React.useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = React.useState<string | null>(null);

  function set<K extends keyof PropertyFormData>(key: K, value: PropertyFormData[K]) {
    onChange({ ...form, [key]: value });
  }

  async function handleAgentPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      setPhotoError(null);
      const resized = await resizeImageFile(file, { maxDimension: 512, quality: 0.85 });
      set("agentPhotoUrl", resized.dataUrl);
    } catch {
      setPhotoError("Couldn't process that photo — try a different file.");
    }
  }

  return (
    <DashboardCard
      title="Property Details"
      className="relative"
      contentClassName="mt-4 space-y-6"
    >
      <div className="absolute right-5 top-5">
        <FlyerAutoSaveIndicator status={saveStatus} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Street Address" className="sm:col-span-2">
          <Input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="123 Main Street" />
        </Field>
        <Field label="City, State ZIP">
          <Input
            value={form.cityStateZip}
            onChange={(e) => set("cityStateZip", e.target.value)}
            placeholder="Mahopac, NY 10541"
          />
        </Field>
        <Field label="MLS #">
          <Input value={form.mlsNumber} onChange={(e) => set("mlsNumber", e.target.value)} placeholder="H6312045" />
        </Field>

        <Field label="Price">
          <Input
            inputMode="numeric"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            placeholder="725000"
          />
        </Field>
        <Field label="Property Type">
          <select
            className={selectClass}
            value={form.propertyType}
            onChange={(e) => set("propertyType", e.target.value)}
          >
            <option value="">Select a type…</option>
            {PROPERTY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Bedrooms">
          <Input inputMode="numeric" value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} placeholder="4" />
        </Field>
        <Field label="Bathrooms">
          <Input inputMode="numeric" value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} placeholder="3" />
        </Field>
        <Field label="Square Feet">
          <Input inputMode="numeric" value={form.squareFeet} onChange={(e) => set("squareFeet", e.target.value)} placeholder="2840" />
        </Field>
        <Field label="Lot Size">
          <Input value={form.lotSize} onChange={(e) => set("lotSize", e.target.value)} placeholder="0.92 acres" />
        </Field>
        <Field label="Year Built">
          <Input inputMode="numeric" value={form.yearBuilt} onChange={(e) => set("yearBuilt", e.target.value)} placeholder="2006" />
        </Field>
      </div>

      <Field label="Key Features">
        <KeyFeaturesInput features={form.keyFeatures} onChange={(next) => set("keyFeatures", next)} />
      </Field>

      <div className="border-t border-border pt-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Agent Information</p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex shrink-0 flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => agentPhotoInputRef.current?.click()}
              className={cn(
                "relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-background text-muted-foreground transition-colors hover:border-gold-400",
                form.agentPhotoUrl && "border-solid border-border"
              )}
            >
              {form.agentPhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.agentPhotoUrl} alt="Agent headshot" className="h-full w-full object-cover" />
              ) : (
                <Camera className="h-6 w-6" />
              )}
            </button>
            <input
              ref={agentPhotoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAgentPhoto}
            />
            <span className="text-[11px] text-muted-foreground">Agent Photo</span>
            {photoError && <span className="text-[11px] text-red-500">{photoError}</span>}
          </div>

          <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Agent Name">
              <Input
                value={form.agentName}
                onChange={(e) => set("agentName", e.target.value)}
                placeholder="Robert Castro"
              />
            </Field>
            <Field label="Agent Email">
              <Input
                type="email"
                value={form.agentEmail}
                onChange={(e) => set("agentEmail", e.target.value)}
                placeholder="robert@movementmortgage.com"
              />
            </Field>
            <Field label="Agent Phone">
              <Input
                type="tel"
                value={form.agentPhone}
                onChange={(e) => set("agentPhone", e.target.value)}
                placeholder="(555) 123-4567"
              />
            </Field>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}


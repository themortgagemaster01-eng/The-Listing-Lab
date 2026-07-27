import type { FlyerTemplate, FlyerTextContent } from "@/lib/supabase/types";

/**
 * Client-facing types for Flyer Studio
 * (`components/property/flyer/*`). These sit "above" the raw Supabase row
 * types in `src/lib/supabase/types.ts` — the persistence layer
 * (`src/lib/flyer/persistence.ts`) is responsible for mapping between the
 * two, whether the underlying store is Supabase or `localStorage`.
 */

/** Editable property-information form fields (Phase 2 spec item #2). */
export interface PropertyFormData {
  address: string;
  cityStateZip: string;
  mlsNumber: string;
  /** Kept as a plain string for controlled-input friendliness; parsed to a number at the AI/PDF boundary. */
  price: string;
  bedrooms: string;
  bathrooms: string;
  squareFeet: string;
  lotSize: string;
  yearBuilt: string;
  propertyType: string;
  keyFeatures: string[];
  agentName: string;
  agentEmail: string;
  agentPhone: string;
  /** Data URL (mock mode) or Supabase Storage public URL (configured mode). */
  agentPhotoUrl: string;
  /**
   * Agent's mortgage application/contact link — used by the Payment
   * Snapshot PDF's QR code (see src/lib/pdf/qrcode.ts). Optional/blank is
   * expected and handled: the QR falls back to a mailto:/tel: link built
   * from agentEmail/agentPhone rather than a broken QR pointing at nothing.
   * Never fabricate a value for this field.
   */
  agentApplicationUrl: string;
}

export function emptyPropertyForm(seed?: Partial<PropertyFormData>): PropertyFormData {
  return {
    address: "",
    cityStateZip: "",
    mlsNumber: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    squareFeet: "",
    lotSize: "",
    yearBuilt: "",
    propertyType: "",
    keyFeatures: [],
    agentName: "",
    agentEmail: "",
    agentPhone: "",
    agentPhotoUrl: "",
    agentApplicationUrl: "",
    ...seed,
  };
}

/** A single managed photo (Phase 2 spec item #3). */
export interface FlyerPhoto {
  id: string;
  /** Data URL (mock mode, resized client-side) or Supabase Storage public URL (configured mode). */
  url: string;
  displayOrder: number;
  isCover: boolean;
}

/**
 * A frozen snapshot of a previous generation, kept so "Regenerate" never
 * silently loses history even though there's no version-browsing UI yet
 * (see the data-model note in the task brief — mirrors `flyers.version`).
 */
export interface FlyerVersionSnapshot {
  version: number;
  template: FlyerTemplate;
  aiGeneratedText: FlyerTextContent;
  userEditedText: FlyerTextContent;
  pdfDataUrl: string | null;
  createdAt: string;
}

export type FlyerStatus = "draft" | "final";

/**
 * A single generated flyer (one `marketing_assets` row + its child `flyers`
 * row, flattened into one client-side object). Multiple can exist per
 * property — each shows up as its own card under Marketing Assets → Flyers.
 */
export interface FlyerRecord {
  /** The `flyers.id` primary key. */
  id: string;
  /**
   * The parent `marketing_assets.id` this flyer belongs to. Only meaningful
   * in Supabase mode (`src/lib/flyer/supabase-store.ts`) where the two are
   * separate tables/rows; in local/mock mode (`local-store.ts`) the whole
   * `FlyerRecord` is stored flat and this is just set equal to `id`.
   */
  marketingAssetId: string;
  propertyId: string;
  title: string;
  template: FlyerTemplate;
  aiGeneratedText: FlyerTextContent | null;
  userEditedText: FlyerTextContent | null;
  pdfDataUrl: string | null;
  pdfUrl: string | null;
  status: FlyerStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  history: FlyerVersionSnapshot[];
}

/** Resolves the copy that should actually be rendered/exported: user edits win, falling back to the raw AI generation. */
export function resolveFlyerText(flyer: Pick<FlyerRecord, "aiGeneratedText" | "userEditedText">): FlyerTextContent | null {
  return flyer.userEditedText ?? flyer.aiGeneratedText ?? null;
}

export const FLYER_TEMPLATES: { id: FlyerTemplate; name: string; description: string }[] = [
  { id: "luxury", name: "Luxury", description: "Full-bleed hero photo, editorial serif type" },
  { id: "modern", name: "Modern", description: "Photo grid, bold sans-serif, dense layout" },
  { id: "classic", name: "Classic", description: "Single large photo, traditional serif layout" },
  { id: "minimal", name: "Minimal", description: "Whitespace-forward layout, understated accents" },
];

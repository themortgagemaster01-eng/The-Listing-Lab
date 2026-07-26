import type { PropertyAiInput } from "@/lib/ai/ai-service";
import { emptyPropertyForm, type FlyerPhoto, type PropertyFormData } from "@/lib/flyer/types";
import type { Property } from "@/types";

/** Parses a form string field into a finite number, or `undefined` if blank/invalid. */
export function parseNumberField(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function parseIntField(value: string): number | undefined {
  const parsed = parseNumberField(value);
  return parsed == null ? undefined : Math.round(parsed);
}

/** Builds the `AIService`/`generateAsset` input shape directly from the property-info form. */
export function toPropertyAiInput(form: PropertyFormData): PropertyAiInput {
  return {
    address: form.address || "This property",
    cityStateZip: form.cityStateZip || undefined,
    propertyType: form.propertyType || undefined,
    keyFeatures: form.keyFeatures.length > 0 ? form.keyFeatures : undefined,
    price: parseNumberField(form.price),
    bedrooms: parseIntField(form.bedrooms),
    bathrooms: parseNumberField(form.bathrooms),
    squareFeet: parseIntField(form.squareFeet),
    lotSize: form.lotSize || undefined,
    yearBuilt: parseIntField(form.yearBuilt),
  };
}

/** Formats a price for display — shared by the template previews and the PDF documents. */
export function formatCurrency(value: number | undefined | null): string | null {
  if (value == null) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Seeds a fresh `PropertyFormData` from the existing mock `Property` shape — used the first time the Flyer Generator loads for a property with no saved form yet. */
export function seedFormFromProperty(property: Property): PropertyFormData {
  return emptyPropertyForm({
    address: property.address,
    cityStateZip: property.cityStateZip,
    mlsNumber: property.mlsNumber ?? "",
    price: property.price != null ? String(property.price) : "",
    bedrooms: property.beds != null ? String(property.beds) : "",
    bathrooms: property.baths != null ? String(property.baths) : "",
    squareFeet: property.sqft != null ? String(property.sqft) : "",
    lotSize: property.lotSize ?? "",
    yearBuilt: property.yearBuilt != null ? String(property.yearBuilt) : "",
    propertyType: property.propertyType ?? "",
    keyFeatures: property.keyFeatures ?? [],
    agentName: property.listingAgent ?? "",
    agentEmail: property.agentEmail ?? "",
    agentPhone: property.agentPhone ?? "",
    agentPhotoUrl: property.agentPhotoUrl ?? "",
    agentApplicationUrl: property.agentApplicationUrl ?? "",
  });
}

/**
 * Seeds the initial photo list from the mock `Property`'s existing gallery
 * (remote Unsplash URLs) — used the first time the Flyer Generator loads
 * for a property with no saved photos yet, so the demo isn't a blank
 * upload zone for the four pre-built example properties. Real
 * uploads/reordering/deletes all flow through `FlyerPhotoManager` from
 * that point on.
 */
export function seedPhotosFromProperty(property: Property): FlyerPhoto[] {
  const urls = property.photos && property.photos.length > 0 ? property.photos : property.imageUrl ? [property.imageUrl] : [];
  return urls.map((url, index) => ({
    id: `seed-${index}`,
    url,
    displayOrder: index,
    isCover: index === 0,
  }));
}

/** Builds the "4 bd · 3 ba · 2,840 sqft" summary line used across previews and PDFs. */
export function formatStatsLine(form: PropertyFormData): string {
  const parts: string[] = [];
  if (form.bedrooms) parts.push(`${form.bedrooms} bd`);
  if (form.bathrooms) parts.push(`${form.bathrooms} ba`);
  const sqft = parseIntField(form.squareFeet);
  if (sqft != null) parts.push(`${sqft.toLocaleString()} sqft`);
  return parts.join(" · ");
}

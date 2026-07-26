import type { Property as MockProperty, PropertyStatus } from "@/types";

/**
 * Hand-written TypeScript types mirroring `supabase/migrations/0001_init.sql`.
 *
 * Naming convention: `*Row` types are the exact snake_case shape returned by
 * Supabase/Postgres. The camelCase types below them (`Photo`,
 * `MarketingAsset`, `Flyer`) are the app-facing shapes — the `map*RowTo*`
 * functions at the bottom of this file are the ONLY place snake_case ↔
 * camelCase conversion should happen; don't hand-roll that mapping
 * elsewhere.
 *
 * `properties` is deliberately NOT mapped onto the existing mock `Property`
 * type from `@/types` — the shapes only partially overlap (DB `properties`
 * has a single `address` column with no `cityStateZip`, and no `imageUrl`/
 * `photos`/`headline`/`description`, since photos live in the `photos`
 * table and headline/description live in `flyers.ai_generated_text`). See
 * `mapPropertyRowToMockProperty` below for the best-effort bridge and its
 * documented gaps.
 */

// ---------------------------------------------------------------------------
// Row types (snake_case, as returned by Supabase)
// ---------------------------------------------------------------------------

export interface PropertyRow {
  id: string;
  address: string;
  city_state_zip: string | null;
  mls_number: string | null;
  price: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  square_feet: number | null;
  lot_size: string | null;
  year_built: number | null;
  property_type: string | null;
  key_features: string[];
  agent_name: string | null;
  agent_email: string | null;
  agent_phone: string | null;
  agent_photo_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface PhotoRow {
  id: string;
  property_id: string;
  storage_path: string;
  url: string;
  display_order: number;
  is_cover: boolean;
  created_at: string;
}

export type MarketingAssetType = "flyer" | "social_post" | "website" | "payment_snapshot";
export type MarketingAssetStatus = "draft" | "final";

export interface MarketingAssetRow {
  id: string;
  property_id: string;
  asset_type: MarketingAssetType;
  title: string | null;
  thumbnail_url: string | null;
  status: MarketingAssetStatus;
  created_at: string;
  updated_at: string;
}

export type FlyerTemplate = "luxury" | "modern" | "classic";

/**
 * Shape of both `flyers.ai_generated_text` and `flyers.user_edited_text`.
 * This is also the return shape of `AIService.generateFlyerText` in
 * `src/lib/ai/ai-service.ts` — keep the two in sync.
 */
export interface FlyerTextContent {
  headline: string;
  luxuryHeadline: string;
  description: string;
  featureBullets: string[];
  neighborhoodHighlights: string;
  callToAction: string;
}

export interface FlyerRow {
  id: string;
  marketing_asset_id: string;
  property_id: string;
  template: string;
  ai_generated_text: FlyerTextContent | null;
  user_edited_text: FlyerTextContent | null;
  pdf_path: string | null;
  pdf_url: string | null;
  version: number;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// App-facing types (camelCase)
// ---------------------------------------------------------------------------

export interface Photo {
  id: string;
  propertyId: string;
  storagePath: string;
  url: string;
  displayOrder: number;
  isCover: boolean;
  createdAt: string;
}

export interface MarketingAsset {
  id: string;
  propertyId: string;
  assetType: MarketingAssetType;
  title: string | null;
  thumbnailUrl: string | null;
  status: MarketingAssetStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Flyer {
  id: string;
  marketingAssetId: string;
  propertyId: string;
  template: string;
  aiGeneratedText: FlyerTextContent | null;
  userEditedText: FlyerTextContent | null;
  pdfPath: string | null;
  pdfUrl: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * DB-backed property shape, camelCase. Superset-friendly with the mock
 * `Property` type where fields overlap (address, price, bedrooms/beds,
 * etc.) but is its own type since the DB schema and the mock/demo shape
 * diverge (see file header comment).
 */
export interface DbProperty {
  id: string;
  address: string;
  cityStateZip: string | null;
  mlsNumber: string | null;
  price: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  squareFeet: number | null;
  lotSize: string | null;
  yearBuilt: number | null;
  propertyType: string | null;
  keyFeatures: string[];
  agentName: string | null;
  agentEmail: string | null;
  agentPhone: string | null;
  agentPhotoUrl: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Row <-> app-shape mappers (the only place snake_case/camelCase conversion
// should happen)
// ---------------------------------------------------------------------------

export function mapPhotoRow(row: PhotoRow): Photo {
  return {
    id: row.id,
    propertyId: row.property_id,
    storagePath: row.storage_path,
    url: row.url,
    displayOrder: row.display_order,
    isCover: row.is_cover,
    createdAt: row.created_at,
  };
}

export function mapMarketingAssetRow(row: MarketingAssetRow): MarketingAsset {
  return {
    id: row.id,
    propertyId: row.property_id,
    assetType: row.asset_type,
    title: row.title,
    thumbnailUrl: row.thumbnail_url,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapFlyerRow(row: FlyerRow): Flyer {
  return {
    id: row.id,
    marketingAssetId: row.marketing_asset_id,
    propertyId: row.property_id,
    template: row.template,
    aiGeneratedText: row.ai_generated_text,
    userEditedText: row.user_edited_text,
    pdfPath: row.pdf_path,
    pdfUrl: row.pdf_url,
    version: row.version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapPropertyRow(row: PropertyRow): DbProperty {
  return {
    id: row.id,
    address: row.address,
    cityStateZip: row.city_state_zip,
    mlsNumber: row.mls_number,
    price: row.price,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    squareFeet: row.square_feet,
    lotSize: row.lot_size,
    yearBuilt: row.year_built,
    propertyType: row.property_type,
    keyFeatures: row.key_features ?? [],
    agentName: row.agent_name,
    agentEmail: row.agent_email,
    agentPhone: row.agent_phone,
    agentPhotoUrl: row.agent_photo_url,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Best-effort bridge from a DB property row to the mock/demo `Property`
 * shape the current UI renders (`@/types`). Used so that once real data
 * exists, existing components can keep consuming the same `Property` shape
 * without a rewrite.
 *
 * Gaps (DB schema has no equivalent column — caller must supply via
 * `extra`, or the UI falls back to a placeholder):
 *   - `cityStateZip` — DB only stores a single `address` string
 *   - `imageUrl` / `photos` — live in the separate `photos` table
 *   - `headline` / `description` — live in `flyers.ai_generated_text`
 *   - `assetCount` — derived by counting `marketing_assets` rows, not stored
 */
export function mapPropertyRowToMockProperty(
  row: PropertyRow,
  extra: Partial<MockProperty> = {}
): MockProperty {
  const status: PropertyStatus = row.status === "ACTIVE" || row.status === "DRAFT" ? row.status : "DRAFT";

  return {
    id: row.id,
    address: row.address,
    cityStateZip: row.city_state_zip ?? extra.cityStateZip ?? "",
    status,
    assetCount: extra.assetCount ?? 0,
    imageUrl: extra.imageUrl ?? "",
    price: row.price ?? undefined,
    beds: row.bedrooms ?? undefined,
    baths: row.bathrooms ?? undefined,
    sqft: row.square_feet ?? undefined,
    yearBuilt: row.year_built ?? undefined,
    lotSize: row.lot_size ?? undefined,
    mlsNumber: row.mls_number ?? undefined,
    listingAgent: row.agent_name ?? undefined,
    propertyType: row.property_type ?? undefined,
    keyFeatures: row.key_features ?? undefined,
    agentEmail: row.agent_email ?? undefined,
    agentPhone: row.agent_phone ?? undefined,
    agentPhotoUrl: row.agent_photo_url ?? undefined,
    ...extra,
  };
}

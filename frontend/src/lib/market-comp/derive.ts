import type { CompsProviderId, MarketComp } from "@/lib/market-comp/types";

/** Loosely-typed row shape every provider's raw parsed data gets coerced into before `deriveComp` finalizes it. */
export interface RawCompRow {
  address?: string | null;
  soldPrice?: number | null;
  soldDate?: string | null;
  beds?: number | null;
  baths?: number | null;
  sqft?: number | null;
  propertyType?: string | null;
  distanceMiles?: number | null;
  sourceNote?: string | null;
}

/**
 * The single place `pricePerSqft` gets computed and `source` gets assigned
 * — every provider (`providers/*.ts`) funnels its parsed rows through this
 * instead of building `MarketComp` objects by hand, so there's exactly one
 * implementation of "how do we turn a raw row into a normalized comp" no
 * matter which source it came from. Returns `null` (rather than throwing)
 * when a row is missing a required field, so callers can collect a
 * `warnings` message and skip that row instead of failing the whole import.
 */
export function deriveComp(row: RawCompRow, source: CompsProviderId): MarketComp | null {
  if (!row.address || !row.soldPrice || !row.sqft) {
    return null;
  }
  if (row.soldPrice <= 0 || row.sqft <= 0) {
    return null;
  }

  return {
    address: row.address.trim(),
    soldPrice: row.soldPrice,
    soldDate: row.soldDate?.trim() || "Unknown",
    beds: row.beds ?? 0,
    baths: row.baths ?? 0,
    sqft: row.sqft,
    propertyType: row.propertyType?.trim() || "Single Family",
    distanceMiles: row.distanceMiles ?? 0,
    pricePerSqft: Math.round((row.soldPrice / row.sqft) * 100) / 100,
    source,
    sourceNote: row.sourceNote?.trim() || undefined,
  };
}

import type { MlsApiCompsProvider } from "@/lib/market-comp/types";

/**
 * `mls-api` provider — stub. We don't have MLS API access/credentials yet;
 * this slot exists so the provider registry and UI can show "Coming Soon"
 * for it without any code changes once real MLS access is set up. Per
 * Robert's explicit direction: do not hard-code or scrape any single data
 * source (e.g. Zillow) — this is reserved for a real, licensed MLS API
 * integration only.
 */
export const mlsApiCompsProvider: MlsApiCompsProvider = {
  id: "mls-api",
  label: "MLS API",
  isImplemented: false,
  async fetch() {
    throw new Error("MLS API access isn't connected yet. Use manual entry, CSV, Excel, or PDF import for now.");
  },
};

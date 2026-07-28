import type { LicensedDataCompsProvider } from "@/lib/market-comp/types";

/**
 * `licensed-data-api` provider — stub. Reserved for a future licensed
 * property-data API (RentCast/ATTOM-style) once we have a real contract in
 * place. Not implemented — no scraping, no unlicensed data source, ever.
 */
export const licensedDataCompsProvider: LicensedDataCompsProvider = {
  id: "licensed-data-api",
  label: "Licensed Data Provider",
  isImplemented: false,
  async fetch() {
    throw new Error("A licensed property-data provider isn't connected yet. Use manual entry, CSV, Excel, or PDF import for now.");
  },
};

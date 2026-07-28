import { csvImportCompsProvider } from "@/lib/market-comp/providers/csv-import";
import { excelImportCompsProvider } from "@/lib/market-comp/providers/excel-import";
import { licensedDataCompsProvider } from "@/lib/market-comp/providers/licensed-data-api";
import { manualCompsProvider } from "@/lib/market-comp/providers/manual";
import { mlsApiCompsProvider } from "@/lib/market-comp/providers/mls-api";
import { pdfImportCompsProvider } from "@/lib/market-comp/providers/pdf-import";
import type { CompsProvider, CompsProviderId } from "@/lib/market-comp/types";

/**
 * Single dispatch point for every comps source — mirrors the
 * `generateAsset`/`AIService` switch-based dispatcher pattern in
 * `src/lib/ai/asset-service.ts`. The wizard UI and any future caller pick a
 * `CompsProviderId` and look it up here; they never import a provider file
 * directly. Four sources are real (`isImplemented: true`), two are stubs
 * reserved for future licensed integrations.
 */
export const COMPS_PROVIDERS: Record<CompsProviderId, CompsProvider<any>> = {
  manual: manualCompsProvider,
  "csv-import": csvImportCompsProvider,
  "excel-import": excelImportCompsProvider,
  "pdf-import": pdfImportCompsProvider,
  "mls-api": mlsApiCompsProvider,
  "licensed-data-api": licensedDataCompsProvider,
};

export const IMPLEMENTED_COMPS_PROVIDERS = (Object.values(COMPS_PROVIDERS) as CompsProvider<any>[]).filter(
  (p) => p.isImplemented
);

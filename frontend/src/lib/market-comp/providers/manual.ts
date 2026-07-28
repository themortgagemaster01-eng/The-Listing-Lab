import { deriveComp } from "@/lib/market-comp/derive";
import type { CompsProviderResult, ManualCompsInput, ManualCompsProvider } from "@/lib/market-comp/types";

/**
 * `manual` provider — the agent types comps in by hand via a form
 * (`components/property/market-comp/ManualCompsForm.tsx`). No async work
 * actually happens here; it's `Promise`-returning only so it satisfies the
 * same `CompsProvider` contract as every other source, meaning the wizard
 * and the AI engine never need to know or care that this one is
 * synchronous under the hood.
 */
export const manualCompsProvider: ManualCompsProvider = {
  id: "manual",
  label: "Manual Entry",
  isImplemented: true,
  async fetch(input: ManualCompsInput): Promise<CompsProviderResult> {
    const warnings: string[] = [];
    const comps = input.comps
      .map((row, i) => {
        const comp = deriveComp(row, "manual");
        if (!comp) {
          warnings.push(`Row ${i + 1} skipped — needs at least an address, sold price, and square footage.`);
        }
        return comp;
      })
      .filter((c): c is NonNullable<typeof c> => c !== null);

    return { comps, warnings };
  },
};

import { getOpenAIClient } from "@/lib/ai/openai-client";
import { describeOpenAiError } from "@/lib/ai/openai-error";
import { deriveComp, type RawCompRow } from "@/lib/market-comp/derive";
import type { CompsProviderResult } from "@/lib/market-comp/types";

/**
 * Server-only PDF comp extraction — the `pdf-import` provider's real work.
 * Reuses the exact `client.responses.create` + `input_file` pattern proven
 * in production for the Income Analyzer (`src/lib/ai/income-service.ts`),
 * just prompted to extract a comp table instead of income figures. Same
 * "always return the same shape whether OpenAI is configured or not"
 * convention — falls back to a small labeled demo comp set instead of
 * throwing when no key is configured, so the wizard stays demoable.
 */

const SYSTEM_PROMPT = `You extract comparable-sale property data from a PDF a real estate agent uploads — typically an MLS comp sheet export or a printout/export from a listing site. Find every distinct sold comparable property listed and, for each one, extract:
- address: the property's street address (and city/state if shown).
- soldPrice: the sale/close price as a number (no currency symbols).
- soldDate: the sale/close date as it appears (any reasonable format is fine).
- beds: bedroom count, or null if not shown.
- baths: bathroom count, or null if not shown.
- sqft: square footage as a number, or null if not shown.
- propertyType: property type/style if shown (e.g. "Single Family", "Condo"), or null.
- distanceMiles: distance from the subject property in miles, ONLY if the document explicitly states it — otherwise null.

Respond as JSON only: { "comps": [ { "address": string, "soldPrice": number|null, "soldDate": string|null, "beds": number|null, "baths": number|null, "sqft": number|null, "propertyType": string|null, "distanceMiles": number|null } ] }. If you can't confidently find any comps, return { "comps": [] }.`;

function buildDemoResult(fileName: string): CompsProviderResult {
  const demoRows: RawCompRow[] = [
    { address: "[Demo] 12 Maple Street", soldPrice: 712000, soldDate: "2026-05-14", beds: 4, baths: 3, sqft: 2650, propertyType: "Single Family", sourceNote: `Placeholder — connect an OpenAI API key to read ${fileName}` },
    { address: "[Demo] 47 Birchwood Lane", soldPrice: 748500, soldDate: "2026-04-22", beds: 4, baths: 3, sqft: 2790, propertyType: "Single Family", sourceNote: `Placeholder — connect an OpenAI API key to read ${fileName}` },
  ];
  const comps = demoRows.map((r) => deriveComp(r, "pdf-import")).filter((c): c is NonNullable<typeof c> => c !== null);
  return { comps, warnings: ["No OpenAI API key configured — showing placeholder demo comps instead of reading the PDF."] };
}

export async function extractCompsFromPdf(fileName: string, dataUrl: string): Promise<CompsProviderResult> {
  const client = getOpenAIClient();
  if (!client) {
    return buildDemoResult(fileName);
  }

  let raw: string;
  try {
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      instructions: SYSTEM_PROMPT,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: `Extract comps from this file: ${fileName}` },
            { type: "input_file", filename: fileName, file_data: dataUrl },
          ],
        },
      ],
    });
    raw = response.output_text;
  } catch (err) {
    const { logMessage, userMessage } = describeOpenAiError(err);
    console.error(`[Realtor Toolbox] AI CMA PDF extraction failed: ${logMessage}`);
    throw new Error(userMessage);
  }

  if (!raw) {
    throw new Error("OpenAI response contained no content.");
  }

  let parsed: { comps: Array<Omit<RawCompRow, "sourceNote">> };
  try {
    const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Failed to parse OpenAI JSON response: ${(err as Error).message}`);
  }

  const warnings: string[] = [];
  const comps = (parsed.comps ?? [])
    .map((row, i) => {
      const comp = deriveComp({ ...row, sourceNote: `Extracted from ${fileName}` }, "pdf-import");
      if (!comp) {
        warnings.push(`A comp found on page-level extraction (item ${i + 1}) was skipped — missing address, sold price, or sqft.`);
      }
      return comp;
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  if (comps.length === 0) {
    warnings.push(`No comps could be confidently extracted from "${fileName}" — try a clearer export or enter comps manually."] };
}

import { deriveComp, type RawCompRow } from "@/lib/market-comp/derive";
import type { CompsProviderResult, CsvImportCompsProvider, FileImportCompsInput } from "@/lib/market-comp/types";

/**
 * Minimal RFC4180-ish CSV parser — handles quoted fields (including
 * embedded commas and escaped `""` quotes) and both `\n`/`\r\n` line
 * endings. No dependency needed for this; a real CSV parsing library would
 * be overkill for "split rows into cells."
 */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && next === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

/** Column-header aliases we'll recognize, case-insensitively, in either order the file happens to use. */
const HEADER_ALIASES: Record<keyof RawCompRow, string[]> = {
  address: ["address", "street address", "property address"],
  soldPrice: ["sold price", "sale price", "price", "close price"],
  soldDate: ["sold date", "sale date", "close date", "date"],
  beds: ["beds", "bedrooms", "bd"],
  baths: ["baths", "bathrooms", "ba"],
  sqft: ["sqft", "sq ft", "square feet", "living area", "gla"],
  propertyType: ["property type", "type", "style"],
  distanceMiles: ["distance", "distance (mi)", "distance miles", "miles"],
  sourceNote: [],
};

function buildColumnMap(headerRow: string[]): Partial<Record<keyof RawCompRow, number>> {
  const normalized = headerRow.map((h) => h.trim().toLowerCase());
  const map: Partial<Record<keyof RawCompRow, number>> = {};

  for (const key of Object.keys(HEADER_ALIASES) as (keyof RawCompRow)[]) {
    const aliases = HEADER_ALIASES[key];
    if (aliases.length === 0) continue;
    const idx = normalized.findIndex((h) => aliases.includes(h));
    if (idx !== -1) map[key] = idx;
  }
  return map;
}

function parseNumber(value: string | undefined): number | null {
  if (!value) return null;
  const cleaned = value.replace(/[$,\s]/g, "");
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

function dataUrlToText(dataUrl: string): string {
  const base64 = dataUrl.split(",")[1] ?? "";
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder("utf-8").decode(bytes);
}

/**
 * `csv-import` provider — parses a comp sheet exported as CSV (common from
 * MLS systems and spreadsheet tools). Column headers are matched
 * case-insensitively against a small alias list (`HEADER_ALIASES`) rather
 * than requiring one exact format, since every MLS/export tool names its
 * columns slightly differently.
 */
export const csvImportCompsProvider: CsvImportCompsProvider = {
  id: "csv-import",
  label: "CSV Import",
  isImplemented: true,
  async fetch(input: FileImportCompsInput): Promise<CompsProviderResult> {
    const warnings: string[] = [];
    let text: string;
    try {
      text = dataUrlToText(input.dataUrl);
    } catch {
      return { comps: [], warnings: [`Couldn't read "${input.fileName}" as text — make sure it's a plain CSV file.`] };
    }

    const rows = parseCsv(text);
    if (rows.length < 2) {
      return { comps: [], warnings: [`"${input.fileName}" doesn't look like it has a header row plus data rows.`] };
    }

    const [headerRow, ...dataRows] = rows;
    const columnMap = buildColumnMap(headerRow);

    if (columnMap.address === undefined || columnMap.soldPrice === undefined) {
      return {
        comps: [],
        warnings: [
          `"${input.fileName}" is missing recognizable "Address" and/or "Sold Price" columns — rename the header row to something like Address, Sold Price, Sold Date, Beds, Baths, Sqft.`,
        ],
      };
    }

    const comps = dataRows
      .map((cells, i) => {
        const raw: RawCompRow = {
          address: columnMap.address != null ? cells[columnMap.address] : null,
          soldPrice: parseNumber(columnMap.soldPrice != null ? cells[columnMap.soldPrice] : undefined),
          soldDate: columnMap.soldDate != null ? cells[columnMap.soldDate] : null,
          beds: parseNumber(columnMap.beds != null ? cells[columnMap.beds] : undefined),
          baths: parseNumber(columnMap.baths != null ? cells[columnMap.baths] : undefined),
          sqft: parseNumber(columnMap.sqft != null ? cells[columnMap.sqft] : undefined),
          propertyType: columnMap.propertyType != null ? cells[columnMap.propertyType] : null,
          distanceMiles: parseNumber(columnMap.distanceMiles != null ? cells[columnMap.distanceMiles] : undefined),
          sourceNote: `Row ${i + 2} of ${input.fileName}`,
        };
        const comp = deriveComp(raw, "csv-import");
        if (!comp) {
          warnings.push(`Row ${i + 2} skipped — missing address, sold price, or square footage.`);
        }
        return comp;
      })
      .filter((c): c is NonNullable<typeof c> => c !== null);

    if (comps.length === 0) {
      warnings.push(`No usable comp rows found in "${input.fileName}".`);
    }

    return { comps, warnings };
  },
};

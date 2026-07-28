import * as XLSX from "xlsx";

import { deriveComp, type RawCompRow } from "@/lib/market-comp/derive";
import type { CompsProviderResult, ExcelImportCompsProvider, FileImportCompsInput } from "@/lib/market-comp/types";

/** Same alias approach as `csv-import.ts` — every MLS/export tool names its columns slightly differently. */
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

function findKey(rowKeys: string[], aliases: string[]): string | undefined {
  return rowKeys.find((k) => aliases.includes(k.trim().toLowerCase()));
}

function parseNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const cleaned = String(value).replace(/[$,\s]/g, "");
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

function toDisplayString(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

/**
 * `excel-import` provider — parses a comp sheet uploaded as `.xlsx`/`.xls`
 * using SheetJS (`xlsx` npm package, added as a new dependency for this
 * feature — see `package.json`). Reads the first sheet only; a multi-sheet
 * workbook (e.g. one tab per neighborhood) isn't supported in this first
 * pass — flagged as a possible follow-up, not built now.
 */
export const excelImportCompsProvider: ExcelImportCompsProvider = {
  id: "excel-import",
  label: "Excel Import",
  isImplemented: true,
  async fetch(input: FileImportCompsInput): Promise<CompsProviderResult> {
    const warnings: string[] = [];

    let workbook: XLSX.WorkBook;
    try {
      const base64 = input.dataUrl.split(",")[1] ?? "";
      workbook = XLSX.read(base64, { type: "base64" });
    } catch {
      return { comps: [], warnings: [`Couldn't read "${input.fileName}" — make sure it's a valid .xlsx or .xls file.`] };
    }

    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return { comps: [], warnings: [`"${input.fileName}" doesn't have any sheets.`] };
    }

    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[sheetName], { defval: null });
    if (rows.length === 0) {
      return { comps: [], warnings: [`"${input.fileName}"'s first sheet has no data rows below the header.`] };
    }

    const rowKeys = Object.keys(rows[0]);
    const columnMap: Partial<Record<keyof RawCompRow, string>> = {};
    for (const key of Object.keys(HEADER_ALIASES) as (keyof RawCompRow)[]) {
      const aliases = HEADER_ALIASES[key];
      if (aliases.length === 0) continue;
      const match = findKey(rowKeys, aliases);
      if (match) columnMap[key] = match;
    }

    if (!columnMap.address || !columnMap.soldPrice) {
      return {
        comps: [],
        warnings: [
          `"${input.fileName}" is missing recognizable "Address" and/or "Sold Price" columns — rename the header row to something like Address, Sold Price, Sold Date, Beds, Baths, Sqft.`,
        ],
      };
    }

    const comps = rows
      .map((r, i) => {
        const raw: RawCompRow = {
          address: toDisplayString(columnMap.address ? r[columnMap.address] : null),
          soldPrice: parseNumber(columnMap.soldPrice ? r[columnMap.soldPrice] : null),
          soldDate: toDisplayString(columnMap.soldDate ? r[columnMap.soldDate] : null),
          beds: parseNumber(columnMap.beds ? r[columnMap.beds] : null),
          baths: parseNumber(columnMap.baths ? r[columnMap.baths] : null),
          sqft: parseNumber(columnMap.sqft ? r[columnMap.sqft] : null),
          propertyType: toDisplayString(columnMap.propertyType ? r[columnMap.propertyType] : null),
          distanceMiles: parseNumber(columnMap.distanceMiles ? r[columnMap.distanceMiles] : null),
          sourceNote: `Row ${i + 2} of ${input.fileName}`,
        };
        const comp = deriveComp(raw, "excel-import");
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

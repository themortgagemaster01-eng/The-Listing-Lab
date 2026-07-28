/**
 * Client-only helper for turning a picked comp-sheet File (CSV, Excel, or
 * PDF) into a `FileImportCompsInput` ready for a `CompsProvider.fetch()`
 * call. Deliberately simpler than `src/lib/income/prepare-upload.ts` — no
 * image compression needed since none of these file types are images, and
 * comp data doesn't carry the same non-persistence mandate income documents
 * do, so this is just "read the file as a data URL" plus a sane size cap.
 */

import type { FileImportCompsInput } from "@/lib/market-comp/types";

export const MAX_COMPS_FILE_BYTES = 8 * 1024 * 1024;

export class CompsFilePrepError extends Error {}

const ACCEPTED_MIME_TYPES: Record<"csv-import" | "excel-import" | "pdf-import", { mimes: string[]; label: string }> = {
  "csv-import": { mimes: ["text/csv", "application/vnd.ms-excel", "text/plain"], label: ".csv" },
  "excel-import": {
    mimes: [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ],
    label: ".xlsx or .xls",
  },
  "pdf-import": { mimes: ["application/pdf"], label: ".pdf" },
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}

/** Loosely checks extension as a fallback since browsers report inconsistent/missing MIME types for CSV and Excel files. */
function matchesExpectedType(file: File, kind: keyof typeof ACCEPTED_MIME_TYPES): boolean {
  if (ACCEPTED_MIME_TYPES[kind].mimes.includes(file.type)) return true;
  const name = file.name.toLowerCase();
  if (kind === "csv-import") return name.endsWith(".csv");
  if (kind === "excel-import") return name.endsWith(".xlsx") || name.endsWith(".xls");
  if (kind === "pdf-import") return name.endsWith(".pdf");
  return false;
}

export async function prepareCompsFile(
  file: File,
  kind: "csv-import" | "excel-import" | "pdf-import"
): Promise<FileImportCompsInput> {
  if (!matchesExpectedType(file, kind)) {
    throw new CompsFilePrepError(`"${file.name}" doesn't look like a ${ACCEPTED_MIME_TYPES[kind].label} file.`);
  }
  if (file.size > MAX_COMPS_FILE_BYTES) {
    throw new CompsFilePrepError(`"${file.name}" is too large (${Math.round(file.size / 1024 / 1024)}MB) — max 8MB.`);
  }

  const dataUrl = await readFileAsDataUrl(file);
  return { fileName: file.name, mimeType: file.type, dataUrl };
}

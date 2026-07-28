import type { CompsProviderResult, FileImportCompsInput, PdfImportCompsProvider } from "@/lib/market-comp/types";

/**
 * `pdf-import` provider — client-side wrapper that POSTs the uploaded PDF
 * (as a base64 data URL, never written to disk) to `/api/market-comp/parse-pdf`,
 * which does the actual OpenAI extraction server-side (needs `OPENAI_API_KEY`,
 * which isn't available in the browser). Mirrors the client/server split used
 * by the Income Analyzer.
 */
export const pdfImportCompsProvider: PdfImportCompsProvider = {
  id: "pdf-import",
  label: "PDF Import",
  isImplemented: true,
  async fetch(input: FileImportCompsInput): Promise<CompsProviderResult> {
    const res = await fetch("/api/market-comp/parse-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: input.fileName, dataUrl: input.dataUrl }),
    });

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      const message = body?.error || `PDF import failed (${res.status}).`;
      throw new Error(message);
    }

    return body.result as CompsProviderResult;
  },
};

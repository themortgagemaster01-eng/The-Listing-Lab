import { getOpenAIClient } from "@/lib/ai/openai-client";
import { describeOpenAiError } from "@/lib/ai/openai-error";
import type { ExtractedDocumentIncome, IncomeDocType, IncomeEstimateResult, IncomePayFrequency } from "@/lib/income/types";
import { INCOME_DOC_TYPE_LABELS } from "@/lib/income/types";

/**
 * AI Income Analyzer extraction service.
 *
 * PRIVACY BY DESIGN: this module never imports or calls anything from
 * `@/lib/supabase/*`. It receives document bytes as base64 data URLs (passed
 * in by the route handler, which itself never persists them — see
 * `src/app/api/ai/analyze-income/route.ts`), sends them to OpenAI for this
 * one request, and returns a plain JS object. Nothing here writes to disk or
 * a database. This is the same "always return the same shape whether OpenAI
 * is configured or not" convention as `ai-service.ts` (Flyer Studio) — when
 * `OPENAI_API_KEY` is unset, `analyzeIncomeDocuments` returns clearly-labeled
 * demo data instead of throwing, so the wizard stays fully demoable.
 */

export interface IncomeDocumentForAnalysis {
  fileName: string;
  mimeType: string;
  docType: IncomeDocType;
  dataUrl: string;
}

function normalizeToMonthly(amount: number, frequency: IncomePayFrequency): number {
  switch (frequency) {
    case "weekly":
      return (amount * 52) / 12;
    case "biweekly":
      return (amount * 26) / 12;
    case "semimonthly":
      return amount * 2;
    case "monthly":
      return amount;
    case "annual":
      return amount / 12;
    case "unknown":
    default:
      return amount; // best-effort — the model is instructed to only omit frequency when it truly can't tell, in which case we treat the found figure as already-monthly and flag it in notes
  }
}

/** Deterministic, clearly-labeled placeholder result used whenever `OPENAI_API_KEY` isn't configured — same idea as `AIService`'s "[Demo]" fallbacks in `ai-service.ts`. */
function buildDemoResult(docs: IncomeDocumentForAnalysis[]): IncomeEstimateResult {
  const perDocAmount = 4200; // plausible illustrative monthly figure

  const documents: ExtractedDocumentIncome[] = docs.map((doc) => ({
    fileName: doc.fileName,
    docType: doc.docType,
    source: `[Demo] Sample Employer (${INCOME_DOC_TYPE_LABELS[doc.docType]})`,
    payFrequency: "monthly",
    grossAmountFound: perDocAmount,
    estimatedMonthlyGross: perDocAmount,
    notes: "[Demo] Placeholder figure — connect an OpenAI API key to read real document contents.",
  }));

  const suggestedMonthlyGross = documents.reduce((sum, d) => sum + (d.estimatedMonthlyGross ?? 0), 0);

  return {
    documents,
    suggestedMonthlyGross,
    confidenceNote:
      "[Demo] This is placeholder demo data — no OpenAI API key is configured, so no documents were actually read. Connect OPENAI_API_KEY to see real extraction.",
    isDemoData: true,
  };
}

const SYSTEM_PROMPT = `You are a mortgage-industry income analyst helping a real estate/mortgage professional get a quick, ILLUSTRATIVE estimate of a buyer's gross monthly income from photos/PDFs of their income documents (paystubs, W-2s, tax returns, 1099s, bank statements). This is NOT an underwriting decision — it's a rough estimate the agent will review and correct before using it.

For EACH document provided, identify:
- source: employer name (paystub/W-2) or income source description (1099/bank statement/tax return), or null if not identifiable.
- payFrequency: one of "weekly", "biweekly", "semimonthly", "monthly", "annual", or "unknown".
- grossAmountFound: the gross dollar amount as it literally appears on the document for its stated pay period (a single paystub's gross for that period, a W-2's Box 1, a 1099's total, etc.), or null if you can't find one.
- estimatedMonthlyGross: grossAmountFound normalized to a monthly figure using payFrequency (weekly*52/12, biweekly*26/12, semimonthly*2, annual/12, monthly as-is). If payFrequency is "unknown", treat grossAmountFound as already monthly and say so in notes.
- notes: brief plain-English caveats (e.g. "YTD figure — may include bonus/overtime", "tax return shows net after deductions, gross may be higher", "image was blurry, low confidence").

Respond as JSON only: { "documents": [ { "fileName": string, "source": string|null, "payFrequency": string, "grossAmountFound": number|null, "estimatedMonthlyGross": number|null, "notes": string|null } ], "confidenceNote": string (one sentence, plain English, summarizing overall confidence and anything the agent should double-check before relying on this estimate) }`;

/**
 * Sends every uploaded document to OpenAI in a single Responses API call
 * (mixed image + PDF inputs in one request) and returns a normalized
 * `IncomeEstimateResult`. Falls back to `buildDemoResult` when no API key is
 * configured — callers never need to branch on that themselves.
 */
export async function analyzeIncomeDocuments(docs: IncomeDocumentForAnalysis[]): Promise<IncomeEstimateResult> {
  const client = getOpenAIClient();
  if (!client) {
    return buildDemoResult(docs);
  }

  const content: Array<
    | { type: "input_text"; text: string }
    | { type: "input_image"; image_url: string; detail: "auto" }
    | { type: "input_file"; filename: string; file_data: string }
  > = [
    {
      type: "input_text",
      text:
        `Analyze these ${docs.length} document(s) and return the JSON described in your instructions. ` +
        `File list in order: ${docs.map((d, i) => `[${i + 1}] ${d.fileName} (${INCOME_DOC_TYPE_LABELS[d.docType]})`).join(", ")}.`,
    },
    ...docs.map((doc) =>
      doc.mimeType === "application/pdf"
        ? ({ type: "input_file" as const, filename: doc.fileName, file_data: doc.dataUrl })
        : ({ type: "input_image" as const, image_url: doc.dataUrl, detail: "auto" as const })
    ),
  ];

  let raw: string;
  try {
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      instructions: SYSTEM_PROMPT,
      input: [{ role: "user", content }],
    });
    raw = response.output_text;
  } catch (err) {
    const { logMessage, userMessage } = describeOpenAiError(err);
    console.error(`[Realtor Toolbox] Income Analyzer OpenAI request failed: ${logMessage}`);
    throw new Error(userMessage);
  }

  if (!raw) {
    throw new Error("OpenAI response contained no content.");
  }

  let parsed: {
    documents: Array<{
      fileName: string;
      source: string | null;
      payFrequency: IncomePayFrequency;
      grossAmountFound: number | null;
      estimatedMonthlyGross: number | null;
      notes: string | null;
    }>;
    confidenceNote: string;
  };
  try {
    // The model occasionally wraps JSON in a code fence despite instructions — strip that defensively before parsing.
    const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Failed to parse OpenAI JSON response: ${(err as Error).message}`);
  }

  const documents: ExtractedDocumentIncome[] = docs.map((doc, i) => {
    const match = parsed.documents[i];
    const frequency = match?.payFrequency ?? "unknown";
    const grossFound = match?.grossAmountFound ?? null;
    const estimatedMonthly =
      match?.estimatedMonthlyGross ?? (grossFound != null ? normalizeToMonthly(grossFound, frequency) : null);

    return {
      fileName: doc.fileName,
      docType: doc.docType,
      source: match?.source ?? null,
      payFrequency: frequency,
      grossAmountFound: grossFound,
      estimatedMonthlyGross: estimatedMonthly,
      notes: match?.notes ?? null,
    };
  });

  const suggestedMonthlyGross = documents.reduce((sum, d) => sum + (d.estimatedMonthlyGross ?? 0), 0);

  return {
    documents,
    suggestedMonthlyGross,
    confidenceNote: parsed.confidenceNote || "Review each document's figures before relying on this estimate.",
    isDemoData: false,
  };
}

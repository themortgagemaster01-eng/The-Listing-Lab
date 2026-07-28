import { NextResponse } from "next/server";

import { analyzeIncomeDocuments, type IncomeDocumentForAnalysis } from "@/lib/ai/income-service";

/**
 * Income Analyzer's server-only bridge — mirrors
 * `src/app/api/ai/generate-flyer-text/route.ts`'s reasoning (client needs
 * interactivity, so this can't call `OPENAI_API_KEY`-gated code directly).
 *
 * NON-NEGOTIABLE (Robert, 2026-07-28 + `docs/PRODUCT_PRINCIPLES.md` rule
 * #9): this route does NOT import anything from `@/lib/supabase/*`, does
 * NOT write to a database, and does NOT write to disk or any storage
 * bucket. `body.documents[].dataUrl` (the uploaded paystub/W-2/tax
 * return/1099/bank statement bytes) exists only as a local variable for the
 * lifetime of this request — it's handed to `analyzeIncomeDocuments`, which
 * forwards it to OpenAI for this one call and returns a plain estimate
 * object, and then this function returns. Once the response is sent, there
 * is nothing left referencing the document bytes anywhere on the server;
 * they're garbage collected like any other request-scoped variable. If a
 * future change to this route ever needs to persist a document, that must
 * be a new, explicit, opt-in code path (see the "save documents" checkbox
 * in `IncomeAnalyzerWizard.tsx` for where that consent is captured) — never
 * something this route does by default.
 */
export async function POST(request: Request) {
  let body: { documents?: IncomeDocumentForAnalysis[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const documents = body?.documents;
  if (!Array.isArray(documents) || documents.length === 0) {
    return NextResponse.json({ error: "No documents provided." }, { status: 400 });
  }
  if (documents.length > 8) {
    return NextResponse.json({ error: "Too many documents — analyze at most 8 at a time." }, { status: 400 });
  }
  for (const doc of documents) {
    if (!doc?.fileName || !doc?.mimeType || !doc?.dataUrl || !doc?.docType) {
      return NextResponse.json({ error: "Each document needs fileName, mimeType, docType, and dataUrl." }, { status: 400 });
    }
  }

  try {
    const result = await analyzeIncomeDocuments(documents);
    return NextResponse.json({ result });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Income analysis failed unexpectedly." },
      { status: 500 }
    );
  }
}

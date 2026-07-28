import { NextResponse } from "next/server";

import { extractCompsFromPdf } from "@/lib/ai/comps-pdf-service";

/**
 * `pdf-import` comps provider's server-only bridge — same reasoning as
 * `src/app/api/ai/analyze-income/route.ts`: the client needs interactivity,
 * so this can't call `OPENAI_API_KEY`-gated code directly. Unlike the income
 * route, there's no non-persistence mandate here (comp data is generally
 * public record) — this route just doesn't happen to write anything to
 * disk or a database either way.
 */
export async function POST(request: Request) {
  let body: { fileName?: string; dataUrl?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { fileName, dataUrl } = body ?? {};
  if (!fileName || !dataUrl) {
    return NextResponse.json({ error: "fileName and dataUrl are required." }, { status: 400 });
  }

  try {
    const result = await extractCompsFromPdf(fileName, dataUrl);
    return NextResponse.json({ result });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "PDF comp extraction failed unexpectedly." },
      { status: 500 }
    );
  }
}

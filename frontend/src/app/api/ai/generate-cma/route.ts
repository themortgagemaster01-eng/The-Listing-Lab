import { NextResponse } from "next/server";

import { generateMarketCompAnalysis } from "@/lib/market-comp/generate";
import type { MarketComp, MlsQueryCompsInput } from "@/lib/market-comp/types";

/**
 * Server-only bridge for the AI CMA analysis engine — same reasoning as
 * `src/app/api/ai/generate-flyer-text/route.ts`: `OPENAI_API_KEY` isn't
 * `NEXT_PUBLIC_`-prefixed, so the client-side comps wizard (needs
 * interactivity: source picker, editable comp grid, regenerate) must go
 * through this route rather than importing `generate.ts` directly.
 */
export async function POST(request: Request) {
  let body: { propertyId?: string; comps?: MarketComp[]; filters?: MlsQueryCompsInput | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body?.propertyId || !Array.isArray(body.comps) || body.comps.length === 0) {
    return NextResponse.json({ error: "Missing propertyId or at least one comp." }, { status: 400 });
  }

  try {
    const result = await generateMarketCompAnalysis(body.propertyId, body.comps, body.filters ?? null);
    return NextResponse.json({ result });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI CMA generation failed unexpectedly." },
      { status: 500 }
    );
  }
}

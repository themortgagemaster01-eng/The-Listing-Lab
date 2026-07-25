import { NextResponse } from "next/server";

import { generateAsset } from "@/lib/ai/asset-service";
import type { PropertyAiInput } from "@/lib/ai/ai-service";

/**
 * Server-only bridge for the AI writing step (Phase 2 spec item #4).
 *
 * `AIService`/`generateAsset` ultimately reads `process.env.OPENAI_API_KEY`
 * (see `src/lib/ai/openai-client.ts`) — that variable is intentionally NOT
 * `NEXT_PUBLIC_`-prefixed, so it is never available in client-bundled code.
 * The Flyer Generator's AI-writing UI is a client component (it needs
 * interactivity: loading state, inline editing, regenerate), so it must go
 * through this Route Handler rather than importing `asset-service.ts`
 * directly — calling it from the client would always behave as "no key
 * configured" even once Robert adds one, silently losing real AI output.
 */
export async function POST(request: Request) {
  let body: { propertyId?: string; inputs?: PropertyAiInput };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body?.propertyId || !body?.inputs) {
    return NextResponse.json({ error: "Missing propertyId or inputs." }, { status: 400 });
  }

  try {
    const result = await generateAsset({
      type: "flyer",
      propertyId: body.propertyId,
      inputs: body.inputs,
    });
    return NextResponse.json({ result });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI generation failed unexpectedly." },
      { status: 500 }
    );
  }
}

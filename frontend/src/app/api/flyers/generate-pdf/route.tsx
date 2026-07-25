import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";

import { FlyerPdfDocument, type FlyerPdfData } from "@/lib/pdf/FlyerPdfDocument";

/**
 * Server-side PDF export path (Phase 2 spec item #6). Accepts an
 * already-assembled `FlyerPdfData` payload (see
 * `src/lib/pdf/build-flyer-pdf-data.ts`) and renders it with
 * `@react-pdf/renderer`'s `renderToBuffer`, exactly the same document
 * component the client-side path (`generateFlyerPdfBlob.tsx`) uses.
 *
 * Not currently wired up as the default "Download PDF" action — see the
 * comment at the top of `generateFlyerPdfBlob.tsx` and the project report
 * for why client-side rendering is primary in this pass (mock-mode photos
 * are browser-local data URLs with no server-reachable URL, and shipping
 * several full-resolution photos as base64 in a JSON POST body risks
 * serverless request-body size limits). This route is real and functional
 * today — useful for testing, and for a future flow (e.g. "email me a copy",
 * or once Supabase Storage-hosted photo URLs exist) where rendering
 * server-side is the better trade-off.
 */
export const runtime = "nodejs";

export async function POST(request: Request) {
  let data: FlyerPdfData;
  try {
    data = (await request.json()) as FlyerPdfData;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!data?.address || !data?.text) {
    return NextResponse.json({ error: "Missing required flyer PDF fields." }, { status: 400 });
  }

  try {
    const buffer = await renderToBuffer(<FlyerPdfDocument data={data} />);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${(data.address || "flyer").replace(/[^a-z0-9]+/gi, "-")}-flyer.pdf"`,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "PDF generation failed unexpectedly." },
      { status: 500 }
    );
  }
}

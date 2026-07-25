import type { FlyerTextContent } from "@/lib/supabase/types";
import type { FlyerPhoto, FlyerRecord, PropertyFormData } from "@/lib/flyer/types";

/**
 * Client-side PDF export path — chosen as the PRIMARY export mechanism (see
 * the project report for the full server-vs-client rationale). Short
 * version: in mock/local mode (no Supabase Storage configured, which is
 * every environment right now) photos only exist as browser-local data
 * URLs, so a server Route Handler would need the full base64 payload of
 * every photo shipped to it anyway — `@react-pdf/renderer`'s `pdf().toBlob()`
 * does the identical rendering work already loaded in the browser with zero
 * network round-trip and no serverless request-body size ceiling to worry
 * about. `/api/flyers/generate-pdf` still exists and works (see that route)
 * for a future server-triggered flow once Storage-hosted photo URLs exist.
 *
 * `@react-pdf/renderer` and `FlyerPdfDocument` are loaded via a dynamic
 * `import()` INSIDE this function rather than statically at the top of the
 * file. Two reasons: (1) it's a genuinely heavy dependency (font/layout
 * engine) that has no business being in this route's initial JS bundle when
 * most visits never click "Download PDF"; (2) `@react-pdf/renderer` ships
 * separate browser/Node builds behind package.json `exports` conditions,
 * and a static top-level import got pulled into this page's server-side
 * render pass (Next.js SSRs the initial HTML for "use client" components
 * too) where the wrong build resolved — a static import here reproduced a
 * React "Element type is invalid" crash on `/property/[id]/marketing-assets`
 * during development. Deferring the import to only run inside this
 * click-triggered, browser-only function avoids the SSR pass entirely.
 */
export async function generateFlyerPdfBlob(params: {
  form: PropertyFormData;
  photos: FlyerPhoto[];
  flyer: Pick<FlyerRecord, "propertyId" | "template">;
  text: FlyerTextContent;
}): Promise<Blob> {
  const [{ pdf }, { FlyerPdfDocument }, { buildFlyerPdfData }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("@/lib/pdf/FlyerPdfDocument"),
    import("@/lib/pdf/build-flyer-pdf-data"),
  ]);
  const data = await buildFlyerPdfData(params);
  const instance = pdf(<FlyerPdfDocument data={data} />);
  return instance.toBlob();
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

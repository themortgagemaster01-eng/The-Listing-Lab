import type { PropertyFormData } from "@/lib/flyer/types";
import type { PaymentSnapshotResults } from "@/lib/payment/types";

/**
 * Client-side PDF export path for the Payment Snapshot feature — mirrors
 * `src/lib/pdf/generateFlyerPdfBlob.tsx` exactly, including WHY: photos in
 * local/mock mode only exist as browser-local data URLs, so
 * `@react-pdf/renderer`'s `pdf().toBlob()` renders entirely client-side with
 * zero network round-trip and no serverless payload-size ceiling.
 *
 * `@react-pdf/renderer` and `PaymentSnapshotPdfDocument` are loaded via a
 * dynamic `import()` INSIDE this function rather than statically at the top
 * of the file — same SSR-crash-avoidance reason documented in
 * `generateFlyerPdfBlob.tsx`'s header comment (a static top-level import
 * gets pulled into this page's server-side render pass and resolves the
 * wrong `@react-pdf/renderer` build). Deferring the import to only run
 * inside this click-triggered, browser-only function avoids the SSR pass
 * entirely.
 */
export async function generatePaymentSnapshotPdfBlob(params: {
  property: PropertyFormData;
  heroPhotoUrl: string | null;
  results: PaymentSnapshotResults;
}): Promise<Blob> {
  const [{ pdf }, { PaymentSnapshotPdfDocument }, { buildPaymentSnapshotPdfData }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("@/lib/pdf/PaymentSnapshotPdfDocument"),
    import("@/lib/pdf/build-payment-snapshot-pdf-data"),
  ]);
  const data = await buildPaymentSnapshotPdfData(params);
  const instance = pdf(<PaymentSnapshotPdfDocument data={data} />);
  return instance.toBlob();
}

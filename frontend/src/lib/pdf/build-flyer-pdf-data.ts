import type { FlyerTextContent } from "@/lib/supabase/types";
import type { FlyerPdfData } from "@/lib/pdf/FlyerPdfDocument";
import type { FlyerPhoto, FlyerRecord, PropertyFormData } from "@/lib/flyer/types";
import { formatCurrency, formatStatsLine, parseNumberField } from "@/lib/flyer/mappers";
import { buildPropertyQrUrl, generateQrCodeDataUrl } from "@/lib/pdf/qrcode";

/**
 * Assembles the flat `FlyerPdfData` shape `FlyerPdfDocument` renders, from
 * the property form + photo list + a flyer's (possibly user-edited) text.
 * Shared by both the client-side export path
 * (`generateFlyerPdfBlob.ts`, used by the "Download PDF" button today) and
 * available for the server Route Handler (`/api/flyers/generate-pdf`) to
 * reuse if a payload is built server-side in the future.
 */
export async function buildFlyerPdfData(params: {
  form: PropertyFormData;
  photos: FlyerPhoto[];
  flyer: Pick<FlyerRecord, "propertyId" | "template">;
  text: FlyerTextContent;
}): Promise<FlyerPdfData> {
  const { form, photos, flyer, text } = params;
  const orderedPhotos = [...photos].sort((a, b) => {
    if (a.isCover !== b.isCover) return a.isCover ? -1 : 1;
    return a.displayOrder - b.displayOrder;
  });

  const qrUrl = buildPropertyQrUrl(flyer.propertyId);
  const qrDataUrl = await generateQrCodeDataUrl(qrUrl);

  return {
    template: flyer.template,
    address: form.address || "Untitled Property",
    cityStateZip: form.cityStateZip,
    priceLabel: formatCurrency(parseNumberField(form.price)),
    statsLine: formatStatsLine(form),
    mlsNumber: form.mlsNumber,
    lotSize: form.lotSize,
    yearBuilt: form.yearBuilt,
    propertyType: form.propertyType,
    text,
    photos: orderedPhotos.map((p) => p.url),
    agentName: form.agentName,
    agentEmail: form.agentEmail,
    agentPhone: form.agentPhone,
    agentPhotoUrl: form.agentPhotoUrl || null,
    qrDataUrl,
  };
}

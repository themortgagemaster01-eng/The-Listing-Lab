import type { PaymentSnapshotPdfData } from "@/lib/pdf/PaymentSnapshotPdfDocument";
import type { PropertyFormData } from "@/lib/flyer/types";
import { formatCurrency, parseNumberField } from "@/lib/flyer/mappers";
import { PAYMENT_SNAPSHOT_DISCLAIMER, type PaymentSnapshotResults } from "@/lib/payment/types";
import { buildAgentContactQrUrl, generateQrCodeDataUrl } from "@/lib/pdf/qrcode";

/**
 * Assembles the flat `PaymentSnapshotPdfData` shape `PaymentSnapshotPdfDocument`
 * renders, from the property/agent form + a snapshot's last-computed
 * results. Mirrors `src/lib/pdf/build-flyer-pdf-data.ts` exactly — shared by
 * the client-side export path (`generatePaymentSnapshotPdfBlob.tsx`).
 */
export async function buildPaymentSnapshotPdfData(params: {
  property: PropertyFormData;
  heroPhotoUrl: string | null;
  results: PaymentSnapshotResults;
}): Promise<PaymentSnapshotPdfData> {
  const { property, heroPhotoUrl, results } = params;

  // Per the "no fake data presented as real" constraint, the QR code only
  // ever encodes a real value: the agent's real application URL, or a
  // mailto:/tel: link built from their real email/phone. If none of those
  // are set, `qrUrl` is null and the PDF simply omits the QR block.
  const qrUrl = buildAgentContactQrUrl({
    agentApplicationUrl: property.agentApplicationUrl,
    agentEmail: property.agentEmail,
    agentPhone: property.agentPhone,
  });
  const qrDataUrl = qrUrl ? await generateQrCodeDataUrl(qrUrl) : null;

  return {
    address: property.address || "Untitled Property",
    cityStateZip: property.cityStateZip,
    heroPhotoUrl,
    purchasePriceLabel: formatCurrency(parseNumberField(property.price)),
    programResults: results.programResults,
    closingCosts: results.closingCosts,
    totalClosingCosts: results.totalClosingCosts,
    agentName: property.agentName,
    agentEmail: property.agentEmail,
    agentPhone: property.agentPhone,
    agentPhotoUrl: property.agentPhotoUrl || null,
    qrDataUrl,
    disclaimer: `${PAYMENT_SNAPSHOT_DISCLAIMER} Contact ${property.agentName || "your agent"} for an accurate, personalized quote.`,
    preparedDate: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
  };
}

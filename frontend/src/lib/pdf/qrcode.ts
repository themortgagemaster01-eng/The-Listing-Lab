import QRCode from "qrcode";

/**
 * Builds the public-facing URL a flyer's QR code should point to.
 *
 * There is no separate public Property Website feature yet — this points
 * at a placeholder path on the app's own domain for now. TODO: once the
 * public Property Website feature exists, point this at that page's real
 * public URL instead.
 */
export function buildPropertyQrUrl(propertyId: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://the-listing-lab.vercel.app";
  return `${base.replace(/\/$/, "")}/property/${propertyId}`;
}

/** Renders a QR code as a PNG data URL — works identically in the browser and in a Node.js Route Handler. */
export async function generateQrCodeDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    margin: 1,
    width: 320,
    color: {
      dark: "#0f1f3d",
      light: "#ffffff",
    },
  });
}

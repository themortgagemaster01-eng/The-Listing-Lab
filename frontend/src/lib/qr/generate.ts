import QRCode from "qrcode";

/**
 * QR Code Studio's generation layer — separate from `src/lib/pdf/qrcode.ts`
 * (which is purpose-built for the Payment Snapshot / Website Generator PDF
 * flows, with fixed colors/margin baked in). This one exposes the same
 * underlying `qrcode` package with the color/size the Studio's UI lets a
 * user configure, plus an SVG variant for print use (scales cleanly on a
 * yard sign or flyer, unlike a raster PNG).
 *
 * Runs identically in the browser and on the server — same package, same
 * Promise-based API `generateQrCodeDataUrl` in `pdf/qrcode.ts` already
 * relies on client-side (see `WebsiteGeneratorWizard.tsx`).
 */

export interface QrStudioOptions {
  /** Foreground ("dark") module color. Defaults to the app's navy. */
  color?: string;
  /** Pixel size for the PNG variant. The SVG variant is resolution-independent. */
  size?: number;
}

const DEFAULT_COLOR = "#0f1f3d";
const DEFAULT_SIZE = 480;

/** Renders a real, scannable QR code as a PNG data URL. */
export async function generateQrPngDataUrl(text: string, options: QrStudioOptions = {}): Promise<string> {
  return QRCode.toDataURL(text, {
    margin: 2,
    width: options.size ?? DEFAULT_SIZE,
    color: {
      dark: options.color ?? DEFAULT_COLOR,
      light: "#ffffff",
    },
  });
}

/** Renders a real, scannable QR code as raw SVG markup — for crisp print output at any size. */
export async function generateQrSvgMarkup(text: string, options: QrStudioOptions = {}): Promise<string> {
  return QRCode.toString(text, {
    type: "svg",
    margin: 2,
    color: {
      dark: options.color ?? DEFAULT_COLOR,
      light: "#ffffff",
    },
  });
}

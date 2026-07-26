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

/**
 * Builds the URL the Payment Snapshot PDF's QR code should point to: the
 * agent's real mortgage application/contact link when set
 * (`PropertyFormData.agentApplicationUrl`), otherwise a `mailto:`/`tel:`
 * link built from whichever real agent contact field is present.
 *
 * There is no fake/placeholder URL fallback here on purpose (see the
 * Payment Snapshot feature's "no fake data presented as real" constraint) —
 * if none of applicationUrl/email/phone are set, this returns `null` and
 * the caller must omit the QR block entirely rather than encode an empty
 * or fabricated link.
 */
export function buildAgentContactQrUrl(agent: {
  agentApplicationUrl?: string | null;
  agentEmail?: string | null;
  agentPhone?: string | null;
}): string | null {
  const applicationUrl = agent.agentApplicationUrl?.trim();
  if (applicationUrl) return applicationUrl;

  const email = agent.agentEmail?.trim();
  if (email) return `mailto:${email}`;

  const phone = agent.agentPhone?.trim();
  if (phone) return `tel:${phone.replace(/[^0-9+]/g, "")}`;

  return null;
}

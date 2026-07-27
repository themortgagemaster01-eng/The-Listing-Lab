/**
 * Builds the v1 "lead capture" CTAs for the public Listing Presentation
 * Site (`src/app/site/[slug]/page.tsx`'s `#contact` section). There is no
 * leads table / CRM integration yet (tracked as future work, not a gap
 * introduced by this feature) — so every CTA is honestly implemented as a
 * zero-config `mailto:`/`tel:` link pre-filled with a subject/body
 * referencing the property, rather than a form that goes nowhere.
 *
 * Follows the same "never fabricate, always fall back to something real"
 * rule as `buildAgentContactQrUrl` in `src/lib/pdf/qrcode.ts`: prefers a
 * `mailto:` to the agent's real email, falls back to a `tel:` link if only
 * a phone is on file, and returns `null` (never a broken/empty link) if
 * neither is set — the caller must omit the CTA entirely in that case.
 */

export interface LeadCtaAgent {
  agentEmail?: string | null;
  agentPhone?: string | null;
}

export interface LeadCtaProperty {
  address?: string | null;
  cityStateZip?: string | null;
}

export function buildLeadCtaMailto(agent: LeadCtaAgent, property: LeadCtaProperty, subjectPrefix: string): string | null {
  const addressLine = [property.address, property.cityStateZip].filter(Boolean).join(", ") || "this listing";
  const subject = encodeURIComponent(`${subjectPrefix} — ${addressLine}`);
  const body = encodeURIComponent(
    `Hi,\n\nI'm interested in ${addressLine} and would like to ${subjectPrefix.toLowerCase()}.\n\nThanks!`
  );

  const email = agent.agentEmail?.trim();
  if (email) return `mailto:${email}?subject=${subject}&body=${body}`;

  const phone = agent.agentPhone?.trim();
  if (phone) return `tel:${phone.replace(/[^0-9+]/g, "")}`;

  return null;
}

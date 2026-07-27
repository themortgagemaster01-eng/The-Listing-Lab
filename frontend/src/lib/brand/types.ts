import type { BrandProfile } from "@/lib/supabase/types";

/**
 * Form-editable shape of a Brand Center profile — all-string/string[] (form
 * inputs), unlike `BrandProfile` in `@/lib/supabase/types` which allows
 * `null` for unset fields. Mirrors the "form data is always strings, mapped
 * to nullable DB columns at the persistence boundary" convention already
 * used by `PropertyFormData` (`src/lib/flyer/types.ts`).
 */
export interface BrandProfileFormData {
  // Professional Identity
  headshotUrl: string;
  logoUrl: string;
  signatureUrl: string;
  bio: string;
  brokerageName: string;
  designations: string[];
  languages: string[];
  serviceAreas: string[];

  // Contact
  phone: string;
  email: string;
  website: string;
  bookingLink: string;

  // Mortgage (optional)
  nmlsNumber: string;
  mortgageCompany: string;
  applicationUrl: string;
  licenseStates: string[];

  // Social
  facebookUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
}

export function emptyBrandProfileForm(overrides: Partial<BrandProfileFormData> = {}): BrandProfileFormData {
  return {
    headshotUrl: "",
    logoUrl: "",
    signatureUrl: "",
    bio: "",
    brokerageName: "",
    designations: [],
    languages: [],
    serviceAreas: [],
    phone: "",
    email: "",
    website: "",
    bookingLink: "",
    nmlsNumber: "",
    mortgageCompany: "",
    applicationUrl: "",
    licenseStates: [],
    facebookUrl: "",
    instagramUrl: "",
    linkedinUrl: "",
    youtubeUrl: "",
    ...overrides,
  };
}

export function brandProfileToForm(profile: BrandProfile): BrandProfileFormData {
  return emptyBrandProfileForm({
    headshotUrl: profile.headshotUrl ?? "",
    logoUrl: profile.logoUrl ?? "",
    signatureUrl: profile.signatureUrl ?? "",
    bio: profile.bio ?? "",
    brokerageName: profile.brokerageName ?? "",
    designations: profile.designations,
    languages: profile.languages,
    serviceAreas: profile.serviceAreas,
    phone: profile.phone ?? "",
    email: profile.email ?? "",
    website: profile.website ?? "",
    bookingLink: profile.bookingLink ?? "",
    nmlsNumber: profile.nmlsNumber ?? "",
    mortgageCompany: profile.mortgageCompany ?? "",
    applicationUrl: profile.applicationUrl ?? "",
    licenseStates: profile.licenseStates,
    facebookUrl: profile.facebookUrl ?? "",
    instagramUrl: profile.instagramUrl ?? "",
    linkedinUrl: profile.linkedinUrl ?? "",
    youtubeUrl: profile.youtubeUrl ?? "",
  });
}

// ---------------------------------------------------------------------------
// Completion tracking
// ---------------------------------------------------------------------------

export type BrandSectionKey = "identity" | "contact" | "mortgage" | "social";

export interface BrandSectionDef {
  key: BrandSectionKey;
  label: string;
  /** Short explanation shown near the live preview — the "why" for filling this in. */
  payoff: string;
  fields: (keyof BrandProfileFormData)[];
}

function isFieldFilled(value: string | string[]): boolean {
  return Array.isArray(value) ? value.length > 0 : value.trim().length > 0;
}

export const BRAND_SECTIONS: BrandSectionDef[] = [
  {
    key: "identity",
    label: "Professional Identity",
    payoff: "Your headshot, logo, and bio appear on every flyer, website, and report you generate.",
    fields: [
      "headshotUrl",
      "logoUrl",
      "signatureUrl",
      "bio",
      "brokerageName",
      "designations",
      "languages",
      "serviceAreas",
    ],
  },
  {
    key: "contact",
    label: "Contact",
    payoff: "Buyers and sellers see this phone, email, and booking link on everything you share.",
    fields: ["phone", "email", "website", "bookingLink"],
  },
  {
    key: "mortgage",
    label: "Mortgage (optional)",
    payoff: "Powers the Mortgage Center and payment estimates — skip this if you're not a loan officer.",
    fields: ["nmlsNumber", "mortgageCompany", "applicationUrl", "licenseStates"],
  },
  {
    key: "social",
    label: "Social",
    payoff: "Follow buttons on your listing websites link straight to these profiles.",
    fields: ["facebookUrl", "instagramUrl", "linkedinUrl", "youtubeUrl"],
  },
];

export interface BrandSectionProgress {
  key: BrandSectionKey;
  label: string;
  filled: number;
  total: number;
  percent: number;
}

export interface BrandCompletion {
  overallPercent: number;
  filledFields: number;
  totalFields: number;
  sections: BrandSectionProgress[];
}

export function computeBrandCompletion(form: BrandProfileFormData): BrandCompletion {
  let filledFields = 0;
  let totalFields = 0;

  const sections: BrandSectionProgress[] = BRAND_SECTIONS.map((section) => {
    const filled = section.fields.filter((field) => isFieldFilled(form[field])).length;
    const total = section.fields.length;
    filledFields += filled;
    totalFields += total;
    return {
      key: section.key,
      label: section.label,
      filled,
      total,
      percent: total === 0 ? 0 : Math.round((filled / total) * 100),
    };
  });

  return {
    overallPercent: totalFields === 0 ? 0 : Math.round((filledFields / totalFields) * 100),
    filledFields,
    totalFields,
    sections,
  };
}

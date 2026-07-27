/**
 * Client-facing types for the Payment Snapshot feature
 * (`components/property/payment/*`), mirroring the structure of
 * `src/lib/flyer/types.ts` exactly: form/input types kept as controlled-
 * input-friendly strings, a `*Record` type mirroring `FlyerRecord`'s shape
 * (id/marketingAssetId/propertyId/…/version), and persistence
 * (`src/lib/payment/persistence.ts`) as the only place that maps between
 * this shape and the raw Supabase row shape.
 */

/**
 * The loan programs a Realtor can compare side-by-side. See
 * `src/lib/payment/calculations.ts` for the (explicitly illustrative, not
 * bank-grade) math behind each one.
 */
export type LoanProgram = "conventional" | "fha" | "va" | "homestyle" | "sonyma";

export const LOAN_PROGRAM_LABELS: Record<LoanProgram, string> = {
  conventional: "Conventional",
  fha: "FHA",
  va: "VA",
  homestyle: "HomeStyle Renovation",
  sonyma: "SONYMA",
};

/** Short illustrative blurb shown in the UI next to each program's checkbox/column. */
export const LOAN_PROGRAM_DESCRIPTIONS: Record<LoanProgram, string> = {
  conventional: "Standard fixed-rate mortgage. PMI applies if down payment is under 20%.",
  fha: "3.5% minimum down payment. Includes upfront + annual mortgage insurance premium (MIP).",
  va: "For eligible veterans/service members. No PMI; includes a one-time VA funding fee.",
  homestyle: "Conventional-equivalent renovation loan. Base mortgage math shown; add renovation costs manually.",
  sonyma: "NY State down-payment assistance for eligible buyers. Enter your county's limits below to check eligibility.",
};

/**
 * SONYMA eligibility depends on real, county-by-county income and purchase-
 * price limit tables (published/updated by NY Homes and Community Renewal)
 * that are too granular and too likely to go stale to hardcode responsibly
 * into this app. Instead of a real lookup table, the Realtor enters their
 * buyer's numbers AND the current limits for their county (looked up at
 * hcr.ny.gov/income-limits), and `evaluateSonymaEligibility` in
 * `calculations.ts` compares them — a real eligibility check, just backed by
 * user-entered rather than baked-in figures.
 */
export interface SonymaEligibilityInput {
  /** SONYMA generally requires being a first-time homebuyer OR purchasing in a designated target area. */
  isEligibleBuyerType: boolean;
  householdSize: "1-2" | "3+";
  annualIncome: string;
  countyIncomeLimit: string;
  countyPurchasePriceLimit: string;
}

export function emptySonymaEligibilityInput(): SonymaEligibilityInput {
  return {
    isEligibleBuyerType: false,
    householdSize: "1-2",
    annualIncome: "",
    countyIncomeLimit: "",
    countyPurchasePriceLimit: "",
  };
}

/** Per-program user-editable settings — every selected program gets its own rate. */
export interface LoanProgramInput {
  enabled: boolean;
  /** Kept as a string for controlled-input friendliness, parsed at the calculation boundary. */
  ratePercent: string;
}

export type LoanProgramInputMap = Record<LoanProgram, LoanProgramInput>;

/** Editable Payment Snapshot form fields. */
export interface PaymentFormData {
  purchasePrice: string;
  /** Two-way synced with downPaymentPercent — see PaymentInputsForm.tsx. */
  downPaymentAmount: string;
  downPaymentPercent: string;
  propertyTaxAnnual: string;
  homeInsuranceAnnual: string;
  /** Optional — blank/"0" means "no HOA" and must be omitted from every downstream display/PDF, never shown as "$0 HOA". */
  hoaMonthly: string;
  loanTermYears: string;
  programs: LoanProgramInputMap;
  /** Optional — absent on snapshots saved before this field existed; always fall back to `emptySonymaEligibilityInput()` when reading. */
  sonymaEligibility?: SonymaEligibilityInput;
}

export function defaultLoanProgramInputMap(defaultRate = "6.5"): LoanProgramInputMap {
  return {
    conventional: { enabled: true, ratePercent: defaultRate },
    fha: { enabled: false, ratePercent: defaultRate },
    va: { enabled: false, ratePercent: defaultRate },
    homestyle: { enabled: false, ratePercent: defaultRate },
    sonyma: { enabled: false, ratePercent: defaultRate },
  };
}

export function emptyPaymentForm(seed?: Partial<PaymentFormData>): PaymentFormData {
  return {
    purchasePrice: "",
    downPaymentAmount: "",
    downPaymentPercent: "20",
    propertyTaxAnnual: "",
    homeInsuranceAnnual: "",
    hoaMonthly: "",
    loanTermYears: "30",
    programs: defaultLoanProgramInputMap(),
    sonymaEligibility: emptySonymaEligibilityInput(),
    ...seed,
  };
}

// ---------------------------------------------------------------------------
// Computed results
// ---------------------------------------------------------------------------

export interface ClosingCostLineItem {
  label: string;
  amount: number;
}

/** Full computed breakdown for a single loan program — one column in `LoanComparisonTable`. */
export interface LoanProgramResult {
  program: LoanProgram;
  label: string;
  ratePercent: number;
  termYears: number;
  /** Down payment percent actually used (may be raised to a program minimum, e.g. FHA's 3.5%). */
  downPaymentPercent: number;
  downPaymentAmount: number;
  /** Purchase price minus down payment, before any financed upfront fee. */
  baseLoanAmount: number;
  /** Upfront fee amount financed into the loan (FHA upfront MIP, VA funding fee) — $0 for programs with none. */
  financedFeeAmount: number;
  /** baseLoanAmount + financedFeeAmount — the amount P&I is actually calculated on. */
  totalLoanAmount: number;
  monthlyPI: number;
  /** Monthly PMI (conventional/HomeStyle/SONYMA) or annual MIP/12 (FHA). $0 for VA. */
  monthlyMortgageInsurance: number;
  monthlyTax: number;
  monthlyInsurance: number;
  /** $0 when the property has no HOA — UI/PDF must omit the row entirely rather than show $0. */
  monthlyHoa: number;
  totalMonthly: number;
  /** Cash needed at closing for this program: down payment + non-financed closing costs. Financed fees are NOT included. */
  cashToClose: number;
  /** Short, program-specific caveats surfaced next to this column (e.g. SONYMA's placeholder note). */
  notes: string[];
}

export interface PaymentSnapshotResults {
  programResults: LoanProgramResult[];
  closingCosts: ClosingCostLineItem[];
  totalClosingCosts: number;
  computedAt: string;
}

export type PaymentSnapshotStatus = "draft" | "final";

/**
 * A single generated Payment Snapshot (one `marketing_assets` row + its
 * child `payment_snapshots` row, flattened into one client-side object) —
 * mirrors `FlyerRecord`. A property can have multiple snapshots over time
 * (e.g. re-run with different rates), each its own card.
 */
export interface PaymentSnapshotRecord {
  id: string;
  marketingAssetId: string;
  propertyId: string;
  title: string;
  inputs: PaymentFormData;
  results: PaymentSnapshotResults | null;
  pdfUrl: string | null;
  status: PaymentSnapshotStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * The disclaimer required on BOTH the on-screen UI and the exported PDF
 * (per the Payment Snapshot feature spec) — one shared string so the two
 * surfaces never drift out of sync.
 */
export const PAYMENT_SNAPSHOT_DISCLAIMER =
  "This is an illustrative estimate only, not a loan offer or commitment to lend. Actual payment, rate, and closing costs are subject to underwriting approval and current market rates.";

import { parseNumberField } from "@/lib/flyer/mappers";
import {
  LOAN_PROGRAM_LABELS,
  type ClosingCostLineItem,
  type LoanProgram,
  type LoanProgramResult,
  type PaymentFormData,
  type PaymentSnapshotResults,
} from "@/lib/payment/types";

/**
 * Pure calculation functions for the Payment Snapshot feature. Every
 * function here is explicitly ILLUSTRATIVE, not bank-grade — this tool is a
 * client-facing "here's roughly what this could cost you" presentation, not
 * an underwriting engine. Every UI/PDF surface using these numbers must
 * carry the disclaimer in `PAYMENT_SNAPSHOT_DISCLAIMER`
 * (`src/lib/payment/types.ts`).
 *
 * All functions handle zero/negative/blank input gracefully — they return
 * 0 rather than NaN/Infinity — mirroring `parseNumberField`/`parseIntField`
 * in `src/lib/flyer/mappers.ts` (reused directly below rather than
 * reimplemented).
 */

/** Clamps to a finite, non-negative number — the one guard every function below runs its inputs through. */
function safeNumber(value: number | undefined | null): number {
  if (value == null || !Number.isFinite(value)) return 0;
  return Math.max(value, 0);
}

/**
 * Standard fixed-rate amortization formula for the monthly principal &
 * interest payment. Identical to the formula already used in the legacy
 * `components/property/PaymentsTab.tsx` calculator — reused verbatim rather
 * than rederived so the two never quietly disagree.
 */
export function calculateMonthlyPI(loanAmount: number, annualRatePercent: number, termYears: number): number {
  const principal = safeNumber(loanAmount);
  const rate = safeNumber(annualRatePercent);
  const term = safeNumber(termYears);

  const monthlyRate = rate / 100 / 12;
  const numPayments = term * 12;
  if (numPayments <= 0 || principal <= 0) return 0;
  if (monthlyRate === 0) return principal / numPayments;
  const factor = Math.pow(1 + monthlyRate, numPayments);
  if (!Number.isFinite(factor) || factor - 1 === 0) return 0;
  return (principal * (monthlyRate * factor)) / (factor - 1);
}

/**
 * Straightforward "down payment + non-financed closing costs" sum. Financed
 * fees (FHA upfront MIP, VA funding fee) are NOT part of cash-to-close —
 * they're rolled into the loan balance instead, so callers must not pass
 * them in via `closingCosts`.
 *
 * `purchasePrice` is used only to clamp `downPaymentAmount` into a sane
 * range (never more than the purchase price itself) — protects against a
 * stray/garbled input producing a nonsensical "cash to close" figure.
 */
export function calculateCashToClose(
  purchasePrice: number,
  downPaymentAmount: number,
  closingCosts: number
): number {
  const price = safeNumber(purchasePrice);
  const clampedDown = price > 0 ? Math.min(safeNumber(downPaymentAmount), price) : safeNumber(downPaymentAmount);
  return clampedDown + safeNumber(closingCosts);
}

/**
 * Closing cost line items — extends the NY-specific estimates already used
 * by the legacy `components/property/ClosingCostsTab.tsx` calculator
 * (title insurance, NY transfer tax, attorney fees, municipal/tax search,
 * recording fees) rather than reinventing them, plus a loan origination fee
 * based on the actual loan amount (more accurate than a flat % of price,
 * and lets origination cost differ slightly between programs whose loan
 * amount differs, e.g. FHA's financed upfront MIP).
 */
export function calculateClosingCosts(purchasePrice: number, loanAmountForOrigination: number): ClosingCostLineItem[] {
  const price = safeNumber(purchasePrice);
  const loanAmount = safeNumber(loanAmountForOrigination);
  return [
    { label: "Title Insurance", amount: price * 0.0045 },
    { label: "NY State Transfer Tax", amount: price * 0.004 },
    { label: "Attorney Fees", amount: 1500 },
    { label: "Municipal & Tax Search", amount: 400 },
    { label: "Recording Fees", amount: 250 },
    { label: "Loan Origination Fee (est.)", amount: loanAmount * 0.005 },
  ];
}

interface ProgramMathParams {
  purchasePrice: number;
  userDownPaymentPercent: number;
  ratePercent: number;
  termYears: number;
  annualPropertyTax: number;
  annualHomeInsurance: number;
  monthlyHoa: number;
}

/**
 * Computes the full comparison-table column for a single loan program.
 * Program-specific adjustments (all clearly illustrative — see inline
 * comments) are applied here; the base P&I/tax/insurance/HOA math is
 * shared across every program.
 */
export function calculateProgramResult(program: LoanProgram, params: ProgramMathParams): LoanProgramResult {
  const purchasePrice = safeNumber(params.purchasePrice);
  const rate = safeNumber(params.ratePercent);
  const term = safeNumber(params.termYears) || 30;
  const annualTax = safeNumber(params.annualPropertyTax);
  const annualInsurance = safeNumber(params.annualHomeInsurance);
  const monthlyHoa = safeNumber(params.monthlyHoa);
  const userDownPercent = Math.min(Math.max(safeNumber(params.userDownPaymentPercent), 0), 100);

  let downPaymentPercent = userDownPercent;
  let financedFeeAmount = 0;
  const notes: string[] = [];

  // ---- program-specific down payment / financed-fee adjustments ----
  switch (program) {
    case "fha":
      // FHA's actual minimum down payment is 3.5% (for credit scores >=
      // 580) — if the user's chosen percent is lower, illustrate FHA at
      // its real minimum rather than an unrealistic sub-3.5% scenario.
      downPaymentPercent = Math.max(userDownPercent, 3.5);
      notes.push("Assumes FHA's 3.5% minimum down payment.");
      break;
    case "va":
      // VA allows 0% down for eligible borrowers — the user's chosen
      // percent (including 0) is used as-is.
      notes.push("VA loans typically require no down payment for eligible borrowers.");
      break;
    case "sonyma":
      notes.push(
        "SONYMA has its own income limits, purchase price limits, and often-subsidized rates not modeled here — this is a placeholder comparison row, not a real SONYMA calculator."
      );
      break;
    case "homestyle":
      notes.push("Shown as base mortgage math only — add renovation costs manually; this does not model a separate renovation-cost line.");
      break;
    default:
      break;
  }

  const downPaymentAmount = (purchasePrice * downPaymentPercent) / 100;
  const baseLoanAmount = Math.max(purchasePrice - downPaymentAmount, 0);

  // ---- upfront fees financed into the loan (not part of cash-to-close) ----
  if (program === "fha") {
    // FHA upfront MIP: 1.75% of the base loan amount, typically financed
    // into the loan rather than paid in cash at closing.
    financedFeeAmount = baseLoanAmount * 0.0175;
  } else if (program === "va") {
    // VA funding fee: illustrative first-use rate (~2.15% at 0% down).
    // Actual rate varies by down payment size, service history, and
    // prior VA loan use — this is a single illustrative rate, not a
    // lookup table.
    notes.push("Funding fee shown at the illustrative first-use, 0%-down rate (2.15%); actual rate varies by down payment, service history, and prior VA loan use.");
    financedFeeAmount = baseLoanAmount * 0.0215;
  }

  const totalLoanAmount = baseLoanAmount + financedFeeAmount;
  const monthlyPI = calculateMonthlyPI(totalLoanAmount, rate, term);

  // ---- monthly mortgage insurance ----
  let monthlyMortgageInsurance = 0;
  if (program === "fha") {
    // FHA annual MIP: ~0.55%/yr of the loan amount — industry-typical
    // illustrative rate; actual MIP varies by LTV and loan term.
    monthlyMortgageInsurance = (totalLoanAmount * 0.0055) / 12;
  } else if (program === "va") {
    monthlyMortgageInsurance = 0; // VA loans never carry PMI/MIP.
  } else if (downPaymentPercent < 20) {
    // Conventional / HomeStyle / SONYMA: ~0.5%/yr PMI when down payment
    // is under 20% — matches the legacy PaymentsTab.tsx calculator.
    monthlyMortgageInsurance = (baseLoanAmount * 0.005) / 12;
  }

  const monthlyTax = annualTax / 12;
  const monthlyInsurance = annualInsurance / 12;
  const totalMonthly = monthlyPI + monthlyMortgageInsurance + monthlyTax + monthlyInsurance + monthlyHoa;

  const closingCosts = calculateClosingCosts(purchasePrice, baseLoanAmount);
  const totalClosingCosts = closingCosts.reduce((sum, item) => sum + item.amount, 0);
  const cashToClose = calculateCashToClose(purchasePrice, downPaymentAmount, totalClosingCosts);

  return {
    program,
    label: LOAN_PROGRAM_LABELS[program],
    ratePercent: rate,
    termYears: term,
    downPaymentPercent,
    downPaymentAmount,
    baseLoanAmount,
    financedFeeAmount,
    totalLoanAmount,
    monthlyPI,
    monthlyMortgageInsurance,
    monthlyTax,
    monthlyInsurance,
    monthlyHoa,
    totalMonthly,
    cashToClose,
    notes,
  };
}

/**
 * Top-level entry point: parses a `PaymentFormData` (string form fields)
 * into numbers and computes every enabled program's comparison column plus
 * the shared closing-cost breakdown. Used by both the live on-screen
 * preview and the PDF export data builder, so the two can never disagree.
 */
export function buildPaymentSnapshotResults(form: PaymentFormData): PaymentSnapshotResults {
  const purchasePrice = safeNumber(parseNumberField(form.purchasePrice));
  const userDownPaymentPercent = safeNumber(parseNumberField(form.downPaymentPercent));
  const annualPropertyTax = safeNumber(parseNumberField(form.propertyTaxAnnual));
  const annualHomeInsurance = safeNumber(parseNumberField(form.homeInsuranceAnnual));
  const monthlyHoa = safeNumber(parseNumberField(form.hoaMonthly));
  const termYears = safeNumber(parseNumberField(form.loanTermYears)) || 30;

  const enabledPrograms = (Object.keys(form.programs) as LoanProgram[]).filter((p) => form.programs[p]?.enabled);
  // Conventional is always shown, even if somehow toggled off — every
  // snapshot needs at least a baseline column.
  if (!enabledPrograms.includes("conventional")) enabledPrograms.unshift("conventional");

  const programResults = enabledPrograms.map((program) =>
    calculateProgramResult(program, {
      purchasePrice,
      userDownPaymentPercent,
      ratePercent: safeNumber(parseNumberField(form.programs[program]?.ratePercent ?? "")),
      termYears,
      annualPropertyTax,
      annualHomeInsurance,
      monthlyHoa,
    })
  );

  // Closing costs shown in the standalone Cash-to-Close card use the
  // conventional/first-selected program's base loan amount for the
  // origination-fee line (each program's own column already has its own
  // program-specific figure baked into its `cashToClose`).
  const reference = programResults[0];
  const closingCosts = calculateClosingCosts(purchasePrice, reference?.baseLoanAmount ?? 0);
  const totalClosingCosts = closingCosts.reduce((sum, item) => sum + item.amount, 0);

  return {
    programResults,
    closingCosts,
    totalClosingCosts,
    computedAt: new Date().toISOString(),
  };
}

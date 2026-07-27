/* eslint-disable jsx-a11y/alt-text -- this file's <Image> is @react-pdf/renderer's PDF primitive, not an HTML <img>/next/image; it has no `alt` prop and the a11y plugin can't tell the two apart. */
import { Document, Page, View, Text, Image, StyleSheet, Font } from "@react-pdf/renderer";

import type { ClosingCostLineItem, LoanProgramResult } from "@/lib/payment/types";

/**
 * The Payment Snapshot PDF layout — a single-page "client presentation"
 * mirroring `FlyerPdfDocument.tsx`'s visual language exactly (same navy/gold
 * palette, same Helvetica/Times core-font choice for the same "renders
 * everywhere, zero network calls" reason documented there, same
 * agent+QR footer treatment) so it reads as belonging to the same product,
 * not a bolted-on calculator printout.
 */

const NAVY_950 = "#0a1628";
const NAVY_900 = "#0c1930";
const NAVY_800 = "#0f1f3d";
const GOLD_500 = "#c9a463";
const GOLD_600 = "#b08a45";
const WHITE = "#ffffff";
const INK_MUTED = "#4a5568";
const HAIRLINE = "#e7e5e0";
const SURFACE = "#f2f1ed";

Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: NAVY_900,
    backgroundColor: WHITE,
    padding: 32,
  },
  sectionLabel: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: GOLD_600,
    letterSpacing: 1,
    marginBottom: 6,
  },
  qrBlock: { alignItems: "center", gap: 4 },
  qrImage: { width: 52, height: 52 },
  qrLabel: { fontSize: 6.5, color: INK_MUTED, textAlign: "center" },
  agentRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  agentPhoto: { width: 34, height: 34, borderRadius: 17 },
  agentName: { fontSize: 9.5, fontFamily: "Helvetica-Bold", color: NAVY_900 },
  agentContact: { fontSize: 7.5, color: INK_MUTED },
});

export interface PaymentSnapshotPdfData {
  address: string;
  cityStateZip: string;
  heroPhotoUrl: string | null;
  purchasePriceLabel: string | null;
  programResults: LoanProgramResult[];
  closingCosts: ClosingCostLineItem[];
  totalClosingCosts: number;
  agentName: string;
  agentEmail: string;
  agentPhone: string;
  agentPhotoUrl: string | null;
  qrDataUrl: string | null;
  /** From the account-level Brand Center "Mortgage (optional)" section — omitted from the footer entirely when not set, never shown as a blank/placeholder value. */
  nmlsNumber: string | null;
  mortgageCompany: string | null;
  disclaimer: string;
  preparedDate: string;
}

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const currencyPrecise = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

function AgentAndQr({ data }: { data: PaymentSnapshotPdfData }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
      <View style={styles.agentRow}>
        {data.agentPhotoUrl ? <Image src={data.agentPhotoUrl} style={styles.agentPhoto} /> : null}
        <View>
          <Text style={styles.agentName}>{data.agentName || "Listing Agent"}</Text>
          {data.agentPhone ? <Text style={styles.agentContact}>{data.agentPhone}</Text> : null}
          {data.agentEmail ? <Text style={styles.agentContact}>{data.agentEmail}</Text> : null}
          {(data.nmlsNumber || data.mortgageCompany) && (
            <Text style={styles.agentContact}>
              {data.mortgageCompany}
              {data.mortgageCompany && data.nmlsNumber ? " · " : ""}
              {data.nmlsNumber ? `NMLS #${data.nmlsNumber}` : ""}
            </Text>
          )}
        </View>
      </View>
      {data.qrDataUrl ? (
        <View style={styles.qrBlock}>
          <Image src={data.qrDataUrl} style={styles.qrImage} />
          <Text style={styles.qrLabel}>Scan to get started</Text>
        </View>
      ) : null}
    </View>
  );
}

/** The featured "hero" payment summary — the primary/first program's monthly breakdown, shown large. */
function PaymentSummary({ program }: { program: LoanProgramResult }) {
  const rows: { label: string; value: string }[] = [
    { label: "Principal & Interest", value: currencyPrecise.format(program.monthlyPI) },
    { label: "Property Tax", value: currencyPrecise.format(program.monthlyTax) },
    { label: "Home Insurance", value: currencyPrecise.format(program.monthlyInsurance) },
  ];
  if (program.monthlyMortgageInsurance > 0) {
    const mi = program.program === "fha" ? "Mortgage Insurance (MIP)" : "Mortgage Insurance (PMI)";
    rows.push({ label: mi, value: currencyPrecise.format(program.monthlyMortgageInsurance) });
  }
  if (program.monthlyHoa > 0) {
    rows.push({ label: "HOA", value: currencyPrecise.format(program.monthlyHoa) });
  }

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.sectionLabel}>ESTIMATED MONTHLY PAYMENT — {program.label.toUpperCase()}</Text>
      <View style={{ flexDirection: "row", gap: 18 }}>
        <View style={{ flex: 1 }}>
          {rows.map((row) => (
            <View
              key={row.label}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 4,
                borderBottomWidth: 1,
                borderBottomColor: HAIRLINE,
              }}
            >
              <Text style={{ fontSize: 9, color: INK_MUTED }}>{row.label}</Text>
              <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: NAVY_900 }}>{row.value}</Text>
            </View>
          ))}
        </View>
        <View
          style={{
            width: 168,
            backgroundColor: NAVY_950,
            borderRadius: 4,
            padding: 14,
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 7.5, color: "#cbd5e1", letterSpacing: 0.5 }}>TOTAL MONTHLY PAYMENT</Text>
          <Text style={{ fontSize: 22, fontFamily: "Helvetica-Bold", color: GOLD_500, marginTop: 4 }}>
            {currency.format(program.totalMonthly)}
          </Text>
          <Text style={{ fontSize: 7, color: "#94a3b8", marginTop: 4 }}>
            {program.termYears}-yr fixed at {program.ratePercent}%
          </Text>
        </View>
      </View>
    </View>
  );
}

/** Side-by-side comparison table: one column per selected loan program, one row per metric. */
function ComparisonTable({ programResults }: { programResults: LoanProgramResult[] }) {
  const metricRows: { label: string; render: (p: LoanProgramResult) => string }[] = [
    { label: "Rate", render: (p) => `${p.ratePercent}%` },
    { label: "Term", render: (p) => `${p.termYears} yrs` },
    { label: "Down Payment", render: (p) => `${currency.format(p.downPaymentAmount)} (${p.downPaymentPercent.toFixed(1)}%)` },
    { label: "Loan Amount", render: (p) => currency.format(p.totalLoanAmount) },
    { label: "Monthly P&I", render: (p) => currencyPrecise.format(p.monthlyPI) },
    {
      label: "Mortgage Insurance / Fees",
      render: (p) => (p.monthlyMortgageInsurance > 0 ? `${currencyPrecise.format(p.monthlyMortgageInsurance)}/mo` : p.financedFeeAmount > 0 ? `${currency.format(p.financedFeeAmount)} financed` : "None"),
    },
    { label: "Total Monthly Payment", render: (p) => currency.format(p.totalMonthly) },
    { label: "Cash Needed to Close", render: (p) => currency.format(p.cashToClose) },
  ];

  const labelColWidth = 118;
  const colWidth = (468 - labelColWidth) / Math.max(programResults.length, 1);

  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.sectionLabel}>LOAN PROGRAM COMPARISON</Text>
      <View style={{ borderWidth: 1, borderColor: HAIRLINE, borderRadius: 4, overflow: "hidden" }}>
        <View style={{ flexDirection: "row", backgroundColor: NAVY_950 }}>
          <View style={{ width: labelColWidth, padding: 6 }} />
          {programResults.map((p) => (
            <View key={p.program} style={{ width: colWidth, padding: 6 }}>
              <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: WHITE }}>{p.label}</Text>
            </View>
          ))}
        </View>
        {metricRows.map((row, i) => (
          <View
            key={row.label}
            style={{
              flexDirection: "row",
              backgroundColor: i % 2 === 0 ? WHITE : SURFACE,
              borderTopWidth: 1,
              borderTopColor: HAIRLINE,
            }}
          >
            <View style={{ width: labelColWidth, padding: 6 }}>
              <Text style={{ fontSize: 7.5, color: INK_MUTED }}>{row.label}</Text>
            </View>
            {programResults.map((p) => (
              <View key={p.program} style={{ width: colWidth, padding: 6 }}>
                <Text
                  style={{
                    fontSize: 7.8,
                    fontFamily: row.label === "Total Monthly Payment" ? "Helvetica-Bold" : "Helvetica",
                    color: row.label === "Total Monthly Payment" ? NAVY_800 : NAVY_900,
                  }}
                >
                  {row.render(p)}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
      {programResults.some((p) => p.notes.length > 0) && (
        <View style={{ marginTop: 6 }}>
          {programResults
            .filter((p) => p.notes.length > 0)
            .map((p) => (
              <Text key={p.program} style={{ fontSize: 6.8, color: INK_MUTED, marginBottom: 2 }}>
                {p.label}: {p.notes.join(" ")}
              </Text>
            ))}
        </View>
      )}
    </View>
  );
}

/** Closing cost line items + total — backs the "Cash Needed to Close" figure already shown per-program in the comparison table above. */
function ClosingCostsBlock({ closingCosts, total }: { closingCosts: ClosingCostLineItem[]; total: number }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.sectionLabel}>ESTIMATED CLOSING COSTS</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {closingCosts.map((item) => (
          <View key={item.label} style={{ width: "50%", flexDirection: "row", justifyContent: "space-between", paddingVertical: 2.5, paddingRight: 10 }}>
            <Text style={{ fontSize: 8, color: INK_MUTED }}>{item.label}</Text>
            <Text style={{ fontSize: 8, color: NAVY_900 }}>{currency.format(item.amount)}</Text>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4, paddingTop: 4, borderTopWidth: 1, borderTopColor: HAIRLINE }}>
        <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", color: NAVY_900 }}>Total Estimated Closing Costs</Text>
        <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", color: NAVY_900 }}>{currency.format(total)}</Text>
      </View>
    </View>
  );
}

function PaymentSnapshotPage({ data }: { data: PaymentSnapshotPdfData }) {
  const primary = data.programResults[0];
  return (
    <Page size="LETTER" style={styles.page}>
      <View style={{ flexDirection: "row", marginBottom: 16, gap: 16 }}>
        {data.heroPhotoUrl ? (
          <Image src={data.heroPhotoUrl} style={{ width: 150, height: 100, borderRadius: 4, objectFit: "cover" }} />
        ) : null}
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text style={{ fontSize: 8, letterSpacing: 2, color: GOLD_600, fontFamily: "Helvetica-Bold" }}>
            PAYMENT SNAPSHOT
          </Text>
          <Text style={{ fontSize: 18, fontFamily: "Helvetica-Bold", color: NAVY_950, marginTop: 3 }}>
            {data.address}
          </Text>
          <Text style={{ fontSize: 9, color: INK_MUTED, marginTop: 2 }}>
            {data.cityStateZip}
            {data.purchasePriceLabel ? `   ·   Purchase Price: ${data.purchasePriceLabel}` : ""}
          </Text>
          <Text style={{ fontSize: 7.5, color: INK_MUTED, marginTop: 4 }}>Prepared {data.preparedDate}</Text>
        </View>
      </View>

      {primary ? <PaymentSummary program={primary} /> : null}
      <ComparisonTable programResults={data.programResults} />
      <ClosingCostsBlock closingCosts={data.closingCosts} total={data.totalClosingCosts} />

      <View style={{ marginTop: 4, paddingTop: 10, borderTopWidth: 1, borderTopColor: HAIRLINE }}>
        <Text style={{ fontSize: 6.5, color: INK_MUTED, lineHeight: 1.5, marginBottom: 10 }}>{data.disclaimer}</Text>
        <AgentAndQr data={data} />
      </View>
    </Page>
  );
}

export function PaymentSnapshotPdfDocument({ data }: { data: PaymentSnapshotPdfData }) {
  return (
    <Document title={`${data.address} — Payment Snapshot`} author={data.agentName || "The Listing Lab"}>
      <PaymentSnapshotPage data={data} />
    </Document>
  );
}

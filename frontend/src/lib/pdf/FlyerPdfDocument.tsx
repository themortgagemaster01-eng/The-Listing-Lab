/* eslint-disable jsx-a11y/alt-text -- this file's <Image> is @react-pdf/renderer's PDF primitive, not an HTML <img>/next/image; it has no `alt` prop and the a11y plugin can't tell the two apart. */
import { Document, Page, View, Text, Image, StyleSheet, Font } from "@react-pdf/renderer";

import type { FlyerTemplate, FlyerTextContent } from "@/lib/supabase/types";

/**
 * The four flyer PDF layouts, one per `FlyerTemplate`, mirroring the
 * on-screen previews in `components/property/flyer/FlyerLivePreview.tsx`
 * as closely as `@react-pdf/renderer`'s primitives reasonably allow.
 *
 * FONT NOTE: this intentionally uses react-pdf's built-in core fonts
 * (Helvetica family for body/sans, Times-Roman/Times-Bold for the serif
 * "display" feel that mirrors the app's Playfair Display headings) instead
 * of registering the app's actual Google Fonts (Inter/Playfair Display via
 * `next/font` in `src/app/layout.tsx`). `Font.register` in react-pdf needs
 * a network-fetchable font file at render time, which is one more runtime
 * dependency (and one more way PDF export could fail) for a feature whose
 * whole point is print-ready reliability. Core fonts render everywhere,
 * every time, with zero network calls. Swap in `Font.register` with
 * self-hosted woff/ttf assets later if pixel-perfect brand-font matching in
 * the exported PDF becomes a hard requirement — flagged in the project report.
 */

const NAVY_950 = "#0a1628";
const NAVY_900 = "#0c1930";
const NAVY_800 = "#0f1f3d";
const GOLD_500 = "#c9a463";
const GOLD_600 = "#b08a45";
const WHITE = "#ffffff";
const INK_MUTED = "#4a5568";

Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: NAVY_900,
    backgroundColor: WHITE,
  },
  // ---- shared bits ----
  qrBlock: {
    alignItems: "center",
    gap: 4,
  },
  qrImage: {
    width: 56,
    height: 56,
  },
  qrLabel: {
    fontSize: 6.5,
    color: INK_MUTED,
    textAlign: "center",
  },
  agentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  agentPhoto: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  agentName: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: NAVY_900,
  },
  agentContact: {
    fontSize: 8,
    color: INK_MUTED,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 5,
    marginBottom: 4,
  },
  bulletDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: GOLD_500,
    marginTop: 3,
  },
  bulletText: {
    fontSize: 9,
    color: NAVY_900,
    flex: 1,
  },
});

export interface FlyerPdfData {
  template: FlyerTemplate;
  address: string;
  cityStateZip: string;
  priceLabel: string | null;
  statsLine: string;
  mlsNumber: string;
  lotSize: string;
  yearBuilt: string;
  propertyType: string;
  text: FlyerTextContent;
  /** Photo URLs (data URLs or remote https URLs both work), cover photo first. */
  photos: string[];
  agentName: string;
  agentEmail: string;
  agentPhone: string;
  agentPhotoUrl: string | null;
  qrDataUrl: string;
}

function AgentAndQr({ data, dark }: { data: FlyerPdfData; dark?: boolean }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
      <View style={styles.agentRow}>
        {data.agentPhotoUrl ? <Image src={data.agentPhotoUrl} style={styles.agentPhoto} /> : null}
        <View>
          <Text style={[styles.agentName, dark ? { color: WHITE } : {}]}>{data.agentName || "Listing Agent"}</Text>
          {data.agentPhone ? (
            <Text style={[styles.agentContact, dark ? { color: "#cbd5e1" } : {}]}>{data.agentPhone}</Text>
          ) : null}
          {data.agentEmail ? (
            <Text style={[styles.agentContact, dark ? { color: "#cbd5e1" } : {}]}>{data.agentEmail}</Text>
          ) : null}
        </View>
      </View>
      <View style={styles.qrBlock}>
        <Image src={data.qrDataUrl} style={styles.qrImage} />
        <Text style={[styles.qrLabel, dark ? { color: "#cbd5e1" } : {}]}>Scan for details</Text>
      </View>
    </View>
  );
}

function FeatureBullets({ bullets, dark }: { bullets: string[]; dark?: boolean }) {
  return (
    <View>
      {bullets.slice(0, 8).map((bullet, i) => (
        <View key={i} style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <Text style={[styles.bulletText, dark ? { color: "#e2e8f0" } : {}]}>{bullet}</Text>
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Luxury — full-bleed hero photo, editorial serif headline overlay
// ---------------------------------------------------------------------------

function LuxuryPage({ data }: { data: FlyerPdfData }) {
  const hero = data.photos[0];
  return (
    <Page size="LETTER" style={styles.page}>
      <View style={{ height: 340, position: "relative" }}>
        {hero ? <Image src={hero} style={{ width: "100%", height: 340, objectFit: "cover" }} /> : null}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: 32,
            paddingVertical: 20,
            backgroundColor: NAVY_950,
            opacity: 0.88,
          }}
        />
        <View style={{ position: "absolute", bottom: 20, left: 32, right: 32 }}>
          {data.priceLabel ? (
            <Text style={{ fontSize: 13, fontFamily: "Times-Bold", color: GOLD_500, marginBottom: 4 }}>
              {data.priceLabel}
            </Text>
          ) : null}
          <Text style={{ fontSize: 24, fontFamily: "Times-Bold", color: WHITE, lineHeight: 1.15 }}>
            {data.text.luxuryHeadline || data.text.headline}
          </Text>
          <Text style={{ fontSize: 10, color: "#e2e8f0", marginTop: 6 }}>
            {data.address}{data.cityStateZip ? `, ${data.cityStateZip}` : ""}
            {data.statsLine ? `   ·   ${data.statsLine}` : ""}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", padding: 32, gap: 28 }}>
        <View style={{ flex: 1.4 }}>
          <Text style={{ fontSize: 9, fontFamily: "Times-Bold", color: GOLD_600, marginBottom: 6, letterSpacing: 1 }}>
            THE OFFERING
          </Text>
          <Text style={{ fontSize: 10, lineHeight: 1.6, color: NAVY_900, marginBottom: 12 }}>
            {data.text.description}
          </Text>
          <FeatureBullets bullets={data.text.featureBullets} />
          <Text style={{ fontSize: 9, fontFamily: "Times-Bold", color: GOLD_600, marginTop: 10, marginBottom: 4, letterSpacing: 1 }}>
            THE NEIGHBORHOOD
          </Text>
          <Text style={{ fontSize: 9.5, lineHeight: 1.5, color: INK_MUTED }}>{data.text.neighborhoodHighlights}</Text>
        </View>

        <View style={{ flex: 1, gap: 8 }}>
          {data.photos.slice(1, 3).map((src, i) => (
            <Image key={i} src={src} style={{ width: "100%", height: 96, objectFit: "cover", borderRadius: 2 }} />
          ))}
          <View style={{ marginTop: 8, padding: 12, backgroundColor: NAVY_900, borderRadius: 3 }}>
            <Text style={{ fontSize: 10, fontFamily: "Times-Bold", color: GOLD_500, marginBottom: 4 }}>
              {data.text.callToAction}
            </Text>
            <Text style={{ fontSize: 7.5, color: "#cbd5e1" }}>
              MLS# {data.mlsNumber || "—"} · {data.propertyType || "Residential"}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ position: "absolute", bottom: 24, left: 32, right: 32 }}>
        <AgentAndQr data={data} />
      </View>
    </Page>
  );
}

// ---------------------------------------------------------------------------
// Modern — photo grid, bold sans-serif, dense layout
// ---------------------------------------------------------------------------

function ModernPage({ data }: { data: FlyerPdfData }) {
  const [hero, ...rest] = data.photos;
  const gridPhotos = rest.slice(0, 3);
  return (
    <Page size="LETTER" style={styles.page}>
      <View style={{ flexDirection: "row", height: 200, gap: 2 }}>
        <View style={{ flex: 2 }}>{hero ? <Image src={hero} style={{ width: "100%", height: 200, objectFit: "cover" }} /> : null}</View>
        <View style={{ flex: 1, gap: 2 }}>
          {gridPhotos.length > 0 ? (
            gridPhotos.map((src, i) => (
              <Image key={i} src={src} style={{ width: "100%", height: 200 / Math.max(gridPhotos.length, 1) - 1.5, objectFit: "cover" }} />
            ))
          ) : (
            <View style={{ width: "100%", height: 200, backgroundColor: NAVY_800 }} />
          )}
        </View>
      </View>

      <View style={{ backgroundColor: NAVY_950, paddingHorizontal: 32, paddingVertical: 14 }}>
        <Text style={{ fontSize: 20, fontFamily: "Helvetica-Bold", color: WHITE }}>{data.text.headline}</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
          <Text style={{ fontSize: 9, color: "#cbd5e1" }}>
            {data.address}{data.cityStateZip ? `, ${data.cityStateZip}` : ""}
          </Text>
          {data.priceLabel ? (
            <Text style={{ fontSize: 12, fontFamily: "Helvetica-Bold", color: GOLD_500 }}>{data.priceLabel}</Text>
          ) : null}
        </View>
      </View>

      <View style={{ flexDirection: "row", backgroundColor: GOLD_500, paddingHorizontal: 32, paddingVertical: 6 }}>
        <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: NAVY_950 }}>
          {data.statsLine || " "} {data.lotSize ? `  ·  Lot: ${data.lotSize}` : ""} {data.yearBuilt ? `  ·  Built ${data.yearBuilt}` : ""}
        </Text>
      </View>

      <View style={{ flexDirection: "row", padding: 32, gap: 24 }}>
        <View style={{ flex: 1.3 }}>
          <Text style={{ fontSize: 10, lineHeight: 1.6, color: NAVY_900, marginBottom: 10 }}>{data.text.description}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            <View style={{ width: "100%" }}>
              <FeatureBullets bullets={data.text.featureBullets} />
            </View>
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ backgroundColor: "#f2f1ed", padding: 10, borderRadius: 3, marginBottom: 10 }}>
            <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: NAVY_800, marginBottom: 3 }}>
              NEIGHBORHOOD
            </Text>
            <Text style={{ fontSize: 9, lineHeight: 1.5, color: INK_MUTED }}>{data.text.neighborhoodHighlights}</Text>
          </View>
          <View style={{ backgroundColor: NAVY_900, padding: 10, borderRadius: 3 }}>
            <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: GOLD_500 }}>{data.text.callToAction}</Text>
          </View>
        </View>
      </View>

      <View style={{ position: "absolute", bottom: 24, left: 32, right: 32 }}>
        <AgentAndQr data={data} />
      </View>
    </Page>
  );
}

// ---------------------------------------------------------------------------
// Classic — single large bordered photo, traditional serif layout
// ---------------------------------------------------------------------------

function ClassicPage({ data }: { data: FlyerPdfData }) {
  const hero = data.photos[0];
  return (
    <Page size="LETTER" style={[styles.page, { padding: 36 }]}>
      <View style={{ alignItems: "center", marginBottom: 14 }}>
        <Text style={{ fontSize: 8, letterSpacing: 3, color: GOLD_600, fontFamily: "Times-Bold" }}>
          FOR SALE
        </Text>
        <Text style={{ fontSize: 22, fontFamily: "Times-Bold", color: NAVY_900, marginTop: 4, textAlign: "center" }}>
          {data.text.headline}
        </Text>
        <Text style={{ fontSize: 10, color: INK_MUTED, marginTop: 3 }}>
          {data.address}{data.cityStateZip ? `, ${data.cityStateZip}` : ""}
        </Text>
      </View>

      {hero ? (
        <View style={{ borderWidth: 2, borderColor: GOLD_500, padding: 4, marginBottom: 14 }}>
          <Image src={hero} style={{ width: "100%", height: 250, objectFit: "cover" }} />
        </View>
      ) : null}

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          gap: 18,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: "#e6d3a3",
          paddingVertical: 8,
          marginBottom: 14,
        }}
      >
        {data.priceLabel ? (
          <Text style={{ fontSize: 12, fontFamily: "Times-Bold", color: NAVY_900 }}>{data.priceLabel}</Text>
        ) : null}
        {data.statsLine ? <Text style={{ fontSize: 10, color: INK_MUTED }}>{data.statsLine}</Text> : null}
        {data.mlsNumber ? <Text style={{ fontSize: 10, color: INK_MUTED }}>MLS# {data.mlsNumber}</Text> : null}
      </View>

      <Text style={{ fontSize: 10.5, lineHeight: 1.7, color: NAVY_900, marginBottom: 12, textAlign: "justify" }}>
        {data.text.description}
      </Text>

      <View style={{ flexDirection: "row", gap: 28, marginBottom: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 9, fontFamily: "Times-Bold", color: GOLD_600, marginBottom: 5 }}>FEATURES</Text>
          <FeatureBullets bullets={data.text.featureBullets} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 9, fontFamily: "Times-Bold", color: GOLD_600, marginBottom: 5 }}>
            THE NEIGHBORHOOD
          </Text>
          <Text style={{ fontSize: 9.5, lineHeight: 1.6, color: INK_MUTED }}>{data.text.neighborhoodHighlights}</Text>
        </View>
      </View>

      <Text style={{ fontSize: 10.5, fontFamily: "Times-Bold", color: NAVY_900, textAlign: "center", marginBottom: 14 }}>
        {data.text.callToAction}
      </Text>

      <View style={{ position: "absolute", bottom: 30, left: 36, right: 36, borderTopWidth: 1, borderColor: "#e7e5e0", paddingTop: 10 }}>
        <AgentAndQr data={data} />
      </View>
    </Page>
  );
}

// ---------------------------------------------------------------------------
// Minimal — whitespace-forward, understated thin-rule accents, no color blocks
// ---------------------------------------------------------------------------

function MinimalPage({ data }: { data: FlyerPdfData }) {
  const hero = data.photos[0];
  const gallery = data.photos.slice(1, 4);
  return (
    <Page size="LETTER" style={[styles.page, { padding: 40 }]}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
        <View style={{ width: 28, height: 1, backgroundColor: GOLD_500, marginRight: 8 }} />
        <Text style={{ fontSize: 8, letterSpacing: 3, color: GOLD_600, fontFamily: "Helvetica-Bold" }}>
          NEW LISTING
        </Text>
      </View>

      <Text style={{ fontSize: 26, fontFamily: "Helvetica", color: NAVY_950, lineHeight: 1.15, marginBottom: 6 }}>
        {data.text.headline}
      </Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
        <Text style={{ fontSize: 10, color: INK_MUTED }}>
          {data.address}{data.cityStateZip ? `, ${data.cityStateZip}` : ""}
          {data.statsLine ? `   ·   ${data.statsLine}` : ""}
        </Text>
        {data.priceLabel ? (
          <Text style={{ fontSize: 15, fontFamily: "Helvetica-Bold", color: NAVY_950 }}>{data.priceLabel}</Text>
        ) : null}
      </View>

      {hero ? <Image src={hero} style={{ width: "100%", height: 230, objectFit: "cover" }} /> : null}
      {gallery.length > 0 ? (
        <View style={{ flexDirection: "row", gap: 4, marginTop: 4 }}>
          {gallery.map((src, i) => (
            <Image key={i} src={src} style={{ flex: 1, height: 70, objectFit: "cover" }} />
          ))}
        </View>
      ) : null}

      <View style={{ flexDirection: "row", gap: 28, marginTop: 20 }}>
        <View style={{ flex: 1.3 }}>
          <Text style={{ fontSize: 10, lineHeight: 1.65, color: NAVY_900, marginBottom: 12 }}>
            {data.text.description}
          </Text>
          <FeatureBullets bullets={data.text.featureBullets} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ borderWidth: 1, borderColor: "#e6d3a3", padding: 14 }}>
            <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: GOLD_600, letterSpacing: 1, marginBottom: 6 }}>
              THE NEIGHBORHOOD
            </Text>
            <Text style={{ fontSize: 9, lineHeight: 1.55, color: INK_MUTED, marginBottom: 10 }}>
              {data.text.neighborhoodHighlights}
            </Text>
            <View style={{ height: 1, backgroundColor: "#e6d3a3", marginBottom: 10 }} />
            <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: NAVY_950 }}>{data.text.callToAction}</Text>
            <Text style={{ fontSize: 7.5, color: INK_MUTED, marginTop: 4 }}>
              MLS# {data.mlsNumber || "—"} · {data.propertyType || "Residential"}
            </Text>
          </View>
        </View>
      </View>

      <View
        style={{
          position: "absolute",
          bottom: 32,
          left: 40,
          right: 40,
          borderTopWidth: 1,
          borderColor: "#e7e5e0",
          paddingTop: 12,
        }}
      >
        <AgentAndQr data={data} />
      </View>
    </Page>
  );
}

export function FlyerPdfDocument({ data }: { data: FlyerPdfData }) {
  return (
    <Document title={`${data.address} — Flyer`} author={data.agentName || "Realtor Toolbox"}>
      {data.template === "luxury" && <LuxuryPage data={data} />}
      {data.template === "modern" && <ModernPage data={data} />}
      {data.template === "minimal" && <MinimalPage data={data} />}
      {(data.template === "classic" || !data.template) && <ClassicPage data={data} />}
    </Document>
  );
}

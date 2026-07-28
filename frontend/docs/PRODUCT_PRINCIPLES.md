# Realtor Toolbox Product Principles

Twelve standing rules that govern what gets built and how. Every new tool, feature, or redesign should be checked against these before (and after) it ships.

1. Every tool must solve a real business problem (win listings / save time / educate buyers / impress sellers / generate leads) — not "generate AI."
2. One source of truth — property info entered once, everything else inherits it, no duplicate forms.
3. Brand once — every document auto-includes headshot/logo/contact/branding/QR, no manual editing.
4. Professional first — everything should look like it came from a premium agency, no generic templates.
5. AI assists, never adds work.
6. Explain the "why" — every tool answers "why would a Realtor open this?"; if not obvious, redesign it.
7. Under 60 seconds — a Realtor should understand a tool in under a minute; if not, simplify.
8. Mobile first — assume users are standing in a driveway; everything works on an iPhone.
9. Privacy by design — especially Income Analyzer: documents processed securely, nothing retained unless explicitly saved.
10. Never compete with MLS — complement it, don't replace it.
11. Differentiate with mortgage expertise — Mortgage Center / Income Analyzer / SONYMA / Closing Costs / Payment Scenarios is the unfair advantage.
12. Every feature must pass 3 tests before being built: save ≥30 min? help win business? help serve clients? If not, don't build it.

## Naming convention

No "AI" prefix in feature names, going forward. **Flyer Studio**, not "AI Flyer Generator." **Mortgage Center**, not "AI Mortgage Calculator." The product is AI-powered throughout — that doesn't need to be spelled out in every tool's name. Name tools for what they do for the Realtor, not for the technology behind them. (The one explicit exception is **AI Income Analyzer** — named that way in Robert's 2026-07-28 Realtor Toolbox master vision doc, so that name is kept as-is rather than forced through this rule.)

## Do Not Build

Per Robert's 2026-07-28 "Realtor Toolbox – Master Vision" doc — these categories are never in scope, regardless of how a request is framed. This replaces the previous "Explicit build boundaries" list (which also covered email marketing, accounting, and a calendar platform — accounting and calendar are dropped here per the new doc; MLS replacement carries forward; property listing websites is new):

- **CRM**
- **Email platform**
- **Transaction management**
- **MLS replacement**
- **Property listing websites**

If a feature request touches one of these categories, flag it back to Robert rather than building it — this list is a hard boundary, not a default-to-build list.

> **Known open conflict (flagged, not resolved):** the existing Property Website Generator (`/property/[id]/marketing-assets?section=website` — draft/publish snapshot system, fully built and verified) does exactly what "Property listing websites" says not to build. Robert is aware and has decided to leave it live and functioning exactly as-is for now while he decides how to reconcile it with this list; nothing about that feature has been hidden, deprecated, or changed. This note stays here until he resolves it — don't build any *new* property-website functionality in the meantime, and don't take this existing feature's continued presence as license to build more like it.

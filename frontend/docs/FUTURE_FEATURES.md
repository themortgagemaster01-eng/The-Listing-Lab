# Future Features

This document tracks ideas that are **deferred / future scope** — explicitly
not part of the current locked V1 build. V1 is: **Property Workspace +
Flyer Studio + Payment Snapshot + Social Media Generator + Property
Website Generator.** Nothing below should be built until it's pulled out of
this doc and into an actual spec.

---

## 1. AI Property Concierge — the big future differentiator

**The pitch:** the user types "Everything for 123 Main Street" (or a similar
natural-language request) into the AI Command Bar, and the AI automatically
generates a full asset package for that listing:

- Luxury flyer
- Property website
- Instagram carousel
- Facebook post
- LinkedIn post
- Open house sign-in sheet
- QR code
- Payment snapshot
- Closing cost estimate
- Buyer packet
- Seller packet
- Email to agents
- Printable brochure

While it works, the UI shows a **live progress checklist** — each asset
flips to done as it finishes generating:

```
✓ Flyer Complete
✓ Website Complete
✓ QR Code Complete
… (continues until every asset in the batch is done)
```

Robert's framing, verbatim: **"the one thing I haven't seen in any realtor
software that would make people stop during a demo."**

This is a **long-term north star**, not part of the current locked V1
scope. It depends on every individual generator (flyer, website, social,
payments, closing costs, buyer/seller packets, QR, open house tools)
already existing and being reliable on its own — the Concierge is an
orchestration layer on top of tools that ship first as standalone features.
The Property Workspace's Marketing Assets / Payment Tools / Documents /
Open Houses / Social Media tabs (current build) are the individual building
blocks this will eventually call in sequence.

---

## 2. Mortgage Snapshot / Mortgage Advantage

Robert's proposed **signature differentiator**, leaning directly on his
mortgage-industry background rather than generic real-estate software
knowledge. The pitch: every property should be able to auto-generate a
**"Mortgage Snapshot"** the agent can hand to a buyer instantly — a single
branded sheet (print or digital) containing:

- Estimated monthly payment
- Required down payment
- **FHA** option
- **Conventional** option
- **VA** option
- **HomeStyle renovation** option
- **SONYMA eligibility** (New York State's down-payment assistance program
  for first-time/eligible buyers — NY-specific)
- Estimated closing costs
- Cash needed to close
- A QR code to apply

**Why this is defensible:** this isn't something a generic real-estate
SaaS builder can bolt on casually — comparing multiple loan programs
correctly (FHA vs. Conventional vs. VA vs. HomeStyle vs. state assistance
programs like SONYMA) requires real lending/mortgage expertise, not just
real-estate software knowledge. That's exactly the expertise Robert has
and most competitors building "AI for realtors" tools don't. This is
explicitly called out as a differentiator competitors can't easily
replicate.

**Relationship to current build:** the Payment Tools tab's mortgage
calculator (Payments sub-section, folded together with Closing Costs) is
the *seed* of this — a single-scenario, single-program calculator. The
Mortgage Snapshot described here is the **expanded future version**:
multiple loan-program comparisons side by side, SONYMA eligibility logic,
and a polished hand-to-buyer output artifact (print/PDF/QR). It is not a
rebuild from scratch — it's the same underlying math (already correct in
`PaymentsTab`) extended with more programs and a shareable output format.

---

## 3. Carried-forward deferred items

Captured here so nothing gets lost across doc rewrites:

### Property Intelligence
Market Analysis, Rental Analysis, Valuation, and One-Click PDF Reports.
**All of these need a real licensed MLS/data provider before they can use
real data.** Zillow-style scraping was considered and explicitly **rejected
as a ToS risk** — this is not an approved data-sourcing approach, just an
idea that was floated and ruled out. No Property Intelligence feature
ships with mock/scraped data; it waits on a real data partnership.

### AI Marketplace concept
A menu of discrete, purchasable/unlockable AI "Labs," e.g.:

- Flyer Lab
- Social Lab
- Video Lab
- Staging Lab
- Open House Kit
- Buyer Packet
- Seller Packet
- Mortgage Snapshot
- CMA Builder

This is a packaging/monetization concept, not a technical spec — most of
the underlying tools already exist in some form inside the Property
Workspace; the "Marketplace" idea is about how they'd eventually be
surfaced/sold as discrete units.

### Future free/premium tier split
Monetization direction (not built yet, no gating logic exists today):
**Mortgage & Property Intelligence tools free**, per Robert's lead-gen
strategy as a mortgage professional (these tools bring buyers/agents to
him). **Heavier AI features paid later** (bulk generation, the AI Property
Concierge, Video Lab, etc.). This is a pricing/product decision to revisit
once there's a working feature set to actually gate — no tier logic,
paywall, or entitlement system should be built against this note yet.

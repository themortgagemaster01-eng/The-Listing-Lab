# The Listing Lab

**AI-powered operating system for real estate professionals.**

The Listing Lab replaces the ten different websites a Realtor normally opens to create marketing materials, calculate payments, stage photos, and generate social content — with one dashboard. It should feel effortless, premium, and incredibly fast.

Design inspiration: Tesla, Apple, Linear, Notion.

## Core Philosophy

Minimalist. Fast. AI first. Mobile friendly. One click whenever possible.

Before building any feature, ask: **"Does this save a Realtor at least 30 minutes?"** If not, don't build it.

## Primary Users

- Realtors
- Real Estate Teams
- Brokers
- Mortgage Loan Officers

## The Core Idea: Property Workspace

The Listing Lab is not a collection of separate AI tools. Every listing gets its own **Property Workspace** — a single project containing everything generated for that property: photos, AI enhancements, virtual staging, flyers, social posts, property website, QR codes, payment/closing cost snapshots, buyer/seller packets, video scripts, AI chat, notes, and documents. Everything stays attached to that property forever. Every current and future feature connects back to the Property Workspace.

## Tech Stack (summary)

- **Frontend:** Next.js, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend:** Supabase, PostgreSQL, Authentication, Storage
- **AI:** OpenAI (text, vision, image generation, OCR, PDF generation)

See [docs/TECH_STACK.md](docs/TECH_STACK.md) for details.

## Repo Structure

```
The-Listing-Lab/
├── docs/           Product vision, roadmap, PRD, tech stack, future features, brand guidelines
├── frontend/       Next.js app (not yet scaffolded)
├── backend/        Supabase/API layer (not yet scaffolded)
├── shared/         Shared types/utilities (not yet scaffolded)
├── ux/             Dashboard layout, realtor flow, wireframes
├── branding/       Colors and visual identity reference
└── prompts/        AI system prompts used to build/operate the product
```

## Documentation

- [Product Vision](docs/PRODUCT_VISION.md)
- [MVP Roadmap](docs/MVP_ROADMAP.md)
- [Product Requirements (PRD)](docs/PRD.md)
- [Tech Stack](docs/TECH_STACK.md)
- [Future Features](docs/FUTURE_FEATURES.md)
- [Brand Guidelines](docs/BRAND_GUIDELINES.md)

## Status

This repository currently contains initial project scaffolding and documentation only. The application itself (frontend/backend/Supabase setup) has not been built yet.

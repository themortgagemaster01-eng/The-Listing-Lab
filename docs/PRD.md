# Product Requirements Document (PRD)

## 1. Overview

The Listing Lab is an AI-powered operating system built specifically for real estate professionals. Instead of opening ten different websites to create marketing materials, calculate payments, stage photos, and generate social media content, Realtors open one dashboard. The Listing Lab should feel effortless, premium, and incredibly fast.

Design inspiration: Tesla, Apple, Linear, Notion. Every interaction should be simple and intuitive.

## 2. Core Philosophy

Minimalist, Fast, AI First, Mobile Friendly, One Click Whenever Possible.

Question to ask before building every feature: "Does this save a Realtor at least 30 minutes?" If not, don't build it.

## 3. Primary Users

- Realtors
- Real Estate Teams
- Brokers
- Mortgage Loan Officers

## 4. Architecture: The Property Workspace

This is the most important architectural decision for the product. Do **not** build separate tools. Everything revolves around a Property Workspace. Every property becomes its own project containing:

- Photos
- Flyers
- AI Staging
- AI Enhancement
- Payment Scenarios
- Closing Costs
- Buyer Guides
- Seller Guides
- Social Posts
- QR Codes
- Videos
- Documents
- Notes
- AI Chat

The Property Workspace is the foundation of the entire platform. Every future feature should connect back to the Property Workspace. This approach transforms The Listing Lab from a collection of AI tools into a complete operating system for real estate professionals.

## 5. MVP Features

### 5.1 Dashboard
- Realtor Profile
- Property Dashboard
- AI Marketing Center
- Recent Activity
- Notifications

### 5.2 Dashboard Layout
- Top: Greeting, Search, Notifications, Quick Actions
- Middle: Property Cards
- Bottom: Recent AI Activity, Marketing Center, Recent Documents
- Must work perfectly on desktop and mobile

### 5.3 Property Workspace Contents
Listing Photos, AI Enhanced Photos, Virtual Staging, Flyers, Social Media Posts, Property Website, QR Codes, Payment Snapshot, Closing Cost Snapshot, Buyer Packet, Seller Packet, Video Scripts, AI Chat, Notes, Documents. Everything generated remains attached to that property forever.

## 6. AI Features

### 6.1 Marketing
- Listing Flyer Generator
- Open House Flyers
- Social Posts (Instagram / Facebook / LinkedIn)
- Email Campaigns

### 6.2 Images
- AI Enhancement
- Virtual Staging
- Sky Replacement
- Object Removal
- Twilight Mode
- HDR Enhancement
- AI Headshots

### 6.3 Mortgage
- Payment Snapshot
- Closing Cost Snapshot
- Affordability
- Mortgage Calculator
- Buy vs Rent
- Keep Movement Mortgage branding minimal for compliance

### 6.4 Documents
Generate professional PDFs: Buyer Guide, Seller Guide, Property Packet, Neighborhood Report, Open House Package, Listing Presentation.

## 7. Tech Stack

**Frontend:** Next.js, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
**Backend:** Supabase, PostgreSQL, Authentication, Storage
**AI:** OpenAI, Vision, Image Generation, OCR, PDF Generation

See [TECH_STACK.md](TECH_STACK.md) for details.

## 8. UI Guidelines

Think Tesla, think Apple. Lots of whitespace. Rounded corners. Subtle animations. Dark and light mode. Primary colors: White, Black, Graphite, Accent Blue. No unnecessary clutter.

See [BRAND_GUIDELINES.md](BRAND_GUIDELINES.md) for details.

## 9. Out of Scope for MVP (Future Features)

CRM, MLS Integration, Canva Integration, Matterport, ShowingTime, Calendar, AI Phone Assistant, Referral Tracking, Team Dashboard, Broker Dashboard, Commission Tracking, AI CMA, AI Listing Description Generator, AI Offer Analyzer, AI Website Builder.

See [FUTURE_FEATURES.md](FUTURE_FEATURES.md) for details.

## 10. Status

This PRD reflects the initial product spec provided by Robert (Obsidian Labs). No application code has been built yet — this repository currently contains scaffolding and documentation only.

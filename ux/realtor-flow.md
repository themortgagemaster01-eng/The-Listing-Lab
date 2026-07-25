# Realtor Flow

A high-level walkthrough of how a Realtor is expected to move through The Listing Lab, based on the product spec. This is conceptual — no screens have been designed yet.

## 1. Sign in → Dashboard

The Realtor lands on the Dashboard: greeting, search, notifications, and quick actions up top; their active listings as Property Cards in the middle; recent AI activity, the Marketing Center, and recent documents at the bottom.

## 2. Open (or create) a Property Workspace

Every listing has its own workspace. This is the core unit of the product — not a generic "tool" but a persistent project tied to one property. Selecting a property card (or creating a new listing) opens its workspace.

## 3. Work inside the Property Workspace

From within a single property's workspace, the Realtor can, without leaving that context:

- Upload/manage listing photos
- Generate AI-enhanced photos, virtual staging, sky replacement, object removal, twilight mode, HDR enhancement
- Generate marketing materials: listing flyers, open house flyers, social posts (Instagram/Facebook/LinkedIn), email campaigns
- Generate a property website and QR codes
- Run mortgage tools: payment snapshot, closing cost snapshot, affordability, mortgage calculator, buy vs rent
- Generate buyer/seller packets and other PDFs: buyer guide, seller guide, property packet, neighborhood report, open house package, listing presentation
- Draft video scripts
- Use AI chat scoped to that property
- Keep notes and documents

Everything generated stays attached to that property's workspace permanently.

## 4. Return to Dashboard

The Realtor returns to the Dashboard to see cross-property activity: recent AI activity, the marketing center, and recently generated documents across all listings.

## Guiding Principle

The Realtor should never feel like they're using a separate "tool" — every action happens inside the context of a property. This is the product's core architectural decision (see [PRODUCT_VISION.md](../docs/PRODUCT_VISION.md)).

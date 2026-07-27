-- ============================================================================
-- Add websites (Property Website Generator / "Listing Presentation Site")
-- ============================================================================
-- Adds the child table for the "Property Website" marketing asset
-- (asset_type = 'website', already reserved in
-- marketing_assets_asset_type_check by 0001_init.sql). Mirrors the
-- `payment_snapshots` table's shape/conventions exactly: a
-- `marketing_asset_id` parent reference, a denormalized `property_id` for
-- convenient queries without a join, a `version` counter bumped on
-- republish, and the same `set_updated_at()` trigger (reused from
-- 0001_init.sql, not redefined here).
--
-- Deliberately NO foreign keys to `flyers` or `payment_snapshots` here — at
-- render time the public site page (`src/lib/website/loadPublicWebsite.ts`)
-- independently loads "this property's most recently updated flyer" and
-- "this property's most recently updated payment snapshot" fresh on every
-- request. Simpler than tracking which specific flyer/snapshot a website
-- was "generated from", always shows current content, and needs no
-- migration if a Realtor swaps out photos/copy/rates after publishing.
--
-- `slug` is the public URL segment (`/site/{slug}`) and must be globally
-- unique — see `src/lib/website/slug.ts` for how it's generated (derived
-- from address + city, with a short suffix from the property id appended
-- so two properties with the same address+city can never collide).
--
-- `properties.agent_application_url` (added in 0003) and the rest of the
-- existing agent fields on `properties` are reused as-is for the public
-- site's agent section / QR code / lead CTAs — no new agent columns.
--
-- RLS: still intentionally deferred project-wide — see 0001_init.sql's
-- header comment. Not added here either. The public site page reads
-- through the server-side (service-role) Supabase client regardless, since
-- there is no authenticated-user model to scope a public marketing page to
-- in the first place.
-- ============================================================================

create table if not exists websites (
  id uuid primary key default gen_random_uuid(),
  marketing_asset_id uuid not null references marketing_assets(id) on delete cascade,
  -- Denormalized for query convenience, same as flyers.property_id / payment_snapshots.property_id.
  property_id uuid not null references properties(id) on delete cascade,
  -- The public URL segment: the live site is served at /site/{slug}. Must
  -- be globally unique across every property, not just per-property.
  slug text not null unique,
  -- One of "estate" | "minimal" | "showcase" — see
  -- src/lib/website/types.ts WebsiteTheme. Stored as free text (not a
  -- Postgres enum) so new themes can be added without a migration.
  theme text not null default 'estate',
  -- False until the Realtor clicks "Publish Website" at least once. The
  -- public page (`/site/[slug]`) 404s on any row where this is false, even
  -- if the slug otherwise matches, so an unfinished draft is never
  -- publicly reachable.
  --
  -- UPDATED (shared asset lifecycle refinement, see marketing_assets.lifecycle_state
  -- below): this column is now a derived convenience/query-filter column
  -- only, kept in sync purely as `is_published = (lifecycle_state =
  -- 'published')` at write time in `saveWebsiteSupabase`
  -- (src/lib/website/supabase-store.ts) — it is never set independently, so
  -- it can never drift from lifecycle_state. `lifecycle_state` (on the
  -- parent `marketing_assets` row) is the authoritative source of truth;
  -- this boolean exists only because it's convenient to filter/index on
  -- directly from the `websites` table without a join.
  is_published boolean not null default false,
  -- Bumped on every (re-)publish, mirroring flyers.version /
  -- payment_snapshots.version. A property has at most one "current"
  -- website record (unlike flyers/payment_snapshots, which can have many)
  -- — republishing updates this same row rather than creating a new one.
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table websites is 'Property-website-specific data for a marketing_assets row of asset_type = website (the public "Listing Presentation Site"). One current row per property; slug is the public URL segment at /site/{slug}.';

create index if not exists websites_marketing_asset_id_idx on websites(marketing_asset_id);
create index if not exists websites_property_id_idx on websites(property_id);
create index if not exists websites_slug_idx on websites(slug);

-- ----------------------------------------------------------------------------
-- updated_at trigger (reuses set_updated_at() defined in 0001_init.sql)
-- ----------------------------------------------------------------------------
drop trigger if exists websites_set_updated_at on websites;
create trigger websites_set_updated_at
  before update on websites
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- shared asset lifecycle model (marketing_assets.lifecycle_state)
-- ----------------------------------------------------------------------------
-- Robert's refinement: every generated asset type (Flyer, Payment Snapshot,
-- Website, Social Media, future ones) should eventually share ONE lifecycle
-- model instead of each inventing its own status field:
--   Draft -> Generated -> Edited -> Published -> Archived
--
-- The column lives on the shared `marketing_assets` table (defined in
-- 0001_init.sql, already LIVE in production) rather than on a
-- website-specific table, so it's genuinely reusable by future asset types
-- without a redesign. Added here (not a separate 0005 migration) because
-- this migration hasn't shipped yet either — no reason to split a change
-- into two migrations when neither has run.
--
-- Flyer and Payment Snapshot deliberately keep using the existing informal
-- `marketing_assets.status` ('draft' | 'final') column as-is for now — NOT
-- migrated to lifecycle_state. Only the Website Generator
-- (`src/lib/website/*`, `components/property/website/*`) reads/writes this
-- column today; `status` is still written alongside it (derived from
-- lifecycle_state) purely so the pre-existing `marketing_assets_status_check`
-- NOT NULL constraint keeps being satisfied without touching Flyer/Payment
-- Snapshot's code paths.
alter table marketing_assets add column if not exists lifecycle_state text not null default 'draft'
  check (lifecycle_state in ('draft', 'generated', 'edited', 'published', 'archived'));

comment on column marketing_assets.lifecycle_state is 'Shared asset lifecycle: draft -> generated -> edited -> published -> archived. Currently only written/read by the Website Generator (src/lib/website/*) — Flyer/Payment Snapshot still use the older informal `status` column and are intentionally not migrated.';

-- ----------------------------------------------------------------------------
-- unified asset model — additive parent-row columns (Robert's refinement #2)
-- ----------------------------------------------------------------------------
-- Robert's target model for every asset type: a shared `marketing_assets`
-- parent row carrying `id, property_id, asset_type, status, version,
-- created_at, updated_at, published_at, metadata`, with typed child tables
-- underneath (flyers / payment_snapshots / websites — already exactly this
-- shape). These three columns are the "trivial to add now" subset of that
-- model, added additively (all nullable or defaulted, so existing rows and
-- existing Flyer/Payment Snapshot code paths are unaffected):
--
--   - `published_at` — set once, the first time an asset transitions to
--     `lifecycle_state = 'published'` (see `publishAsset` in
--     `src/lib/assets/asset-lifecycle-service.ts`). Never cleared by
--     Unpublish/Archive — it records "first went live", not "currently
--     live" (that's what `lifecycle_state` is for).
--   - `version` — a NEW counter on the PARENT `marketing_assets` row,
--     matching Robert's unified-model field list. This is ADDITIVE, not a
--     replacement: `flyers.version` and `payment_snapshots.version` (on
--     the CHILD tables) are untouched and keep meaning exactly what they
--     meant before. `marketing_assets.version` is currently only
--     read/written by the Website Generator, mirroring `websites.version`
--     1:1 for now (see `createNewVersion` in
--     `src/lib/assets/asset-lifecycle-service.ts`) — reconciling the two
--     `version` counters (parent vs. child) into one is left for the
--     larger unification effort below, not this pass.
--   - `is_stale` — supports a future "property edited -> flag its
--     generated assets as possibly out of date" workflow. Only the
--     reusable `markAssetsStale` function
--     (`src/lib/assets/asset-lifecycle-service.ts`) is built in this pass;
--     nothing calls it yet, and no UI reads this column yet — it's wired
--     up as a deliberate backlog item, not part of this pass.
--
-- NOT included here, and deliberately deferred (Robert's own call, not an
-- oversight): unifying every asset type onto ONE 5-value `status` column
-- (draft|generated|edited|published|archived). `lifecycle_state` (used
-- only by Website today) and the legacy `status` column ('draft' | 'final',
-- live in production, used by Flyer and Payment Snapshot) currently coexist
-- on this same table. Collapsing them into a single column requires a
-- live-data migration for every existing Flyer/Payment Snapshot row
-- (mapping their current 'draft'/'final' values into the 5-value scheme)
-- and is a bigger, deliberate lift to schedule separately — not done here.
alter table marketing_assets add column if not exists published_at timestamptz;
alter table marketing_assets add column if not exists version integer not null default 1;
alter table marketing_assets add column if not exists is_stale boolean not null default false;

comment on column marketing_assets.published_at is 'Set once, the first time this asset transitions to lifecycle_state = ''published''. Never cleared on unpublish/archive. Currently only written by the Website Generator (publishAsset in src/lib/assets/asset-lifecycle-service.ts).';
comment on column marketing_assets.version is 'Parent-row version counter per Robert''s unified asset model. Additive alongside (not a replacement for) flyers.version / payment_snapshots.version on the child tables. Currently only used by the Website Generator, mirroring websites.version.';
comment on column marketing_assets.is_stale is 'True when this asset may be out of date relative to its property (e.g. the property was edited after this asset was generated). Set via markAssetsStale in src/lib/assets/asset-lifecycle-service.ts. Nothing calls that function yet and no UI reads this column yet — the actual "property edited -> flag assets stale" wiring is a deliberate backlog item, not part of this pass.';

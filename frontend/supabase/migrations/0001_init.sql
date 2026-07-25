-- ============================================================================
-- The Listing Lab — v1 schema (initial migration)
-- ============================================================================
-- This is the FIRST real database schema for the app. Everything up to this
-- point has run on mock data (see src/lib/mock-data.ts). This migration
-- introduces the core tables needed for the Property Workspace and the
-- generic AI-generated marketing asset pipeline (flyers first; social posts,
-- property websites, and payment snapshots will each get their own child
-- table alongside `marketing_assets` later, following the same pattern as
-- `flyers` below).
--
-- RLS (Row Level Security): INTENTIONALLY DEFERRED. There is no real
-- authenticated user / agent-account model wired up yet (the app currently
-- has a mock login only), so there is no `auth.uid()` or owner column to
-- scope policies against. TODO(next auth milestone): once real Supabase Auth
-- (or another auth provider) is wired up and properties/assets are
-- associated with an owning user/team, add:
--   - an `owner_id uuid references auth.users(id)` (or similar) column to
--     `properties`
--   - `alter table <table> enable row level security;` on every table below
--   - policies scoping select/insert/update/delete to the owning user/team
-- Until then, these tables are wide open at the database level and access
-- control is not enforced by Postgres — do not expose the service-role key
-- to the browser, and treat the anon key as read/write-open for now.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- properties
-- ----------------------------------------------------------------------------
create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  address text not null,
  mls_number text,
  price numeric,
  bedrooms integer,
  bathrooms numeric,
  square_feet integer,
  lot_size text,
  year_built integer,
  property_type text,
  key_features jsonb not null default '[]'::jsonb,
  agent_name text,
  agent_email text,
  agent_phone text,
  agent_photo_url text,
  -- Mirrors the mock data's PropertyStatus union (`"ACTIVE" | "DRAFT"`,
  -- see src/types/index.ts). Stored as free text rather than a Postgres enum
  -- so new statuses (e.g. "PENDING", "ARCHIVED" — already stubbed out in
  -- src/lib/design-tokens.ts STATUS_TOKENS) can be added without a migration.
  status text not null default 'DRAFT',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table properties is 'A single property lab / listing. Root entity everything else hangs off of.';
comment on column properties.key_features is 'Array of short feature strings (e.g. "Pool", "Chef''s Kitchen"). jsonb so it can be queried/indexed later; treat as string[] in application code.';

-- ----------------------------------------------------------------------------
-- photos
-- ----------------------------------------------------------------------------
create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  storage_path text not null,
  url text not null,
  display_order integer not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table photos is 'Property photo gallery. storage_path is the Supabase Storage object path (bucket: property-photos, see supabase/STORAGE_SETUP.md); url is the public/signed URL cached alongside it for convenience.';

create index if not exists photos_property_id_idx on photos(property_id);

-- ----------------------------------------------------------------------------
-- marketing_assets
-- ----------------------------------------------------------------------------
-- Generic parent row shared across every AI-generated marketing asset type
-- (flyers today; social posts, property websites, and payment snapshots are
-- planned — see src/lib/ai/asset-service.ts). Type-specific data lives in a
-- child table (e.g. `flyers`) that references this row's id, keeping this
-- table asset-type-agnostic.
create table if not exists marketing_assets (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  asset_type text not null,
  title text,
  thumbnail_url text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint marketing_assets_asset_type_check
    check (asset_type in ('flyer', 'social_post', 'website', 'payment_snapshot')),
  constraint marketing_assets_status_check
    check (status in ('draft', 'final'))
);

comment on table marketing_assets is 'Generic parent row for every AI-generated marketing asset. asset_type-specific data lives in a dedicated child table (see: flyers).';

create index if not exists marketing_assets_property_id_idx on marketing_assets(property_id);
create index if not exists marketing_assets_asset_type_idx on marketing_assets(asset_type);

-- ----------------------------------------------------------------------------
-- flyers
-- ----------------------------------------------------------------------------
create table if not exists flyers (
  id uuid primary key default gen_random_uuid(),
  marketing_asset_id uuid not null references marketing_assets(id) on delete cascade,
  -- Denormalized for query convenience (list "all flyers for property X"
  -- without a join through marketing_assets).
  property_id uuid not null references properties(id) on delete cascade,
  template text not null default 'modern',
  -- Raw AI output, shape: { headline, luxuryHeadline, description,
  -- featureBullets, neighborhoodHighlights, callToAction } — see
  -- src/lib/supabase/types.ts FlyerTextContent and src/lib/ai/ai-service.ts.
  ai_generated_text jsonb,
  -- Same shape as ai_generated_text; null until the user edits the
  -- AI-generated copy. When present, this is what should be rendered/exported.
  user_edited_text jsonb,
  pdf_path text,
  pdf_url text,
  -- Bumped on every re-generation/export so a flyer's history can be
  -- reconstructed; v1 does not keep prior versions' text, just the counter.
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table flyers is 'Flyer-specific data for a marketing_assets row of asset_type = flyer.';

create index if not exists flyers_marketing_asset_id_idx on flyers(marketing_asset_id);
create index if not exists flyers_property_id_idx on flyers(property_id);

-- ----------------------------------------------------------------------------
-- updated_at triggers
-- ----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists properties_set_updated_at on properties;
create trigger properties_set_updated_at
  before update on properties
  for each row execute function set_updated_at();

drop trigger if exists marketing_assets_set_updated_at on marketing_assets;
create trigger marketing_assets_set_updated_at
  before update on marketing_assets
  for each row execute function set_updated_at();

drop trigger if exists flyers_set_updated_at on flyers;
create trigger flyers_set_updated_at
  before update on flyers
  for each row execute function set_updated_at();

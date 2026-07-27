-- Brand Center (V1): one-time-setup, persistent per-account branding profile.
-- Every generated asset (flyer, website, payment snapshot, and future
-- Mortgage Center / Income Analyzer / CMA outputs) is meant to eventually
-- read from this table instead of the per-property `agent_*` columns on
-- `properties` (see `0001_init.sql`) — that migration is NOT part of this
-- change; `properties.agent_*` stays as-is for now, and Brand Center starts
-- as its own standalone, account-level profile. Wiring individual asset
-- generators to read from `brand_profiles` is tracked separately so this
-- migration doesn't silently change existing flyer/website behavior.
--
-- One row per Supabase auth user (`user_id` is UNIQUE + FK to `auth.users`).
-- Field groups mirror the 4 sections of the Brand Center UI
-- (`components/brand/BrandCenterForm.tsx`):
--   1. Professional Identity — headshot, logo, signature, bio, brokerage,
--      designations (ABR/CRS/SRES/etc.), languages spoken, service areas.
--   2. Contact — phone, email, website, booking link.
--   3. Mortgage (optional) — NMLS #, mortgage company, application link,
--      licensed states. Left blank entirely by pure-realtor accounts.
--   4. Social — Facebook, Instagram, LinkedIn, YouTube.

create table if not exists brand_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,

  -- Professional Identity
  headshot_url text,
  logo_url text,
  signature_url text,
  bio text,
  brokerage_name text,
  designations text[] not null default '{}',
  languages text[] not null default '{}',
  service_areas text[] not null default '{}',

  -- Contact
  phone text,
  email text,
  website text,
  booking_link text,

  -- Mortgage (optional)
  nmls_number text,
  mortgage_company text,
  application_url text,
  license_states text[] not null default '{}',

  -- Social
  facebook_url text,
  instagram_url text,
  linkedin_url text,
  youtube_url text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists brand_profiles_user_id_idx on brand_profiles(user_id);

alter table brand_profiles enable row level security;

-- Each user may only read/write their own brand profile.
drop policy if exists "brand_profiles_select_own" on brand_profiles;
create policy "brand_profiles_select_own" on brand_profiles
  for select using (auth.uid() = user_id);

drop policy if exists "brand_profiles_insert_own" on brand_profiles;
create policy "brand_profiles_insert_own" on brand_profiles
  for insert with check (auth.uid() = user_id);

drop policy if exists "brand_profiles_update_own" on brand_profiles;
create policy "brand_profiles_update_own" on brand_profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- updated_at auto-touch, same convention as other tables in this project.
create or replace function set_brand_profiles_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists brand_profiles_set_updated_at on brand_profiles;
create trigger brand_profiles_set_updated_at
  before update on brand_profiles
  for each row execute function set_brand_profiles_updated_at();

-- Headshot/logo/signature uploads reuse the existing `property-photos`
-- Storage bucket (already created + RLS'd by Robert — see the fix noted in
-- task history "Fix Storage RLS on property-photos bucket") under a
-- `brand-assets/{user_id}/...` path prefix, rather than requiring a brand-new
-- bucket to be created manually before this ships. See
-- `src/lib/brand/supabase-store.ts`.

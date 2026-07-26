-- ============================================================================
-- Add payment_snapshots + properties.agent_application_url
-- ============================================================================
-- Adds the child table for the "Payment Snapshot" marketing asset
-- (asset_type = 'payment_snapshot', already reserved in
-- marketing_assets_asset_type_check by 0001_init.sql). Mirrors the `flyers`
-- table's shape/conventions exactly: a `marketing_asset_id` parent
-- reference, a denormalized `property_id` for convenient "all snapshots for
-- property X" queries without a join, a `version` counter bumped on
-- regeneration, and the same `set_updated_at()` trigger (reused from
-- 0001_init.sql, not redefined here).
--
-- Rather than a typed column per input field, this follows the same
-- "denormalized computed blob" convention 0001_init.sql already uses for
-- `flyers.ai_generated_text` / `flyers.user_edited_text`: `inputs` holds the
-- full set of user-entered form values (purchase price, down payment,
-- taxes/insurance/HOA, per-program rates, which programs are enabled — see
-- `PaymentFormData` in src/lib/payment/types.ts) and `results` holds the
-- last-computed comparison output (see `PaymentSnapshotResults`). Both are
-- jsonb so new fields can be added without another migration.
--
-- RLS: still intentionally deferred project-wide — see 0001_init.sql's
-- header comment. Not added here either.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- properties.agent_application_url
-- ----------------------------------------------------------------------------
-- New optional agent field (same pattern as agent_photo_url) — the mortgage
-- application / contact link the Payment Snapshot PDF's QR code points to.
-- See src/lib/flyer/types.ts PropertyFormData.agentApplicationUrl and
-- src/lib/pdf/qrcode.ts for the fallback behavior when this is blank.
alter table properties add column if not exists agent_application_url text;

-- ----------------------------------------------------------------------------
-- payment_snapshots
-- ----------------------------------------------------------------------------
create table if not exists payment_snapshots (
  id uuid primary key default gen_random_uuid(),
  marketing_asset_id uuid not null references marketing_assets(id) on delete cascade,
  -- Denormalized for query convenience, same as flyers.property_id.
  property_id uuid not null references properties(id) on delete cascade,
  -- Full set of user inputs — shape: PaymentFormData in
  -- src/lib/payment/types.ts (purchase price, down payment $/%, annual
  -- taxes/insurance, monthly HOA, loan term, and a map of enabled loan
  -- programs each with their own rate).
  inputs jsonb not null default '{}'::jsonb,
  -- Last-computed comparison output — shape: PaymentSnapshotResults in
  -- src/lib/payment/types.ts (per-program monthly payment/cash-to-close
  -- breakdown + closing cost line items). Null until first computed.
  results jsonb,
  pdf_url text,
  -- Bumped on every re-generation/export, mirroring flyers.version. A
  -- property can have multiple payment snapshots over time (e.g. re-run
  -- with different rates) via multiple marketing_assets rows, the same way
  -- multiple flyers can exist per property.
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table payment_snapshots is 'Payment-snapshot-specific data for a marketing_assets row of asset_type = payment_snapshot.';

create index if not exists payment_snapshots_marketing_asset_id_idx on payment_snapshots(marketing_asset_id);
create index if not exists payment_snapshots_property_id_idx on payment_snapshots(property_id);

-- ----------------------------------------------------------------------------
-- updated_at trigger (reuses set_updated_at() defined in 0001_init.sql)
-- ----------------------------------------------------------------------------
drop trigger if exists payment_snapshots_set_updated_at on payment_snapshots;
create trigger payment_snapshots_set_updated_at
  before update on payment_snapshots
  for each row execute function set_updated_at();

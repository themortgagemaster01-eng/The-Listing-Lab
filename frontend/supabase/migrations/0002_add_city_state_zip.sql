-- ============================================================================
-- Add properties.city_state_zip
-- ============================================================================
-- The mock/demo Property shape (src/types/index.ts) has always displayed
-- address and city/state/zip as two separate lines (see PropertyHeader.tsx),
-- and the Flyer Generator's property form (src/lib/flyer/types.ts
-- PropertyFormData) has always collected them as two separate fields — but
-- 0001_init.sql's `properties` table only ever had a single `address`
-- column. That gap didn't matter while every real Supabase write was
-- failing for other reasons (missing tables, RLS, wrong id type); now that
-- those are fixed, it needs a real column so a newly-created property round-
-- trips through Supabase without losing its city/state/zip line.
-- ============================================================================

alter table properties add column if not exists city_state_zip text;

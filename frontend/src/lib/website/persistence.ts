import { isSupabaseConfigured } from "@/lib/supabase/client";
import { describeSupabaseError } from "@/lib/supabase/errors";
import type { WebsiteRecord } from "@/lib/website/types";
import { loadWebsiteLocal, saveWebsiteLocal, deleteWebsiteLocal } from "@/lib/website/local-store";
import { fetchWebsiteSupabase, saveWebsiteSupabase, deleteWebsiteSupabase } from "@/lib/website/supabase-store";

/**
 * The ONE place the Property Website Generator UI branches on
 * Supabase-vs-local persistence — mirrors `src/lib/payment/persistence.ts`
 * exactly, including its philosophy: every function here always resolves
 * successfully. A Supabase write is best-effort — on failure it's logged
 * via `describeSupabaseError` (loud/specific in logs) and silently falls
 * back to `localStorage`, whose write already happened first. UI
 * components never import `local-store.ts` / `supabase-store.ts` directly.
 *
 * IMPORTANT ASYMMETRY vs. the flyer/payment persistence modules: this
 * `localStorage` fallback only makes the *wizard* (client-side, in the
 * agent's own browser) work without Supabase configured. The PUBLIC
 * `/site/[slug]` page (`src/lib/website/loadPublicWebsite.ts`) is a Server
 * Component and has no access to the browser's `localStorage` at all — a
 * published site can only actually be reachable by visitors once Supabase
 * is configured and `0004_add_websites.sql` has been run. This is an
 * inherent limit of the local-storage-fallback architecture, not a bug:
 * the wizard still degrades gracefully (autosave/theme selection/preview
 * all work), it's specifically the *public* URL that requires the real
 * database.
 */

export async function loadPropertyWebsite(propertyId: string): Promise<WebsiteRecord | null> {
  if (isSupabaseConfigured) {
    try {
      const remote = await fetchWebsiteSupabase(propertyId);
      if (remote) return remote;
    } catch (err) {
      console.error(
        `[Listing Lab] Supabase read from 'marketing_assets'/'websites' failed: ${describeSupabaseError(err)}. Falling back to local storage.`
      );
    }
  }
  return loadWebsiteLocal(propertyId);
}

export async function savePropertyWebsite(propertyId: string, record: WebsiteRecord): Promise<void> {
  saveWebsiteLocal(propertyId, record);
  if (isSupabaseConfigured) {
    try {
      await saveWebsiteSupabase(record);
    } catch (err) {
      console.error(
        `[Listing Lab] Supabase write to 'marketing_assets'/'websites' failed: ${describeSupabaseError(err)}. Falling back to local storage (local copy already saved).`
      );
    }
  }
}

export async function deletePropertyWebsite(propertyId: string, record: WebsiteRecord): Promise<void> {
  deleteWebsiteLocal(propertyId);
  if (isSupabaseConfigured) {
    try {
      await deleteWebsiteSupabase(record);
    } catch (err) {
      console.error(
        `[Listing Lab] Supabase delete from 'marketing_assets'/'websites' failed: ${describeSupabaseError(err)}. Falling back to local storage (local copy already reflects the deletion).`
      );
    }
  }
}

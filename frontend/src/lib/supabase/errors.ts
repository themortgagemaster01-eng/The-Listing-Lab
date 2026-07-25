/**
 * Formats a Supabase (`PostgrestError`/`StorageError`) or network error into
 * one specific, diagnosable string for server logs — the actual error
 * code/message/details, not a generic "something went wrong." Used by
 * `src/lib/flyer/persistence.ts` so a failed Supabase call (bad key ->
 * 401/PGRST.../JWT error, network failure, wrong project, a table that
 * doesn't exist yet because migrations haven't been run, etc.) is loud and
 * specific in logs even though the app still gracefully falls back to
 * local storage for the user.
 *
 * Never includes request/response bodies or key material — Supabase error
 * objects don't carry the API key, so this is safe to log in full.
 */
export function describeSupabaseError(err: unknown): string {
  if (err && typeof err === "object") {
    const e = err as { message?: unknown; code?: unknown; details?: unknown; hint?: unknown; status?: unknown };
    const parts: string[] = [];
    if (e.code) parts.push(`code=${e.code}`);
    if (e.status) parts.push(`status=${e.status}`);
    if (e.message) parts.push(String(e.message));
    if (e.details) parts.push(`details=${e.details}`);
    if (e.hint) parts.push(`hint=${e.hint}`);
    if (parts.length > 0) return parts.join(" | ");
  }
  if (err instanceof Error) return err.message;
  return String(err);
}

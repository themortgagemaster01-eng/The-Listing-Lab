import { isSupabaseConfigured } from "@/lib/supabase/client";
import { isSupabaseServerConfigured } from "@/lib/supabase/server";
import { isOpenAIConfigured } from "@/lib/ai/openai-client";

/**
 * "Run once at server boot, tell us exactly what's configured and what
 * isn't" — the fix for the original silent-mock-fallback problem. Import
 * `logEnvStatusOnce()` from `src/instrumentation.ts` (the idiomatic Next.js
 * "run this once per server cold start" hook — see that file for why
 * `experimental.instrumentationHook` had to be turned on in
 * `next.config.mjs` for Next.js 14.2 specifically) and, as a defensive
 * backup in case some deploy target doesn't invoke `register()`, from
 * `src/app/layout.tsx`.
 *
 * Calling this more than once is intentionally harmless: the module-level
 * `hasLogged` guard below means only the FIRST call in a given server
 * process actually logs anything, no matter how many places import and
 * call it (including once per request from layout.tsx). That's the "once
 * per server process, not once per request" requirement.
 *
 * IMPORTANT: this only ever logs variable NAMES and booleans (present /
 * absent) plus, for Supabase, the project ref parsed out of the URL's
 * subdomain (the project ref is a public identifier, not a secret — it's
 * literally visible in the project's dashboard URL). It never logs an
 * actual key value, not even truncated.
 */

let hasLogged = false;

const SUPABASE_URL_VARS = ["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL"];
const SUPABASE_PUBLISHABLE_VARS = [
  "SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
];
const SUPABASE_SECRET_VARS = ["SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY"];
const SUPABASE_JWKS_VARS = ["SUPABASE_JWKS_URL"];
const OPENAI_VARS = ["OPENAI_API_KEY"];

function anyPresent(names: string[]): boolean {
  return names.some((name) => Boolean(process.env[name]?.trim()));
}

/** Canonical (newest) name used when reporting a group as "missing" in logs. */
function canonicalName(names: string[]): string {
  return names[0];
}

function projectRefFromUrl(url: string | undefined): string | null {
  if (!url) return null;
  try {
    // new URL() throws on a non-absolute string, which is exactly the
    // "someone pasted a garbage value" case we want to treat as "unknown"
    // rather than crash server boot over.
    const hostname = new URL(url).hostname;
    const ref = hostname.split(".")[0];
    return ref || null;
  } catch {
    return null;
  }
}

/**
 * Checks presence of SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY (or the
 * NEXT_PUBLIC_/legacy anon-key fallbacks), SUPABASE_SECRET_KEY (or the
 * legacy service-role fallback), SUPABASE_JWKS_URL, and OPENAI_API_KEY;
 * logs exactly which are missing and a MOCK MODE / LIVE summary line per
 * service. Safe to call from multiple entry points — only logs once per
 * server process.
 */
export function logEnvStatusOnce(): void {
  if (hasLogged) return;
  hasLogged = true;

  const hasUrl = anyPresent(SUPABASE_URL_VARS);
  const hasPublishable = anyPresent(SUPABASE_PUBLISHABLE_VARS);
  const hasSecret = anyPresent(SUPABASE_SECRET_VARS);
  const hasJwks = anyPresent(SUPABASE_JWKS_VARS);
  const hasOpenAi = anyPresent(OPENAI_VARS);

  // `isSupabaseServerConfigured` / `isSupabaseConfigured` are the same
  // booleans the actual data-access code (`src/lib/supabase/server.ts`,
  // `src/lib/supabase/client.ts`) uses to decide mock-vs-real — reusing
  // them here (rather than re-deriving "is Supabase live" from scratch)
  // guarantees this log can never disagree with what the app actually does.
  const supabaseLive = isSupabaseServerConfigured || isSupabaseConfigured;

  // --- Missing-var warnings -------------------------------------------------

  if (!hasUrl || !hasSecret) {
    const missing = [
      !hasUrl && canonicalName(SUPABASE_URL_VARS),
      !hasSecret && canonicalName(SUPABASE_SECRET_VARS),
    ].filter(Boolean);
    console.warn(
      `[Listing Lab] ⚠ Supabase not configured — missing: ${missing.join(", ")}. ` +
        "Running in MOCK MODE (data will not persist)."
    );
  }

  // The publishable key and JWKS URL don't gate whether Supabase is "live"
  // for server-side reads/writes (that only needs URL + secret key), but
  // they gate other things (the browser client used by the Flyer
  // Generator's client-side persistence path, and future JWT verification)
  // — worth its own, less alarmist, line so a partially-configured setup
  // doesn't get silently misdiagnosed as fully working.
  if (hasUrl && hasSecret && (!hasPublishable || !hasJwks)) {
    const missing = [
      !hasPublishable && canonicalName(SUPABASE_PUBLISHABLE_VARS),
      !hasJwks && canonicalName(SUPABASE_JWKS_VARS),
    ].filter(Boolean);
    console.warn(
      `[Listing Lab] ⚠ Supabase server is configured, but missing: ${missing.join(", ")}. ` +
        "Browser-side Supabase access (e.g. client-side flyer persistence, which reads NEXT_PUBLIC_ vars) " +
        "and/or JWT verification will not work until these are set too."
    );
  }

  if (!hasOpenAi) {
    console.warn(
      "[Listing Lab] ⚠ OpenAI not configured — missing: OPENAI_API_KEY. " +
        "AI copy generation will return demo placeholder text."
    );
  }

  // --- Summary lines ---------------------------------------------------------

  const supabaseUrlValue = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const ref = projectRefFromUrl(supabaseUrlValue);
  console.log(`[Listing Lab] Supabase: ${supabaseLive ? `LIVE${ref ? ` (project: ${ref})` : ""}` : "MOCK MODE"}`);
  console.log(`[Listing Lab] OpenAI: ${hasOpenAi ? "LIVE" : "MOCK MODE"}`);
}

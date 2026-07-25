/**
 * Next.js "run once per server cold start" hook
 * (https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation).
 * `register()` is called exactly once per server instance/environment —
 * NOT once per request — which is exactly what we need for a one-time
 * "here's what's configured" boot log instead of spamming it on every
 * request.
 *
 * Next.js 14.2.x still gates this behind `experimental.instrumentationHook`
 * (verified against the installed 14.2.35: `instrumentationHook: false` is
 * the compiled default in `next/dist/server/config-shared.js`) — it only
 * becomes on-by-default starting in Next.js 15. See `next.config.mjs` for
 * the flag that turns it on here.
 *
 * `register()` runs in BOTH the `nodejs` and `edge` runtimes. The env/config
 * check in `env-status.ts` is plain `process.env` reads with no Node-only
 * APIs, so it's safe either way, but we still gate on `NEXT_RUNTIME` per
 * the Next.js docs' recommended pattern in case that ever changes.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { logEnvStatusOnce } = await import("@/lib/config/env-status");
    logEnvStatusOnce();
  }
}

/**
 * Turns whatever the `openai` SDK throws into two things:
 *  - `logMessage`: a specific, server-log-only string with the real
 *    underlying detail (HTTP status, SDK error code, raw message) — never
 *    the API key itself (the SDK never puts key material in error objects).
 *  - `userMessage`: a short, specific, user-safe message distinguishing the
 *    common failure modes, for `FlyerAiWriter`'s error UI
 *    (`components/property/flyer/FlyerAiWriter.tsx`) to show instead of a
 *    generic "something went wrong."
 *
 * The `openai` SDK throws `APIError` subclasses with a `.status` (HTTP
 * status code) for anything that got a response from OpenAI, and errors
 * with no `.status` (e.g. `APIConnectionError`, or a raw `fetch` failure/
 * `TypeError`) when the request never reached OpenAI at all (DNS failure,
 * no network, timeout). Duck-typed rather than `instanceof`-checked so this
 * still works if the SDK's error classes change shape across versions.
 */
export interface DescribedOpenAiError {
  logMessage: string;
  userMessage: string;
}

export function describeOpenAiError(err: unknown): DescribedOpenAiError {
  const status = typeof (err as { status?: unknown })?.status === "number" ? (err as { status: number }).status : undefined;
  const code = (err as { code?: unknown })?.code;
  const rawMessage = err instanceof Error ? err.message : String(err);

  let userMessage: string;
  if (status === 401 || status === 403) {
    userMessage = "OpenAI API key appears to be invalid. Check the OPENAI_API_KEY value in your environment.";
  } else if (status === 429) {
    userMessage = "OpenAI rate limit reached — please try again shortly.";
  } else if (status && status >= 500) {
    userMessage = "OpenAI is temporarily unavailable — please try again shortly.";
  } else if (status === undefined) {
    // No HTTP status at all almost always means the request never reached
    // OpenAI in the first place (DNS/connection failure, offline, timeout).
    userMessage = "Couldn't reach OpenAI — check your connection and try again.";
  } else {
    userMessage = "AI copy generation failed. Please try again.";
  }

  const logMessage = `status=${status ?? "n/a"} code=${typeof code === "string" ? code : "n/a"} message=${rawMessage}`;
  return { logMessage, userMessage };
}

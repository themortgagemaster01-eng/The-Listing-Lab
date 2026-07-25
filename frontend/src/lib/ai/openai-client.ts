import OpenAI from "openai";

/**
 * Thin wrapper around the `openai` SDK client. No live key exists yet —
 * `OPENAI_API_KEY` is unset in every environment until Robert adds it as a
 * Vercel env var. `getOpenAIClient()` returns `null` (never throws) when
 * it's absent; callers (see `src/lib/ai/ai-service.ts`) must check for
 * `null` and fall back to mock content generation.
 *
 * Server-only: `OPENAI_API_KEY` is intentionally not prefixed with
 * `NEXT_PUBLIC_`, so this must only be called from Server Components,
 * Route Handlers, or Server Actions — never from client components.
 */

let cachedClient: OpenAI | null | undefined;

export const isOpenAIConfigured = Boolean(process.env.OPENAI_API_KEY);

export function getOpenAIClient(): OpenAI | null {
  if (cachedClient !== undefined) return cachedClient;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    cachedClient = null;
    return null;
  }

  cachedClient = new OpenAI({ apiKey });
  return cachedClient;
}

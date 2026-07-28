import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Route protection + session refresh for every signed-in route. Runs before
 * Server Components render, so it's the FIRST real auth gate (the async
 * redirect in `src/app/(app)/layout.tsx` is a defense-in-depth second gate,
 * not the primary one).
 *
 * Two jobs, both required by Supabase's SSR auth model:
 *  1. Refresh the session cookie if the access token is close to expiring
 *     (this is why `supabase.auth.getUser()` is called even though its
 *     return value is also used for the redirect logic below — the act of
 *     calling it is what triggers the refresh-and-rewrite-cookie behavior).
 *  2. Redirect signed-out visitors away from protected routes, and
 *     signed-in visitors away from `/login`/`/signup`.
 *
 * Matches the routes under the `(app)` route group
 * (`src/app/(app)/layout.tsx`): `/dashboard`, `/property/...`,
 * `/ai-command-center`, `/brand-center`.
 *
 * TEMPORARY (Robert, 2026-07-27): auth gate disabled so testing of the rest
 * of the app isn't blocked by a sign-in issue. Auth code, /login, /signup,
 * and the Supabase session-refresh logic below are all untouched — only
 * enforcement is off. Flip `AUTH_GATE_ENABLED` back to `true` (here AND in
 * the matching flag in `src/app/(app)/layout.tsx`, the second/defense-in-
 * depth gate) to restore protection. Nothing else needs to change.
 */

const AUTH_GATE_ENABLED = false;

const PROTECTED_PREFIXES = ["/dashboard", "/property", "/ai-command-center", "/brand-center"];
const AUTH_PAGES = new Set(["/login", "/signup"]);

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Graceful degradation, matching every other Supabase-touching module in
  // this app: if the env vars aren't set (fresh local checkout), don't
  // block anything rather than lock everyone out.
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const isAuthPage = AUTH_PAGES.has(pathname);

  if (AUTH_GATE_ENABLED && isProtected && !user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (AUTH_GATE_ENABLED && isAuthPage && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    // Everything except static assets / Next internals / image files.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

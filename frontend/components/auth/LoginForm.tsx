"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, Lock, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ComingSoonButton } from "@/components/property/ComingSoonButton";
import { getSupabaseClient } from "@/lib/supabase/client";

/**
 * Real email/password sign-in (replaces the old fake demo form, which just
 * navigated to `/dashboard` with no actual auth check — see
 * `src/lib/supabase/session.ts` and `middleware.ts` for the server side of
 * this gate).
 *
 * Google/Apple are shown as `ComingSoonButton`s rather than wired to real
 * `supabase.auth.signInWithOAuth()` calls: those providers aren't configured
 * in Supabase yet, and a wired-but-broken OAuth button is worse than an
 * honest "coming soon" toast. To activate a provider once Robert has
 * configured it in the Supabase dashboard: (1) add an
 * `src/app/auth/callback/route.ts` Route Handler that calls
 * `supabase.auth.exchangeCodeForSession(code)`, (2) replace that provider's
 * `ComingSoonButton` here with a real button calling
 * `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${location.origin}/auth/callback` } })`.
 */
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const supabase = getSupabaseClient();
    if (!supabase) {
      setError("Sign-in isn't configured yet. Please contact support.");
      return;
    }

    setIsSubmitting(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(
        signInError.message === "Invalid login credentials"
          ? "Incorrect email or password."
          : signInError.message
      );
      setIsSubmitting(false);
      return;
    }

    const redirectTo = searchParams.get("redirectTo");
    router.refresh();
    router.push(redirectTo && redirectTo.startsWith("/") ? redirectTo : "/dashboard");
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@realty.com"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••••"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center justify-end text-sm">
          <ComingSoonButton
            type="button"
            variant="link"
            className="h-auto p-0 font-medium text-navy-700 hover:text-gold-600 dark:text-gold-400"
            message="Password reset is coming soon — contact support for now."
          >
            Forgot password?
          </ComingSoonButton>
        </div>

        <motion.div whileTap={{ scale: 0.98 }}>
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="group w-full hover:bg-gold-500 hover:text-navy-950 focus-visible:ring-gold-400"
          >
            {isSubmitting ? "Signing in…" : "Sign In"}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </motion.div>
      </form>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Or continue with
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ComingSoonButton
          variant="outline"
          size="lg"
          message="Google sign-in is coming soon."
          className="flex-col gap-0.5 whitespace-normal py-2 text-xs opacity-60 grayscale hover:opacity-70 sm:flex-row sm:gap-2 sm:text-sm"
        >
          Google Sign-In <span className="font-normal text-muted-foreground">(Coming Soon)</span>
        </ComingSoonButton>
        <ComingSoonButton
          variant="outline"
          size="lg"
          message="Apple sign-in is coming soon."
          className="flex-col gap-0.5 whitespace-normal py-2 text-xs opacity-60 grayscale hover:opacity-70 sm:flex-row sm:gap-2 sm:text-sm"
        >
          Apple Sign-In <span className="font-normal text-muted-foreground">(Coming Soon)</span>
        </ComingSoonButton>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-navy-700 hover:text-gold-600 dark:text-gold-400">
          Sign up
        </Link>
      </p>
    </div>
  );
}

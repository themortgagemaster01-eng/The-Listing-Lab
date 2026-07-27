"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, Lock, Mail, MailCheck, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ROLE_OPTIONS, type RoleValue } from "@/lib/auth/roles";
import { getSupabaseClient } from "@/lib/supabase/client";

/**
 * Real sign-up: name, email, password, and one role question — deliberately
 * NOT brokerage, MLS ID, or phone number (per Robert's explicit spec; those
 * belong in Brand Center once an account exists to attach them to).
 *
 * Supabase's `signUp()` behaves one of two ways depending on the project's
 * "Confirm email" setting (Supabase dashboard → Authentication → Providers
 * → Email), and this form has to handle both without knowing which is
 * active:
 *   - Confirmation OFF: `data.session` comes back populated immediately —
 *     the user is signed in right away, so we redirect straight to
 *     `/dashboard` just like a real login.
 *   - Confirmation ON (Supabase's default for new projects): `data.session`
 *     is `null` and `data.user` exists but is unconfirmed — we show a
 *     "check your email" state instead of redirecting, since there's no
 *     session yet for `middleware.ts` to see.
 */
export function SignupForm() {
  const router = useRouter();
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<RoleValue | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!role) {
      setError("Please select what best describes you.");
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setError("Sign-up isn't configured yet. Please contact support.");
      return;
    }

    setIsSubmitting(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsSubmitting(false);
      return;
    }

    if (data.session) {
      router.refresh();
      router.push("/dashboard");
      return;
    }

    // No session yet — this Supabase project requires email confirmation.
    setAwaitingConfirmation(true);
    setIsSubmitting(false);
  }

  if (awaitingConfirmation) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-100 text-gold-600 dark:bg-gold-500/15 dark:text-gold-400">
          <MailCheck className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Check your email</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We sent a confirmation link to <span className="font-medium text-foreground">{email}</span>.
            Click it to finish creating your account.
          </p>
        </div>
        <Link href="/login" className="text-sm font-medium text-navy-700 hover:text-gold-600 dark:text-gold-400">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="fullName" className="text-sm font-medium text-foreground">
          Full name
        </label>
        <div className="relative">
          <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="Jane Realtor"
            required
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="pl-10"
          />
        </div>
      </div>

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
            autoComplete="new-password"
            placeholder="At least 8 characters"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium text-foreground">What best describes you?</span>
        <div className="grid grid-cols-2 gap-2">
          {ROLE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setRole(option.value)}
              aria-pressed={role === option.value}
              className={cn(
                "rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400",
                role === option.value
                  ? "border-gold-500 bg-gold-50 text-navy-800 dark:bg-gold-500/10 dark:text-gold-400"
                  : "border-border bg-surface text-foreground hover:border-gold-300"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <motion.div whileTap={{ scale: 0.98 }}>
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="group w-full hover:bg-gold-500 hover:text-navy-950 focus-visible:ring-gold-400"
        >
          {isSubmitting ? "Creating account…" : "Create account"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </motion.div>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-navy-700 hover:text-gold-600 dark:text-gold-400">
          Sign in
        </Link>
      </p>
    </form>
  );
}

import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/shared/logo";

export const metadata: Metadata = {
  title: "Sign In | Listing Lab",
};

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Ambient background treatment: soft navy/gold geometric accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-navy-800/10 blur-3xl dark:bg-navy-600/20" />
        <div className="absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-gold-400/15 blur-3xl" />
        <svg
          className="absolute right-10 top-16 hidden h-40 w-40 text-navy-800/10 dark:text-white/5 md:block"
          viewBox="0 0 200 200"
          fill="none"
          aria-hidden="true"
        >
          <rect x="10" y="10" width="180" height="180" rx="36" stroke="currentColor" strokeWidth="1.5" />
          <rect x="40" y="40" width="120" height="120" rx="24" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <svg
          className="absolute bottom-16 left-10 hidden h-28 w-28 text-gold-500/20 md:block"
          viewBox="0 0 100 100"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo variant="login" />
        </div>

        <div className="rounded-3xl border border-border bg-surface/90 p-8 shadow-soft-lg backdrop-blur-sm sm:p-10">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold text-foreground">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to access your Property Labs dashboard.
            </p>
          </div>

          <LoginForm />
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Listing Lab. All rights reserved.
        </p>
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, Globe, DollarSign, Share2, ArrowRight } from "lucide-react";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * Public, unauthenticated marketing landing page — the front door at `/`.
 * Previously this route was a bare `redirect("/login")`; that redirect has
 * moved into the "Sign In" link in the header below, so existing users can
 * still reach `/login` directly, but a first-time visitor now sees a real
 * page explaining the product before ever being asked to sign in.
 *
 * Positioning (per Robert's explicit correction): Listing Lab MARKETS a
 * listing, it doesn't create the listing itself — the headline and flow
 * diagram below are written to reflect that ("generated in minutes" from
 * a listing you already have, not "create your listing here"). The product
 * roadmap is framed in three stages — Win the Listing (CMA, future), Market
 * the Listing (this app, V1 — everything below), Sell the Listing (future)
 * — but that 3-stage frame is internal positioning context for Robert's
 * planning, not literally spelled out on this page; the page itself only
 * needs to sell stage 2.
 *
 * "Get Started Free" routes to `/signup` (real account creation — see
 * `components/auth/SignupForm.tsx`); "Sign In" in the header routes to
 * `/login`.
 *
 * "Listing Marketing Hub" below is marketing-facing copy ONLY — the actual
 * internal/technical name for this concept stays "Property Workspace" in
 * code, comments, and routes (`/property/[id]/...`); nothing about the app
 * itself is renamed, just what this page calls it out loud.
 */
export const metadata: Metadata = {
  title: "Listing Lab | Everything you need to market a listing",
  description:
    "Turn one property into a complete marketing package — flyer, website, payment estimate, and social posts — generated in minutes.",
};

const DELIVERABLES = [
  {
    icon: FileText,
    label: "Flyer",
    description: "A print-ready, on-brand flyer with AI-written copy, pulled straight from your photos and listing details.",
  },
  {
    icon: DollarSign,
    label: "Payment Estimate",
    description: "A clean, shareable payment snapshot buyers can actually use to picture the monthly number.",
  },
  {
    icon: Globe,
    label: "Website",
    description: "A public listing presentation site at its own link — publish when you're ready, republish whenever you update it.",
  },
  {
    icon: Share2,
    label: "Social Posts",
    description: "Ready-to-post social content sized and written for the listing, no separate design step required.",
  },
] as const;

const FUTURE_ITEMS = ["Market Comp Analysis", "Open House Kit", "Seller Presentation"] as const;

/**
 * TEMPORARY (Robert, 2026-07-27): skips this landing page and sends `/`
 * straight to `/dashboard` while Robert is actively testing, removing the
 * login/signup friction on top of the already-disabled auth gate (see
 * `AUTH_GATE_ENABLED` in `middleware.ts` and `src/app/(app)/layout.tsx`).
 * `/login`, `/signup`, and this landing page's own markup below are all
 * untouched — only the default entry point at `/` changes, and only while
 * this flag is `true`. Flip `SKIP_LANDING_PAGE` back to `false` to restore
 * the marketing page as the front door.
 */
const SKIP_LANDING_PAGE = true;

export default function LandingPage() {
  if (SKIP_LANDING_PAGE) {
    redirect("/dashboard");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Ambient background treatment — same navy/gold geometric accents as /login, for visual continuity between the public page and sign-in */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-navy-800/10 blur-3xl dark:bg-navy-600/20" />
        <div className="absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-gold-400/15 blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 sm:px-8">
          <Logo variant="login" className="scale-[0.7] origin-left sm:scale-[0.8]" />
          <Button asChild variant="outline" size="sm">
            <Link href="/login">Sign In</Link>
          </Button>
        </header>

        <main>
          {/* Hero */}
          <section className="mx-auto max-w-4xl px-6 pb-16 pt-10 text-center sm:px-8 sm:pb-24 sm:pt-16">
            <Badge variant="gold" className="mb-6">
              AI-Powered Marketing for Realtors
            </Badge>

            <h1 className="font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl md:text-6xl">
              Everything you need to market a listing
              <br className="hidden sm:block" /> — generated in minutes.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Give Listing Lab a property and its photos. It builds the flyer, the payment estimate,
              the listing website, and the social posts — a complete marketing package, ready to share.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild variant="gold" size="lg">
                <Link href="/signup">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="lg" disabled aria-disabled="true">
                  Watch 60-Second Demo
                </Button>
                <Badge variant="gold">Coming Soon</Badge>
              </div>
            </div>
          </section>

          {/* Visual flow diagram */}
          <section className="mx-auto max-w-5xl px-6 pb-16 sm:px-8 sm:pb-24">
            <div className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-surface/80 p-8 shadow-soft backdrop-blur-sm sm:flex-row sm:justify-center sm:gap-6 sm:p-10">
              <FlowNode label="New Listing" />
              <FlowArrow />
              <FlowNode label="Listing Lab" emphasis />
              <FlowArrow />
              <div className="flex flex-col items-center gap-2 sm:items-start">
                {DELIVERABLES.map(({ label }) => (
                  <span key={label} className="text-sm font-medium text-foreground">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Deliverables grid */}
          <section className="mx-auto max-w-5xl px-6 pb-16 sm:px-8 sm:pb-24">
            <div className="mb-10 text-center">
              <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
                What every listing gets
              </h2>
              <p className="mt-2 text-muted-foreground">
                Generated together, ready to use the moment your listing is live.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {DELIVERABLES.map(({ icon: Icon, label, description }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-border bg-surface p-6 shadow-soft transition-transform duration-base hover:-translate-y-0.5"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-navy-800/5 text-navy-800 dark:bg-white/5 dark:text-gold-400">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold text-foreground">{label}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Future:</span>{" "}
              {FUTURE_ITEMS.join(" · ")}
            </p>
          </section>

          {/* Secondary CTA band */}
          <section className="mx-auto max-w-3xl px-6 pb-20 text-center sm:px-8 sm:pb-28">
            <div className="rounded-3xl border border-border bg-navy-800 px-8 py-12 shadow-soft-lg dark:bg-navy-900 sm:px-12">
              <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">
                Ready to market your next listing?
              </h2>
              <p className="mt-3 text-navy-100">
                Every listing gets its own Listing Marketing Hub — the flyer, website, payment estimate,
                and social posts, all in one place.
              </p>
              <Button asChild variant="gold" size="lg" className="mt-8">
                <Link href="/signup">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </section>
        </main>

        <footer className="mx-auto max-w-6xl px-6 pb-10 text-center text-xs text-muted-foreground sm:px-8">
          &copy; {new Date().getFullYear()} Listing Lab. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

/** One node in the hero flow diagram — plain text label in a rounded pill, gold-bordered when `emphasis` marks it as the product itself ("Listing Lab") rather than an input/output. */
function FlowNode({ label, emphasis = false }: { label: string; emphasis?: boolean }) {
  return (
    <div
      className={
        emphasis
          ? "rounded-full border-2 border-gold-500 bg-gold-50 px-5 py-2.5 text-sm font-semibold text-navy-800 dark:bg-gold-500/10 dark:text-gold-400"
          : "rounded-full border border-border bg-muted px-5 py-2.5 text-sm font-medium text-foreground"
      }
    >
      {label}
    </div>
  );
}

/** Arrow connector between flow nodes — rotates 90° on mobile where the diagram stacks vertically. */
function FlowArrow() {
  return (
    <ArrowRight
      className="h-5 w-5 shrink-0 rotate-90 text-muted-foreground sm:rotate-0"
      aria-hidden="true"
    />
  );
}

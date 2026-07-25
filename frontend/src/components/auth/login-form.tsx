"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Demo login form. There is no real authentication in Phase 1 — submitting
 * simply performs a client-side navigation to the dashboard.
 */
export function LoginForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    router.push("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
            defaultValue="robert.castro@movementmortgage.com"
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
            defaultValue="listinglab-demo"
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-muted-foreground">
          <input
            type="checkbox"
            defaultChecked
            className="h-4 w-4 rounded border-border text-gold-500 focus:ring-gold-400"
          />
          Remember me
        </label>
        <a href="#" className="font-medium text-navy-700 hover:text-gold-600 dark:text-gold-400">
          Forgot password?
        </a>
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
  );
}

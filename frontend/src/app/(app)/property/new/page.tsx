"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { FlyerPropertyForm } from "@/components/property/flyer/FlyerPropertyForm";
import { useToast } from "@/components/shared/Toast";
import { emptyPropertyForm } from "@/lib/flyer/types";
import { createProperty } from "@/lib/flyer/persistence";

/**
 * Real "create a property" flow (the piece that was missing before real
 * Supabase persistence could be demonstrated end-to-end — see
 * `src/lib/property/loader.ts` for the read side of this). Reuses the exact
 * same property-details form the Flyer Generator's Details step already
 * uses, since it's the same information either way; the only difference
 * here is a one-time submit that inserts a real row and redirects, instead
 * of continuous auto-save against an existing property.
 */
export default function NewPropertyPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = React.useState(emptyPropertyForm());
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.address.trim()) {
      setError("Street address is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const id = await createProperty(form);
      showToast("Property Lab created.");
      router.push(`/property/${id}/marketing-assets`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create the property. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl animate-fade-slide-in space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Property Lab</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the listing details to start a new workspace — photos, AI marketing copy, and flyers all live here.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FlyerPropertyForm form={form} onChange={setForm} saveStatus="idle" />

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" size="lg" onClick={() => router.push("/dashboard")} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="gold" size="lg" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? "Creating…" : "Create Property Lab"}
          </Button>
        </div>
      </form>
    </div>
  );
}

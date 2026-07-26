"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CreditCard, FileText, FolderPlus, Instagram, Plus, Sparkles } from "lucide-react";

import { Drawer } from "@/components/shared/Drawer";
import { EXAMPLE_PROPERTY_ID } from "@/lib/mock-data";

const quickCreateOptions = [
  {
    id: "new-property-lab",
    label: "New Property Lab",
    subtitle: "Start a fresh listing workspace",
    icon: FolderPlus,
    href: "/property/new",
    iconBadgeClass: "bg-navy-800 text-white dark:bg-navy-700",
  },
  {
    id: "generate-flyer",
    label: "Generate Flyer",
    subtitle: "Create a listing flyer",
    icon: FileText,
    href: `/property/${EXAMPLE_PROPERTY_ID}/marketing-assets`,
    iconBadgeClass: "bg-gold-100 text-gold-600 dark:bg-gold-500/15 dark:text-gold-400",
  },
  {
    id: "social-post",
    label: "Social Post",
    subtitle: "Create social content",
    icon: Instagram,
    href: `/property/${EXAMPLE_PROPERTY_ID}/social-media`,
    iconBadgeClass: "bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400",
  },
  {
    id: "payment-snapshot",
    label: "Payment Snapshot",
    subtitle: "Create payment sheet",
    icon: CreditCard,
    href: `/property/${EXAMPLE_PROPERTY_ID}/payment-tools`,
    iconBadgeClass: "bg-success-50 text-success dark:bg-success/15 dark:text-green-400",
  },
];

/**
 * The elevated center "+" button on the mobile bottom tab bar. Opens the
 * shared `Drawer` (a bottom sheet) with quick-create shortcuts. There's no
 * "current property" context on mobile, so every shortcut deep-links into
 * the example Property Lab workspace (123 Main Street) — a reasonable demo
 * shortcut.
 */
export function FloatingCreateButton() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Create"
        onClick={() => setOpen(true)}
        className="relative flex flex-1 flex-col items-center"
      >
        <motion.span
          whileTap={{ scale: 0.92 }}
          className="-mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-navy-950 text-white shadow-soft-lg ring-4 ring-background dark:bg-gold-500 dark:text-navy-950"
        >
          <Plus className="h-6 w-6" />
        </motion.span>
        <span className="mt-1 text-[10px] font-medium text-muted-foreground">Create</span>
      </button>

      <Drawer
        open={open}
        onOpenChange={setOpen}
        side="bottom"
        className="rounded-t-3xl pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        <div className="mx-auto mb-1 h-1.5 w-10 rounded-full bg-border" />
        <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Sparkles className="h-4 w-4 text-gold-500" />
          Quick Create
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Jump straight into a marketing asset for 123 Main Street.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {quickCreateOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Link
                key={option.id}
                href={option.href}
                onClick={() => setOpen(false)}
                className="flex flex-col items-start gap-2.5 rounded-2xl border border-border bg-background p-4 text-left transition-colors hover:border-gold-300"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${option.iconBadgeClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{option.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{option.subtitle}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </Drawer>
    </>
  );
}

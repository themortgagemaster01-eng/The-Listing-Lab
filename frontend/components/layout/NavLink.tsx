"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface NavLinkProps {
  label: string;
  icon: LucideIcon;
  href?: string;
  active?: boolean;
}

/**
 * A single sidebar navigation entry. When `href` is provided it renders as a
 * real Next.js link (used for the one route that exists in Phase 1); other
 * items render as a non-navigating affordance so future routes can be wired
 * up without changing this component's API.
 */
export function NavLink({ label, icon: Icon, href, active }: NavLinkProps) {
  const content = (
    <motion.div
      whileHover={{ x: active ? 0 : 2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-white/10 text-white"
          : "text-navy-200/80 hover:bg-white/5 hover:text-white"
      )}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
      <span className="truncate">{label}</span>
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className="block w-full text-left">
      {content}
    </button>
  );
}

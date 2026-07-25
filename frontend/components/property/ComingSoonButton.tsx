"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { useToast } from "@/components/shared/Toast";

interface ComingSoonButtonProps extends ButtonProps {
  icon?: LucideIcon;
  message?: string;
}

/**
 * A button for affordances that aren't wired up yet (PDF export, real QR
 * generation, etc.). Clicking shows a brief on-brand toast (via the shared
 * `Toast`/`useToast`) instead of doing nothing — reads much more like a
 * finished product than a silently-dead button.
 */
export function ComingSoonButton({
  icon: Icon,
  message = "Coming soon",
  children,
  onClick,
  ...buttonProps
}: ComingSoonButtonProps) {
  const { showToast } = useToast();

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    showToast(message);
    onClick?.(event);
  }

  return (
    <Button type="button" onClick={handleClick} {...buttonProps}>
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </Button>
  );
}

"use client";

import * as React from "react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "top" | "bottom" | "left" | "right";
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * On-brand side-sheet wrapper around the shared `ui/sheet` Radix Dialog
 * primitive — doesn't rebuild Radix, just gives it a friendlier API. Used
 * for `FloatingCreateButton`'s quick-create menu; reach for this any time a
 * slide-in panel is needed instead of a full-page navigation or a centered
 * `Modal`.
 */
export function Drawer({
  open,
  onOpenChange,
  side = "right",
  title,
  description,
  children,
  className,
}: DrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={side} className={cn(className)}>
        {(title || description) && (
          <SheetHeader>
            {title && <SheetTitle>{title}</SheetTitle>}
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
        )}
        {children}
      </SheetContent>
    </Sheet>
  );
}

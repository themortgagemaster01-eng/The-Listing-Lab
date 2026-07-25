"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { Sheet, SheetOverlay, SheetPortal, SheetClose } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * On-brand centered dialog, built on the same Radix Dialog primitive as
 * `Drawer` / `ui/sheet` (just without a `side`, so it renders centered
 * instead of docked to an edge). Use for confirmations, short forms, or
 * anything that shouldn't be a full slide-in panel.
 */
export function Modal({ open, onOpenChange, title, description, children, className }: ModalProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetPortal>
        <SheetOverlay />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface p-6 shadow-soft-lg duration-base data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            className
          )}
        >
          {(title || description) && (
            <div className="mb-4 space-y-1.5 text-left">
              {title && (
                <DialogPrimitive.Title className="text-lg font-semibold text-foreground">
                  {title}
                </DialogPrimitive.Title>
              )}
              {description && (
                <DialogPrimitive.Description className="text-sm text-muted-foreground">
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
          )}
          {children}
          <SheetClose className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground opacity-70 transition-opacity hover:bg-muted hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gold-400">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </SheetClose>
        </DialogPrimitive.Content>
      </SheetPortal>
    </Sheet>
  );
}

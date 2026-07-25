"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { DURATIONS_S } from "@/lib/design-tokens";

interface ToastItem {
  id: number;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

/**
 * Lightweight on-brand toast/snackbar — no external toast library. Mounted
 * once at the app root (`src/app/layout.tsx`); call `useToast().showToast()`
 * from anywhere to surface a brief message (used by `ComingSoonButton` and
 * `AIChatPanel`'s disabled-send flow so clicking a not-yet-wired-up action
 * gives real feedback instead of doing nothing).
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const showToast = React.useCallback((message: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 2600);
  }, []);

  const value = React.useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-[max(5.5rem,env(safe-area-inset-bottom))] z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: DURATIONS_S.fast }}
              className="pointer-events-auto flex items-center gap-2 rounded-xl bg-navy-950 px-4 py-3 text-sm font-medium text-white shadow-soft-lg dark:bg-navy-800"
            >
              <Sparkles className="h-4 w-4 shrink-0 text-gold-400" />
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

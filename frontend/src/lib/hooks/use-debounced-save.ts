import * as React from "react";

import type { SaveStatus } from "@/components/property/flyer/FlyerAutoSaveIndicator";

/**
 * Generic "auto-save continuously as the user edits" hook (Phase 2 spec
 * item #2 — property form, photo list, and per-flyer AI copy all use this
 * same debounce behavior). Debounces `value` changes by `delay`ms, then
 * calls `save(value)` and reports status for `FlyerAutoSaveIndicator`.
 *
 * `enabled` should stay `false` until the initial async load from
 * `src/lib/flyer/persistence.ts` completes — the first effect run after
 * `enabled` flips to `true` is treated as "this is the loaded baseline,
 * not a user edit" and intentionally does not trigger a save.
 */
export function useDebouncedSave<T>(
  value: T,
  save: (value: T) => Promise<void>,
  options: { delay?: number; enabled?: boolean } = {}
): SaveStatus {
  const { delay = 900, enabled = true } = options;
  const [status, setStatus] = React.useState<SaveStatus>("idle");
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearStatusTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRun = React.useRef(true);

  React.useEffect(() => {
    if (!enabled) return;
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    setStatus("saving");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      save(value)
        .then(() => {
          setStatus("saved");
          if (clearStatusTimerRef.current) clearTimeout(clearStatusTimerRef.current);
          clearStatusTimerRef.current = setTimeout(() => {
            setStatus((current) => (current === "saved" ? "idle" : current));
          }, 2000);
        })
        .catch(() => setStatus("error"));
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, enabled, delay]);

  React.useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (clearStatusTimerRef.current) clearTimeout(clearStatusTimerRef.current);
    },
    []
  );

  return status;
}

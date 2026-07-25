import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
}

/**
 * Generic pulsing skeleton block for image/card loading states — so an
 * image popping in doesn't feel jarring. Absolutely-position this over the
 * image's container and toggle it off on `onLoad`.
 */
export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return <div className={cn("animate-pulse bg-muted", className)} aria-hidden="true" />;
}

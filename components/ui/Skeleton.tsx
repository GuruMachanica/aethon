import { cn } from "@/lib/utils";

/** Shimmer placeholder block. Reuses the global `shimmer` keyframe. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-surface2/60",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:animate-shimmer before:bg-gradient-to-r",
        "before:from-transparent before:via-tealGlow/10 before:to-transparent",
        className
      )}
    />
  );
}

/** Convenience: a card-shaped skeleton. */
export function CardSkeleton() {
  return (
    <div className="glass space-y-3 p-6">
      <Skeleton className="h-10 w-10 rounded-xl" />
      <Skeleton className="h-7 w-2/3" />
      <Skeleton className="h-3 w-full" />
    </div>
  );
}

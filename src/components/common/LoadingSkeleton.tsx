import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  count?: number;
  variant?: "card" | "text" | "avatar" | "row";
}

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={cn("shimmer rounded-lg bg-muted", className)} />
  );
}

export function LoadingSkeleton({
  className,
  count = 1,
  variant = "card",
}: LoadingSkeletonProps) {
  if (variant === "card") {
    return (
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden border border-border bg-card">
            <SkeletonBlock className="h-48 rounded-none" />
            <div className="p-4 space-y-3">
              <SkeletonBlock className="h-5 w-3/4" />
              <SkeletonBlock className="h-4 w-1/2" />
              <div className="flex gap-2">
                <SkeletonBlock className="h-6 w-16 rounded-full" />
                <SkeletonBlock className="h-6 w-16 rounded-full" />
              </div>
              <div className="flex items-center justify-between pt-2">
                <SkeletonBlock className="h-5 w-20" />
                <SkeletonBlock className="h-8 w-8 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "text") {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonBlock key={i} className="h-4 w-full last:w-3/4" />
        ))}
      </div>
    );
  }

  if (variant === "avatar") {
    return <SkeletonBlock className={cn("h-10 w-10 rounded-full", className)} />;
  }

  if (variant === "row") {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
            <SkeletonBlock className="h-12 w-12 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <SkeletonBlock className="h-4 w-1/3" />
              <SkeletonBlock className="h-3 w-1/2" />
            </div>
            <SkeletonBlock className="h-8 w-20" />
          </div>
        ))}
      </div>
    );
  }

  return <SkeletonBlock className={className} />;
}

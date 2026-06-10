/**
 * Skeleton placeholder for EnergyListingCard. Shape mirrors the real card
 * (white top space → green magnetic stripe → body with stats + time info)
 * so the grid doesn't reflow when listings load in.
 */
export const ListingSkeleton = () => (
  <div className="relative overflow-hidden flex w-full flex-col rounded-2xl border border-primary/12 bg-card shadow-[0_6px_18px_-12px_rgba(36,40,128,0.18)]">
    {/* Top white space */}
    <div className="h-4" />

    {/* Magnetic stripe placeholder */}
    <div className="bg-accent/15 px-5 py-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-4 w-48 max-w-full rounded bg-foreground/10 animate-pulse" />
          <div className="h-3 w-32 max-w-full rounded bg-foreground/10 animate-pulse" />
        </div>
        <div className="h-5 w-16 rounded-full bg-foreground/10 animate-pulse" />
      </div>
    </div>

    {/* Body — stats + time info */}
    <div className="px-5 pb-4 pt-4">
      <div className="grid grid-cols-2 gap-x-4">
        <div className="space-y-2">
          <div className="h-4 w-20 rounded bg-foreground/10 animate-pulse" />
          <div className="h-0.5 w-6 rounded-full bg-foreground/10 animate-pulse" />
          <div className="h-2.5 w-10 rounded bg-foreground/10 animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-24 rounded bg-foreground/10 animate-pulse" />
          <div className="h-2.5 w-14 rounded bg-foreground/10 animate-pulse" />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="space-y-1.5">
          <div className="h-2.5 w-16 rounded bg-foreground/10 animate-pulse" />
          <div className="h-4 w-40 max-w-full rounded bg-foreground/10 animate-pulse" />
        </div>
        <div className="space-y-1.5">
          <div className="h-2.5 w-16 rounded bg-foreground/10 animate-pulse" />
          <div className="h-4 w-36 max-w-full rounded bg-foreground/10 animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

/** Convenience renderer — emits N skeletons matching the listings grid. */
export const ListingSkeletonList = ({ count = 4 }: { count?: number }) => (
  <div className="grid gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <ListingSkeleton key={i} />
    ))}
  </div>
);

/** Shimmering placeholder matching PropertyCard's shape, shown while listings load. */
export function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl bg-card">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Shimmer />
      </div>
      <div className="p-5">
        <div className="relative h-5 w-3/4 overflow-hidden rounded-full bg-muted">
          <Shimmer />
        </div>
        <div className="relative mt-3 h-3.5 w-1/2 overflow-hidden rounded-full bg-muted">
          <Shimmer />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="relative h-6 w-20 overflow-hidden rounded-full bg-muted">
            <Shimmer />
          </div>
          <div className="relative h-5 w-16 overflow-hidden rounded-full bg-muted">
            <Shimmer />
          </div>
        </div>
      </div>
    </div>
  );
}

function Shimmer() {
  return (
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
  );
}

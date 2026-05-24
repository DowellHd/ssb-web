export function PortfolioSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Section header */}
      <div className="h-6 w-48 rounded bg-muted" />

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-4 space-y-2">
            <div className="h-3 w-20 rounded bg-muted" />
            <div className="h-6 w-24 rounded bg-muted" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-4 border-b">
          <div className="h-4 w-32 rounded bg-muted" />
        </div>
        <div className="divide-y">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3">
              <div className="h-4 w-16 rounded bg-muted" />
              <div className="h-4 w-20 rounded bg-muted" />
              <div className="h-4 w-20 rounded bg-muted hidden sm:block" />
              <div className="h-4 w-16 rounded bg-muted hidden md:block" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

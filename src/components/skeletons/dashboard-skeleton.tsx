export function DashboardSkeleton() {
  return (
    <div className="space-y-8 max-w-6xl animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-64 rounded-lg bg-muted" />
        <div className="h-4 w-48 rounded bg-muted" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-4 space-y-2">
            <div className="h-3 w-20 rounded bg-muted" />
            <div className="h-7 w-24 rounded bg-muted" />
          </div>
        ))}
      </div>

      {/* Feature tiles */}
      <div className="space-y-4">
        <div className="h-5 w-32 rounded bg-muted" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-4 space-y-2">
              <div className="h-8 w-8 rounded-lg bg-muted" />
              <div className="h-4 w-28 rounded bg-muted" />
              <div className="h-3 w-36 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

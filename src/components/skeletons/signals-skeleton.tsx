function SignalCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-5 flex flex-col gap-4 animate-pulse">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted shrink-0" />
          <div className="space-y-1.5">
            <div className="h-5 w-14 rounded bg-muted" />
            <div className="h-3 w-10 rounded bg-muted" />
          </div>
        </div>
        <div className="h-6 w-24 rounded-full bg-muted shrink-0" />
      </div>

      {/* Summary lines */}
      <div className="space-y-1.5">
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-4/5 rounded bg-muted" />
      </div>

      {/* Confidence bar */}
      <div className="space-y-1">
        <div className="h-3 w-16 rounded bg-muted" />
        <div className="h-1.5 w-full rounded-full bg-muted" />
      </div>

      {/* Time horizon */}
      <div className="h-3 w-40 rounded bg-muted" />

      {/* Buttons */}
      <div className="flex gap-2 mt-auto">
        <div className="h-8 flex-1 rounded-md bg-muted" />
        <div className="h-8 flex-1 rounded-md bg-muted" />
      </div>
    </div>
  );
}

export function SignalsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
      {Array.from({ length: count }).map((_, i) => (
        <SignalCardSkeleton key={i} />
      ))}
    </div>
  );
}

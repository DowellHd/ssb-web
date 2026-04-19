/**
 * Page-level loading skeleton used by route loading.tsx files.
 * Renders a generic "cards + header" shimmer that fits most /app/* pages.
 */
import { cn } from '@/lib/utils';

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted/60',
        className,
      )}
    />
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="space-y-2">
        <Shimmer className="h-8 w-48" />
        <Shimmer className="h-4 w-80" />
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-4 space-y-3">
            <Shimmer className="h-3 w-24" />
            <Shimmer className="h-7 w-20" />
            <Shimmer className="h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Main content area */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border p-6 space-y-4">
          <Shimmer className="h-5 w-40" />
          <Shimmer className="h-48 w-full" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Shimmer key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border p-4 space-y-3">
            <Shimmer className="h-4 w-32" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <Shimmer className="h-3 w-24" />
                <Shimmer className="h-3 w-12" />
              </div>
            ))}
          </div>
          <div className="rounded-xl border p-4 space-y-3">
            <Shimmer className="h-4 w-28" />
            <Shimmer className="h-24 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Compact skeleton for list / table pages (backtests, paper trading, etc.) */
export function ListPageSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Shimmer className="h-8 w-48" />
          <Shimmer className="h-4 w-64" />
        </div>
        <Shimmer className="h-10 w-32 rounded-lg" />
      </div>

      <div className="rounded-xl border">
        {/* Table header */}
        <div className="border-b px-4 py-3 flex gap-6">
          {[40, 20, 16, 16].map((w, i) => (
            <Shimmer key={i} className={`h-3 w-${w}`} />
          ))}
        </div>
        {/* Table rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-4 py-4 flex gap-6 border-b last:border-b-0 items-center">
            <Shimmer className="h-4 w-40 flex-shrink-0" />
            <Shimmer className="h-4 w-20 flex-shrink-0" />
            <Shimmer className="h-5 w-16 rounded-full flex-shrink-0" />
            <Shimmer className="h-4 w-16 ml-auto flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

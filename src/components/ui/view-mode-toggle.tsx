'use client';

import { Clock, Calendar } from 'lucide-react';
import { useViewModeStore, type ViewMode } from '@/stores/view-mode-store';
import { cn } from '@/lib/utils';

interface ViewModeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ViewModeToggle({ className, showLabel = true }: ViewModeToggleProps) {
  const { viewMode, setViewMode } = useViewModeStore();

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {showLabel && (
        <span className="text-xs text-muted-foreground hidden sm:inline">View:</span>
      )}
      <div className="flex rounded-lg border bg-muted/50 p-0.5">
        <button
          onClick={() => setViewMode('short_term')}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors',
            viewMode === 'short_term'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
          title="Short-term view (day trading focus)"
        >
          <Clock className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Short-Term</span>
        </button>
        <button
          onClick={() => setViewMode('long_term')}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors',
            viewMode === 'long_term'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
          title="Long-term view (months to years)"
        >
          <Calendar className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Long-Term</span>
        </button>
      </div>
    </div>
  );
}

/**
 * Compact badge showing current view mode.
 */
export function ViewModeBadge({ className }: { className?: string }) {
  const viewMode = useViewModeStore((state) => state.viewMode);

  if (viewMode === 'short_term') return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium',
        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        className
      )}
    >
      <Calendar className="h-3 w-3" />
      Long-Term View
    </span>
  );
}

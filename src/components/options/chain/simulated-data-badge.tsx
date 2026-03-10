/**
 * Always-visible badge indicating that options chain data is simulated.
 * Must appear on any view that displays chain data.
 */

import { FlaskConical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SimulatedDataBadgeProps {
  className?: string;
}

export function SimulatedDataBadge({ className }: SimulatedDataBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
        className,
      )}
    >
      <FlaskConical className="h-3 w-3" />
      Simulated data — educational only
    </span>
  );
}

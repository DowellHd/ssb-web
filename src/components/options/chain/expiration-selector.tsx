/**
 * Expiration date selector for the options chain viewer.
 * Renders a scrollable row of date buttons with DTE labels.
 */

'use client';

import { formatExpiration } from '@/lib/options/utils';
import { cn } from '@/lib/utils';

interface ExpirationSelectorProps {
  expirations: string[];
  selected: string;
  onChange: (expiration: string) => void;
  isLoading?: boolean;
}

export function ExpirationSelector({
  expirations,
  selected,
  onChange,
  isLoading,
}: ExpirationSelectorProps) {
  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-8 w-24 flex-shrink-0 animate-pulse rounded-md bg-muted"
          />
        ))}
      </div>
    );
  }

  if (expirations.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
      {expirations.map((exp) => {
        const isSelected = exp === selected;
        return (
          <button
            key={exp}
            onClick={() => onChange(exp)}
            className={cn(
              'flex-shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap',
              isSelected
                ? 'bg-primary text-primary-foreground'
                : 'border bg-card text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {formatExpiration(exp)}
          </button>
        );
      })}
    </div>
  );
}

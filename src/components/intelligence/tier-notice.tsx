'use client';

import { Clock } from 'lucide-react';
import { useIntelligence } from '@/contexts/intelligence-context';
import { cn } from '@/lib/utils';

interface TierNoticeProps {
  className?: string;
}

export function TierNotice({ className }: TierNoticeProps) {
  const { tier, delayDays, hasRealtimeData } = useIntelligence();

  // Don't show notice for pro/institutional users with real-time data
  if (hasRealtimeData) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200',
        className
      )}
    >
      <Clock className="h-4 w-4 flex-shrink-0" />
      <p>
        <span className="font-medium">Data delay:</span> Analysis uses data
        delayed by {delayDays} days on the {tier} plan.{' '}
        <span className="text-amber-700 dark:text-amber-300">
          Upgrade to Pro for real-time analytics.
        </span>
      </p>
    </div>
  );
}

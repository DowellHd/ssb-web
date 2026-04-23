'use client';

import { ArrowRight, Clock, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SignalFeedItem } from '@/lib/api/signals';

const SIGNAL_TYPE_LABELS: Record<string, string> = {
  bullish_setup:  'Bullish Setup',
  bearish_setup:  'Bearish Setup',
  momentum:       'Momentum',
  mean_reversion: 'Mean Reversion',
  breakout:       'Breakout',
  earnings_play:  'Earnings Play',
};

const TIME_HORIZON_LABELS: Record<string, string> = {
  short_term:  'Short-term (1–5 days)',
  medium_term: 'Medium-term (1–4 weeks)',
  long_term:   'Long-term (1–3 months)',
};

function ConfidenceBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color =
    pct >= 80 ? 'bg-green-500' :
    pct >= 65 ? 'bg-blue-500' :
    'bg-amber-500';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium tabular-nums">{pct}%</span>
    </div>
  );
}

interface SignalCardProps {
  signal: SignalFeedItem;
}

export function SignalCard({ signal }: SignalCardProps) {
  const isBullish = signal.trend_bias === 'bullish';
  const isBearish = signal.trend_bias === 'bearish';

  return (
    <div className="rounded-xl border bg-card p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full shrink-0',
              isBullish ? 'bg-green-100 dark:bg-green-900/30' :
              isBearish ? 'bg-red-100 dark:bg-red-900/30' :
              'bg-blue-100 dark:bg-blue-900/30'
            )}
          >
            {isBullish ? (
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" aria-hidden="true" />
            ) : isBearish ? (
              <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" aria-hidden="true" />
            ) : (
              <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            )}
          </div>
          <div>
            <p className="text-lg font-bold leading-none">{signal.ticker}</p>
            <p className="text-xs text-muted-foreground mt-0.5 capitalize">{signal.asset_class}</p>
          </div>
        </div>

        <span
          className={cn(
            'shrink-0 rounded-full px-2.5 py-1 text-xs font-medium',
            isBullish ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
            isBearish ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
          )}
        >
          {SIGNAL_TYPE_LABELS[signal.signal_type] ?? signal.signal_type}
        </span>
      </div>

      {/* Summary */}
      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
        {signal.plain_english_summary}
      </p>

      {/* Confidence */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Confidence</span>
        </div>
        <ConfidenceBar score={signal.confidence_score} />
      </div>

      {/* Time horizon */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
        {TIME_HORIZON_LABELS[signal.time_horizon] ?? signal.time_horizon}
      </div>

      {/* Disclaimer */}
      <p className="text-[11px] text-muted-foreground italic">
        This is SSB analysis, not financial advice.
      </p>

      {/* CTA */}
      <Button asChild size="sm" variant="outline" className="mt-auto w-full">
        <Link href={`/app/signals/${signal.id}`}>
          View Full Analysis <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}

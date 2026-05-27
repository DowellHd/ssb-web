'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import { getIntradayRefinement, type IntradayRefinement } from '@/lib/api/signals';
import { cn } from '@/lib/utils';

interface Props {
  signalId: string;
}

function Skeleton() {
  return (
    <section className="mb-6 rounded-xl border bg-card p-5 animate-pulse">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-4 w-4 rounded bg-muted" />
        <div className="h-4 w-48 rounded bg-muted" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border p-3 space-y-2">
            <div className="h-3 w-20 rounded bg-muted" />
            <div className="h-5 w-24 rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="mt-3 h-3 w-full rounded bg-muted" />
    </section>
  );
}

const MOMENTUM_CONFIG = {
  trending_up: {
    label: 'Trending Up',
    Icon: TrendingUp,
    className: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800',
  },
  trending_down: {
    label: 'Trending Down',
    Icon: TrendingDown,
    className: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
  },
  consolidating: {
    label: 'Consolidating',
    Icon: Minus,
    className: 'text-muted-foreground',
    bg: 'bg-muted/40 border-border',
  },
} as const;

export function IntradayRefinementCard({ signalId }: Props) {
  const [data, setData] = useState<IntradayRefinement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getIntradayRefinement(signalId)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [signalId]);

  if (loading) return <Skeleton />;
  if (!data) return null;

  const momentum = MOMENTUM_CONFIG[data.intraday_momentum] ?? MOMENTUM_CONFIG.consolidating;
  const MomentumIcon = momentum.Icon;

  const vwapLabel =
    data.vwap && data.vwap_position
      ? `$${data.vwap.toFixed(2)} (${data.vwap_position})`
      : null;

  return (
    <section className="mb-6 rounded-xl border bg-card p-5">
      <div className="flex items-center gap-2 mb-1">
        <Activity className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <h2 className="text-base font-semibold">Intraday Entry Refinement</h2>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Based on {data.bars_used} × {data.timeframe} bars — tighter than the daily ATR zone
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Refined entry zone */}
        <div className="rounded-lg border bg-primary/5 border-primary/20 p-3 col-span-2 sm:col-span-1">
          <p className="text-xs text-muted-foreground">Refined Entry Zone</p>
          <p className="mt-1 font-semibold tabular-nums">
            ${data.refined_entry_low.toFixed(2)} – ${data.refined_entry_high.toFixed(2)}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Intraday S/R anchored</p>
        </div>

        {/* Momentum */}
        <div className={cn('rounded-lg border p-3', momentum.bg)}>
          <p className="text-xs text-muted-foreground">30-Min Momentum</p>
          <div className={cn('mt-1 flex items-center gap-1.5 font-semibold text-sm', momentum.className)}>
            <MomentumIcon className="h-4 w-4" aria-hidden="true" />
            {momentum.label}
          </div>
        </div>

        {/* Support / Resistance */}
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Support / Resistance</p>
          <p className="mt-1 text-sm font-semibold tabular-nums">
            {data.nearest_support ? (
              <span className="text-green-600 dark:text-green-400">
                ${data.nearest_support.toFixed(2)}
              </span>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
            {' / '}
            {data.nearest_resistance ? (
              <span className="text-red-600 dark:text-red-400">
                ${data.nearest_resistance.toFixed(2)}
              </span>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Swing low / high</p>
        </div>

        {/* VWAP */}
        {vwapLabel && (
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">VWAP</p>
            <p className="mt-1 text-sm font-semibold tabular-nums">{vwapLabel}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Price vs session avg</p>
          </div>
        )}
      </div>

      <p className="mt-3 text-xs text-muted-foreground leading-relaxed">{data.note}</p>
    </section>
  );
}

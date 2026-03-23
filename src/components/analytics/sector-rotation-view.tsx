'use client';

import { cn } from '@/lib/utils';
import type { SectorRotationResponse, SectorMomentum } from '@/lib/api/analytics';

interface SectorRotationViewProps {
  result: SectorRotationResponse;
  className?: string;
}

const QUADRANT_COLORS: Record<string, string> = {
  leading:   'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  improving: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  weakening: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  lagging:   'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const CYCLE_COLORS: Record<string, string> = {
  expansion:   'text-green-600 dark:text-green-400',
  mid_cycle:   'text-blue-600 dark:text-blue-400',
  late_cycle:  'text-amber-600 dark:text-amber-400',
  contraction: 'text-red-600 dark:text-red-400',
};

function MomentumBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, (value + 1) * 50)); // map -1..1 to 0..100
  const color = value >= 0 ? 'bg-green-500' : 'bg-red-500';
  return (
    <div className="relative h-1.5 w-24 rounded-full bg-muted overflow-hidden">
      <div
        className={cn('absolute top-0 h-full rounded-full transition-all', color)}
        style={{ left: '50%', width: `${Math.abs(value) * 50}%`, transform: value >= 0 ? undefined : 'translateX(-100%)' }}
      />
    </div>
  );
}

export function SectorRotationView({ result, className }: SectorRotationViewProps) {
  const groupedByQuadrant = result.sector_rankings.reduce<Record<string, SectorMomentum[]>>(
    (acc, s) => {
      const q = s.rrg_quadrant;
      if (!acc[q]) acc[q] = [];
      acc[q].push(s);
      return acc;
    },
    {}
  );

  return (
    <div className={cn('space-y-6', className)}>
      {/* Market cycle badge */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-muted-foreground">Market Cycle Phase:</span>
        <span className={cn('text-sm font-semibold capitalize', CYCLE_COLORS[result.market_cycle_phase] ?? 'text-foreground')}>
          {result.market_cycle_phase.replace('_', ' ')}
        </span>
        <span className="text-xs text-muted-foreground">
          ({result.sectors_analyzed} sectors analyzed)
        </span>
      </div>

      {/* RRG Quadrant grid */}
      <div className="grid grid-cols-2 gap-3">
        {(['leading', 'weakening', 'improving', 'lagging'] as const).map((quadrant) => {
          const sectors = groupedByQuadrant[quadrant] ?? [];
          return (
            <div key={quadrant} className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full capitalize', QUADRANT_COLORS[quadrant])}>
                  {quadrant}
                </span>
                <span className="text-xs text-muted-foreground">{sectors.length} sectors</span>
              </div>
              {sectors.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">None</p>
              ) : (
                <ul className="space-y-2">
                  {sectors.map((s) => (
                    <li key={s.symbol} className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-medium">{s.symbol}</span>
                        <span className="text-xs text-muted-foreground ml-1">
                          {s.sector_name}
                        </span>
                      </div>
                      <MomentumBar value={s.momentum_score} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* Rankings table */}
      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Sector</th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">1M RS</th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">3M RS</th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">6M RS</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Quadrant</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {result.sector_rankings.map((s) => (
              <tr key={s.symbol} className="hover:bg-muted/30 transition-colors">
                <td className="px-3 py-2 font-medium">
                  {s.symbol}
                  <span className="text-muted-foreground font-normal ml-1">{s.sector_name}</span>
                </td>
                <td className={cn('px-3 py-2 text-right font-mono', s.relative_strength_1m >= 0 ? 'text-green-600' : 'text-red-600')}>
                  {s.relative_strength_1m >= 0 ? '+' : ''}{(s.relative_strength_1m * 100).toFixed(1)}%
                </td>
                <td className={cn('px-3 py-2 text-right font-mono', s.relative_strength_3m >= 0 ? 'text-green-600' : 'text-red-600')}>
                  {s.relative_strength_3m >= 0 ? '+' : ''}{(s.relative_strength_3m * 100).toFixed(1)}%
                </td>
                <td className={cn('px-3 py-2 text-right font-mono', s.relative_strength_6m >= 0 ? 'text-green-600' : 'text-red-600')}>
                  {s.relative_strength_6m >= 0 ? '+' : ''}{(s.relative_strength_6m * 100).toFixed(1)}%
                </td>
                <td className="px-3 py-2">
                  <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium capitalize', QUADRANT_COLORS[s.rrg_quadrant] ?? '')}>
                    {s.rrg_quadrant}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

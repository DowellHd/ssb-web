'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';
import type { EarningsSurpriseResponse } from '@/lib/api/predictive';

const MOMENTUM_STYLES = {
  positive: 'text-emerald-600 dark:text-emerald-400',
  negative: 'text-red-600 dark:text-red-400',
  neutral:  'text-muted-foreground',
};

interface EarningsSurpriseViewProps {
  result: EarningsSurpriseResponse;
  className?: string;
}

export function EarningsSurpriseView({ result, className }: EarningsSurpriseViewProps) {
  const pieData = [
    { name: 'Beat',    value: result.beat_probability,    fill: '#22c55e' },
    { name: 'In-Line', value: result.in_line_probability, fill: '#64748b' },
    { name: 'Miss',   value: result.miss_probability,    fill: '#ef4444' },
  ];

  const momentumStyle = MOMENTUM_STYLES[result.pre_earnings_momentum] ?? MOMENTUM_STYLES.neutral;

  return (
    <div className={cn('space-y-5', className)}>
      {/* Pie chart + summary */}
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="h-48 w-48 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                dataKey="value"
                strokeWidth={0}
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number) => [`${(v * 100).toFixed(1)}%`]}
                contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              />
              <Legend
                iconSize={8}
                formatter={(v) => <span className="text-xs">{v}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-3">
          <ProbRow label="Beat probability"    value={result.beat_probability}     color="text-emerald-600 dark:text-emerald-400" />
          <ProbRow label="In-line probability" value={result.in_line_probability}  color="text-muted-foreground" />
          <ProbRow label="Miss probability"    value={result.miss_probability}     color="text-red-600 dark:text-red-400" />
          <div className="mt-1 flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Implied earnings move:</span>
            <span className="font-semibold">±{result.implied_move_pct.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Momentum & vol signals */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-md border bg-card p-3">
          <p className="text-xs text-muted-foreground">Pre-earnings momentum</p>
          <p className={cn('mt-0.5 font-semibold capitalize', momentumStyle)}>
            {result.pre_earnings_momentum}
          </p>
        </div>
        <div className="rounded-md border bg-card p-3">
          <p className="text-xs text-muted-foreground">Volatility regime</p>
          <p className="mt-0.5 font-semibold capitalize">{result.vol_regime}</p>
        </div>
        {result.historical_beat_rate !== null && (
          <div className="rounded-md border bg-card p-3 col-span-2 sm:col-span-1">
            <p className="text-xs text-muted-foreground">Historical beat rate</p>
            <p className="mt-0.5 font-semibold text-emerald-600 dark:text-emerald-400">
              {(result.historical_beat_rate * 100).toFixed(0)}%
            </p>
          </div>
        )}
      </div>

      {/* Analysis notes */}
      <div className="space-y-1">
        {result.analysis_notes.map((note, i) => (
          <p key={i} className="text-xs text-muted-foreground">
            &middot; {note}
          </p>
        ))}
      </div>

      {/* Disclaimer */}
      <p className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
        {result.disclaimer}
      </p>
    </div>
  );
}

function ProbRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-32 shrink-0">
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={cn('h-full rounded-full', color.includes('emerald') ? 'bg-emerald-500' : color.includes('red') ? 'bg-red-500' : 'bg-muted-foreground')}
            style={{ width: `${value * 100}%` }}
          />
        </div>
      </div>
      <span className={cn('text-xs tabular-nums font-semibold', color)}>
        {(value * 100).toFixed(1)}%
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

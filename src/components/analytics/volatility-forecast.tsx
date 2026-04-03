'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';
import type { GarchResponse } from '@/lib/api/predictive';

const REGIME_STYLES: Record<string, { badge: string; label: string }> = {
  low:      { badge: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',  label: 'Low' },
  normal:   { badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',     label: 'Normal' },
  elevated: { badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400', label: 'Elevated' },
  extreme:  { badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',         label: 'Extreme' },
};

interface VolatilityForecastProps {
  result: GarchResponse;
  className?: string;
}

export function VolatilityForecast({ result, className }: VolatilityForecastProps) {
  const { forecast, parameters } = result;
  const regime = REGIME_STYLES[forecast.vol_regime] ?? REGIME_STYLES.normal;

  const chartData = forecast.forecast_dates.map((date, i) => ({
    date: date.slice(5),  // MM-DD
    vol: forecast.annualized_vol_forecast_pct[i],
    longRun: forecast.long_run_annualized_vol_pct,
  }));

  return (
    <div className={cn('space-y-5', className)}>
      {/* Summary row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Current Vol" value={`${forecast.current_annualized_vol_pct.toFixed(1)}%`} />
        <Stat label="Long-Run Vol" value={`${forecast.long_run_annualized_vol_pct.toFixed(1)}%`} />
        <Stat label="1-Day VaR 95%" value={`${forecast.var_95_pct.toFixed(2)}%`} />
        <Stat label="1-Day VaR 99%" value={`${forecast.var_99_pct.toFixed(2)}%`} />
      </div>

      {/* Regime badge */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Volatility regime:</span>
        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', regime.badge)}>
          {regime.label}
        </span>
        {!result.converged && (
          <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            Fallback estimates
          </span>
        )}
      </div>

      {/* Forecast chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              className="fill-muted-foreground"
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `${v.toFixed(0)}%`}
              className="fill-muted-foreground"
            />
            <Tooltip
              formatter={(v: number) => [`${v.toFixed(1)}%`]}
              labelClassName="text-foreground"
              contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            />
            <ReferenceLine
              y={forecast.long_run_annualized_vol_pct}
              stroke="var(--muted-foreground)"
              strokeDasharray="4 4"
              label={{ value: 'Long-run', fontSize: 10, fill: 'var(--muted-foreground)' }}
            />
            <Line
              type="monotone"
              dataKey="vol"
              stroke="var(--primary)"
              strokeWidth={2}
              dot={false}
              name="Forecast Vol"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* GARCH parameters */}
      <details className="rounded-md border bg-muted/30 px-4 py-3">
        <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
          GARCH(1,1) Parameters
        </summary>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-5">
          <Stat label="ω (omega)" value={parameters.omega.toFixed(6)} small />
          <Stat label="α (alpha)" value={parameters.alpha.toFixed(4)} small />
          <Stat label="β (beta)"  value={parameters.beta.toFixed(4)} small />
          <Stat label="Persistence" value={parameters.persistence.toFixed(4)} small />
          <Stat label="Long-run σ" value={`${parameters.long_run_annualized_vol.toFixed(1)}%`} small />
        </div>
      </details>

      {/* Explanation */}
      <p className="text-xs text-muted-foreground">{result.explanation.summary}</p>
      <p className="text-xs text-muted-foreground/60">
        Sample size: {result.sample_size} returns &middot;{' '}
        Model: {result.model_metadata.model_type} v{result.model_metadata.version}
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  small = false,
}: {
  label: string;
  value: string;
  small?: boolean;
}) {
  return (
    <div className="rounded-md border bg-card p-3">
      <p className={cn('text-muted-foreground', small ? 'text-[10px]' : 'text-xs')}>{label}</p>
      <p className={cn('font-semibold tabular-nums', small ? 'text-sm' : 'text-lg')}>{value}</p>
    </div>
  );
}

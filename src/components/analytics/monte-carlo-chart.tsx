'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { MonteCarloResponse } from '@/lib/api/analytics';

interface MonteCarloChartProps {
  result: MonteCarloResponse;
  className?: string;
}

const PERCENTILE_COLORS: Record<number, string> = {
  5:  '#ef4444',
  25: '#f97316',
  50: '#3b82f6',
  75: '#22c55e',
  95: '#16a34a',
};

const PERCENTILE_DASH: Record<number, string | undefined> = {
  5:  '4 2',
  25: '4 2',
  50: undefined,
  75: '4 2',
  95: '4 2',
};

export function MonteCarloChart({ result, className }: MonteCarloChartProps) {
  const { paths, checkpoints, initial_value } = result;

  // Build chart data: one row per checkpoint
  const chartData = checkpoints.map((day, i) => {
    const row: Record<string, number> = { day };
    for (const path of paths) {
      row[`p${path.percentile}`] = path.values[i] ?? 0;
    }
    return row;
  });

  const sortedPercentiles = [...paths].sort((a, b) => a.percentile - b.percentile);

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
          <XAxis
            dataKey="day"
            tickFormatter={(v) => `Day ${v}`}
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value: number, name: string) => {
              const pct = name.replace('p', '');
              return [`$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, `${pct}th percentile`];
            }}
            labelFormatter={(label) => `Day ${label}`}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
              fontSize: '12px',
            }}
          />
          <ReferenceLine
            y={initial_value}
            stroke="hsl(var(--muted-foreground))"
            strokeDasharray="3 3"
            strokeOpacity={0.4}
            label={{ value: 'Initial', fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
          />
          {sortedPercentiles.map((path) => (
            <Line
              key={path.percentile}
              type="monotone"
              dataKey={`p${path.percentile}`}
              stroke={PERCENTILE_COLORS[path.percentile] ?? '#94a3b8'}
              strokeWidth={path.percentile === 50 ? 2 : 1.5}
              strokeDasharray={PERCENTILE_DASH[path.percentile]}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center text-xs text-muted-foreground mt-1">
        {sortedPercentiles.map((path) => (
          <span key={path.percentile} className="flex items-center gap-1.5">
            <span
              className="inline-block h-0.5 w-5"
              style={{
                backgroundColor: PERCENTILE_COLORS[path.percentile] ?? '#94a3b8',
                borderTop: PERCENTILE_DASH[path.percentile] ? `2px dashed ${PERCENTILE_COLORS[path.percentile] ?? '#94a3b8'}` : undefined,
              }}
            />
            {path.percentile}th
          </span>
        ))}
      </div>
    </div>
  );
}

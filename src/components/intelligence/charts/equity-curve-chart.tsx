'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import type { EquityPoint } from '@/lib/demo-data/simulation';

interface EquityCurveChartProps {
  data: EquityPoint[];
  initialValue?: number;
  showBenchmark?: boolean;
  className?: string;
}

export function EquityCurveChart({
  data,
  initialValue = 100000,
  showBenchmark = true,
  className,
}: EquityCurveChartProps) {
  // Format dates for better display
  const chartData = data.map((point) => ({
    ...point,
    date: new Date(point.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  // Sample data to avoid overcrowding (show ~50 points max)
  const sampledData =
    chartData.length > 50
      ? chartData.filter((_, i) => i % Math.ceil(chartData.length / 50) === 0)
      : chartData;

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={sampledData} margin={{ left: 10, right: 10 }}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            domain={['dataMin - 5000', 'dataMax + 5000']}
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              formatCurrency(value),
              name === 'value' ? 'Portfolio' : 'Benchmark',
            ]}
            labelFormatter={(label) => label}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
              fontSize: '12px',
            }}
          />
          <Legend
            formatter={(value) => (
              <span className="text-xs">
                {value === 'value' ? 'Portfolio' : 'Benchmark (SPY)'}
              </span>
            )}
          />
          <ReferenceLine
            y={initialValue}
            stroke="hsl(var(--muted-foreground))"
            strokeDasharray="3 3"
            strokeOpacity={0.5}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          {showBenchmark && (
            <Line
              type="monotone"
              dataKey="benchmark"
              stroke="#9ca3af"
              strokeWidth={1.5}
              strokeDasharray="4 2"
              dot={false}
              activeDot={{ r: 3 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

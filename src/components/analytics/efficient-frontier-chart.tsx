'use client';

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from 'recharts';
import type { EfficientPortfolio } from '@/lib/api/analytics';

interface EfficientFrontierChartProps {
  frontier: EfficientPortfolio[];
  maxSharpe: EfficientPortfolio;
  minVariance: EfficientPortfolio;
  currentPortfolio?: EfficientPortfolio;
  className?: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div
      className="rounded-lg border bg-card p-3 shadow-sm text-xs space-y-1"
      style={{ minWidth: 160 }}
    >
      <p className="font-medium">{d.label || 'Portfolio'}</p>
      <p className="text-muted-foreground">
        Return: <span className="text-foreground font-medium">{(d.x * 100).toFixed(2)}%</span>
      </p>
      <p className="text-muted-foreground">
        Volatility: <span className="text-foreground font-medium">{(d.y * 100).toFixed(2)}%</span>
      </p>
      {d.sharpe != null && (
        <p className="text-muted-foreground">
          Sharpe: <span className="text-foreground font-medium">{d.sharpe.toFixed(2)}</span>
        </p>
      )}
    </div>
  );
};

export function EfficientFrontierChart({
  frontier,
  maxSharpe,
  minVariance,
  currentPortfolio,
  className,
}: EfficientFrontierChartProps) {
  const frontierData = frontier.map((p) => ({
    x: p.expected_return,
    y: p.volatility,
    sharpe: p.sharpe_ratio,
    label: 'Frontier',
  }));

  const maxSharpeData = [{
    x: maxSharpe.expected_return,
    y: maxSharpe.volatility,
    sharpe: maxSharpe.sharpe_ratio,
    label: 'Max Sharpe',
  }];

  const minVarData = [{
    x: minVariance.expected_return,
    y: minVariance.volatility,
    sharpe: minVariance.sharpe_ratio,
    label: 'Min Variance',
  }];

  const currentData = currentPortfolio
    ? [{
        x: currentPortfolio.expected_return,
        y: currentPortfolio.volatility,
        sharpe: currentPortfolio.sharpe_ratio,
        label: 'Current Portfolio',
      }]
    : [];

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={320}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
          <XAxis
            type="number"
            dataKey="x"
            name="Return"
            tickFormatter={(v) => `${(v * 100).toFixed(1)}%`}
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            label={{ value: 'Expected Return', position: 'insideBottom', offset: -10, fontSize: 11 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Volatility"
            tickFormatter={(v) => `${(v * 100).toFixed(1)}%`}
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            label={{ value: 'Volatility', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Efficient frontier */}
          <Scatter
            name="Frontier"
            data={frontierData}
            fill="#93c5fd"
            opacity={0.6}
            r={3}
          />

          {/* Max Sharpe */}
          <Scatter
            name="Max Sharpe"
            data={maxSharpeData}
            fill="#22c55e"
            r={7}
          />

          {/* Min Variance */}
          <Scatter
            name="Min Variance"
            data={minVarData}
            fill="#f59e0b"
            r={7}
          />

          {/* Current portfolio */}
          {currentData.length > 0 && (
            <Scatter
              name="Current"
              data={currentData}
              fill="#ef4444"
              r={7}
            />
          )}
        </ScatterChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center text-xs text-muted-foreground mt-1">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-blue-300" />
          Frontier
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
          Max Sharpe
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
          Min Variance
        </span>
        {currentPortfolio && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
            Current
          </span>
        )}
      </div>
    </div>
  );
}

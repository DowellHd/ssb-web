'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import type { RiskContribution } from '@/lib/demo-data/risk-report';

interface RiskContributionChartProps {
  contributions: RiskContribution[];
  className?: string;
}

const COLORS = [
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#f97316', // orange-500
  '#22c55e', // green-500
  '#06b6d4', // cyan-500
  '#eab308', // yellow-500
  '#6366f1', // indigo-500
];

export function RiskContributionChart({
  contributions,
  className,
}: RiskContributionChartProps) {
  const data = contributions.map((item, index) => ({
    name: item.symbol,
    value: item.contribution_pct,
    weight: item.weight,
    marginalVar: item.marginal_var,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string, props: any) => [
              `${value.toFixed(1)}%`,
              `${name} Risk Contribution`,
            ]}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
              fontSize: '12px',
            }}
          />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            formatter={(value) => (
              <span className="text-xs text-foreground">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Detailed breakdown */}
      <div className="mt-4 space-y-2">
        {contributions.map((item, index) => (
          <div
            key={item.symbol}
            className="flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="font-medium">{item.symbol}</span>
              <span className="text-muted-foreground">
                ({(item.weight * 100).toFixed(0)}% weight)
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">
                VaR: ${item.marginal_var}
              </span>
              <span className="font-medium">
                {item.contribution_pct.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

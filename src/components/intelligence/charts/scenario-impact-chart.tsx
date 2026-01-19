'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import type { ScenarioResult } from '@/lib/demo-data/stress-results';

interface ScenarioImpactChartProps {
  scenarios: ScenarioResult[];
  className?: string;
}

function getImpactColor(impactPct: number): string {
  if (impactPct > 40) return '#dc2626'; // red-600
  if (impactPct > 25) return '#ea580c'; // orange-600
  if (impactPct > 15) return '#ca8a04'; // yellow-600
  return '#65a30d'; // lime-600
}

export function ScenarioImpactChart({
  scenarios,
  className,
}: ScenarioImpactChartProps) {
  const data = scenarios.map((scenario) => ({
    name: scenario.scenario_name.replace(' Market', '').replace(' Scenario', ''),
    impact: scenario.portfolio_impact.estimated_loss_pct,
    type: scenario.scenario_type,
    fullName: scenario.scenario_name,
    period: scenario.period,
    loss: scenario.portfolio_impact.estimated_loss,
  }));

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 10, right: 30 }}
        >
          <XAxis
            type="number"
            domain={[0, 'dataMax']}
            tickFormatter={(value) => `${value}%`}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11 }}
            width={120}
          />
          <Tooltip
            formatter={(value: number, name: string, props: any) => [
              `${value.toFixed(1)}%`,
              'Estimated Loss',
            ]}
            labelFormatter={(label: string) => label}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
              fontSize: '12px',
            }}
          />
          <ReferenceLine x={0} stroke="hsl(var(--border))" />
          <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getImpactColor(entry.impact)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-lime-600" />
          <span>&lt;15%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-yellow-600" />
          <span>15-25%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-orange-600" />
          <span>25-40%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-red-600" />
          <span>&gt;40%</span>
        </div>
      </div>
    </div>
  );
}

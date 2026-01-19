'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface ProbabilityChartProps {
  probabilities: {
    bull: number;
    bear: number;
    sideways: number;
    crisis: number;
  };
  className?: string;
}

const regimeColors = {
  bull: '#22c55e', // green-500
  bear: '#ef4444', // red-500
  sideways: '#6b7280', // gray-500
  crisis: '#f97316', // orange-500
};

const regimeLabels = {
  bull: 'Bull',
  bear: 'Bear',
  sideways: 'Sideways',
  crisis: 'Crisis',
};

export function ProbabilityChart({
  probabilities,
  className,
}: ProbabilityChartProps) {
  const data = Object.entries(probabilities).map(([key, value]) => ({
    regime: regimeLabels[key as keyof typeof regimeLabels],
    probability: Math.round(value * 100),
    color: regimeColors[key as keyof typeof regimeColors],
  }));

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
          <XAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="regime"
            tick={{ fontSize: 12 }}
            width={70}
          />
          <Tooltip
            formatter={(value: number) => [`${value}%`, 'Probability']}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="probability" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

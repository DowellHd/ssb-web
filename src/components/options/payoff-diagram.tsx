'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { OptionsPaperPositionRaw } from '@/lib/api/options-paper';

// ============================================================================
// Payoff math
// ============================================================================

/** At-expiry P&L for one position at a given underlying price. */
function positionPayoff(pos: OptionsPaperPositionRaw, underlyingPrice: number): number {
  const { option_type, strike, contracts, entry_premium, open_action } = pos;
  const multiplier = 100; // standard contract size

  const intrinsic =
    option_type === 'call'
      ? Math.max(0, underlyingPrice - strike)
      : Math.max(0, strike - underlyingPrice);

  const costBasis = entry_premium * multiplier * contracts;
  const receipts = intrinsic * multiplier * contracts;

  return open_action === 'buy_to_open'
    ? receipts - costBasis
    : costBasis - receipts;
}

/** Build chart data across a symmetric range around the average strike. */
function buildChartData(positions: OptionsPaperPositionRaw[], steps = 60) {
  if (positions.length === 0) return [];

  const strikes = positions.map((p) => p.strike);
  const avgStrike = strikes.reduce((s, k) => s + k, 0) / strikes.length;
  const spread = Math.max(avgStrike * 0.35, 20);
  const lo = Math.max(0.01, avgStrike - spread);
  const hi = avgStrike + spread;
  const step = (hi - lo) / steps;

  const data: { price: number; pl: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const price = lo + i * step;
    const pl = positions.reduce((sum, p) => sum + positionPayoff(p, price), 0);
    data.push({ price: parseFloat(price.toFixed(2)), pl: parseFloat(pl.toFixed(2)) });
  }
  return data;
}

// ============================================================================
// Tooltip
// ============================================================================

function PayoffTooltip({ active, payload }: { active?: boolean; payload?: { payload: { price: number; pl: number } }[] }) {
  if (!active || !payload?.length) return null;
  const { price, pl } = payload[0].payload;
  const positive = pl >= 0;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 shadow-lg text-xs">
      <p className="text-muted-foreground mb-1">Underlying: <span className="font-mono text-foreground">${price.toFixed(2)}</span></p>
      <p className={positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
        P&amp;L: <span className="font-mono font-medium">{positive ? '+' : ''}{pl.toFixed(2)}</span>
      </p>
    </div>
  );
}

// ============================================================================
// Component
// ============================================================================

interface PayoffDiagramProps {
  positions: OptionsPaperPositionRaw[];
  symbol: string;
}

export function PayoffDiagram({ positions, symbol }: PayoffDiagramProps) {
  const open = positions.filter((p) => p.status === 'open');
  const data = buildChartData(open);

  if (open.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
        No open positions for {symbol} to display payoff diagram.
      </div>
    );
  }

  const maxPl = Math.max(...data.map((d) => d.pl));
  const minPl = Math.min(...data.map((d) => d.pl));
  const maxAbs = Math.max(Math.abs(maxPl), Math.abs(minPl));
  const yPad = maxAbs * 0.15;

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Payoff Diagram — {symbol}</h3>
        <span className="text-xs text-muted-foreground">{open.length} open position{open.length !== 1 ? 's' : ''} · at expiry</span>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="plGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(142 76% 36%)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="hsl(142 76% 36%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="plGradientNeg" x1="0" y1="1" x2="0" y2="0">
              <stop offset="5%" stopColor="hsl(0 84.2% 60.2%)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="hsl(0 84.2% 60.2%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
          <XAxis
            dataKey="price"
            tickFormatter={(v) => `$${v}`}
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => `$${v >= 0 ? '+' : ''}${v.toFixed(0)}`}
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
            domain={[minPl - yPad, maxPl + yPad]}
            width={60}
          />
          <Tooltip content={<PayoffTooltip />} />
          <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 2" strokeOpacity={0.6} />
          {open.map((p) => (
            <ReferenceLine
              key={p.id}
              x={p.strike}
              stroke="hsl(var(--primary))"
              strokeDasharray="3 3"
              strokeOpacity={0.5}
              label={{ value: `$${p.strike}K`, fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
            />
          ))}
          <Area
            type="monotone"
            dataKey="pl"
            stroke="hsl(142 76% 36%)"
            strokeWidth={2}
            fill="url(#plGradient)"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      <p className="text-[10px] text-muted-foreground">
        Theoretical payoff at expiry assuming European-style exercise. Simulated — not financial advice.
      </p>
    </div>
  );
}

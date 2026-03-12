'use client';

import { TrendingUp, TrendingDown, DollarSign, BarChart2, Globe } from 'lucide-react';
import { useMarketOverview } from '@/hooks/use-crypto';
import { cn } from '@/lib/utils';

function fmt(value: number | null | undefined, opts?: Intl.NumberFormatOptions): string {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-US', opts).format(value);
}

function fmtLarge(value: number | null | undefined): string {
  if (value == null) return '—';
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toLocaleString()}`;
}

function fmtPct(value: number | null | undefined): string {
  if (value == null) return '—';
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean | null;
  icon: React.ElementType;
}

function StatCard({ label, value, sub, positive, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-xl font-semibold">{value}</p>
      {sub && (
        <p
          className={cn(
            'text-xs',
            positive === true && 'text-green-600 dark:text-green-400',
            positive === false && 'text-red-600 dark:text-red-400',
            positive === null && 'text-muted-foreground',
          )}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

export function MarketOverviewPanel() {
  const { data: overview, isLoading } = useMarketOverview();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg border bg-muted" />
        ))}
      </div>
    );
  }

  if (!overview) return null;

  const change24h = overview.market_cap_change_pct_24h;
  const isUp = change24h != null && change24h >= 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard
        label="Total Market Cap"
        value={fmtLarge(overview.total_market_cap_usd)}
        sub={change24h != null ? `${fmtPct(change24h)} (24h)` : undefined}
        positive={change24h != null ? isUp : null}
        icon={DollarSign}
      />
      <StatCard
        label="24h Volume"
        value={fmtLarge(overview.total_volume_usd)}
        icon={BarChart2}
      />
      <StatCard
        label="BTC Dominance"
        value={overview.btc_dominance != null ? `${overview.btc_dominance.toFixed(1)}%` : '—'}
        sub={
          overview.eth_dominance != null
            ? `ETH ${overview.eth_dominance.toFixed(1)}%`
            : undefined
        }
        positive={null}
        icon={TrendingUp}
      />
      <StatCard
        label="Active Assets"
        value={fmt(overview.active_cryptocurrencies, { notation: 'compact' })}
        sub={overview.markets != null ? `${overview.markets} markets` : undefined}
        positive={null}
        icon={Globe}
      />
    </div>
  );
}

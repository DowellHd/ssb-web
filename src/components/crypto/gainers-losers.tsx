'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { useGainersLosers } from '@/hooks/use-crypto';
import type { CoinPrice } from '@/lib/crypto/types';
import { cn } from '@/lib/utils';

function fmtUsd(value: number | null | undefined): string {
  if (value == null) return '—';
  if (value >= 1000) return `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  if (value >= 1) return `$${value.toFixed(4)}`;
  return `$${value.toPrecision(4)}`;
}

function fmtPct(value: number | null | undefined): string {
  if (value == null) return '—';
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

interface MoverRowProps {
  coin: CoinPrice;
  type: 'gainer' | 'loser';
}

function MoverRow({ coin, type }: MoverRowProps) {
  const isGainer = type === 'gainer';
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div className="flex items-center gap-2">
        {coin.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coin.image} alt={coin.name} className="h-5 w-5 rounded-full shrink-0" />
        )}
        <div>
          <p className="text-sm font-medium leading-tight">{coin.name}</p>
          <p className="text-xs text-muted-foreground uppercase">{coin.symbol}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium">{fmtUsd(coin.current_price)}</p>
        <p
          className={cn(
            'text-xs font-medium',
            isGainer
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400',
          )}
        >
          {fmtPct(coin.price_change_pct_24h)}
        </p>
      </div>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-10 animate-pulse rounded bg-muted" />
      ))}
    </div>
  );
}

export function GainersLosersPanel() {
  const { data, isLoading } = useGainersLosers();

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Gainers */}
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
          <h3 className="text-sm font-semibold">Top Gainers (24h)</h3>
        </div>
        {isLoading ? (
          <SkeletonList />
        ) : data?.gainers.length ? (
          data.gainers.map((coin) => (
            <MoverRow key={coin.coin_id} coin={coin} type="gainer" />
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No data available</p>
        )}
      </div>

      {/* Losers */}
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
          <h3 className="text-sm font-semibold">Top Losers (24h)</h3>
        </div>
        {isLoading ? (
          <SkeletonList />
        ) : data?.losers.length ? (
          data.losers.map((coin) => (
            <MoverRow key={coin.coin_id} coin={coin} type="loser" />
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No data available</p>
        )}
      </div>
    </div>
  );
}

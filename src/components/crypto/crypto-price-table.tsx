'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCryptoPrices } from '@/hooks/use-crypto';
import type { CoinPrice } from '@/lib/crypto/types';
import { cn } from '@/lib/utils';

// ============================================================================
// Formatting helpers
// ============================================================================

function fmtUsd(value: number | null | undefined): string {
  if (value == null) return '—';
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1000) return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (value >= 1) return `$${value.toFixed(4)}`;
  return `$${value.toPrecision(4)}`;
}

function fmtPct(value: number | null | undefined): string {
  if (value == null) return '—';
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

function pctClass(value: number | null | undefined): string {
  if (value == null) return 'text-muted-foreground';
  if (value > 0) return 'text-green-600 dark:text-green-400';
  if (value < 0) return 'text-red-600 dark:text-red-400';
  return 'text-muted-foreground';
}

// ============================================================================
// Mobile card
// ============================================================================

function CoinCard({ coin }: { coin: CoinPrice }) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-card p-3">
      <div className="flex items-center gap-3">
        {coin.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coin.image} alt={coin.name} className="h-8 w-8 rounded-full" />
        )}
        <div>
          <p className="font-medium text-sm">{coin.name}</p>
          <p className="text-xs text-muted-foreground">
            #{coin.market_cap_rank} · {coin.symbol}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium text-sm">{fmtUsd(coin.current_price)}</p>
        <p className={cn('text-xs', pctClass(coin.price_change_pct_24h))}>
          {fmtPct(coin.price_change_pct_24h)}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Desktop table
// ============================================================================

function CoinTableRow({ coin, rank }: { coin: CoinPrice; rank: number }) {
  return (
    <tr className="border-b last:border-0 hover:bg-muted/30 transition-colors">
      <td className="py-3 pl-4 pr-2 text-sm text-muted-foreground w-8">{rank}</td>
      <td className="py-3 pr-4">
        <div className="flex items-center gap-2">
          {coin.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coin.image} alt={coin.name} className="h-6 w-6 rounded-full shrink-0" />
          )}
          <span className="font-medium text-sm">{coin.name}</span>
          <span className="text-xs text-muted-foreground uppercase">{coin.symbol}</span>
        </div>
      </td>
      <td className="py-3 pr-4 text-right text-sm font-medium">
        {fmtUsd(coin.current_price)}
      </td>
      <td className={cn('py-3 pr-4 text-right text-sm', pctClass(coin.price_change_pct_24h))}>
        {fmtPct(coin.price_change_pct_24h)}
      </td>
      <td className={cn('py-3 pr-4 text-right text-sm hidden md:table-cell', pctClass(coin.price_change_pct_7d))}>
        {fmtPct(coin.price_change_pct_7d)}
      </td>
      <td className={cn('py-3 pr-4 text-right text-sm hidden lg:table-cell', pctClass(coin.price_change_pct_30d))}>
        {fmtPct(coin.price_change_pct_30d)}
      </td>
      <td className="py-3 pr-4 text-right text-sm text-muted-foreground hidden md:table-cell">
        {fmtUsd(coin.market_cap)}
      </td>
      <td className="py-3 pr-4 text-right text-sm text-muted-foreground hidden lg:table-cell">
        {fmtUsd(coin.total_volume)}
      </td>
    </tr>
  );
}

// ============================================================================
// Main component
// ============================================================================

interface CryptoPriceTableProps {
  isProUser: boolean;
}

export function CryptoPriceTable({ isProUser }: CryptoPriceTableProps) {
  const [page, setPage] = useState(1);
  const perPage = isProUser ? 50 : 20;

  const { data, isLoading, isError } = useCryptoPrices(page, perPage);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        Unable to load prices. Market data may be temporarily unavailable.
      </p>
    );
  }

  const coins = data.coins;
  const startRank = (page - 1) * perPage + 1;
  const hasNext = isProUser && coins.length === perPage;
  const hasPrev = page > 1;

  return (
    <div className="space-y-3">
      {/* Mobile cards */}
      <div className="flex flex-col gap-2 sm:hidden">
        {coins.map((coin, i) => (
          <CoinCard key={coin.coin_id} coin={coin} />
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto rounded-lg border">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="py-2.5 pl-4 pr-2 text-xs font-medium text-muted-foreground">#</th>
              <th className="py-2.5 pr-4 text-xs font-medium text-muted-foreground">Name</th>
              <th className="py-2.5 pr-4 text-right text-xs font-medium text-muted-foreground">Price</th>
              <th className="py-2.5 pr-4 text-right text-xs font-medium text-muted-foreground">24h</th>
              <th className="py-2.5 pr-4 text-right text-xs font-medium text-muted-foreground hidden md:table-cell">7d</th>
              <th className="py-2.5 pr-4 text-right text-xs font-medium text-muted-foreground hidden lg:table-cell">30d</th>
              <th className="py-2.5 pr-4 text-right text-xs font-medium text-muted-foreground hidden md:table-cell">Market Cap</th>
              <th className="py-2.5 pr-4 text-right text-xs font-medium text-muted-foreground hidden lg:table-cell">Volume (24h)</th>
            </tr>
          </thead>
          <tbody>
            {coins.map((coin, i) => (
              <CoinTableRow key={coin.coin_id} coin={coin} rank={startRank + i} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination (Pro only) */}
      {isProUser && (hasPrev || hasNext) && (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!hasPrev}
            className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <span className="text-sm text-muted-foreground">Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasNext}
            className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Free tier note */}
      {!isProUser && (
        <p className="text-xs text-muted-foreground text-center">
          Showing top {perPage} coins by market cap. Upgrade to Pro for the full list.
        </p>
      )}
    </div>
  );
}

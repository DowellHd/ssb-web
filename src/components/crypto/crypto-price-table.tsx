'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useCryptoPrices } from '@/hooks/use-crypto';
import type { CoinPrice } from '@/lib/crypto/types';
import { CATEGORIES, getCoinCategories, type CryptoCategory } from '@/lib/crypto/categories';
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
// Category filter bar
// ============================================================================

interface CategoryFilterProps {
  active: CryptoCategory | null;
  onChange: (cat: CryptoCategory | null) => void;
}

function CategoryFilter({ active, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        onClick={() => onChange(null)}
        className={cn(
          'rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
          active === null
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground hover:bg-muted/80',
        )}
      >
        All
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(active === cat.id ? null : cat.id)}
          className={cn(
            'rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
            active === cat.id ? cat.color + ' ring-1 ring-current' : 'bg-muted text-muted-foreground hover:bg-muted/80',
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// Category badge (inline in table rows)
// ============================================================================

function CategoryBadges({ coinId }: { coinId: string }) {
  const cats = getCoinCategories(coinId);
  if (cats.length === 0) return null;
  return (
    <div className="hidden lg:flex gap-1 ml-2">
      {cats.slice(0, 2).map((catId) => {
        const info = CATEGORIES.find((c) => c.id === catId);
        if (!info) return null;
        return (
          <span key={catId} className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none', info.color)}>
            {info.label}
          </span>
        );
      })}
    </div>
  );
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
// Desktop table row
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
          <CategoryBadges coinId={coin.coin_id} />
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
  const [activeCategory, setActiveCategory] = useState<CryptoCategory | null>(null);
  const perPage = isProUser ? 50 : 20;

  const { data, isLoading, isError, refetch, isFetching } = useCryptoPrices(page, perPage);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="h-5 w-12 animate-pulse rounded-full bg-muted" />
          ))}
        </div>
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center space-y-3">
        <p className="text-sm text-muted-foreground">
          Unable to load prices. Market data may be temporarily unavailable.
        </p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </button>
      </div>
    );
  }

  const allCoins = data.coins;
  const filteredCoins = activeCategory
    ? allCoins.filter((c) => getCoinCategories(c.coin_id).includes(activeCategory))
    : allCoins;

  const startRank = (page - 1) * perPage + 1;
  const hasNext = isProUser && allCoins.length === perPage;
  const hasPrev = page > 1;

  return (
    <div className="space-y-3">
      {/* Category filter */}
      <CategoryFilter active={activeCategory} onChange={setActiveCategory} />

      {/* Mobile cards */}
      {filteredCoins.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No coins match this category on the current page.
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-2 sm:hidden">
            {filteredCoins.map((coin) => (
              <CoinCard key={coin.coin_id} coin={coin} />
            ))}
          </div>

          {/* Desktop table */}
          <div className={cn('hidden sm:block overflow-x-auto rounded-lg border', isFetching && 'opacity-70 transition-opacity')}>
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
                {filteredCoins.map((coin, i) => {
                  // Rank reflects position in the full unfiltered list
                  const unfilteredIndex = allCoins.findIndex((c) => c.coin_id === coin.coin_id);
                  return (
                    <CoinTableRow key={coin.coin_id} coin={coin} rank={startRank + unfilteredIndex} />
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Pagination (Pro only, no category active) */}
      {isProUser && !activeCategory && (hasPrev || hasNext) && (
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

      {/* Pagination hint when category is filtered */}
      {isProUser && activeCategory && (
        <p className="text-xs text-muted-foreground text-center">
          Showing filtered results from page {page}. Clear the filter to paginate.
        </p>
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

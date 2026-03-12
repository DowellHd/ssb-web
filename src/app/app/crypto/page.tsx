'use client';

import {
  Bitcoin,
  ChevronRight,
  Lock,
  BarChart3,
  Star,
  Briefcase,
  TrendingUp,
  Info,
} from 'lucide-react';
import Link from 'next/link';
import { useCryptoEntitlements } from '@/hooks/use-crypto';
import { CryptoDisclaimer } from '@/components/crypto/crypto-disclaimer';
import { MarketOverviewPanel } from '@/components/crypto/market-overview';
import { CryptoPriceTable } from '@/components/crypto/crypto-price-table';
import { GainersLosersPanel } from '@/components/crypto/gainers-losers';
import { WatchlistPanel } from '@/components/crypto/watchlist-panel';
import { PortfolioTracker } from '@/components/crypto/portfolio-tracker';
import { cn } from '@/lib/utils';

// ============================================================================
// Feature card (overview view for non-entitled users)
// ============================================================================

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  available: boolean;
  requiredTier: string;
  badge?: string;
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  available,
  requiredTier,
  badge,
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-5 space-y-3',
        !available && 'opacity-70',
      )}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg',
            available
              ? 'bg-primary/10 text-primary'
              : 'bg-muted text-muted-foreground',
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex items-center gap-1.5">
          {!available && requiredTier && (
            <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              {requiredTier}+
            </span>
          )}
          {badge && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              {badge}
            </span>
          )}
        </div>
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

// ============================================================================
// Page
// ============================================================================

export default function CryptoPage() {
  const {
    data: entitlements,
    isLoading,
    isError,
  } = useCryptoEntitlements();

  const fullListEnabled = entitlements?.fullListEnabled ?? false;
  const watchlistEnabled = entitlements?.watchlistEnabled ?? false;
  const portfolioEnabled = entitlements?.portfolioEnabled ?? false;

  // ── Full dashboard (Pro+) ─────────────────────────────────────────────────
  if (!isLoading && fullListEnabled) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Crypto</h1>
          <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
            Live
          </span>
        </div>

        {/* Disclaimer — always visible */}
        <CryptoDisclaimer />

        {/* Market Overview */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Market Overview
          </h2>
          <MarketOverviewPanel />
        </section>

        {/* Gainers / Losers */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Top Movers (24h)
          </h2>
          <GainersLosersPanel />
        </section>

        {/* Main content: price table + sidebar */}
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* Price table */}
          <section>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Prices
            </h2>
            <CryptoPriceTable isProUser={fullListEnabled} />
          </section>

          {/* Sidebar: watchlist + portfolio */}
          <div className="space-y-4">
            {watchlistEnabled && <WatchlistPanel />}
            {portfolioEnabled && <PortfolioTracker />}
          </div>
        </div>
      </div>
    );
  }

  // ── Basic view (Free / Starter) with market data ──────────────────────────
  if (!isLoading && !fullListEnabled) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Crypto</h1>
            <p className="mt-1 text-muted-foreground">
              Live cryptocurrency prices and market intelligence.
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <CryptoDisclaimer />

        {/* Market Overview — available to all */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Market Overview
          </h2>
          <MarketOverviewPanel />
        </section>

        {/* Gainers / Losers — available to all */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Top Movers (24h)
          </h2>
          <GainersLosersPanel />
        </section>

        {/* Top 20 prices */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Top 20 by Market Cap
          </h2>
          <CryptoPriceTable isProUser={false} />
        </section>

        {/* Pro features overview */}
        <div>
          <h2 className="mb-3 font-semibold">Unlock More with Pro</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FeatureCard
              icon={BarChart3}
              title="Full Coin List"
              description="Access the top 250 cryptocurrencies with full pagination and 7d/30d price change data."
              available={false}
              requiredTier="Pro"
            />
            <FeatureCard
              icon={Star}
              title="Watchlist"
              description="Save up to 20 coins to a personal watchlist for quick reference."
              available={false}
              requiredTier="Pro"
            />
            <FeatureCard
              icon={Briefcase}
              title="Portfolio Tracker"
              description="Track your holdings with live P&L calculations based on current market prices."
              available={false}
              requiredTier="Pro"
            />
            <FeatureCard
              icon={TrendingUp}
              title="Advanced Search"
              description="Search across thousands of coins by name or ticker symbol."
              available={false}
              requiredTier="Pro"
            />
          </div>
        </div>

        {/* Upgrade nudge */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-5 py-4 dark:border-blue-900 dark:bg-blue-950/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-300">
                Unlock the full Crypto dashboard
              </p>
              <p className="mt-0.5 text-sm text-blue-700 dark:text-blue-400">
                Upgrade to Pro for the full coin list, watchlist, portfolio tracking,
                and advanced search.
              </p>
            </div>
            <Link
              href="/app/billing"
              className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Upgrade
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {isError && (
          <p className="text-sm text-muted-foreground">
            Unable to load feature access. Some features may be unavailable.
          </p>
        )}
      </div>
    );
  }

  // ── Loading state ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">Crypto</h1>
      </div>
      <CryptoDisclaimer />
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Market Overview
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg border bg-muted" />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  );
}

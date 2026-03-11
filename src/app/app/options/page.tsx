'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Layers,
  BookOpen,
  BarChart3,
  Activity,
  Lock,
  ChevronRight,
  Info,
} from 'lucide-react';
import Link from 'next/link';
import { getOptionsEntitlements } from '@/lib/api/options';
import { OptionsDisclaimer } from '@/components/options/options-disclaimer';
import { usePlanStore } from '@/stores/plan-store';
import { cn } from '@/lib/utils';

// ============================================================================
// Feature card
// ============================================================================

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  available: boolean;
  requiredTier: string;
  comingSoon?: boolean;
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  available,
  requiredTier,
  comingSoon,
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
        {!available && (
          <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            {requiredTier}+
          </span>
        )}
        {available && comingSoon && (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            In development
          </span>
        )}
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

export default function OptionsPage() {
  const normalized = usePlanStore((state) => state.normalized);

  const {
    data: entitlements,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['options', 'entitlements'],
    queryFn: getOptionsEntitlements,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const chainViewerEnabled = entitlements?.chainViewerEnabled ?? false;
  const paperTradingEnabled = entitlements?.paperTradingEnabled ?? false;
  const analyticsEnabled = entitlements?.analyticsEnabled ?? false;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Options</h1>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              Beta
            </span>
          </div>
          <p className="mt-1 text-muted-foreground">
            Explore options chains, simulate positions, and understand key
            options concepts — all in a risk-free, educational environment.
          </p>
        </div>
      </div>

      {/* Disclaimer — always visible */}
      <OptionsDisclaimer showSimulatedWarning />

      {/* What is this section */}
      <div className="rounded-lg border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            About Options in SSB
          </h2>
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-2">
          <p>
            Options are financial contracts that give the holder the right, but
            not the obligation, to buy or sell an asset at a specified price
            before a certain date. They are complex instruments with unique risk
            characteristics.
          </p>
          <p>
            SSB&rsquo;s Options area is built for education and simulation. You
            can explore how options are priced, understand key metrics like the
            Greeks, and simulate positions with virtual funds — without any real
            money involved.
          </p>
          <p className="text-xs">
            All chain data and pricing are generated using an educational model.
            No live market data is used in this phase. Values are approximations
            for learning purposes only.
          </p>
        </div>
      </div>

      {/* Feature grid */}
      <div>
        <h2 className="mb-3 font-semibold">Features</h2>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-36 animate-pulse rounded-lg border bg-muted"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <FeatureCard
              icon={BarChart3}
              title="Options Chain Viewer"
              description="Browse strike prices, expirations, bid/ask, implied volatility, and Greeks for educational reference."
              available={chainViewerEnabled}
              requiredTier="Starter"
              comingSoon={chainViewerEnabled}
            />
            <FeatureCard
              icon={Layers}
              title="Options Paper Trading"
              description="Simulate long calls and puts with virtual funds. Track premium, P&L, and time to expiration."
              available={paperTradingEnabled}
              requiredTier="Pro"
              comingSoon={paperTradingEnabled}
            />
            <FeatureCard
              icon={Activity}
              title="Risk & Analytics"
              description="View break-even, max profit/loss, Greeks interpretation, and payoff diagrams for paper positions."
              available={analyticsEnabled}
              requiredTier="Pro"
              comingSoon={analyticsEnabled}
            />
            <FeatureCard
              icon={BookOpen}
              title="Options Education"
              description="Learn calls vs. puts, understand the Greeks, implied volatility, and common strategy structures."
              available
              requiredTier=""
              comingSoon
            />
          </div>
        )}
      </div>

      {/* Upgrade nudge for users without chain viewer access */}
      {!isLoading && !chainViewerEnabled && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-5 py-4 dark:border-blue-900 dark:bg-blue-950/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-300">
                Unlock the Options Chain Viewer
              </p>
              <p className="mt-0.5 text-sm text-blue-700 dark:text-blue-400">
                Available on Starter and above. Upgrade to explore options
                chains, implied volatility, and Greeks.
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
      )}

      {/* Learn options link */}
      <div className="rounded-lg border bg-card p-5">
        <h2 className="font-semibold mb-1">New to options?</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Start with the Learn modules to understand the fundamentals before
          exploring chains or simulating positions.
        </p>
        <Link
          href="/app/learn"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Go to Learn
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Error fallback */}
      {isError && (
        <p className="text-sm text-muted-foreground">
          Unable to load options entitlements. Some features may be unavailable.
        </p>
      )}
    </div>
  );
}

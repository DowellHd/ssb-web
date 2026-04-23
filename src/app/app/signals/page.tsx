'use client';

import { useEffect, useState, useCallback } from 'react';
import { Filter, RefreshCw, SearchX, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SignalCard } from '@/components/signals/signal-card';
import { DisclaimerBanner } from '@/components/signals/disclaimer-banner';
import { SignalsOnboardingModal } from '@/components/signals/onboarding-modal';
import {
  getSignalFeed,
  getDisclaimerStatus,
  type SignalFeedItem,
  type SignalFilters,
} from '@/lib/api/signals';

const SIGNAL_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'bullish_setup', label: 'Bullish Setup' },
  { value: 'bearish_setup', label: 'Bearish Setup' },
  { value: 'momentum', label: 'Momentum' },
  { value: 'mean_reversion', label: 'Mean Reversion' },
  { value: 'breakout', label: 'Breakout' },
  { value: 'earnings_play', label: 'Earnings Play' },
];

const TIME_HORIZONS = [
  { value: '', label: 'All Horizons' },
  { value: 'short_term', label: 'Short-term' },
  { value: 'medium_term', label: 'Medium-term' },
  { value: 'long_term', label: 'Long-term' },
];

const ASSET_CLASSES = [
  { value: '', label: 'All Assets' },
  { value: 'stocks', label: 'Stocks' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'etf', label: 'ETFs' },
];

export default function SignalsPage() {
  const [signals, setSignals] = useState<SignalFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  // Filters
  const [signalType, setSignalType] = useState('');
  const [timeHorizon, setTimeHorizon] = useState('');
  const [assetClass, setAssetClass] = useState('');
  const [minConfidence, setMinConfidence] = useState(0);

  // Onboarding
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);

  const PER_PAGE = 20;

  const load = useCallback(async (p = 1, filters: SignalFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSignalFeed({
        page: p,
        per_page: PER_PAGE,
        signal_type: filters.signal_type || signalType || undefined,
        time_horizon: filters.time_horizon || timeHorizon || undefined,
        asset_class: filters.asset_class || assetClass || undefined,
        min_confidence: filters.min_confidence ?? (minConfidence > 0 ? minConfidence / 100 : undefined),
      });
      setSignals(res.items);
      setTotal(res.total);
      setPage(res.page);
    } catch {
      setError('Unable to load signals. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [signalType, timeHorizon, assetClass, minConfidence]);

  // Check disclaimer on mount
  useEffect(() => {
    async function checkDisclaimer() {
      try {
        const status = await getDisclaimerStatus();
        if (!status.has_accepted) {
          setShowOnboarding(true);
        } else {
          setDisclaimerChecked(true);
        }
      } catch {
        // If check fails, show onboarding as safe default
        setShowOnboarding(true);
      }
    }
    checkDisclaimer();
  }, []);

  useEffect(() => {
    if (disclaimerChecked) load();
  }, [disclaimerChecked, load]);

  const handleFilter = () => {
    load(1);
  };

  const handleOnboardingAccepted = () => {
    setShowOnboarding(false);
    setDisclaimerChecked(true);
  };

  return (
    <>
      {showOnboarding && (
        <SignalsOnboardingModal onAccepted={handleOnboardingAccepted} />
      )}

      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Page header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Signal Feed</h1>
                <p className="text-sm text-muted-foreground">
                  Technical setups updated every 15 minutes during market hours
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => load(page)}
                disabled={loading}
                aria-label="Refresh signals"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="/app/signals/performance">My Trade Log</a>
              </Button>
            </div>
          </div>

          {/* Disclaimer — non-dismissible */}
          <DisclaimerBanner className="mb-6" />

          {/* Filters */}
          <div className="mb-6 rounded-xl border bg-card p-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                <Filter className="h-4 w-4" aria-hidden="true" />
                Filters
              </div>

              <div className="flex flex-wrap gap-2 flex-1">
                <select
                  value={signalType}
                  onChange={(e) => setSignalType(e.target.value)}
                  aria-label="Filter by signal type"
                  className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {SIGNAL_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>

                <select
                  value={timeHorizon}
                  onChange={(e) => setTimeHorizon(e.target.value)}
                  aria-label="Filter by time horizon"
                  className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {TIME_HORIZONS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>

                <select
                  value={assetClass}
                  onChange={(e) => setAssetClass(e.target.value)}
                  aria-label="Filter by asset class"
                  className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {ASSET_CLASSES.map((a) => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>

                <div className="flex items-center gap-2">
                  <label htmlFor="min-confidence" className="text-sm whitespace-nowrap">
                    Min confidence
                  </label>
                  <input
                    id="min-confidence"
                    type="number"
                    min={0}
                    max={100}
                    step={5}
                    value={minConfidence}
                    onChange={(e) => setMinConfidence(Number(e.target.value))}
                    className="h-9 w-20 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>

              <Button size="sm" onClick={handleFilter} disabled={loading}>
                Apply
              </Button>
            </div>
          </div>

          {/* Content */}
          {loading && (
            <div className="flex items-center justify-center py-24">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => load(page)}>
                Retry
              </Button>
            </div>
          )}

          {!loading && !error && signals.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
              <SearchX className="h-10 w-10 text-muted-foreground/50" aria-hidden="true" />
              <div>
                <p className="font-medium">No signals match your filters</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your filters or lowering the confidence threshold.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSignalType('');
                  setTimeHorizon('');
                  setAssetClass('');
                  setMinConfidence(0);
                  load(1, {});
                }}
              >
                Clear filters
              </Button>
            </div>
          )}

          {!loading && !error && signals.length > 0 && (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                {total} signal{total !== 1 ? 's' : ''} found
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {signals.map((signal) => (
                  <SignalCard key={signal.id} signal={signal} />
                ))}
              </div>

              {/* Pagination */}
              {total > PER_PAGE && (
                <div className="mt-8 flex justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1 || loading}
                    onClick={() => load(page - 1)}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-3 text-sm text-muted-foreground">
                    Page {page} of {Math.ceil(total / PER_PAGE)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= Math.ceil(total / PER_PAGE) || loading}
                    onClick={() => load(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

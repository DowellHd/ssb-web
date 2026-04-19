'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, LineChart as LineChartIcon, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getBars } from '@/lib/api/data';
import { getRegimeAnalysis } from '@/lib/api/intelligence';
import type { OverlayType, TierLimits } from '@/lib/api/paper';
import type { OHLCV } from '@/lib/chart/overlays';
import type { RegimeType, RegimeIndicators } from '@/lib/chart/regime-context';
import {
  RANGE_CONFIG,
  getInitialRange,
  saveRangePreference,
  barSizeToApiTimeframe,
  getRangeOptions,
  getDefaultRange,
  normalizeRangeForViewMode,
  type ChartRange,
  type BarSize,
} from '@/lib/chart/timeframes';
import { getAllOverlayTypes } from '@/lib/chart/overlays';
import { useIsLongTerm } from '@/stores/view-mode-store';
import { PriceChart } from './price-chart';
import { OverlayToggles } from './overlay-toggles';
import {
  RegimeStatusBadge,
  RegimeChartWrapper,
  RegimeRiskInterpretation,
} from '@/components/chart';

interface ChartSectionProps {
  symbol: string;
  limits: TierLimits | null;
  className?: string;
}

export function ChartSection({ symbol, limits, className }: ChartSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [enabledOverlays, setEnabledOverlays] = useState<OverlayType[]>([]);
  const [range, setRange] = useState<ChartRange>(() => getDefaultRange(false));
  const [isHydrated, setIsHydrated] = useState(false);

  const isLongTerm = useIsLongTerm();
  const rangeOptions = getRangeOptions(isLongTerm);
  // Stable reference — getAllOverlayTypes() returns a new array every call, so memoize
  // to prevent the filter useEffect from firing on every render (infinite re-render loop).
  const allowedOverlays = useMemo(
    () => limits?.allowed_overlays ?? getAllOverlayTypes(),
    [limits]
  );

  // Hydrate range from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    if (symbol) {
      const savedRange = getInitialRange(symbol);
      setRange(savedRange);
    }
    setIsHydrated(true);
  }, [symbol]);

  // Load overlay preferences from localStorage once on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('paper-chart-overlays');
      if (saved) {
        setEnabledOverlays(JSON.parse(saved));
      } else {
        setEnabledOverlays(['sma20']); // Default for first visit
      }
    } catch {
      setEnabledOverlays(['sma20']);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Normalize range when view mode changes (e.g., switch from 1D to 1Y in long-term mode)
  useEffect(() => {
    setRange((currentRange) => normalizeRangeForViewMode(currentRange, isLongTerm));
  }, [isLongTerm]);

  // Get the config for current range
  const rangeConfig = RANGE_CONFIG[range];
  const barSize: BarSize = rangeConfig.barSize;
  const apiTimeframe = barSizeToApiTimeframe(barSize);

  // Fetch price data - includes range in query key for automatic refetch
  const {
    data: barsData,
    isLoading,
    error,
    refetch,
    isRefetching,
    isFetching,
  } = useQuery({
    queryKey: ['bars', symbol, range],
    queryFn: () =>
      getBars(symbol, {
        timeframe: apiTimeframe,
        limit: rangeConfig.limit,
      }),
    enabled: !!symbol && isHydrated,
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
    retry: false,
  });

  // Fetch regime data for context (uses SPY as market proxy)
  const { data: regimeData } = useQuery({
    queryKey: ['regime', 'SPY'],
    queryFn: () => getRegimeAnalysis({ symbol: 'SPY', lookback_days: 200 }),
    enabled: isHydrated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: false,
  });

  // Extract regime context
  const regimeContext = useMemo(() => {
    if (!regimeData) return null;
    return {
      regime: regimeData.regime as RegimeType,
      confidence: regimeData.confidence,
      indicators: {
        trend_score: regimeData.indicators.trend_score,
        volatility_percentile: regimeData.indicators.volatility_percentile,
        breadth_score: regimeData.indicators.breadth_score,
      } as RegimeIndicators,
    };
  }, [regimeData]);

  // Handle range change
  const handleRangeChange = useCallback(
    (newRange: ChartRange) => {
      setRange(newRange);
      if (symbol) {
        saveRangePreference(symbol, newRange);
      }
    },
    [symbol]
  );

  // Extract error message
  const errorMessage = error
    ? (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
      (error as Error)?.message ||
      'Failed to load chart data'
    : null;

  // Convert API data to OHLCV format
  const chartData = useMemo((): OHLCV[] => {
    if (!barsData?.bars) return [];

    return barsData.bars.map((bar) => ({
      time: Math.floor(new Date(bar.timestamp).getTime() / 1000),
      open: bar.open,
      high: bar.high,
      low: bar.low,
      close: bar.close,
      volume: bar.volume,
    }));
  }, [barsData]);

  // Toggle overlay and persist to localStorage
  const handleToggleOverlay = useCallback((overlay: OverlayType) => {
    setEnabledOverlays((prev) => {
      const next = prev.includes(overlay)
        ? prev.filter((o) => o !== overlay)
        : [...prev, overlay];
      try {
        localStorage.setItem('paper-chart-overlays', JSON.stringify(next));
      } catch {
        // localStorage unavailable — best effort
      }
      return next;
    });
  }, []);

  // Filter out overlays that are no longer allowed when tier/limits change
  useEffect(() => {
    setEnabledOverlays((prev) => {
      const next = prev.filter((o) => allowedOverlays.includes(o));
      // Return the same reference if nothing changed — prevents unnecessary re-renders
      return next.length === prev.length ? prev : next;
    });
  }, [allowedOverlays]);

  if (!symbol) {
    return (
      <div className={cn('rounded-lg border bg-card', className)}>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <LineChartIcon className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Select a position to view chart</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border bg-card', className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 font-semibold hover:text-primary transition-colors"
          >
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform',
                !isExpanded && '-rotate-90'
              )}
            />
            Price Chart
          </button>
          {/* Regime Status Badge */}
          {regimeContext && (
            <RegimeStatusBadge
              regime={regimeContext.regime}
              indicators={regimeContext.indicators}
              confidence={regimeContext.confidence}
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Range selector */}
          <div className="flex rounded-md border bg-muted/50 p-0.5">
            {rangeOptions.map((r) => (
              <button
                key={r}
                onClick={() => handleRangeChange(r)}
                disabled={isFetching}
                className={cn(
                  'px-2 py-1 text-xs font-medium rounded transition-colors',
                  range === r
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {r}
              </button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
          >
            <RefreshCw
              className={cn(
                'h-4 w-4',
                (isLoading || isRefetching) && 'animate-spin'
              )}
            />
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Overlay Toggles */}
          <OverlayToggles
            enabledOverlays={enabledOverlays}
            allowedOverlays={allowedOverlays}
            onToggle={handleToggleOverlay}
            dataLength={chartData.length}
          />

          {/* Chart */}
          {isLoading || !isHydrated ? (
            <div className="flex items-center justify-center h-[400px]">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : errorMessage ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-destructive">
              <p className="text-sm font-medium">Failed to load chart</p>
              <p className="text-xs text-muted-foreground mt-1">{errorMessage}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => refetch()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          ) : chartData.length > 0 ? (
            <RegimeChartWrapper regime={regimeContext?.regime || null}>
              <PriceChart
                key={`${symbol}-${barSize}`}
                symbol={symbol}
                data={chartData}
                barSize={barSize}
                enabledOverlays={enabledOverlays}
                height={400}
              />
            </RegimeChartWrapper>
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
              <p>No price data available for {symbol}</p>
              <p className="text-xs mt-1">Try selecting a different range</p>
            </div>
          )}

          {/* Regime-aware risk interpretation */}
          {regimeContext && chartData.length > 0 && (
            <RegimeRiskInterpretation
              regime={regimeContext.regime}
              volatilityPercentile={regimeContext.indicators.volatility_percentile}
            />
          )}

          {/* Educational disclaimer */}
          <p className="text-[10px] text-muted-foreground text-center">
            Chart overlays are educational visual aids only. They do not imply trading recommendations.
          </p>
        </div>
      )}
    </div>
  );
}

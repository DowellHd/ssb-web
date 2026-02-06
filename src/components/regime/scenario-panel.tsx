'use client';

import { FlaskConical, RotateCcw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useScenarioModeStore, type RegimeOverride } from '@/stores/scenario-mode-store';
import { useIsLongTerm } from '@/stores/view-mode-store';
import { cn } from '@/lib/utils';

interface ScenarioPanelProps {
  /** Current live indicator values for default slider positions */
  liveIndicators: {
    trend_score: number;
    volatility_percentile: number;
    breadth_score: number;
  };
}

const REGIME_OPTIONS: { value: RegimeOverride; label: string }[] = [
  { value: null, label: 'Auto (computed)' },
  { value: 'bull', label: 'Bull' },
  { value: 'bear', label: 'Bear' },
  { value: 'sideways', label: 'Sideways' },
  { value: 'high_volatility', label: 'High Volatility' },
  { value: 'low_volatility', label: 'Low Volatility' },
];

export function ScenarioPanel({ liveIndicators }: ScenarioPanelProps) {
  const {
    isEnabled,
    toggle,
    overrides,
    setVolatilityPercentile,
    setTrendScore,
    setBreadthScore,
    setRegimeOverride,
    resetOverrides,
  } = useScenarioModeStore();

  const isLongTerm = useIsLongTerm();

  // Get effective values (override or live)
  const volatility = overrides.volatilityPercentile ?? liveIndicators.volatility_percentile;
  const trend = overrides.trendScore ?? liveIndicators.trend_score;
  const breadth = overrides.breadthScore ?? liveIndicators.breadth_score;

  return (
    <div className="rounded-lg border bg-card">
      {/* Header with toggle */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-purple-500" />
          <div>
            <h3 className="font-semibold">Scenario Mode</h3>
            <p className="text-xs text-muted-foreground">
              {isLongTerm ? 'If these conditions persist…' : 'Short-term scenario (educational)'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEnabled && (
            <Button variant="ghost" size="sm" onClick={resetOverrides} className="gap-1">
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          )}
          <button
            onClick={toggle}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              isEnabled ? 'bg-purple-600' : 'bg-muted'
            )}
            role="switch"
            aria-checked={isEnabled}
            aria-label="Toggle scenario mode"
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                isEnabled ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </div>
      </div>

      {/* Warning banner when enabled */}
      {isEnabled && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-950/30 border-b border-amber-700/50">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
          <p className="text-xs text-amber-200">
            Scenario mode — not live market data. For exploration only.
          </p>
        </div>
      )}

      {/* Controls (shown when enabled) */}
      {isEnabled && (
        <div className="p-4 space-y-5">
          {/* Volatility Percentile */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Volatility Percentile</label>
              <span className="text-sm text-muted-foreground tabular-nums">
                {volatility.toFixed(0)}th
                {overrides.volatilityPercentile !== null && (
                  <span className="text-purple-400 ml-1">
                    ({volatility > liveIndicators.volatility_percentile ? '+' : ''}
                    {(volatility - liveIndicators.volatility_percentile).toFixed(0)})
                  </span>
                )}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={volatility}
              onChange={(e) => setVolatilityPercentile(parseFloat(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Low (0)</span>
              <span>High (100)</span>
            </div>
          </div>

          {/* Trend Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Trend Score</label>
              <span className="text-sm text-muted-foreground tabular-nums">
                {trend > 0 ? '+' : ''}{trend.toFixed(2)}
                {overrides.trendScore !== null && (
                  <span className="text-purple-400 ml-1">
                    ({trend > liveIndicators.trend_score ? '+' : ''}
                    {(trend - liveIndicators.trend_score).toFixed(2)})
                  </span>
                )}
              </span>
            </div>
            <input
              type="range"
              min={-1}
              max={1}
              step={0.05}
              value={trend}
              onChange={(e) => setTrendScore(parseFloat(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Bearish (−1)</span>
              <span>Neutral (0)</span>
              <span>Bullish (+1)</span>
            </div>
          </div>

          {/* Breadth Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Market Breadth</label>
              <span className="text-sm text-muted-foreground tabular-nums">
                {(breadth * 100).toFixed(0)}%
                {overrides.breadthScore !== null && (
                  <span className="text-purple-400 ml-1">
                    ({breadth > liveIndicators.breadth_score ? '+' : ''}
                    {((breadth - liveIndicators.breadth_score) * 100).toFixed(0)}%)
                  </span>
                )}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={breadth}
              onChange={(e) => setBreadthScore(parseFloat(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Weak (0%)</span>
              <span>Strong (100%)</span>
            </div>
          </div>

          {/* Regime Override */}
          <div className="space-y-2 pt-2 border-t">
            <label className="text-sm font-medium">Regime Override (optional)</label>
            <select
              value={overrides.regimeOverride || ''}
              onChange={(e) => setRegimeOverride((e.target.value || null) as RegimeOverride)}
              className="w-full h-9 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {REGIME_OPTIONS.map((option) => (
                <option key={option.value || 'auto'} value={option.value || ''}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Override the computed regime to see how the system would classify with forced conditions.
            </p>
          </div>

          {/* Long-term specific note */}
          {isLongTerm && (
            <div className="pt-3 border-t">
              <p className="text-xs text-muted-foreground italic">
                Historically, similar environments lasted 2–6 months. Structural effects compound over time.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Collapsed state hint */}
      {!isEnabled && (
        <div className="p-4">
          <p className="text-sm text-muted-foreground">
            Enable to explore how changing assumptions affects regime classification.
            No predictions — deterministic recomputation only.
          </p>
        </div>
      )}
    </div>
  );
}

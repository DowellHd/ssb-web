'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FlaskConical,
  RotateCcw,
  AlertTriangle,
  Lock,
  Download,
  Tag,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useScenarioModeStore, type RegimeOverride } from '@/stores/scenario-mode-store';
import { useIsLongTerm } from '@/stores/view-mode-store';
import { useScenarioEntitlements } from '@/hooks/use-scenario-entitlements';
import { SCENARIO_PRESETS, type ScenarioPreset } from '@/lib/scenario-entitlements';
import { cn } from '@/lib/utils';

interface ScenarioPanelProps {
  /** Current live indicator values for default slider positions */
  liveIndicators: {
    trend_score: number;
    volatility_percentile: number;
    breadth_score: number;
  };
  /** User's current plan name for entitlement checking */
  planName?: string;
}

const REGIME_OPTIONS: { value: RegimeOverride; label: string }[] = [
  { value: null, label: 'Auto (computed)' },
  { value: 'bull', label: 'Bull' },
  { value: 'bear', label: 'Bear' },
  { value: 'sideways', label: 'Sideways' },
  { value: 'high_volatility', label: 'High Volatility' },
  { value: 'low_volatility', label: 'Low Volatility' },
];

export function ScenarioPanel({ liveIndicators, planName }: ScenarioPanelProps) {
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
  const entitlements = useScenarioEntitlements(planName);

  // Local state for scenario label (Institutional+)
  const [scenarioLabel, setScenarioLabel] = useState('');

  // Get effective values (override or live)
  const volatility = overrides.volatilityPercentile ?? liveIndicators.volatility_percentile;
  const trend = overrides.trendScore ?? liveIndicators.trend_score;
  const breadth = overrides.breadthScore ?? liveIndicators.breadth_score;

  // Check if each slider is currently active (has an override)
  const isVolatilityActive = overrides.volatilityPercentile !== null;
  const isTrendActive = overrides.trendScore !== null;
  const isBreadthActive = overrides.breadthScore !== null;

  // Handle slider change with tier enforcement
  const handleVolatilityChange = (value: number) => {
    if (!isVolatilityActive && !entitlements.canAddMoreOverrides) {
      // Can't add more overrides - auto-disable oldest one if max=1
      if (entitlements.maxActiveOverrides === 1) {
        // Clear the currently active override
        if (isTrendActive) setTrendScore(null);
        else if (isBreadthActive) setBreadthScore(null);
      } else {
        return; // Block for higher tier limits
      }
    }
    setVolatilityPercentile(value);
  };

  const handleTrendChange = (value: number) => {
    if (!isTrendActive && !entitlements.canAddMoreOverrides) {
      if (entitlements.maxActiveOverrides === 1) {
        if (isVolatilityActive) setVolatilityPercentile(null);
        else if (isBreadthActive) setBreadthScore(null);
      } else {
        return;
      }
    }
    setTrendScore(value);
  };

  const handleBreadthChange = (value: number) => {
    if (!isBreadthActive && !entitlements.canAddMoreOverrides) {
      if (entitlements.maxActiveOverrides === 1) {
        if (isVolatilityActive) setVolatilityPercentile(null);
        else if (isTrendActive) setTrendScore(null);
      } else {
        return;
      }
    }
    setBreadthScore(value);
  };

  // Apply a preset
  const applyPreset = (preset: ScenarioPreset) => {
    resetOverrides();
    if (preset.overrides.volatilityPercentile !== undefined) {
      setVolatilityPercentile(preset.overrides.volatilityPercentile);
    }
    if (preset.overrides.trendScore !== undefined) {
      setTrendScore(preset.overrides.trendScore);
    }
    if (preset.overrides.breadthScore !== undefined) {
      setBreadthScore(preset.overrides.breadthScore);
    }
  };

  // Export scenario as JSON
  const exportScenario = () => {
    const scenario = {
      label: scenarioLabel || 'Unnamed Scenario',
      timestamp: new Date().toISOString(),
      overrides: {
        volatilityPercentile: overrides.volatilityPercentile,
        trendScore: overrides.trendScore,
        breadthScore: overrides.breadthScore,
        regimeOverride: overrides.regimeOverride,
      },
      effectiveValues: {
        volatilityPercentile: volatility,
        trendScore: trend,
        breadthScore: breadth,
      },
      baseline: liveIndicators,
    };

    const blob = new Blob([JSON.stringify(scenario, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scenario-${scenarioLabel || 'export'}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Check if slider should show locked state (can't add more)
  const isSliderLocked = (isActive: boolean) => {
    return !isActive && !entitlements.canAddMoreOverrides && entitlements.maxActiveOverrides > 1;
  };

  return (
    <div className="rounded-lg border bg-card">
      {/* Header with toggle */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-purple-500" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Scenario Mode</h3>
              <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                {entitlements.tierLabel}
              </span>
            </div>
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
          {/* Free tier limit notice */}
          {entitlements.maxActiveOverrides === 1 && (
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-xs">
              <div className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Free plan: 1 input at a time (auto-swaps)
                </span>
              </div>
              <Link
                href="/app/billing"
                className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                Upgrade <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          )}

          {/* Override counter for higher tiers */}
          {entitlements.maxActiveOverrides > 1 && entitlements.maxActiveOverrides < 999 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Active inputs: {entitlements.activeOverrideCount}/{entitlements.maxActiveOverrides}
              </span>
              {!entitlements.canAddMoreOverrides && (
                <span className="text-amber-400">Maximum reached</span>
              )}
            </div>
          )}

          {/* Presets (Starter+) */}
          {entitlements.presetsEnabled && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <label className="text-sm font-medium">Quick Presets</label>
              </div>
              <div className="flex flex-wrap gap-2">
                {SCENARIO_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className="px-2.5 py-1 text-xs rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition-colors"
                    title={preset.description}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Volatility Percentile */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Volatility Percentile</label>
                {isVolatilityActive && (
                  <button
                    onClick={() => setVolatilityPercentile(null)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    (clear)
                  </button>
                )}
                {isSliderLocked(isVolatilityActive) && (
                  <Lock className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
              <span className="text-sm text-muted-foreground tabular-nums">
                {volatility.toFixed(0)}th
                {isVolatilityActive && (
                  <span className="text-purple-400 ml-1">
                    ({volatility > liveIndicators.volatility_percentile ? '+' : ''}
                    {(volatility - liveIndicators.volatility_percentile).toFixed(0)})
                  </span>
                )}
              </span>
            </div>
            <input
              id="scenario-volatility"
              name="scenario-volatility"
              type="range"
              min={0}
              max={100}
              step={1}
              value={volatility}
              onChange={(e) => handleVolatilityChange(parseFloat(e.target.value))}
              disabled={isSliderLocked(isVolatilityActive)}
              className={cn(
                'w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-purple-500',
                isSliderLocked(isVolatilityActive) && 'opacity-50 cursor-not-allowed'
              )}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Low (0)</span>
              <span>High (100)</span>
            </div>
          </div>

          {/* Trend Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Trend Score</label>
                {isTrendActive && (
                  <button
                    onClick={() => setTrendScore(null)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    (clear)
                  </button>
                )}
                {isSliderLocked(isTrendActive) && (
                  <Lock className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
              <span className="text-sm text-muted-foreground tabular-nums">
                {trend > 0 ? '+' : ''}{trend.toFixed(2)}
                {isTrendActive && (
                  <span className="text-purple-400 ml-1">
                    ({trend > liveIndicators.trend_score ? '+' : ''}
                    {(trend - liveIndicators.trend_score).toFixed(2)})
                  </span>
                )}
              </span>
            </div>
            <input
              id="scenario-trend"
              name="scenario-trend"
              type="range"
              min={-1}
              max={1}
              step={0.05}
              value={trend}
              onChange={(e) => handleTrendChange(parseFloat(e.target.value))}
              disabled={isSliderLocked(isTrendActive)}
              className={cn(
                'w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-purple-500',
                isSliderLocked(isTrendActive) && 'opacity-50 cursor-not-allowed'
              )}
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
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Market Breadth</label>
                {isBreadthActive && (
                  <button
                    onClick={() => setBreadthScore(null)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    (clear)
                  </button>
                )}
                {isSliderLocked(isBreadthActive) && (
                  <Lock className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
              <span className="text-sm text-muted-foreground tabular-nums">
                {(breadth * 100).toFixed(0)}%
                {isBreadthActive && (
                  <span className="text-purple-400 ml-1">
                    ({breadth > liveIndicators.breadth_score ? '+' : ''}
                    {((breadth - liveIndicators.breadth_score) * 100).toFixed(0)}%)
                  </span>
                )}
              </span>
            </div>
            <input
              id="scenario-breadth"
              name="scenario-breadth"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={breadth}
              onChange={(e) => handleBreadthChange(parseFloat(e.target.value))}
              disabled={isSliderLocked(isBreadthActive)}
              className={cn(
                'w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-purple-500',
                isSliderLocked(isBreadthActive) && 'opacity-50 cursor-not-allowed'
              )}
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

          {/* Scenario Label (Institutional+) */}
          {entitlements.labelsEnabled && (
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-purple-400" />
                <label className="text-sm font-medium">Scenario Label</label>
              </div>
              <input
                id="scenario-label"
                name="scenario-label"
                type="text"
                value={scenarioLabel}
                onChange={(e) => setScenarioLabel(e.target.value)}
                placeholder="Name this scenario..."
                className="w-full h-9 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}

          {/* Export (Institutional+) */}
          {entitlements.exportEnabled && (
            <div className="pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={exportScenario}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export Scenario
              </Button>
            </div>
          )}

          {/* Long-term specific note */}
          {isLongTerm && (
            <div className="pt-3 border-t">
              <p className="text-xs text-muted-foreground italic">
                Historically, similar environments lasted 2–6 months. Structural effects compound over time.
              </p>
            </div>
          )}

          {/* Learn more link */}
          <div className="pt-2 text-center">
            <Link
              href="/app/billing"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Learn more about Scenario Mode tiers →
            </Link>
          </div>
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

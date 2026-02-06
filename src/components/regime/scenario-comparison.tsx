'use client';

import { ArrowRight, TrendingUp, TrendingDown, Minus, Equal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsLongTerm } from '@/stores/view-mode-store';

interface RegimeProbabilities {
  [key: string]: number;
}

interface ScenarioComparisonProps {
  baseline: {
    regime: string;
    confidence: number;
    regime_probabilities: RegimeProbabilities;
  };
  scenario: {
    regime: string;
    confidence: number;
    regime_probabilities: RegimeProbabilities;
  };
}

function DeltaIndicator({ value, format = 'percent' }: { value: number; format?: 'percent' | 'number' }) {
  const absValue = Math.abs(value);
  const displayValue = format === 'percent' ? `${(absValue * 100).toFixed(1)}%` : absValue.toFixed(2);

  if (Math.abs(value) < 0.001) {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Equal className="h-3 w-3" />
        <span>0</span>
      </span>
    );
  }

  if (value > 0) {
    return (
      <span className="flex items-center gap-1 text-xs text-green-500">
        <TrendingUp className="h-3 w-3" />
        <span>+{displayValue}</span>
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 text-xs text-red-500">
      <TrendingDown className="h-3 w-3" />
      <span>−{displayValue}</span>
    </span>
  );
}

function getRegimeColor(regime: string): string {
  const colors: Record<string, string> = {
    bull: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
    bear: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
    sideways: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
    high_volatility: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
    low_volatility: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  };
  return colors[regime] || 'bg-gray-100 text-gray-800 border-gray-200';
}

export function ScenarioComparison({ baseline, scenario }: ScenarioComparisonProps) {
  const isLongTerm = useIsLongTerm();
  const regimeChanged = baseline.regime !== scenario.regime;
  const confidenceDelta = scenario.confidence - baseline.confidence;

  // Get all regime keys
  const allRegimes = Array.from(
    new Set([...Object.keys(baseline.regime_probabilities), ...Object.keys(scenario.regime_probabilities)])
  ).sort();

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-purple-950/20">
        <h3 className="font-semibold text-purple-200">
          {isLongTerm ? 'Long-term Scenario Comparison' : 'Scenario Comparison'}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isLongTerm
            ? 'If these conditions persist, the structural effects would be:'
            : 'How your scenario changes the classification:'}
        </p>
      </div>

      {/* Main comparison */}
      <div className="p-4">
        {/* Regime change indicator */}
        <div className="flex items-center justify-center gap-4 mb-6">
          {/* Baseline */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Live Data</p>
            <span
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-semibold border capitalize inline-block',
                getRegimeColor(baseline.regime)
              )}
            >
              {baseline.regime.replace('_', ' ')}
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              {(baseline.confidence * 100).toFixed(0)}% confidence
            </p>
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center">
            <ArrowRight
              className={cn(
                'h-6 w-6',
                regimeChanged ? 'text-purple-500' : 'text-muted-foreground'
              )}
            />
            {regimeChanged && (
              <span className="text-xs text-purple-400 mt-1">Changed</span>
            )}
          </div>

          {/* Scenario */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Scenario</p>
            <span
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-semibold border capitalize inline-block',
                getRegimeColor(scenario.regime),
                regimeChanged && 'ring-2 ring-purple-500 ring-offset-2 ring-offset-background'
              )}
            >
              {scenario.regime.replace('_', ' ')}
            </span>
            <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
              {(scenario.confidence * 100).toFixed(0)}% confidence
              <DeltaIndicator value={confidenceDelta} />
            </p>
          </div>
        </div>

        {/* Probability breakdown */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Probability Changes</p>
          {allRegimes.map((regime) => {
            const baselineProb = baseline.regime_probabilities[regime] || 0;
            const scenarioProb = scenario.regime_probabilities[regime] || 0;
            const delta = scenarioProb - baselineProb;

            return (
              <div key={regime} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="capitalize">{regime.replace('_', ' ')}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground tabular-nums">
                      {(baselineProb * 100).toFixed(1)}%
                    </span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-medium tabular-nums">
                      {(scenarioProb * 100).toFixed(1)}%
                    </span>
                    <DeltaIndicator value={delta} />
                  </div>
                </div>
                <div className="flex gap-1 h-2">
                  {/* Baseline bar */}
                  <div className="flex-1 bg-muted rounded-l overflow-hidden">
                    <div
                      className="h-full bg-muted-foreground/30 transition-all"
                      style={{ width: `${baselineProb * 100}%` }}
                    />
                  </div>
                  {/* Scenario bar */}
                  <div className="flex-1 bg-muted rounded-r overflow-hidden">
                    <div
                      className={cn(
                        'h-full transition-all',
                        regime === scenario.regime ? 'bg-purple-500' : 'bg-purple-500/50'
                      )}
                      style={{ width: `${scenarioProb * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Educational note */}
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground italic">
            {isLongTerm
              ? 'Long-term effects emphasize persistence. Historically similar environments lasted 2–6 months on average.'
              : 'This shows how the classification would change with your assumptions. Sensitivity varies by regime.'}
          </p>
        </div>
      </div>
    </div>
  );
}

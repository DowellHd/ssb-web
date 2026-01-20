'use client';

import { useState } from 'react';
import { AlertTriangle, Clock, TrendingDown } from 'lucide-react';
import { useIntelligence } from '@/contexts/intelligence-context';
import {
  GatedFeature,
  ExplanationCard,
  ScenarioImpactChart,
} from '@/components/intelligence';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { demoStressResults } from '@/lib/demo-data';

export default function StressTestingPage() {
  const { isProOrHigher } = useIntelligence();
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(
    demoStressResults.scenarios[0]?.scenario_id || null
  );

  // Limit scenarios for free tier
  const scenarios = isProOrHigher
    ? demoStressResults.scenarios
    : demoStressResults.scenarios.slice(0, 3);

  const selectedScenario = scenarios.find(
    (s) => s.scenario_id === selectedScenarioId
  );

  const getSeverityColor = (lossPct: number) => {
    if (lossPct >= 40) return 'text-red-700 bg-red-100 dark:bg-red-900/30';
    if (lossPct >= 25) return 'text-red-600 bg-red-50 dark:bg-red-900/20';
    if (lossPct >= 15) return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
    return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold">Stress Testing</h2>
        <p className="text-muted-foreground mt-1">
          Scenario analysis and portfolio impact assessment
        </p>
      </div>

      {/* Worst-case scenario highlight */}
      {scenarios.length > 0 && (() => {
        const worstCase = scenarios.reduce((max, s) =>
          s.portfolio_impact.estimated_loss_pct > max.portfolio_impact.estimated_loss_pct ? s : max
        );
        return (
          <div className="rounded-lg border-2 border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-red-100 dark:bg-red-900/30 p-2">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-800 dark:text-red-300">
                  Worst-Case Scenario: {worstCase.scenario_name}
                </h3>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                  Under this scenario, the portfolio could experience a{' '}
                  <span className="font-bold">
                    {worstCase.portfolio_impact.estimated_loss_pct.toFixed(1)}%
                  </span>{' '}
                  decline based on historical data. Stress test results are illustrative and not predictive of future outcomes.
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Scenario impact comparison chart */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="font-semibold mb-4">Scenario Impact Comparison</h3>
        <ScenarioImpactChart scenarios={scenarios} />
        <p className="text-xs text-muted-foreground mt-4">
          Click on a bar to view detailed scenario analysis
        </p>
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Scenario list */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border bg-card">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Available Scenarios</h3>
              {!isProOrHigher && (
                <p className="text-xs text-muted-foreground mt-1">
                  Upgrade to Pro for all {demoStressResults.scenarios.length} scenarios
                </p>
              )}
            </div>
            <div className="divide-y max-h-[500px] overflow-y-auto">
              {scenarios.map((scenario) => (
                <button
                  key={scenario.scenario_id}
                  onClick={() => setSelectedScenarioId(scenario.scenario_id)}
                  className={`w-full text-left p-4 hover:bg-muted/50 transition-colors ${
                    selectedScenarioId === scenario.scenario_id
                      ? 'bg-muted/70'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {scenario.scenario_name}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {scenario.scenario_type}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-sm font-bold ${
                        scenario.portfolio_impact.estimated_loss_pct >= 30
                          ? 'text-red-600'
                          : scenario.portfolio_impact.estimated_loss_pct >= 20
                            ? 'text-orange-600'
                            : 'text-yellow-600'
                      }`}
                    >
                      -{scenario.portfolio_impact.estimated_loss_pct.toFixed(1)}%
                    </span>
                  </div>
                </button>
              ))}

              {/* Locked scenarios for free tier */}
              {!isProOrHigher && (
                <GatedFeature requiredTier="pro">
                  <div className="p-4 text-sm text-muted-foreground">
                    +{demoStressResults.scenarios.length - 3} more scenarios
                  </div>
                </GatedFeature>
              )}
            </div>
          </div>
        </div>

        {/* Scenario detail */}
        <div className="lg:col-span-2 space-y-6">
          {selectedScenario ? (
            <>
              {/* Scenario header */}
              <div
                className={`rounded-lg p-6 ${getSeverityColor(
                  selectedScenario.portfolio_impact.estimated_loss_pct
                )}`}
              >
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-8 w-8 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold">
                      {selectedScenario.scenario_name}
                    </h3>
                    <p className="text-sm mt-1 capitalize">
                      {selectedScenario.scenario_type} Scenario
                      {selectedScenario.period && (
                        <span className="ml-2">
                          ({selectedScenario.period})
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Impact metrics */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border bg-card p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <TrendingDown className="h-4 w-4" />
                    <span className="text-sm font-medium">Portfolio Impact</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">
                    -{selectedScenario.portfolio_impact.estimated_loss_pct.toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatCurrency(-parseFloat(selectedScenario.portfolio_impact.estimated_loss))}
                  </p>
                </div>

                {selectedScenario.portfolio_impact.worst_day_loss_pct !== undefined && (
                  <div className="rounded-lg border bg-card p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">Worst Day</span>
                    </div>
                    <p className="text-2xl font-bold text-red-600">
                      -{selectedScenario.portfolio_impact.worst_day_loss_pct.toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Single-day maximum loss
                    </p>
                  </div>
                )}

                {selectedScenario.portfolio_impact.recovery_days_historical !== undefined && (
                  <div className="rounded-lg border bg-card p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">Recovery Time</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {selectedScenario.portfolio_impact.recovery_days_historical}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Trading days to recover
                    </p>
                  </div>
                )}
              </div>

              {/* Asset impacts */}
              <div className="rounded-lg border bg-card p-6">
                <h4 className="font-semibold mb-4">Impact by Asset</h4>
                <div className="space-y-3">
                  {selectedScenario.asset_impacts
                    .sort((a, b) => Math.abs(b.impact_pct) - Math.abs(a.impact_pct))
                    .map((asset) => (
                      <div key={asset.symbol} className="flex items-center gap-4">
                        <span className="w-16 font-mono text-sm font-medium">
                          {asset.symbol}
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full ${asset.impact_pct < 0 ? 'bg-red-500' : 'bg-green-500'}`}
                            style={{
                              width: `${Math.min(
                                (Math.abs(asset.impact_pct) / Math.max(...selectedScenario.asset_impacts.map(a => Math.abs(a.impact_pct)))) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                        <span className={`w-16 text-right text-sm font-medium ${asset.impact_pct < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {asset.impact_pct > 0 ? '+' : ''}{asset.impact_pct.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Scenario description */}
              {selectedScenario.parameters?.description && (
                <div className="rounded-lg border bg-card p-6">
                  <h4 className="font-semibold mb-2">Scenario Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {String(selectedScenario.parameters.description)}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-lg border bg-card p-6 text-center text-muted-foreground">
              Select a scenario to view details
            </div>
          )}
        </div>
      </div>

      {/* Explanation card */}
      <ExplanationCard
        explanation={demoStressResults.explanation}
        defaultExpanded={false}
      />
    </div>
  );
}

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  RefreshCw,
  Info,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { apiClient, getErrorMessage } from '@/lib/api-client';
import { getRegimeModelInfo, getIntelligenceEntitlements, type ModelInfo, type EntitlementsInfo } from '@/lib/api/intelligence';
import { SUBSYSTEM_VERSIONS } from '@/lib/versioning';
import { RegimeExplanation } from '@/components/regime/regime-explanation';
import { ScenarioPanel } from '@/components/regime/scenario-panel';
import { ScenarioComparison } from '@/components/regime/scenario-comparison';
import { ViewModeToggle, ViewModeBadge } from '@/components/ui/view-mode-toggle';
import { useScenarioModeStore } from '@/stores/scenario-mode-store';
import { computeScenarioRegime } from '@/lib/scenario-compute';
import { useScenarioEntitlements } from '@/hooks/use-scenario-entitlements';

interface RegimeIndicators {
  trend_score: number;
  volatility_percentile: number;
  breadth_score: number;
  macro_alignment?: number;
  vix_level?: number;
  yield_curve_slope?: number;
}

interface Explanation {
  summary: string;
  key_factors: string[];
  model_info: {
    model_type: string;
    version: string;
    training_period?: string;
    assumptions: string[];
  };
  limitations: string[];
}

interface RegimeData {
  regime: string;
  regime_probabilities: Record<string, number>;
  confidence: number;
  analysis_date: string;
  data_as_of: string;
  delay_applied_days: number;
  indicators: RegimeIndicators;
  explanation: Explanation;
  tier: string;
}

export default function RegimePage() {
  const router = useRouter();
  const [data, setData] = useState<RegimeData | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [entitlements, setEntitlements] = useState<EntitlementsInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMethodology, setShowMethodology] = useState(false);

  // Scenario mode state
  const { isEnabled: isScenarioMode, overrides } = useScenarioModeStore();

  // Get plan name from user entitlements (not regime data tier)
  const planName = entitlements?.plan_name;
  const scenarioEntitlements = useScenarioEntitlements(planName);

  // Compute scenario result when scenario mode is enabled
  const scenarioResult = useMemo(() => {
    if (!data || !isScenarioMode) return null;

    const scenarioIndicators = {
      trend_score: overrides.trendScore ?? data.indicators.trend_score,
      volatility_percentile: overrides.volatilityPercentile ?? data.indicators.volatility_percentile,
      breadth_score: overrides.breadthScore ?? data.indicators.breadth_score,
    };

    return computeScenarioRegime(scenarioIndicators, overrides.regimeOverride);
  }, [data, isScenarioMode, overrides]);

  // Baseline result for comparison
  const baselineResult = useMemo(() => {
    if (!data) return null;
    return {
      regime: data.regime,
      confidence: data.confidence,
      regime_probabilities: data.regime_probabilities,
    };
  }, [data]);

  const fetchRegimeData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/intelligence/v2/regime', {
        params: { symbol: 'SPY', lookback_days: 200 },
      });
      setData(response.data);
    } catch (err: any) {
      const status = err?.response?.status;
      const message = getErrorMessage(err);

      if (status === 401 || status === 403) {
        toast.error('Please sign in to continue');
        router.push('/auth/login');
        return;
      }

      setError(message || 'Failed to load regime data');
      toast.error(message || 'Failed to load regime data');
    } finally {
      setLoading(false);
    }
  };

  const fetchModelInfo = async () => {
    try {
      const info = await getRegimeModelInfo();
      setModelInfo(info);
    } catch {
      // Non-critical - continue with data from regime response
    }
  };

  const fetchEntitlements = async () => {
    try {
      const info = await getIntelligenceEntitlements();
      setEntitlements(info);
    } catch {
      // Non-critical - entitlements will default to free tier
    }
  };

  useEffect(() => {
    fetchRegimeData();
    fetchModelInfo();
    fetchEntitlements();
  }, []);

  const getRegimeColor = (regime: string) => {
    const colors: Record<string, string> = {
      bull: 'bg-green-100 text-green-800 border-green-200',
      bear: 'bg-red-100 text-red-800 border-red-200',
      sideways: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high_volatility: 'bg-orange-100 text-orange-800 border-orange-200',
      low_volatility: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return colors[regime] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getTrendIcon = (score: number) => {
    if (score > 0.2) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (score < -0.2) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-yellow-500" />;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground">Loading regime analysis...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Failed to Load Data</h2>
        <p className="text-muted-foreground text-center max-w-md">{error}</p>
        <Button onClick={fetchRegimeData} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">Market Regime Analysis</h1>
            <ViewModeBadge />
          </div>
          <p className="text-muted-foreground mt-1">
            Current market conditions and regime classification
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ViewModeToggle />
          <Button
            onClick={fetchRegimeData}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Methodology info panel */}
      <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <button
          onClick={() => setShowMethodology(!showMethodology)}
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="font-medium text-blue-900 dark:text-blue-100">
              What is Market Regime Detection?
            </span>
          </div>
          {showMethodology ? (
            <ChevronUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          )}
        </button>
        {showMethodology && (
          <div className="px-4 pb-4 space-y-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              SSB doesn&apos;t use a single &quot;trend&quot; indicator. Instead, it performs{' '}
              <strong>market regime detection</strong> — a multi-factor classification
              approach that determines the current market environment.
            </p>
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-2">How it works:</p>
              <ul className="space-y-1.5 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                  <span>
                    <strong>Price Direction:</strong> Analyzes multiple moving average
                    crosses and momentum indicators
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                  <span>
                    <strong>Volatility:</strong> Evaluates historical volatility and VIX
                    levels relative to historical norms
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                  <span>
                    <strong>Mean-Reversion:</strong> Detects whether markets are
                    trending or reverting to mean
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                  <span>
                    <strong>Breadth &amp; Macro:</strong> Incorporates market breadth and
                    yield curve signals
                  </span>
                </li>
              </ul>
            </div>
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-2">Output:</p>
              <p>
                A regime classification (<strong>Bull</strong>, <strong>Bear</strong>,{' '}
                <strong>Sideways</strong>, or <strong>High Volatility</strong>) with a
                confidence score, rather than a simple up/down trend signal. This helps
                you understand the broader market context for strategy selection.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Regime header card */}
      <div className={cn(
        'rounded-lg border bg-card p-6',
        isScenarioMode && 'ring-2 ring-purple-500/50'
      )}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold border capitalize ${getRegimeColor(
                  isScenarioMode && scenarioResult ? scenarioResult.regime : data.regime
                )}`}
              >
                {(isScenarioMode && scenarioResult ? scenarioResult.regime : data.regime).replace('_', ' ')} Market
              </span>
              {isScenarioMode && (
                <span className="px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                  Scenario Mode
                </span>
              )}
              {!isScenarioMode && data.delay_applied_days > 0 && (
                <span className="px-3 py-1 rounded-full text-xs bg-muted text-muted-foreground">
                  {data.delay_applied_days}-day delay
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Confidence:</span>
              <span className="font-semibold">
                {((isScenarioMode && scenarioResult ? scenarioResult.confidence : data.confidence) * 100).toFixed(0)}%
              </span>
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full transition-all',
                    isScenarioMode ? 'bg-purple-500' : 'bg-primary'
                  )}
                  style={{ width: `${(isScenarioMode && scenarioResult ? scenarioResult.confidence : data.confidence) * 100}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-xl">
              {isScenarioMode
                ? 'Scenario-based classification. Adjust parameters to explore different conditions.'
                : data.explanation.summary}
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>
              Analysis as of:{' '}
              <span className="font-medium text-foreground">
                {new Date(data.analysis_date).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  timeZoneName: 'short',
                })}
              </span>
            </p>
            <p>
              Tier:{' '}
              <span className="font-medium text-foreground capitalize">
                {data.tier}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Scenario Mode Panel */}
      <ScenarioPanel
        liveIndicators={{
          trend_score: data.indicators.trend_score,
          volatility_percentile: data.indicators.volatility_percentile,
          breadth_score: data.indicators.breadth_score,
        }}
        planName={planName}
      />

      {/* Scenario Comparison (shown when scenario mode is active and entitlements allow) */}
      {isScenarioMode && baselineResult && scenarioResult && scenarioEntitlements.showBaselineCompare && (
        <ScenarioComparison
          baseline={baselineResult}
          scenario={scenarioResult}
          showDeltas={scenarioEntitlements.showDeltas}
        />
      )}

      {/* Interpretability panel */}
      <RegimeExplanation
        regime={isScenarioMode && scenarioResult ? scenarioResult.regime : data.regime}
        confidence={isScenarioMode && scenarioResult ? scenarioResult.confidence : data.confidence}
        indicators={
          isScenarioMode
            ? {
                trend_score: overrides.trendScore ?? data.indicators.trend_score,
                volatility_percentile: overrides.volatilityPercentile ?? data.indicators.volatility_percentile,
                breadth_score: overrides.breadthScore ?? data.indicators.breadth_score,
                vix_level: data.indicators.vix_level,
                yield_curve_slope: data.indicators.yield_curve_slope,
              }
            : data.indicators
        }
      />

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Regime probabilities */}
        <div className={cn(
          'rounded-lg border bg-card p-6',
          isScenarioMode && 'ring-1 ring-purple-500/30'
        )}>
          <h3 className="font-semibold mb-4">
            {isScenarioMode ? 'Scenario Probabilities' : 'Regime Probabilities'}
          </h3>
          <div className="space-y-3">
            {Object.entries(isScenarioMode && scenarioResult ? scenarioResult.regime_probabilities : data.regime_probabilities)
              .sort(([, a], [, b]) => b - a)
              .map(([regime, probability]) => {
                const activeRegime = isScenarioMode && scenarioResult ? scenarioResult.regime : data.regime;
                return (
                  <div key={regime} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{regime.replace('_', ' ')}</span>
                      <span className="font-medium">
                        {(probability * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full transition-all',
                          regime === activeRegime
                            ? (isScenarioMode ? 'bg-purple-500' : 'bg-primary')
                            : 'bg-muted-foreground/30'
                        )}
                        style={{ width: `${probability * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Technical indicators */}
        <div className={cn(
          'rounded-lg border bg-card p-6',
          isScenarioMode && 'ring-1 ring-purple-500/30'
        )}>
          <h3 className="font-semibold mb-4">
            {isScenarioMode ? 'Scenario Indicators' : 'Technical Indicators'}
          </h3>
          <div className="space-y-4">
            {/* Trend Score */}
            {(() => {
              const trendValue = isScenarioMode && overrides.trendScore !== null
                ? overrides.trendScore
                : data.indicators.trend_score;
              const isOverridden = isScenarioMode && overrides.trendScore !== null;
              return (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTrendIcon(trendValue)}
                      <span className="text-sm text-muted-foreground">Trend Score</span>
                      {isOverridden && <span className="text-xs text-purple-400">(modified)</span>}
                    </div>
                    <span className="text-sm font-medium">
                      {trendValue > 0 ? '+' : ''}
                      {trendValue.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full transition-all',
                        isOverridden ? 'bg-purple-500' : (trendValue > 0 ? 'bg-green-500' : 'bg-red-500')
                      )}
                      style={{
                        width: `${((trendValue + 1) / 2) * 100}%`,
                      }}
                    />
                  </div>
                </>
              );
            })()}

            {/* Volatility */}
            {(() => {
              const volValue = isScenarioMode && overrides.volatilityPercentile !== null
                ? overrides.volatilityPercentile
                : data.indicators.volatility_percentile;
              const isOverridden = isScenarioMode && overrides.volatilityPercentile !== null;
              return (
                <>
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Volatility Percentile</span>
                      {isOverridden && <span className="text-xs text-purple-400">(modified)</span>}
                    </div>
                    <span className="text-sm font-medium">
                      {volValue.toFixed(0)}th
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full transition-all',
                        isOverridden
                          ? 'bg-purple-500'
                          : volValue > 70
                            ? 'bg-red-500'
                            : volValue > 50
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                      )}
                      style={{ width: `${volValue}%` }}
                    />
                  </div>
                </>
              );
            })()}

            {/* Market Breadth */}
            {(() => {
              const breadthValue = isScenarioMode && overrides.breadthScore !== null
                ? overrides.breadthScore
                : data.indicators.breadth_score;
              const isOverridden = isScenarioMode && overrides.breadthScore !== null;
              return (
                <>
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Market Breadth</span>
                      {isOverridden && <span className="text-xs text-purple-400">(modified)</span>}
                    </div>
                    <span className="text-sm font-medium">
                      {(breadthValue * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full transition-all',
                        isOverridden
                          ? 'bg-purple-500'
                          : breadthValue > 0.6
                            ? 'bg-green-500'
                            : breadthValue > 0.4
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                      )}
                      style={{ width: `${breadthValue * 100}%` }}
                    />
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Macro indicators */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4">Macro Indicators</h3>
          <div className="space-y-4">
            {data.indicators.vix_level !== undefined && (
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="text-sm font-medium">VIX Level</p>
                  <p className="text-xs text-muted-foreground">Volatility Index</p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-lg font-bold ${
                      data.indicators.vix_level > 30
                        ? 'text-red-600'
                        : data.indicators.vix_level > 20
                          ? 'text-yellow-600'
                          : 'text-green-600'
                    }`}
                  >
                    {data.indicators.vix_level.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {data.indicators.vix_level > 30
                      ? 'High Fear'
                      : data.indicators.vix_level > 20
                        ? 'Moderate'
                        : 'Low Fear'}
                  </p>
                </div>
              </div>
            )}

            {data.indicators.yield_curve_slope !== undefined && (
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">Yield Curve (10Y-2Y)</p>
                  <p className="text-xs text-muted-foreground">Treasury Spread</p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-lg font-bold ${
                      data.indicators.yield_curve_slope < 0
                        ? 'text-red-600'
                        : data.indicators.yield_curve_slope < 0.5
                          ? 'text-yellow-600'
                          : 'text-green-600'
                    }`}
                  >
                    {data.indicators.yield_curve_slope > 0 ? '+' : ''}
                    {data.indicators.yield_curve_slope.toFixed(2)}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {data.indicators.yield_curve_slope < 0
                      ? 'Inverted'
                      : data.indicators.yield_curve_slope < 0.5
                        ? 'Flat'
                        : 'Normal'}
                  </p>
                </div>
              </div>
            )}

            {data.indicators.vix_level === undefined &&
              data.indicators.yield_curve_slope === undefined && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Macro indicators not available</span>
                </div>
              )}
          </div>
        </div>

        {/* Key factors */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4">Key Factors</h3>
          <ul className="space-y-3">
            {data.explanation.key_factors.map((factor, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  {index + 1}
                </span>
                <span className="text-sm">{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Model info */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Info className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold">Model Information</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm text-muted-foreground">Model Type</p>
            <p className="font-medium">
              {modelInfo?.model_type || data.explanation.model_info.model_type}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Version</p>
            <p className="font-medium">
              {modelInfo?.version || data.explanation.model_info.version || SUBSYSTEM_VERSIONS.regime.version}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Last Updated</p>
            <p className="font-medium">
              {new Date(modelInfo?.last_updated || SUBSYSTEM_VERSIONS.regime.lastUpdated).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
          {modelInfo?.build_id && (
            <div>
              <p className="text-sm text-muted-foreground">Build</p>
              <p className="font-medium font-mono text-xs">{modelInfo.build_id}</p>
            </div>
          )}
        </div>
        {modelInfo?.description && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">{modelInfo.description}</p>
          </div>
        )}
        {(modelInfo?.limitations || data.explanation.limitations).length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">Limitations:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {(modelInfo?.limitations || data.explanation.limitations).map((limitation, index) => (
                <li key={index}>• {limitation}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

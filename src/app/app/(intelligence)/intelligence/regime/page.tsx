'use client';

import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import { useIntelligence } from '@/contexts/intelligence-context';
import {
  RegimeBadge,
  ConfidenceBadge,
  DelayBadge,
  ExplanationCard,
  ProbabilityChart,
} from '@/components/intelligence';
import { demoRegimeAnalysis, demoRegimeAnalysisFree } from '@/lib/demo-data';

export default function RegimeAnalysisPage() {
  const { isProOrHigher } = useIntelligence();

  // Select appropriate demo data based on tier
  const data = isProOrHigher ? demoRegimeAnalysis : demoRegimeAnalysisFree;


  const getTrendIcon = (score: number) => {
    if (score > 0.2) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (score < -0.2) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-yellow-500" />;
  };

  const getTrendLabel = (score: number) => {
    if (score > 0.5) return 'Strong Uptrend';
    if (score > 0.2) return 'Moderate Uptrend';
    if (score < -0.5) return 'Strong Downtrend';
    if (score < -0.2) return 'Moderate Downtrend';
    return 'Neutral';
  };

  const getVolatilityLabel = (percentile: number) => {
    if (percentile <= 20) return 'Very Low';
    if (percentile <= 40) return 'Below Average';
    if (percentile <= 60) return 'Average';
    if (percentile <= 80) return 'Above Average';
    return 'Very High';
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold">Market Regime Analysis</h2>
        <p className="text-muted-foreground mt-1">
          Current market conditions and regime classification
        </p>
      </div>

      {/* Regime header card */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <RegimeBadge regime={data.regime} size="lg" />
              <DelayBadge delayDays={data.delay_applied_days} />
            </div>
            <ConfidenceBadge confidence={data.confidence} />
            <p className="text-sm text-muted-foreground max-w-xl">
              {data.explanation.summary}
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

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Regime probabilities chart */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4">Regime Probabilities</h3>
          <ProbabilityChart probabilities={data.regime_probabilities} />
          <p className="text-xs text-muted-foreground mt-4">
            Probabilities are calculated using a combination of trend, volatility,
            and macro indicators.
          </p>
        </div>

        {/* Technical indicators */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4">Technical Indicators</h3>
          <div className="space-y-4">
            {/* Trend Score */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getTrendIcon(data.indicators.trend_score)}
                <span className="text-sm text-muted-foreground">Trend Score</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {data.indicators.trend_score > 0 ? '+' : ''}
                  {data.indicators.trend_score.toFixed(2)}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({getTrendLabel(data.indicators.trend_score)})
                </span>
              </div>
            </div>

            {/* Trend Score Bar */}
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full transition-all ${
                  data.indicators.trend_score > 0 ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{
                  width: `${((data.indicators.trend_score + 1) / 2) * 100}%`,
                }}
              />
            </div>

            {/* Volatility Percentile */}
            <div className="flex items-center justify-between pt-4">
              <span className="text-sm text-muted-foreground">
                Volatility Percentile
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {data.indicators.volatility_percentile}th
                </span>
                <span className="text-xs text-muted-foreground">
                  ({getVolatilityLabel(data.indicators.volatility_percentile)})
                </span>
              </div>
            </div>

            {/* Volatility Bar */}
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full transition-all ${
                  data.indicators.volatility_percentile > 70
                    ? 'bg-red-500'
                    : data.indicators.volatility_percentile > 50
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                }`}
                style={{
                  width: `${data.indicators.volatility_percentile}%`,
                }}
              />
            </div>

            {/* Market Breadth */}
            {data.indicators.breadth_score !== undefined && (
              <>
                <div className="flex items-center justify-between pt-4">
                  <span className="text-sm text-muted-foreground">
                    Market Breadth
                  </span>
                  <span className="text-sm font-medium">
                    {data.indicators.breadth_score.toFixed(0)}% above 200 DMA
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      data.indicators.breadth_score > 60
                        ? 'bg-green-500'
                        : data.indicators.breadth_score > 40
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                    style={{
                      width: `${data.indicators.breadth_score}%`,
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Macro indicators */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4">Macro Indicators</h3>
          <div className="space-y-4">
            {/* VIX Level */}
            {data.indicators.vix_level !== undefined && (
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="text-sm font-medium">VIX Level</p>
                  <p className="text-xs text-muted-foreground">
                    CBOE Volatility Index
                  </p>
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

            {/* Yield Curve */}
            {data.indicators.yield_curve_slope !== undefined && (
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="text-sm font-medium">Yield Curve (10Y-2Y)</p>
                  <p className="text-xs text-muted-foreground">
                    Treasury spread indicator
                  </p>
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

            {/* No macro data message */}
            {data.indicators.vix_level === undefined &&
              data.indicators.yield_curve_slope === undefined && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Macro indicators not available for this analysis</span>
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

      {/* Explanation card */}
      <ExplanationCard
        explanation={data.explanation}
        defaultExpanded={false}
      />
    </div>
  );
}

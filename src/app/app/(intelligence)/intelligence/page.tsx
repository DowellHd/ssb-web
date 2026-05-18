'use client';

import Link from 'next/link';
import {
  TrendingUp,
  Shield,
  AlertTriangle,
  LineChart,
  ArrowRight,
} from 'lucide-react';
import { useIntelligence } from '@/contexts/intelligence-context';
import {
  MetricCard,
  RegimeBadge,
  ConfidenceBadge,
  RiskLevelBadge,
  DelayBadge,
} from '@/components/intelligence';
import { formatCurrency, formatPercent } from '@/lib/utils';
import {
  demoRegimeAnalysis,
  demoRegimeAnalysisFree,
  demoRiskReport,
  demoRiskReportBasic,
  demoStressResults,
  demoSimulationsList,
} from '@/lib/demo-data';

export default function IntelligenceDashboardPage() {
  const { isDemoMode, tier, isProOrHigher } = useIntelligence();

  // Select appropriate demo data based on tier
  const regimeData = isProOrHigher ? demoRegimeAnalysis : demoRegimeAnalysisFree;
  const riskData = isProOrHigher ? demoRiskReport : demoRiskReportBasic;
  const stressData = demoStressResults;
  const simulationsData = demoSimulationsList;

  const worstScenario = stressData.scenarios[0];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold">Intelligence Dashboard</h2>
        <p className="text-muted-foreground mt-1">
          Market analysis, risk metrics, and portfolio insights
        </p>
      </div>

      {/* Summary cards grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Regime Summary */}
        <Link
          href="/app/intelligence/regime"
          className="group rounded-lg border bg-card p-4 hover:border-primary/50 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                Market Regime
                <DelayBadge delayDays={regimeData.delay_applied_days} />
              </p>
              <div className="flex items-center gap-2">
                <RegimeBadge regime={regimeData.regime} size="sm" />
              </div>
              <ConfidenceBadge confidence={regimeData.confidence} />
            </div>
            <div className="rounded-lg bg-muted p-2 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-muted-foreground">
            <span>View analysis</span>
            <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Risk Summary */}
        <Link
          href="/app/intelligence/risk"
          className="group rounded-lg border bg-card p-4 hover:border-primary/50 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Portfolio Risk
              </p>
              <div className="flex items-center gap-2">
                <RiskLevelBadge level={riskData.risk_level} />
              </div>
              <p className="text-xs text-muted-foreground">
                {formatPercent(riskData.risk_metrics.volatility_annual * 100, 1)} annual vol
              </p>
            </div>
            <div className="rounded-lg bg-muted p-2 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <Shield className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-muted-foreground">
            <span>View metrics</span>
            <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Stress Test Summary */}
        <Link
          href="/app/intelligence/stress"
          className="group rounded-lg border bg-card p-4 hover:border-primary/50 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Worst Case Scenario
              </p>
              <p className="text-lg font-bold text-red-600">
                -{worstScenario.portfolio_impact.estimated_loss_pct.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                {worstScenario.scenario_name}
              </p>
            </div>
            <div className="rounded-lg bg-muted p-2 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-muted-foreground">
            <span>View scenarios</span>
            <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Simulations Summary */}
        <Link
          href="/app/intelligence/simulations"
          className="group rounded-lg border bg-card p-4 hover:border-primary/50 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Latest Simulation
              </p>
              <p className="text-lg font-bold text-green-600">
                {formatPercent(simulationsData[0].metrics.total_return, 1)}
              </p>
              <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                {simulationsData[0].name}
              </p>
            </div>
            <div className="rounded-lg bg-muted p-2 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <LineChart className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-muted-foreground">
            <span>View simulations</span>
            <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Key metrics section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Regime indicators */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4">Current Market Indicators</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Trend Score</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{
                      width: `${((regimeData.indicators.trend_score + 1) / 2) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {regimeData.indicators.trend_score > 0 ? '+' : ''}
                  {regimeData.indicators.trend_score.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Volatility Percentile
              </span>
              <span className="text-sm font-medium">
                {regimeData.indicators.volatility_percentile}th
              </span>
            </div>
            {regimeData.indicators.vix_level && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">VIX Level</span>
                <span className="text-sm font-medium">
                  {regimeData.indicators.vix_level.toFixed(1)}
                </span>
              </div>
            )}
            {regimeData.indicators.yield_curve_slope && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Yield Curve (10Y-2Y)
                </span>
                <span className="text-sm font-medium">
                  {regimeData.indicators.yield_curve_slope > 0 ? '+' : ''}
                  {regimeData.indicators.yield_curve_slope.toFixed(2)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Risk metrics */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4">Portfolio Risk Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Annual Volatility
              </span>
              <span className="text-sm font-medium">
                {formatPercent(riskData.risk_metrics.volatility_annual * 100, 1)}
              </span>
            </div>
            {riskData.risk_metrics.var_95_1day_pct && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  VaR (95%, 1-day)
                </span>
                <span className="text-sm font-medium text-red-600">
                  {formatPercent(-(riskData.risk_metrics.var_95_1day_pct * 100), 2)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Max Drawdown</span>
              <span className="text-sm font-medium text-red-600">
                {formatPercent(
                  -(riskData.risk_metrics.max_drawdown_historical * 100),
                  1
                )}
              </span>
            </div>
            {riskData.risk_metrics.sharpe_ratio && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Sharpe Ratio
                </span>
                <span className="text-sm font-medium">
                  {riskData.risk_metrics.sharpe_ratio.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Demo mode notice */}
      {isDemoMode && (
        <div className="rounded-lg border border-dashed border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-900/10 p-4">
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            <strong>Demo Mode:</strong> You are viewing simulated data for
            demonstration purposes. Sign up or log in to access your real portfolio
            analysis.
          </p>
        </div>
      )}
    </div>
  );
}

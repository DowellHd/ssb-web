'use client';

import { useIntelligence } from '@/contexts/intelligence-context';
import {
  RiskGauge,
  RiskLevelBadge,
  GatedFeature,
  ExplanationCard,
  CorrelationMatrix,
  RiskContributionChart,
} from '@/components/intelligence';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { demoRiskReport, demoRiskReportBasic } from '@/lib/demo-data';

export default function RiskAnalyticsPage() {
  const { isProOrHigher } = useIntelligence();

  // Select appropriate demo data based on tier
  const data = isProOrHigher ? demoRiskReport : demoRiskReportBasic;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold">Risk Analytics</h2>
        <p className="text-muted-foreground mt-1">
          Portfolio risk metrics and analysis
        </p>
      </div>

      {/* Risk level summary */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <RiskLevelBadge level={data.risk_level} />
              <span className="text-sm text-muted-foreground">
                Overall Risk Level
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xl">
              {data.explanation.summary}
            </p>
          </div>
          <div className="shrink-0">
            <RiskGauge level={data.risk_level} size="lg" />
          </div>
        </div>
      </div>

      {/* Core metrics grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Annual Volatility */}
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm font-medium text-muted-foreground">
            Annual Volatility
          </p>
          <p className="text-2xl font-bold mt-1">
            {formatPercent(data.risk_metrics.volatility_annual * 100, 1)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Annualized standard deviation
          </p>
        </div>

        {/* VaR 95% 1-day */}
        {data.risk_metrics.var_95_1day_pct !== undefined && (
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm font-medium text-muted-foreground">
              VaR (95%, 1-day)
            </p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {formatPercent(-(data.risk_metrics.var_95_1day_pct * 100), 2)}
            </p>
            {data.risk_metrics.var_95_1day !== undefined && (
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(-parseFloat(data.risk_metrics.var_95_1day))}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed border-t pt-2">
              On 95% of trading days, losses are expected to stay below this amount.
            </p>
          </div>
        )}

        {/* CVaR / Expected Shortfall */}
        {data.risk_metrics.cvar_95_1day_pct !== undefined && (
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm font-medium text-muted-foreground">
              CVaR (Expected Shortfall)
            </p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {formatPercent(-(data.risk_metrics.cvar_95_1day_pct * 100), 2)}
            </p>
            {data.risk_metrics.cvar_95_1day !== undefined && (
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(-parseFloat(data.risk_metrics.cvar_95_1day))}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed border-t pt-2">
              Average loss during the worst 5% of trading days historically.
            </p>
          </div>
        )}

        {/* Max Drawdown */}
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm font-medium text-muted-foreground">
            Max Drawdown (Historical)
          </p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {formatPercent(-(data.risk_metrics.max_drawdown_historical * 100), 1)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Peak-to-trough decline
          </p>
        </div>
      </div>

      {/* Risk-adjusted metrics (Pro only) */}
      <GatedFeature requiredTier="pro">
        <div className="grid gap-4 md:grid-cols-3">
          {/* Sharpe Ratio */}
          {data.risk_metrics.sharpe_ratio !== undefined && (
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm font-medium text-muted-foreground">
                Sharpe Ratio
              </p>
              <p
                className={`text-2xl font-bold mt-1 ${
                  data.risk_metrics.sharpe_ratio >= 1
                    ? 'text-green-600'
                    : data.risk_metrics.sharpe_ratio >= 0.5
                      ? 'text-yellow-600'
                      : 'text-red-600'
                }`}
              >
                {data.risk_metrics.sharpe_ratio.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {data.risk_metrics.sharpe_ratio >= 1
                  ? 'Good'
                  : data.risk_metrics.sharpe_ratio >= 0.5
                    ? 'Acceptable'
                    : 'Below Average'}
              </p>
            </div>
          )}

          {/* Sortino Ratio */}
          {data.risk_metrics.sortino_ratio !== undefined && (
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm font-medium text-muted-foreground">
                Sortino Ratio
              </p>
              <p
                className={`text-2xl font-bold mt-1 ${
                  data.risk_metrics.sortino_ratio >= 1.5
                    ? 'text-green-600'
                    : data.risk_metrics.sortino_ratio >= 1
                      ? 'text-yellow-600'
                      : 'text-red-600'
                }`}
              >
                {data.risk_metrics.sortino_ratio.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Downside risk-adjusted
              </p>
            </div>
          )}

          {/* Beta */}
          {data.risk_metrics.beta_to_benchmark !== undefined && (
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm font-medium text-muted-foreground">Beta</p>
              <p
                className={`text-2xl font-bold mt-1 ${
                  data.risk_metrics.beta_to_benchmark > 1.2
                    ? 'text-red-600'
                    : data.risk_metrics.beta_to_benchmark < 0.8
                      ? 'text-blue-600'
                      : 'text-foreground'
                }`}
              >
                {data.risk_metrics.beta_to_benchmark.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {data.risk_metrics.beta_to_benchmark > 1.2
                  ? 'High Market Sensitivity'
                  : data.risk_metrics.beta_to_benchmark < 0.8
                    ? 'Low Market Sensitivity'
                    : 'Market-like'}
              </p>
            </div>
          )}
        </div>
      </GatedFeature>

      {/* Advanced analytics (Pro only) */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Correlation Matrix */}
        <GatedFeature requiredTier="pro">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-4">Asset Correlation Matrix</h3>
            {data.correlation_matrix ? (
              <CorrelationMatrix matrix={data.correlation_matrix} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Correlation data not available
              </p>
            )}
          </div>
        </GatedFeature>

        {/* Risk Contribution */}
        <GatedFeature requiredTier="pro">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-4">Risk Contribution by Asset</h3>
            {data.risk_contribution ? (
              <RiskContributionChart contributions={data.risk_contribution} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Risk contribution data not available
              </p>
            )}
          </div>
        </GatedFeature>
      </div>

      {/* Top Risk Drivers - shows top 3 contributors */}
      {data.risk_contribution && data.risk_contribution.length > 0 && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4">Top Risk Drivers</h3>
          <p className="text-sm text-muted-foreground mb-4">
            These positions contribute the most to portfolio risk based on their weight and volatility.
          </p>
          <div className="space-y-4">
            {data.risk_contribution.slice(0, 3).map((item, index) => (
              <div key={item.symbol} className="flex items-center gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-sm font-bold text-red-700 dark:text-red-400">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.symbol}</span>
                    <span className="text-sm font-medium text-red-600">
                      {item.contribution_pct.toFixed(1)}% of risk
                    </span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-red-500 transition-all"
                      style={{ width: `${item.contribution_pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>{formatPercent(item.weight * 100, 1)} weight</span>
                    <span>Marginal VaR: {formatCurrency(parseFloat(item.marginal_var))}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key factors */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="font-semibold mb-4">Key Risk Factors</h3>
        <ul className="grid gap-3 md:grid-cols-2">
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

      {/* Explanation card */}
      <ExplanationCard
        explanation={data.explanation}
        defaultExpanded={false}
      />
    </div>
  );
}

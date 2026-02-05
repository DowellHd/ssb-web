/**
 * Demo data for risk analysis.
 * Matches API response shape from /api/v1/intelligence/v2/risk
 *
 * DEMO DATA - FOR DEMONSTRATION PURPOSES ONLY
 */

import type { Explanation } from './regime-analysis';
import { SUBSYSTEM_VERSIONS } from '@/lib/versioning';

export interface RiskMetrics {
  volatility_annual: number;
  var_95_1day?: string;
  var_95_1day_pct?: number;
  cvar_95_1day?: string;
  cvar_95_1day_pct?: number;
  max_drawdown_historical: number;
  beta_to_benchmark?: number;
  sharpe_ratio?: number;
  sortino_ratio?: number;
}

export interface RiskContribution {
  symbol: string;
  weight: number;
  marginal_var: string;
  contribution_pct: number;
}

export interface RiskReportResponse {
  portfolio_id: string | null;
  analysis_date: string;
  data_as_of: string;
  holdings_count: number;
  total_value: string;
  risk_metrics: RiskMetrics;
  risk_level: 'low' | 'moderate' | 'high' | 'extreme';
  correlation_matrix?: Record<string, Record<string, number>>;
  risk_contribution?: RiskContribution[];
  explanation: Explanation;
  analytics_level: 'basic' | 'advanced';
  tier: string;
}

export const demoRiskReport: RiskReportResponse = {
  portfolio_id: 'demo-portfolio-001',
  analysis_date: new Date().toISOString().split('T')[0],
  data_as_of: new Date().toISOString().split('T')[0],
  holdings_count: 6,
  total_value: '125000.00',
  risk_metrics: {
    volatility_annual: 0.185,
    var_95_1day: '2312.50',
    var_95_1day_pct: 0.0185,
    cvar_95_1day: '2937.50',
    cvar_95_1day_pct: 0.0235,
    max_drawdown_historical: 0.123,
    beta_to_benchmark: 1.12,
    sharpe_ratio: 1.24,
    sortino_ratio: 1.58,
  },
  risk_level: 'moderate',
  correlation_matrix: {
    AAPL: { AAPL: 1.0, MSFT: 0.72, GOOGL: 0.68, JPM: 0.45, XOM: 0.32, JNJ: 0.38 },
    MSFT: { AAPL: 0.72, MSFT: 1.0, GOOGL: 0.75, JPM: 0.42, XOM: 0.28, JNJ: 0.35 },
    GOOGL: { AAPL: 0.68, MSFT: 0.75, GOOGL: 1.0, JPM: 0.40, XOM: 0.25, JNJ: 0.32 },
    JPM: { AAPL: 0.45, MSFT: 0.42, GOOGL: 0.40, JPM: 1.0, XOM: 0.52, JNJ: 0.48 },
    XOM: { AAPL: 0.32, MSFT: 0.28, GOOGL: 0.25, JPM: 0.52, XOM: 1.0, JNJ: 0.45 },
    JNJ: { AAPL: 0.38, MSFT: 0.35, GOOGL: 0.32, JPM: 0.48, XOM: 0.45, JNJ: 1.0 },
  },
  risk_contribution: [
    { symbol: 'AAPL', weight: 0.25, marginal_var: '625.00', contribution_pct: 27.0 },
    { symbol: 'MSFT', weight: 0.20, marginal_var: '487.50', contribution_pct: 21.1 },
    { symbol: 'GOOGL', weight: 0.18, marginal_var: '450.00', contribution_pct: 19.5 },
    { symbol: 'JPM', weight: 0.15, marginal_var: '337.50', contribution_pct: 14.6 },
    { symbol: 'XOM', weight: 0.12, marginal_var: '250.00', contribution_pct: 10.8 },
    { symbol: 'JNJ', weight: 0.10, marginal_var: '162.50', contribution_pct: 7.0 },
  ],
  explanation: {
    summary:
      'Portfolio risk metrics are within typical ranges for diversified portfolios. Past risk levels may not persist.',
    key_factors: [
      'Annualized volatility: 18.5% (moderate risk)',
      '95% 1-day VaR: -1.85% ($2,312.50)',
      'Expected Shortfall (CVaR): -2.35%',
      'Historical max drawdown: -12.3%',
      'Sharpe ratio: 1.24 (good)',
      'Analysis based on 6 holdings',
    ],
    model_info: {
      model_type: 'parametric_var',
      version: SUBSYSTEM_VERSIONS.risk.version,
      training_period: null,
      assumptions: [
        'Historical returns are indicative of risk (not guaranteed)',
        '252 trading days per year for annualization',
        '5% annual risk-free rate assumption',
        'EWMA with lambda=0.94 for volatility',
      ],
    },
    limitations: [
      'VaR underestimates tail risk in extreme market conditions',
      'Correlations can spike during market stress (diversification may fail)',
      'Historical volatility may not reflect future risk levels',
      'This analysis is for informational purposes only',
    ],
  },
  analytics_level: 'advanced',
  tier: 'pro',
};

// Basic tier version (limited metrics)
export const demoRiskReportBasic: RiskReportResponse = {
  ...demoRiskReport,
  risk_metrics: {
    volatility_annual: 0.185,
    max_drawdown_historical: 0.123,
    var_95_1day: undefined,
    var_95_1day_pct: undefined,
    cvar_95_1day: undefined,
    cvar_95_1day_pct: undefined,
    sharpe_ratio: undefined,
    sortino_ratio: undefined,
    beta_to_benchmark: undefined,
  },
  correlation_matrix: undefined,
  risk_contribution: undefined,
  analytics_level: 'basic',
  tier: 'free',
};

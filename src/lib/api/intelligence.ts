/**
 * Intelligence API functions for regime, risk, and stress testing.
 */
import { apiClient } from '../api-client';

// ============================================================================
// Types
// ============================================================================

export interface RegimeIndicators {
  trend_score: number;
  volatility_percentile: number;
  breadth_score: number;
  macro_alignment: number;
  vix_level?: number;
  yield_curve_slope?: number;
}

export interface ModelMetadata {
  model_type: string;
  version: string;
  training_period?: string;
  assumptions: string[];
}

export interface Explanation {
  summary: string;
  key_factors: string[];
  model_info: ModelMetadata;
  limitations: string[];
}

export interface RegimeResult {
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

export interface RiskMetrics {
  volatility_annual: number;
  var_95_1day?: string;
  var_95_1day_pct?: number;
  cvar_95_1day?: string;
  cvar_95_1day_pct?: number;
  max_drawdown_historical?: number;
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

export interface RiskReport {
  portfolio_id: string;
  analysis_date: string;
  holdings_count: number;
  total_value: string;
  risk_metrics: RiskMetrics;
  risk_level: string;
  correlation_matrix?: Record<string, Record<string, number>>;
  risk_contribution?: RiskContribution[];
  explanation?: Explanation;
  analytics_level: string;
  tier: string;
}

export interface PortfolioHolding {
  symbol: string;
  weight: number;
  asset_class?: string;
}

export interface EntitlementsInfo {
  user_id: string;
  plan_name: string;
  plan_display_name: string;
  regime_insights_delay_days: number;
  risk_analytics_level: string;
  asset_classes: string[];
  simulation_limit: number;
  stress_test_enabled: boolean;
  stress_test_tier: string;
  api_access_level: string;
  daily_api_requests_limit: number;
  daily_api_requests_used: number;
  can_upgrade: boolean;
  upgrade_benefits: string[];
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get regime analysis for a symbol.
 */
export async function getRegimeAnalysis(params?: {
  symbol?: string;
  lookback_days?: number;
}): Promise<RegimeResult> {
  const response = await apiClient.get('/intelligence/v2/regime', { params });
  return response.data;
}

/**
 * Analyze portfolio risk.
 */
export async function analyzePortfolioRisk(holdings: PortfolioHolding[]): Promise<RiskReport> {
  const response = await apiClient.post('/intelligence/v2/risk', { holdings });
  return response.data;
}

/**
 * Get user's intelligence entitlements.
 */
export async function getIntelligenceEntitlements(): Promise<EntitlementsInfo> {
  const response = await apiClient.get('/intelligence/entitlements');
  return response.data;
}

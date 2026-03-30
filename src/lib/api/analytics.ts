/**
 * Phase 2 Analytics API client functions.
 * Portfolio optimization, technical analysis, factor analysis, Monte Carlo,
 * sector rotation, DCF valuation, and stock screening.
 */
import { apiClient } from '../api-client';

// ============================================================================
// Shared types
// ============================================================================

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

export interface PortfolioHolding {
  symbol: string;
  weight: number;
}

// ============================================================================
// Portfolio Optimization
// ============================================================================

export interface EfficientPortfolio {
  weights: Record<string, number>;
  expected_return: number;
  volatility: number;
  sharpe_ratio: number;
}

export interface OptimizationResponse {
  analysis_date: string;
  symbols: string[];
  efficient_frontier: EfficientPortfolio[];
  max_sharpe_portfolio: EfficientPortfolio;
  min_variance_portfolio: EfficientPortfolio;
  current_portfolio?: EfficientPortfolio;
  calmar_ratio?: number;
  explanation: Explanation;
  tier: string;
}

export async function optimizePortfolio(
  holdings: PortfolioHolding[],
  includeCurrentPortfolio = true
): Promise<OptimizationResponse> {
  const { data } = await apiClient.post('/analytics/optimize', {
    holdings,
    include_current_portfolio: includeCurrentPortfolio,
  });
  return data;
}

// ============================================================================
// Technical Analysis
// ============================================================================

export interface IndicatorValue {
  name: string;
  value: number | null;
  signal?: string;
}

export interface TechnicalAnalysisResponse {
  symbol: string;
  analysis_date: string;
  indicators: IndicatorValue[];
  trend_bias: string;
  signal_strength: number;
  explanation: Explanation;
  tier: string;
}

export async function getTechnicalAnalysis(
  symbol: string,
  lookbackDays = 200
): Promise<TechnicalAnalysisResponse> {
  const { data } = await apiClient.post('/analytics/technical', {
    symbol,
    lookback_days: lookbackDays,
  });
  return data;
}

// ============================================================================
// Factor Analysis
// ============================================================================

export interface FactorExposure {
  factor_name: string;
  exposure: number;
  t_statistic?: number;
  interpretation: string;
}

export interface AssetFactorProfile {
  symbol: string;
  factor_exposures: FactorExposure[];
  idiosyncratic_risk_pct: number;
  r_squared: number;
}

export interface FactorAnalysisResponse {
  analysis_date: string;
  portfolio_factor_exposures: FactorExposure[];
  asset_profiles: AssetFactorProfile[];
  portfolio_r_squared: number;
  dominant_factors: string[];
  explanation: Explanation;
  tier: string;
}

export async function getFactorAnalysis(
  holdings: PortfolioHolding[]
): Promise<FactorAnalysisResponse> {
  const { data } = await apiClient.post('/analytics/factors', { holdings });
  return data;
}

// ============================================================================
// Benchmark Comparison
// ============================================================================

export interface BenchmarkMetrics {
  portfolio_annual_return: number;
  benchmark_annual_return: number;
  active_return: number;
  alpha: number;
  beta: number;
  r_squared: number;
  tracking_error: number;
  information_ratio?: number;
  calmar_ratio?: number;
  max_drawdown: number;
  upside_capture?: number;
  downside_capture?: number;
  omega_ratio?: number;
}

export interface BenchmarkComparisonResponse {
  portfolio_id?: string;
  benchmark_symbol: string;
  analysis_date: string;
  period_days: number;
  metrics: BenchmarkMetrics;
  explanation: Explanation;
  tier: string;
}

export async function getBenchmarkComparison(
  holdings: PortfolioHolding[],
  benchmarkSymbol = 'SPY',
  lookbackDays = 252
): Promise<BenchmarkComparisonResponse> {
  const { data } = await apiClient.post('/analytics/benchmark', {
    holdings,
    benchmark_symbol: benchmarkSymbol,
    lookback_days: lookbackDays,
  });
  return data;
}

// ============================================================================
// Monte Carlo
// ============================================================================

export interface SimulationPath {
  percentile: number;
  values: number[];
  final_value: number;
  total_return: number;
}

export interface MonteCarloResponse {
  analysis_date: string;
  horizon_days: number;
  n_simulations: number;
  initial_value: number;
  checkpoints: number[];
  paths: SimulationPath[];
  prob_of_loss: number;
  prob_of_target?: number;
  expected_final_value: number;
  expected_return: number;
  explanation: Explanation;
  tier: string;
}

export async function runMonteCarlo(
  holdings: PortfolioHolding[],
  options: {
    initialValue?: number;
    horizonDays?: number;
    nSimulations?: number;
    targetReturn?: number;
  } = {}
): Promise<MonteCarloResponse> {
  const { data } = await apiClient.post('/analytics/simulate', {
    holdings,
    initial_value: options.initialValue ?? 100000,
    horizon_days: options.horizonDays ?? 252,
    n_simulations: options.nSimulations ?? 1000,
    target_return: options.targetReturn,
  });
  return data;
}

// ============================================================================
// Sector Rotation
// ============================================================================

export interface SectorMomentum {
  symbol: string;
  sector_name: string;
  relative_strength_1m: number;
  relative_strength_3m: number;
  relative_strength_6m: number;
  momentum_score: number;
  momentum_trend: string;
  rrg_quadrant: string;
  rrg_quadrant_description: string;
  cycle_position: string;
  cycle_description: string;
}

export interface SectorRotationResponse {
  analysis_date: string;
  sectors_analyzed: number;
  leading_sectors: string[];
  lagging_sectors: string[];
  improving_sectors: string[];
  sector_rankings: SectorMomentum[];
  market_cycle_phase: string;
  explanation: Explanation;
  tier: string;
}

export async function getSectorRotation(
  sectorSymbols?: string[]
): Promise<SectorRotationResponse> {
  const { data } = await apiClient.post('/analytics/sector-rotation', {
    sector_symbols: sectorSymbols,
    include_benchmark: true,
  });
  return data;
}

// ============================================================================
// DCF Valuation
// ============================================================================

export interface DCFStage {
  year: number;
  growth_rate: number;
  free_cash_flow: number;
  present_value: number;
}

export interface DCFResponse {
  symbol?: string;
  valuation_date: string;
  stage1_flows: DCFStage[];
  stage2_flows: DCFStage[];
  terminal_value: number;
  terminal_value_pv: number;
  enterprise_value: number;
  equity_value: number;
  intrinsic_value_per_share: number;
  current_price: number;
  margin_of_safety: number;
  upside_downside_pct: number;
  sensitivity: Record<string, number>;
}

export interface DCFRequest {
  symbol?: string;
  current_price: number;
  base_fcf: number;
  shares_outstanding: number;
  growth_rate_stage1?: number;
  stage1_years?: number;
  growth_rate_stage2?: number;
  stage2_years?: number;
  discount_rate?: number;
  terminal_growth_rate?: number;
  net_debt?: number;
}

export async function calculateDCF(request: DCFRequest): Promise<DCFResponse> {
  const { data } = await apiClient.post('/analytics/dcf', request);
  return data;
}

// ============================================================================
// Fundamental Data
// ============================================================================

export interface CompanyOverview {
  symbol: string;
  name?: string;
  sector?: string;
  industry?: string;
  pe_ratio?: number;
  forward_pe?: number;
  pb_ratio?: number;
  ps_ratio?: number;
  ev_ebitda?: number;
  eps?: number;
  dividend_yield?: number;
  roe?: number;
  roa?: number;
  net_margin?: number;
  operating_margin?: number;
  revenue_growth_yoy?: number;
  earnings_growth_yoy?: number;
  market_cap?: number;
  debt_to_equity?: number;
  beta?: number;
  analyst_target_price?: number;
  week_52_high?: number;
  week_52_low?: number;
}

export interface FundamentalDataResponse {
  data: Record<string, CompanyOverview>;
  fetched_count: number;
  failed_symbols: string[];
}

export async function getFundamentals(symbols: string[]): Promise<FundamentalDataResponse> {
  const { data } = await apiClient.post('/analytics/fundamentals', { symbols });
  return data;
}

// ============================================================================
// Earnings Calendar
// ============================================================================

export interface EarningsEvent {
  symbol?: string;
  name?: string;
  reportDate?: string;
  fiscalDateEnding?: string;
  estimate?: string;
  currency?: string;
}

export interface EarningsCalendarResponse {
  events: EarningsEvent[];
  total_count: number;
  horizon: string;
}

export async function getEarningsCalendar(
  horizon: '3month' | '6month' | '12month' = '3month'
): Promise<EarningsCalendarResponse> {
  const { data } = await apiClient.get(`/analytics/earnings-calendar?horizon=${horizon}`);
  return data;
}

// ============================================================================
// Stock Screening
// ============================================================================

export interface ScreenerCriterion {
  field: string;
  operator: 'lt' | 'gt' | 'lte' | 'gte' | 'eq' | 'between';
  value?: number;
  min_value?: number;
  max_value?: number;
}

export interface ScreenerResult {
  symbol: string;
  name?: string;
  sector?: string;
  matching_criteria_count: number;
  total_criteria_count: number;
  fundamental_data: Record<string, unknown>;
}

export interface ScreeningResponse {
  screened_at: string;
  universe_size: number;
  matched_count: number;
  results: ScreenerResult[];
  criteria_applied: ScreenerCriterion[];
  data_source: 'live' | 'sample';
}

export async function screenStocks(
  criteria: ScreenerCriterion[],
  options: {
    universe?: string[];
    sortBy?: string;
    sortDescending?: boolean;
    maxResults?: number;
  } = {}
): Promise<ScreeningResponse> {
  const { data } = await apiClient.post('/screening/screen', {
    criteria,
    universe: options.universe ?? [],
    sort_by: options.sortBy ?? 'market_cap',
    sort_descending: options.sortDescending ?? true,
    max_results: options.maxResults ?? 50,
  });
  return data;
}

export async function getScreeningFields(): Promise<Record<string, string>> {
  const { data } = await apiClient.get('/screening/fields');
  return data.fields;
}

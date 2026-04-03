/**
 * Phase 7 Predictive Analytics API client.
 * GARCH volatility, anomaly detection, sentiment analysis, ESG scoring,
 * and earnings surprise probability.
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

// ============================================================================
// GARCH Volatility
// ============================================================================

export interface GarchParameters {
  omega: number;
  alpha: number;
  beta: number;
  persistence: number;
  long_run_annualized_vol: number;
}

export interface VolatilityForecast {
  horizon_days: number;
  current_annualized_vol_pct: number;
  long_run_annualized_vol_pct: number;
  annualized_vol_forecast_pct: number[];
  var_95_pct: number;
  var_99_pct: number;
  vol_regime: 'low' | 'normal' | 'elevated' | 'extreme';
  forecast_dates: string[];
}

export interface GarchResponse {
  analysis_date: string;
  symbol: string;
  parameters: GarchParameters;
  forecast: VolatilityForecast;
  model_metadata: ModelMetadata;
  explanation: Explanation;
  converged: boolean;
  sample_size: number;
}

export async function forecastVolatility(
  symbol: string,
  returns: number[],
  forecastHorizon = 10
): Promise<GarchResponse> {
  const { data } = await apiClient.post('/predictive/volatility', {
    symbol,
    returns,
    forecast_horizon: forecastHorizon,
  });
  return data;
}

// ============================================================================
// Anomaly Detection
// ============================================================================

export interface AnomalyEvent {
  type: string;
  severity: 'mild' | 'moderate' | 'severe' | 'extreme';
  z_score: number | null;
  description: string;
  period_index: number;
  value: number;
  expected_value: number;
}

export interface AnomalyReportResponse {
  analysis_date: string;
  symbol: string;
  anomaly_count: number;
  severity_summary: Record<string, number>;
  anomaly_rate_pct: number;
  overall_risk_flag: 'normal' | 'watch' | 'alert' | 'critical';
  anomalies: AnomalyEvent[];
  rolling_z_scores: number[];
  model_metadata: ModelMetadata;
  explanation: Explanation;
}

export async function detectAnomalies(
  symbol: string,
  returns: number[],
  volumes?: number[]
): Promise<AnomalyReportResponse> {
  const { data } = await apiClient.post('/predictive/anomalies', {
    symbol,
    returns,
    volumes,
  });
  return data;
}

// ============================================================================
// Sentiment Analysis
// ============================================================================

export interface SentimentResponse {
  analysis_date: string;
  subject: string;
  aggregate_score: number;
  aggregate_label: 'bullish' | 'bearish' | 'neutral' | 'mixed';
  confidence: number;
  dominant_themes: string[];
  top_risks: string[];
  top_catalysts: string[];
  source_count: number;
  ai_available: boolean;
  model_metadata: ModelMetadata;
  explanation: Explanation;
}

export async function analyzeSentimentText(
  text: string,
  subject = 'market'
): Promise<SentimentResponse> {
  const { data } = await apiClient.post('/predictive/sentiment/text', {
    text,
    subject,
  });
  return data;
}

export async function analyzeSentimentHeadlines(
  headlines: string[],
  subject = 'market'
): Promise<SentimentResponse> {
  const { data } = await apiClient.post('/predictive/sentiment/headlines', {
    headlines,
    subject,
  });
  return data;
}

// ============================================================================
// ESG Scoring
// ============================================================================

export interface ESGScores {
  environmental: number;
  social: number;
  governance: number;
  composite: number;
  rating: string;
  percentile: number;
}

export interface ESGControversy {
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ESGReportResponse {
  analysis_date: string;
  symbol: string;
  sector: string;
  scores: ESGScores;
  controversies: ESGControversy[];
  strengths: string[];
  improvement_areas: string[];
  provider: string;
  is_simulated: boolean;
  model_metadata: ModelMetadata;
  explanation: Explanation;
}

export interface ESGPortfolioResponse {
  analysis_date: string;
  portfolio_scores: ESGScores & { rating: string };
  holdings: ESGReportResponse[];
  is_simulated: boolean;
}

export async function getESGScore(
  symbol: string,
  sector = 'default'
): Promise<ESGReportResponse> {
  const { data } = await apiClient.post('/predictive/esg', { symbol, sector });
  return data;
}

export async function getPortfolioESG(
  holdings: Array<{ symbol: string; sector?: string; weight?: number }>
): Promise<ESGPortfolioResponse> {
  const { data } = await apiClient.post('/predictive/esg/portfolio', {
    holdings: holdings.map((h) => ({
      symbol: h.symbol,
      sector: h.sector ?? 'default',
      weight: h.weight ?? 1 / holdings.length,
    })),
  });
  return data;
}

// ============================================================================
// Earnings Surprise
// ============================================================================

export interface EarningsSurpriseResponse {
  symbol: string;
  beat_probability: number;
  miss_probability: number;
  in_line_probability: number;
  implied_move_pct: number;
  pre_earnings_momentum: 'positive' | 'negative' | 'neutral';
  vol_regime: string;
  historical_beat_rate: number | null;
  analysis_notes: string[];
  model_metadata: ModelMetadata;
  disclaimer: string;
}

export async function estimateEarningsSurprise(
  symbol: string,
  recentReturns: number[],
  analystEstimate?: number,
  priorSurprises?: number[]
): Promise<EarningsSurpriseResponse> {
  const { data } = await apiClient.post('/predictive/earnings-surprise', {
    symbol,
    recent_returns: recentReturns,
    analyst_estimate: analystEstimate,
    prior_surprises: priorSurprises,
  });
  return data;
}

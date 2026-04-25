/**
 * Strategy Insights API — Phase 9C
 */
import { apiClient } from '../api-client';

export interface StrategyAgreementStatus {
  has_agreed: boolean;
  agreed_at: string | null;
  agreement_version: string | null;
}

export interface StrategyAnalysis {
  id: string;
  requested_at: string;
  risk_level: 'low' | 'moderate' | 'high';
  confidence_score: number;
  diversification_score: number;
  key_themes: string[];
  analysis_text: string;
  model_used: string;
  tokens_used: number | null;
  is_cached: boolean;
  has_portfolio_data: boolean;
}

export interface StrategyHistoryItem {
  id: string;
  requested_at: string;
  risk_level: 'low' | 'moderate' | 'high';
  confidence_score: number;
  diversification_score: number;
  key_themes: string[];
  analysis_text: string;
  model_used: string;
  is_cached: boolean;
  portfolio_snapshot: {
    holdings_count: number;
    total_value: number;
    top_holdings: { symbol: string; value: number }[];
  } | null;
}

export interface StrategyHistoryResponse {
  items: StrategyHistoryItem[];
  total: number;
  page: number;
  per_page: number;
}

export async function getAgreementStatus(): Promise<StrategyAgreementStatus> {
  const res = await apiClient.get('/strategy/agreement/status');
  return res.data;
}

export async function acceptAgreement(version = '1.0'): Promise<StrategyAgreementStatus> {
  const res = await apiClient.post('/strategy/agreement', { agreement_version: version });
  return res.data;
}

export async function runAnalysis(force = false): Promise<StrategyAnalysis> {
  const res = await apiClient.post('/strategy/analyze', { force });
  return res.data;
}

export async function getStrategyHistory(
  page = 1,
  perPage = 10,
): Promise<StrategyHistoryResponse> {
  const res = await apiClient.get('/strategy/history', {
    params: { page, per_page: perPage },
  });
  return res.data;
}

export async function getAnalysisById(id: string): Promise<StrategyHistoryItem> {
  const res = await apiClient.get(`/strategy/history/${id}`);
  return res.data;
}

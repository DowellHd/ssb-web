/**
 * Signals API — Assisted Trading endpoints (Phase 9)
 */
import { apiClient } from '../api-client';

export interface SignalFeedItem {
  id: string;
  ticker: string;
  signal_type: string;
  confidence_score: number;
  trend_bias: string;
  time_horizon: string;
  asset_class: string;
  plain_english_summary: string;
  generated_at: string;
  expires_at: string;
}

export interface SignalDetail extends SignalFeedItem {
  signal_strength: number;
  supporting_data: Record<string, unknown>;
  entry_zone_low: number | null;
  entry_zone_high: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  risk_reward_ratio: number | null;
  historical_accuracy: number | null;
}

export interface SignalFeedResponse {
  items: SignalFeedItem[];
  total: number;
  page: number;
  per_page: number;
}

export interface TradePerformanceResponse {
  total_logged: number;
  open_trades: number;
  closed_trades: number;
  win_rate: number | null;
  avg_return_pct: number | null;
  avg_risk_reward: number | null;
  best_trade_pct: number | null;
  worst_trade_pct: number | null;
}

export interface TradingPreferences {
  user_id: string;
  preferred_broker: string | null;
  risk_tolerance: string;
  max_position_pct: number;
  min_confidence_threshold: number;
  alert_email: boolean;
  alert_push: boolean;
  updated_at: string | null;
}

export interface DisclaimerStatus {
  has_accepted: boolean;
  accepted_at: string | null;
  disclaimer_version: string | null;
}

export interface LogTradeRequest {
  entry_price: number;
  position_size_usd?: number;
  notes?: string;
}

export interface LogTradeResponse {
  id: string;
  ticker: string;
  entry_price: number;
  logged_at: string;
  status: string;
}

export interface SignalFilters {
  page?: number;
  per_page?: number;
  signal_type?: string;
  min_confidence?: number;
  asset_class?: string;
  time_horizon?: string;
  ticker?: string;
}

export async function getSignalFeed(filters: SignalFilters = {}): Promise<SignalFeedResponse> {
  const params: Record<string, string | number> = {};
  if (filters.page) params.page = filters.page;
  if (filters.per_page) params.per_page = filters.per_page;
  if (filters.signal_type) params.signal_type = filters.signal_type;
  if (filters.min_confidence !== undefined) params.min_confidence = filters.min_confidence;
  if (filters.asset_class) params.asset_class = filters.asset_class;
  if (filters.time_horizon) params.time_horizon = filters.time_horizon;
  if (filters.ticker) params.ticker = filters.ticker.trim().toUpperCase();
  const res = await apiClient.get('/signals', { params });
  return res.data;
}

export async function getSignalDetail(id: string): Promise<SignalDetail> {
  const res = await apiClient.get(`/signals/${id}`);
  return res.data;
}

export async function logTrade(signalId: string, body: LogTradeRequest): Promise<LogTradeResponse> {
  const res = await apiClient.post(`/signals/${signalId}/log`, body);
  return res.data;
}

export async function getSignalPerformance(): Promise<TradePerformanceResponse> {
  const res = await apiClient.get('/signals/performance');
  return res.data;
}

export async function getTradingPreferences(): Promise<TradingPreferences> {
  const res = await apiClient.get('/user/trading-preferences');
  return res.data;
}

export async function updateTradingPreferences(
  prefs: Partial<Omit<TradingPreferences, 'user_id' | 'updated_at'>>
): Promise<TradingPreferences> {
  const res = await apiClient.put('/user/trading-preferences', prefs);
  return res.data;
}

export async function getDisclaimerStatus(): Promise<DisclaimerStatus> {
  const res = await apiClient.get('/user/disclaimer-status');
  return res.data;
}

export async function acceptDisclaimer(version = '1.0'): Promise<DisclaimerStatus> {
  const res = await apiClient.post('/user/disclaimer-acceptance', {
    disclaimer_version: version,
  });
  return res.data;
}

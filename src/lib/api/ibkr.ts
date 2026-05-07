import { apiClient } from '../api-client';

// ============================================================================
// Core Types
// ============================================================================

export type IntentStatus = 'draft' | 'approved' | 'queued' | 'executed' | 'failed' | 'rejected';
export type PricingPolicy = 'mid' | 'mark' | 'manual' | 'market';
export type TimeInForce = 'DAY' | 'GTC' | 'IOC';
export type ExecutionMode = 'paper' | 'live';
export type TimeHorizon = 'short' | 'medium' | 'long';
export type RiskTolerance = 'conservative' | 'moderate' | 'aggressive';
export type SignalAlignment = 'aligned' | 'neutral' | 'against';
export type VixLevel = 'low' | 'normal' | 'elevated' | 'high' | 'extreme' | 'unknown';

export interface IntentLeg {
  right: 'call' | 'put';
  strike: string;
  side: 'buy' | 'sell';
  qty: number;
}

export interface IBKRPolicy {
  ibkr_enabled: boolean;
  kill_switch_active: boolean;
  execution_mode: ExecutionMode;
  live_trading_enabled: boolean;
  paper_only: boolean;
  require_manual_approval: boolean;
  allowed_strategies: string[];
  allowed_symbols: string[];
  max_contracts_per_trade: number;
  max_trades_per_day: number;
  max_risk_per_day_usd: string;
  paper_trade_count: number;
  shadow_live_complete: boolean;
  trading_hours_start: string;
  trading_hours_end: string;
}

export interface TradeIntent {
  id: string;
  user_id: string;
  broker: string;
  mode: ExecutionMode;
  strategy_type: string;
  symbol: string;
  expiry: string | null;
  legs: IntentLeg[];
  pricing_policy: PricingPolicy;
  max_debit_usd: string;
  max_loss_usd: string;
  time_in_force: TimeInForce;
  regime_snapshot_hash: string | null;
  risk_snapshot_hash: string | null;
  status: IntentStatus;
  signature: string | null;
  signature_expires_at: string | null;
  rejection_reason: string | null;
  claimed_at: string | null;
  claimed_by: string | null;
  executor_execution_id: string | null;
  broker_order_ids: Record<string, unknown> | null;
  execution_metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface CreateIntentRequest {
  symbol: string;
  strategy_type: string;
  expiry?: string | null;
  legs: IntentLeg[];
  pricing_policy?: PricingPolicy;
  max_debit_usd: number;
  max_loss_usd: number;
  time_in_force?: TimeInForce;
  mode?: ExecutionMode;
  regime_snapshot_hash?: string | null;
  risk_snapshot_hash?: string | null;
}

export interface AuditEntry {
  id: string;
  intent_id: string | null;
  user_id: string;
  action: string;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

// ============================================================================
// Founder Intelligence Types
// ============================================================================

export interface AIRecommendation {
  ticker: string;
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  entry_zone_low: number | null;
  entry_zone_high: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  position_size_pct: number;
  risk_reward_ratio: number | null;
  reasoning: string;
  key_risks: string[];
  signal_type: string | null;
  signal_strength: number | null;
  trend_bias: string | null;
  regime_context: string;
  generated_at: string;
  from_cache: boolean;
}

export interface PortfolioHolding {
  ticker: string;
  quantity: number;
  avg_cost: number;
  current_price: number | null;
  market_value: number;
  weight_pct: number;
  unrealized_pnl: number;
  unrealized_pnl_pct: number;
  daily_change_pct: number | null;
  signal_bias: string | null;
}

export interface PortfolioSnapshot {
  total_value: number;
  cash: number;
  invested_value: number;
  daily_pnl: number;
  daily_pnl_pct: number;
  total_pnl: number;
  total_pnl_pct: number;
  var_95: number | null;
  sharpe_ratio: number | null;
  beta: number | null;
  holdings: PortfolioHolding[];
  concentration_warning: boolean;
  top_holding_ticker: string | null;
  top_holding_pct: number | null;
  risk_alerts: string[];
  regime_context: string;
  last_updated: string;
  from_cache: boolean;
}

export interface MarketSignal {
  ticker: string;
  signal_type: string;
  trend_bias: string;
  confidence: number;
  signal_strength: number;
  entry_zone_low: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  plain_english: string | null;
}

export interface MarketPulse {
  regime_label: string;
  regime_confidence: number;
  regime_description: string;
  regime_strategy_hint: string;
  vix_value: number | null;
  vix_level: VixLevel;
  vix_interpretation: string;
  top_signals: MarketSignal[];
  total_active_signals: number;
  signal_bias: string;
  last_updated: string;
  from_cache: boolean;
}

export interface TradeAnalysis {
  ticker: string;
  action: string;
  quantity: number;
  estimated_value: number | null;
  position_size_pct: number | null;
  concentration_warning: boolean;
  signal_alignment: SignalAlignment;
  regime_alignment: SignalAlignment;
  current_signal_type: string | null;
  current_signal_confidence: number | null;
  current_trend_bias: string | null;
  risk_score: number;
  risk_label: string;
  proceed: boolean;
  warnings: string[];
  recommendation: string;
}

// ============================================================================
// Core IBKR API Functions
// ============================================================================

export async function getIBKRPolicy(): Promise<IBKRPolicy> {
  const res = await apiClient.get<IBKRPolicy>('/integrations/ibkr/policy');
  return res.data;
}

export async function getMyIntents(statusFilter?: string): Promise<TradeIntent[]> {
  const res = await apiClient.get<TradeIntent[]>('/integrations/ibkr/intents', {
    params: statusFilter ? { status_filter: statusFilter } : undefined,
  });
  return res.data;
}

export async function createIntent(data: CreateIntentRequest): Promise<TradeIntent> {
  const res = await apiClient.post<TradeIntent>('/integrations/ibkr/intents', data);
  return res.data;
}

export async function approveIntent(id: string): Promise<TradeIntent> {
  const res = await apiClient.post<TradeIntent>(`/integrations/ibkr/intents/${id}/approve`, {});
  return res.data;
}

export async function getAuditLog(limit = 50): Promise<AuditEntry[]> {
  const res = await apiClient.get<AuditEntry[]>('/integrations/ibkr/audit', { params: { limit } });
  return res.data;
}

// ============================================================================
// Founder Intelligence API Functions
// ============================================================================

export async function getMarketPulse(): Promise<MarketPulse> {
  const res = await apiClient.get<MarketPulse>('/integrations/ibkr/founder/market-pulse');
  return res.data;
}

export async function getPortfolioSnapshot(): Promise<PortfolioSnapshot> {
  const res = await apiClient.get<PortfolioSnapshot>('/integrations/ibkr/founder/portfolio-snapshot');
  return res.data;
}

export async function getAIRecommendation(
  ticker: string,
  timeHorizon: TimeHorizon = 'medium',
  riskTolerance: RiskTolerance = 'moderate',
): Promise<AIRecommendation> {
  const res = await apiClient.post<AIRecommendation>('/integrations/ibkr/founder/ai-recommend', {
    ticker,
    time_horizon: timeHorizon,
    risk_tolerance: riskTolerance,
  });
  return res.data;
}

export async function analyzeTradeIntent(
  ticker: string,
  action: 'BUY' | 'SELL',
  quantity: number,
  limitPrice?: number,
): Promise<TradeAnalysis> {
  const res = await apiClient.post<TradeAnalysis>('/integrations/ibkr/founder/analyze-trade', {
    ticker,
    action,
    quantity,
    limit_price: limitPrice ?? null,
  });
  return res.data;
}

import { apiClient } from '../api-client';

// ============================================================================
// Types
// ============================================================================

export type IntentStatus = 'draft' | 'approved' | 'queued' | 'executed' | 'failed' | 'rejected';
export type PricingPolicy = 'mid' | 'mark' | 'manual';
export type TimeInForce = 'DAY' | 'GTC' | 'IOC';
export type ExecutionMode = 'paper' | 'live';

export interface IntentLeg {
  right: 'call' | 'put';
  strike: string;
  side: 'buy' | 'sell';
  qty: number;
}

export interface IBKRPolicy {
  // Runtime settings
  ibkr_enabled: boolean;
  kill_switch_active: boolean;
  execution_mode: ExecutionMode;
  live_trading_enabled: boolean;
  // Per-user policy
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
// API functions
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

import { apiClient } from '../api-client';

// ============================================================================
// Types
// ============================================================================

export type IntentStatus = 'draft' | 'approved' | 'queued' | 'executed' | 'rejected' | 'expired';
export type OrderType = 'market' | 'limit';
export type IntentSide = 'buy' | 'sell';
export type ExecutionMode = 'paper' | 'live' | 'simulation';

export interface IBKRPolicy {
  ibkr_enabled: boolean;
  kill_switch_active: boolean;
  execution_mode: ExecutionMode;
  live_trading_enabled: boolean;
  allowed_symbols: string[];
  max_contracts: number;
  max_daily_trades: number;
  max_daily_risk_usd: number;
  paper_only: boolean;
}

export interface TradeIntent {
  id: string;
  user_id: string;
  symbol: string;
  side: IntentSide;
  quantity: number;
  order_type: OrderType;
  limit_price: number | null;
  max_loss_usd: number | null;
  notes: string | null;
  status: IntentStatus;
  signature: string | null;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  executed_at: string | null;
  rejection_reason: string | null;
}

export interface CreateIntentRequest {
  symbol: string;
  side: IntentSide;
  quantity: number;
  order_type: OrderType;
  limit_price?: number | null;
  max_loss_usd?: number | null;
  notes?: string | null;
}

export interface ApproveIntentRequest {
  mfa_code: string;
}

export interface AuditEntry {
  id: string;
  intent_id: string | null;
  event_type: string;
  details: Record<string, unknown>;
  created_at: string;
}

export interface AuditLogResponse {
  items: AuditEntry[];
  total: number;
}

// ============================================================================
// API functions
// ============================================================================

export async function getIBKRPolicy(): Promise<IBKRPolicy> {
  const res = await apiClient.get<IBKRPolicy>('/ibkr/policy');
  return res.data;
}

export async function getPendingIntents(): Promise<TradeIntent[]> {
  const res = await apiClient.get<TradeIntent[]>('/ibkr/intents/pending');
  return res.data;
}

export async function createIntent(data: CreateIntentRequest): Promise<TradeIntent> {
  const res = await apiClient.post<TradeIntent>('/ibkr/intents', data);
  return res.data;
}

export async function approveIntent(id: string, mfa_code: string): Promise<TradeIntent> {
  const res = await apiClient.post<TradeIntent>(`/ibkr/intents/${id}/approve`, { mfa_code });
  return res.data;
}

export async function getAuditLog(limit = 50): Promise<AuditLogResponse> {
  const res = await apiClient.get<AuditLogResponse>('/ibkr/audit', { params: { limit } });
  return res.data;
}

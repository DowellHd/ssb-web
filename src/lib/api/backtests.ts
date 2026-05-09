/**
 * Backtests API functions.
 */
import { apiClient } from '../api-client';

// ============================================================================
// Types
// ============================================================================

export interface BacktestSummary {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  symbols: string[];
  start_date: string;
  end_date: string;
  total_return_pct?: number;
  max_drawdown?: number;
  total_trades?: number;
  strategy_type?: string;
  created_at: string;
}

export interface BacktestListResponse {
  backtests: BacktestSummary[];
  total: number;
}

export interface BacktestEntitlements {
  monthly_limit: number;
  monthly_used: number;
  monthly_remaining: number;
  max_date_range_days: number;
  allowed_asset_classes: string[];
  can_use_limit_orders: boolean;
  can_export: boolean;
  upgrade_benefits?: string[];
}

export interface BacktestDetails {
  id: string;
  name: string;
  description?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  symbols: string[];
  start_date: string;
  end_date: string;
  initial_capital: number;
  strategy_type: string;
  strategy_params: Record<string, any>;
  fill_price: string;
  slippage_bps: number;
  commission_bps: number;
  total_return_pct?: number;
  max_drawdown?: number;
  sharpe_ratio?: number;
  total_trades?: number;
  winning_trades?: number;
  losing_trades?: number;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export interface CreateBacktestRequest {
  name: string;
  description?: string;
  symbols: string[];
  start_date: string;
  end_date: string;
  initial_capital: number;
  strategy_type: string;
  strategy_params?: Record<string, any>;
  fill_price?: 'open' | 'close';
  slippage_bps?: number;
  commission_bps?: number;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * List user's backtests.
 */
export async function listBacktests(params?: {
  limit?: number;
  offset?: number;
}): Promise<BacktestListResponse> {
  const response = await apiClient.get('/backtests', { params });
  return response.data;
}

/**
 * Get backtest details by ID.
 */
export async function getBacktest(backtestId: string): Promise<BacktestDetails> {
  const response = await apiClient.get(`/backtests/${backtestId}`);
  return response.data;
}

/**
 * Get backtest entitlements for the current user.
 */
export async function getBacktestEntitlements(): Promise<BacktestEntitlements> {
  const response = await apiClient.get('/backtests/entitlements');
  return response.data;
}

/**
 * Create a new backtest.
 */
export async function createBacktest(data: CreateBacktestRequest): Promise<BacktestDetails> {
  const response = await apiClient.post('/backtests', data);
  return response.data;
}

/**
 * Run a pending backtest.
 */
export async function runBacktest(backtestId: string): Promise<BacktestDetails> {
  const response = await apiClient.post(`/backtests/${backtestId}/run`);
  return response.data;
}

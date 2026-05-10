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
  final_equity?: number;
  total_return?: number;
  total_return_pct?: number;
  max_drawdown?: number;
  sharpe_ratio?: number;
  sortino_ratio?: number;
  volatility?: number;
  total_trades?: number;
  winning_trades?: number;
  losing_trades?: number;
  bars_processed?: number;
  execution_time_ms?: number;
  error_message?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface BacktestTrade {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  order_type: 'market' | 'limit';
  quantity: number;
  fill_price: number;
  fill_value: number;
  realized_pnl: number;
  slippage_cost: number;
  commission_cost: number;
  position_before: number;
  position_after: number;
  bar_date: string;
  bar_open: number;
  bar_close: number;
  executed_at: string;
}

export interface BacktestTradeListResponse {
  trades: BacktestTrade[];
  total: number;
}

export interface EquityCurvePoint {
  date: string;
  equity: number;
  cash: number;
  positions_value: number;
  daily_return: number;
  cumulative_return: number;
  peak_equity: number;
  drawdown: number;
  position_count: number;
}

export interface EquityCurveResponse {
  backtest_id: string;
  curve: EquityCurvePoint[];
  start_date: string;
  end_date: string;
  data_points: number;
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

/**
 * Get trades for a completed backtest.
 */
export async function getBacktestTrades(backtestId: string): Promise<BacktestTradeListResponse> {
  const response = await apiClient.get(`/backtests/${backtestId}/trades`);
  return response.data;
}

/**
 * Get equity curve for a completed backtest.
 */
export async function getEquityCurve(backtestId: string): Promise<EquityCurveResponse> {
  const response = await apiClient.get(`/backtests/${backtestId}/equity-curve`);
  return response.data;
}

/**
 * Delete a backtest and all its associated data.
 */
export async function deleteBacktest(backtestId: string): Promise<void> {
  await apiClient.delete(`/backtests/${backtestId}`);
}

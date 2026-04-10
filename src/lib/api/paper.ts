/**
 * Paper trading API functions.
 */
import { apiClient } from '../api-client';

// ============================================================================
// Types
// ============================================================================

export interface CreateAccountRequest {
  name?: string;
  starting_balance?: number;
}

export interface PlaceOrderRequest {
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  order_type: 'market' | 'limit';
  limit_price?: number;
}

export interface Account {
  id: string;
  name: string;
  starting_balance: number;
  current_cash: number;
  positions_value: number;
  equity: number;
  total_value: number;
  total_return: number;
  total_return_pct: number;
  positions_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Position {
  id: string;
  symbol: string;
  quantity: number;
  avg_cost: number;
  current_price: number | null;
  market_value: number;
  cost_basis: number;
  unrealized_pl: number;
  unrealized_pl_pct: number;
  last_price_update: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  symbol: string;
  side: string;
  quantity: number;
  order_type: string;
  limit_price: number | null;
  status: string;
  filled_quantity: number;
  avg_fill_price: number | null;
  created_at: string;
  filled_at: string | null;
  canceled_at: string | null;
}

export interface TierLimits {
  plan_name: string;
  max_positions: number;
  current_positions: number;
  positions_remaining: number;
  orders_per_day: number;
  orders_today: number;
  orders_remaining_today: number;
  history_days: number;
  is_unlimited: boolean;
  // Tier features
  max_portfolios: number;
  max_chart_overlays: number;
  allowed_overlays: OverlayType[];
  reset_cooldown_hours: number;
  can_reset: boolean;
  hours_until_reset: number | null;
}

// Chart overlay types
export type OverlayType = 'sma20' | 'sma50' | 'sma200' | 'regression' | 'levels';

export interface ResetAccountResponse {
  success: boolean;
  message: string;
  account: Account | null;
}

export interface SnapshotSummary {
  date: string;
  total_value: number;
  cash_value: number;
  positions_value: number;
  daily_return: number | null;
  daily_return_pct: number | null;
}

export interface Performance {
  account_id: string;
  period: string;
  start_date: string;
  end_date: string;
  start_value: number;
  end_value: number;
  total_return: number;
  total_return_pct: number;
  max_drawdown: number | null;
  max_drawdown_pct: number | null;
  sharpe_ratio: number | null;
  win_rate: number | null;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  daily_snapshots: SnapshotSummary[];
}

export interface OrdersListResponse {
  orders: Order[];
  total: number;
  limit: number;
  offset: number;
}

export interface PositionsListResponse {
  positions: Position[];
  total: number;
  total_value: number;
  total_cost: number;
  total_unrealized_pl: number;
  total_unrealized_pl_pct: number;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Create a new paper trading account.
 */
export async function createAccount(data?: CreateAccountRequest): Promise<Account> {
  const response = await apiClient.post('/paper/account', data || {});
  return response.data;
}

/**
 * Get user's paper trading account.
 */
export async function getAccount(): Promise<Account> {
  const response = await apiClient.get('/paper/account');
  return response.data;
}

/**
 * Get tier-based limits for paper trading.
 */
export async function getTierLimits(): Promise<TierLimits> {
  const response = await apiClient.get('/paper/limits');
  return response.data;
}

/**
 * Place a paper trading order.
 */
export async function placeOrder(data: PlaceOrderRequest): Promise<Order> {
  const response = await apiClient.post('/paper/orders', data);
  return response.data;
}

/**
 * List paper trading orders.
 */
export async function listOrders(params?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<OrdersListResponse> {
  const response = await apiClient.get('/paper/orders', { params });
  return response.data;
}

/**
 * Cancel a paper order.
 */
export async function cancelOrder(orderId: string): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.delete(`/paper/orders/${orderId}`);
  return response.data;
}

/**
 * Dismiss (hard-delete) order records from history.
 */
export async function dismissOrders(ids: string[]): Promise<{ success: boolean; dismissed: number }> {
  const response = await apiClient.post('/paper/orders/dismiss', { ids });
  return response.data;
}

/**
 * List paper trading positions.
 */
export async function listPositions(): Promise<PositionsListResponse> {
  const response = await apiClient.get('/paper/positions');
  return response.data;
}

/**
 * Get performance metrics.
 */
export async function getPerformance(period: string = '1m'): Promise<Performance> {
  const response = await apiClient.get('/paper/performance', { params: { period } });
  return response.data;
}

/**
 * Reset paper trading account to initial state.
 * Subject to tier-based cooldown restrictions.
 */
export async function resetAccount(): Promise<ResetAccountResponse> {
  const response = await apiClient.post('/paper/reset');
  return response.data;
}

// ── Import Real Portfolio ─────────────────────────────────────────────────────

export interface ImportPortfolioResult {
  imported: { symbol: string; quantity: number }[];
  skipped: { symbol: string; reason: string }[];
  failed: { symbol: string; reason: string }[];
  summary: {
    imported_count: number;
    skipped_count: number;
    failed_count: number;
  };
  disclaimer: string;
}

/**
 * Copy real broker holdings into the paper trading account.
 * Places market buy orders for each Plaid holding.
 */
export async function importRealPortfolio(): Promise<ImportPortfolioResult> {
  const response = await apiClient.post('/paper/import-portfolio');
  return response.data;
}


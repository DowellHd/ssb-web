/**
 * Options paper trading API client.
 *
 * All positions and orders are simulated for educational purposes.
 * No real options contracts or real money are involved.
 */
import { apiClient } from '../api-client';

// ============================================================================
// Request types
// ============================================================================

export interface PlaceOptionsPaperOrderRequest {
  symbol: string;
  option_type: 'call' | 'put';
  expiration: string; // ISO date "YYYY-MM-DD"
  strike: number;
  contracts: number;
  action: 'buy_to_open' | 'sell_to_close';
  estimated_premium: number;
  position_id?: string; // required for sell_to_close
}

// ============================================================================
// Response types (snake_case from backend)
// ============================================================================

export interface OptionsPaperPositionRaw {
  id: string;
  account_id: string;
  symbol: string;
  option_type: 'call' | 'put';
  expiration: string;
  strike: number;
  contracts: number;
  open_action: 'buy_to_open' | 'sell_to_close';
  entry_premium: number;
  current_premium: number | null;
  entry_contract_value: number;
  current_contract_value: number | null;
  unrealized_pl: number | null;
  unrealized_pl_pct: number | null;
  status: 'open' | 'closed' | 'expired';
  opened_at: string;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  is_simulated: boolean;
}

export interface OptionsPaperPositionsListRaw {
  positions: OptionsPaperPositionRaw[];
  total: number;
  total_positions_value: number;
  total_unrealized_pl: number;
}

export interface OptionsPaperOrderRaw {
  id: string;
  account_id: string;
  symbol: string;
  option_type: 'call' | 'put';
  expiration: string;
  strike: number;
  contracts: number;
  action: 'buy_to_open' | 'sell_to_close';
  estimated_premium: number;
  filled_premium: number | null;
  status: 'pending' | 'filled' | 'canceled' | 'rejected';
  position_id: string | null;
  created_at: string;
  updated_at: string;
  filled_at: string | null;
  canceled_at: string | null;
  is_simulated: boolean;
}

export interface OptionsPaperOrdersListRaw {
  orders: OptionsPaperOrderRaw[];
  total: number;
}

// ============================================================================
// API functions
// ============================================================================

/**
 * Place a simulated paper options order (buy_to_open or sell_to_close).
 */
export async function placeOptionsPaperOrder(
  request: PlaceOptionsPaperOrderRequest,
): Promise<OptionsPaperOrderRaw> {
  const response = await apiClient.post<OptionsPaperOrderRaw>(
    '/options/orders',
    request,
  );
  return response.data;
}

/**
 * Fetch paper options positions, filtered by status.
 */
export async function getOptionsPaperPositions(
  status: 'open' | 'closed' | 'expired' = 'open',
): Promise<OptionsPaperPositionsListRaw> {
  const response = await apiClient.get<OptionsPaperPositionsListRaw>(
    '/options/positions',
    { params: { status } },
  );
  return response.data;
}

/**
 * Fetch recent paper options orders.
 */
export async function getOptionsPaperOrders(
  limit = 50,
): Promise<OptionsPaperOrdersListRaw> {
  const response = await apiClient.get<OptionsPaperOrdersListRaw>(
    '/options/orders',
    { params: { limit } },
  );
  return response.data;
}

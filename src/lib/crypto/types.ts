/**
 * Cryptocurrency domain types.
 *
 * These mirror the backend Pydantic schemas in app/schemas/crypto.py.
 */

// ============================================================================
// Market data
// ============================================================================

export interface CoinPrice {
  coin_id: string;
  symbol: string;
  name: string;
  image: string | null;
  current_price: number | null;
  market_cap: number | null;
  market_cap_rank: number | null;
  total_volume: number | null;
  price_change_24h: number | null;
  price_change_pct_24h: number | null;
  price_change_pct_7d: number | null;
  price_change_pct_30d: number | null;
  circulating_supply: number | null;
  ath: number | null;
  ath_change_pct: number | null;
}

export interface CryptoPricesResponse {
  coins: CoinPrice[];
  total: number;
  page: number;
  per_page: number;
}

export interface MarketOverview {
  total_market_cap_usd: number | null;
  total_volume_usd: number | null;
  market_cap_change_pct_24h: number | null;
  btc_dominance: number | null;
  eth_dominance: number | null;
  active_cryptocurrencies: number | null;
  markets: number | null;
}

export interface GainersLosers {
  gainers: CoinPrice[];
  losers: CoinPrice[];
}

export interface CoinSearchResult {
  coin_id: string;
  symbol: string;
  name: string;
  market_cap_rank: number | null;
  thumb: string | null;
}

export interface CoinSearchResponse {
  results: CoinSearchResult[];
  query: string;
}

// ============================================================================
// Entitlements
// ============================================================================

export type CryptoAccessTier = 'none' | 'basic' | 'full';

export interface CryptoEntitlements {
  fullListEnabled: boolean;
  watchlistEnabled: boolean;
  portfolioEnabled: boolean;
  maxWatchlistItems: number;
  accessTier: CryptoAccessTier;
  planName: string;
}

// Raw API response shape (snake_case from backend)
export interface CryptoEntitlementsResponse {
  full_list_enabled: boolean;
  watchlist_enabled: boolean;
  portfolio_enabled: boolean;
  max_watchlist_items: number;
  access_tier: CryptoAccessTier;
  plan_name: string;
}

// ============================================================================
// Watchlist
// ============================================================================

export interface WatchlistItem {
  id: string;
  coin_id: string;
  symbol: string;
  name: string;
  added_at: string;
}

export interface WatchlistResponse {
  items: WatchlistItem[];
  total: number;
}

export interface AddWatchlistItemRequest {
  coin_id: string;
  symbol: string;
  name: string;
}

// ============================================================================
// Portfolio
// ============================================================================

export interface PortfolioHolding {
  id: string;
  coin_id: string;
  symbol: string;
  name: string;
  quantity: string;           // Decimal as string from backend
  avg_cost_usd: string;       // Decimal as string from backend
  notes: string | null;
  current_price_usd: number | null;
  current_value_usd: number | null;
  cost_basis_usd: number | null;
  unrealized_pl_usd: number | null;
  unrealized_pl_pct: number | null;
  created_at: string;
  updated_at: string;
}

export interface PortfolioResponse {
  holdings: PortfolioHolding[];
  total_holdings: number;
  total_cost_basis_usd: number;
  total_current_value_usd: number;
  total_unrealized_pl_usd: number;
  total_unrealized_pl_pct: number;
}

export interface AddPortfolioHoldingRequest {
  coin_id: string;
  symbol: string;
  name: string;
  quantity: string;
  avg_cost_usd: string;
  notes?: string;
}

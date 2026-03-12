/**
 * Crypto API client.
 *
 * All requests require authentication.  Market data (prices, overview,
 * gainers/losers, search) is cached on the backend for 5 minutes.
 * User-specific data (watchlist, portfolio) is persisted server-side.
 */

import { apiClient } from '../api-client';
import type {
  AddPortfolioHoldingRequest,
  AddWatchlistItemRequest,
  CoinSearchResponse,
  CryptoEntitlements,
  CryptoEntitlementsResponse,
  CryptoPricesResponse,
  GainersLosers,
  MarketOverview,
  PortfolioResponse,
  WatchlistResponse,
} from '../crypto/types';

// ============================================================================
// Entitlements
// ============================================================================

export async function getCryptoEntitlements(): Promise<CryptoEntitlements> {
  const response = await apiClient.get<CryptoEntitlementsResponse>(
    '/crypto/entitlements',
  );
  const data = response.data;
  return {
    fullListEnabled: data.full_list_enabled,
    watchlistEnabled: data.watchlist_enabled,
    portfolioEnabled: data.portfolio_enabled,
    maxWatchlistItems: data.max_watchlist_items,
    accessTier: data.access_tier,
    planName: data.plan_name,
  };
}

// ============================================================================
// Market data
// ============================================================================

export async function getCryptoPrices(
  page = 1,
  perPage = 20,
): Promise<CryptoPricesResponse> {
  const response = await apiClient.get<CryptoPricesResponse>('/crypto/prices', {
    params: { page, per_page: perPage },
  });
  return response.data;
}

export async function getMarketOverview(): Promise<MarketOverview> {
  const response = await apiClient.get<MarketOverview>('/crypto/market-overview');
  return response.data;
}

export async function getGainersLosers(): Promise<GainersLosers> {
  const response = await apiClient.get<GainersLosers>('/crypto/gainers-losers');
  return response.data;
}

export async function searchCoins(query: string): Promise<CoinSearchResponse> {
  const response = await apiClient.get<CoinSearchResponse>('/crypto/search', {
    params: { q: query },
  });
  return response.data;
}

// ============================================================================
// Watchlist
// ============================================================================

export async function getWatchlist(): Promise<WatchlistResponse> {
  const response = await apiClient.get<WatchlistResponse>('/crypto/watchlist');
  return response.data;
}

export async function addToWatchlist(
  request: AddWatchlistItemRequest,
): Promise<WatchlistResponse> {
  const response = await apiClient.post<WatchlistResponse>(
    '/crypto/watchlist',
    request,
  );
  return response.data;
}

export async function removeFromWatchlist(coinId: string): Promise<void> {
  await apiClient.delete(`/crypto/watchlist/${coinId}`);
}

// ============================================================================
// Portfolio
// ============================================================================

export async function getCryptoPortfolio(): Promise<PortfolioResponse> {
  const response = await apiClient.get<PortfolioResponse>('/crypto/portfolio');
  return response.data;
}

export async function addPortfolioHolding(
  request: AddPortfolioHoldingRequest,
): Promise<PortfolioResponse> {
  const response = await apiClient.post<PortfolioResponse>(
    '/crypto/portfolio',
    request,
  );
  return response.data;
}

export async function removePortfolioHolding(holdingId: string): Promise<void> {
  await apiClient.delete(`/crypto/portfolio/${holdingId}`);
}

/**
 * React Query hooks for the Crypto feature.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addPortfolioHolding,
  addToWatchlist,
  getCryptoEntitlements,
  getCryptoPrices,
  getCryptoPortfolio,
  getGainersLosers,
  getMarketOverview,
  getWatchlist,
  removeFromWatchlist,
  removePortfolioHolding,
  searchCoins,
} from '@/lib/api/crypto';
import type {
  AddPortfolioHoldingRequest,
  AddWatchlistItemRequest,
} from '@/lib/crypto/types';

// ============================================================================
// Query key factory
// ============================================================================

export const cryptoQueryKeys = {
  all: ['crypto'] as const,
  entitlements: () => [...cryptoQueryKeys.all, 'entitlements'] as const,
  prices: (page: number, perPage: number) =>
    [...cryptoQueryKeys.all, 'prices', page, perPage] as const,
  marketOverview: () => [...cryptoQueryKeys.all, 'market-overview'] as const,
  gainersLosers: () => [...cryptoQueryKeys.all, 'gainers-losers'] as const,
  search: (query: string) => [...cryptoQueryKeys.all, 'search', query] as const,
  watchlist: () => [...cryptoQueryKeys.all, 'watchlist'] as const,
  portfolio: () => [...cryptoQueryKeys.all, 'portfolio'] as const,
};

// ============================================================================
// Entitlements
// ============================================================================

export function useCryptoEntitlements() {
  return useQuery({
    queryKey: cryptoQueryKeys.entitlements(),
    queryFn: getCryptoEntitlements,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

// ============================================================================
// Market data
// ============================================================================

// Fast retry for market data: 2 attempts, 1s / 2s delays (backend also retries on 429)
const MARKET_RETRY_OPTIONS = {
  retry: 2,
  retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 4000),
} as const;

export function useCryptoPrices(page = 1, perPage = 20) {
  return useQuery({
    queryKey: cryptoQueryKeys.prices(page, perPage),
    queryFn: () => getCryptoPrices(page, perPage),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    ...MARKET_RETRY_OPTIONS,
  });
}

export function useMarketOverview() {
  return useQuery({
    queryKey: cryptoQueryKeys.marketOverview(),
    queryFn: getMarketOverview,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    ...MARKET_RETRY_OPTIONS,
  });
}

export function useGainersLosers() {
  return useQuery({
    queryKey: cryptoQueryKeys.gainersLosers(),
    queryFn: getGainersLosers,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    ...MARKET_RETRY_OPTIONS,
  });
}

export function useCoinSearch(query: string) {
  return useQuery({
    queryKey: cryptoQueryKeys.search(query),
    queryFn: () => searchCoins(query),
    enabled: query.trim().length >= 2,
    staleTime: 10 * 60 * 1000,
  });
}

// ============================================================================
// Watchlist
// ============================================================================

export function useWatchlist() {
  return useQuery({
    queryKey: cryptoQueryKeys.watchlist(),
    queryFn: getWatchlist,
    staleTime: 2 * 60 * 1000,
  });
}

export function useAddToWatchlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: AddWatchlistItemRequest) => addToWatchlist(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cryptoQueryKeys.watchlist() });
    },
  });
}

export function useRemoveFromWatchlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (coinId: string) => removeFromWatchlist(coinId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cryptoQueryKeys.watchlist() });
    },
  });
}

// ============================================================================
// Portfolio
// ============================================================================

export function useCryptoPortfolio() {
  return useQuery({
    queryKey: cryptoQueryKeys.portfolio(),
    queryFn: getCryptoPortfolio,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useAddPortfolioHolding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: AddPortfolioHoldingRequest) =>
      addPortfolioHolding(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cryptoQueryKeys.portfolio() });
    },
  });
}

export function useRemovePortfolioHolding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (holdingId: string) => removePortfolioHolding(holdingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cryptoQueryKeys.portfolio() });
    },
  });
}

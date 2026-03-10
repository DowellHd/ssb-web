/**
 * React Query hooks for options chain data and entitlements.
 *
 * Chain data is sourced from the provider abstraction (simulated in Phase 1).
 * Entitlements are fetched from the backend API.
 */

import { useQuery } from '@tanstack/react-query';
import {
  getOptionsChain,
  getOptionsExpirations,
  getOptionsEntitlements,
} from '@/lib/api/options';
import type { OptionsChain, OptionsEntitlements } from '@/lib/options/types';

// ============================================================================
// Query keys
// ============================================================================

export const optionsQueryKeys = {
  all: ['options'] as const,
  entitlements: () => [...optionsQueryKeys.all, 'entitlements'] as const,
  expirations: (symbol: string) =>
    [...optionsQueryKeys.all, 'expirations', symbol.toUpperCase()] as const,
  chain: (symbol: string, expiration: string) =>
    [...optionsQueryKeys.all, 'chain', symbol.toUpperCase(), expiration] as const,
};

// ============================================================================
// Hooks
// ============================================================================

/**
 * Fetch user's options feature entitlements.
 */
export function useOptionsEntitlements() {
  return useQuery<OptionsEntitlements>({
    queryKey: optionsQueryKeys.entitlements(),
    queryFn: getOptionsEntitlements,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

/**
 * Fetch available expiration dates for a symbol.
 * Disabled when symbol is empty.
 */
export function useOptionsExpirations(symbol: string) {
  return useQuery<string[]>({
    queryKey: optionsQueryKeys.expirations(symbol),
    queryFn: () => getOptionsExpirations(symbol),
    enabled: symbol.trim().length > 0,
    staleTime: 60 * 60 * 1000, // 1 hour (expirations are stable)
  });
}

/**
 * Fetch an options chain for a symbol and expiration.
 * Disabled until both symbol and expiration are provided.
 */
export function useOptionsChain(symbol: string, expiration: string) {
  return useQuery<OptionsChain>({
    queryKey: optionsQueryKeys.chain(symbol, expiration),
    queryFn: () => getOptionsChain({ symbol, expiration }),
    enabled: symbol.trim().length > 0 && expiration.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Options API client.
 *
 * Chain data flows through the provider abstraction (lib/options/providers/).
 * Account/entitlement data flows through the backend API.
 *
 * Phase 1: chain data is always simulated. The provider factory determines
 * which provider is used — swapping providers requires no changes here.
 */

import { apiClient } from '../api-client';
import { getOptionsProvider } from '../options/providers/base-provider';
import type {
  OptionsChain,
  OptionsChainRequest,
  OptionsEntitlements,
  OptionsEntitlementsResponse,
} from '../options/types';

// ============================================================================
// Chain data (via provider abstraction)
// ============================================================================

/**
 * Fetch an options chain for the given symbol and optional expiration.
 * Routes through the active OptionsProvider — Phase 1 returns simulated data.
 */
export async function getOptionsChain(
  request: OptionsChainRequest,
): Promise<OptionsChain> {
  const provider = await getOptionsProvider();
  return provider.getOptionsChain(request);
}

/**
 * Get available expiration dates for a symbol.
 * Returns ISO date strings sorted ascending.
 */
export async function getOptionsExpirations(symbol: string): Promise<string[]> {
  const provider = await getOptionsProvider();
  return provider.getExpirations(symbol);
}

// ============================================================================
// Entitlements (backend API)
// ============================================================================

/**
 * Fetch user's options feature entitlements from the backend.
 * The backend enforces tier-based access; this call requires authentication.
 */
export async function getOptionsEntitlements(): Promise<OptionsEntitlements> {
  const response = await apiClient.get<OptionsEntitlementsResponse>(
    '/options/entitlements',
  );
  const data = response.data;
  return {
    chainViewerEnabled: data.chain_viewer_enabled,
    paperTradingEnabled: data.paper_trading_enabled,
    analyticsEnabled: data.analytics_enabled,
    maxContracts: data.max_contracts,
    accessTier: data.access_tier,
  };
}

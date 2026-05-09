/**
 * Options data provider abstraction.
 *
 * This interface is the single integration point between the UI/analytics
 * layers and the underlying data source. All consumers (chain viewer,
 * paper trading, analytics) call through this interface.
 *
 * Architecture rationale:
 * - Phase 1 ships with SimulatedOptionsProvider (educational, deterministic)
 * - Future phases can add PolygonOptionsProvider, AlpacaOptionsProvider, etc.
 * - No UI or analytics code imports provider implementations directly;
 *   they import this interface and receive a provider via the factory below.
 *
 * To add a new provider:
 *   1. Create providers/your-provider.ts implementing OptionsProvider
 *   2. Update getOptionsProvider() below to select it via env/config
 *   3. No other files need to change
 */

import type { OptionsChain } from '../types';

// ============================================================================
// Provider interface
// ============================================================================

export interface OptionsChainRequest {
  symbol: string;
  /** If omitted, use the nearest available expiration. */
  expiration?: string;
}

/**
 * Core interface all options data providers must implement.
 */
export interface OptionsProvider {
  /**
   * Fetch or generate an options chain for the given symbol and expiration.
   *
   * Implementor requirements:
   * - Mark `isSimulated: true` on all contracts if data is not live
   * - Return calls and puts sorted by strike ascending
   * - Populate all required OptionsContract fields (no undefined Greeks)
   * - Set `dataTimestamp` to an ISO string reflecting data freshness
   */
  getOptionsChain(request: OptionsChainRequest): Promise<OptionsChain>;

  /**
   * Return available expiration dates for a symbol, sorted ascending.
   * Returns ISO date strings ("YYYY-MM-DD").
   */
  getExpirations(symbol: string): Promise<string[]>;

  /** Display name for this provider. Shown in data-source labels. */
  readonly providerName: string;

  /**
   * Whether this provider returns real market data.
   * If false, all returned data must be labeled as simulated.
   * The UI uses this flag to render the appropriate disclaimer.
   */
  readonly isLive: boolean;
}

// ============================================================================
// Provider factory
// ============================================================================

/**
 * Returns the active options provider for the current environment.
 *
 * Set NEXT_PUBLIC_OPTIONS_PROVIDER=alpaca to use live Alpaca data via
 * the SSB API backend. Defaults to the simulated (educational) provider.
 */
export async function getOptionsProvider(): Promise<OptionsProvider> {
  if (process.env.NEXT_PUBLIC_OPTIONS_PROVIDER === 'alpaca') {
    const { ApiOptionsProvider } = await import('./api-provider');
    return new ApiOptionsProvider();
  }
  const { SimulatedOptionsProvider } = await import('./simulated-provider');
  return new SimulatedOptionsProvider();
}

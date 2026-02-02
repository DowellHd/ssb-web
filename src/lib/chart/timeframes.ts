/**
 * Chart timeframe utilities.
 *
 * Centralized configuration for timeframe options, limit mappings, and persistence.
 */

import type { Timeframe } from '@/lib/api/data';

// ============================================================================
// Types
// ============================================================================

export type ChartTimeframe = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '2Y';

export interface TimeframeConfig {
  label: string;
  apiTimeframe: Timeframe;
  limit: number;
}

// ============================================================================
// Configuration
// ============================================================================

/**
 * Timeframe display options with corresponding API parameters.
 *
 * Each timeframe maps to:
 * - label: Display text for the UI
 * - apiTimeframe: The timeframe parameter for the API
 * - limit: Optimal number of bars to request
 */
export const TIMEFRAME_CONFIG: Record<ChartTimeframe, TimeframeConfig> = {
  '1D': { label: '1D', apiTimeframe: '1d', limit: 1 },
  '1W': { label: '1W', apiTimeframe: '1d', limit: 7 },
  '1M': { label: '1M', apiTimeframe: '1d', limit: 22 },
  '3M': { label: '3M', apiTimeframe: '1d', limit: 66 },
  '6M': { label: '6M', apiTimeframe: '1d', limit: 130 },
  '1Y': { label: '1Y', apiTimeframe: '1d', limit: 252 },
  '2Y': { label: '2Y', apiTimeframe: '1d', limit: 504 },
};

/**
 * Ordered list of timeframes for UI rendering.
 */
export const TIMEFRAME_OPTIONS: ChartTimeframe[] = ['1D', '1W', '1M', '3M', '6M', '1Y', '2Y'];

/**
 * Default timeframe when no preference is stored.
 */
export const DEFAULT_TIMEFRAME: ChartTimeframe = '3M';

// ============================================================================
// Persistence
// ============================================================================

const STORAGE_KEY_PREFIX = 'ssb.paper.chart.timeframe';

/**
 * Get the storage key for a symbol's timeframe preference.
 */
function getStorageKey(symbol: string): string {
  return `${STORAGE_KEY_PREFIX}.${symbol.toUpperCase()}`;
}

/**
 * Save the selected timeframe for a symbol.
 * Safe to call during SSR (no-op if window is undefined).
 */
export function saveTimeframePreference(symbol: string, timeframe: ChartTimeframe): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(getStorageKey(symbol), timeframe);
  } catch {
    // localStorage may be unavailable (private browsing, quota exceeded, etc.)
  }
}

/**
 * Load the saved timeframe for a symbol.
 * Returns null if no preference is stored or during SSR.
 */
export function loadTimeframePreference(symbol: string): ChartTimeframe | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(getStorageKey(symbol));
    if (stored && TIMEFRAME_OPTIONS.includes(stored as ChartTimeframe)) {
      return stored as ChartTimeframe;
    }
  } catch {
    // localStorage may be unavailable
  }

  return null;
}

/**
 * Get the timeframe to use for a symbol.
 * Returns the saved preference if available, otherwise the default.
 */
export function getInitialTimeframe(symbol: string): ChartTimeframe {
  return loadTimeframePreference(symbol) || DEFAULT_TIMEFRAME;
}

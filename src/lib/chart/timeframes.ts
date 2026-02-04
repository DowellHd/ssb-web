/**
 * Chart timeframe utilities.
 *
 * Separates DISPLAY RANGE (1D, 1W, etc.) from BAR GRANULARITY (5m, 1d, etc.)
 * so that "1D" shows intraday candles, not a single daily bar.
 */

import type { Timeframe } from '@/lib/api/data';

// ============================================================================
// Types
// ============================================================================

export type ChartRange = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '2Y';

export type BarSize = '5m' | '30m' | '4h' | '1d';

export interface RangeConfig {
  label: string;
  barSize: BarSize;
  limit: number;
}

// ============================================================================
// Configuration
// ============================================================================

/**
 * Range → Bar Size mapping.
 *
 * - 1D: 5-minute bars (intraday, ~288 bars for full trading day)
 * - 1W: 30-minute bars (intraday)
 * - 1M: 4-hour bars (intraday)
 * - 3M+: Daily bars
 */
export const RANGE_CONFIG: Record<ChartRange, RangeConfig> = {
  '1D': { label: '1D', barSize: '5m', limit: 288 },
  '1W': { label: '1W', barSize: '30m', limit: 336 },
  '1M': { label: '1M', barSize: '4h', limit: 180 },
  '3M': { label: '3M', barSize: '1d', limit: 90 },
  '6M': { label: '6M', barSize: '1d', limit: 180 },
  '1Y': { label: '1Y', barSize: '1d', limit: 252 },
  '2Y': { label: '2Y', barSize: '1d', limit: 504 },
};

/**
 * Map barSize to API timeframe parameter.
 */
export function barSizeToApiTimeframe(barSize: BarSize): Timeframe {
  const map: Record<BarSize, Timeframe> = {
    '5m': '5m',
    '30m': '15m', // API may not support 30m, fallback to 15m
    '4h': '1h',   // API may not support 4h, fallback to 1h with adjusted limit
    '1d': '1d',
  };
  return map[barSize];
}

/**
 * Ordered list of ranges for UI rendering.
 */
export const RANGE_OPTIONS: ChartRange[] = ['1D', '1W', '1M', '3M', '6M', '1Y', '2Y'];

/**
 * Default range when no preference is stored.
 */
export const DEFAULT_RANGE: ChartRange = '3M';

// ============================================================================
// Time Handling Helpers
// ============================================================================

/**
 * Returns true if the bar size represents intraday data.
 * Intraday bars should show time in crosshair/axis.
 */
export function isIntradayBarSize(barSize: BarSize): boolean {
  return barSize === '5m' || barSize === '30m' || barSize === '4h';
}

/**
 * Convert a timestamp to lightweight-charts Time format.
 *
 * - Intraday: returns UTCTimestamp (seconds since epoch)
 * - Daily+: returns BusinessDay { year, month, day }
 */
export function toChartTime(
  timestamp: string | number,
  barSize: BarSize
): number | { year: number; month: number; day: number } {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp * 1000);

  if (isIntradayBarSize(barSize)) {
    // UTCTimestamp for intraday (seconds since epoch)
    return Math.floor(date.getTime() / 1000);
  } else {
    // BusinessDay for daily+ (no time component)
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1, // 1-indexed
      day: date.getDate(),
    };
  }
}

// ============================================================================
// Time Formatting (24-hour format, single source of truth)
// ============================================================================

/** Shared 24-hour time formatter */
const TIME_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

/** Shared date formatter (day + short month) */
const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
});

/**
 * Format a timestamp for crosshair/tooltip display.
 * Uses 24-hour time format (HH:mm) for intraday bars.
 *
 * - Intraday: "23 Oct '25 14:30"
 * - Daily+: "23 Oct '25"
 */
export function formatChartTime(timestamp: number, barSize: BarSize): string {
  const date = new Date(timestamp * 1000);
  const datePart = DATE_FORMATTER.format(date);
  const year = date.getFullYear().toString().slice(-2);

  if (isIntradayBarSize(barSize)) {
    const timePart = TIME_FORMATTER.format(date);
    return `${datePart} '${year} ${timePart}`;
  } else {
    return `${datePart} '${year}`;
  }
}

/**
 * Format a timestamp for x-axis tick labels.
 * Uses 24-hour time format (HH:mm) for intraday bars.
 * Shorter format suitable for axis labels.
 *
 * - Intraday: "14:30" or "23 Oct"
 * - Daily+: "23 Oct" or "Oct '25"
 */
export function formatAxisTime(timestamp: number, barSize: BarSize): string {
  const date = new Date(timestamp * 1000);

  if (isIntradayBarSize(barSize)) {
    // For intraday, show 24-hour time
    return TIME_FORMATTER.format(date);
  } else {
    // For daily+, show date
    return DATE_FORMATTER.format(date);
  }
}

/**
 * Format a BusinessDay object for display.
 * Used for daily+ data where lightweight-charts provides BusinessDay objects.
 */
export function formatBusinessDay(bd: { year: number; month: number; day: number }): string {
  const date = new Date(bd.year, bd.month - 1, bd.day);
  const datePart = DATE_FORMATTER.format(date);
  const year = bd.year.toString().slice(-2);
  return `${datePart} '${year}`;
}

// ============================================================================
// Persistence
// ============================================================================

const STORAGE_KEY_PREFIX = 'ssb.paper.chart.range';

/**
 * Get the storage key for a symbol's range preference.
 */
function getStorageKey(symbol: string): string {
  return `${STORAGE_KEY_PREFIX}.${symbol.toUpperCase()}`;
}

/**
 * Save the selected range for a symbol.
 * Safe to call during SSR (no-op if window is undefined).
 */
export function saveRangePreference(symbol: string, range: ChartRange): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(getStorageKey(symbol), range);
  } catch {
    // localStorage may be unavailable (private browsing, quota exceeded, etc.)
  }
}

/**
 * Load the saved range for a symbol.
 * Returns null if no preference is stored or during SSR.
 */
export function loadRangePreference(symbol: string): ChartRange | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(getStorageKey(symbol));
    if (stored && RANGE_OPTIONS.includes(stored as ChartRange)) {
      return stored as ChartRange;
    }
  } catch {
    // localStorage may be unavailable
  }

  return null;
}

/**
 * Get the range to use for a symbol.
 * Returns the saved preference if available, otherwise the default.
 */
export function getInitialRange(symbol: string): ChartRange {
  return loadRangePreference(symbol) || DEFAULT_RANGE;
}

// ============================================================================
// Legacy exports for backwards compatibility
// ============================================================================

/** @deprecated Use ChartRange instead */
export type ChartTimeframe = ChartRange;

/** @deprecated Use RANGE_CONFIG instead */
export const TIMEFRAME_CONFIG = RANGE_CONFIG;

/** @deprecated Use RANGE_OPTIONS instead */
export const TIMEFRAME_OPTIONS = RANGE_OPTIONS;

/** @deprecated Use DEFAULT_RANGE instead */
export const DEFAULT_TIMEFRAME = DEFAULT_RANGE;

/** @deprecated Use getInitialRange instead */
export const getInitialTimeframe = getInitialRange;

/** @deprecated Use saveRangePreference instead */
export const saveTimeframePreference = saveRangePreference;

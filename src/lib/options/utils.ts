/**
 * Options display formatting utilities.
 */

import type { Moneyness, OptionType } from './types';

// ============================================================================
// Date / expiration formatting
// ============================================================================

/**
 * Format an expiration date for display in the selector.
 * Shows month + day (+ year if different from current year) and DTE.
 *
 * @example formatExpiration("2026-04-17") → "Apr 17 (38d)"
 */
export function formatExpiration(isoDate: string): string {
  // Parse in UTC to avoid local timezone shifting the date
  const date = new Date(isoDate + 'T12:00:00Z');
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const dte = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));

  const month = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
  const day = date.toLocaleDateString('en-US', { day: 'numeric', timeZone: 'UTC' });
  const year = date.getUTCFullYear();
  const currentYear = now.getFullYear();

  const dateStr = year !== currentYear ? `${month} ${day} ${year}` : `${month} ${day}`;
  return `${dateStr} (${dte}d)`;
}

/**
 * Format an expiration date as a short string for compact display.
 * @example formatExpirationShort("2026-04-17") → "Apr 17"
 */
export function formatExpirationShort(isoDate: string): string {
  const date = new Date(isoDate + 'T12:00:00Z');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Days to expiration from today.
 */
export function daysToExpiration(isoDate: string): number {
  const date = new Date(isoDate + 'T21:00:00Z');
  const now = new Date();
  return Math.max(0, Math.round((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

// ============================================================================
// Greek / value formatting
// ============================================================================

/** Format implied volatility as a percentage string. e.g. 0.25 → "25.0%" */
export function formatIV(iv: number): string {
  return (iv * 100).toFixed(1) + '%';
}

/** Format a Greek value to 4 decimal places. */
export function formatGreek(value: number): string {
  return value.toFixed(4);
}

/** Format delta (shows sign for puts). e.g. -0.4532 → "-0.4532" */
export function formatDelta(delta: number): string {
  return delta >= 0 ? delta.toFixed(4) : delta.toFixed(4);
}

/** Format theta as per-day value. e.g. -0.0523 → "-0.05" */
export function formatTheta(theta: number): string {
  return theta.toFixed(4);
}

/** Format vega (per 1% IV change). */
export function formatVega(vega: number): string {
  return vega.toFixed(4);
}

/** Format a premium price. e.g. 3.45 → "$3.45" */
export function formatPremium(value: number): string {
  if (value < 0.01) return '<$0.01';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Format volume / open interest with K/M suffix. */
export function formatVolOI(value: number): string {
  if (value === 0) return '—';
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
  if (value >= 1_000) return (value / 1_000).toFixed(1) + 'K';
  return value.toLocaleString();
}

// ============================================================================
// Moneyness helpers
// ============================================================================

/**
 * Tailwind class for moneyness badge styling.
 */
export function moneynessColor(
  moneyness: Moneyness,
  optionType: OptionType,
): string {
  if (moneyness === 'atm') {
    return 'bg-primary/15 text-primary font-semibold';
  }
  if (moneyness === 'itm') {
    return optionType === 'call'
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  }
  // OTM
  return 'bg-muted text-muted-foreground';
}

/**
 * Row highlight class for moneyness (used on table rows).
 */
export function moneynessRowClass(
  moneyness: Moneyness,
  optionType: OptionType,
): string {
  if (moneyness === 'atm') return 'bg-primary/5';
  if (moneyness === 'itm') {
    return optionType === 'call'
      ? 'bg-green-50/60 dark:bg-green-950/20'
      : 'bg-red-50/60 dark:bg-red-950/20';
  }
  return '';
}

// ============================================================================
// Common symbols for quick-select
// ============================================================================

export const QUICK_SYMBOLS = ['SPY', 'QQQ', 'AAPL', 'MSFT', 'TSLA', 'NVDA'] as const;

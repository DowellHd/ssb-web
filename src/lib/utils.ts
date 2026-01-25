import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// =============================================================================
// Safe Value Helpers - Prevent NaN/null/undefined in UI
// =============================================================================

/**
 * Check if a value is a valid, finite number
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * Safely get a number or return a fallback
 */
export function safeNumber(value: unknown, fallback: number = 0): number {
  if (isValidNumber(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

/**
 * Safe toFixed that handles null/undefined/NaN
 */
export function safeToFixed(value: unknown, decimals: number = 2, fallback: string = '—'): string {
  if (!isValidNumber(value)) return fallback;
  return value.toFixed(decimals);
}

/**
 * Format currency value safely
 */
export function formatCurrency(value: unknown, currency: string = 'USD', fallback: string = '—'): string {
  if (!isValidNumber(value)) return fallback;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format percentage safely
 */
export function formatPercent(value: unknown, decimals: number = 2, fallback: string = '—'): string {
  if (!isValidNumber(value)) return fallback;
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

/**
 * Format percentage (no sign) safely
 */
export function formatPercentNoSign(value: unknown, decimals: number = 2, fallback: string = '—'): string {
  if (!isValidNumber(value)) return fallback;
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format large numbers safely (e.g., 1.5M, 2.3B)
 */
export function formatNumber(num: unknown, fallback: string = '—'): string {
  if (!isValidNumber(num)) return fallback;
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toFixed(0);
}

/**
 * Calculate percentage change safely
 */
export function calculatePercentChange(current: unknown, previous: unknown): number {
  if (!isValidNumber(current) || !isValidNumber(previous) || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

// Threshold for treating values as "unlimited" (matches backend)
export const UNLIMITED_THRESHOLD = 100_000;

/**
 * Check if a value represents "unlimited"
 */
export function isUnlimited(value: unknown): boolean {
  return isValidNumber(value) && value >= UNLIMITED_THRESHOLD;
}

/**
 * Format a limit value (handles unlimited)
 */
export function formatLimit(value: unknown, suffix: string = '', fallback: string = '—'): string {
  if (!isValidNumber(value)) return fallback;
  if (isUnlimited(value)) return 'Unlimited';
  return `${value.toLocaleString()}${suffix}`;
}

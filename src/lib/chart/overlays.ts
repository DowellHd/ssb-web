/**
 * Chart overlay computation utilities.
 *
 * All computations are deterministic and client-side.
 * Educational visual aids only - no trading signals.
 */

import type { OverlayType } from '@/lib/api/paper';

export interface OHLCV {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface OverlayPoint {
  time: number;
  value: number;
}

export interface KeyLevels {
  prevDayHigh: number | null;
  prevDayLow: number | null;
  weeklyHigh: number | null;
  weeklyLow: number | null;
}

export interface OverlayConfig {
  type: OverlayType;
  label: string;
  color: string;
  description: string;
}

// Overlay configuration
export const OVERLAY_CONFIGS: Record<OverlayType, OverlayConfig> = {
  sma20: {
    type: 'sma20',
    label: 'SMA 20',
    color: '#3b82f6', // blue
    description: '20-period Simple Moving Average',
  },
  sma50: {
    type: 'sma50',
    label: 'SMA 50',
    color: '#f59e0b', // amber
    description: '50-period Simple Moving Average',
  },
  sma200: {
    type: 'sma200',
    label: 'SMA 200',
    color: '#ef4444', // red
    description: '200-period Simple Moving Average',
  },
  regression: {
    type: 'regression',
    label: 'Trend Line',
    color: '#8b5cf6', // purple
    description: 'Linear regression trend line (50 periods)',
  },
  levels: {
    type: 'levels',
    label: 'Key Levels',
    color: '#10b981', // green
    description: 'Previous day high/low levels',
  },
};

/**
 * Calculate Simple Moving Average
 *
 * @param data - OHLCV data array (sorted by time ascending)
 * @param period - Number of periods for the average
 * @returns Array of SMA points
 */
export function calculateSMA(data: OHLCV[], period: number): OverlayPoint[] {
  if (data.length < period) return [];

  const result: OverlayPoint[] = [];

  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    result.push({
      time: data[i].time,
      value: sum / period,
    });
  }

  return result;
}

/**
 * Calculate Linear Regression Trend Line
 *
 * Uses least squares method over the last N candles.
 *
 * @param data - OHLCV data array (sorted by time ascending)
 * @param period - Number of periods to calculate regression over
 * @returns Array of two points (start and end of trend line)
 */
export function calculateLinearRegression(
  data: OHLCV[],
  period: number = 50
): OverlayPoint[] {
  if (data.length < 2) return [];

  // Use last N candles or all available
  const useData = data.slice(-Math.min(period, data.length));
  const n = useData.length;

  // Calculate sums for least squares
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  for (let i = 0; i < n; i++) {
    const x = i;
    const y = useData[i].close;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }

  // Calculate slope and intercept
  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) return [];

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  // Generate line points for each candle in the range
  const result: OverlayPoint[] = [];
  for (let i = 0; i < n; i++) {
    result.push({
      time: useData[i].time,
      value: intercept + slope * i,
    });
  }

  return result;
}

/**
 * Calculate Key Price Levels
 *
 * @param data - OHLCV data array (sorted by time ascending)
 * @returns Key levels object
 */
export function calculateKeyLevels(data: OHLCV[]): KeyLevels {
  if (data.length < 2) {
    return {
      prevDayHigh: null,
      prevDayLow: null,
      weeklyHigh: null,
      weeklyLow: null,
    };
  }

  // Previous day (second to last bar for daily data)
  const prevDay = data[data.length - 2];
  const prevDayHigh = prevDay?.high ?? null;
  const prevDayLow = prevDay?.low ?? null;

  // Weekly high/low (last 5 trading days)
  const weeklyData = data.slice(-5);
  let weeklyHigh: number | null = null;
  let weeklyLow: number | null = null;

  if (weeklyData.length >= 2) {
    weeklyHigh = Math.max(...weeklyData.map((d) => d.high));
    weeklyLow = Math.min(...weeklyData.map((d) => d.low));
  }

  return {
    prevDayHigh,
    prevDayLow,
    weeklyHigh,
    weeklyLow,
  };
}

/**
 * Get all available overlay types
 */
export function getAllOverlayTypes(): OverlayType[] {
  return ['sma20', 'sma50', 'sma200', 'regression', 'levels'];
}

/**
 * Check if an overlay type is allowed for the user's tier
 */
export function isOverlayAllowed(
  overlayType: OverlayType,
  allowedOverlays: OverlayType[]
): boolean {
  return allowedOverlays.includes(overlayType);
}

/**
 * Data API functions for market data.
 */
import { apiClient } from '../api-client';

// ============================================================================
// Types
// ============================================================================

export interface Bar {
  symbol: string;
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface BarsResponse {
  symbol: string;
  asset_class: string;
  timeframe: string;
  bars: Bar[];
  source: string;
  quality_score: number;
}

export type AssetClass = 'stocks' | 'etfs' | 'crypto';
export type Timeframe = '1m' | '5m' | '15m' | '1h' | '1d' | '1w';

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get OHLCV bars for a symbol.
 */
export async function getBars(
  symbol: string,
  options?: {
    assetClass?: AssetClass;
    timeframe?: Timeframe;
    limit?: number;
    start?: string;
    end?: string;
  }
): Promise<BarsResponse> {
  const params: Record<string, string | number> = {};

  if (options?.assetClass) params.asset_class = options.assetClass;
  if (options?.timeframe) params.timeframe = options.timeframe;
  if (options?.limit) params.limit = options.limit;
  if (options?.start) params.start = options.start;
  if (options?.end) params.end = options.end;

  const response = await apiClient.get(`/data/bars/${symbol.toUpperCase()}`, { params });
  return response.data;
}

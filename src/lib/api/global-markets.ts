import { apiClient } from '@/lib/api-client';

export interface Exchange {
  code: string;
  name: string;
  country: string;
  currency: string;
  region: string;
}

export interface ADR {
  symbol: string;
  name: string;
  country: string;
  exchange: string;
  sector: string;
}

export interface CountryRisk {
  country_code: string;
  risk_score: number;
  rating: string;
  risk_level: string;
  risk_premium_pct: number;
}

export interface GlobalQuote {
  symbol: string;
  open: number | null;
  high: number | null;
  low: number | null;
  price: number | null;
  volume: number | null;
  previous_close: number | null;
  change: number | null;
  change_pct: string;
  latest_trading_day: string | null;
  _simulated?: boolean;
  disclaimer?: string;
}

export interface FXRates {
  base: string;
  rates: Record<string, number>;
  disclaimer: string;
}

export interface WatchlistItem {
  id: string;
  symbol: string;
  exchange_code: string | null;
  asset_type: string;
  country_code: string | null;
  currency: string | null;
  display_name: string | null;
  notes: string | null;
  created_at: string | null;
}

export interface SymbolSearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
  currency: string;
  match_score?: string;
}

// ── Exchanges & ADRs ──────────────────────────────────────────────────────────

export async function listExchanges(): Promise<{ exchanges: Exchange[]; count: number }> {
  const res = await apiClient.get('/global-markets/exchanges');
  return res.data;
}

export async function listADRs(params?: { country?: string; sector?: string }): Promise<{ adrs: ADR[]; count: number }> {
  const res = await apiClient.get('/global-markets/adrs', { params });
  return res.data;
}

export async function getCountryRisk(countryCode?: string): Promise<{ countries?: CountryRisk[]; country_code?: string } & Partial<CountryRisk>> {
  const res = await apiClient.get('/global-markets/country-risk', { params: countryCode ? { country_code: countryCode } : undefined });
  return res.data;
}

// ── Market data ───────────────────────────────────────────────────────────────

export async function searchGlobalSymbols(query: string): Promise<{ results: SymbolSearchResult[] }> {
  const res = await apiClient.get('/global-markets/search', { params: { q: query } });
  return res.data;
}

export async function getGlobalQuote(symbol: string): Promise<GlobalQuote> {
  const res = await apiClient.get(`/global-markets/quote/${symbol}`);
  return res.data;
}

export async function getFXRates(base = 'USD'): Promise<FXRates> {
  const res = await apiClient.get('/global-markets/fx-rates', { params: { base } });
  return res.data;
}

// ── Watchlist ─────────────────────────────────────────────────────────────────

export async function getGlobalWatchlist(): Promise<{ items: WatchlistItem[]; count: number }> {
  const res = await apiClient.get('/global-markets/watchlist');
  return res.data;
}

export async function addToGlobalWatchlist(data: {
  symbol: string;
  exchange_code?: string;
  asset_type?: string;
  country_code?: string;
  currency?: string;
  display_name?: string;
  notes?: string;
}): Promise<{ id: string; symbol: string; added: boolean }> {
  const res = await apiClient.post('/global-markets/watchlist', data);
  return res.data;
}

export async function removeFromGlobalWatchlist(id: string): Promise<void> {
  await apiClient.delete(`/global-markets/watchlist/${id}`);
}

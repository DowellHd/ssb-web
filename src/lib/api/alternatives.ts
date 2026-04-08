import { apiClient } from '@/lib/api-client';

export interface AlternativeCategory {
  key: string;
  name: string;
  description: string;
}

export interface REIT {
  ticker: string;
  name: string;
  sector: string;
  type: 'etf' | 'reit';
}

export interface CommodityETF {
  ticker: string;
  name: string;
  category: string;
  commodity: string;
}

export interface AlternativeETF {
  ticker: string;
  name: string;
  category: string;
}

export interface CommodityPrice {
  symbol: string;
  name: string;
  unit: string;
  current_price: number | null;
  as_of: string | null;
  mom_change_pct: number | null;
  history: { date: string; value: number }[];
  _simulated?: boolean;
  disclaimer: string;
}

export interface AlternativeAllocation {
  target_alt_allocation_pct: number;
  alt_dollar_value: number;
  allocations: { category: string; weight_pct: number; dollar_value: number }[];
  disclaimer: string;
}

export interface AlternativePosition {
  id: string;
  category: string;
  name: string;
  ticker: string | null;
  value_usd: number | null;
  cost_basis_usd: number | null;
  allocation_pct: number | null;
  metadata: Record<string, unknown> | null;
  notes: string | null;
  created_at: string | null;
}

// ── Reference data ────────────────────────────────────────────────────────────

export async function listAlternativeCategories(): Promise<{ categories: AlternativeCategory[] }> {
  const res = await apiClient.get('/alternatives/categories');
  return res.data;
}

export async function listREITs(sector?: string): Promise<{ reits: REIT[]; count: number; sectors: string[] }> {
  const res = await apiClient.get('/alternatives/reits', { params: sector ? { sector } : undefined });
  return res.data;
}

export async function listCommodityETFs(category?: string): Promise<{ etfs: CommodityETF[]; count: number }> {
  const res = await apiClient.get('/alternatives/commodities/etfs', { params: category ? { category } : undefined });
  return res.data;
}

export async function getCommodityPrice(commodity: string): Promise<CommodityPrice> {
  const res = await apiClient.get(`/alternatives/commodities/price/${commodity}`);
  return res.data;
}

export async function listCommodities(): Promise<{ commodities: { symbol: string; name: string; unit: string }[] }> {
  const res = await apiClient.get('/alternatives/commodities');
  return res.data;
}

export async function listAlternativeETFs(category?: string): Promise<{ etfs: AlternativeETF[]; count: number }> {
  const res = await apiClient.get('/alternatives/etfs', { params: category ? { category } : undefined });
  return res.data;
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export async function getAlternativeAllocation(data: {
  target_alt_pct: number;
  portfolio_value: number;
  categories?: string[];
}): Promise<AlternativeAllocation> {
  const res = await apiClient.post('/alternatives/allocation', data);
  return res.data;
}

// ── Positions ─────────────────────────────────────────────────────────────────

export async function listAlternativePositions(): Promise<{ positions: AlternativePosition[]; count: number; total_value_usd: number }> {
  const res = await apiClient.get('/alternatives/positions');
  return res.data;
}

export async function addAlternativePosition(data: {
  name: string;
  category: string;
  ticker?: string;
  value_usd?: number;
  cost_basis_usd?: number;
  notes?: string;
}): Promise<AlternativePosition & { added: boolean }> {
  const res = await apiClient.post('/alternatives/positions', data);
  return res.data;
}

export async function removeAlternativePosition(id: string): Promise<void> {
  await apiClient.delete(`/alternatives/positions/${id}`);
}

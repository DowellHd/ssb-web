import { apiClient } from '@/lib/api-client';

export interface YieldPoint {
  maturity: string;
  yield_pct: number;
}

export interface YieldCurve {
  maturities: YieldPoint[];
  curve_shape: 'steep' | 'normal' | 'flat' | 'inverted';
  data_source: string;
  disclaimer: string;
}

export interface CreditSpreads {
  hy_spread: number;
  ig_spread: number;
  t10y2y: number;
  t10yie: number;
  hy_ig_differential: number;
  data_source: string;
  disclaimer: string;
}

export interface BondMetrics {
  face_value: number;
  coupon_rate_pct: number;
  years_to_maturity: number;
  current_price: number;
  ytm_pct: number;
  current_yield_pct: number;
  macaulay_duration_years: number;
  modified_duration: number;
  convexity: number;
  dv01: number;
  price_change_up50bp: number;
  price_change_down50bp: number;
  is_premium: boolean;
  is_discount: boolean;
  disclaimer: string;
}

export interface BondLadder {
  total_investment: number;
  rungs: number;
  avg_maturity_years: number;
  annual_income: number;
  annual_yield_pct: number;
  ladder: {
    rung: number;
    maturity_years: number;
    investment: number;
    annual_coupon: number;
    total_return_at_maturity: number;
  }[];
  disclaimer: string;
}

export interface BondETF {
  ticker: string;
  name: string;
  category: string;
  duration: string;
}

export interface BondPosition {
  id: string;
  bond_type: string;
  name: string;
  cusip: string | null;
  isin: string | null;
  face_value: number | null;
  coupon_rate: number | null;
  maturity_date: string | null;
  purchase_price: number | null;
  quantity: number | null;
  currency: string;
  credit_rating: string | null;
  notes: string | null;
  created_at: string | null;
}

// ── Market data ───────────────────────────────────────────────────────────────

export async function getYieldCurve(): Promise<YieldCurve> {
  const res = await apiClient.get('/fixed-income/yield-curve');
  return res.data;
}

export async function getCreditSpreads(): Promise<CreditSpreads> {
  const res = await apiClient.get('/fixed-income/credit-spreads');
  return res.data;
}

export async function getBondETFs(category?: string): Promise<{ etfs: BondETF[]; count: number; categories: string[] }> {
  const res = await apiClient.get('/fixed-income/etfs', { params: category ? { category } : undefined });
  return res.data;
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export async function analyzeBond(data: {
  face_value: number;
  coupon_rate: number;
  years_to_maturity: number;
  current_price: number;
  frequency?: number;
}): Promise<BondMetrics> {
  const res = await apiClient.post('/fixed-income/analyze', data);
  return res.data;
}

export async function buildBondLadder(data: {
  total_investment: number;
  rungs: number;
  first_maturity_years: number;
  final_maturity_years: number;
  avg_yield_pct: number;
}): Promise<BondLadder> {
  const res = await apiClient.post('/fixed-income/ladder', data);
  return res.data;
}

// ── Positions ─────────────────────────────────────────────────────────────────

export async function listBondPositions(): Promise<{ positions: BondPosition[]; count: number }> {
  const res = await apiClient.get('/fixed-income/positions');
  return res.data;
}

export async function addBondPosition(data: Partial<BondPosition> & { name: string; bond_type: string }): Promise<BondPosition & { added: boolean }> {
  const res = await apiClient.post('/fixed-income/positions', data);
  return res.data;
}

export async function removeBondPosition(id: string): Promise<void> {
  await apiClient.delete(`/fixed-income/positions/${id}`);
}

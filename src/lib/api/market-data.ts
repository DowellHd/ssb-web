import { apiClient } from '../api-client';

export interface OptionSnapshot {
  occ_symbol: string;
  symbol: string;
  expiry: string;
  right: 'call' | 'put';
  strike: number;
  bid: number | null;
  ask: number | null;
  mid: number | null;
  last: number | null;
  iv: number | null;
  delta: number | null;
  gamma: number | null;
  theta: number | null;
  vega: number | null;
  volume: number | null;
  open_interest: number | null;
}

export async function getOptionSnapshot(
  symbol: string,
  expiry: string,
  right: 'call' | 'put',
  strike: number,
): Promise<OptionSnapshot | null> {
  try {
    const res = await apiClient.get('/market-data/option/snapshot', {
      params: { symbol, expiry, right, strike },
    });
    return res.data;
  } catch {
    return null;
  }
}

export async function getOptionsChain(symbol: string, expiry: string): Promise<OptionSnapshot[]> {
  const res = await apiClient.get(`/market-data/option/chain/${symbol}`, {
    params: { expiry },
  });
  return res.data;
}

export async function getOptionExpirations(symbol: string): Promise<string[]> {
  const res = await apiClient.get(`/market-data/option/expirations/${symbol}`);
  return res.data;
}

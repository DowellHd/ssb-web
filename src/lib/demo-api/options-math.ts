/**
 * Black–Scholes helpers + deterministic option chain generation for demo mode.
 * Educational/simulated data only.
 */
import { getInstrument, lastPrice } from './market';
import { demoNow, hashString, isoDay, round } from './prng';

const RISK_FREE = 0.043;

function normPdf(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

/** Abramowitz–Stegun normal CDF approximation. */
function normCdf(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp((-x * x) / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - p : p;
}

export interface BsResult {
  price: number;
  delta: number;
  gamma: number;
  /** Per calendar day. */
  theta: number;
  /** Per 1 vol point. */
  vega: number;
}

export function blackScholes(
  spot: number,
  strike: number,
  years: number,
  iv: number,
  right: 'call' | 'put',
): BsResult {
  const T = Math.max(years, 1 / 365);
  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(spot / strike) + (RISK_FREE + (iv * iv) / 2) * T) / (iv * sqrtT);
  const d2 = d1 - iv * sqrtT;
  const disc = Math.exp(-RISK_FREE * T);

  const call = spot * normCdf(d1) - strike * disc * normCdf(d2);
  const price = right === 'call' ? call : call - spot + strike * disc;
  const delta = right === 'call' ? normCdf(d1) : normCdf(d1) - 1;
  const gamma = normPdf(d1) / (spot * iv * sqrtT);
  const thetaYear =
    (-spot * normPdf(d1) * iv) / (2 * sqrtT) -
    (right === 'call' ? 1 : -1) * RISK_FREE * strike * disc * normCdf(right === 'call' ? d2 : -d2);
  const vega = (spot * normPdf(d1) * sqrtT) / 100;

  return {
    price: Math.max(0.01, round(price)),
    delta: round(delta, 3),
    gamma: round(gamma, 4),
    theta: round(thetaYear / 365, 3),
    vega: round(vega, 3),
  };
}

/** Upcoming expirations: 4 weekly Fridays, then 4 monthly (third-Friday) dates. */
export function expirationsFor(_symbol: string): string[] {
  const out: string[] = [];
  const start = demoNow();
  const toFriday = (5 - start.getUTCDay() + 7) % 7 || 7;
  for (let w = 0; w < 4; w++) {
    out.push(isoDay(new Date(start.getTime() + (toFriday + 7 * w) * 86_400_000)));
  }
  for (let m = 1; m <= 5 && out.length < 9; m++) {
    const first = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + m, 1));
    const firstFri = (5 - first.getUTCDay() + 7) % 7;
    const third = new Date(first.getTime() + (firstFri + 14) * 86_400_000);
    const day = isoDay(third);
    if (!out.includes(day) && third.getTime() > start.getTime() + 21 * 86_400_000) out.push(day);
  }
  return out.sort();
}

export function strikeStep(price: number): number {
  if (price < 25) return 1;
  if (price < 100) return 2.5;
  if (price < 250) return 5;
  if (price < 600) return 10;
  return 20;
}

export function strikesAround(symbol: string, each = 10): number[] {
  const price = lastPrice(symbol);
  const step = strikeStep(price);
  const atm = Math.round(price / step) * step;
  const out: number[] = [];
  for (let i = -each; i <= each; i++) {
    const k = round(atm + i * step, 2);
    if (k > 0) out.push(k);
  }
  return out;
}

/** Implied vol with a mild smile/skew and term structure. */
export function impliedVol(symbol: string, strike: number, expiry: string, right: 'call' | 'put'): number {
  const inst = getInstrument(symbol);
  const spot = inst.price;
  const m = strike / spot - 1;
  const days = Math.max(1, (new Date(`${expiry}T00:00:00Z`).getTime() - demoNow().getTime()) / 86_400_000);
  const term = 1 + 0.12 * Math.exp(-days / 25);
  const smile = 1 + 1.6 * m * m + (m < 0 ? 0.35 * -m : 0.05 * m) + (right === 'put' && m < 0 ? 0.04 : 0);
  return round(Math.max(0.08, inst.vol * 1.05 * term * smile), 4);
}

export function occSymbol(symbol: string, expiry: string, right: 'call' | 'put', strike: number): string {
  const [y, m, d] = expiry.split('-');
  const root = symbol.replace('.', '').padEnd(6, ' ');
  return `${root}${y.slice(2)}${m}${d}${right === 'call' ? 'C' : 'P'}${String(Math.round(strike * 1000)).padStart(8, '0')}`;
}

export interface DemoOptionSnapshot {
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

export function optionSnapshot(
  symbol: string,
  expiry: string,
  right: 'call' | 'put',
  strike: number,
): DemoOptionSnapshot {
  const sym = symbol.toUpperCase();
  const spot = lastPrice(sym);
  const years = Math.max(1, (new Date(`${expiry}T00:00:00Z`).getTime() - demoNow().getTime()) / 86_400_000) / 365;
  const iv = impliedVol(sym, strike, expiry, right);
  const g = blackScholes(spot, strike, years, iv, right);
  const halfSpread = Math.max(0.01, g.price * 0.025);
  const h = hashString(`opt:${sym}:${expiry}:${right}:${strike}`);
  const atmness = Math.exp(-Math.pow(Math.log(strike / spot) * 12, 2));
  return {
    occ_symbol: occSymbol(sym, expiry, right, strike),
    symbol: sym,
    expiry,
    right,
    strike,
    bid: round(Math.max(0.01, g.price - halfSpread)),
    ask: round(g.price + halfSpread),
    mid: g.price,
    last: round(g.price * (0.99 + (h % 20) / 1000)),
    iv,
    delta: g.delta,
    gamma: g.gamma,
    theta: g.theta,
    vega: g.vega,
    volume: Math.floor((50 + (h % 4000)) * (0.2 + atmness)),
    open_interest: Math.floor((300 + ((h >>> 8) % 12000)) * (0.3 + atmness)),
  };
}

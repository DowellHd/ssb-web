/**
 * Single source of truth for demo prices.
 *
 * Quotes, historical bars, portfolio positions, paper trading and options all
 * read from here, so a symbol shows the same price everywhere in the app.
 * Series are deterministic: seeded by symbol, rescaled so the last close equals
 * the instrument's current price.
 */
import { gaussian, hashString, round, seededRng, demoNow, clamp } from './prng';

export interface Instrument {
  symbol: string;
  name: string;
  sector: string;
  assetClass: 'equity' | 'etf' | 'bond_etf' | 'commodity_etf';
  price: number;
  /** Annualised volatility (decimal). */
  vol: number;
  beta: number;
  /** Annualised drift used when synthesising history. */
  drift: number;
}

const I = (
  symbol: string,
  name: string,
  sector: string,
  price: number,
  vol: number,
  beta: number,
  assetClass: Instrument['assetClass'] = 'equity',
  drift = 0.1,
): Instrument => ({ symbol, name, sector, assetClass, price, vol, beta, drift });

export const UNIVERSE: Instrument[] = [
  I('AAPL', 'Apple Inc.', 'Technology', 232.15, 0.26, 1.2),
  I('MSFT', 'Microsoft Corporation', 'Technology', 441.3, 0.24, 0.95),
  I('GOOGL', 'Alphabet Inc.', 'Communication Services', 178.62, 0.28, 1.05),
  I('AMZN', 'Amazon.com, Inc.', 'Consumer Discretionary', 201.84, 0.3, 1.15),
  I('NVDA', 'NVIDIA Corporation', 'Technology', 138.9, 0.5, 1.7, 'equity', 0.35),
  I('META', 'Meta Platforms, Inc.', 'Communication Services', 585.2, 0.36, 1.2),
  I('TSLA', 'Tesla, Inc.', 'Consumer Discretionary', 251.4, 0.58, 2.0, 'equity', 0.05),
  I('AMD', 'Advanced Micro Devices, Inc.', 'Technology', 142.75, 0.5, 1.7),
  I('NFLX', 'Netflix, Inc.', 'Communication Services', 702.1, 0.34, 1.25),
  I('CRM', 'Salesforce, Inc.', 'Technology', 336.2, 0.3, 1.2),
  I('ORCL', 'Oracle Corporation', 'Technology', 178.9, 0.28, 1.0),
  I('INTC', 'Intel Corporation', 'Technology', 22.85, 0.42, 1.0, 'equity', -0.05),
  I('PLTR', 'Palantir Technologies Inc.', 'Technology', 74.1, 0.62, 2.1, 'equity', 0.3),
  I('COIN', 'Coinbase Global, Inc.', 'Financials', 268.3, 0.7, 2.6),
  I('JPM', 'JPMorgan Chase & Co.', 'Financials', 243.65, 0.2, 1.05),
  I('BAC', 'Bank of America Corporation', 'Financials', 44.1, 0.24, 1.3),
  I('V', 'Visa Inc.', 'Financials', 307.2, 0.19, 0.95),
  I('MA', 'Mastercard Incorporated', 'Financials', 521.3, 0.2, 1.0),
  I('BRK.B', 'Berkshire Hathaway Inc.', 'Financials', 468.5, 0.16, 0.85),
  I('UNH', 'UnitedHealth Group Incorporated', 'Health Care', 524.7, 0.24, 0.6),
  I('JNJ', 'Johnson & Johnson', 'Health Care', 156.3, 0.15, 0.55),
  I('PFE', 'Pfizer Inc.', 'Health Care', 26.9, 0.22, 0.6, 'equity', -0.02),
  I('KO', 'The Coca-Cola Company', 'Consumer Staples', 62.4, 0.14, 0.55),
  I('PEP', 'PepsiCo, Inc.', 'Consumer Staples', 148.9, 0.15, 0.55),
  I('PG', 'The Procter & Gamble Company', 'Consumer Staples', 169.2, 0.14, 0.5),
  I('WMT', 'Walmart Inc.', 'Consumer Staples', 92.3, 0.17, 0.5),
  I('COST', 'Costco Wholesale Corporation', 'Consumer Staples', 931.8, 0.2, 0.8),
  I('HD', 'The Home Depot, Inc.', 'Consumer Discretionary', 398.4, 0.2, 1.0),
  I('DIS', 'The Walt Disney Company', 'Communication Services', 112.6, 0.26, 1.2),
  I('XOM', 'Exxon Mobil Corporation', 'Energy', 118.2, 0.22, 0.9),
  I('CVX', 'Chevron Corporation', 'Energy', 158.4, 0.21, 0.9),
  I('SPY', 'SPDR S&P 500 ETF Trust', 'Broad Market', 588.45, 0.14, 1.0, 'etf'),
  I('QQQ', 'Invesco QQQ Trust', 'Broad Market', 505.3, 0.19, 1.15, 'etf'),
  I('IWM', 'iShares Russell 2000 ETF', 'Broad Market', 224.6, 0.22, 1.2, 'etf'),
  I('DIA', 'SPDR Dow Jones Industrial Average ETF', 'Broad Market', 431.2, 0.13, 0.9, 'etf'),
  I('VTI', 'Vanguard Total Stock Market ETF', 'Broad Market', 281.9, 0.14, 1.0, 'etf'),
  I('VXUS', 'Vanguard Total International Stock ETF', 'International', 62.1, 0.15, 0.85, 'etf', 0.06),
  I('XLK', 'Technology Select Sector SPDR Fund', 'Technology', 233.1, 0.21, 1.2, 'etf'),
  I('XLF', 'Financial Select Sector SPDR Fund', 'Financials', 49.2, 0.17, 1.1, 'etf'),
  I('XLE', 'Energy Select Sector SPDR Fund', 'Energy', 91.8, 0.22, 0.95, 'etf', 0.04),
  I('XLV', 'Health Care Select Sector SPDR Fund', 'Health Care', 142.5, 0.14, 0.7, 'etf'),
  I('TLT', 'iShares 20+ Year Treasury Bond ETF', 'Fixed Income', 91.35, 0.14, -0.2, 'bond_etf', 0.0),
  I('BND', 'Vanguard Total Bond Market ETF', 'Fixed Income', 72.4, 0.05, 0.05, 'bond_etf', 0.02),
  I('HYG', 'iShares iBoxx $ High Yield Corporate Bond ETF', 'Fixed Income', 79.6, 0.07, 0.35, 'bond_etf', 0.03),
  I('GLD', 'SPDR Gold Shares', 'Commodities', 247.8, 0.15, 0.05, 'commodity_etf', 0.12),
  I('SLV', 'iShares Silver Trust', 'Commodities', 28.4, 0.28, 0.3, 'commodity_etf', 0.08),
  I('USO', 'United States Oil Fund', 'Commodities', 72.8, 0.32, 0.8, 'commodity_etf', 0.0),
];

const BY_SYMBOL = new Map(UNIVERSE.map((i) => [i.symbol, i]));

/**
 * Look up an instrument. Unknown symbols get a deterministic synthetic profile
 * so a user typing any ticker still sees stable, plausible data.
 */
export function getInstrument(symbol: string): Instrument {
  const sym = symbol.toUpperCase();
  const known = BY_SYMBOL.get(sym);
  if (known) return known;
  const h = hashString(`instrument:${sym}`);
  const price = round(18 + (h % 38000) / 100, 2);
  const synth: Instrument = {
    symbol: sym,
    name: `${sym} (demo instrument)`,
    sector: 'Other',
    assetClass: 'equity',
    price,
    vol: round(0.2 + ((h >>> 8) % 30) / 100, 2),
    beta: round(0.7 + ((h >>> 16) % 70) / 100, 2),
    drift: 0.08,
  };
  BY_SYMBOL.set(sym, synth);
  return synth;
}

export interface DailyBar {
  /** Unix seconds, 00:00 UTC. */
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * Seed for the synthetic price paths. Current prices are fixed (see UNIVERSE);
 * this only chooses *how the history got there*, so the demo's charts, paper
 * account and P&L tell a coherent, presentable story. Any integer works.
 */
export const SERIES_SEED = 1;

const barCache = new Map<string, DailyBar[]>();

function isWeekend(d: Date): boolean {
  const dow = d.getUTCDay();
  return dow === 0 || dow === 6;
}

/**
 * `count` daily bars ending on the most recent trading day, oldest first.
 * The final close equals `getInstrument(symbol).price`.
 */
export function dailyBars(symbol: string, count = 252): DailyBar[] {
  const sym = symbol.toUpperCase();
  const dayKey = Math.floor(demoNow().getTime() / 86_400_000);
  const cacheKey = `${sym}:${count}:${dayKey}`;
  const cached = barCache.get(cacheKey);
  if (cached) return cached;

  const inst = getInstrument(sym);
  const rng = seededRng(`bars:${sym}:${SERIES_SEED}`);

  // Trading days, newest first.
  const dates: Date[] = [];
  let cursor = demoNow();
  while (dates.length < count) {
    if (!isWeekend(cursor)) dates.push(cursor);
    cursor = new Date(cursor.getTime() - 86_400_000);
  }
  dates.reverse();

  const dailyVol = inst.vol / Math.sqrt(252);
  const dailyDrift = inst.drift / 252;
  // Log-price path; the series is *index-seeded from the end* so a longer
  // request is a superset of a shorter one.
  const rets: number[] = [];
  for (let i = 0; i < count; i++) rets.push(dailyDrift + dailyVol * gaussian(rng));
  rets.reverse(); // rets[0] = most recent day
  const logFromEnd: number[] = [0];
  for (let i = 1; i < count; i++) logFromEnd.push(logFromEnd[i - 1] - rets[i - 1]);
  logFromEnd.reverse(); // oldest first, last = 0

  const bars: DailyBar[] = dates.map((d, i) => {
    const close = inst.price * Math.exp(logFromEnd[i]);
    const prevClose = i === 0 ? close * Math.exp(-rets[count - 1]) : inst.price * Math.exp(logFromEnd[i - 1]);
    const open = prevClose * (1 + (rng() - 0.5) * dailyVol * 0.6);
    const range = Math.abs(close - open) + close * dailyVol * (0.25 + rng() * 0.6);
    const high = Math.max(open, close) + range * rng() * 0.6;
    const low = Math.min(open, close) - range * rng() * 0.6;
    const volBase = 2_000_000 + (hashString(`vol:${sym}`) % 30_000_000);
    const volume = Math.floor(volBase * (0.6 + rng() * 0.9) * (1 + Math.abs(close - prevClose) / prevClose * 12));
    return {
      time: Math.floor(d.getTime() / 1000),
      open: round(open),
      high: round(high),
      low: round(Math.max(0.01, low)),
      close: i === count - 1 ? inst.price : round(close),
      volume,
    };
  });

  barCache.set(cacheKey, bars);
  return bars;
}

export function lastPrice(symbol: string): number {
  return getInstrument(symbol).price;
}

export function previousClose(symbol: string): number {
  const bars = dailyBars(symbol, 5);
  return bars[bars.length - 2].close;
}

export function dayChange(symbol: string): { change: number; changePct: number } {
  const last = lastPrice(symbol);
  const prev = previousClose(symbol);
  return { change: round(last - prev), changePct: round(((last - prev) / prev) * 100, 2) };
}

/** Return over the last `days` trading days, as a percentage. */
export function periodReturnPct(symbol: string, days: number): number {
  const bars = dailyBars(symbol, Math.max(days + 1, 6));
  const start = bars[bars.length - 1 - days]?.close ?? bars[0].close;
  return round(((lastPrice(symbol) - start) / start) * 100, 2);
}

export function simpleMovingAverage(symbol: string, window: number): number {
  const bars = dailyBars(symbol, Math.max(window, 252));
  const slice = bars.slice(-window);
  return round(slice.reduce((s, b) => s + b.close, 0) / slice.length);
}

export interface DemoQuote {
  symbol: string;
  bid_price: number;
  ask_price: number;
  bid_size: number;
  ask_size: number;
  timestamp: string;
}

export function quoteFor(symbol: string): DemoQuote {
  const sym = symbol.toUpperCase();
  const mid = lastPrice(sym);
  const spread = clamp(mid * 0.0004, 0.01, 0.35);
  const h = hashString(`quote:${sym}`);
  return {
    symbol: sym,
    bid_price: round(mid - spread / 2),
    ask_price: round(mid + spread / 2),
    bid_size: 100 + (h % 900),
    ask_size: 100 + ((h >>> 10) % 900),
    timestamp: demoNow().toISOString(),
  };
}

/** Annualised correlation proxy between two symbols (deterministic). */
export function correlation(a: string, b: string): number {
  if (a === b) return 1;
  const A = getInstrument(a);
  const B = getInstrument(b);
  let base = 0.25;
  if (A.sector === B.sector) base = 0.62;
  else if (A.assetClass === 'bond_etf' || B.assetClass === 'bond_etf')
    base = A.assetClass === B.assetClass ? 0.7 : -0.1;
  else if (A.assetClass === 'commodity_etf' || B.assetClass === 'commodity_etf') base = 0.08;
  else if (A.assetClass === 'etf' || B.assetClass === 'etf') base = 0.7;
  const jitter = ((hashString([a, b].sort().join('|')) % 200) - 100) / 1000; // ±0.1
  return round(clamp(base + jitter, -0.6, 0.95), 2);
}

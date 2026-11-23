/**
 * Sample fundamentals for the demo universe.
 *
 * These are synthetic, round-number figures chosen so each of the screener's
 * preset screens (value, growth, quality, dividend) returns a handful of
 * plausible matches. They are NOT real company financials and the API reports
 * them as `data_source: 'sample'`.
 */
import { dailyBars, getInstrument, lastPrice, UNIVERSE } from './market';
import { hashString, round } from './prng';

/** symbol, market cap ($B), P/E, fwd P/E, P/B, P/S, EV/EBITDA, div yield, ROE, ROA, net margin, op margin, revenue growth, earnings growth, debt/equity */
type Row = [string, number, number, number, number, number, number, number, number, number, number, number, number, number, number];

const ROWS: Row[] = [
  ['AAPL', 3500, 36.5, 31, 52, 8.9, 26, 0.0045, 1.45, 0.22, 0.26, 0.31, 0.06, 0.1, 1.9],
  ['MSFT', 3280, 35, 30, 11.5, 12.6, 24, 0.007, 0.36, 0.18, 0.36, 0.45, 0.14, 0.15, 0.33],
  ['GOOGL', 2190, 24.5, 21, 6.8, 6.4, 15, 0.004, 0.3, 0.17, 0.27, 0.32, 0.13, 0.28, 0.08],
  ['AMZN', 2120, 41, 32, 8, 3.4, 18, 0, 0.22, 0.08, 0.09, 0.11, 0.11, 0.55, 0.55],
  ['NVDA', 3420, 52, 34, 45, 27, 42, 0.0003, 1.15, 0.65, 0.55, 0.62, 1.2, 1.4, 0.17],
  ['META', 1480, 27.5, 23, 8.8, 9.5, 17, 0.003, 0.38, 0.2, 0.35, 0.42, 0.2, 0.45, 0.3],
  ['TSLA', 810, 70, 80, 14, 8.5, 55, 0, 0.21, 0.08, 0.1, 0.08, 0.02, -0.04, 0.17],
  ['AMD', 231, 100, 38, 4, 8, 42, 0, 0.04, 0.03, 0.05, 0.07, 0.14, 0.3, 0.05],
  ['NFLX', 300, 45, 38, 15, 9.6, 33, 0, 0.4, 0.15, 0.22, 0.27, 0.15, 0.55, 0.75],
  ['CRM', 325, 52, 28, 5, 8.4, 28, 0.0045, 0.1, 0.06, 0.16, 0.2, 0.09, 0.4, 0.22],
  ['ORCL', 495, 38, 26, 22, 9, 24, 0.008, 1.2, 0.08, 0.21, 0.3, 0.07, 0.15, 5.5],
  ['INTC', 99, 14, 18, 0.9, 1.9, 12, 0.02, 0.02, 0.01, 0.02, 0.01, -0.02, -0.3, 0.45],
  ['PLTR', 170, 160, 110, 24, 55, 130, 0, 0.15, 0.1, 0.16, 0.12, 0.3, 1, 0.05],
  ['COIN', 67, 28, 30, 7, 9.5, 20, 0, 0.27, 0.09, 0.3, 0.35, 0.55, 2, 0.45],
  ['JPM', 690, 12.5, 12.2, 1.9, 4, 9, 0.021, 0.17, 0.013, 0.33, 0.42, 0.08, 0.1, 1.3],
  ['BAC', 345, 13.8, 11.9, 1.2, 3.2, 10, 0.024, 0.09, 0.009, 0.28, 0.35, 0.03, 0.08, 1.1],
  ['V', 595, 31, 26, 14, 16, 25, 0.007, 0.5, 0.2, 0.52, 0.67, 0.1, 0.12, 0.55],
  ['MA', 480, 36, 30, 60, 17, 28, 0.005, 1.8, 0.24, 0.46, 0.59, 0.12, 0.14, 2.3],
  ['BRK.B', 1010, 15.8, 22, 1.6, 2.8, 10, 0, 0.1, 0.06, 0.17, 0.2, 0.05, 0.08, 0.22],
  ['UNH', 485, 21, 16.5, 5, 1.3, 14, 0.016, 0.26, 0.08, 0.06, 0.08, 0.08, 0.09, 0.77],
  ['JNJ', 376, 22, 15, 5.2, 4.1, 14, 0.032, 0.22, 0.08, 0.19, 0.25, 0.05, 0.1, 0.55],
  ['PFE', 152, 12.5, 8.5, 1.4, 2.4, 9, 0.062, 0.09, 0.04, 0.07, 0.12, 0.02, 0.05, 0.75],
  ['KO', 269, 24.5, 22, 10.5, 6, 20, 0.031, 0.42, 0.11, 0.23, 0.3, 0.03, 0.05, 1.6],
  ['PEP', 204, 20, 16.5, 10.5, 2.3, 14, 0.033, 0.55, 0.08, 0.1, 0.14, 0.02, 0.06, 2.4],
  ['PG', 397, 26, 23, 7.5, 4.7, 18, 0.025, 0.32, 0.12, 0.18, 0.24, 0.03, 0.06, 0.65],
  ['WMT', 742, 36, 30, 8.6, 1.1, 18, 0.009, 0.21, 0.08, 0.03, 0.04, 0.05, 0.08, 0.6],
  ['COST', 413, 52, 48, 15.5, 1.6, 31, 0.005, 0.3, 0.09, 0.03, 0.04, 0.08, 0.1, 0.38],
  ['HD', 396, 25, 22, 29, 2.5, 17, 0.022, 2.9, 0.17, 0.1, 0.13, 0.01, -0.02, 4.5],
  ['DIS', 204, 33, 18, 1.9, 2.3, 15, 0.008, 0.06, 0.03, 0.09, 0.13, 0.04, 0.18, 0.42],
  ['XOM', 520, 13.8, 14, 1.9, 1.5, 7, 0.034, 0.14, 0.08, 0.1, 0.14, -0.03, -0.1, 0.15],
  ['CVX', 290, 15.5, 14, 1.7, 1.4, 8, 0.042, 0.11, 0.06, 0.09, 0.12, -0.02, -0.12, 0.14],
];

export interface Fundamentals {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  pe_ratio: number;
  forward_pe: number;
  pb_ratio: number;
  ps_ratio: number;
  ev_ebitda: number;
  eps: number;
  dividend_yield: number;
  roe: number;
  roa: number;
  net_margin: number;
  operating_margin: number;
  revenue_growth_yoy: number;
  earnings_growth_yoy: number;
  /** $ billions. */
  market_cap: number;
  debt_to_equity: number;
  beta: number;
  analyst_target_price: number;
  week_52_high: number;
  week_52_low: number;
}

const INDUSTRY: Record<string, string> = {
  Technology: 'Software & Hardware',
  Financials: 'Banks & Payments',
  'Health Care': 'Pharma & Services',
  'Consumer Staples': 'Packaged Goods & Retail',
  'Consumer Discretionary': 'Retail & Autos',
  'Communication Services': 'Media & Internet',
  Energy: 'Integrated Oil & Gas',
};

function build(row: Row): Fundamentals {
  const [symbol, cap, pe, fpe, pb, ps, ev, dy, roe, roa, nm, om, rg, eg, de] = row;
  const inst = getInstrument(symbol);
  const price = lastPrice(symbol);
  const bars = dailyBars(symbol, 252);
  const hi = Math.max(...bars.map((b) => b.high));
  const lo = Math.min(...bars.map((b) => b.low));
  const target = 1.04 + (hashString(`tgt:${symbol}`) % 18) / 100;
  return {
    symbol,
    name: inst.name,
    sector: inst.sector,
    industry: INDUSTRY[inst.sector] ?? inst.sector,
    pe_ratio: pe,
    forward_pe: fpe,
    pb_ratio: pb,
    ps_ratio: ps,
    ev_ebitda: ev,
    eps: round(price / pe, 2),
    dividend_yield: dy,
    roe,
    roa,
    net_margin: nm,
    operating_margin: om,
    revenue_growth_yoy: rg,
    earnings_growth_yoy: eg,
    market_cap: cap,
    debt_to_equity: de,
    beta: inst.beta,
    analyst_target_price: round(price * target),
    week_52_high: round(hi),
    week_52_low: round(lo),
  };
}

const cache = new Map<string, Fundamentals>();
const TABLE = new Map(ROWS.map((r) => [r[0], r]));

/** Fundamentals for any symbol: curated rows where available, else a stable synthetic profile. */
export function fundamentalsFor(symbol: string): Fundamentals {
  const sym = symbol.toUpperCase();
  const hit = cache.get(sym);
  if (hit) return hit;
  let row = TABLE.get(sym);
  if (!row) {
    const h = hashString(`fund:${sym}`);
    const pe = 10 + (h % 300) / 10;
    row = [sym, 5 + (h % 4000) / 10, pe, pe * 0.85, 0.8 + ((h >>> 4) % 120) / 10, 0.8 + ((h >>> 8) % 100) / 10, 5 + ((h >>> 12) % 250) / 10, ((h >>> 16) % 50) / 1000, 0.04 + ((h >>> 20) % 300) / 1000, 0.02 + ((h >>> 22) % 150) / 1000, 0.02 + ((h >>> 24) % 300) / 1000, 0.04 + ((h >>> 26) % 300) / 1000, ((h >>> 27) % 300) / 1000 - 0.05, ((h >>> 28) % 400) / 1000 - 0.1, 0.1 + ((h >>> 3) % 20) / 10];
  }
  const f = build(row);
  cache.set(sym, f);
  return f;
}

/** The default screening universe: every large-cap equity in the demo market. */
export const SCREEN_UNIVERSE: string[] = ROWS.map((r) => r[0]).filter((s) => UNIVERSE.some((u) => u.symbol === s));

export const SCREEN_FIELDS: Record<string, string> = {
  pe_ratio: 'P/E Ratio',
  forward_pe: 'Forward P/E',
  pb_ratio: 'P/B Ratio',
  ps_ratio: 'P/S Ratio',
  ev_ebitda: 'EV/EBITDA',
  dividend_yield: 'Dividend Yield',
  roe: 'Return on Equity',
  roa: 'Return on Assets',
  net_margin: 'Net Margin',
  operating_margin: 'Operating Margin',
  revenue_growth_yoy: 'Revenue Growth YoY',
  earnings_growth_yoy: 'Earnings Growth YoY',
  debt_to_equity: 'Debt / Equity',
  market_cap: 'Market Cap ($B)',
  beta: 'Beta',
  eps: 'EPS',
};

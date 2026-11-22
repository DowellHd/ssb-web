/**
 * Portfolio analytics for demo mode — real calculations over the deterministic
 * price series, so results respond to whatever holdings the page sends.
 * Educational illustration only.
 */
import { correlation, dailyBars, getInstrument, periodReturnPct } from './market';
import { clamp, hashString, round } from './prng';

export interface Weighted {
  symbol: string;
  /** Fraction of the portfolio (0–1). */
  weight: number;
}

export function normalizeWeights<T extends Weighted>(holdings: T[]): T[] {
  const total = holdings.reduce((s, h) => s + h.weight, 0) || 1;
  return holdings.map((h) => ({ ...h, weight: h.weight / total }));
}

// ── Return series ───────────────────────────────────────────────────────────

function dailyReturns(symbol: string, days: number): number[] {
  const bars = dailyBars(symbol, days + 1);
  const out: number[] = [];
  for (let i = 1; i < bars.length; i++) out.push(bars[i].close / bars[i - 1].close - 1);
  return out;
}

/** Weighted portfolio daily returns (rebalanced daily). */
export function portfolioReturns(holdings: Weighted[], days = 252): number[] {
  const w = normalizeWeights(holdings);
  const series = w.map((h) => dailyReturns(h.symbol, days));
  return Array.from({ length: days }, (_, t) => w.reduce((s, h, i) => s + h.weight * series[i][t], 0));
}

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
const stdev = (xs: number[]) => {
  const m = mean(xs);
  return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / Math.max(1, xs.length - 1));
};

export interface RiskStats {
  volatilityAnnual: number;
  var95Pct: number;
  cvar95Pct: number;
  maxDrawdown: number;
  beta: number;
  sharpe: number;
  sortino: number;
}

export function riskStats(holdings: Weighted[], benchmark = 'SPY'): RiskStats {
  const r = portfolioReturns(holdings);
  const b = dailyReturns(benchmark, r.length);
  const sd = stdev(r);
  const mb = mean(b);
  const mr = mean(r);
  const cov = r.reduce((s, x, i) => s + (x - mr) * (b[i] - mb), 0) / (r.length - 1);
  const varB = stdev(b) ** 2;

  // Historical VaR/CVaR at 95%.
  const sorted = [...r].sort((a, c) => a - c);
  const cut = Math.max(1, Math.floor(sorted.length * 0.05));
  const var95 = -sorted[cut];
  const cvar95 = -mean(sorted.slice(0, cut));

  let peak = 1;
  let level = 1;
  let maxDd = 0;
  for (const x of r) {
    level *= 1 + x;
    peak = Math.max(peak, level);
    maxDd = Math.max(maxDd, (peak - level) / peak);
  }

  const downside = stdev(r.filter((x) => x < 0));
  const rf = 0.043 / 252;
  return {
    volatilityAnnual: round(sd * Math.sqrt(252), 4),
    var95Pct: round(var95 * 100, 2),
    cvar95Pct: round(cvar95 * 100, 2),
    maxDrawdown: round(maxDd, 4),
    beta: round(cov / varB, 2),
    sharpe: round(((mr - rf) / sd) * Math.sqrt(252), 2),
    sortino: round(((mr - rf) / (downside || sd)) * Math.sqrt(252), 2),
  };
}

// ── Correlation ─────────────────────────────────────────────────────────────

export function correlationMatrix(symbols: string[]): Record<string, Record<string, number>> {
  const out: Record<string, Record<string, number>> = {};
  for (const a of symbols) {
    out[a] = {};
    for (const b of symbols) out[a][b] = correlation(a, b);
  }
  return out;
}

export function averageOffDiagonal(m: Record<string, Record<string, number>>): number {
  const keys = Object.keys(m);
  let sum = 0;
  let n = 0;
  for (const a of keys) for (const b of keys) if (a !== b) { sum += m[a][b]; n++; }
  return n ? sum / n : 0;
}

// ── Stress scenarios ────────────────────────────────────────────────────────

interface Scenario {
  name: string;
  description: string;
  /** Broad equity market move (decimal). */
  market: number;
  bond: number;
  commodity: number;
  /** Extra move for a sector on top of beta × market. */
  sector: Record<string, number>;
}

export const SCENARIOS: Scenario[] = [
  {
    name: '2008 Financial Crisis',
    description: 'Peak-to-trough move from Oct 2007 to Mar 2009: credit freeze and bank failures.',
    market: -0.5,
    bond: 0.22,
    commodity: 0.05,
    sector: { Financials: -0.3, 'Consumer Discretionary': -0.08, Energy: -0.05, 'Health Care': 0.1, 'Consumer Staples': 0.12 },
  },
  {
    name: 'COVID-19 Crash',
    description: 'Feb–Mar 2020: fastest 30% decline on record as the pandemic hit.',
    market: -0.34,
    bond: 0.08,
    commodity: -0.02,
    sector: { Energy: -0.25, Financials: -0.08, Technology: 0.06, 'Health Care': 0.06, 'Communication Services': 0.03 },
  },
  {
    name: '2022 Rate Shock',
    description: 'Aggressive tightening cycle: long-duration assets and bonds fell together.',
    market: -0.25,
    bond: -0.31,
    commodity: 0.04,
    sector: { Technology: -0.1, 'Communication Services': -0.08, Energy: 0.55, 'Consumer Staples': 0.15, 'Health Care': 0.12 },
  },
  {
    name: 'Dot-Com Bust',
    description: '2000–2002: valuation collapse concentrated in technology and communications.',
    market: -0.45,
    bond: 0.25,
    commodity: 0.0,
    sector: { Technology: -0.3, 'Communication Services': -0.25, 'Consumer Staples': 0.25, 'Health Care': 0.2, Energy: 0.1 },
  },
  {
    name: 'Black Monday (1987)',
    description: 'One-day crash of about 20% driven by portfolio insurance and program trading.',
    market: -0.2,
    bond: 0.02,
    commodity: 0.0,
    sector: {},
  },
  {
    name: 'Oil Price Shock',
    description: 'Sudden supply disruption: energy surges while consumers and transports suffer.',
    market: -0.12,
    bond: 0.03,
    commodity: 0.3,
    sector: { Energy: 0.35, 'Consumer Discretionary': -0.1, Technology: -0.02 },
  },
];

export function holdingImpact(symbol: string, sc: Scenario): number {
  const inst = getInstrument(symbol);
  if (inst.assetClass === 'bond_etf') return clamp(sc.bond * (symbol === 'TLT' ? 1 : 0.4), -0.6, 0.6);
  if (inst.assetClass === 'commodity_etf') return clamp(sc.commodity, -0.6, 0.6);
  return clamp(inst.beta * sc.market + (sc.sector[inst.sector] ?? 0), -0.95, 1);
}

export function stressTest(holdings: Weighted[], portfolioValue: number) {
  const w = normalizeWeights(holdings);
  const results = SCENARIOS.map((sc) => {
    const impacts = w.map((h) => ({ symbol: h.symbol, impact: holdingImpact(h.symbol, sc) }));
    const portfolio = impacts.reduce((s, x, i) => s + x.impact * w[i].weight, 0);
    const none = { symbol: '—', impact: 0 };
    const worst = impacts.reduce((a, b) => (b.impact < a.impact ? b : a), impacts[0] ?? none);
    const best = impacts.reduce((a, b) => (b.impact > a.impact ? b : a), impacts[0] ?? none);
    return {
      scenario: sc.name,
      description: sc.description,
      portfolio_impact_pct: round(portfolio * 100, 1),
      portfolio_impact_usd: round(portfolio * portfolioValue, 0),
      worst_holding: worst.symbol,
      best_holding: best.symbol,
    };
  }).sort((a, b) => a.portfolio_impact_pct - b.portfolio_impact_pct);
  return { scenarios: results, max_drawdown_scenario: results[0].scenario };
}

// ── Attribution (Brinson–Fachler, single period) ────────────────────────────

/** Approximate S&P 500 sector weights. */
const BENCH_SECTORS: Record<string, number> = {
  Technology: 0.31,
  Financials: 0.13,
  'Health Care': 0.11,
  'Consumer Discretionary': 0.105,
  'Communication Services': 0.09,
  Industrials: 0.085,
  'Consumer Staples': 0.06,
  Energy: 0.035,
  Utilities: 0.025,
  'Real Estate': 0.023,
  Materials: 0.02,
};

const canonicalSector = (s?: string) => {
  if (!s) return 'Other';
  const t = s.toLowerCase();
  if (t.startsWith('health')) return 'Health Care';
  if (t.includes('consumer disc')) return 'Consumer Discretionary';
  if (t.includes('consumer stap')) return 'Consumer Staples';
  if (t.includes('communic')) return 'Communication Services';
  return s;
};

export function attribution(
  holdings: Array<Weighted & { sector?: string; return_pct?: number }>,
  benchmarkSymbol: string,
  periodDays: number,
) {
  const tradingDays = Math.max(1, Math.round((periodDays * 5) / 7));
  const w = normalizeWeights(holdings);

  const bySector = new Map<string, { w: number; r: number }>();
  for (const h of w) {
    const sector = canonicalSector(h.sector ?? getInstrument(h.symbol).sector);
    const ret = h.return_pct ?? periodReturnPct(h.symbol, tradingDays) / 100;
    const cur = bySector.get(sector) ?? { w: 0, r: 0 };
    const nw = cur.w + h.weight;
    bySector.set(sector, { w: nw, r: nw ? (cur.r * cur.w + ret * h.weight) / nw : 0 });
  }

  const benchTotal = periodReturnPct(benchmarkSymbol, tradingDays) / 100;
  const sectors = new Set([...Object.keys(BENCH_SECTORS), ...bySector.keys()]);

  // Benchmark sector returns: market return ± a stable sector-specific tilt.
  const benchSectorReturn = (sector: string) =>
    benchTotal + (((hashString(`bsr:${sector}:${tradingDays}`) % 600) - 300) / 10000);

  let alloc = 0;
  let select = 0;
  let inter = 0;
  let portReturn = 0;
  let benchReturn = 0;
  const rows = [...sectors].map((sector) => {
    const wp = bySector.get(sector)?.w ?? 0;
    const rp = bySector.get(sector)?.r ?? 0;
    const wb = BENCH_SECTORS[sector] ?? 0;
    const rb = benchSectorReturn(sector);
    portReturn += wp * rp;
    benchReturn += wb * rb;
    return { sector, wp, rp, wb, rb };
  });
  const rbTotal = benchReturn;
  // Effects are summed over *every* sector so they reconcile exactly with the
  // active return; only the displayed rows are filtered.
  const detailed = rows.map((r) => {
    const a = (r.wp - r.wb) * (r.rb - rbTotal);
    const s = r.wb * (r.rp - r.rb);
    const i = (r.wp - r.wb) * (r.rp - r.rb);
    alloc += a;
    select += s;
    inter += i;
    return { r, a, s, i };
  });
  const out = detailed
    .filter(({ r }) => r.wp > 0 || r.wb >= 0.05)
    .map(({ r, a, s, i }) => ({
      sector: r.sector,
      portfolio_weight: round(r.wp, 4),
      benchmark_weight: round(r.wb, 4),
      portfolio_return: round(r.rp, 4),
      benchmark_return: round(r.rb, 4),
      allocation_effect: round(a, 4),
      selection_effect: round(s, 4),
      total_effect: round(a + s + i, 4),
    }))
    .sort((a, b) => Math.abs(b.total_effect) - Math.abs(a.total_effect));

  return {
    portfolio_return: round(portReturn, 4),
    benchmark_return: round(benchReturn, 4),
    active_return: round(portReturn - benchReturn, 4),
    allocation_effect: round(alloc, 4),
    selection_effect: round(select, 4),
    interaction_effect: round(inter, 4),
    sector_attribution: out,
  };
}


/**
 * Quantitative building blocks for the analytics and predictive mocks: moments,
 * OLS regression, a sampled efficient frontier, technical indicators, Monte
 * Carlo paths, GARCH(1,1) filtering. Everything is deterministic and computed
 * from the shared price series, so results respond to the inputs.
 */
import { dailyReturns } from './analytics';
import { dailyBars } from './market';
import { gaussian, round, type Rng } from './prng';

export const TRADING_DAYS = 252;
export const RISK_FREE = 0.043;

export const mean = (xs: number[]): number => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
export const stdev = (xs: number[]): number => {
  const m = mean(xs);
  return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / Math.max(1, xs.length - 1));
};
export const covariance = (a: number[], b: number[]): number => {
  const ma = mean(a);
  const mb = mean(b);
  let s = 0;
  for (let i = 0; i < a.length; i++) s += (a[i] - ma) * (b[i] - mb);
  return s / Math.max(1, a.length - 1);
};

/** Last `days` simple daily returns for a symbol, oldest first. */
export const returnsOf = (symbol: string, days = TRADING_DAYS): number[] => dailyReturns(symbol.toUpperCase(), days);

export function maxDrawdown(returns: number[]): number {
  let level = 1;
  let peak = 1;
  let dd = 0;
  for (const r of returns) {
    level *= 1 + r;
    peak = Math.max(peak, level);
    dd = Math.max(dd, (peak - level) / peak);
  }
  return dd;
}

// ── Linear algebra (tiny matrices only) ─────────────────────────────────────

function invert(m: number[][]): number[][] {
  const n = m.length;
  const a = m.map((row, i) => [...row, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(a[r][c]) > Math.abs(a[p][c])) p = r;
    [a[c], a[p]] = [a[p], a[c]];
    const d = a[c][c] || 1e-12;
    for (let j = 0; j < 2 * n; j++) a[c][j] /= d;
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = a[r][c];
      for (let j = 0; j < 2 * n; j++) a[r][j] -= f * a[c][j];
    }
  }
  return a.map((row) => row.slice(n));
}

export interface OlsResult {
  /** Index 0 is the intercept. */
  beta: number[];
  tStats: number[];
  rSquared: number;
}

export function ols(y: number[], factors: number[][]): OlsResult {
  const n = y.length;
  const k = factors.length + 1;
  const X = (i: number) => [1, ...factors.map((f) => f[i])];
  const xtx = Array.from({ length: k }, () => new Array(k).fill(0));
  const xty = new Array(k).fill(0);
  for (let i = 0; i < n; i++) {
    const xi = X(i);
    for (let a = 0; a < k; a++) {
      xty[a] += xi[a] * y[i];
      for (let b = 0; b < k; b++) xtx[a][b] += xi[a] * xi[b];
    }
  }
  const inv = invert(xtx);
  const beta = inv.map((row) => row.reduce((s, v, j) => s + v * xty[j], 0));
  let sse = 0;
  const my = mean(y);
  let sst = 0;
  for (let i = 0; i < n; i++) {
    const xi = X(i);
    const fit = xi.reduce((s, v, j) => s + v * beta[j], 0);
    sse += (y[i] - fit) ** 2;
    sst += (y[i] - my) ** 2;
  }
  const sigma2 = sse / Math.max(1, n - k);
  return {
    beta,
    tStats: beta.map((b, j) => b / Math.sqrt(Math.max(1e-18, sigma2 * inv[j][j]))),
    rSquared: sst > 0 ? 1 - sse / sst : 0,
  };
}

// ── Efficient frontier by seeded sampling ───────────────────────────────────

export interface Portfolio {
  weights: number[];
  ret: number;
  vol: number;
  sharpe: number;
}

export function frontier(symbols: string[], rng: Rng, samples = 3000) {
  const series = symbols.map((s) => returnsOf(s));
  const mu = series.map((r) => mean(r) * TRADING_DAYS);
  const cov = series.map((a) => series.map((b) => covariance(a, b) * TRADING_DAYS));

  const evaluate = (w: number[]): Portfolio => {
    const ret = w.reduce((s, x, i) => s + x * mu[i], 0);
    let v = 0;
    for (let i = 0; i < w.length; i++) for (let j = 0; j < w.length; j++) v += w[i] * w[j] * cov[i][j];
    const vol = Math.sqrt(Math.max(v, 1e-12));
    return { weights: w, ret, vol, sharpe: (ret - RISK_FREE) / vol };
  };

  const candidates: Portfolio[] = [];
  // Corner solutions + equal weight, then a spread of concentrated and diffuse random mixes.
  symbols.forEach((_, i) => candidates.push(evaluate(symbols.map((__, j) => (i === j ? 1 : 0)))));
  candidates.push(evaluate(symbols.map(() => 1 / symbols.length)));
  for (let n = 0; n < samples; n++) {
    const sharp = 0.4 + (n % 5) * 0.6; // concentration varies across draws
    const raw = symbols.map(() => Math.pow(-Math.log(Math.max(rng(), 1e-9)), sharp));
    const tot = raw.reduce((a, b) => a + b, 0);
    candidates.push(evaluate(raw.map((x) => x / tot)));
  }

  const minVar = candidates.reduce((a, b) => (b.vol < a.vol ? b : a));
  const maxSharpe = candidates.reduce((a, b) => (b.sharpe > a.sharpe ? b : a));

  // Upper envelope: best return per volatility bin, keeping only increasing returns.
  const lo = minVar.vol;
  const hi = Math.max(...candidates.map((c) => c.vol));
  const bins = 24;
  const best: Array<Portfolio | null> = new Array(bins).fill(null);
  for (const c of candidates) {
    const b = Math.min(bins - 1, Math.floor(((c.vol - lo) / Math.max(hi - lo, 1e-9)) * bins));
    if (!best[b] || c.ret > (best[b] as Portfolio).ret) best[b] = c;
  }
  const curve: Portfolio[] = [];
  for (const p of best) if (p && (!curve.length || p.ret > curve[curve.length - 1].ret)) curve.push(p);
  return { curve, minVar, maxSharpe, evaluate };
}

// ── Technical indicators ────────────────────────────────────────────────────

const smaAt = (xs: number[], n: number) => mean(xs.slice(-n));

function emaSeries(xs: number[], n: number): number[] {
  const k = 2 / (n + 1);
  const out: number[] = [xs[0]];
  for (let i = 1; i < xs.length; i++) out.push(xs[i] * k + out[i - 1] * (1 - k));
  return out;
}

export interface Indicator {
  name: string;
  value: number;
  signal?: 'bullish' | 'bearish' | 'neutral' | 'overbought' | 'oversold';
}

export function technicalIndicators(symbol: string, lookback: number) {
  const bars = dailyBars(symbol, Math.max(lookback, 220));
  const closes = bars.map((b) => b.close);
  const highs = bars.map((b) => b.high);
  const lows = bars.map((b) => b.low);
  const price = closes[closes.length - 1];

  // RSI(14), Wilder smoothing.
  let avgG = 0;
  let avgL = 0;
  for (let i = 1; i <= 14; i++) {
    const d = closes[i] - closes[i - 1];
    if (d > 0) avgG += d;
    else avgL -= d;
  }
  avgG /= 14;
  avgL /= 14;
  for (let i = 15; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    avgG = (avgG * 13 + Math.max(d, 0)) / 14;
    avgL = (avgL * 13 + Math.max(-d, 0)) / 14;
  }
  const rsi = avgL === 0 ? 100 : 100 - 100 / (1 + avgG / avgL);

  const ema12 = emaSeries(closes, 12);
  const ema26 = emaSeries(closes, 26);
  const macdLine = ema12.map((v, i) => v - ema26[i]);
  const macdSignal = emaSeries(macdLine, 9);
  const macd = macdLine[macdLine.length - 1];
  const macdSig = macdSignal[macdSignal.length - 1];

  const sma20 = smaAt(closes, 20);
  const sma50 = smaAt(closes, 50);
  const sma200 = smaAt(closes, 200);
  const sd20 = stdev(closes.slice(-20));
  const upper = sma20 + 2 * sd20;
  const lower = sma20 - 2 * sd20;
  const pctB = (price - lower) / Math.max(upper - lower, 1e-9);

  const trs: number[] = [];
  for (let i = closes.length - 14; i < closes.length; i++) {
    trs.push(Math.max(highs[i] - lows[i], Math.abs(highs[i] - closes[i - 1]), Math.abs(lows[i] - closes[i - 1])));
  }
  const atr = mean(trs);
  const hh = Math.max(...highs.slice(-14));
  const ll = Math.min(...lows.slice(-14));
  const stoch = ((price - ll) / Math.max(hh - ll, 1e-9)) * 100;
  const volRatio = bars[bars.length - 1].volume / mean(bars.slice(-20).map((b) => b.volume));

  const side = (x: number, ref: number): Indicator['signal'] => (x > ref ? 'bullish' : 'bearish');
  const indicators: Indicator[] = [
    { name: 'RSI (14)', value: round(rsi, 1), signal: rsi > 70 ? 'overbought' : rsi < 30 ? 'oversold' : 'neutral' },
    { name: 'MACD', value: round(macd, 3), signal: macd > macdSig ? 'bullish' : 'bearish' },
    { name: 'MACD Signal', value: round(macdSig, 3), signal: 'neutral' },
    { name: 'MACD Histogram', value: round(macd - macdSig, 3), signal: macd - macdSig > 0 ? 'bullish' : 'bearish' },
    { name: 'SMA 20', value: round(sma20), signal: side(price, sma20) },
    { name: 'SMA 50', value: round(sma50), signal: side(price, sma50) },
    { name: 'SMA 200', value: round(sma200), signal: side(price, sma200) },
    { name: 'EMA 12', value: round(ema12[ema12.length - 1]), signal: side(price, ema12[ema12.length - 1]) },
    { name: 'EMA 26', value: round(ema26[ema26.length - 1]), signal: side(price, ema26[ema26.length - 1]) },
    { name: 'Bollinger %B', value: round(pctB, 2), signal: pctB > 1 ? 'overbought' : pctB < 0 ? 'oversold' : 'neutral' },
    { name: 'Bollinger Upper', value: round(upper), signal: 'neutral' },
    { name: 'Bollinger Lower', value: round(lower), signal: 'neutral' },
    { name: 'ATR (14)', value: round(atr), signal: 'neutral' },
    { name: 'Stochastic %K', value: round(stoch, 1), signal: stoch > 80 ? 'overbought' : stoch < 20 ? 'oversold' : 'neutral' },
    { name: 'Volume vs 20d avg', value: round(volRatio, 2), signal: 'neutral' },
  ];

  const bull = indicators.filter((i) => i.signal === 'bullish').length;
  const bear = indicators.filter((i) => i.signal === 'bearish').length;
  const net = bull - bear;
  return {
    indicators,
    price,
    bias: (net >= 2 ? 'bullish' : net <= -2 ? 'bearish' : 'neutral') as 'bullish' | 'bearish' | 'neutral',
    strength: Math.round(Math.min(92, Math.max(8, 50 + net * 4.5))),
    bull,
    bear,
    rsi,
  };
}

// ── Monte Carlo ─────────────────────────────────────────────────────────────

export function monteCarlo(returns: number[], horizon: number, n: number, initial: number, rng: Rng) {
  const mu = mean(returns);
  const sigma = stdev(returns);
  const checkpoints: number[] = [];
  for (let d = 0; d <= horizon; d += 21) checkpoints.push(d);
  if (checkpoints[checkpoints.length - 1] !== horizon) checkpoints.push(horizon);
  const cp = new Set(checkpoints);

  const sims: Array<{ values: number[]; final: number }> = [];
  for (let s = 0; s < n; s++) {
    let logV = 0;
    const values: number[] = [initial];
    for (let d = 1; d <= horizon; d++) {
      logV += mu - 0.5 * sigma * sigma + sigma * gaussian(rng);
      if (cp.has(d)) values.push(round(initial * Math.exp(logV)));
    }
    sims.push({ values, final: initial * Math.exp(logV) });
  }
  sims.sort((a, b) => a.final - b.final);
  return { checkpoints, sims };
}

// ── GARCH(1,1) with variance targeting ──────────────────────────────────────

export function garch(returns: number[], horizon: number) {
  const m = mean(returns);
  const centered = returns.map((r) => r - m);
  const longRun = centered.reduce((a, b) => a + b * b, 0) / centered.length;
  const alpha = 0.08;
  const beta = 0.9;
  const omega = longRun * (1 - alpha - beta);
  let h = longRun;
  for (const e of centered) h = omega + alpha * e * e + beta * h;
  const persistence = alpha + beta;
  const forecastVar = (k: number) => longRun + persistence ** k * (h - longRun);
  const annual = (v: number) => Math.sqrt(v * TRADING_DAYS) * 100;
  return {
    omega,
    alpha,
    beta,
    persistence,
    longRunAnnualPct: annual(longRun),
    currentAnnualPct: annual(h),
    nextDayVol: Math.sqrt(forecastVar(1)),
    forecast: Array.from({ length: horizon }, (_, i) => annual(forecastVar(i + 1))),
    ratio: Math.sqrt(h / longRun),
  };
}

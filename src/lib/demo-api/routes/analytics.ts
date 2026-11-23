/**
 * Analytics (optimisation, technicals, factors, benchmark, Monte Carlo, sector
 * rotation, DCF, fundamentals, earnings calendar) and the stock screener.
 * Everything is computed from the shared price series and the sample
 * fundamentals table, so results respond to what the page sends.
 */
import { SUBSYSTEM_VERSIONS } from '../../versioning';
import { normalizeWeights, portfolioReturns } from '../analytics';
import { DemoHttpError } from '../errors';
import { fundamentalsFor, SCREEN_FIELDS, SCREEN_UNIVERSE, type Fundamentals } from '../fundamentals';
import { getInstrument, lastPrice, periodReturnPct } from '../market';
import { daysFromNow, hashString, isoDay, round, seededRng, demoNow } from '../prng';
import {
  covariance,
  frontier,
  maxDrawdown,
  mean,
  monteCarlo,
  ols,
  returnsOf,
  RISK_FREE,
  stdev,
  technicalIndicators,
  TRADING_DAYS,
} from '../quant';
import { get, post, type DemoRoute } from '../router';

const today = () => isoDay(demoNow());

function explanation(summary: string, factors: string[], modelType: string, assumptions: string[], limitations?: string[]) {
  return {
    summary,
    key_factors: factors,
    model_info: { model_type: modelType, version: SUBSYSTEM_VERSIONS.risk.version, assumptions },
    limitations: limitations ?? [
      'Based on one year of historical data, which may not repeat',
      'Educational illustration only, not investment advice',
    ],
  };
}

const parseHoldings = (body: any): Array<{ symbol: string; weight: number }> => {
  const raw: Array<{ symbol: string; weight?: number }> = body?.holdings ?? [];
  if (!raw.length) throw new DemoHttpError(422, 'At least one holding is required');
  return normalizeWeights(raw.map((h) => ({ symbol: String(h.symbol).toUpperCase(), weight: h.weight ?? 1 / raw.length })));
};

const pct = (x: number, d = 1) => `${(x * 100).toFixed(d)}%`;

// ── Sector rotation ─────────────────────────────────────────────────────────
const SECTORS: Array<[string, string]> = [
  ['XLK', 'Technology'],
  ['XLF', 'Financials'],
  ['XLE', 'Energy'],
  ['XLV', 'Health Care'],
  ['XLY', 'Consumer Discretionary'],
  ['XLP', 'Consumer Staples'],
  ['XLI', 'Industrials'],
  ['XLU', 'Utilities'],
  ['XLB', 'Materials'],
  ['XLRE', 'Real Estate'],
  ['XLC', 'Communication Services'],
];

const QUADRANT_TEXT: Record<string, string> = {
  leading: 'Outperforming the market with improving momentum',
  weakening: 'Still ahead of the market, but momentum is fading',
  lagging: 'Underperforming the market with weak momentum',
  improving: 'Behind the market, but momentum is turning up',
};
const CYCLE_OF: Record<string, [string, string]> = {
  leading: ['expansion', 'Typically strongest during the expansion phase'],
  improving: ['mid_cycle', 'Often leads as the cycle moves from early to mid phase'],
  weakening: ['late_cycle', 'Characteristic of the late-cycle phase'],
  lagging: ['contraction', 'Typical of contraction, when leadership moves elsewhere'],
};

// ── Earnings calendar ───────────────────────────────────────────────────────
const CALENDAR_SYMBOLS = SCREEN_UNIVERSE.slice(0, 24);

// ── Screening ───────────────────────────────────────────────────────────────
type Criterion = { field: string; operator: string; value?: number; min_value?: number; max_value?: number };

function matches(f: Fundamentals, c: Criterion): boolean {
  const v = (f as unknown as Record<string, number | string>)[c.field];
  if (typeof v !== 'number') return false;
  switch (c.operator) {
    case 'lt': return v < (c.value as number);
    case 'gt': return v > (c.value as number);
    case 'lte': return v <= (c.value as number);
    case 'gte': return v >= (c.value as number);
    case 'eq': return Math.abs(v - (c.value as number)) < 1e-9;
    case 'between': return v >= (c.min_value as number) && v <= (c.max_value as number);
    default: return false;
  }
}

export const analyticsRoutes: DemoRoute[] = [
  post('/analytics/optimize', ({ body }) => {
    const holdings = parseHoldings(body);
    if (holdings.length < 2) throw new DemoHttpError(422, 'Optimisation needs at least two symbols');
    const symbols = holdings.map((h) => h.symbol);
    const rng = seededRng(`optimize:${symbols.join(',')}`);
    const { curve, minVar, maxSharpe, evaluate } = frontier(symbols, rng);
    const view = (p: { weights: number[]; ret: number; vol: number; sharpe: number }) => ({
      weights: Object.fromEntries(symbols.map((s, i) => [s, round(p.weights[i], 4)])),
      expected_return: round(p.ret, 4),
      volatility: round(p.vol, 4),
      sharpe_ratio: round(p.sharpe, 2),
    });
    const current = evaluate(holdings.map((h) => h.weight));
    const dd = maxDrawdown(portfolioReturns(holdings));
    return {
      analysis_date: today(),
      symbols,
      efficient_frontier: curve.map(view),
      max_sharpe_portfolio: view(maxSharpe),
      min_variance_portfolio: view(minVar),
      current_portfolio: body?.include_current_portfolio === false ? undefined : view(current),
      calmar_ratio: dd > 0 ? round(current.ret / dd, 2) : undefined,
      explanation: explanation(
        `Across ${curve.length} efficient portfolios, the highest risk-adjusted mix would hold ${symbols
          .map((s, i) => [s, maxSharpe.weights[i]] as const)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 2)
          .map(([s, w]) => `${pct(w, 0)} ${s}`)
          .join(' and ')}.`,
        [
          `Max-Sharpe portfolio: ${pct(maxSharpe.ret)} return at ${pct(maxSharpe.vol)} volatility`,
          `Minimum-variance portfolio: ${pct(minVar.vol)} volatility`,
          `Your current mix: ${pct(current.ret)} return at ${pct(current.vol)} volatility`,
        ],
        'mean_variance_sampling',
        ['One year of daily returns', 'Long-only, fully invested', `Risk-free rate ${pct(RISK_FREE)}`],
        ['Expected returns are historical averages, which are noisy predictors', 'Optimised weights are sensitive to the input window'],
      ),
      tier: 'pro',
    };
  }),

  post('/analytics/technical', ({ body }) => {
    const symbol = String(body?.symbol ?? 'SPY').toUpperCase();
    const t = technicalIndicators(symbol, Number(body?.lookback_days) || 200);
    return {
      symbol,
      analysis_date: today(),
      indicators: t.indicators,
      trend_bias: t.bias,
      signal_strength: t.strength,
      explanation: explanation(
        `${symbol} has ${t.bull} bullish and ${t.bear} bearish indicator readings, giving a ${t.bias} technical picture.`,
        [`RSI(14) is ${t.rsi.toFixed(1)}`, `Price is ${t.price > t.indicators[5].value ? 'above' : 'below'} its 50-day average`],
        'rule_based_indicators',
        ['Daily bars', 'Standard indicator parameters (RSI 14, MACD 12/26/9, Bollinger 20/2)'],
        ['Indicators describe past price action and lag the market', 'Different indicators often disagree'],
      ),
      tier: 'pro',
    };
  }),

  post('/analytics/factors', ({ body }) => {
    const holdings = parseHoldings(body);
    const spy = returnsOf('SPY');
    const sub = (a: number[], b: number[]) => a.map((x, i) => x - b[i]);
    const factorDefs: Array<[string, number[]]> = [
      ['Market', spy],
      ['Size', sub(returnsOf('IWM'), spy)],
      ['Growth', sub(returnsOf('QQQ'), spy)],
      ['Rates', returnsOf('TLT')],
      ['Gold', returnsOf('GLD')],
    ];
    const factors = factorDefs.map(([, r]) => r);
    const interpret = (name: string, e: number) => {
      const mag = Math.abs(e) < 0.15 ? 'little' : Math.abs(e) < 0.6 ? 'moderate' : 'strong';
      const dir = e >= 0 ? 'positive' : 'negative';
      const what: Record<string, string> = {
        Market: e >= 0 ? 'moves with the broad market' : 'moves against the broad market',
        Size: e >= 0 ? 'tilts toward small caps' : 'tilts toward large caps',
        Growth: e >= 0 ? 'tilts toward growth stocks' : 'tilts toward value stocks',
        Rates: e >= 0 ? 'benefits when bond prices rise (yields fall)' : 'benefits when yields rise',
        Gold: e >= 0 ? 'moves with gold' : 'moves against gold',
      };
      return `${mag === 'little' ? 'Little' : mag[0].toUpperCase() + mag.slice(1)} ${dir} exposure: ${what[name]}`;
    };

    const profiles = holdings.map((h) => {
      const fit = ols(returnsOf(h.symbol), factors);
      return {
        symbol: h.symbol,
        fit,
        factor_exposures: factorDefs.map(([name], k) => ({
          factor_name: name,
          exposure: round(fit.beta[k + 1], 2),
          t_statistic: round(fit.tStats[k + 1], 1),
          interpretation: interpret(name, fit.beta[k + 1]),
        })),
        idiosyncratic_risk_pct: round((1 - fit.rSquared) * 100, 1),
        r_squared: round(fit.rSquared, 2),
      };
    });
    const portfolio = factorDefs.map(([name], k) => {
      const e = profiles.reduce((s, p, i) => s + holdings[i].weight * p.fit.beta[k + 1], 0);
      return { factor_name: name, exposure: round(e, 2), interpretation: interpret(name, e) };
    });
    const portFit = ols(portfolioReturns(holdings), factors);
    return {
      analysis_date: today(),
      portfolio_factor_exposures: portfolio,
      asset_profiles: profiles.map(({ fit: _f, ...rest }) => rest),
      portfolio_r_squared: round(portFit.rSquared, 2),
      dominant_factors: [...portfolio].sort((a, b) => Math.abs(b.exposure) - Math.abs(a.exposure)).slice(0, 2).map((p) => p.factor_name),
      explanation: explanation(
        `The portfolio's returns are explained ${pct(portFit.rSquared, 0)} by five common factors; the rest is stock-specific.`,
        portfolio.map((p) => `${p.factor_name}: ${p.exposure >= 0 ? '+' : ''}${p.exposure.toFixed(2)}`),
        'ols_factor_regression',
        ['Daily returns over one year', 'Factors proxied by SPY, IWM−SPY, QQQ−SPY, TLT and GLD'],
      ),
      tier: 'pro',
    };
  }),

  post('/analytics/benchmark', ({ body }) => {
    const holdings = parseHoldings(body);
    const bench = String(body?.benchmark_symbol ?? 'SPY').toUpperCase();
    const days = Number(body?.lookback_days) || TRADING_DAYS;
    const p = portfolioReturns(holdings, days);
    const b = returnsOf(bench, days);
    const pr = mean(p) * TRADING_DAYS;
    const br = mean(b) * TRADING_DAYS;
    const beta = covariance(p, b) / stdev(b) ** 2;
    const alpha = pr - (RISK_FREE + beta * (br - RISK_FREE));
    const active = p.map((x, i) => x - b[i]);
    const te = stdev(active) * Math.sqrt(TRADING_DAYS);
    const corr = covariance(p, b) / (stdev(p) * stdev(b));
    const upIdx = b.map((x, i) => (x > 0 ? i : -1)).filter((i) => i >= 0);
    const dnIdx = b.map((x, i) => (x < 0 ? i : -1)).filter((i) => i >= 0);
    const cap = (idx: number[]) => mean(idx.map((i) => p[i])) / mean(idx.map((i) => b[i]));
    const dd = maxDrawdown(p);
    const gains = p.filter((x) => x > 0).reduce((s, x) => s + x, 0);
    const losses = -p.filter((x) => x < 0).reduce((s, x) => s + x, 0);
    return {
      benchmark_symbol: bench,
      analysis_date: today(),
      period_days: days,
      metrics: {
        portfolio_annual_return: round(pr, 4),
        benchmark_annual_return: round(br, 4),
        active_return: round(pr - br, 4),
        alpha: round(alpha, 4),
        beta: round(beta, 2),
        r_squared: round(corr * corr, 2),
        tracking_error: round(te, 4),
        information_ratio: round((pr - br) / te, 2),
        calmar_ratio: dd > 0 ? round(pr / dd, 2) : undefined,
        max_drawdown: round(dd, 4),
        upside_capture: round(cap(upIdx), 2),
        downside_capture: round(cap(dnIdx), 2),
        omega_ratio: losses > 0 ? round(gains / losses, 2) : undefined,
      },
      explanation: explanation(
        `Versus ${bench}, the portfolio returned ${pct(pr)} annualised against ${pct(br)}, with a beta of ${beta.toFixed(2)}.`,
        [`Alpha ${pct(alpha)}`, `Tracking error ${pct(te)}`, `Maximum drawdown ${pct(dd)}`],
        'benchmark_regression',
        [`${days} trading days of daily returns`, `Risk-free rate ${pct(RISK_FREE)}`],
      ),
      tier: 'pro',
    };
  }),

  post('/analytics/simulate', ({ body }) => {
    const holdings = parseHoldings(body);
    const horizon = Math.min(756, Math.max(21, Number(body?.horizon_days) || 252));
    const n = Math.min(2000, Math.max(200, Number(body?.n_simulations) || 1000));
    const initial = Number(body?.initial_value) || 100_000;
    const rng = seededRng(`mc:${holdings.map((h) => `${h.symbol}${h.weight.toFixed(3)}`).join('|')}:${horizon}:${n}`);
    const { checkpoints, sims } = monteCarlo(portfolioReturns(holdings), horizon, n, initial, rng);
    const at = (p: number) => sims[Math.min(n - 1, Math.floor((p / 100) * n))];
    const finals = sims.map((s) => s.final);
    const target = body?.target_return !== undefined && body.target_return !== null ? Number(body.target_return) : null;
    const expFinal = mean(finals);
    return {
      analysis_date: today(),
      horizon_days: horizon,
      n_simulations: n,
      initial_value: initial,
      checkpoints,
      paths: [5, 25, 50, 75, 95].map((p) => {
        const s = at(p);
        return { percentile: p, values: s.values, final_value: round(s.final), total_return: round(s.final / initial - 1, 4) };
      }),
      prob_of_loss: round(finals.filter((v) => v < initial).length / n, 3),
      prob_of_target: target === null ? undefined : round(finals.filter((v) => v >= initial * (1 + target)).length / n, 3),
      expected_final_value: round(expFinal),
      expected_return: round(expFinal / initial - 1, 4),
      explanation: explanation(
        `Across ${n.toLocaleString()} simulated paths, the median outcome after ${horizon} trading days is $${Math.round(at(50).final).toLocaleString()}.`,
        [`5th percentile: $${Math.round(at(5).final).toLocaleString()}`, `95th percentile: $${Math.round(at(95).final).toLocaleString()}`],
        'geometric_brownian_motion',
        ['Returns drawn from a normal distribution fitted to one year of history', 'No rebalancing, contributions or withdrawals'],
        ['Real returns have fatter tails than the normal distribution', 'Past volatility may not persist'],
      ),
      tier: 'pro',
    };
  }),

  post('/analytics/sector-rotation', ({ body }) => {
    const wanted: string[] | undefined = body?.sector_symbols?.length ? body.sector_symbols.map((s: string) => s.toUpperCase()) : undefined;
    const list = SECTORS.filter(([s]) => !wanted || wanted.includes(s));
    const rel = (sym: string, days: number) => (periodReturnPct(sym, days) - periodReturnPct('SPY', days)) / 100;
    const rankings = list
      .map(([symbol, name]) => {
        const rs1 = rel(symbol, 21);
        const rs3 = rel(symbol, 63);
        const rs6 = rel(symbol, 126);
        const accel = rs1 - rs3 / 3;
        const quadrant = rs3 > 0 ? (accel >= 0 ? 'leading' : 'weakening') : accel >= 0 ? 'improving' : 'lagging';
        const score = Math.tanh((rs1 * 2 + rs3 + rs6 * 0.5) / 0.12);
        return {
          symbol,
          sector_name: name,
          relative_strength_1m: round(rs1, 4),
          relative_strength_3m: round(rs3, 4),
          relative_strength_6m: round(rs6, 4),
          momentum_score: round(score, 2),
          momentum_trend: accel > 0.005 ? 'strengthening' : accel < -0.005 ? 'weakening' : 'stable',
          rrg_quadrant: quadrant,
          rrg_quadrant_description: QUADRANT_TEXT[quadrant],
          cycle_position: CYCLE_OF[quadrant][0],
          cycle_description: CYCLE_OF[quadrant][1],
        };
      })
      .sort((a, b) => b.momentum_score - a.momentum_score);
    const names = (q: string) => rankings.filter((r) => r.rrg_quadrant === q).map((r) => r.sector_name);
    const spy3 = periodReturnPct('SPY', 63);
    const strong = names('leading').length + names('improving').length;
    const phase = spy3 > 0 ? (strong >= rankings.length / 2 ? 'expansion' : 'mid_cycle') : spy3 > -6 ? 'late_cycle' : 'contraction';
    return {
      analysis_date: today(),
      sectors_analyzed: rankings.length,
      leading_sectors: names('leading'),
      lagging_sectors: names('lagging'),
      improving_sectors: names('improving'),
      sector_rankings: rankings,
      market_cycle_phase: phase,
      explanation: explanation(
        `${names('leading').slice(0, 2).join(' and ') || 'No sector'} lead the market while ${names('lagging').slice(0, 2).join(' and ') || 'no sector'} lag; the broad picture looks like ${phase.replace('_', ' ')}.`,
        [`${names('leading').length} sectors leading`, `${names('improving').length} improving`, `S&P 500 proxy ${spy3 >= 0 ? '+' : ''}${spy3.toFixed(1)}% over three months`],
        'relative_rotation_graph',
        ['Sector funds measured against SPY', '1-, 3- and 6-month relative strength'],
        ['Rotation signals are descriptive, not predictive', 'Cycle phase labels are a simplification'],
      ),
      tier: 'pro',
    };
  }),

  post('/analytics/dcf', ({ body }) => {
    const base = Number(body?.base_fcf);
    const shares = Number(body?.shares_outstanding);
    const price = Number(body?.current_price);
    if (!(base > 0) || !(shares > 0)) throw new DemoHttpError(422, 'base_fcf and shares_outstanding must be positive');
    const g1 = body?.growth_rate_stage1 ?? 0.1;
    const y1 = body?.stage1_years ?? 5;
    const g2 = body?.growth_rate_stage2 ?? 0.05;
    const y2 = body?.stage2_years ?? 5;
    const r = body?.discount_rate ?? 0.09;
    const gt = body?.terminal_growth_rate ?? 0.025;
    const debt = body?.net_debt ?? 0;
    const run = (disc: number, term: number) => {
      let fcf = base;
      let year = 0;
      const s1 = [];
      const s2 = [];
      for (let i = 0; i < y1; i++) {
        fcf *= 1 + g1;
        year++;
        s1.push({ year, growth_rate: g1, free_cash_flow: round(fcf), present_value: round(fcf / (1 + disc) ** year) });
      }
      for (let i = 0; i < y2; i++) {
        fcf *= 1 + g2;
        year++;
        s2.push({ year, growth_rate: g2, free_cash_flow: round(fcf), present_value: round(fcf / (1 + disc) ** year) });
      }
      const tv = (fcf * (1 + term)) / (disc - term);
      const tvPv = tv / (1 + disc) ** year;
      const ev = [...s1, ...s2].reduce((s, f) => s + f.present_value, 0) + tvPv;
      return { s1, s2, tv, tvPv, ev, iv: (ev - debt) / shares };
    };
    const m = run(r, gt);
    const sensitivity: Record<string, number> = {};
    for (const d of [r - 0.01, r, r + 0.01]) for (const t of [gt - 0.005, gt, gt + 0.005]) {
      sensitivity[`discount ${(d * 100).toFixed(1)}% / terminal ${(t * 100).toFixed(1)}%`] = round(run(d, t).iv, 2);
    }
    return {
      symbol: body?.symbol,
      valuation_date: today(),
      stage1_flows: m.s1,
      stage2_flows: m.s2,
      terminal_value: round(m.tv),
      terminal_value_pv: round(m.tvPv),
      enterprise_value: round(m.ev),
      equity_value: round(m.ev - debt),
      intrinsic_value_per_share: round(m.iv, 2),
      current_price: price,
      margin_of_safety: round((m.iv - price) / m.iv, 4),
      upside_downside_pct: round((m.iv / price - 1) * 100, 1),
      sensitivity,
    };
  }),

  post('/analytics/fundamentals', ({ body }) => {
    const symbols: string[] = (body?.symbols ?? []).map((s: string) => s.toUpperCase());
    const data = Object.fromEntries(
      symbols.map((s) => {
        const { market_cap, ...f } = fundamentalsFor(s);
        return [s, { ...f, market_cap: Math.round(market_cap * 1e9) }];
      }),
    );
    return { data, fetched_count: symbols.length, failed_symbols: [] };
  }),

  get('/analytics/earnings-calendar', ({ query }) => {
    const horizon = query.horizon === '12month' ? 365 : query.horizon === '6month' ? 180 : 90;
    const events = CALENDAR_SYMBOLS.flatMap((symbol) => {
      const h = hashString(`earn:${symbol}`);
      const out = [];
      for (let q = 0; q * 91 + (h % 85) < horizon; q++) {
        const offset = (h % 85) + q * 91 + 3;
        out.push({
          symbol,
          name: getInstrument(symbol).name,
          reportDate: isoDay(daysFromNow(offset)),
          fiscalDateEnding: isoDay(daysFromNow(offset - 30)),
          estimate: (lastPrice(symbol) / fundamentalsFor(symbol).pe_ratio / 4).toFixed(2),
          currency: 'USD',
        });
      }
      return out;
    }).sort((a, b) => a.reportDate.localeCompare(b.reportDate));
    return { events, total_count: events.length, horizon: query.horizon || '3month' };
  }),

  // ── Screener ──────────────────────────────────────────────────────────────
  get('/screening/fields', () => ({ fields: SCREEN_FIELDS })),

  post('/screening/screen', ({ body }) => {
    const criteria: Criterion[] = body?.criteria ?? [];
    const universe: string[] = body?.universe?.length ? body.universe.map((s: string) => s.toUpperCase()) : SCREEN_UNIVERSE;
    const sortBy: string = body?.sort_by ?? 'market_cap';
    const desc = body?.sort_descending !== false;
    const max = Math.max(1, Number(body?.max_results) || 50);

    const scored = universe.map((symbol) => {
      const f = fundamentalsFor(symbol);
      return { f, hits: criteria.filter((c) => matches(f, c)).length };
    });
    const full = scored.filter((s) => s.hits === criteria.length).length;
    const val = (f: Fundamentals) => ((f as unknown as Record<string, number>)[sortBy] ?? 0);
    const results = scored
      .filter((s) => criteria.length === 0 || s.hits > 0)
      .sort((a, b) => b.hits - a.hits || (desc ? val(b.f) - val(a.f) : val(a.f) - val(b.f)))
      .slice(0, max)
      .map(({ f, hits }) => ({
        symbol: f.symbol,
        name: f.name,
        sector: f.sector,
        matching_criteria_count: hits,
        total_criteria_count: criteria.length,
        fundamental_data: f,
      }));
    return {
      screened_at: new Date(demoNow()).toISOString(),
      universe_size: universe.length,
      matched_count: criteria.length ? full : universe.length,
      results,
      criteria_applied: criteria,
      data_source: 'sample',
    };
  }),
];

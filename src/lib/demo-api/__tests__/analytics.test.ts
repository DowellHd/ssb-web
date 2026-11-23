import { describe, expect, it } from 'vitest';
import { resolveDemoRequest } from '../index';
import { seededRng, gaussian } from '../prng';

const call = (method: string, url: string, data?: unknown, params?: Record<string, unknown>) =>
  resolveDemoRequest({ method, url, data, params }) as Promise<any>;

const equal = (symbols: string[]) => symbols.map((symbol) => ({ symbol, weight: 1 / symbols.length }));
const holdings = equal(['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA']);

/** Same generator the analytics page uses for its demo returns. */
const demoReturns = (n: number) => {
  const rng = seededRng(`analytics-demo-returns:${n}`);
  return Array.from({ length: n }, () => 0.0003 + 0.012 * gaussian(rng));
};

describe('analytics endpoints', () => {
  it('optimisation returns an increasing frontier and a max-Sharpe at least as good as the current mix', async () => {
    const r = await call('post', '/analytics/optimize', { holdings, include_current_portfolio: true });
    const f = r.efficient_frontier;
    expect(f.length).toBeGreaterThan(5);
    for (let i = 1; i < f.length; i++) {
      expect(f[i].expected_return).toBeGreaterThan(f[i - 1].expected_return);
      expect(f[i].volatility).toBeGreaterThanOrEqual(f[i - 1].volatility - 1e-9);
    }
    const sum = (w: Record<string, number>) => Object.values(w).reduce((a, b) => a + b, 0);
    expect(sum(r.max_sharpe_portfolio.weights)).toBeCloseTo(1, 2);
    expect(r.max_sharpe_portfolio.sharpe_ratio).toBeGreaterThanOrEqual(r.current_portfolio.sharpe_ratio);
    expect(r.min_variance_portfolio.volatility).toBeLessThanOrEqual(r.current_portfolio.volatility);
  });

  it('technical analysis has a full indicator set and a bounded strength', async () => {
    const r = await call('post', '/analytics/technical', { symbol: 'SPY', lookback_days: 200 });
    expect(r.indicators.length).toBeGreaterThanOrEqual(12);
    expect(r.indicators.every((i: any) => Number.isFinite(i.value))).toBe(true);
    expect(['bullish', 'bearish', 'neutral']).toContain(r.trend_bias);
    expect(r.signal_strength).toBeGreaterThanOrEqual(8);
    expect(r.signal_strength).toBeLessThanOrEqual(92);
  });

  it('factor analysis: SPY loads on the market factor and R² is a fraction', async () => {
    const r = await call('post', '/analytics/factors', { holdings: [{ symbol: 'SPY', weight: 1 }, { symbol: 'AAPL', weight: 1 }] });
    const spy = r.asset_profiles.find((p: any) => p.symbol === 'SPY');
    const market = spy.factor_exposures.find((e: any) => e.factor_name === 'Market');
    expect(market.exposure).toBeGreaterThan(0.8);
    expect(r.portfolio_r_squared).toBeGreaterThan(0);
    expect(r.portfolio_r_squared).toBeLessThanOrEqual(1);
    expect(r.dominant_factors).toHaveLength(2);
  });

  it('benchmarking SPY against itself gives beta 1 and zero tracking error', async () => {
    const r = await call('post', '/analytics/benchmark', { holdings: [{ symbol: 'SPY', weight: 1 }], benchmark_symbol: 'SPY' });
    expect(r.metrics.beta).toBeCloseTo(1, 2);
    expect(r.metrics.tracking_error).toBeCloseTo(0, 3);
    expect(r.metrics.active_return).toBeCloseTo(0, 3);
  });

  it('Monte Carlo percentile paths are ordered and line up with the checkpoints', async () => {
    const r = await call('post', '/analytics/simulate', { holdings, initial_value: 100000, horizon_days: 252, n_simulations: 1000, target_return: 0.1 });
    const finals = r.paths.map((p: any) => p.final_value);
    expect([...finals].sort((a: number, b: number) => a - b)).toEqual(finals);
    r.paths.forEach((p: any) => expect(p.values).toHaveLength(r.checkpoints.length));
    expect(r.checkpoints[0]).toBe(0);
    expect(r.checkpoints[r.checkpoints.length - 1]).toBe(252);
    expect(r.prob_of_loss).toBeGreaterThanOrEqual(0);
    expect(r.prob_of_target).toBeLessThanOrEqual(1);
  });

  it('sector rotation covers 11 sectors with valid quadrants and bounded scores', async () => {
    const r = await call('post', '/analytics/sector-rotation', { include_benchmark: true });
    expect(r.sectors_analyzed).toBe(11);
    r.sector_rankings.forEach((s: any) => {
      expect(['leading', 'improving', 'weakening', 'lagging']).toContain(s.rrg_quadrant);
      expect(Math.abs(s.momentum_score)).toBeLessThanOrEqual(1);
    });
    expect(['expansion', 'mid_cycle', 'late_cycle', 'contraction']).toContain(r.market_cycle_phase);
    const scores = r.sector_rankings.map((s: any) => s.momentum_score);
    expect([...scores].sort((a: number, b: number) => b - a)).toEqual(scores);
  });

  it('DCF is internally consistent', async () => {
    const r = await call('post', '/analytics/dcf', { symbol: 'AAPL', current_price: 200, base_fcf: 100_000, shares_outstanding: 1000, discount_rate: 0.09, terminal_growth_rate: 0.025 });
    expect(r.enterprise_value).toBeGreaterThan(r.terminal_value_pv);
    expect(r.intrinsic_value_per_share).toBeCloseTo(r.equity_value / 1000, 0);
    expect(Object.keys(r.sensitivity)).toHaveLength(9);
  });

  it('fundamentals and the earnings calendar are populated and ordered', async () => {
    const f = await call('post', '/analytics/fundamentals', { symbols: ['AAPL', 'ZZZZ'] });
    expect(f.data.AAPL.pe_ratio).toBeGreaterThan(0);
    expect(f.data.ZZZZ.pe_ratio).toBeGreaterThan(0);
    const c = await call('get', '/analytics/earnings-calendar', undefined, { horizon: '6month' });
    const dates = c.events.map((e: any) => e.reportDate);
    expect([...dates].sort()).toEqual(dates);
    expect(c.total_count).toBe(c.events.length);
  });
});

describe('screener', () => {
  const screen = (criteria: any[]) => call('post', '/screening/screen', { criteria, universe: [], sort_by: 'market_cap', sort_descending: true, max_results: 50 });

  it('every preset screen returns real matches', async () => {
    const value = await screen([{ field: 'pe_ratio', operator: 'lt', value: 15 }, { field: 'pb_ratio', operator: 'lt', value: 1.5 }]);
    const full = (r: any) => r.results.filter((x: any) => x.matching_criteria_count === x.total_criteria_count).map((x: any) => x.symbol);
    expect(full(value)).toEqual(expect.arrayContaining(['BAC', 'PFE']));
    const growth = await screen([{ field: 'revenue_growth_yoy', operator: 'gt', value: 0.2 }, { field: 'earnings_growth_yoy', operator: 'gt', value: 0.15 }]);
    expect(full(growth)).toEqual(expect.arrayContaining(['NVDA', 'PLTR']));
    const quality = await screen([{ field: 'roe', operator: 'gt', value: 0.15 }, { field: 'net_margin', operator: 'gt', value: 0.1 }, { field: 'debt_to_equity', operator: 'lt', value: 1 }]);
    expect(full(quality).length).toBeGreaterThanOrEqual(5);
    const dividend = await screen([{ field: 'dividend_yield', operator: 'gt', value: 0.03 }, { field: 'pe_ratio', operator: 'lt', value: 25 }]);
    expect(full(dividend)).toEqual(expect.arrayContaining(['JNJ', 'PFE']));
  });

  it('lists full matches first, honours "between", and reports sample data', async () => {
    const r = await screen([{ field: 'market_cap', operator: 'between', min_value: 1000, max_value: 4000 }]);
    expect(r.data_source).toBe('sample');
    expect(r.results.every((x: any) => x.fundamental_data.market_cap >= 1000 && x.fundamental_data.market_cap <= 4000)).toBe(true);
    expect(r.matched_count).toBe(r.results.length);
    const caps = r.results.map((x: any) => x.fundamental_data.market_cap);
    expect([...caps].sort((a: number, b: number) => b - a)).toEqual(caps);
    const fields = await call('get', '/screening/fields');
    expect(fields.fields.pe_ratio).toBe('P/E Ratio');
  });
});

describe('predictive endpoints', () => {
  it('GARCH forecast has the requested horizon and mean-reverts toward the long-run level', async () => {
    const r = await call('post', '/predictive/volatility', { symbol: 'SPY', returns: demoReturns(252), forecast_horizon: 10 });
    expect(r.forecast.annualized_vol_forecast_pct).toHaveLength(10);
    expect(r.forecast.forecast_dates).toHaveLength(10);
    const f = r.forecast.annualized_vol_forecast_pct;
    const lr = r.forecast.long_run_annualized_vol_pct;
    expect(Math.abs(f[9] - lr)).toBeLessThanOrEqual(Math.abs(f[0] - lr) + 1e-6);
    expect(r.forecast.var_99_pct).toBeGreaterThan(r.forecast.var_95_pct);
    expect(r.parameters.persistence).toBeLessThan(1);
  });

  it('anomaly detection returns a z-score per observation and consistent counts', async () => {
    const returns = demoReturns(120);
    returns[80] = -0.09; // an obvious shock
    const r = await call('post', '/predictive/anomalies', { symbol: 'SPY', returns });
    expect(r.rolling_z_scores).toHaveLength(120);
    expect(r.anomalies.some((a: any) => a.period_index === 80)).toBe(true);
    // Ordinary random returns must not read as an emergency.
    const calm = await call('post', '/predictive/anomalies', { symbol: 'SPY', returns: demoReturns(120) });
    expect(['normal', 'watch']).toContain(calm.overall_risk_flag);
    expect(Object.values(r.severity_summary).reduce((a: any, b: any) => a + b, 0)).toBe(r.anomaly_count);
    expect(['normal', 'watch', 'alert', 'critical']).toContain(r.overall_risk_flag);
  });

  it('sentiment reads the page default headlines as bullish and a gloomy set as bearish', async () => {
    const good = await call('post', '/predictive/sentiment/headlines', {
      headlines: ['Tech earnings beat estimates across the board', 'Fed signals potential rate cuts this year', 'Strong jobs report eases recession fears'],
      subject: 'market',
    });
    expect(good.aggregate_label).toBe('bullish');
    expect(good.dominant_themes.length).toBeGreaterThan(0);
    const bad = await call('post', '/predictive/sentiment/headlines', { headlines: ['Stocks plunge as recession fears grow', 'Bank warns of default risk and layoffs'], subject: 'market' });
    expect(bad.aggregate_label).toBe('bearish');
    expect(bad.top_risks.length).toBeGreaterThan(0);
  });

  it('ESG scores are bounded, rated, and weighted at portfolio level', async () => {
    const r = await call('post', '/predictive/esg', { symbol: 'AAPL', sector: 'technology' });
    for (const k of ['environmental', 'social', 'governance', 'composite']) {
      expect(r.scores[k]).toBeGreaterThan(0);
      expect(r.scores[k]).toBeLessThanOrEqual(100);
    }
    expect(['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC']).toContain(r.scores.rating);
    expect(r.is_simulated).toBe(true);
    const p = await call('post', '/predictive/esg/portfolio', { holdings: [{ symbol: 'AAPL', sector: 'technology', weight: 0.5 }, { symbol: 'XOM', sector: 'energy', weight: 0.5 }] });
    const comps = p.holdings.map((h: any) => h.scores.composite);
    expect(p.portfolio_scores.composite).toBeGreaterThanOrEqual(Math.min(...comps));
    expect(p.portfolio_scores.composite).toBeLessThanOrEqual(Math.max(...comps));
  });

  it('earnings-surprise probabilities sum to one', async () => {
    const r = await call('post', '/predictive/earnings-surprise', { symbol: 'AAPL', recent_returns: demoReturns(60) });
    expect(r.beat_probability + r.miss_probability + r.in_line_probability).toBeCloseTo(1, 2);
    expect(r.implied_move_pct).toBeGreaterThan(0);
  });
});

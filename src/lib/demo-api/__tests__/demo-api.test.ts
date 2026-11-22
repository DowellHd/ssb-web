import { describe, expect, it, vi } from 'vitest';
import shapes from '../catch-all-shapes.json';
import { resolveDemoRequest } from '../index';
import { correlation, dailyBars, lastPrice } from '../market';

const call = async (method: string, url: string, data?: unknown, params?: Record<string, unknown>) => {
  try {
    return await resolveDemoRequest({ method, url, data, params });
  } catch (err: any) {
    // A route deliberately simulating an HTTP error (e.g. unknown order id) still counts as handled.
    if (err?.name === 'DemoHttpError') return { detail: err.detail };
    throw err;
  }
};

/** Fill `:p0`-style params so shape keys become concrete URLs. */
const concrete = (pattern: string) => pattern.replace(/:p\d+/g, 'demo-id');

describe('demo-api', () => {
  it('answers every known API endpoint with a truthy value (nothing falls through)', async () => {
    for (const key of Object.keys(shapes)) {
      const [method, pattern] = key.split(' ');
      const res = await call(method, concrete(pattern));
      expect(res, key).toBeTruthy();
    }
  });

  it('never calls Math.random', async () => {
    const spy = vi.spyOn(Math, 'random');
    for (const key of Object.keys(shapes)) {
      const [method, pattern] = key.split(' ');
      await call(method, concrete(pattern));
    }
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('is deterministic: identical reads give identical responses', async () => {
    // Writes mint sequential ids (order-1001, order-1002, …), so only reads are idempotent.
    for (const key of Object.keys(shapes).filter((k) => k.startsWith('GET '))) {
      const [method, pattern] = key.split(' ');
      const a = await call(method, concrete(pattern));
      const b = await call(method, concrete(pattern));
      expect(JSON.stringify(a), key).toEqual(JSON.stringify(b));
    }
  });

  it('uses one price per symbol across quotes, bars and positions', async () => {
    const quote: any = await call('get', '/market-data/quote/AAPL');
    const mid = (quote.bid_price + quote.ask_price) / 2;
    expect(Math.abs(mid - lastPrice('AAPL'))).toBeLessThan(0.2);
    const bars = dailyBars('AAPL', 60);
    expect(bars[bars.length - 1].close).toBe(lastPrice('AAPL'));
    const portfolio: any = await call('get', '/trading/portfolio');
    const aapl = portfolio.positions.find((p: any) => p.symbol === 'AAPL');
    expect(aapl.current_price).toBe(lastPrice('AAPL'));
  });

  it('prefers a specific route over a parameterised one', async () => {
    const res: any = await call('post', '/auth/login', { email: 'a@b.c', password: 'x' });
    expect(res.access_token).toBeTruthy();
    expect(res.user.email).toBe('demo@example.com');
  });
});

describe('portfolio analytics', () => {
  const holdings = [
    { symbol: 'AAPL', weight: 0.4, sector: 'Technology' },
    { symbol: 'JPM', weight: 0.3, sector: 'Financials' },
    { symbol: 'XOM', weight: 0.3, sector: 'Energy' },
  ];

  it('attribution effects reconcile with the active return', async () => {
    const a: any = await call('post', '/portfolio/attribution', { holdings, benchmark_symbol: 'SPY', period_days: 30 });
    const sum = a.allocation_effect + a.selection_effect + a.interaction_effect;
    expect(Math.abs(sum - a.active_return)).toBeLessThan(0.0006);
  });

  it('stress test ranks scenarios worst-first and reports the worst one', async () => {
    const s: any = await call('post', '/portfolio/stress-test', { holdings, portfolio_value: 100000 });
    const impacts = s.scenarios.map((x: any) => x.portfolio_impact_pct);
    expect([...impacts].sort((a: number, b: number) => a - b)).toEqual(impacts);
    expect(s.max_drawdown_scenario).toBe(s.scenarios[0].scenario);
  });

  it('correlation matrix is symmetric with a unit diagonal', async () => {
    const c: any = await call('post', '/portfolio/correlation', { symbols: ['AAPL', 'MSFT', 'XOM'] });
    expect(c.correlation_matrix.AAPL.AAPL).toBe(1);
    expect(c.correlation_matrix.AAPL.XOM).toBe(c.correlation_matrix.XOM.AAPL);
  });
});

describe('market model', () => {
  it('returns identical bars for the same date regardless of request length', () => {
    const short = dailyBars('MSFT', 30);
    const long = dailyBars('MSFT', 120);
    expect(long.slice(-30)).toEqual(short);
  });

  it('keeps bars internally valid (low ≤ open/close ≤ high)', () => {
    for (const b of dailyBars('NVDA', 250)) {
      expect(b.low).toBeLessThanOrEqual(Math.min(b.open, b.close));
      expect(b.high).toBeGreaterThanOrEqual(Math.max(b.open, b.close));
    }
  });

  it('correlations behave: same-sector > cross-sector, bonds diversify equities', () => {
    expect(correlation('AAPL', 'MSFT')).toBeGreaterThan(correlation('AAPL', 'XOM'));
    expect(correlation('AAPL', 'SPY')).toBeGreaterThan(0.3);
    expect(correlation('SPY', 'TLT')).toBeLessThan(0.3);
  });
});

describe('crypto, news and learn', () => {
  it('crypto prices are ranked by market cap and the overview adds up', async () => {
    const prices: any = await call('get', '/crypto/prices', undefined, { page: 1, per_page: 20 });
    const caps = prices.coins.map((c: any) => c.market_cap);
    expect([...caps].sort((a: number, b: number) => b - a)).toEqual(caps);
    expect(prices.coins[0].coin_id).toBe('bitcoin');
    const overview: any = await call('get', '/crypto/market-overview');
    expect(overview.total_market_cap_usd).toBe(caps.reduce((a: number, b: number) => a + b, 0));
    expect(overview.btc_dominance).toBeGreaterThan(30);
  });

  it('crypto watchlist add/remove round-trips', async () => {
    const before: any = await call('get', '/crypto/watchlist');
    const after: any = await call('post', '/crypto/watchlist', { coin_id: 'cardano', symbol: 'ADA', name: 'Cardano' });
    expect(after.total).toBe(before.total + 1);
    await call('delete', '/crypto/watchlist/cardano');
    const final: any = await call('get', '/crypto/watchlist');
    expect(final.total).toBe(before.total);
  });

  it('news filters by category, sentiment and symbol, and paginates', async () => {
    const all: any = await call('get', '/news', undefined, { page_size: 100 });
    expect(all.total_count).toBeGreaterThan(20);
    const crypto: any = await call('get', '/news', undefined, { categories: 'crypto' });
    expect(crypto.articles.every((a: any) => a.category === 'crypto')).toBe(true);
    const aapl: any = await call('get', '/news', undefined, { symbols: 'AAPL' });
    expect(aapl.articles.every((a: any) => a.symbols.includes('AAPL'))).toBe(true);
    const page1: any = await call('get', '/news', undefined, { page: 1, page_size: 5 });
    expect(page1.articles).toHaveLength(5);
    expect(page1.has_more).toBe(true);
    const one: any = await call('get', `/news/${page1.articles[0].id}`);
    expect(one.content.length).toBeGreaterThan(20);
    const summary: any = await call('get', '/news/summary/daily');
    expect(summary.summary.top_gainers[0].change_percent).toBeGreaterThanOrEqual(summary.summary.top_losers[0].change_percent);
  });

  it('learn modules, paths and glossary resolve with consistent ids', async () => {
    const mods: any = await call('get', '/learn/modules');
    expect(mods.modules.length).toBe(mods.total_count);
    const detail: any = await call('get', `/learn/modules/${mods.modules[0].id}`);
    expect(detail.module.id).toBe(mods.modules[0].id);
    const paths: any = await call('get', '/learn/paths');
    const path: any = await call('get', `/learn/paths/${paths.paths[0].id}`);
    expect(path.modules.length).toBe(paths.paths[0].modules.length);
    const gloss: any = await call('get', '/learn/glossary');
    expect(gloss.terms.length).toBeGreaterThan(30);
    const found: any = await call('get', '/learn/glossary/search', undefined, { q: 'volatility' });
    expect(found.total_matches).toBeGreaterThan(0);
  });
});

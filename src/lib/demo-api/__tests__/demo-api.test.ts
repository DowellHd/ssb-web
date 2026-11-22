import { describe, expect, it, vi } from 'vitest';
import shapes from '../catch-all-shapes.json';
import { resolveDemoRequest } from '../index';
import { dailyBars, lastPrice } from '../market';

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

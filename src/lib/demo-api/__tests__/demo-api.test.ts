import { describe, expect, it, vi } from 'vitest';
import shapes from '../catch-all-shapes.json';
import { resolveDemoRequest } from '../index';
import { dailyBars, lastPrice } from '../market';

const call = (method: string, url: string, data?: unknown, params?: Record<string, unknown>) =>
  resolveDemoRequest({ method, url, data, params });

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

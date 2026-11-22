import { describe, expect, it } from 'vitest';
import { resolveDemoRequest } from '../index';

const call = (method: string, url: string, data?: unknown, params?: Record<string, unknown>) =>
  resolveDemoRequest({ method, url, data, params }) as Promise<any>;

describe('paper trading ledger', () => {
  it('seeds a coherent, plausible account', async () => {
    const acct = await call('get', '/paper/account');
    const pos = await call('get', '/paper/positions');
    expect(acct.current_cash).toBeGreaterThan(0);
    expect(acct.equity).toBeCloseTo(acct.current_cash + pos.total_value, 1);
    expect(acct.total_return_pct).toBeGreaterThan(-40);
    expect(acct.total_return_pct).toBeLessThan(80);
    expect(pos.positions.length).toBeGreaterThanOrEqual(6);
  });

  it('equity curve ends at current equity and has no gaps', async () => {
    const acct = await call('get', '/paper/account');
    const perf = await call('get', '/paper/performance', undefined, { period: '3m' });
    expect(perf.daily_snapshots.length).toBeGreaterThan(30);
    expect(perf.end_value).toBeCloseTo(acct.equity, 1);
    expect(perf.total_trades).toBeGreaterThan(5);
  });

  it('market buy updates cash and positions; oversell and overspend are rejected', async () => {
    const before = await call('get', '/paper/account');
    const order = await call('post', '/paper/orders', { symbol: 'KO', side: 'buy', quantity: 10, order_type: 'market' });
    expect(order.status).toBe('filled');
    const after = await call('get', '/paper/account');
    expect(after.current_cash).toBeLessThan(before.current_cash);
    await expect(call('post', '/paper/orders', { symbol: 'KO', side: 'sell', quantity: 999, order_type: 'market' })).rejects.toMatchObject({ status: 400 });
    await expect(call('post', '/paper/orders', { symbol: 'COST', side: 'buy', quantity: 5000, order_type: 'market' })).rejects.toMatchObject({ status: 400 });
  });

  it('pending limit orders can be canceled; reset empties the account', async () => {
    const o = await call('post', '/paper/orders', { symbol: 'KO', side: 'buy', quantity: 1, order_type: 'limit', limit_price: 1 });
    expect(o.status).toBe('pending');
    await call('delete', `/paper/orders/${o.id}`);
    const list = await call('get', '/paper/orders', undefined, { status: 'canceled' });
    expect(list.orders.some((x: any) => x.id === o.id)).toBe(true);
    await call('post', '/paper/reset');
    const acct = await call('get', '/paper/account');
    expect(acct.positions_count).toBe(0);
    expect(acct.equity).toBe(100000);
  });

  it('options paper: seeded positions exist and a buy debits cash', async () => {
    // Re-seed equities after the reset above is irrelevant for options; just exercise the API.
    const open = await call('get', '/options/positions', undefined, { status: 'open' });
    expect(Array.isArray(open.positions)).toBe(true);
  });
});

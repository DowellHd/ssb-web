/** Brokerage-style trading endpoints (portfolio, positions, account, orders). */
import { generateMockOrders, generateMockPortfolio } from '../../mock-data';
import { demoNow, iso, newId } from '../prng';
import { get, post, type DemoRoute } from '../router';
import { lastPrice } from '../market';

export const tradingRoutes: DemoRoute[] = [
  get('/trading/portfolio', () => generateMockPortfolio()),
  get('/trading/positions', () => generateMockPortfolio().positions),
  get('/trading/account', () => generateMockPortfolio().account),
  get('/trading/orders', () => generateMockOrders(10)),
  post('/trading/orders', ({ body }) => ({
    id: newId('order'),
    user_id: 'demo-user-001',
    mode: 'paper',
    ...body,
    status: 'filled',
    filled_quantity: body?.quantity ?? 0,
    filled_avg_price: body?.symbol ? lastPrice(body.symbol) : null,
    created_at: iso(demoNow()),
  })),
];

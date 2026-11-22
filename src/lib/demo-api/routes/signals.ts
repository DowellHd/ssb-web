/** Signal endpoints. */
import { generateMockSignals } from '../../mock-data';
import { get, post, type DemoRoute } from '../router';

export const signalRoutes: DemoRoute[] = [
  post('/signals/generate', () => generateMockSignals(1, false)[0]),
  post('/signals/bulk', ({ body }) => {
    const symbols: string[] = body?.symbols || ['AAPL', 'GOOGL', 'MSFT'];
    return { signals: generateMockSignals(symbols.length, false), total: symbols.length };
  }),
  get('/signals/delay-info', () => ({
    plan: 'pro',
    delay_minutes: 0,
    is_realtime: true,
    message: 'Real-time signals are included in your plan',
  })),
];

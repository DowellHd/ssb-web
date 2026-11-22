/** Signal feed, detail, logging and performance — plus the legacy generate/bulk endpoints. */
import { generateMockSignals } from '../../mock-data';
import { DemoHttpError } from '../errors';
import { dailyBars, lastPrice } from '../market';
import { allSignals, technicals } from '../signals-data';
import { iso, newId, round } from '../prng';
import { get, post, type DemoRoute } from '../router';

// Trade-log stats (in memory): seeded history, bumped as the user logs trades.
const perf = {
  total_logged: 14,
  open_trades: 3,
  closed_trades: 11,
  win_rate: 0.64 as number | null,
  avg_return_pct: 3.8 as number | null,
  avg_risk_reward: 1.9 as number | null,
  best_trade_pct: 14.2 as number | null,
  worst_trade_pct: -6.1 as number | null,
};

const findSignal = (id: string) => {
  const s = allSignals().find((x) => x.id === id);
  if (!s) throw new DemoHttpError(404, 'Signal not found');
  return s;
};

export const signalRoutes: DemoRoute[] = [
  get('/signals', ({ query }) => {
    const page = Math.max(1, Number(query.page) || 1);
    const perPage = Math.min(100, Math.max(1, Number(query.per_page) || 12));
    const minConf = query.min_confidence !== undefined ? Number(query.min_confidence) : 0;
    const ticker = query.ticker?.trim().toUpperCase();

    const filtered = allSignals().filter(
      (s) =>
        (!query.signal_type || s.signal_type === query.signal_type) &&
        (!query.asset_class || s.asset_class === query.asset_class) &&
        (!query.time_horizon || s.time_horizon === query.time_horizon) &&
        s.confidence_score >= minConf &&
        (!ticker || s.ticker.includes(ticker)),
    );
    const items = filtered.slice((page - 1) * perPage, page * perPage).map((s) => ({
      id: s.id,
      ticker: s.ticker,
      signal_type: s.signal_type,
      confidence_score: s.confidence_score,
      trend_bias: s.trend_bias,
      time_horizon: s.time_horizon,
      asset_class: s.asset_class,
      plain_english_summary: s.plain_english_summary,
      generated_at: s.generated_at,
      expires_at: s.expires_at,
    }));
    return { items, total: filtered.length, page, per_page: perPage };
  }),

  get('/signals/performance', () => ({ ...perf })),

  // Legacy/demo helpers kept from the original mock set.
  get('/signals/delay-info', () => ({
    plan: 'pro',
    delay_minutes: 0,
    is_realtime: true,
    message: 'Real-time signals are included in your plan',
  })),
  post('/signals/generate', () => generateMockSignals(1, false)[0]),
  post('/signals/bulk', ({ body }) => {
    const symbols: string[] = body?.symbols || ['AAPL', 'GOOGL', 'MSFT'];
    return { signals: generateMockSignals(symbols.length, false), total: symbols.length };
  }),

  get('/signals/:id', ({ params }) => ({ ...findSignal(params.id) })),

  post('/signals/:id/log', ({ params, body }) => {
    const s = findSignal(params.id);
    perf.total_logged += 1;
    perf.open_trades += 1;
    return {
      id: newId('trade'),
      ticker: s.ticker,
      entry_price: Number(body?.entry_price) || s.entry_zone_high || lastPrice(s.ticker),
      logged_at: iso(new Date()),
      status: 'open',
    };
  }),

  get('/signals/:id/intraday-refinement', ({ params }) => {
    const s = findSignal(params.id);
    const t = technicals(s.ticker);
    const bars = dailyBars(s.ticker, 3);
    const momentum = t.changePct5d > 0.6 ? 'trending_up' : t.changePct5d < -0.6 ? 'trending_down' : 'consolidating';
    const vwap = round((bars[bars.length - 1].high + bars[bars.length - 1].low + t.price) / 3);
    return {
      ticker: s.ticker,
      refined_entry_low: round(t.price * 0.994),
      refined_entry_high: round(t.price * 1.002),
      nearest_support: round(t.low20),
      nearest_resistance: round(t.high20),
      intraday_momentum: momentum,
      vwap,
      vwap_position: t.price > vwap * 1.001 ? 'above' : t.price < vwap * 0.999 ? 'below' : 'at',
      current_price: t.price,
      bars_used: 78,
      timeframe: '5m',
      note: 'Intraday levels are illustrative demo data and refresh only when the page reloads.',
    };
  }),
];

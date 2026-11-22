/** Market data: quotes, bars, market status, option chain. */
import { generateMockOHLCV, generateMockQuote } from '../../mock-data';
import { dailyBars, getInstrument, lastPrice } from '../market';
import { expirationsFor, optionSnapshot, strikesAround } from '../options-math';
import { demoNow, gaussian, hashString, iso, round, seededRng } from '../prng';
import { get, type DemoRoute } from '../router';

const DAY = 86_400_000;

/** Intraday bars for the most recent sessions, oldest first. Last close == price. */
function intradayBars(symbol: string, minutes: number, limit: number) {
  const sym = symbol.toUpperCase();
  const inst = getInstrument(sym);
  const rng = seededRng(`intraday:${sym}:${minutes}`);
  const perMinuteVol = inst.vol / Math.sqrt(252 * 390);
  const step = Math.sqrt(minutes) * perMinuteVol;

  // Walk backwards over session minutes (13:30–20:00 UTC), skipping weekends.
  const times: number[] = [];
  let day = demoNow().getTime();
  while (times.length < limit) {
    const dow = new Date(day).getUTCDay();
    if (dow !== 0 && dow !== 6) {
      for (let t = 20 * 60 - minutes; t >= 13 * 60 + 30 && times.length < limit; t -= minutes) {
        times.push(day + t * 60_000);
      }
    }
    day -= DAY;
  }
  times.reverse();

  const rets = times.map(() => step * gaussian(rng));
  const logFromEnd: number[] = new Array(times.length).fill(0);
  for (let i = times.length - 2; i >= 0; i--) logFromEnd[i] = logFromEnd[i + 1] - rets[i + 1];

  return times.map((t, i) => {
    const close = inst.price * Math.exp(logFromEnd[i]);
    const open = i === 0 ? close : inst.price * Math.exp(logFromEnd[i - 1]);
    const wiggle = close * step * (0.2 + rng() * 0.5);
    return {
      symbol: sym,
      timestamp: new Date(t).toISOString(),
      open: round(open),
      high: round(Math.max(open, close) + wiggle * rng()),
      low: round(Math.min(open, close) - wiggle * rng()),
      close: i === times.length - 1 ? inst.price : round(close),
      volume: Math.floor((20_000 + (hashString(`iv:${sym}`) % 200_000)) * (0.5 + rng())),
    };
  });
}

function aggregate(symbol: string, bucket: 'week' | 'month', limit: number) {
  const sym = symbol.toUpperCase();
  const daily = dailyBars(sym, Math.min(2000, limit * (bucket === 'week' ? 5 : 21)));
  const groups = new Map<string, typeof daily>();
  for (const b of daily) {
    const d = new Date(b.time * 1000);
    const key =
      bucket === 'month'
        ? `${d.getUTCFullYear()}-${d.getUTCMonth()}`
        : `${d.getUTCFullYear()}-${Math.floor((d.getTime() - Date.UTC(d.getUTCFullYear(), 0, 1)) / (7 * DAY))}`;
    groups.set(key, [...(groups.get(key) ?? []), b]);
  }
  return [...groups.values()].slice(-limit).map((g) => ({
    symbol: sym,
    timestamp: new Date(g[0].time * 1000).toISOString(),
    open: g[0].open,
    high: Math.max(...g.map((b) => b.high)),
    low: Math.min(...g.map((b) => b.low)),
    close: g[g.length - 1].close,
    volume: g.reduce((s, b) => s + b.volume, 0),
  }));
}

export const marketDataRoutes: DemoRoute[] = [
  get('/market-data/quote/:symbol', ({ params }) => generateMockQuote(params.symbol)),

  get('/market-data/quotes', ({ query }) => {
    const symbols = (query.symbols || 'AAPL,GOOGL,MSFT').split(',').filter(Boolean);
    return symbols.map((s) => generateMockQuote(s));
  }),

  get('/market-data/bars/:symbol', ({ params, query }) => {
    const limit = Math.min(Number(query.limit) || 100, 1000);
    return {
      symbol: params.symbol.toUpperCase(),
      timeframe: query.timeframe || '1Day',
      bars: generateMockOHLCV(params.symbol, limit),
      count: limit,
    };
  }),

  get('/market-data/status', () => ({
    is_open: false,
    next_open: iso(new Date(demoNow().getTime() + DAY + 13.5 * 3_600_000)),
    next_close: iso(new Date(demoNow().getTime() + DAY + 20 * 3_600_000)),
    timestamp: iso(demoNow()),
  })),

  get('/data/bars/:symbol', ({ params, query }) => {
    const tf = query.timeframe || '1d';
    const limit = Math.min(Number(query.limit) || 200, 1000);
    const sym = params.symbol.toUpperCase();
    let bars;
    if (tf === '1d') {
      bars = dailyBars(sym, limit).map((b) => ({
        symbol: sym,
        timestamp: new Date(b.time * 1000).toISOString(),
        open: b.open,
        high: b.high,
        low: b.low,
        close: b.close,
        volume: b.volume,
      }));
    } else if (tf === '1w') bars = aggregate(sym, 'week', limit);
    else if (tf === '1mo') bars = aggregate(sym, 'month', limit);
    else bars = intradayBars(sym, { '1m': 1, '5m': 5, '15m': 15, '1h': 60 }[tf] ?? 5, limit);
    return {
      symbol: sym,
      asset_class: query.asset_class || (getInstrument(sym).assetClass === 'equity' ? 'stocks' : 'etfs'),
      timeframe: tf,
      bars,
      source: 'demo',
      quality_score: 1,
    };
  }),

  // ── Options market data ───────────────────────────────────────────────────
  get('/market-data/option/expirations/:symbol', ({ params }) => expirationsFor(params.symbol)),

  get('/market-data/option/chain/:symbol', ({ params, query }) => {
    const expiry = query.expiry || expirationsFor(params.symbol)[0];
    return strikesAround(params.symbol, 10).flatMap((strike) => [
      optionSnapshot(params.symbol, expiry, 'call', strike),
      optionSnapshot(params.symbol, expiry, 'put', strike),
    ]);
  }),

  get('/market-data/option/snapshot', ({ query }) =>
    optionSnapshot(
      query.symbol || 'AAPL',
      query.expiry || expirationsFor(query.symbol || 'AAPL')[0],
      query.right === 'put' ? 'put' : 'call',
      Number(query.strike) || Math.round(lastPrice(query.symbol || 'AAPL')),
    ),
  ),
];

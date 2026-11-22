/** Deterministic technical-analysis signals derived from the shared price series. */
import { dailyBars, getInstrument, lastPrice } from './market';
import { hashString, hoursAgo, iso, round, seedId } from './prng';

export interface Technicals {
  price: number;
  sma20: number;
  sma50: number;
  sma200: number;
  rsi14: number;
  high20: number;
  low20: number;
  changePct5d: number;
}

export function technicals(symbol: string): Technicals {
  const closes = dailyBars(symbol, 260).map((b) => b.close);
  const sma = (n: number) => closes.slice(-n).reduce((a, b) => a + b, 0) / n;
  let gains = 0;
  let losses = 0;
  for (let i = closes.length - 14; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    if (d > 0) gains += d;
    else losses -= d;
  }
  const rs = losses === 0 ? 100 : gains / losses;
  const last20 = closes.slice(-20);
  return {
    price: lastPrice(symbol),
    sma20: round(sma(20)),
    sma50: round(sma(50)),
    sma200: round(sma(200)),
    rsi14: round(100 - 100 / (1 + rs), 1),
    high20: round(Math.max(...last20)),
    low20: round(Math.min(...last20)),
    changePct5d: round((closes[closes.length - 1] / closes[closes.length - 6] - 1) * 100, 2),
  };
}

const STOCKS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'AMD', 'NFLX', 'CRM', 'ORCL', 'JPM', 'BAC', 'V', 'UNH', 'JNJ', 'KO', 'PEP', 'WMT', 'COST', 'HD', 'XOM', 'CVX', 'DIS', 'PLTR'];
const ETFS = ['SPY', 'QQQ', 'IWM', 'XLK', 'XLF', 'XLE', 'GLD', 'TLT'];
const CRYPTO = ['BTC', 'ETH', 'SOL', 'XRP'];

export type SignalType =
  | 'bullish_setup'
  | 'bearish_setup'
  | 'momentum'
  | 'mean_reversion'
  | 'breakout'
  | 'earnings_play';

export interface DemoSignal {
  id: string;
  ticker: string;
  signal_type: SignalType;
  confidence_score: number;
  trend_bias: 'bullish' | 'bearish' | 'neutral';
  time_horizon: 'short_term' | 'medium_term' | 'long_term';
  asset_class: 'stocks' | 'etf' | 'crypto';
  plain_english_summary: string;
  generated_at: string;
  expires_at: string;
  signal_strength: number;
  supporting_data: Record<string, unknown>;
  entry_zone_low: number | null;
  entry_zone_high: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  risk_reward_ratio: number | null;
  historical_accuracy: number | null;
}

interface Classification {
  type: SignalType;
  bias: DemoSignal['trend_bias'];
  horizon: DemoSignal['time_horizon'];
  summary: string;
  strength: number;
}

function classify(symbol: string, t: Technicals): Classification {
  const h = hashString(`sigtype:${symbol}`);
  const up = t.price > t.sma50 && t.sma50 > t.sma200;
  const down = t.price < t.sma50 && t.sma50 < t.sma200;
  const money = (n: number) => `$${n.toFixed(2)}`;

  if (t.rsi14 < 35) {
    return {
      type: 'mean_reversion',
      bias: 'bullish',
      horizon: 'short_term',
      strength: 0.6 + (35 - t.rsi14) / 100,
      summary: `${symbol} looks oversold (RSI ${t.rsi14}) after a ${Math.abs(t.changePct5d)}% move this week. Historically similar readings have often seen a partial rebound toward the 20-day average near ${money(t.sma20)}.`,
    };
  }
  if (t.price >= t.high20 * 0.995 && up) {
    return {
      type: 'breakout',
      bias: 'bullish',
      horizon: 'short_term',
      strength: 0.7,
      summary: `${symbol} is pressing against its 20-day high (${money(t.high20)}) with the 50-day average above the 200-day. A sustained close above that level would confirm the breakout.`,
    };
  }
  if (down) {
    return {
      type: 'bearish_setup',
      bias: 'bearish',
      horizon: 'medium_term',
      strength: 0.62,
      summary: `${symbol} trades below both its 50-day (${money(t.sma50)}) and 200-day (${money(t.sma200)}) averages. The downtrend is intact until price reclaims the 50-day.`,
    };
  }
  if (up && t.rsi14 >= 50) {
    return {
      type: 'momentum',
      bias: 'bullish',
      horizon: 'medium_term',
      strength: 0.66 + Math.min(0.2, (t.rsi14 - 50) / 100),
      summary: `${symbol} shows steady upside momentum: price above rising 50- and 200-day averages and RSI at ${t.rsi14}. Pullbacks toward ${money(t.sma20)} have been supported.`,
    };
  }
  if (h % 9 === 0) {
    return {
      type: 'earnings_play',
      bias: 'neutral',
      horizon: 'short_term',
      strength: 0.55,
      summary: `${symbol} is approaching its next earnings report. Options markets imply a larger-than-usual move, so event risk can dominate the technical picture.`,
    };
  }
  return t.price >= t.sma200
    ? {
        type: 'bullish_setup',
        bias: 'bullish',
        horizon: 'long_term',
        strength: 0.58,
        summary: `${symbol} is holding above its 200-day average (${money(t.sma200)}) while consolidating. A move back above the 50-day (${money(t.sma50)}) would improve the setup.`,
      }
    : {
        type: 'bearish_setup',
        bias: 'bearish',
        horizon: 'medium_term',
        strength: 0.56,
        summary: `${symbol} has slipped below its 200-day average (${money(t.sma200)}). Failure to reclaim it keeps the longer-term trend under pressure.`,
      };
}

let cache: DemoSignal[] | null = null;

export function allSignals(): DemoSignal[] {
  if (cache) return cache;
  const universe: Array<[string, DemoSignal['asset_class']]> = [
    ...STOCKS.map((s): [string, DemoSignal['asset_class']] => [s, 'stocks']),
    ...ETFS.map((s): [string, DemoSignal['asset_class']] => [s, 'etf']),
    ...CRYPTO.map((s): [string, DemoSignal['asset_class']] => [s, 'crypto']),
  ];

  const signals: DemoSignal[] = universe.map(([symbol, assetClass], i) => {
    const t = technicals(symbol);
    const c = classify(symbol, t);
    const jitter = (hashString(`conf:${symbol}`) % 100) / 1000; // 0–0.099
    const confidence = round(Math.min(0.94, Math.max(0.52, c.strength + jitter - 0.03)), 2);
    const long = c.bias !== 'bearish';
    const vol = getInstrument(symbol).vol;
    const risk = t.price * Math.max(0.03, Math.min(0.12, vol * 0.22));
    const stop = long ? t.price - risk : t.price + risk;
    const target = long ? t.price + risk * 2 : t.price - risk * 2;
    const rsiSignal = t.rsi14 > 70 ? 'overbought' : t.rsi14 < 30 ? 'oversold' : 'neutral';

    return {
      id: seedId('sig', i + 1),
      ticker: symbol,
      signal_type: c.type,
      confidence_score: confidence,
      trend_bias: c.bias,
      time_horizon: c.horizon,
      asset_class: assetClass,
      plain_english_summary: c.summary,
      generated_at: iso(hoursAgo(1 + i * 1.3)),
      expires_at: iso(hoursAgo(-(24 + (i % 5) * 12))),
      signal_strength: round(c.strength, 2),
      supporting_data: {
        current_price: t.price,
        RSI: { value: t.rsi14, signal: rsiSignal },
        SMA_20: { value: t.sma20, signal: t.price > t.sma20 ? 'above' : 'below' },
        SMA_50: { value: t.sma50, signal: t.price > t.sma50 ? 'above' : 'below' },
        SMA_200: { value: t.sma200, signal: t.price > t.sma200 ? 'above' : 'below' },
        '20d_high': { value: t.high20 },
        '5d_change_pct': { value: t.changePct5d },
      },
      entry_zone_low: round(t.price * 0.99),
      entry_zone_high: round(t.price * 1.005),
      stop_loss: round(stop),
      take_profit: round(target),
      risk_reward_ratio: 2.0,
      historical_accuracy: round(0.52 + (hashString(`acc:${c.type}`) % 17) / 100, 2),
    };
  });

  // Strongest first, like a ranked feed.
  signals.sort((a, b) => b.confidence_score - a.confidence_score);
  cache = signals;
  return signals;
}

/**
 * Mock data generators for demo mode.
 *
 * Deterministic: every value is derived from the seeded PRNG / market module in
 * `./demo-api`, so the demo looks identical on every run and a symbol has the
 * same price in quotes, charts, positions and orders.
 */
import {
  dailyBars,
  lastPrice,
  quoteFor,
  simpleMovingAverage,
} from './demo-api/market';
import {
  daysAgo,
  hoursAgo,
  iso,
  pick,
  randBetween,
  randInt,
  round,
  seededRng,
} from './demo-api/prng';

export interface MockSignal {
  id: string;
  symbol: string;
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  reason: string;
  strategy: string;
  current_price: number;
  sma_50?: number;
  sma_200?: number;
  timestamp: string;
  available_at: string;
  delayed: boolean;
  delay_minutes: number;
}

export interface MockPosition {
  symbol: string;
  quantity: number;
  avg_entry_price: number;
  current_price: number;
  market_value: number;
  cost_basis: number;
  unrealized_pl: number;
  unrealized_pl_percent: number;
}

export interface MockPortfolio {
  account: {
    cash: number;
    buying_power: number;
    equity: number;
    portfolio_value: number;
    currency: string;
    daytrade_count: number;
    pattern_day_trader: boolean;
  };
  positions: MockPosition[];
  total_positions: number;
  total_market_value: number;
  total_unrealized_pl: number;
  total_unrealized_pl_percent: number;
}

export interface MockOHLCVBar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MockQuote {
  symbol: string;
  bid_price: number;
  ask_price: number;
  bid_size: number;
  ask_size: number;
  timestamp: string;
}

const SIGNAL_SYMBOLS = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA', 'META', 'AMD', 'NFLX', 'SPY'];

/**
 * Generate mock trading signals. Direction is derived from the symbol's actual
 * 50/200-day averages so the explanation text always agrees with the numbers.
 */
export function generateMockSignals(count: number = 20, delayed: boolean = false): MockSignal[] {
  return Array.from({ length: count }, (_, i) => {
    const rng = seededRng(`legacy-signal:${i}`);
    const symbol = SIGNAL_SYMBOLS[i % SIGNAL_SYMBOLS.length];
    const price = lastPrice(symbol);
    const sma50 = simpleMovingAverage(symbol, 50);
    const sma200 = simpleMovingAverage(symbol, 200);
    const spread = (sma50 - sma200) / sma200;
    const fresh = i < SIGNAL_SYMBOLS.length; // newest batch = fresh crossovers
    const action: MockSignal['action'] = !fresh ? 'hold' : spread > 0 ? 'buy' : 'sell';
    const confidence = round(0.55 + Math.min(0.4, Math.abs(spread) * 4) + rng() * 0.05, 2);

    const timestamp = hoursAgo(i + 1);
    const availableAt = delayed ? new Date(timestamp.getTime() + 15 * 60000) : timestamp;

    let reason: string;
    if (action === 'buy') {
      reason = `Golden cross detected: 50-day SMA ($${sma50.toFixed(2)}) crossed above 200-day SMA ($${sma200.toFixed(2)})`;
    } else if (action === 'sell') {
      reason = `Death cross detected: 50-day SMA ($${sma50.toFixed(2)}) crossed below 200-day SMA ($${sma200.toFixed(2)})`;
    } else {
      reason =
        sma50 > sma200
          ? `Uptrend continues: 50-day SMA ($${sma50.toFixed(2)}) above 200-day SMA ($${sma200.toFixed(2)})`
          : `Downtrend continues: 50-day SMA ($${sma50.toFixed(2)}) below 200-day SMA ($${sma200.toFixed(2)})`;
    }

    return {
      id: `mock-signal-${i}`,
      symbol,
      action,
      confidence: Math.min(confidence, 0.95),
      reason,
      strategy: 'sma_crossover',
      current_price: price,
      sma_50: sma50,
      sma_200: sma200,
      timestamp: iso(timestamp),
      available_at: iso(availableAt),
      delayed,
      delay_minutes: delayed ? 15 : 0,
    };
  });
}

/** [symbol, quantity, average entry price as a fraction of today's price] */
const PORTFOLIO_LOTS: Array<[string, number, number]> = [
  ['AAPL', 50, 0.93],
  ['MSFT', 30, 0.9],
  ['GOOGL', 25, 1.04],
  ['NVDA', 15, 0.72],
];

/** Mock brokerage portfolio. Marks come from the shared market module. */
export function generateMockPortfolio(): MockPortfolio {
  const positions: MockPosition[] = PORTFOLIO_LOTS.map(([symbol, quantity, costRatio]) => {
    const current = lastPrice(symbol);
    const avg = round(current * costRatio);
    const marketValue = round(current * quantity);
    const costBasis = round(avg * quantity);
    const pl = round(marketValue - costBasis);
    return {
      symbol,
      quantity,
      avg_entry_price: avg,
      current_price: current,
      market_value: marketValue,
      cost_basis: costBasis,
      unrealized_pl: pl,
      unrealized_pl_percent: round((pl / costBasis) * 100, 2),
    };
  });

  const totalMarketValue = round(positions.reduce((s, p) => s + p.market_value, 0));
  const totalPL = round(positions.reduce((s, p) => s + p.unrealized_pl, 0));
  const cash = 8573.0;
  const portfolioValue = round(totalMarketValue + cash);

  return {
    account: {
      cash,
      buying_power: cash * 2,
      equity: portfolioValue,
      portfolio_value: portfolioValue,
      currency: 'USD',
      daytrade_count: 2,
      pattern_day_trader: false,
    },
    positions,
    total_positions: positions.length,
    total_market_value: totalMarketValue,
    total_unrealized_pl: totalPL,
    total_unrealized_pl_percent: round((totalPL / (totalMarketValue - totalPL)) * 100, 2),
  };
}

/** Historical OHLCV bars for charting (oldest first). */
export function generateMockOHLCV(symbol: string, days: number = 100): MockOHLCVBar[] {
  return dailyBars(symbol, days).map((b) => ({ ...b }));
}

/** Quote for any symbol; consistent with the symbol's chart and positions. */
export function generateMockQuote(symbol: string): MockQuote {
  return quoteFor(symbol);
}

/** Subscription plans. Matches `PlanListResponse.plans` (see lib/api/billing.ts). */
export function generateMockPlans() {
  const feature = (id: string, name: string, value = 'Included') => ({
    id,
    name,
    value,
    is_enabled: true,
  });
  return [
    {
      id: 'mock-free-plan',
      name: 'free',
      display_name: 'Free',
      description: '15-minute delayed signals, perfect for learning',
      price_monthly: 0,
      price_yearly: 0,
      is_popular: false,
      features: [
        feature('f-free-1', '15-minute delayed signals'),
        feature('f-free-2', 'Paper trading'),
        feature('f-free-3', 'Watchlist', 'Up to 5 symbols'),
        feature('f-free-4', 'Basic analytics'),
      ],
    },
    {
      id: 'mock-starter-plan',
      name: 'starter',
      display_name: 'Starter',
      description: 'Real-time signals and enhanced features for active traders',
      price_monthly: 9.0,
      price_yearly: 90.0,
      is_popular: false,
      features: [
        feature('f-st-1', 'Real-time signals'),
        feature('f-st-2', 'Paper trading'),
        feature('f-st-3', 'Watchlist', 'Up to 20 symbols'),
        feature('f-st-4', 'Advanced analytics'),
        feature('f-st-5', 'Email alerts'),
      ],
    },
    {
      id: 'mock-pro-plan',
      name: 'pro',
      display_name: 'Pro',
      description: 'Full access to risk analytics, stress testing and backtesting',
      price_monthly: 79.0,
      price_yearly: 790.0,
      is_popular: true,
      features: [
        feature('f-pro-1', 'Real-time signals'),
        feature('f-pro-2', 'Full risk analytics suite'),
        feature('f-pro-3', 'Stress testing'),
        feature('f-pro-4', 'Backtesting tools'),
        feature('f-pro-5', 'Watchlist', 'Unlimited'),
        feature('f-pro-6', 'Real-time alerts'),
      ],
    },
    {
      id: 'mock-institutional-plan',
      name: 'institutional',
      display_name: 'Institutional',
      description: 'Full platform access for professionals and institutions',
      price_monthly: 299.0,
      price_yearly: 2990.0,
      is_popular: false,
      features: [
        feature('f-in-1', 'Real-time + priority data'),
        feature('f-in-2', 'Institutional API keys'),
        feature('f-in-3', 'Webhooks', 'Unlimited'),
        feature('f-in-4', 'Advisor CRM platform'),
        feature('f-in-5', 'Compliance & audit reports'),
      ],
    },
  ];
}

/** The demo account's user record. */
export function generateMockUser(plan: 'free' | 'starter' | 'pro' = 'pro') {
  return {
    id: 'demo-user-001',
    email: 'demo@example.com',
    full_name: 'Demo User',
    email_verified: true,
    mfa_enabled: false,
    role: 'user',
    paper_trading_approved: true,
    live_trading_approved: plan === 'pro',
    preferences: {},
    created_at: iso(daysAgo(30)),
    last_login_at: iso(hoursAgo(2)),
    is_founder: false,
    avatar_url: null,
  };
}

/** Recent brokerage orders (newest first). */
export function generateMockOrders(count: number = 10) {
  const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA'];
  const statuses = ['filled', 'filled', 'filled', 'pending', 'canceled', 'partially_filled'];

  return Array.from({ length: count }, (_, i) => {
    const rng = seededRng(`legacy-order:${i}`);
    const symbol = symbols[i % symbols.length];
    const side = pick(rng, ['buy', 'sell'] as const);
    const quantity = randInt(rng, 5, 50);
    const status = statuses[i % statuses.length];
    const price = round(lastPrice(symbol) * randBetween(rng, 0.97, 1.03));
    const when = hoursAgo(i * 7 + 2);

    return {
      id: `mock-order-${i}`,
      user_id: 'demo-user-001',
      mode: 'paper',
      symbol,
      side,
      quantity,
      order_type: 'market',
      status,
      filled_quantity:
        status === 'filled' ? quantity : status === 'partially_filled' ? Math.floor(quantity / 2) : 0,
      filled_avg_price: status === 'filled' || status === 'partially_filled' ? price : null,
      broker_order_id: `mock-broker-${i}`,
      broker_name: 'alpaca',
      time_in_force: 'gtc',
      extended_hours: false,
      created_at: iso(when),
      updated_at: iso(when),
      filled_at: status === 'filled' ? iso(when) : null,
    };
  });
}

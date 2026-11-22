/**
 * In-memory paper-trading ledger for demo mode.
 *
 * The seeded history is *replayed* against the shared market series, so the
 * equity curve, positions, cash and P&L are all mutually consistent and agree
 * with the prices shown in charts and quotes. Placing/cancelling orders during
 * a session mutates this state; a page reload restores the seed.
 */
import { dailyBars, lastPrice } from './market';
import { DemoHttpError } from './errors';
import { demoNow, iso, newId, round, seedId } from './prng';

export const STARTING_BALANCE = 100_000;

export interface LedgerOrder {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  order_type: 'market' | 'limit';
  limit_price: number | null;
  status: 'filled' | 'pending' | 'canceled';
  filled_quantity: number;
  avg_fill_price: number | null;
  created_at: string;
  filled_at: string | null;
  canceled_at: string | null;
}

export interface Lot {
  symbol: string;
  quantity: number;
  /** Average cost per share. */
  avgCost: number;
  openedAt: string;
}

export interface Snapshot {
  date: string;
  total_value: number;
  cash_value: number;
  positions_value: number;
}

interface Ledger {
  createdAt: string;
  cash: number;
  lots: Map<string, Lot>;
  orders: LedgerOrder[];
  snapshots: Snapshot[];
  closedTrades: { symbol: string; pnl: number }[];
  dismissed: Set<string>;
}

/** [trading days ago, symbol, side, quantity] — replayed in this order. */
const SEED_EVENTS: Array<[number, string, 'buy' | 'sell', number]> = [
  [112, 'AAPL', 'buy', 60],
  [104, 'MSFT', 'buy', 25],
  [98, 'TSLA', 'buy', 40],
  [90, 'NVDA', 'buy', 120],
  [75, 'SPY', 'buy', 35],
  [70, 'AMD', 'buy', 80],
  [62, 'TSLA', 'sell', 40],
  [50, 'GOOGL', 'buy', 50],
  [44, 'AMD', 'sell', 80],
  [33, 'JPM', 'buy', 40],
  [12, 'AMZN', 'buy', 30],
];

const HISTORY_DAYS = 120;

function calendar() {
  // SPY bars give us the trading-day calendar (oldest first).
  return dailyBars('SPY', HISTORY_DAYS + 10).slice(-(HISTORY_DAYS + 1));
}

function closeOn(symbol: string, dayIndex: number): number {
  const bars = dailyBars(symbol, HISTORY_DAYS + 10).slice(-(HISTORY_DAYS + 1));
  return bars[dayIndex].close;
}

function applyFill(ledger: Ledger, symbol: string, side: 'buy' | 'sell', qty: number, price: number, when: string) {
  const lot = ledger.lots.get(symbol);
  if (side === 'buy') {
    ledger.cash = round(ledger.cash - qty * price);
    if (lot) {
      const total = lot.quantity + qty;
      lot.avgCost = round((lot.avgCost * lot.quantity + price * qty) / total, 4);
      lot.quantity = total;
    } else {
      ledger.lots.set(symbol, { symbol, quantity: qty, avgCost: price, openedAt: when });
    }
  } else if (lot) {
    ledger.cash = round(ledger.cash + qty * price);
    ledger.closedTrades.push({ symbol, pnl: round((price - lot.avgCost) * qty) });
    lot.quantity -= qty;
    if (lot.quantity <= 0) ledger.lots.delete(symbol);
  }
}

function positionsValueAt(lots: Map<string, Lot>, dayIndex: number | null): number {
  let v = 0;
  for (const lot of lots.values()) {
    v += lot.quantity * (dayIndex === null ? lastPrice(lot.symbol) : closeOn(lot.symbol, dayIndex));
  }
  return v;
}

function seedLedger(): Ledger {
  const cal = calendar();
  const ledger: Ledger = {
    createdAt: new Date(cal[0].time * 1000).toISOString(),
    cash: STARTING_BALANCE,
    lots: new Map(),
    orders: [],
    snapshots: [],
    closedTrades: [],
    dismissed: new Set(),
  };

  let n = 0;
  const eventsByDay = new Map<number, typeof SEED_EVENTS>();
  for (const e of SEED_EVENTS) {
    const idx = HISTORY_DAYS - e[0];
    eventsByDay.set(idx, [...(eventsByDay.get(idx) ?? []), e]);
  }

  for (let d = 0; d <= HISTORY_DAYS; d++) {
    for (const [, symbol, side, qty] of eventsByDay.get(d) ?? []) {
      const price = closeOn(symbol, d);
      const when = new Date(cal[d].time * 1000 + 14.5 * 3_600_000).toISOString();
      applyFill(ledger, symbol, side, qty, price, when);
      n += 1;
      ledger.orders.push({
        id: seedId('order', n),
        symbol,
        side,
        quantity: qty,
        order_type: 'market',
        limit_price: null,
        status: 'filled',
        filled_quantity: qty,
        avg_fill_price: price,
        created_at: when,
        filled_at: when,
        canceled_at: null,
      });
    }
    const posValue = positionsValueAt(ledger.lots, d === HISTORY_DAYS ? null : d);
    ledger.snapshots.push({
      date: new Date(cal[d].time * 1000).toISOString().split('T')[0],
      total_value: round(ledger.cash + posValue),
      cash_value: round(ledger.cash),
      positions_value: round(posValue),
    });
  }

  // A few working orders so the order book isn't empty.
  const recent = new Date(cal[HISTORY_DAYS].time * 1000).toISOString();
  ledger.orders.push(
    {
      id: seedId('order', n + 1),
      symbol: 'NVDA',
      side: 'buy',
      quantity: 20,
      order_type: 'limit',
      limit_price: round(lastPrice('NVDA') * 0.95),
      status: 'pending',
      filled_quantity: 0,
      avg_fill_price: null,
      created_at: recent,
      filled_at: null,
      canceled_at: null,
    },
    {
      id: seedId('order', n + 2),
      symbol: 'AAPL',
      side: 'sell',
      quantity: 20,
      order_type: 'limit',
      limit_price: round(lastPrice('AAPL') * 1.06),
      status: 'pending',
      filled_quantity: 0,
      avg_fill_price: null,
      created_at: recent,
      filled_at: null,
      canceled_at: null,
    },
    {
      id: seedId('order', n + 3),
      symbol: 'MSFT',
      side: 'buy',
      quantity: 10,
      order_type: 'limit',
      limit_price: round(lastPrice('MSFT') * 0.9),
      status: 'canceled',
      filled_quantity: 0,
      avg_fill_price: null,
      created_at: recent,
      filled_at: null,
      canceled_at: recent,
    },
  );

  return ledger;
}

let ledger: Ledger | null = null;
export const getLedger = (): Ledger => (ledger ??= seedLedger());

export function resetLedger(empty = true): Ledger {
  const cal = calendar();
  ledger = empty
    ? {
        createdAt: iso(new Date(cal[HISTORY_DAYS].time * 1000)),
        cash: STARTING_BALANCE,
        lots: new Map(),
        orders: [],
        snapshots: [
          {
            date: new Date(cal[HISTORY_DAYS].time * 1000).toISOString().split('T')[0],
            total_value: STARTING_BALANCE,
            cash_value: STARTING_BALANCE,
            positions_value: 0,
          },
        ],
        closedTrades: [],
        dismissed: new Set(),
      }
    : seedLedger();
  return ledger;
}

// ── Derived views ───────────────────────────────────────────────────────────

export function positionsView() {
  const l = getLedger();
  return [...l.lots.values()].map((lot, i) => {
    const price = lastPrice(lot.symbol);
    const costBasis = round(lot.avgCost * lot.quantity);
    const marketValue = round(price * lot.quantity);
    const pl = round(marketValue - costBasis);
    return {
      id: seedId('pos', i + 1),
      symbol: lot.symbol,
      quantity: lot.quantity,
      avg_cost: round(lot.avgCost),
      current_price: price,
      market_value: marketValue,
      cost_basis: costBasis,
      unrealized_pl: pl,
      unrealized_pl_pct: costBasis ? round((pl / costBasis) * 100, 2) : 0,
      last_price_update: iso(demoNow()),
      created_at: lot.openedAt,
    };
  });
}

export function accountView() {
  const l = getLedger();
  const positions = positionsView();
  const positionsValue = round(positions.reduce((s, p) => s + p.market_value, 0));
  const equity = round(l.cash + positionsValue);
  const totalReturn = round(equity - STARTING_BALANCE);
  return {
    id: 'paper-account-001',
    name: 'Default',
    starting_balance: STARTING_BALANCE,
    current_cash: round(l.cash),
    positions_value: positionsValue,
    equity,
    total_value: equity,
    total_return: totalReturn,
    total_return_pct: round((totalReturn / STARTING_BALANCE) * 100, 2),
    positions_count: positions.length,
    is_active: true,
    created_at: l.createdAt,
    updated_at: l.createdAt,
  };
}

export function ordersView(status?: string) {
  const l = getLedger();
  const rows = l.orders
    .filter((o) => !l.dismissed.has(o.id))
    .filter((o) => !status || o.status === status)
    .slice()
    .reverse();
  return rows;
}

export function placeOrder(body: {
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  order_type: 'market' | 'limit';
  limit_price?: number;
}): LedgerOrder {
  const l = getLedger();
  const symbol = String(body.symbol || '').toUpperCase();
  const qty = Math.floor(Number(body.quantity));
  if (!symbol) throw new DemoHttpError(422, 'Symbol is required');
  if (!(qty > 0)) throw new DemoHttpError(422, 'Quantity must be greater than zero');

  const price = lastPrice(symbol);
  const now = iso(new Date());
  const isLimit = body.order_type === 'limit';
  const limit = isLimit ? Number(body.limit_price) : null;
  if (isLimit && !(limit && limit > 0)) throw new DemoHttpError(422, 'Limit price is required for limit orders');

  const lot = l.lots.get(symbol);
  if (body.side === 'sell' && (!lot || lot.quantity < qty)) {
    throw new DemoHttpError(400, `Insufficient shares: you hold ${lot?.quantity ?? 0} ${symbol}`);
  }
  // Marketable now? Market orders always; limits when the price already crosses.
  const marketable = !isLimit || (body.side === 'buy' ? price <= (limit as number) : price >= (limit as number));
  const fillPrice = marketable ? price : null;
  if (body.side === 'buy' && marketable && qty * price > l.cash) {
    throw new DemoHttpError(400, `Insufficient buying power: need $${(qty * price).toFixed(2)}, have $${l.cash.toFixed(2)}`);
  }

  const order: LedgerOrder = {
    id: newId('order'),
    symbol,
    side: body.side,
    quantity: qty,
    order_type: body.order_type,
    limit_price: limit,
    status: marketable ? 'filled' : 'pending',
    filled_quantity: marketable ? qty : 0,
    avg_fill_price: fillPrice,
    created_at: now,
    filled_at: marketable ? now : null,
    canceled_at: null,
  };
  if (marketable) applyFill(l, symbol, body.side, qty, price, now);
  l.orders.push(order);
  return order;
}

export function cancelOrder(id: string): void {
  const l = getLedger();
  const o = l.orders.find((x) => x.id === id);
  if (!o) throw new DemoHttpError(404, 'Order not found');
  if (o.status !== 'pending') throw new DemoHttpError(400, `Only pending orders can be canceled (this order is ${o.status})`);
  o.status = 'canceled';
  o.canceled_at = iso(new Date());
}

/** Cash adjustments used by the options-paper module (premium debit/credit). */
export function adjustCash(delta: number): void {
  const l = getLedger();
  l.cash = round(l.cash + delta);
}

export function performanceView(period: string) {
  const l = getLedger();
  const windows: Record<string, number> = { '1d': 2, '1w': 6, '1m': 22, '3m': 64, '6m': 126, '1y': 252, ytd: 120, all: 9999 };
  const n = windows[period] ?? 22;
  const snaps = l.snapshots.slice(-Math.min(n + 1, l.snapshots.length));
  // Make the final snapshot reflect live positions + cash.
  const acct = accountView();
  const last = snaps[snaps.length - 1];
  snaps[snaps.length - 1] = { ...last, total_value: acct.equity, cash_value: acct.current_cash, positions_value: acct.positions_value };

  let peak = snaps[0].total_value;
  let maxDd = 0;
  const dailyReturns: number[] = [];
  const daily = snaps.map((s, i) => {
    const prev = i === 0 ? null : snaps[i - 1].total_value;
    const r = prev ? s.total_value - prev : null;
    const rp = prev ? round(((s.total_value - prev) / prev) * 100, 3) : null;
    if (prev) dailyReturns.push((s.total_value - prev) / prev);
    peak = Math.max(peak, s.total_value);
    maxDd = Math.max(maxDd, (peak - s.total_value) / peak);
    return { ...s, daily_return: r === null ? null : round(r), daily_return_pct: rp };
  });

  const mean = dailyReturns.reduce((a, b) => a + b, 0) / Math.max(1, dailyReturns.length);
  const sd = Math.sqrt(dailyReturns.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, dailyReturns.length - 1));
  const sharpe = sd > 0 ? round((mean / sd) * Math.sqrt(252), 2) : null;

  const start = snaps[0].total_value;
  const end = snaps[snaps.length - 1].total_value;
  const wins = l.closedTrades.filter((t) => t.pnl > 0).length;
  const losses = l.closedTrades.filter((t) => t.pnl <= 0).length;
  const filled = l.orders.filter((o) => o.status === 'filled').length;

  return {
    account_id: 'paper-account-001',
    period,
    start_date: snaps[0].date,
    end_date: snaps[snaps.length - 1].date,
    start_value: start,
    end_value: end,
    total_return: round(end - start),
    total_return_pct: round(((end - start) / start) * 100, 2),
    max_drawdown: round(maxDd * peak),
    max_drawdown_pct: round(maxDd * 100, 2),
    sharpe_ratio: sharpe,
    win_rate: wins + losses ? round((wins / (wins + losses)) * 100, 1) : null,
    total_trades: filled,
    winning_trades: wins,
    losing_trades: losses,
    daily_snapshots: daily,
  };
}

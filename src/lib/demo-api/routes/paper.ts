/** Paper trading (equities) and options paper trading. State lives in ../paper-state. */
import { DemoHttpError } from '../errors';
import { lastPrice } from '../market';
import { expirationsFor, optionSnapshot, strikeStep } from '../options-math';
import {
  accountView,
  adjustCash,
  cancelOrder,
  getLedger,
  ordersView,
  performanceView,
  placeOrder,
  positionsView,
  resetLedger,
  STARTING_BALANCE,
} from '../paper-state';
import { daysAgo, iso, newId, round, seedId } from '../prng';
import { del, get, post, type DemoRoute } from '../router';

// ── Options paper positions ─────────────────────────────────────────────────
interface OptPos {
  id: string;
  symbol: string;
  option_type: 'call' | 'put';
  expiration: string;
  strike: number;
  contracts: number;
  entry_premium: number;
  status: 'open' | 'closed' | 'expired';
  opened_at: string;
  closed_at: string | null;
  exit_premium: number | null;
}
interface OptOrder {
  id: string;
  symbol: string;
  option_type: 'call' | 'put';
  expiration: string;
  strike: number;
  contracts: number;
  action: 'buy_to_open' | 'sell_to_close';
  estimated_premium: number;
  filled_premium: number | null;
  status: 'pending' | 'filled' | 'canceled' | 'rejected';
  position_id: string | null;
  created_at: string;
  filled_at: string | null;
}

const atm = (symbol: string, bump: number) => {
  const step = strikeStep(lastPrice(symbol));
  return Math.round((lastPrice(symbol) * (1 + bump)) / step) * step;
};

function seedOptions() {
  const exp = expirationsFor('AAPL');
  const mk = (
    n: number,
    symbol: string,
    type: 'call' | 'put',
    expiry: string,
    bump: number,
    contracts: number,
    entryFactor: number,
    daysOpen: number,
    status: OptPos['status'] = 'open',
  ): OptPos => {
    const strike = atm(symbol, bump);
    const mid = optionSnapshot(symbol, expiry, type, strike).mid ?? 1;
    return {
      id: seedId('optpos', n),
      symbol,
      option_type: type,
      expiration: expiry,
      strike,
      contracts,
      entry_premium: round(mid * entryFactor),
      status,
      opened_at: iso(daysAgo(daysOpen)),
      closed_at: status === 'closed' ? iso(daysAgo(daysOpen - 6)) : null,
      exit_premium: status === 'closed' ? round(mid * entryFactor * 1.4) : null,
    };
  };
  const positions = [
    mk(1, 'AAPL', 'call', exp[3], 0.04, 2, 0.82, 9),
    mk(2, 'SPY', 'put', exp[4], -0.04, 3, 1.15, 14),
    mk(3, 'NVDA', 'call', exp[2], 0.06, 5, 0.7, 5),
    mk(4, 'TSLA', 'call', exp[1], 0.02, 1, 0.9, 20, 'closed'),
  ];
  const orders: OptOrder[] = positions.flatMap((p, i) => {
    const open: OptOrder = {
      id: seedId('optord', i * 2 + 1),
      symbol: p.symbol,
      option_type: p.option_type,
      expiration: p.expiration,
      strike: p.strike,
      contracts: p.contracts,
      action: 'buy_to_open',
      estimated_premium: p.entry_premium,
      filled_premium: p.entry_premium,
      status: 'filled',
      position_id: p.id,
      created_at: p.opened_at,
      filled_at: p.opened_at,
    };
    if (p.status !== 'closed') return [open];
    return [
      open,
      {
        ...open,
        id: seedId('optord', i * 2 + 2),
        action: 'sell_to_close' as const,
        estimated_premium: p.exit_premium ?? p.entry_premium,
        filled_premium: p.exit_premium,
        created_at: p.closed_at as string,
        filled_at: p.closed_at,
      },
    ];
  });
  return { positions, orders };
}

let opt: ReturnType<typeof seedOptions> | null = null;
const optState = () => (opt ??= seedOptions());

function posView(p: OptPos) {
  const live = optionSnapshot(p.symbol, p.expiration, p.option_type, p.strike).mid ?? p.entry_premium;
  const current = p.status === 'open' ? live : p.exit_premium;
  const entryValue = round(p.entry_premium * 100 * p.contracts);
  const currentValue = current === null ? null : round(current * 100 * p.contracts);
  const pl = currentValue === null ? null : round(currentValue - entryValue);
  return {
    id: p.id,
    account_id: 'paper-account-001',
    symbol: p.symbol,
    option_type: p.option_type,
    expiration: p.expiration,
    strike: p.strike,
    contracts: p.contracts,
    open_action: 'buy_to_open' as const,
    entry_premium: p.entry_premium,
    current_premium: current,
    entry_contract_value: entryValue,
    current_contract_value: currentValue,
    unrealized_pl: pl,
    unrealized_pl_pct: pl === null ? null : round((pl / entryValue) * 100, 2),
    status: p.status,
    opened_at: p.opened_at,
    closed_at: p.closed_at,
    created_at: p.opened_at,
    updated_at: p.closed_at ?? p.opened_at,
    is_simulated: true,
  };
}

const orderView = (o: OptOrder) => ({
  ...o,
  account_id: 'paper-account-001',
  updated_at: o.filled_at ?? o.created_at,
  canceled_at: null,
  is_simulated: true,
});

// ── Leaderboard ─────────────────────────────────────────────────────────────
const LEADERS: Array<[string, number]> = [
  ['quantum_otter', 31.8],
  ['theta_gang', 24.2],
  ['valueviking', 19.6],
  ['sector_rotator', 15.4],
  ['dca_dana', 11.9],
  ['chartwhisperer', 9.3],
  ['bondbuilder', 6.1],
  ['momentum_max', 4.4],
  ['hodl_hannah', 2.7],
];

export const paperRoutes: DemoRoute[] = [
  // ── Equities ──────────────────────────────────────────────────────────────
  get('/paper/account', () => accountView()),
  post('/paper/account', ({ body }) => {
    const l = resetLedger(true);
    l.cash = Number(body?.starting_balance) || STARTING_BALANCE;
    return { ...accountView(), name: body?.name || 'Default', starting_balance: l.cash };
  }),
  get('/paper/limits', () => {
    const positions = positionsView().length;
    const orders = ordersView().length;
    return {
      plan_name: 'pro',
      max_positions: 100,
      current_positions: positions,
      positions_remaining: 100 - positions,
      orders_per_day: 200,
      orders_today: Math.min(orders, 3),
      orders_remaining_today: 197,
      history_days: 3650,
      is_unlimited: false,
      max_portfolios: 3,
      max_chart_overlays: 5,
      allowed_overlays: ['sma20', 'sma50', 'sma200', 'regression', 'levels'],
      reset_cooldown_hours: 24,
      can_reset: true,
      hours_until_reset: null,
    };
  }),
  get('/paper/positions', () => {
    const positions = positionsView();
    const totalValue = round(positions.reduce((s, p) => s + p.market_value, 0));
    const totalCost = round(positions.reduce((s, p) => s + p.cost_basis, 0));
    const pl = round(totalValue - totalCost);
    return {
      positions,
      total: positions.length,
      total_value: totalValue,
      total_cost: totalCost,
      total_unrealized_pl: pl,
      total_unrealized_pl_pct: totalCost ? round((pl / totalCost) * 100, 2) : 0,
    };
  }),
  get('/paper/orders', ({ query }) => {
    const all = ordersView(query.status || undefined);
    const limit = Number(query.limit) || 50;
    const offset = Number(query.offset) || 0;
    return { orders: all.slice(offset, offset + limit), total: all.length, limit, offset };
  }),
  post('/paper/orders', ({ body }) => placeOrder(body)),
  post('/paper/orders/dismiss', ({ body }) => {
    const ids: string[] = body?.ids ?? [];
    ids.forEach((id) => getLedger().dismissed.add(id));
    return { success: true, dismissed: ids.length };
  }),
  del('/paper/orders/:id', ({ params }) => {
    cancelOrder(params.id);
    return { success: true, message: 'Order canceled' };
  }),
  get('/paper/performance', ({ query }) => performanceView(query.period || '1m')),
  post('/paper/reset', () => {
    resetLedger(true);
    opt = { positions: [], orders: [] };
    return { success: true, message: 'Paper account reset to $100,000.', account: accountView() };
  }),
  post('/paper/import-portfolio', () => ({
    imported: [
      { symbol: 'AAPL', quantity: 40 },
      { symbol: 'MSFT', quantity: 15 },
      { symbol: 'VTI', quantity: 60 },
    ],
    skipped: [{ symbol: 'BTC', reason: 'Crypto is not supported in paper equities' }],
    failed: [],
    summary: { imported_count: 3, skipped_count: 1, failed_count: 0 },
    disclaimer: 'Demo data. Imported positions are simulated and carry no real value.',
  })),
  get('/paper/leaderboard', ({ query }) => {
    const acct = accountView();
    const rows = [...LEADERS.map(([h, r]) => [h, r] as [string, number]), ['you', acct.total_return_pct] as [string, number]]
      .sort((a, b) => b[1] - a[1])
      .slice(0, Number(query.limit) || 25)
      .map(([handle, ret], i) => ({
        rank: i + 1,
        handle: handle === 'you' ? 'demo_user' : handle,
        account_name: 'Default',
        starting_balance: STARTING_BALANCE,
        current_cash: round(STARTING_BALANCE * (1 + ret / 100) * 0.35),
        gain_loss: round(STARTING_BALANCE * (ret / 100)),
        return_pct: ret,
        is_you: handle === 'you',
        created_at: iso(daysAgo(120 - i * 7)),
      }));
    return {
      leaderboard: rows,
      total: rows.length,
      disclaimer: 'Simulated results from paper accounts. Not indicative of real trading performance.',
    };
  }),

  // ── Options ───────────────────────────────────────────────────────────────
  get('/options/positions', ({ query }) => {
    const status = (query.status as OptPos['status']) || 'open';
    const positions = optState().positions.filter((p) => p.status === status).map(posView);
    return {
      positions,
      total: positions.length,
      total_positions_value: round(positions.reduce((s, p) => s + (p.current_contract_value ?? 0), 0)),
      total_unrealized_pl: round(positions.reduce((s, p) => s + (p.unrealized_pl ?? 0), 0)),
    };
  }),
  get('/options/orders', ({ query }) => {
    const limit = Number(query.limit) || 50;
    const orders = optState().orders.slice().reverse().slice(0, limit).map(orderView);
    return { orders, total: optState().orders.length };
  }),
  post('/options/orders', ({ body }) => {
    const s = optState();
    const now = iso(new Date());
    const premium = Number(body?.estimated_premium) || 0.01;
    const value = round(premium * 100 * Number(body?.contracts || 1));

    if (body?.action === 'sell_to_close') {
      const pos = s.positions.find((p) => p.id === body.position_id && p.status === 'open');
      if (!pos) throw new DemoHttpError(404, 'Open position not found');
      pos.status = 'closed';
      pos.closed_at = now;
      pos.exit_premium = premium;
      adjustCash(value);
    } else {
      if (value > getLedger().cash) throw new DemoHttpError(400, 'Insufficient buying power for this options order');
      adjustCash(-value);
      s.positions.push({
        id: newId('optpos'),
        symbol: String(body.symbol).toUpperCase(),
        option_type: body.option_type,
        expiration: body.expiration,
        strike: Number(body.strike),
        contracts: Number(body.contracts),
        entry_premium: premium,
        status: 'open',
        opened_at: now,
        closed_at: null,
        exit_premium: null,
      });
    }
    const order: OptOrder = {
      id: newId('optord'),
      symbol: String(body.symbol).toUpperCase(),
      option_type: body.option_type,
      expiration: body.expiration,
      strike: Number(body.strike),
      contracts: Number(body.contracts),
      action: body.action,
      estimated_premium: premium,
      filled_premium: premium,
      status: 'filled',
      position_id: body.position_id ?? s.positions[s.positions.length - 1].id,
      created_at: now,
      filled_at: now,
    };
    s.orders.push(order);
    return orderView(order);
  }),
];

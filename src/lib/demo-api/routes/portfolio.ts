/**
 * Portfolio analytics, linked brokers (Plaid stubbed), trade ideas, order prep,
 * and investment-compliance endpoints.
 */
import {
  attribution,
  correlationMatrix,
  averageOffDiagonal,
  normalizeWeights,
  stressTest,
} from '../analytics';
import { DemoHttpError } from '../errors';
import { getInstrument, lastPrice } from '../market';
import { accountView, positionsView } from '../paper-state';
import {
  addConnection,
  allHoldings,
  DISCLAIMER,
  getConnections,
  holdingsFor,
  removeConnection,
  totalCostBasis,
  totalValue,
  valueChange,
} from '../portfolio-data';
import { daysAgo, daysFromNow, demoNow, hashString, iso, isoDay, newId, round, seedId } from '../prng';
import { del, get, post, put, type DemoRoute } from '../router';

const findConn = (id: string) => {
  const c = getConnections().find((x) => x.conn.id === id);
  if (!c) throw new DemoHttpError(404, 'Connection not found');
  return c;
};

const connValue = (id: string) => round(holdingsFor(findConn(id)).reduce((s, h) => s + h.institution_value, 0));

// ── Benchmarks (stateful) ───────────────────────────────────────────────────
interface BenchmarkRec {
  id: string;
  name: string;
  description: string | null;
  components: { symbol: string; weight: number }[];
  benchmark_type: string;
  is_active: boolean;
  created_at: string;
}
let benchmarks: BenchmarkRec[] | null = null;
const getBenchmarks = (): BenchmarkRec[] =>
  (benchmarks ??= [
    {
      id: 'bench-001',
      name: 'S&P 500',
      description: 'Large-cap US equities (SPY)',
      components: [{ symbol: 'SPY', weight: 100 }],
      benchmark_type: 'preset',
      is_active: true,
      created_at: iso(daysAgo(28)),
    },
    {
      id: 'bench-002',
      name: '60/40 Balanced',
      description: '60% total US stock market, 40% total bond market',
      components: [
        { symbol: 'VTI', weight: 60 },
        { symbol: 'BND', weight: 40 },
      ],
      benchmark_type: 'preset',
      is_active: true,
      created_at: iso(daysAgo(28)),
    },
    {
      id: 'bench-003',
      name: 'Growth Tilt',
      description: 'Nasdaq-100 with a technology sleeve',
      components: [
        { symbol: 'QQQ', weight: 70 },
        { symbol: 'XLK', weight: 30 },
      ],
      benchmark_type: 'custom',
      is_active: true,
      created_at: iso(daysAgo(10)),
    },
  ]);

// ── Manual positions (stateful) ─────────────────────────────────────────────
interface ManualPos {
  id: string;
  user_id: string;
  symbol: string;
  quantity: number;
  avg_cost: number;
  asset_type: 'stock' | 'etf' | 'crypto' | 'other';
  notes: string | null;
  created_at: string;
  updated_at: string;
}
let manual: ManualPos[] | null = null;
const getManual = (): ManualPos[] =>
  (manual ??= [
    { id: seedId('manual', 1), user_id: 'demo-user-001', symbol: 'SCHD', quantity: 120, avg_cost: 26.4, asset_type: 'etf', notes: 'Dividend core holding', created_at: iso(daysAgo(20)), updated_at: iso(daysAgo(20)) },
    { id: seedId('manual', 2), user_id: 'demo-user-001', symbol: 'BRK.B', quantity: 15, avg_cost: 402.1, asset_type: 'stock', notes: null, created_at: iso(daysAgo(14)), updated_at: iso(daysAgo(14)) },
    { id: seedId('manual', 3), user_id: 'demo-user-001', symbol: 'BTC', quantity: 0.35, avg_cost: 61250, asset_type: 'crypto', notes: 'Held in cold storage', created_at: iso(daysAgo(9)), updated_at: iso(daysAgo(9)) },
  ]);

// ── Trade ideas (stateful) ──────────────────────────────────────────────────
interface Idea {
  id: string;
  symbol: string;
  idea_type: string;
  direction: string;
  signal_strength: string;
  thesis: string;
  entry_criteria: Record<string, unknown>;
  risk_parameters: Record<string, unknown>;
  status: string;
  created_at: string;
  expires_at?: string;
}

const THESES: Record<string, (s: string, p: number) => string> = {
  momentum: (s, p) =>
    `${s} is trading above its 20-, 50- and 200-day averages with rising relative strength. A pullback toward $${(p * 0.97).toFixed(2)} would offer a lower-risk entry into the existing trend.`,
  mean_reversion: (s, p) =>
    `${s} has stretched about two standard deviations below its 20-day mean while longer-term trend stays intact. Historically similar dislocations have partly retraced toward $${(p * 1.04).toFixed(2)}.`,
  options: (s) =>
    `Implied volatility on ${s} is elevated versus its 90-day range, which can favour defined-risk premium-selling structures. Educational example only — position sizing and assignment risk apply.`,
  earnings: (s) =>
    `${s} reports within the next two weeks. The options market is pricing a larger-than-usual move, so event risk dominates; some traders reduce size or use defined-risk structures into the print.`,
  sector_rotation: (s) =>
    `Relative performance of ${s}'s sector has turned up against the broad market as leadership rotates. This is a medium-term allocation idea rather than a short-term trade.`,
};

function makeIdea(symbol: string, type: string, n: number): Idea {
  const sym = symbol.toUpperCase();
  const price = lastPrice(sym);
  const h = hashString(`idea:${sym}:${type}`);
  const long = h % 5 !== 0;
  const strength = (['strong', 'moderate', 'moderate', 'weak'] as const)[h % 4];
  return {
    id: n ? seedId('idea', n) : newId('idea'),
    symbol: sym,
    idea_type: type,
    direction: long ? 'long' : 'short',
    signal_strength: strength,
    thesis: (THESES[type] ?? THESES.momentum)(sym, price),
    entry_criteria: {
      entry_zone: `$${(price * 0.985).toFixed(2)} – $${(price * 1.005).toFixed(2)}`,
      trend_filter: 'Price above 50-day average',
      confirmation: 'Volume ≥ 1.2× 20-day average',
    },
    risk_parameters: {
      stop_loss: `$${(price * (long ? 0.94 : 1.06)).toFixed(2)}`,
      max_position_pct: 0.05,
      risk_reward: `${(1.6 + (h % 14) / 10).toFixed(1)} : 1`,
      time_horizon: type === 'earnings' ? '1–2 weeks' : '2–6 weeks',
    },
    status: 'active',
    created_at: iso(daysAgo((h % 5) + 0)),
    expires_at: iso(daysFromNow(10 + (h % 14))),
  };
}

let ideas: Idea[] | null = null;
const getIdeas = (): Idea[] =>
  (ideas ??= [
    makeIdea('NVDA', 'momentum', 1),
    makeIdea('INTC', 'mean_reversion', 2),
    makeIdea('AAPL', 'options', 3),
    makeIdea('XLE', 'sector_rotation', 4),
    makeIdea('COST', 'earnings', 5),
  ]);

// ── Order tickets (stateful) ────────────────────────────────────────────────
let tickets: any[] = [];

function brokerLinks(symbol: string) {
  const s = encodeURIComponent(symbol.toUpperCase());
  return {
    'Brokerage web app': `https://example.com/trade?symbol=${s}`,
    'Brokerage mobile deep link': `https://example.com/m/trade?symbol=${s}`,
  };
}

// ── Journal (stateful) ──────────────────────────────────────────────────────
let journal: any[] | null = null;
const getJournal = (): any[] =>
  (journal ??= [
    {
      id: seedId('journal', 1), symbol: 'AAPL', entry_type: 'post_trade', emotional_state: 'confident',
      technical_notes: 'Entered on a pullback to the 50-day average with volume confirmation; scaled out into strength.',
      emotional_notes: 'Stuck to the plan. No urge to chase.', lessons_learned: 'Waiting for the pullback beat buying the breakout.',
      rating: 5, tags: ['trend', 'discipline'], trade_date: iso(daysAgo(12)), created_at: iso(daysAgo(11)),
    },
    {
      id: seedId('journal', 2), symbol: 'INTC', entry_type: 'reflection', emotional_state: 'uncertain',
      technical_notes: 'Position is well below cost; thesis (turnaround) has not played out.',
      emotional_notes: 'Reluctant to sell at a loss — classic loss aversion.', lessons_learned: 'Define the exit before entering. Review for tax-loss harvesting.',
      rating: 2, tags: ['loss-aversion', 'review'], trade_date: null, created_at: iso(daysAgo(6)),
    },
    {
      id: seedId('journal', 3), symbol: 'NVDA', entry_type: 'pre_trade', emotional_state: 'excited',
      technical_notes: 'Considering adding on a limit order 5% below market.', emotional_notes: 'FOMO after the recent run.',
      lessons_learned: null, rating: null, tags: ['fomo'], trade_date: null, created_at: iso(daysAgo(2)),
    },
  ]);

export const portfolioRoutes: DemoRoute[] = [
  // ── Analytics ─────────────────────────────────────────────────────────────
  post('/portfolio/attribution', ({ body }) => ({
    ...attribution(body?.holdings ?? [], body?.benchmark_symbol ?? 'SPY', body?.period_days ?? 30),
    disclaimer: DISCLAIMER,
  })),

  post('/portfolio/stress-test', ({ body }) => ({
    ...stressTest(body?.holdings ?? [], Number(body?.portfolio_value) || 100_000),
    disclaimer: 'Historical scenarios are illustrative approximations, not predictions. ' + DISCLAIMER,
  })),

  post('/portfolio/correlation', ({ body }) => {
    const symbols: string[] = (body?.symbols ?? []).map((s: string) => s.toUpperCase());
    const matrix = correlationMatrix(symbols);
    const avg = averageOffDiagonal(matrix);
    const pairs = symbols.flatMap((a, i) =>
      symbols.slice(i + 1).map((b) => ({ pair: [a, b], correlation: matrix[a][b] })),
    );
    const score = Math.max(0, Math.min(1, 1 - Math.max(0, avg)));
    return {
      correlation_matrix: matrix,
      diversification_score: round(score, 2),
      highly_correlated_pairs: pairs
        .filter((p) => p.correlation >= 0.7)
        .sort((a, b) => b.correlation - a.correlation)
        .map((p) => ({ ...p, warning: 'These holdings tend to move together, which reduces diversification.' })),
      concentration_risk: score < 0.4 ? 'high' : score < 0.6 ? 'moderate' : 'low',
      disclaimer: DISCLAIMER,
    };
  }),

  post('/portfolio/rebalance', ({ body }) => {
    const pv = Number(body?.portfolio_value) || 100_000;
    const minTrade = Number(body?.min_trade_size) || 100;
    const holdings = normalizeWeights<{ symbol: string; weight: number }>(body?.holdings ?? []);
    const target: Record<string, number> = body?.target_weights ?? {};
    const trades = holdings
      .map((h) => {
        const t = target[h.symbol] ?? h.weight;
        const drift = h.weight - t;
        const value = round(-drift * pv);
        return {
          symbol: h.symbol,
          current_weight: round(h.weight, 4),
          target_weight: round(t, 4),
          drift: round(drift, 4),
          action: value >= 0 ? 'buy' : 'sell',
          estimated_shares: Math.round(Math.abs(value) / lastPrice(h.symbol)),
          estimated_value: round(Math.abs(value)),
        };
      })
      .filter((t) => t.estimated_value >= minTrade)
      .sort((a, b) => b.estimated_value - a.estimated_value);
    const turnover = trades.reduce((s, t) => s + t.estimated_value, 0) / 2;
    return {
      trades,
      total_turnover_pct: round((turnover / pv) * 100, 1),
      estimated_cost: round(turnover * 0.0008),
      disclaimer: DISCLAIMER,
    };
  }),

  post('/portfolio/tax-loss', ({ body }) => {
    const rate = Number(body?.tax_rate) || 0.35;
    const REPLACEMENT: Record<string, string> = {
      Technology: 'XLK', Financials: 'XLF', 'Health Care': 'XLV', Energy: 'XLE',
      'Communication Services': 'XLC', 'Consumer Discretionary': 'XLY', 'Consumer Staples': 'XLP',
    };
    const opps = (body?.positions ?? [])
      .filter((p: any) => p.current_price < p.cost_basis)
      .map((p: any) => {
        const loss = round((p.cost_basis - p.current_price) * p.quantity);
        const bought = p.purchase_date ? new Date(p.purchase_date) : null;
        const heldDays = bought ? Math.floor((demoNow().getTime() - bought.getTime()) / 86_400_000) : null;
        const recent = heldDays !== null && heldDays < 30;
        const sector = getInstrument(p.symbol).sector;
        return {
          symbol: p.symbol,
          unrealized_loss: loss,
          unrealized_loss_pct: round(((p.cost_basis - p.current_price) / p.cost_basis) * 100, 1),
          cost_basis: p.cost_basis,
          current_price: p.current_price,
          quantity: p.quantity,
          potential_tax_savings: round(loss * rate),
          wash_sale_risk: recent,
          wash_sale_window_end: recent && bought ? isoDay(new Date(bought.getTime() + 30 * 86_400_000)) : null,
          suggested_replacement: REPLACEMENT[sector] ?? 'VTI',
          holding_days: heldDays,
          is_long_term: heldDays !== null ? heldDays > 365 : false,
          notes: `Selling realizes a $${loss.toLocaleString()} capital loss that can offset gains. Avoid repurchasing ${p.symbol} within 30 days (wash-sale rule); a similar fund may keep market exposure.`,
        };
      })
      .sort((a: any, b: any) => b.unrealized_loss - a.unrealized_loss);
    return {
      opportunities: opps,
      total_harvestable_loss: round(opps.reduce((s: number, o: any) => s + o.unrealized_loss, 0)),
      total_potential_savings: round(opps.reduce((s: number, o: any) => s + o.potential_tax_savings, 0)),
      disclaimer: 'Not tax advice. Consult a qualified tax professional. ' + DISCLAIMER,
    };
  }),

  // ── Benchmarks ────────────────────────────────────────────────────────────
  get('/portfolio/benchmarks', () => getBenchmarks().map((b) => ({ ...b }))),
  post('/portfolio/benchmarks', ({ body }) => {
    const b: BenchmarkRec = {
      id: newId('bench'),
      name: body?.name ?? 'Custom benchmark',
      description: body?.description ?? null,
      components: body?.components ?? [],
      benchmark_type: 'custom',
      is_active: true,
      created_at: iso(new Date()),
    };
    getBenchmarks().push(b);
    return b;
  }),
  del('/portfolio/benchmarks/:id', ({ params }) => {
    benchmarks = getBenchmarks().filter((b) => b.id !== params.id);
    return { success: true };
  }),
  get('/portfolio/benchmarks/:id/comparison', ({ params }) => {
    const b = getBenchmarks().find((x) => x.id === params.id);
    if (!b) throw new DemoHttpError(404, 'Benchmark not found');
    const total = totalValue();
    const real = new Map<string, number>();
    allHoldings().forEach((h) => real.set(h.symbol, (real.get(h.symbol) ?? 0) + h.institution_value));
    const bTotal = b.components.reduce((s, c) => s + c.weight, 0) || 1;
    const symbols = new Set([...real.keys(), ...b.components.map((c) => c.symbol)]);
    const comparisons = [...symbols].map((symbol) => {
      const rw = ((real.get(symbol) ?? 0) / total) * 100;
      const bw = ((b.components.find((c) => c.symbol === symbol)?.weight ?? 0) / bTotal) * 100;
      const diff = rw - bw;
      return {
        symbol,
        real_weight: round(rw, 2),
        benchmark_weight: round(bw, 2),
        difference: round(diff, 2),
        status: (Math.abs(diff) < 1 ? 'aligned' : diff > 0 ? 'overweight' : 'underweight') as 'aligned' | 'overweight' | 'underweight',
      };
    });
    return {
      benchmark_name: b.name,
      benchmark_type: b.benchmark_type,
      total_portfolio_value: total,
      comparisons: comparisons.sort((a, c) => Math.abs(c.difference) - Math.abs(a.difference)),
      disclaimer: DISCLAIMER,
    };
  }),
  get('/portfolio/real-vs-paper', () => {
    const real = totalValue();
    const cost = totalCostBasis();
    const acct = accountView();
    const paperPos = positionsView();
    const paperCost = paperPos.reduce((s, p) => s + p.cost_basis, 0);
    const paperPl = paperPos.reduce((s, p) => s + p.unrealized_pl, 0);
    const realQty = new Map<string, { v: number; q: number }>();
    allHoldings().forEach((h) => {
      const c = realQty.get(h.symbol) ?? { v: 0, q: 0 };
      realQty.set(h.symbol, { v: c.v + h.institution_value, q: c.q + h.quantity });
    });
    return {
      real_portfolio: {
        total_value: real,
        total_cost_basis: cost,
        unrealized_pl: round(real - cost),
        unrealized_pl_pct: round(((real - cost) / cost) * 100, 2),
        holding_count: allHoldings().length,
      },
      paper_portfolio: {
        total_equity: acct.equity,
        positions_value: acct.positions_value,
        cash_balance: acct.current_cash,
        total_cost_basis: round(paperCost),
        unrealized_pl: round(paperPl),
        unrealized_pl_pct: paperCost ? round((paperPl / paperCost) * 100, 2) : 0,
        position_count: paperPos.length,
        account_count: 1,
      },
      shared_symbols: paperPos
        .filter((p) => realQty.has(p.symbol))
        .map((p) => ({
          symbol: p.symbol,
          real_value: round(realQty.get(p.symbol)!.v),
          real_quantity: realQty.get(p.symbol)!.q,
          paper_value: p.market_value,
          paper_quantity: p.quantity,
        })),
      disclaimer: DISCLAIMER,
    };
  }),

  // ── Manual positions ──────────────────────────────────────────────────────
  get('/portfolio/manual', () => getManual().map((m) => ({ ...m }))),
  post('/portfolio/manual', ({ body }) => {
    const rec: ManualPos = {
      id: newId('manual'),
      user_id: 'demo-user-001',
      symbol: String(body?.symbol ?? '').toUpperCase(),
      quantity: Number(body?.quantity) || 0,
      avg_cost: Number(body?.avg_cost) || 0,
      asset_type: body?.asset_type ?? 'stock',
      notes: body?.notes ?? null,
      created_at: iso(new Date()),
      updated_at: iso(new Date()),
    };
    getManual().push(rec);
    return rec;
  }),
  put('/portfolio/manual/:id', ({ params, body }) => {
    const rec = getManual().find((m) => m.id === params.id);
    if (!rec) throw new DemoHttpError(404, 'Position not found');
    Object.assign(rec, body, { updated_at: iso(new Date()) });
    return { ...rec };
  }),
  del('/portfolio/manual/:id', ({ params }) => {
    manual = getManual().filter((m) => m.id !== params.id);
    return { success: true };
  }),

  // ── Linked brokers (Plaid is never contacted) ─────────────────────────────
  get('/brokers', () =>
    getConnections().map(({ conn: { accountType: _t, cash: _c, ...conn } }) => conn),
  ),
  get('/brokers/supported', () => ({
    brokers: [
      { key: 'plaid', name: 'Connect with Plaid (demo sandbox)', status: 'available' },
      { key: 'manual', name: 'Manual entry', status: 'available' },
    ],
    disclaimer: DISCLAIMER,
  })),
  post('/brokers/plaid/link-token', () => ({ link_token: 'link-demo-token' })),
  post('/brokers/plaid/exchange', ({ body }) => {
    const state = addConnection(body?.institution_name && body.institution_name !== 'Unknown' ? body.institution_name : 'Demo Brokerage 2');
    return { id: state.conn.id, display_name: state.conn.display_name, connection_status: 'connected', connected: true };
  }),
  del('/brokers/:id', ({ params }) => {
    removeConnection(params.id);
    return { success: true };
  }),
  post('/brokers/:id/sync', ({ params }) => {
    const c = findConn(params.id);
    return { synced_at: iso(new Date()), total_balance: round(connValue(params.id) + c.conn.cash), holding_count: c.lots.length };
  }),
  get('/brokers/:id/holdings', ({ params }) => {
    const c = findConn(params.id);
    const holdings = holdingsFor(c).map(({ symbol, name, quantity, institution_price, institution_value, cost_basis, security_type }) => ({
      symbol, name, quantity, institution_price, institution_value, cost_basis, security_type,
    }));
    const total = round(connValue(params.id) + c.conn.cash);
    return {
      holdings,
      accounts: [
        {
          account_id: c.conn.account_ids[0],
          name: c.conn.display_name,
          type: 'investment',
          subtype: c.conn.accountType === 'ira' ? 'ira' : 'brokerage',
          current: total,
          available: c.conn.cash,
          iso_currency_code: 'USD',
        },
      ],
      disclaimer: DISCLAIMER,
    };
  }),
  get('/brokers/:id/balances', ({ params }) => {
    const c = findConn(params.id);
    const total = round(connValue(params.id) + c.conn.cash);
    return {
      total_balance: total,
      accounts: [
        { account_id: c.conn.account_ids[0], name: c.conn.display_name, type: 'investment', subtype: c.conn.accountType === 'ira' ? 'ira' : 'brokerage', current: total, available: c.conn.cash, iso_currency_code: 'USD' },
      ],
      disclaimer: DISCLAIMER,
    };
  }),
  get('/brokers/portfolio-summary', ({ query }) => {
    const period = (query.period || 'all') as string;
    const tradingDays: Record<string, number> = { '1d': 1, '1w': 5, '1m': 21, '3m': 63, ytd: 140 };
    const total = totalValue();
    const cost = totalCostBasis();
    let pl: number;
    let pct: number;
    if (period === 'all' || !tradingDays[period]) {
      pl = round(total - cost);
      pct = round((pl / cost) * 100, 2);
    } else {
      const ch = valueChange(tradingDays[period]);
      pl = ch.pl;
      pct = round((ch.pl / ch.base) * 100, 2);
    }
    const bySector = new Map<string, number>();
    allHoldings().forEach((h) => bySector.set(h.sector, (bySector.get(h.sector) ?? 0) + h.institution_value));
    return {
      total_value: total,
      total_cost_basis: cost,
      unrealized_pl: pl,
      unrealized_pl_pct: pct,
      period,
      sector_allocation: [...bySector.entries()]
        .map(([sector, value]) => ({ sector, value: round(value), weight: round((value / total) * 100, 1) }))
        .sort((a, b) => b.value - a.value),
      connections: getConnections().map((c) => ({
        id: c.conn.id,
        display_name: c.conn.display_name,
        logo: null,
        value: connValue(c.conn.id),
        holding_count: c.lots.length,
        last_sync_at: c.conn.last_sync_at,
      })),
      holding_count: allHoldings().length,
      disclaimer: DISCLAIMER,
    };
  }),
  get('/brokers/wash-sale-scan', () => {
    const flagged = allHoldings()
      .filter((h) => h.cost_basis > h.institution_price)
      .map((h) => {
        const loss = round((h.cost_basis - h.institution_price) * h.quantity);
        return {
          symbol: h.symbol,
          broker: getConnections().find((c) => c.conn.id === h.connId)?.conn.display_name ?? 'Broker',
          quantity: h.quantity,
          institution_value: h.institution_value,
          cost_basis: round(h.cost_basis * h.quantity),
          unrealized_loss: loss,
          unrealized_loss_pct: round(((h.cost_basis - h.institution_price) / h.cost_basis) * 100, 1),
          wash_sale_risk: h.symbol === 'PFE',
          notes:
            h.symbol === 'PFE'
              ? 'Shares were added within the last 30 days (e.g. dividend reinvestment); selling at a loss now could trigger the wash-sale rule.'
              : 'No purchases in the 30-day window. A sale would realize a loss usable against gains.',
        };
      })
      .sort((a, b) => b.unrealized_loss - a.unrealized_loss);
    return {
      flagged_holdings: flagged,
      total_flagged: flagged.length,
      total_unrealized_loss: round(flagged.reduce((s, f) => s + f.unrealized_loss, 0)),
      disclaimer: 'Not tax advice. ' + DISCLAIMER,
    };
  }),

  // ── Trade ideas ───────────────────────────────────────────────────────────
  get('/trade-ideas', () => getIdeas().map((i) => ({ ...i }))),
  post('/trade-ideas/generate', ({ body }) => {
    const symbols: string[] = body?.symbols?.length ? body.symbols : ['AAPL'];
    const types: string[] = body?.idea_types?.length ? body.idea_types : ['momentum'];
    const created = symbols.flatMap((s) => types.map((t) => makeIdea(s, t, 0)));
    getIdeas().unshift(...created);
    return created;
  }),
  post('/trade-ideas/:id/status', ({ params, body }) => {
    const idea = getIdeas().find((i) => i.id === params.id);
    if (idea) idea.status = body?.status ?? idea.status;
    return { success: true };
  }),
  del('/trade-ideas/:id', ({ params }) => {
    ideas = getIdeas().filter((i) => i.id !== params.id);
    return { success: true };
  }),

  // ── Order prep (SSB never places real orders) ─────────────────────────────
  get('/order-prep/tickets', () => tickets.slice().reverse()),
  post('/order-prep/tickets', ({ body }) => {
    const symbol = String(body?.symbol ?? '').toUpperCase();
    const price = lastPrice(symbol);
    const qty = Number(body?.quantity) || 0;
    const notional = price * qty;
    const spread = round(notional * 0.0004);
    const impact = round(notional * 0.0003 * Math.min(3, 1 + qty / 500));
    const total = round(spread + impact);
    const ticket = {
      id: newId('ticket'),
      symbol,
      order_type: body?.order_type ?? 'market',
      direction: body?.direction ?? 'buy',
      quantity: qty,
      limit_price: body?.limit_price ?? null,
      stop_price: body?.stop_price ?? null,
      tca_estimate: {
        spread_cost_usd: spread,
        market_impact_usd: impact,
        total_cost_usd: total,
        total_cost_bps: notional ? round((total / notional) * 10_000, 1) : 0,
        best_execution_time: '10:00 – 11:30 ET (post-open volatility settles)',
      },
      compliance_check: {
        checks: [
          { check: 'Position size within your max-position setting', status: 'pass' },
          { check: 'Pattern day trader rules', status: 'pass' },
          { check: 'Restricted-securities list', status: 'pass' },
          { check: notional > 25_000 ? 'Order size vs average daily volume' : 'Liquidity check', status: notional > 25_000 ? 'warn' : 'pass' },
        ],
        warnings: notional > 25_000 ? ['Large notional order — consider splitting it to reduce market impact.'] : [],
      },
      broker_links: brokerLinks(symbol),
      status: 'prepared',
      notes: body?.notes ?? null,
      created_at: iso(new Date()),
    };
    tickets.push(ticket);
    return ticket;
  }),
  get('/order-prep/broker-links/:symbol', ({ params }) => ({
    symbol: params.symbol.toUpperCase(),
    broker_links: brokerLinks(params.symbol),
    disclaimer: 'These links open your broker. SSB does not execute orders.',
  })),

  // ── Investment compliance ─────────────────────────────────────────────────
  post('/investment-compliance/wash-sale', ({ body }) => {
    const parsed = new Date(body?.sold_at);
    const sold = Number.isNaN(parsed.getTime()) ? demoNow() : parsed;
    const reParsed = body?.repurchased_at ? new Date(body.repurchased_at) : null;
    const re = reParsed && !Number.isNaN(reParsed.getTime()) ? reParsed : null;
    const days = re ? Math.round((re.getTime() - sold.getTime()) / 86_400_000) : null;
    const wash = days !== null && Math.abs(days) <= 30;
    const loss = Number(body?.loss_amount) || 0;
    return {
      is_wash_sale: wash,
      disallowed_loss: wash ? round(Math.abs(loss)) : 0,
      window_start: isoDay(new Date(sold.getTime() - 30 * 86_400_000)),
      window_end: isoDay(new Date(sold.getTime() + 30 * 86_400_000)),
      details: wash
        ? [
            `${String(body?.symbol ?? '').toUpperCase()} was repurchased ${Math.abs(days as number)} day(s) ${(days as number) >= 0 ? 'after' : 'before'} the sale, inside the 61-day wash-sale window.`,
            'The loss is disallowed for now and added to the cost basis of the replacement shares.',
          ]
        : [
            re ? `The repurchase was ${Math.abs(days as number)} days from the sale — outside the 30-day window.` : 'No repurchase was reported inside the 30-day window.',
          ],
      recommendation: wash
        ? 'Consider waiting until the window closes, or buy a substantially different security to keep market exposure.'
        : 'This sale does not appear to trigger the wash-sale rule based on the dates provided.',
      disclaimer: 'Not tax advice. Consult a qualified tax professional.',
    };
  }),
  get('/investment-compliance/journal', () => getJournal().slice().reverse()),
  post('/investment-compliance/journal', ({ body }) => {
    const entry = { ...body, id: newId('journal'), tags: body?.tags ?? [], created_at: iso(new Date()) };
    getJournal().push(entry);
    return entry;
  }),
  del('/investment-compliance/journal/:id', ({ params }) => {
    journal = getJournal().filter((j) => j.id !== params.id);
    return { success: true };
  }),
];

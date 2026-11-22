/**
 * The demo user's "linked brokerage" holdings, shared by the portfolio, broker
 * and compliance routes. Prices come from ./market so everything agrees.
 */
import { getInstrument, lastPrice, periodReturnPct } from './market';
import { daysAgo, iso, round } from './prng';

export interface BrokerConn {
  id: string;
  broker_name: string;
  display_name: string;
  connection_status: string;
  account_ids: string[];
  last_sync_at: string;
  error_message: string | null;
  connection_metadata: { logo?: string } | null;
  created_at: string;
  accountType: 'brokerage' | 'ira';
  cash: number;
}

/** [symbol, shares, average cost as a fraction of today's price, security type] */
export type LotSpec = [string, number, number, string];

export interface ConnState {
  conn: BrokerConn;
  lots: LotSpec[];
}

const seedConnections = (): ConnState[] => [
  {
    conn: {
      id: 'conn-001',
      broker_name: 'plaid',
      display_name: 'Demo Brokerage',
      connection_status: 'connected',
      account_ids: ['acct-001'],
      last_sync_at: iso(daysAgo(0)),
      error_message: null,
      connection_metadata: null,
      created_at: iso(daysAgo(28)),
      accountType: 'brokerage',
      cash: 6_420.55,
    },
    lots: [
      ['AAPL', 120, 0.74, 'equity'],
      ['MSFT', 60, 0.81, 'equity'],
      ['NVDA', 150, 0.55, 'equity'],
      ['GOOGL', 80, 0.88, 'equity'],
      ['AMZN', 70, 0.9, 'equity'],
      ['JPM', 90, 0.86, 'equity'],
      ['XOM', 60, 1.04, 'equity'],
      ['KO', 150, 0.93, 'equity'],
      ['JNJ', 70, 1.06, 'equity'],
      ['INTC', 300, 1.62, 'equity'],
      ['PFE', 250, 1.24, 'equity'],
      ['NFLX', 12, 1.12, 'equity'],
    ],
  },
  {
    conn: {
      id: 'conn-002',
      broker_name: 'plaid',
      display_name: 'Demo Retirement IRA',
      connection_status: 'connected',
      account_ids: ['acct-002'],
      last_sync_at: iso(daysAgo(0)),
      error_message: null,
      connection_metadata: null,
      created_at: iso(daysAgo(28)),
      accountType: 'ira',
      cash: 2_180.0,
    },
    lots: [
      ['VTI', 200, 0.84, 'etf'],
      ['VXUS', 250, 0.95, 'etf'],
      ['BND', 400, 1.01, 'etf'],
      ['TLT', 100, 1.12, 'etf'],
      ['GLD', 60, 0.78, 'etf'],
      ['SPY', 50, 0.88, 'etf'],
    ],
  },
];

let connections: ConnState[] | null = null;
export const getConnections = (): ConnState[] => (connections ??= seedConnections());

/** Add a freshly "linked" institution (used by the Plaid stub). */
export function addConnection(displayName: string): ConnState {
  const list = getConnections();
  const n = Math.max(0, ...list.map((c) => Number(c.conn.id.split('-')[1]))) + 1;
  // Keep names unique when "Connect a broker" is clicked more than once.
  let name = displayName;
  for (let k = 2; list.some((c) => c.conn.display_name === name); k++) name = `${displayName} ${k}`;
  const state: ConnState = {
    conn: {
      id: `conn-${String(n).padStart(3, '0')}`,
      broker_name: 'plaid',
      display_name: name,
      connection_status: 'connected',
      account_ids: [`acct-${String(n).padStart(3, '0')}`],
      last_sync_at: iso(daysAgo(0)),
      error_message: null,
      connection_metadata: null,
      created_at: iso(daysAgo(0)),
      accountType: 'brokerage',
      cash: 1_250,
    },
    lots: [
      ['SPY', 20, 0.97, 'etf'],
      ['QQQ', 15, 0.93, 'etf'],
      ['COST', 5, 0.82, 'equity'],
      ['V', 18, 0.9, 'equity'],
    ],
  };
  list.push(state);
  return state;
}

export function removeConnection(id: string): void {
  connections = getConnections().filter((c) => c.conn.id !== id);
}

export interface HoldingRow {
  symbol: string;
  name: string;
  quantity: number;
  institution_price: number;
  institution_value: number;
  /** Per-share cost basis. */
  cost_basis: number;
  security_type: string;
  sector: string;
  connId: string;
}

export function holdingsFor(state: ConnState): HoldingRow[] {
  return state.lots.map(([symbol, quantity, ratio, type]) => {
    const inst = getInstrument(symbol);
    const price = lastPrice(symbol);
    return {
      symbol,
      name: inst.name,
      quantity,
      institution_price: price,
      institution_value: round(price * quantity),
      cost_basis: round(price * ratio),
      security_type: type,
      sector: inst.sector,
      connId: state.conn.id,
    };
  });
}

export const allHoldings = (): HoldingRow[] => getConnections().flatMap(holdingsFor);

export const totalValue = (): number => round(allHoldings().reduce((s, h) => s + h.institution_value, 0));
export const totalCostBasis = (): number => round(allHoldings().reduce((s, h) => s + h.cost_basis * h.quantity, 0));

/** Change in value over the last `tradingDays` trading days. */
export function valueChange(tradingDays: number): { pl: number; base: number } {
  let pl = 0;
  let base = 0;
  for (const h of allHoldings()) {
    const startPrice = h.institution_price / (1 + periodReturnPct(h.symbol, tradingDays) / 100);
    base += startPrice * h.quantity;
    pl += (h.institution_price - startPrice) * h.quantity;
  }
  return { pl: round(pl), base: round(base) };
}

export const DISCLAIMER =
  'Demo data. Figures are simulated for illustration and are not investment advice.';

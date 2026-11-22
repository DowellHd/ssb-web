/** Crypto prices, market overview, watchlist and portfolio. Prices come from the shared market module. */
import { DemoHttpError } from '../errors';
import { dayChange, getInstrument, lastPrice, periodReturnPct } from '../market';
import { daysAgo, hashString, iso, newId, round, seedId } from '../prng';
import { del, get, post, type DemoRoute } from '../router';

interface CoinMeta {
  id: string;
  symbol: string;
  supply: number;
}

const COINS: CoinMeta[] = [
  { id: 'bitcoin', symbol: 'BTC', supply: 19_800_000 },
  { id: 'ethereum', symbol: 'ETH', supply: 120_400_000 },
  { id: 'ripple', symbol: 'XRP', supply: 57_000_000_000 },
  { id: 'binancecoin', symbol: 'BNB', supply: 145_900_000 },
  { id: 'solana', symbol: 'SOL', supply: 470_000_000 },
  { id: 'dogecoin', symbol: 'DOGE', supply: 146_000_000_000 },
  { id: 'cardano', symbol: 'ADA', supply: 35_500_000_000 },
  { id: 'avalanche-2', symbol: 'AVAX', supply: 410_000_000 },
  { id: 'chainlink', symbol: 'LINK', supply: 626_000_000 },
  { id: 'polkadot', symbol: 'DOT', supply: 1_520_000_000 },
  { id: 'litecoin', symbol: 'LTC', supply: 75_100_000 },
];

const byId = (id: string) => COINS.find((c) => c.id === id);

function coinPrice(c: CoinMeta, rank: number) {
  const inst = getInstrument(c.symbol);
  const price = lastPrice(c.symbol);
  const day = dayChange(c.symbol);
  const cap = price * c.supply;
  const athFactor = 1.08 + (hashString(`ath:${c.symbol}`) % 55) / 100;
  return {
    coin_id: c.id,
    symbol: c.symbol.toLowerCase(),
    name: inst.name,
    image: null as string | null,
    current_price: price,
    market_cap: Math.round(cap),
    market_cap_rank: rank,
    total_volume: Math.round(cap * (0.02 + (hashString(`cv:${c.symbol}`) % 60) / 1000)),
    price_change_24h: day.change,
    price_change_pct_24h: day.changePct,
    price_change_pct_7d: periodReturnPct(c.symbol, 5),
    price_change_pct_30d: periodReturnPct(c.symbol, 21),
    circulating_supply: c.supply,
    ath: round(price * athFactor, price < 1 ? 4 : 2),
    ath_change_pct: round((1 / athFactor - 1) * 100, 1),
  };
}

const ranked = () =>
  [...COINS]
    .sort((a, b) => lastPrice(b.symbol) * b.supply - lastPrice(a.symbol) * a.supply)
    .map((c, i) => coinPrice(c, i + 1));

// ── Watchlist & portfolio (in memory) ───────────────────────────────────────
interface WatchItem {
  id: string;
  coin_id: string;
  symbol: string;
  name: string;
  added_at: string;
}
let watchlist: WatchItem[] | null = null;
const getWatchlist = (): WatchItem[] =>
  (watchlist ??= [
    { id: seedId('watch', 1), coin_id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', added_at: iso(daysAgo(18)) },
    { id: seedId('watch', 2), coin_id: 'ethereum', symbol: 'ETH', name: 'Ethereum', added_at: iso(daysAgo(18)) },
    { id: seedId('watch', 3), coin_id: 'solana', symbol: 'SOL', name: 'Solana', added_at: iso(daysAgo(7)) },
  ]);

interface Holding {
  id: string;
  coin_id: string;
  symbol: string;
  name: string;
  quantity: string;
  avg_cost_usd: string;
  notes: string | null;
  created_at: string;
}
let holdings: Holding[] | null = null;
const getHoldings = (): Holding[] =>
  (holdings ??= [
    { id: seedId('hold', 1), coin_id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', quantity: '0.4200', avg_cost_usd: String(round(lastPrice('BTC') * 0.62)), notes: 'Long-term hold', created_at: iso(daysAgo(60)) },
    { id: seedId('hold', 2), coin_id: 'ethereum', symbol: 'ETH', name: 'Ethereum', quantity: '5.5000', avg_cost_usd: String(round(lastPrice('ETH') * 0.78)), notes: null, created_at: iso(daysAgo(45)) },
    { id: seedId('hold', 3), coin_id: 'solana', symbol: 'SOL', name: 'Solana', quantity: '40.0000', avg_cost_usd: String(round(lastPrice('SOL') * 1.12)), notes: 'Bought near local high', created_at: iso(daysAgo(20)) },
  ]);

function portfolioView() {
  const rows = getHoldings().map((h) => {
    const sym = h.symbol.toUpperCase();
    const price = lastPrice(sym);
    const qty = Number(h.quantity);
    const cost = qty * Number(h.avg_cost_usd);
    const value = qty * price;
    return {
      ...h,
      current_price_usd: price,
      current_value_usd: round(value),
      cost_basis_usd: round(cost),
      unrealized_pl_usd: round(value - cost),
      unrealized_pl_pct: cost ? round(((value - cost) / cost) * 100, 2) : 0,
      updated_at: h.created_at,
    };
  });
  const cost = rows.reduce((s, r) => s + r.cost_basis_usd, 0);
  const value = rows.reduce((s, r) => s + r.current_value_usd, 0);
  return {
    holdings: rows,
    total_holdings: rows.length,
    total_cost_basis_usd: round(cost),
    total_current_value_usd: round(value),
    total_unrealized_pl_usd: round(value - cost),
    total_unrealized_pl_pct: cost ? round(((value - cost) / cost) * 100, 2) : 0,
  };
}

export const cryptoRoutes: DemoRoute[] = [
  get('/crypto/prices', ({ query }) => {
    const page = Math.max(1, Number(query.page) || 1);
    const perPage = Math.max(1, Number(query.per_page) || 20);
    const all = ranked();
    return { coins: all.slice((page - 1) * perPage, page * perPage), total: all.length, page, per_page: perPage };
  }),

  get('/crypto/market-overview', () => {
    const all = ranked();
    const total = all.reduce((s, c) => s + (c.market_cap ?? 0), 0);
    const vol = all.reduce((s, c) => s + (c.total_volume ?? 0), 0);
    const cap = (id: string) => all.find((c) => c.coin_id === id)?.market_cap ?? 0;
    // Weight the 24h change by market cap.
    const change = all.reduce((s, c) => s + (c.price_change_pct_24h ?? 0) * ((c.market_cap ?? 0) / total), 0);
    return {
      total_market_cap_usd: total,
      total_volume_usd: vol,
      market_cap_change_pct_24h: round(change, 2),
      btc_dominance: round((cap('bitcoin') / total) * 100, 1),
      eth_dominance: round((cap('ethereum') / total) * 100, 1),
      active_cryptocurrencies: 14_820,
      markets: 1_145,
    };
  }),

  get('/crypto/gainers-losers', () => {
    const sorted = ranked().sort((a, b) => (b.price_change_pct_24h ?? 0) - (a.price_change_pct_24h ?? 0));
    return { gainers: sorted.slice(0, 5), losers: sorted.slice(-5).reverse() };
  }),

  get('/crypto/search', ({ query }) => {
    const q = (query.q || '').trim().toLowerCase();
    const results = ranked()
      .filter((c) => !q || c.name.toLowerCase().includes(q) || c.symbol.includes(q) || c.coin_id.includes(q))
      .slice(0, 10)
      .map((c) => ({ coin_id: c.coin_id, symbol: c.symbol, name: c.name, market_cap_rank: c.market_cap_rank, thumb: null }));
    return { results, query: query.q || '' };
  }),

  get('/crypto/watchlist', () => ({ items: getWatchlist().map((w) => ({ ...w })), total: getWatchlist().length })),
  post('/crypto/watchlist', ({ body }) => {
    if (getWatchlist().some((w) => w.coin_id === body?.coin_id)) throw new DemoHttpError(409, 'Already in your watchlist');
    getWatchlist().push({
      id: newId('watch'),
      coin_id: body?.coin_id,
      symbol: String(body?.symbol ?? '').toUpperCase(),
      name: body?.name ?? body?.coin_id,
      added_at: iso(new Date()),
    });
    return { items: getWatchlist().map((w) => ({ ...w })), total: getWatchlist().length };
  }),
  del('/crypto/watchlist/:coinId', ({ params }) => {
    watchlist = getWatchlist().filter((w) => w.coin_id !== params.coinId);
    return { success: true };
  }),

  get('/crypto/portfolio', () => portfolioView()),
  post('/crypto/portfolio', ({ body }) => {
    const meta = byId(body?.coin_id);
    getHoldings().push({
      id: newId('hold'),
      coin_id: body?.coin_id,
      symbol: String(body?.symbol ?? meta?.symbol ?? '').toUpperCase(),
      name: body?.name ?? body?.coin_id,
      quantity: String(body?.quantity ?? '0'),
      avg_cost_usd: String(body?.avg_cost_usd ?? '0'),
      notes: body?.notes ?? null,
      created_at: iso(new Date()),
    });
    return portfolioView();
  }),
  del('/crypto/portfolio/:id', ({ params }) => {
    holdings = getHoldings().filter((h) => h.id !== params.id);
    return { success: true };
  }),
];

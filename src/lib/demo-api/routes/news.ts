/**
 * News and the daily market summary.
 *
 * Articles are generated from templates over the demo market data and are
 * labelled `source: 'seeded'`. They describe the *synthetic* moves in this demo
 * and never assert real-world events, earnings figures or quotes.
 */
import { DemoHttpError } from '../errors';
import { dayChange, getInstrument, lastPrice, periodReturnPct, UNIVERSE } from '../market';
import { hashString, hoursAgo, iso, isoDay, demoNow, round, seedId } from '../prng';
import { get, type DemoRoute } from '../router';

type Category =
  | 'market_overview'
  | 'earnings'
  | 'economic'
  | 'sector'
  | 'company'
  | 'crypto'
  | 'commodities'
  | 'forex'
  | 'regulatory'
  | 'breaking';
type Sentiment = 'bullish' | 'bearish' | 'neutral';
type Priority = 'breaking' | 'high' | 'normal' | 'low';

interface Article {
  id: string;
  headline: string;
  summary: string;
  content: string;
  source: 'seeded';
  category: Category;
  sentiment: Sentiment;
  sentiment_score: number;
  symbols: string[];
  published_at: string;
  priority: Priority;
  is_premium: boolean;
}

const CATEGORIES: Category[] = ['market_overview', 'earnings', 'economic', 'sector', 'company', 'crypto', 'commodities', 'forex', 'regulatory', 'breaking'];

const sentimentFor = (pct: number): { sentiment: Sentiment; score: number } => {
  const score = Math.max(-1, Math.min(1, round(pct / 3, 2)));
  return { sentiment: score > 0.15 ? 'bullish' : score < -0.15 ? 'bearish' : 'neutral', score };
};

const fmt = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;

type Spec = { category: Category; symbols: string[]; make: (m: { name: string; pct: number; week: number; price: number }) => { headline: string; summary: string; body: string } };

const company = (symbol: string): Spec => ({
  category: 'company',
  symbols: [symbol],
  make: ({ name, pct, week, price }) => ({
    headline: pct >= 0 ? `${name} extends gains, closing ${fmt(pct)} at $${price.toFixed(2)}` : `${name} slips ${fmt(pct).replace('-', '')} as traders take profits`,
    summary: `${symbol} moved ${fmt(pct)} on the session and ${fmt(week)} over the past week, with volume ${pct >= 0 ? 'running above' : 'near'} its recent average.`,
    body: `${name} (${symbol}) closed at $${price.toFixed(2)}, ${fmt(pct)} on the day and ${fmt(week)} over the last five sessions.\n\nTechnical watchers are tracking the stock's 50-day average as near-term support, while momentum indicators remain ${week >= 0 ? 'constructive' : 'subdued'}.\n\nThis article is generated from demo data for illustration and does not describe a real news event.`,
  }),
});

const earnings = (symbol: string): Spec => ({
  category: 'earnings',
  symbols: [symbol],
  make: ({ name, pct, price }) => ({
    headline: `What options traders are watching ahead of ${name}'s next report`,
    summary: `Implied volatility in ${symbol} options is elevated into the event, pricing a bigger-than-usual move.`,
    body: `${name} (${symbol}) trades at $${price.toFixed(2)} (${fmt(pct)} today). Options pricing suggests the market expects a wider-than-average move around the next earnings release.\n\nEvent risk can overwhelm technical signals, so some traders reduce size or use defined-risk structures into the print.\n\nGenerated demo content — no actual earnings data is referenced.`,
  }),
});

const SPECS: Spec[] = [
  ...['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'TSLA', 'JPM', 'XOM', 'UNH'].map(company),
  ...['AAPL', 'NVDA', 'COST', 'NFLX', 'CRM', 'ORCL'].map(earnings),
  {
    category: 'sector',
    symbols: ['XLK'],
    make: ({ pct, week }) => ({
      headline: `Technology leads sector scorecard, ${fmt(pct)} on the day`,
      summary: `The technology sector ETF is ${fmt(week)} over five sessions as leadership broadens.`,
      body: `Technology stocks outperformed on the session, with the sector fund ${fmt(pct)} and ${fmt(week)} over the past week.\n\nBreadth within the group has improved, a pattern that analysts often associate with healthier advances.\n\nGenerated demo content.`,
    }),
  },
  {
    category: 'sector',
    symbols: ['XLE'],
    make: ({ pct, week }) => ({
      headline: `Energy shares ${pct >= 0 ? 'firm' : 'ease'} as crude steadies`,
      summary: `The energy sector fund moved ${fmt(pct)} today and ${fmt(week)} this week.`,
      body: `Energy equities ${pct >= 0 ? 'advanced' : 'retreated'} alongside a steadier commodity tape. Sector rotation models are watching relative strength versus the broad market.\n\nGenerated demo content.`,
    }),
  },
  {
    category: 'sector',
    symbols: ['XLF'],
    make: ({ pct, week }) => ({
      headline: `Financials ${fmt(pct)}: banks in focus as yield curve flattens`,
      summary: `The financial sector fund is ${fmt(week)} over the week.`,
      body: `Financials traded ${pct >= 0 ? 'higher' : 'lower'} with attention on net-interest-margin expectations and credit quality.\n\nGenerated demo content.`,
    }),
  },
  {
    category: 'sector',
    symbols: ['XLV'],
    make: ({ pct }) => ({
      headline: `Health care defensives ${pct >= 0 ? 'attract bids' : 'lag'} in mixed tape`,
      summary: `Defensive sectors are in focus as investors weigh growth and rate expectations.`,
      body: `Health care shares ${pct >= 0 ? 'outperformed' : 'underperformed'} the broad market, a pattern sometimes seen when investors reposition toward defensives.\n\nGenerated demo content.`,
    }),
  },
  {
    category: 'market_overview',
    symbols: ['SPY'],
    make: ({ pct, week, price }) => ({
      headline: `S&P 500 proxy ${pct >= 0 ? 'edges higher' : 'dips'} to $${price.toFixed(2)}; breadth ${week >= 0 ? 'improves' : 'narrows'}`,
      summary: `SPY closed ${fmt(pct)} and is ${fmt(week)} over five sessions.`,
      body: `Broad-market ETF SPY finished at $${price.toFixed(2)}, ${fmt(pct)} on the day. Over the past week it has moved ${fmt(week)}.\n\nMarket participants are watching the 20-day average and volatility measures for confirmation of the current trend.\n\nGenerated demo content.`,
    }),
  },
  {
    category: 'market_overview',
    symbols: ['QQQ'],
    make: ({ pct, week }) => ({
      headline: `Nasdaq-100 fund ${fmt(pct)}: growth stocks ${pct >= 0 ? 'regain footing' : 'pause'}`,
      summary: `QQQ is ${fmt(week)} this week.`,
      body: `Growth-heavy indexes ${pct >= 0 ? 'rose' : 'slipped'} today. Rate sensitivity remains the key swing factor for long-duration equities.\n\nGenerated demo content.`,
    }),
  },
  {
    category: 'economic',
    symbols: ['TLT'],
    make: ({ pct, week }) => ({
      headline: `Treasuries ${pct >= 0 ? 'rally' : 'sell off'} as traders reassess the rate path`,
      summary: `The long-bond ETF moved ${fmt(pct)} today and ${fmt(week)} this week.`,
      body: `Long-dated Treasury prices ${pct >= 0 ? 'rose, pushing yields lower' : 'fell, pushing yields higher'}. Rate expectations remain a primary driver for both bonds and equities.\n\nGenerated demo content.`,
    }),
  },
  {
    category: 'economic',
    symbols: ['SPY', 'TLT'],
    make: () => ({
      headline: 'Week ahead: inflation data and central-bank commentary in focus',
      summary: 'Investors will parse inflation prints and policy-maker remarks for clues on the rate path.',
      body: 'The coming sessions feature several scheduled macro releases. Markets tend to react most to surprises relative to consensus rather than to the headline numbers themselves.\n\nGenerated demo content — not a real economic calendar.',
    }),
  },
  {
    category: 'commodities',
    symbols: ['GLD'],
    make: ({ pct, week, price }) => ({
      headline: `Gold ETF ${fmt(pct)} at $${price.toFixed(2)} as haven demand ${week >= 0 ? 'builds' : 'cools'}`,
      summary: `GLD is ${fmt(week)} over the last five sessions.`,
      body: `Gold-backed funds ${pct >= 0 ? 'gained' : 'eased'} as investors weighed real yields and the dollar.\n\nGenerated demo content.`,
    }),
  },
  {
    category: 'commodities',
    symbols: ['USO'],
    make: ({ pct }) => ({
      headline: `Crude oil fund ${fmt(pct)}: supply headlines drive a choppy session`,
      summary: 'Oil-linked funds traded in a wide intraday range.',
      body: 'Energy commodities swung through the session as traders balanced supply expectations against demand signals.\n\nGenerated demo content.',
    }),
  },
  {
    category: 'crypto',
    symbols: ['BTC'],
    make: ({ pct, week, price }) => ({
      headline: `Bitcoin ${fmt(pct)} to $${Math.round(price).toLocaleString()}; ${week >= 0 ? 'momentum holds' : 'bulls look for support'}`,
      summary: `BTC is ${fmt(week)} over the past week.`,
      body: `Bitcoin traded at $${Math.round(price).toLocaleString()}, ${fmt(pct)} on the day. Crypto remains highly volatile; position sizing and risk limits matter.\n\nGenerated demo content.`,
    }),
  },
  {
    category: 'crypto',
    symbols: ['ETH', 'SOL'],
    make: ({ pct }) => ({
      headline: `Ether and Solana ${pct >= 0 ? 'outpace' : 'trail'} the broader crypto market`,
      summary: 'Large-cap altcoins moved with higher beta than Bitcoin.',
      body: 'Altcoins typically amplify Bitcoin moves in both directions. Traders are watching funding rates and on-chain activity for positioning clues.\n\nGenerated demo content.',
    }),
  },
  {
    category: 'regulatory',
    symbols: ['COIN'],
    make: ({ pct }) => ({
      headline: 'Digital-asset policy discussions continue; market reaction muted',
      summary: `Crypto-exposed equities moved ${fmt(pct)} as investors await clarity.`,
      body: 'Regulatory frameworks for digital assets remain under discussion in multiple jurisdictions. Equities with crypto exposure often react to headlines more than to concrete rule changes.\n\nGenerated demo content.',
    }),
  },
  {
    category: 'regulatory',
    symbols: ['JPM', 'BAC'],
    make: () => ({
      headline: 'Bank capital rules back in the spotlight',
      summary: 'Analysts debate how proposed capital requirements could affect lending and buybacks.',
      body: 'Large banks are weighing how potential capital rule changes could affect shareholder returns and credit availability.\n\nGenerated demo content — not a report on any actual rule proposal.',
    }),
  },
  {
    category: 'forex',
    symbols: ['VXUS'],
    make: ({ pct }) => ({
      headline: `International equities ${fmt(pct)} as the dollar drifts`,
      summary: 'Currency moves are a key swing factor for US investors in foreign stocks.',
      body: 'Developed- and emerging-market equity funds moved with currency translation effects in focus.\n\nGenerated demo content.',
    }),
  },
  {
    category: 'forex',
    symbols: ['SPY'],
    make: () => ({
      headline: 'Dollar steadies; traders await next catalyst',
      summary: 'FX volatility remains below its recent average.',
      body: 'Major currency pairs consolidated within recent ranges as participants waited for fresh macro data.\n\nGenerated demo content.',
    }),
  },
  {
    category: 'breaking',
    symbols: ['NVDA'],
    make: ({ pct, price }) => ({
      headline: `BREAKING: NVDA ${pct >= 0 ? 'jumps' : 'drops'} ${fmt(pct).replace(/^[-+]/, '')} to $${price.toFixed(2)} in heavy volume`,
      summary: 'Semiconductor names are moving sharply; traders cite positioning ahead of key events.',
      body: 'Shares of NVIDIA traded on heavy volume, with semiconductors broadly in focus.\n\nGenerated demo content describing a synthetic price move; it does not report a real event.',
    }),
  },
];

let cache: Article[] | null = null;
function articles(): Article[] {
  if (cache) return cache;
  cache = SPECS.map((spec, i) => {
    const sym = spec.symbols[0];
    const day = dayChange(sym);
    const week = periodReturnPct(sym, 5);
    const m = spec.make({ name: getInstrument(sym).name.replace(/,? Inc\.?|Corporation|Incorporated/g, '').trim(), pct: day.changePct, week, price: lastPrice(sym) });
    const s = sentimentFor(spec.category === 'earnings' ? 0 : day.changePct);
    const priority: Priority = spec.category === 'breaking' ? 'breaking' : i < 6 ? 'high' : i % 5 === 0 ? 'low' : 'normal';
    return {
      id: seedId('news', i + 1),
      headline: m.headline,
      summary: m.summary,
      content: m.body,
      source: 'seeded' as const,
      category: spec.category,
      sentiment: s.sentiment,
      sentiment_score: s.score,
      symbols: spec.symbols,
      published_at: iso(hoursAgo(0.5 + i * 1.6 + (hashString(`n:${i}`) % 10) / 10)),
      priority,
      is_premium: i % 7 === 3,
    };
  }).sort((a, b) => b.published_at.localeCompare(a.published_at));
  return cache;
}

export const newsRoutes: DemoRoute[] = [
  get('/news', ({ query }) => {
    const cats = query.categories?.split(',').filter(Boolean);
    const syms = query.symbols?.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
    const search = query.search?.toLowerCase();
    const filtered = articles().filter(
      (a) =>
        (!cats?.length || cats.includes(a.category)) &&
        (!syms?.length || a.symbols.some((s) => syms.includes(s))) &&
        (!query.sentiment || a.sentiment === query.sentiment) &&
        (!query.priority || a.priority === query.priority) &&
        (!search || a.headline.toLowerCase().includes(search) || a.summary.toLowerCase().includes(search)),
    );
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.max(1, Number(query.page_size) || 10);
    const slice = filtered.slice((page - 1) * pageSize, page * pageSize).map(({ content: _c, ...rest }) => rest);
    return {
      articles: slice,
      total_count: filtered.length,
      page,
      page_size: pageSize,
      has_more: page * pageSize < filtered.length,
      filters_applied: {
        categories: cats,
        symbols: syms,
        sentiment: query.sentiment,
        priority: query.priority,
        search: query.search,
      },
      data_source: 'seeded',
    };
  }),

  get('/news/meta/categories', () => CATEGORIES),

  get('/news/summary/daily', () => {
    // Every large-cap equity in the universe, so the loser list has real decliners when any exist.
    const stocks = UNIVERSE.filter((u) => u.assetClass === 'equity').map((u) => u.symbol);
    const movers = stocks
      .map((symbol) => ({ symbol, name: getInstrument(symbol).name, change_percent: dayChange(symbol).changePct, price: lastPrice(symbol) }))
      .sort((a, b) => b.change_percent - a.change_percent);
    const sectors: Array<[string, string]> = [['Technology', 'XLK'], ['Financials', 'XLF'], ['Energy', 'XLE'], ['Health Care', 'XLV']];
    const spy = dayChange('SPY').changePct;
    const s = sentimentFor(spy);
    return {
      summary: {
        summary_date: isoDay(demoNow()),
        market_status: 'closed',
        headline: spy >= 0 ? `US stocks close higher; S&P 500 proxy ${fmt(spy)}` : `US stocks close lower; S&P 500 proxy ${fmt(spy)}`,
        overview: `The broad market ${spy >= 0 ? 'advanced' : 'declined'} on the session, with ${movers[0].symbol} leading and ${movers[movers.length - 1].symbol} lagging among large caps. Volatility measures remain near their one-year median.`,
        key_events: [
          'Large-cap technology drove index performance',
          'Treasury yields were little changed on the day',
          'Trading volume was in line with the 20-day average',
        ],
        top_gainers: movers.slice(0, 3),
        top_losers: movers.slice(-3).reverse(),
        sector_performance: sectors.map(([sector, etf]) => {
          const p = dayChange(etf).changePct;
          return { sector, change_percent: p, trend: p > 0.15 ? 'up' : p < -0.15 ? 'down' : 'flat' };
        }),
        sentiment_overview: s.sentiment,
        sentiment_score: s.score,
        analysis_note: 'Generated from demo data for illustration; it does not summarise real market activity.',
        tier: 'pro',
      },
      is_delayed: false,
      delay_minutes: 0,
    };
  }),

  get('/news/:id', ({ params }) => {
    const a = articles().find((x) => x.id === params.id);
    if (!a) throw new DemoHttpError(404, 'Article not found');
    return a;
  }),
];

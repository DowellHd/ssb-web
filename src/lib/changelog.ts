/**
 * Changelog entries for SSB platform updates.
 *
 * All entries are factual and refer to shipped work only.
 * No future dates, no commitments, no marketing language.
 */

export interface ChangelogEntry {
  /** Subsystem or area name */
  subsystem: string;
  /** Version tag (semantic or descriptive) */
  version: string;
  /** ISO-8601 date of release */
  date: string;
  /** Factual list of changes */
  changes: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    subsystem: 'Platform',
    version: '1.3.0',
    date: '2026-05-20',
    changes: [
      'Dark/light mode toggle added to sidebar and mobile header — persists across sessions via next-themes',
      'Options payoff diagram on the paper options page — shows at-expiry P&L curve for all open positions grouped by symbol',
      'Learning path completion certificates — printable/PDF certificate appears when all modules in a path are marked complete',
      'Earnings Calendar page at /app/earnings — upcoming and recent earnings events with EPS estimates, revenue, and beat/miss flags',
      'Paper trading leaderboard at /app/paper/leaderboard — top 25 paper accounts ranked by total return; your rank is highlighted',
      'Integration test suite with Playwright — auth, dashboard, paper trading, learn hub, and earnings calendar critical paths',
    ],
  },
  {
    subsystem: 'Growth',
    version: '1.0.0',
    date: '2026-05-18',
    changes: [
      'Referral program launched — share your unique link and track how many friends you have invited',
      'Referral stats: total referrals, converted signups, and pending',
      'Refer Friends page at /app/referral with one-click copy, Twitter/LinkedIn share buttons',
    ],
  },
  {
    subsystem: 'Backtests',
    version: '1.2.0',
    date: '2026-05-18',
    changes: [
      'Shareable backtest links — generate a public read-only URL for any completed backtest and share it with anyone',
      'Public backtest view shows metrics, equity curve, and a CTA to sign up',
    ],
  },
  {
    subsystem: 'Portfolio Management',
    version: '1.2.0',
    date: '2026-05-18',
    changes: [
      'Added Manual Positions tab — track holdings from accounts not connected via Plaid (stocks, ETFs, crypto, other)',
      'CRUD operations: add, edit, and delete manual positions with symbol, quantity, avg cost, and optional notes',
      'Risk profile from onboarding quiz is now saved to the database via PATCH /settings/profile',
      'Monte Carlo simulation endpoint now runs real correlated GBM paths using Cholesky decomposition instead of analytical estimates',
      'Simulation tier limits enforced: free = 100 paths, pro = 5,000 paths',
    ],
  },
  {
    subsystem: 'Portfolio Management',
    version: '1.1.0',
    date: '2026-05-15',
    changes: [
      'Added period filter (1D / 1W / 1M / 3M / YTD / All) to My Portfolio tab — switches P&L and Return metrics to the selected window',
      'Period P&L uses Alpaca historical prices fetched concurrently for all holdings; falls back to all-time cost-basis when Alpaca data is unavailable',
      'Stat card labels update dynamically with the selected period (e.g. "1-Day P&L", "1-Month Return")',
      'Cost Basis card hidden for period views where it is not meaningful',
      'Registered Portfolio Management in the Quick Access search palette — now findable by "portfolio", "p&l", "holdings", "rebalance", "attribution", and more',
    ],
  },
  {
    subsystem: 'AI Strategy Insights',
    version: '1.0.0',
    date: '2026-04-23',
    changes: [
      'Launched AI Strategy Insights page (/app/strategy) — LLM-powered educational portfolio analysis using GPT-4o-mini',
      'Integrates Plaid-linked portfolio holdings for context-aware analysis when broker account is connected',
      'Returns risk level (low/moderate/high), confidence score, diversification score, and 3–5 key portfolio themes',
      'All AI output is post-processed to strip directive buy/sell language — educational observations only',
      'Rate-limited to 10 analyses per hour; results cached in Redis for 15 minutes',
      'Requires one-time agreement to AI disclaimer before first use (logged to DB with timestamp)',
      'Analysis history panel shows all past analyses with expandable details',
      'Pro+ plan required; free users see a plan gate',
    ],
  },
  {
    subsystem: 'Signal Feed (Assisted Trading)',
    version: '1.0.0',
    date: '2026-04-23',
    changes: [
      'Added Signal Feed page (/app/signals) — live technical setups generated from 30+ indicators, filterable and sortable',
      'Added Pre-Trade Intelligence Panel (/app/signals/[id]) — full breakdown with entry zone, stop-loss, take-profit, risk/reward, and plain-English summary',
      'Added Smart Order Suggestions section with ATR-based trade levels and broker deep-link support',
      'Added "I Took This Trade" flow — users can privately log trade entries against any signal',
      'Added Trade Log & Performance page (/app/signals/performance) — win rate, avg return, best/worst trade',
      'Added Trading Preferences settings page (/app/settings/trading) — preferred broker, risk tolerance, position cap, confidence threshold, alert preferences',
      'Added first-time onboarding modal with disclaimer acceptance (logged to DB with timestamp)',
      'Added non-dismissible DisclaimerBanner on all signal pages per compliance requirements',
      'Added Open-in-Broker deep links (Robinhood, Webull, Alpaca, TD Ameritrade, Fidelity, IBKR) — opens in new tab, SSB never touches order execution',
      'Signal confidence: free users see only signals ≥70%; pro+ users respect their stored threshold',
      'All signal data sourced from TechnicalEngine (30+ indicators, no look-ahead bias)',
    ],
  },
  {
    subsystem: 'Advisor CRM',
    version: '2.1.0',
    date: '2026-04-13',
    changes: [
      'Added Practice Analytics page with full business intelligence dashboard (revenue forecasting, pipeline funnel, segment AUM breakdown, KYC compliance metrics)',
      'Added lead scoring — automatic 0–100 score per client based on AUM, segment, KYC status, and account status',
      'Added revenue forecasting from fee schedules (AUM %, flat, hourly) with monthly/quarterly/annual projections',
      'Added top-clients-by-AUM and hot-leads rankings on the analytics page',
      'Added Schedule tab on client detail: communication timeline (filtered meeting/call/email/follow-up notes) + upcoming appointment list',
      'Added Reports tab: full client review summary with profile snapshot, lead score meter, activity summary, portfolio assignment, and advisory notes',
      'Added lead score badge on every client row in the CRM list',
      'Added estimated annual revenue display on client detail quick stats',
      'Added Analytics shortcut button in the Advisor CRM header',
      'Added Practice Analytics nav link under Enterprise sidebar section',
    ],
  },
  {
    subsystem: 'Advisor CRM',
    version: '2.0.0',
    date: '2026-04-13',
    changes: [
      'Rebuilt Advisor CRM dashboard with pipeline view, AUM breakdown by segment, and KYC status indicators',
      'Added client detail pages with tabbed interface (Overview, Notes, Tasks, Portfolio Link)',
      'Added client activity notes with note types (meeting, call, email, follow-up, review)',
      'Added client task management with priority levels, due dates, and overdue detection',
      'Added model portfolio linking — assign a portfolio template to each client',
      'Expanded client profiles with KYC fields: date of birth, occupation, employer, income, net worth',
      'Added fee structure tracking (flat, AUM %, hourly) per client',
      'Added client segmentation (Mass Market / Affluent / HNW / UHNW)',
      'Added CRM dashboard API with aggregated metrics: AUM totals, open tasks, overdue tasks, clients due for review',
      'Added bulk status update endpoint for batch client lifecycle management',
      'Added client search by name, email, or tag on the main CRM list',
    ],
  },
  {
    subsystem: 'Platform',
    version: '1.5.0',
    date: '2026-04-12',
    changes: [
      'Collapsible sidebar with icon-only rail mode on desktop',
      'Sidebar collapse state persisted to localStorage',
      'Clicking a collapsed nav group now closes all others and opens only the selected one',
      'Fixed signup crash caused by incorrect error message extraction from API responses',
    ],
  },
  {
    subsystem: 'Global Markets',
    version: '2.0.0',
    date: '2026-04-12',
    changes: [
      'Added Sovereign Debt tab with 15-country yield browser, DM/EM filter, and visual yield bars',
      'Added FX & Hedging tab with live currency converter, Covered Interest Rate Parity forward rate calculation, and 4 hedging strategies',
      'Added ADR withholding tax and foreign tax credit reference panel',
      'Added sector performance weights table with regional breakdown',
      'Added DM/EM filter to country risk table on overview',
    ],
  },
  {
    subsystem: 'Fixed Income',
    version: '2.0.0',
    date: '2026-04-12',
    changes: [
      'Added Bond Screener with 20 sample bonds across treasury, TIPS, agency, corporate IG/HY, and municipal categories',
      'Screener supports filtering by type, maturity, YTM range, and callable status',
      'Added Tax Tools module: tax-equivalent yield (TEY), after-tax yield, real yield (Fisher equation), TIPS breakeven, and muni vs. taxable comparison',
      'Added Yield-to-Call (YTC) calculation using Newton-Raphson method in the bond calculator',
      'Bond calculator now shows call price and years-to-call inputs with YTC < YTM warning badge',
    ],
  },
  {
    subsystem: 'Alternatives',
    version: '2.0.0',
    date: '2026-04-12',
    changes: [
      'Added REIT metrics table with P/FFO, NAV premium/discount, dividend yield, and debt/equity across 9 tickers',
      'Added commodity futures term structure visualization for 5 commodities with contango/backwardation color coding',
      'Added IRR/MOIC calculator using Newton-Raphson method for private equity and venture capital cashflow modeling',
      'Added hedge fund strategy breakdown with AUM distribution, Sharpe ratios, fee structures, and risk profiles',
      'Added art and collectibles as a position category with liquidity badge and portfolio liquidity profile chart',
    ],
  },
  {
    subsystem: 'Trade Ideas',
    version: '1.0.0',
    date: '2026-03-25',
    changes: [
      'Launched signal-based trade idea generation for momentum, mean-reversion, options strategies, earnings plays, and sector rotation',
      'Ideas include thesis, entry criteria, and risk parameters for each signal type',
      'Ideas are saved per user with 7-day expiry and can be marked executed or dismissed',
      'Requires starter tier or higher',
    ],
  },
  {
    subsystem: 'Broker Integration',
    version: '1.1.0',
    date: '2026-03-28',
    changes: [
      'Added Plaid OAuth connection flow for brokerage account linking',
      'Broker holdings and account data cached for faster dashboard loading',
      'Added broker connection management UI',
    ],
  },
  {
    subsystem: 'Predictive Analytics',
    version: '1.0.0',
    date: '2026-03-20',
    changes: [
      'Launched price target forecasting with confidence intervals',
      'Added earnings estimate tracking and analyst revision monitoring',
      'Added factor exposure analysis for individual securities',
    ],
  },
  {
    subsystem: 'Community',
    version: '1.0.0',
    date: '2026-03-05',
    changes: [
      'Launched community profiles with public portfolio sharing and social following',
      'Added community trade ideas sharing and rating system',
      'Added shared watchlists with community collaboration',
      'Added investment clubs with shared portfolios and discussion',
      'Community features gated by plan tier',
    ],
  },
  {
    subsystem: 'Options',
    version: '1.1.0',
    date: '2026-03-08',
    changes: [
      'Added full options chain viewer with expiration selector and strike filters',
      'Chain table shows delta, gamma, theta, vega, IV, OI, and volume across all strikes',
      'Mobile-optimized card layout for options chain on small screens',
      'Simulated data badge always visible — data is Black-Scholes educational model, not live market prices',
      'Chain viewer requires starter tier or higher',
    ],
  },
  {
    subsystem: 'Options',
    version: '1.0.0',
    date: '2026-03-01',
    changes: [
      'Launched Options feature with tier-gated landing page and permanent disclaimer',
      'Introduced Black-Scholes simulated options data provider for educational use',
      'Added provider abstraction layer for future real data source integration',
      'Added paper options positions and orders backend models',
      'Entitlement keys: options chain viewer (starter+), paper trading and analytics (pro+)',
    ],
  },
  {
    subsystem: 'Learn',
    version: '1.0.0',
    date: '2026-02-20',
    changes: [
      'Launched Learn module with 14 educational modules across 4 learning paths',
      'Free tier: 9 modules covering investing fundamentals, technical analysis, and risk management',
      'Pro tier: 5 advanced modules on options, quantitative strategies, and portfolio construction',
      'Added 38-term financial glossary',
      'Added context links panel connecting Learn content to relevant SSB features',
      'Module progress and path completion tracked per user',
    ],
  },
  {
    subsystem: 'Monitoring',
    version: '1.0.0',
    date: '2026-03-10',
    changes: [
      'Added Prometheus metrics endpoint for infrastructure observability',
      'Integrated Sentry for error tracking and performance monitoring',
      'Added APM middleware logging slow requests over 1 second with X-Response-Time header',
      'Added slow query detection with configurable threshold (default 500ms)',
    ],
  },
  {
    subsystem: 'Enterprise',
    version: '1.1.0',
    date: '2026-03-15',
    changes: [
      'Added audit trail logging for all sensitive user and admin actions',
      'Added notification preferences management per user',
      'Added API key usage tracking for enterprise/institutional tier',
      'Added compliance tools and investment compliance framework',
    ],
  },
  {
    subsystem: 'Platform',
    version: '1.1.0',
    date: '2026-02-08',
    changes: [
      'Added changelog and roadmap views',
      'Added paper trade execution pipeline',
      'Added execution audit logging',
      'Enforced MFA on high-privilege actions',
      'Built custom alert rules in SSB admin panel',
    ],
  },
  {
    subsystem: 'Charting',
    version: '1.3.0',
    date: '2026-02-05',
    changes: [
      'Added short-term and long-term view mode support',
      'Improved price chart rendering',
    ],
  },
  {
    subsystem: 'Regime Analysis',
    version: '1.2.0',
    date: '2026-02-05',
    changes: [
      'Added interpretability explanations for regime classifications',
      'Improved confidence calculation transparency',
      'Added long-term regime insights',
    ],
  },
  {
    subsystem: 'Risk Analytics',
    version: '1.1.0',
    date: '2026-02-05',
    changes: [
      'Added long-term risk framing',
      'Improved parametric VaR analysis',
    ],
  },
  {
    subsystem: 'View Mode',
    version: '1.0.0',
    date: '2026-02-05',
    changes: [
      'Introduced global short-term and long-term view toggle',
    ],
  },
  {
    subsystem: 'Stress Testing',
    version: '1.0.0',
    date: '2026-02-04',
    changes: [
      'Launched historical stress testing',
    ],
  },
];

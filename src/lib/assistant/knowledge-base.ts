/**
 * SSB Assistant Knowledge Base v2
 *
 * Enhanced knowledge base with:
 * - Intent-based content (definition, how_to, troubleshoot)
 * - Page scopes for context-aware responses
 * - Aliases and synonyms for query normalization
 * - Zero external API calls - all responses are deterministic
 */

// =============================================================================
// Types
// =============================================================================

export type Intent = 'definition' | 'how_to' | 'troubleshoot' | 'fallback';

export type PageScope =
  | 'global'
  | 'dashboard'
  | 'paper'
  | 'backtest'
  | 'risk'
  | 'regime'
  | 'stress'
  | 'settings'
  | 'billing'
  | 'audit'
  | 'portfolio'
  | 'options'
  | 'learn'
  | 'enterprise'
  | 'simulations'
  | 'signals'
  | 'community'
  | 'crypto'
  | 'news';

export interface KBEntry {
  id: string;
  title: string;
  /** Primary keywords for matching */
  keywords: string[];
  /** Aliases / synonyms that map to this entry */
  aliases?: string[];
  /** Which pages this entry is most relevant to */
  pageScopes: PageScope[];
  /** Content by intent type */
  content: {
    definition: string;
    how_to?: string;
    troubleshoot?: string;
  };
  /** Related topic IDs */
  relatedTopics?: string[];
}

export interface KBGlossaryTerm {
  term: string;
  aliases?: string[];
  definition: string;
  category: 'risk' | 'trading' | 'analytics' | 'platform';
}

// =============================================================================
// Query Normalization - Synonyms & Aliases
// =============================================================================

/**
 * Map of common synonyms/aliases to canonical terms.
 * Used to normalize user queries before matching.
 */
export const QUERY_SYNONYMS: Record<string, string> = {
  // P&L variations
  'p&l': 'pnl',
  'p and l': 'pnl',
  'pl': 'pnl',
  'profit loss': 'pnl',
  'profit and loss': 'pnl',
  'profit/loss': 'pnl',
  'gains losses': 'pnl',

  // Return variations
  'roi': 'return',
  'returns': 'return',
  'performance': 'return',
  'gains': 'return',

  // Volatility variations
  'vol': 'volatility',
  'vola': 'volatility',
  'std dev': 'volatility',
  'standard deviation': 'volatility',

  // VaR variations
  'value-at-risk': 'var',
  'value at risk': 'var',

  // Paper trading variations
  'paper': 'paper trading',
  'simulated trading': 'paper trading',
  'virtual trading': 'paper trading',
  'demo trading': 'paper trading',
  'practice trading': 'paper trading',
  'sandbox': 'paper trading',
  'fake money': 'paper trading',

  // Backtest variations
  'backtest': 'backtesting',
  'back test': 'backtesting',
  'back-test': 'backtesting',
  'historical test': 'backtesting',
  'strategy test': 'backtesting',

  // Tier/plan variations
  'tier': 'plan',
  'tiers': 'plan',
  'subscription': 'plan',
  'pricing': 'plan',
  'upgrade': 'plan',
  'entitlement': 'plan',
  'entitlements': 'plan',
  'limits': 'plan',

  // Market regime variations
  'regime': 'market regime',
  'regimes': 'market regime',
  'market state': 'market regime',
  'market condition': 'market regime',
  'market conditions': 'market regime',

  // Drawdown variations
  'dd': 'drawdown',
  'max dd': 'drawdown',
  'mdd': 'drawdown',
  'maximum drawdown': 'drawdown',

  // Stress test variations
  'stress': 'stress testing',
  'stress-test': 'stress testing',
  'scenario analysis': 'stress testing',
  'crisis simulation': 'stress testing',

  // Position variations
  'positions': 'position',
  'holdings': 'position',
  'portfolio': 'position',

  // Order variations
  'orders': 'order',
  'trades': 'order',
  'transactions': 'order',

  // Chart overlay variations
  'overlay': 'chart overlay',
  'overlays': 'chart overlay',
  'sma': 'chart overlay',
  'moving average': 'chart overlay',
  'trend line': 'chart overlay',
  'indicators': 'chart overlay',
  'technical indicators': 'chart overlay',

  // Account variations
  'account': 'account',
  'balance': 'account',
  'cash': 'account',
  'funds': 'account',

  // Platform variations
  'ssb': 'platform',
  'smart strategies': 'platform',
  'smart strategies builder': 'platform',
  'app': 'platform',
  'application': 'platform',

  // View mode variations
  'short term': 'view mode',
  'long term': 'view mode',
  'short-term': 'view mode',
  'long-term': 'view mode',
  'timeframe': 'view mode',
  'view': 'view mode',

  // Scenario mode variations
  'scenario': 'scenario mode',
  'what if': 'scenario mode',
  'what-if': 'scenario mode',
  'simulation mode': 'scenario mode',
  'override': 'scenario mode',

  // Regime indicator variations
  'trend score': 'regime indicators',
  'breadth': 'regime indicators',
  'breadth score': 'regime indicators',
  'volatility percentile': 'regime indicators',
  'confidence score': 'regime indicators',

  // Audit log variations
  'audit': 'audit log',
  'activity log': 'audit log',
  'history': 'audit log',
  'log': 'audit log',

  // Portfolio health variations
  'portfolio health': 'portfolio health',
  'health score': 'portfolio health',
  'risk score': 'portfolio health',
  'concentration': 'portfolio health',

  // Correlation variations
  'correlation': 'correlation analysis',
  'correlation matrix': 'correlation analysis',
  'corr': 'correlation analysis',

  // Long-term insight variations
  'long term insights': 'long-term insights',
  'long-term insights': 'long-term insights',
  'regime insights': 'long-term insights',

  // Options variations
  'option': 'options',
  'calls': 'options',
  'puts': 'options',
  'call option': 'options',
  'put option': 'options',
  'options chain': 'options chain',
  'option chain': 'options chain',
  'options trading': 'options paper trading',
  'options paper trade': 'options paper trading',
  'options contract': 'options',
  'strike': 'strike price',
  'expiry': 'expiration',
  'expiries': 'expiration',
  'greeks': 'options greeks',
  'delta': 'options greeks',
  'theta': 'options greeks',
  'gamma': 'options greeks',
  'vega': 'options greeks',
  'implied volatility': 'iv',
  'implied vol': 'iv',

  // Learn variations
  'learn': 'learn feature',
  'learning': 'learn feature',
  'courses': 'learn feature',
  'course': 'learn feature',
  'modules': 'learn feature',
  'module': 'learn feature',
  'lessons': 'learn feature',
  'lesson': 'learn feature',
  'education': 'learn feature',
  'learning path': 'learn paths',
  'learning paths': 'learn paths',
  'guided path': 'learn paths',
  'curriculum': 'learn paths',

  // API key variations
  'api key': 'api keys',
  'api keys': 'api keys',
  'developer': 'api keys',
  'api access': 'api keys',
  'enterprise': 'api keys',
  'webhook': 'webhooks',
  'webhooks': 'webhooks',
  'api docs': 'api documentation',
  'api documentation': 'api documentation',
  'scopes': 'api scopes',
  'api scope': 'api scopes',
  'rate limit': 'api rate limits',
  'rate limits': 'api rate limits',

  // Demo mode
  'demo mode': 'demo mode',
  'try it free': 'demo mode',
  'try demo': 'demo mode',
  'guest mode': 'demo mode',
  'no signup': 'demo mode',
  'demo session': 'demo mode',
  'demo account': 'demo mode',

  // Simulations
  'simulation': 'simulations',
  'monte carlo': 'simulations',
  'portfolio forecast': 'simulations',
  'outcome simulation': 'simulations',
  'probability simulation': 'simulations',
  'projected outcome': 'simulations',

  // Signal feed
  'signal': 'signal feed',
  'signals': 'signal feed',
  'trade signal': 'signal feed',
  'technical setup': 'signal feed',
  'signal alert': 'signal feed',

  // Community
  'community': 'community feed',
  'trade ideas': 'community feed',
  'community post': 'community feed',
  'idea feed': 'community feed',

  // Crypto
  'crypto': 'cryptocurrency',
  'bitcoin': 'cryptocurrency',
  'ethereum': 'cryptocurrency',
  'digital assets': 'cryptocurrency',
  'defi': 'cryptocurrency',
  'altcoin': 'cryptocurrency',

  // Technical indicators
  'rsi': 'relative strength index',
  'relative strength': 'relative strength index',
  'macd': 'macd indicator',
  'moving average convergence divergence': 'macd indicator',
  'bollinger': 'bollinger bands',
  'bband': 'bollinger bands',

  // Fundamental analysis
  'fundamentals': 'fundamental analysis',
  'pe ratio': 'fundamental analysis',
  'p/e ratio': 'fundamental analysis',
  'price to earnings': 'fundamental analysis',
  'earnings per share': 'fundamental analysis',
  'eps': 'fundamental analysis',
  'valuation': 'fundamental analysis',
  'intrinsic value': 'fundamental analysis',
  'revenue growth': 'fundamental analysis',
  'free cash flow': 'fundamental analysis',
  'fcf': 'fundamental analysis',

  // Dollar cost averaging
  'dca': 'dollar cost averaging',
  'dollar cost average': 'dollar cost averaging',
  'systematic investing': 'dollar cost averaging',
  'periodic investing': 'dollar cost averaging',

  // Position sizing
  'kelly': 'position sizing',
  'kelly criterion': 'position sizing',
  'bet size': 'position sizing',
  'position size': 'position sizing',
  'how much to buy': 'position sizing',

  // Risk/reward
  'stop loss': 'risk reward',
  'stop-loss': 'risk reward',
  'take profit': 'risk reward',
  'risk reward': 'risk reward',
  'risk/reward': 'risk reward',
  'r/r': 'risk reward',
  'rr ratio': 'risk reward',
  'reward risk': 'risk reward',

  // Index funds
  'index fund': 'index funds',
  'passive investing': 'index funds',
  'passive fund': 'index funds',
  'expense ratio': 'index funds',
  'active vs passive': 'index funds',

  // Sector rotation
  'sector rotation': 'sector rotation',
  'sectors': 'sector rotation',
  'sector exposure': 'sector rotation',
  'defensive sectors': 'sector rotation',
  'cyclical sectors': 'sector rotation',

  // Portfolio theory
  'mpt': 'portfolio theory',
  'modern portfolio theory': 'portfolio theory',
  'efficient frontier': 'portfolio theory',
  'mean variance': 'portfolio theory',
  'diversification theory': 'portfolio theory',

  // Fixed income
  'bond': 'fixed income',
  'bonds': 'fixed income',
  'treasury': 'fixed income',
  'yield': 'fixed income',
  'coupon': 'fixed income',
  'duration': 'fixed income',
  'fixed income investing': 'fixed income',
};

/**
 * Normalize a query by replacing synonyms with canonical terms.
 */
export function normalizeQuery(query: string): string {
  let normalized = query.toLowerCase().trim();

  // Sort by length descending to match longer phrases first
  const sortedSynonyms = Object.entries(QUERY_SYNONYMS)
    .sort(([a], [b]) => b.length - a.length);

  for (const [synonym, canonical] of sortedSynonyms) {
    // Use word boundary matching where possible
    const regex = new RegExp(`\\b${escapeRegex(synonym)}\\b`, 'gi');
    normalized = normalized.replace(regex, canonical);
  }

  return normalized;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// =============================================================================
// Intent Detection Patterns
// =============================================================================

export const INTENT_PATTERNS: Record<Intent, RegExp[]> = {
  definition: [
    /^what (is|are|does|do)\b/i,
    /^define\b/i,
    /^meaning of\b/i,
    /^explain\b/i,
    /^tell me about\b/i,
    /^describe\b/i,
    /\bwhat('s| is| are) (a |an |the )?/i,
    /\bdefinition\b/i,
  ],
  how_to: [
    /^how (do|can|to|should)\b/i,
    /^how (do i|can i|to)\b/i,
    /\bhow to\b/i,
    /\bhow do i\b/i,
    /\bsteps to\b/i,
    /\bguide (to|for)\b/i,
    /\bshow me how\b/i,
    /\bwalk me through\b/i,
    /\bhelp me\b/i,
    /\bi want to\b/i,
    /\bi need to\b/i,
    /\bset up\b/i,
    /\bconfigure\b/i,
    /\bcreate\b/i,
    /\bplace (a |an )?order\b/i,
    /\bbuy\b/i,
    /\bsell\b/i,
  ],
  troubleshoot: [
    /\bnot working\b/i,
    /\bdoesn'?t work\b/i,
    /\bwon'?t\b/i,
    /\bcan'?t\b/i,
    /\berror\b/i,
    /\bfailed\b/i,
    /\bfailing\b/i,
    /\bproblem\b/i,
    /\bissue\b/i,
    /\bbug\b/i,
    /\bbroken\b/i,
    /\bfix\b/i,
    /\bwrong\b/i,
    /\bwhy (isn'?t|doesn'?t|won'?t|can'?t)\b/i,
    /\bhelp.*(stuck|issue|problem)\b/i,
    /\bstuck\b/i,
  ],
  fallback: [],
};

/**
 * Detect the intent of a user query.
 */
export function detectIntent(query: string): Intent {
  const normalized = query.toLowerCase().trim();

  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    if (intent === 'fallback') continue;
    if (patterns.some(pattern => pattern.test(normalized))) {
      return intent as Intent;
    }
  }

  return 'fallback';
}

// =============================================================================
// Knowledge Base Entries
// =============================================================================

export const KB_ENTRIES: Record<string, KBEntry> = {
  // -------------------------------------------------------------------------
  // Platform Overview
  // -------------------------------------------------------------------------
  what_is_ssb: {
    id: 'what_is_ssb',
    title: 'What is SSB?',
    keywords: ['ssb', 'smart strategies', 'platform', 'overview', 'about'],
    aliases: ['what is this', 'what is this app', 'what does ssb do'],
    pageScopes: ['global', 'dashboard'],
    content: {
      definition: `**Smart Strategies Builder (SSB)** is an educational platform for understanding market dynamics and portfolio risk.

**Key Features:**
- **Market Regime Analysis**: Understand whether markets are in bull, bear, or ranging conditions
- **Risk Analytics**: Calculate VaR, volatility, and drawdown metrics
- **Backtesting**: Test investment hypotheses against historical data with SPY benchmark comparison and CSV export
- **Paper Trading**: Practice with simulated portfolios (no real money)
- **Simulations**: Monte Carlo-style portfolio outcome projections across time horizons
- **Stress Testing**: See how portfolios might perform in crisis scenarios
- **Options Education**: Explore options chains and simulated options paper trading with a Black-Scholes model
- **Signal Feed**: Live technical setups and pre-trade intelligence (Starter+)
- **Community**: Share trade ideas and analysis with other users
- **Crypto Dashboard**: Digital asset analytics and market data
- **News & Market Summary**: Daily financial news with top movers
- **Structured Learning**: Guided modules and learning paths covering investing fundamentals through advanced topics
- **Demo Mode**: Try the full platform for 30 minutes with no account required
- **API Access**: Enterprise API keys for programmatic access to platform data (Pro+)

SSB is designed for education and research. It does not execute real trades or provide personalized financial advice.`,
      how_to: `**Getting Started with SSB:**

1. **Dashboard**: Start here to see your portfolio overview and market insights
2. **Paper Trading**: Practice buying/selling with virtual $100,000
3. **Backtesting**: Test strategies against historical data
4. **Risk Analytics**: Analyze your portfolio's risk metrics

**Quick Start:**
- Go to Paper Trading → Click "New Order" → Enter a symbol and amount
- View your positions and P&L in real-time
- Use the chart overlays to visualize trends`,
    },
    relatedTopics: ['market_regime', 'risk_analytics', 'backtesting', 'paper_trading'],
  },

  // -------------------------------------------------------------------------
  // Paper Trading
  // -------------------------------------------------------------------------
  paper_trading: {
    id: 'paper_trading',
    title: 'Paper Trading',
    keywords: ['paper trading', 'simulated', 'practice', 'virtual', 'demo'],
    aliases: ['fake trading', 'practice account', 'simulation'],
    pageScopes: ['global', 'paper'],
    content: {
      definition: `**Paper Trading** is simulated trading using virtual money - no real funds at risk.

**Benefits:**
- Practice without financial risk
- Test strategies in real-time market conditions
- Learn platform features safely
- Build confidence before real trading

**SSB Paper Trading Features:**
- $100,000 virtual starting balance
- Real-time price data (simulated fills)
- Position tracking and P&L
- Performance analytics

**Important Notes:**
- No real money is involved
- Fills may differ from live markets
- Emotions differ when real money isn't at stake`,
      how_to: `**How to Paper Trade on SSB:**

1. **Navigate** to Paper Trading from the sidebar
2. **Click "New Order"** to open the order form
3. **Enter symbol** (e.g., AAPL, MSFT, SPY)
4. **Choose side**: Buy or Sell
5. **Enter quantity**: Number of shares
6. **Select order type**: Market or Limit
7. **Click Submit** to place the order

**Viewing Positions:**
- Your positions appear in the Positions table
- Click a position to view its chart
- Click "Sell" to close a position

**Chart Overlays:**
- Enable SMA, trend lines, and key levels
- Overlay access depends on your subscription tier`,
      troubleshoot: `**Common Paper Trading Issues:**

**"Order failed" error:**
- Check you have enough virtual cash
- Verify the symbol is valid
- Ensure quantity is a positive number

**"Position limit reached":**
- Free tier: 5 positions max
- Upgrade to increase limits

**"Orders per day exceeded":**
- Free tier: 10 orders/day
- Wait until tomorrow or upgrade

**Chart not loading:**
- Check your internet connection
- Try refreshing the page
- Some symbols may not have data available

**Prices seem delayed:**
- Paper trading uses real-time prices during market hours
- After-hours data may be limited`,
    },
    relatedTopics: ['order', 'position', 'pnl', 'chart_overlay', 'entitlements'],
  },

  order: {
    id: 'order',
    title: 'Orders',
    keywords: ['order', 'buy', 'sell', 'trade', 'market order', 'limit order'],
    aliases: ['place trade', 'execute trade', 'make trade'],
    pageScopes: ['paper'],
    content: {
      definition: `**Orders** are instructions to buy or sell securities.

**Order Types in SSB Paper Trading:**

**Market Order:**
- Executes immediately at current price
- Guaranteed fill (in simulation)
- Price may vary slightly

**Limit Order:**
- Executes only at specified price or better
- May not fill if price isn't reached
- More control over execution price

**Order Status:**
- **Pending**: Waiting to execute
- **Filled**: Completed
- **Cancelled**: Manually cancelled
- **Rejected**: Failed validation`,
      how_to: `**How to Place an Order:**

1. Click **"New Order"** button
2. Enter the **symbol** (e.g., AAPL)
3. Select **Buy** or **Sell**
4. Enter **quantity**
5. Choose **Market** or **Limit**
6. For limit orders, enter your **limit price**
7. Click **Submit**

**Tips:**
- Use market orders for quick execution
- Use limit orders when you want a specific price
- Check your available cash before buying`,
      troubleshoot: `**Order Issues:**

**Order rejected:**
- Insufficient funds for buy orders
- No position for sell orders
- Invalid symbol

**Order not filling (limit):**
- Price hasn't reached your limit
- Check current market price

**Wrong quantity:**
- Cancel and place a new order`,
    },
    relatedTopics: ['paper_trading', 'position'],
  },

  position: {
    id: 'position',
    title: 'Positions',
    keywords: ['position', 'holding', 'portfolio', 'shares'],
    aliases: ['my stocks', 'my holdings', 'what i own'],
    pageScopes: ['paper'],
    content: {
      definition: `**Positions** represent your current holdings in the paper trading account.

**Position Information:**
- **Symbol**: The stock/ETF ticker
- **Quantity**: Number of shares held
- **Avg Cost**: Average purchase price per share
- **Current Price**: Latest market price
- **P&L**: Unrealized profit/loss

**Position Types:**
- **Long**: You bought and hold shares (profit when price rises)
- **Short**: Not currently supported in paper trading`,
      how_to: `**Managing Positions:**

1. **View positions** in the Positions table on Paper Trading page
2. **Click a row** to see the chart for that symbol
3. **Click "Sell"** to close or reduce a position
4. **Monitor P&L** to track performance

**To close a position:**
1. Click the **Sell** button next to the position
2. The order form opens with the symbol pre-filled
3. Enter quantity (or sell all)
4. Submit the sell order`,
    },
    relatedTopics: ['paper_trading', 'pnl', 'order'],
  },

  pnl: {
    id: 'pnl',
    title: 'Profit & Loss (P&L)',
    keywords: ['pnl', 'profit', 'loss', 'return', 'gains'],
    aliases: ['p&l', 'profit and loss', 'how much made', 'how much lost'],
    pageScopes: ['paper', 'dashboard'],
    content: {
      definition: `**P&L (Profit & Loss)** measures how much money you've made or lost.

**Types of P&L:**

**Unrealized P&L:**
- Paper gains/losses on open positions
- Changes as prices move
- Calculated as: (Current Price - Avg Cost) × Quantity

**Realized P&L:**
- Actual gains/losses from closed trades
- Locked in when you sell

**P&L Percentage:**
- Return expressed as a percentage
- Formula: (P&L / Cost Basis) × 100

**Example:**
- Buy 10 shares at $100 = $1,000 cost
- Current price $110 = $1,100 value
- Unrealized P&L = +$100 (+10%)`,
      how_to: `**Viewing Your P&L:**

1. **Account Summary**: Shows total return on dashboard
2. **Positions Table**: Shows P&L per position
3. **Performance Chart**: Historical equity curve

**P&L Colors:**
- 🟢 Green = Profit
- 🔴 Red = Loss

**Improving P&L:**
- Analyze losing positions
- Consider position sizing
- Review entry/exit timing in backtests`,
    },
    relatedTopics: ['position', 'paper_trading', 'risk_analytics'],
  },

  chart_overlay: {
    id: 'chart_overlay',
    title: 'Chart Overlays',
    keywords: ['chart overlay', 'sma', 'moving average', 'trend line', 'indicator'],
    aliases: ['technical analysis', 'chart lines', 'chart tools'],
    pageScopes: ['paper'],
    content: {
      definition: `**Chart Overlays** are visual indicators displayed on price charts.

**Available Overlays:**

**SMA (Simple Moving Average):**
- SMA 20: 20-day average (short-term trend)
- SMA 50: 50-day average (medium-term trend)
- SMA 200: 200-day average (long-term trend)

**Linear Regression:**
- Best-fit trend line through recent prices
- Shows overall price direction

**Key Levels:**
- Support: Price floors where buying pressure appears
- Resistance: Price ceilings where selling pressure appears

**Tier Access:**
- **Free**: SMA 20 only
- **Starter**: SMA 20, SMA 50, Key Levels
- **Pro**: All overlays`,
      how_to: `**Using Chart Overlays:**

1. **Open Paper Trading** page
2. **Select a position** to view its chart
3. **Toggle overlays** using the buttons above the chart
4. **Combine overlays** to analyze trends

**Interpretation Tips:**
- Price above SMA = potential uptrend
- Price below SMA = potential downtrend
- SMA crossovers may signal trend changes

**Note:** Overlays are educational visual aids. They don't predict future prices or imply trading recommendations.`,
      troubleshoot: `**Overlay Issues:**

**Overlay button disabled:**
- Not available on your tier
- Upgrade for more overlays

**Overlay not showing:**
- May need more price data
- Try a different timeframe

**Chart not loading:**
- Check internet connection
- Refresh the page`,
    },
    relatedTopics: ['paper_trading', 'entitlements'],
  },

  // -------------------------------------------------------------------------
  // Risk Analytics
  // -------------------------------------------------------------------------
  risk_analytics: {
    id: 'risk_analytics',
    title: 'Risk Analytics',
    keywords: ['risk', 'analytics', 'metrics', 'assessment'],
    pageScopes: ['global', 'risk', 'dashboard'],
    content: {
      definition: `**Risk Analytics** helps you understand and quantify investment risks.

**Key Metrics in SSB:**

**Volatility Metrics:**
- Annualized volatility
- Rolling volatility
- Volatility percentile

**Downside Metrics:**
- Value at Risk (VaR)
- Maximum drawdown
- Conditional VaR (Expected Shortfall)

**Risk-Adjusted Returns:**
- Sharpe Ratio: Return per unit of total risk
- Sortino Ratio: Return per unit of downside risk
- Calmar Ratio: Return divided by max drawdown`,
      how_to: `**Using Risk Analytics:**

1. Navigate to the **Risk** section
2. Select a portfolio or position to analyze
3. View risk metrics and charts
4. Compare across different timeframes

**Understanding the metrics:**
- Higher Sharpe = better risk-adjusted return
- Lower VaR = less potential downside
- Lower max drawdown = less historical decline`,
    },
    relatedTopics: ['risk_var', 'volatility', 'drawdown'],
  },

  risk_var: {
    id: 'risk_var',
    title: 'Value at Risk (VaR)',
    keywords: ['var', 'value at risk', 'risk measure', 'confidence'],
    pageScopes: ['global', 'risk'],
    content: {
      definition: `**Value at Risk (VaR)** measures the potential loss in a portfolio over a specific time period at a given confidence level.

**Example:**
"A 1-day 95% VaR of $10,000" means there's a 95% probability that you won't lose more than $10,000 in a single day.

**Key Components:**
- **Time Horizon**: How far ahead (1 day, 1 week, etc.)
- **Confidence Level**: Typically 95% or 99%
- **Portfolio Value**: The total value being analyzed

**Limitations:**
- VaR doesn't tell you how bad losses could be beyond the threshold
- Assumes normal market conditions (may underestimate tail risks)
- Historical VaR relies on past data which may not predict future`,
      how_to: `**Reading VaR in SSB:**

1. Go to **Risk Analytics**
2. Find the VaR section
3. Note the confidence level (95% or 99%)
4. The dollar amount is your potential loss threshold

**Interpretation:**
- If 95% VaR = $5,000
- You have a 5% chance of losing MORE than $5,000
- Use this for position sizing decisions`,
    },
    relatedTopics: ['risk_analytics', 'volatility', 'drawdown'],
  },

  volatility: {
    id: 'volatility',
    title: 'Volatility',
    keywords: ['volatility', 'vol', 'vix', 'price swings'],
    pageScopes: ['global', 'risk', 'regime'],
    content: {
      definition: `**Volatility** measures how much prices fluctuate over time.

**Types of Volatility:**
- **Historical/Realized**: Measured from past price data
- **Implied**: Derived from option prices (forward-looking)
- **VIX**: The "fear index" - measures expected S&P 500 volatility

**Interpretation:**
- **High Volatility**: Large price swings, more uncertainty
- **Low Volatility**: Smaller movements, calmer markets

**Why It Matters:**
- Affects position sizing
- Indicates market stress levels
- Helps set stop-losses`,
    },
    relatedTopics: ['risk_var', 'market_regime', 'risk_analytics'],
  },

  drawdown: {
    id: 'drawdown',
    title: 'Drawdown',
    keywords: ['drawdown', 'max drawdown', 'decline', 'peak', 'trough'],
    pageScopes: ['global', 'risk', 'backtest'],
    content: {
      definition: `**Drawdown** measures the decline from a peak to a trough before a new peak is reached.

**Key Metrics:**
- **Maximum Drawdown**: The largest peak-to-trough decline in history
- **Current Drawdown**: How far below the most recent peak
- **Recovery Time**: How long to return to previous peak

**Example:**
Portfolio reached $100,000, then fell to $80,000 = 20% drawdown

**Historical Context:**
- 2008 Financial Crisis: S&P 500 ~57% drawdown
- COVID Crash (2020): ~34% drawdown
- Dot-com Bust: ~49% drawdown`,
    },
    relatedTopics: ['risk_analytics', 'stress_testing', 'backtesting'],
  },

  // -------------------------------------------------------------------------
  // Market Regime
  // -------------------------------------------------------------------------
  market_regime: {
    id: 'market_regime',
    title: 'Market Regime',
    keywords: ['market regime', 'bull', 'bear', 'trend', 'conditions', 'regime classification'],
    aliases: ['market state', 'market mood', 'market phase', 'regime detection'],
    pageScopes: ['global', 'regime', 'dashboard'],
    content: {
      definition: `**Market Regime** describes the current structural state of the market — the environment that sets context for how prices are behaving.

**SSB Regime Classifications:**
- **Bull**: Rising trend, positive momentum, broad participation
- **Bear**: Falling trend, negative momentum, declining breadth
- **Sideways**: No clear directional bias, mean-reversion behavior
- **High Volatility**: Elevated price swings regardless of direction
- **Low Volatility**: Unusually calm conditions, compressed ranges

**How SSB Classifies Regimes (v1.2.0):**
SSB uses a **rule-based ensemble model** that combines multiple signals:
- **Price Direction**: Multi-timeframe moving average crosses and momentum
- **Volatility**: Historical volatility percentile relative to long-run norms; VIX levels
- **Market Breadth**: Proportion of market components participating in the trend
- **Macro Alignment**: Yield curve slope and macro factor signals

The output is a **regime label + confidence score**, not a simple up/down signal.

**Confidence Score:**
- Reflects how strongly all indicators agree on the classification
- High confidence = clear, aligned signals
- Low confidence = mixed or transitioning conditions

**View Modes:**
- **Short-Term**: Near-term signal emphasis (days to weeks)
- **Long-Term**: Structural regime framing (weeks to months)

**Data:**
- Analysis covers SPY as the benchmark equity regime proxy
- Delay applied by tier (Founder/Institutional: real-time; lower tiers: delayed)`,
      how_to: `**Using the Regime Analysis Page:**

1. Navigate to **Market Regime** from the sidebar
2. The **regime badge** shows the current classification and confidence
3. Toggle **View Mode** (Short/Long) to switch analysis horizon
4. Expand **"What is Market Regime Detection?"** for methodology details
5. Review **Technical Indicators** for the underlying signals
6. Check **Macro Indicators** for VIX and yield curve context
7. Enable **Scenario Mode** (Starter+) to explore hypothetical conditions

**Data Currency:**
- "Data as of:" shows when underlying market data is valid through
- Click **Refresh** to fetch the latest classification`,
    },
    relatedTopics: ['regime_indicators', 'view_mode', 'scenario_mode', 'volatility', 'risk_analytics'],
  },

  // -------------------------------------------------------------------------
  // Backtesting
  // -------------------------------------------------------------------------
  backtesting: {
    id: 'backtesting',
    title: 'Backtesting',
    keywords: ['backtesting', 'historical', 'strategy', 'simulation'],
    aliases: ['strategy testing', 'historical testing'],
    pageScopes: ['global', 'backtest'],
    content: {
      definition: `**Backtesting** tests an investment strategy against historical data.

**How It Works:**
1. Define your strategy rules
2. Apply rules to historical data
3. Calculate hypothetical returns
4. Analyze results

**Important Limitations:**
- **Past ≠ Future**: Historical performance doesn't guarantee future results
- **Overfitting Risk**: Strategies optimized for the past may fail
- **Survivorship Bias**: Data may exclude failed companies
- **Execution Gaps**: Real trading has slippage`,
      how_to: `**Running a Backtest:**

1. Navigate to **Backtesting** page
2. Define your strategy parameters
3. Select date range
4. Click **Run Backtest**
5. Review results and metrics

**Best Practices:**
- Use out-of-sample testing
- Account for realistic costs
- Be skeptical of perfect results
- Test across multiple market regimes

**Backtest Detail Page (Pro+):**
- **Equity Curve**: Interactive chart showing portfolio value over time
- **SPY Benchmark Overlay**: Dashed purple line showing SPY buy-and-hold performance over the same period — useful for comparing strategy vs. the market
- **Export CSV**: Download the full trade-by-trade history as a spreadsheet
- **Trade History Table**: Every simulated fill with entry/exit, P&L, and duration`,
      troubleshoot: `**Backtest Issues:**

**"Not enough data":**
- Try a shorter date range
- Some symbols have limited history

**Results seem too good:**
- Check for look-ahead bias
- Ensure realistic transaction costs
- Consider survivorship bias`,
    },
    relatedTopics: ['paper_trading', 'risk_analytics', 'drawdown'],
  },

  // -------------------------------------------------------------------------
  // Stress Testing
  // -------------------------------------------------------------------------
  stress_testing: {
    id: 'stress_testing',
    title: 'Stress Testing',
    keywords: ['stress testing', 'scenario', 'crisis', 'shock'],
    aliases: ['what if analysis', 'crisis simulation'],
    pageScopes: ['global', 'stress', 'risk'],
    content: {
      definition: `**Stress Testing** simulates how a portfolio might perform under extreme conditions.

**Types of Stress Tests:**
- **Historical Scenarios**: Replay past crises (2008, COVID)
- **Hypothetical Scenarios**: Custom "what-if" scenarios
- **Sensitivity Analysis**: Impact of factor changes

**SSB Stress Test Scenarios:**
- 2008 Financial Crisis
- COVID-19 Market Crash
- Dot-com Bubble Burst
- Interest Rate Shock

**Limitations:**
- Past crises may not predict future ones
- Actual crises may be worse
- Model assumptions affect results`,
      how_to: `**Running Stress Tests:**

1. Go to **Stress Testing** (Pro tier)
2. Select your portfolio
3. Choose a scenario
4. View potential impact

**Interpreting Results:**
- See estimated portfolio decline
- Identify vulnerable positions
- Consider hedging strategies`,
    },
    relatedTopics: ['risk_analytics', 'drawdown', 'market_regime'],
  },

  // -------------------------------------------------------------------------
  // Plans & Entitlements
  // -------------------------------------------------------------------------
  entitlements: {
    id: 'entitlements',
    title: 'Plans & Tiers',
    keywords: ['plan', 'tier', 'subscription', 'free', 'starter', 'pro', 'institutional', 'founder', 'upgrade', 'entitlement'],
    aliases: ['pricing', 'membership', 'account type', 'my plan', 'features by tier'],
    pageScopes: ['global', 'settings', 'billing', 'paper'],
    content: {
      definition: `**SSB Subscription Tiers** determine your feature access, data currency, and limits.

**Free ($0/mo):**
- Basic risk analytics
- Paper trading: 5 positions, 10 orders/day, 30-day history, 1 reset/week
- SMA 20 chart overlay only
- Regime data with delay; no Scenario Mode presets
- 1 Scenario override (no baseline compare)
- No options access
- Learning modules 1–4, 7–10, 14 (free tier)

**Starter ($9/mo) — includes 14-day free trial:**
- Paper trading: 25 positions, 100 orders/day, 365-day history, daily resets
- SMA 20, SMA 50, Key Levels overlays
- 3 Scenario overrides, baseline compare, deltas, presets
- Options Chain Viewer (view-only, simulated data)
- Signal Feed access
- All free learning modules

**Pro ($29/mo) — includes 14-day free trial:**
- Paper trading: 200 positions, 1,000 orders/day, unlimited resets
- All chart overlays
- Real-time regime insights
- Stress testing access
- Portfolio Health widget (sector, concentration, risk score)
- 3 Scenario overrides with full features
- Options Chain Viewer + Options Paper Trading (up to 50 contracts) + Options Analytics
- Portfolio Simulations (Monte Carlo projections)
- Backtest CSV export and SPY benchmark overlay
- All learning modules including pro-only (5–6, 11–13)
- API key access (market data, paper trading, portfolio, analytics scopes)

**Institutional ($199/mo):**
- All Pro features
- Portfolio Health correlation matrix and granular breakdown
- Scenario Mode export and custom labels
- Real-time data, no delay
- Unlimited options contracts
- Webhooks and full API scope access

**Founder:**
- All Institutional features
- Displayed as "All Access"
- Real-time data, no delay applied
- Priority access to new features

**Note:** Feature availability is enforced server-side. The plan shown in the regime header ("Plan:") reflects your canonical tier.`,
      how_to: `**Managing Your Subscription:**

1. Go to **Billing** from the sidebar (or Settings → Billing)
2. View your current plan and next billing date
3. Click **Upgrade** to access higher tiers
4. Manage payment methods in the Billing portal

**Upgrading:**
- Changes take effect immediately
- Pro-rated billing for mid-cycle upgrades`,
      troubleshoot: `**Subscription Issues:**

**"Feature not available" or gated UI:**
- Check which tier the feature requires (see definitions above)
- Verify your plan in Billing

**"Limit reached" errors:**
- Free/Starter tiers have order and position limits
- Wait until next reset period or upgrade

**Billing issues:**
- Check payment method in Billing settings
- Contact support if a charge appears incorrect`,
    },
    relatedTopics: ['paper_trading', 'what_is_ssb', 'portfolio_health', 'scenario_mode', 'correlation_analysis'],
  },

  account: {
    id: 'account',
    title: 'Paper Trading Account',
    keywords: ['account', 'balance', 'cash', 'value', 'reset'],
    aliases: ['my account', 'account balance', 'total value'],
    pageScopes: ['paper'],
    content: {
      definition: `**Paper Trading Account** is your virtual trading account.

**Account Metrics:**
- **Total Value**: Cash + positions value
- **Cash Available**: Buying power
- **Total Return**: Overall P&L since start
- **Positions Count**: Number of open positions

**Starting Balance:** $100,000 virtual

**Account Resets:**
- Reset to start fresh
- Free: 1 reset per week
- Starter: Daily resets
- Pro: Unlimited resets`,
      how_to: `**Viewing Your Account:**

1. Go to **Paper Trading**
2. See account summary cards at top
3. Total Value = Cash + Positions

**Resetting Account:**
1. Go to Settings (if available)
2. Click "Reset Paper Account"
3. Starts fresh at $100,000`,
    },
    relatedTopics: ['paper_trading', 'position', 'pnl'],
  },

  // -------------------------------------------------------------------------
  // View Mode
  // -------------------------------------------------------------------------
  view_mode: {
    id: 'view_mode',
    title: 'View Mode (Short-Term / Long-Term)',
    keywords: ['view mode', 'short term', 'long term', 'timeframe', 'toggle'],
    aliases: ['short-term view', 'long-term view', 'view toggle', 'time horizon'],
    pageScopes: ['global', 'regime', 'risk', 'dashboard'],
    content: {
      definition: `**View Mode** is a global toggle that shifts analysis framing between two time horizons.

**Short-Term View:**
- Focuses on near-term market conditions (days to weeks)
- Emphasizes recent price action, momentum, and volatility signals
- Suitable for understanding current regime context

**Long-Term View:**
- Emphasizes structural market conditions (weeks to months)
- Incorporates macro factors, yield curve, and regime persistence
- Useful for understanding broader market environment

**How It Works:**
- The toggle appears on the Market Regime Analysis and Risk Analytics pages
- Switching view mode updates charts, regime classifications, and risk framing across the platform
- Your selection is remembered between sessions

**Note:** View mode affects how data is presented, not which data is fetched. All analysis remains informational.`,
      how_to: `**Using View Mode:**

1. Find the **Short/Long** toggle in the top-right area of Regime or Risk pages
2. Click to switch between short-term and long-term framing
3. All visible metrics and charts update to reflect the selected horizon

The **View Mode Badge** displayed next to page titles indicates which horizon is currently active.`,
    },
    relatedTopics: ['market_regime', 'risk_analytics', 'long_term_insights'],
  },

  // -------------------------------------------------------------------------
  // Scenario Mode
  // -------------------------------------------------------------------------
  scenario_mode: {
    id: 'scenario_mode',
    title: 'Scenario Mode (What-If Analysis)',
    keywords: ['scenario mode', 'what if', 'override', 'simulation mode', 'scenario'],
    aliases: ['what-if mode', 'scenario analysis', 'parameter override', 'hypothetical'],
    pageScopes: ['global', 'regime', 'stress'],
    content: {
      definition: `**Scenario Mode** allows you to override market indicator values to explore hypothetical regime conditions — without affecting the live analysis.

**What It Does:**
- Lets you adjust Trend Score, Volatility Percentile, and Breadth Score
- Computes how the regime classification would change under those conditions
- Shows a side-by-side comparison of baseline vs. scenario regime

**Key Behaviors:**
- Scenario Mode does NOT change live market data
- Classifications are computed locally based on your inputs
- Data resets when you disable Scenario Mode or refresh the page
- The page is highlighted with a purple ring when Scenario Mode is active

**Tier Access:**
- **Free**: 1 active override, no baseline comparison
- **Starter / Pro**: Up to 3 overrides, baseline comparison, delta view, presets
- **Institutional / Founder**: All features including export and labels

**Preset Scenarios (Starter+):**
- Low Vol Expansion
- High Rate Stress
- Recession Shock

**Note:** Scenario Mode is for educational exploration only. Results are hypothetical and not predictive of future market conditions.`,
      how_to: `**Using Scenario Mode:**

1. Navigate to **Market Regime Analysis**
2. Find the **Scenario Panel** below the main regime card
3. Toggle **Scenario Mode** on
4. Adjust the sliders for Trend Score, Volatility Percentile, or Breadth Score
5. Optionally select a preset scenario (Starter+)
6. View updated regime classification and comparison panel
7. Toggle off to return to live analysis`,
      troubleshoot: `**Scenario Mode Issues:**

**Sliders disabled or not visible:**
- Scenario Mode may require a higher tier for additional overrides
- Check your plan in Settings → Billing

**"Comparison" panel not showing:**
- Baseline compare is available on Starter tier and above

**Regime not changing as expected:**
- Regime classification requires multiple signals to shift
- Try more extreme slider values to see reclassification

**Changes lost after refresh:**
- By design — Scenario Mode resets on page refresh for safety`,
    },
    relatedTopics: ['market_regime', 'regime_indicators', 'stress_testing', 'entitlements'],
  },

  // -------------------------------------------------------------------------
  // Regime Indicators
  // -------------------------------------------------------------------------
  regime_indicators: {
    id: 'regime_indicators',
    title: 'Regime Indicators',
    keywords: ['regime indicators', 'trend score', 'breadth score', 'volatility percentile', 'confidence score', 'indicators'],
    aliases: ['market indicators', 'classification inputs', 'technical signals'],
    pageScopes: ['global', 'regime'],
    content: {
      definition: `**Regime Indicators** are the quantitative signals used by SSB's ensemble model to classify the current market regime.

**Trend Score** (range: -1 to +1):
- Measures the direction and strength of recent price momentum
- Positive: uptrend; Negative: downtrend; Near zero: sideways
- Derived from multiple moving average crossovers and momentum factors

**Volatility Percentile** (0–100):
- Where current volatility sits relative to historical norms
- 0 = lowest ever recorded; 100 = highest ever recorded
- Above 70: elevated risk environment; Below 30: calm conditions

**Breadth Score** (0–1):
- Measures the proportion of market components participating in the trend
- 1.0 = broad participation; 0.0 = very narrow or divergent market

**Confidence Score** (%):
- How strongly the model assigns the current regime label
- Higher confidence = clearer regime signal from indicator alignment

**Macro Indicators (supplemental):**
- **VIX Level**: CBOE Volatility Index; above 30 = high fear, below 20 = low fear
- **Yield Curve (10Y-2Y)**: Positive = normal; Negative = inverted (historically associated with slowdowns)

**Model Version:** Regime engine v1.2.0 (updated 2026-02-05)`,
      how_to: `**Reading Regime Indicators:**

1. Navigate to **Market Regime Analysis**
2. The **Technical Indicators** card shows Trend Score, Volatility Percentile, and Market Breadth
3. The **Macro Indicators** card shows VIX Level and Yield Curve slope
4. Purple bars indicate values you have overridden in Scenario Mode
5. The **Confidence** bar under the regime badge reflects indicator alignment strength`,
    },
    relatedTopics: ['market_regime', 'scenario_mode', 'volatility', 'view_mode'],
  },

  // -------------------------------------------------------------------------
  // Long-Term Insights
  // -------------------------------------------------------------------------
  long_term_insights: {
    id: 'long_term_insights',
    title: 'Long-Term Regime Insights',
    keywords: ['long-term insights', 'regime insights', 'structural', 'macro regime', 'long term'],
    aliases: ['long term context', 'macro context', 'regime persistence'],
    pageScopes: ['global', 'regime', 'dashboard'],
    content: {
      definition: `**Long-Term Insights** provide structural market context that extends beyond short-term signals — capturing regime persistence, macro alignment, and multi-factor trends.

**What It Adds:**
- Regime persistence analysis: how long the current regime has been in place
- Macro factor alignment (yield curve slope, inflation signals)
- Cross-market context for the current environment

**When to Reference It:**
- When evaluating whether recent market behavior represents a regime shift or short-term noise
- When comparing short-term vs. long-term framing using the View Mode toggle

**Availability:**
- Long-term insights are available on all tiers
- Access through the **Long-Term View** toggle on the Regime page

**Note:** Long-term insights are descriptive. They describe the structural context of current conditions and do not forecast future outcomes.`,
    },
    relatedTopics: ['view_mode', 'market_regime', 'regime_indicators'],
  },

  // -------------------------------------------------------------------------
  // Audit Log
  // -------------------------------------------------------------------------
  audit_log: {
    id: 'audit_log',
    title: 'Audit Log',
    keywords: ['audit log', 'activity log', 'history', 'log', 'events'],
    aliases: ['activity history', 'event log', 'action history'],
    pageScopes: ['global', 'audit'],
    content: {
      definition: `**Audit Log** is an activity record that tracks significant actions taken within your SSB account.

**What Is Logged:**
- Paper trading orders (placed, filled, cancelled)
- Account resets
- Subscription changes (upgrades, downgrades)
- Login events
- API key activity (if applicable)

**Purpose:**
- Review past activity for reference or reconciliation
- Understand what changed and when

**Access:**
- Navigate to **Audit Log** from the sidebar
- Entries are sorted newest-first
- Available on all tiers`,
      how_to: `**Using the Audit Log:**

1. Navigate to **Audit Log** from the main sidebar
2. Entries are listed chronologically (newest first)
3. Each entry shows: timestamp, action type, and relevant details
4. Use browser search (Ctrl/Cmd+F) to find specific events`,
    },
    relatedTopics: ['paper_trading', 'entitlements', 'account'],
  },

  // -------------------------------------------------------------------------
  // Portfolio Health
  // -------------------------------------------------------------------------
  portfolio_health: {
    id: 'portfolio_health',
    title: 'Portfolio Health',
    keywords: ['portfolio health', 'health score', 'risk score', 'concentration', 'sector exposure'],
    aliases: ['portfolio analysis', 'health check', 'portfolio risk score'],
    pageScopes: ['global', 'dashboard', 'portfolio'],
    content: {
      definition: `**Portfolio Health** is a summary panel that assesses the overall risk profile of your paper trading portfolio.

**Metrics Included:**
- **Health Score**: Composite risk indicator (0–100, higher = healthier)
- **Concentration Risk**: Whether too much value is in a single position
- **Sector Exposure**: How portfolio weight is distributed across sectors
- **Risk Score**: Quantitative risk rating based on volatility and drawdown
- **Correlation Analysis** (Institutional/Founder): How correlated positions are to each other

**Tier Access:**
- **Free / Starter**: Not available
- **Pro**: Health widget, sector exposure, concentration warnings, risk score
- **Institutional / Founder**: All Pro features plus correlation matrix and granular breakdown

**Note:** Portfolio Health is informational. It describes current characteristics and does not constitute a recommendation to buy, sell, or rebalance.`,
      how_to: `**Viewing Portfolio Health:**

1. Go to your **Dashboard** or **Paper Trading** page
2. The Portfolio Health panel appears when Pro tier or above is active
3. Correlation analysis section is visible for Institutional/Founder tiers
4. Metrics update as your positions change`,
    },
    relatedTopics: ['risk_analytics', 'correlation_analysis', 'entitlements', 'position'],
  },

  // -------------------------------------------------------------------------
  // Correlation Analysis
  // -------------------------------------------------------------------------
  correlation_analysis: {
    id: 'correlation_analysis',
    title: 'Correlation Analysis',
    keywords: ['correlation analysis', 'correlation matrix', 'correlation', 'corr'],
    aliases: ['position correlation', 'asset correlation', 'diversification analysis'],
    pageScopes: ['global', 'risk', 'portfolio', 'dashboard'],
    content: {
      definition: `**Correlation Analysis** measures how much the positions in your portfolio move together.

**Key Concepts:**

**Correlation Coefficient** (range: -1 to +1):
- **+1.0**: Perfect positive correlation — assets move identically
- **0.0**: No relationship — assets move independently
- **-1.0**: Perfect negative correlation — assets move oppositely

**Correlation Matrix:**
- A grid showing pairwise correlation between all portfolio positions
- High positive correlation (above +0.8) may reduce effective diversification
- Negative correlation may provide natural hedging

**Why It Matters:**
- Two similar ETFs might appear diversified by name but have very high correlation
- High portfolio-wide correlation can amplify drawdown during broad market stress
- A lower average correlation generally indicates better diversification

**Availability:**
- Institutional and Founder tiers only
- Accessed through the Portfolio Health panel

**Note:** Correlation describes historical behavior. Future correlations may differ, especially during market stress.`,
      how_to: `**Reading the Correlation Matrix:**

1. Navigate to your **Dashboard** (Institutional/Founder tier)
2. Open the **Portfolio Health** panel
3. The correlation matrix shows each position pair
4. Color coding: Red = high positive correlation, Blue = negative correlation, White ≈ near zero

**Interpreting results:**
- Look for clusters of high correlation — these positions may behave similarly in stress
- Positions with low or negative correlation to the rest of the portfolio add diversification`,
    },
    relatedTopics: ['portfolio_health', 'risk_analytics', 'entitlements', 'volatility'],
  },

  // -------------------------------------------------------------------------
  // Options
  // -------------------------------------------------------------------------
  options_overview: {
    id: 'options_overview',
    title: 'Options Trading (Educational)',
    keywords: ['options', 'calls', 'puts', 'option chain', 'options trading', 'derivatives'],
    aliases: ['call options', 'put options', 'stock options', 'options market'],
    pageScopes: ['global', 'options', 'dashboard'],
    content: {
      definition: `**Options** are contracts that give the buyer the right (but not the obligation) to buy or sell an underlying asset at a specific price before a specific date.

**Key Concepts:**
- **Call Option**: The right to *buy* the underlying asset at the strike price
- **Put Option**: The right to *sell* the underlying asset at the strike price
- **Strike Price**: The agreed price at which the option can be exercised
- **Expiration Date**: The date after which the option expires worthless if unexercised
- **Premium**: The price paid to buy the option contract

**Moneyness:**
- **In-the-Money (ITM)**: The option has intrinsic value (e.g., call strike below current price)
- **At-the-Money (ATM)**: Strike price ≈ current stock price
- **Out-of-the-Money (OTM)**: No intrinsic value; only time value remains

**SSB Options Feature:**
SSB provides an educational options environment powered by a Black-Scholes simulation model. All prices are **simulated** — not real market quotes. The feature is intended to teach options concepts, not to replicate live options trading.

**Disclaimer:** Options trading involves significant risk. Real options can expire worthless and result in total loss of premium. SSB's options data is for educational purposes only.`,
      how_to: `**Accessing Options in SSB:**

1. Navigate to **Options** from the sidebar
2. If on Free tier: you'll see an overview of the feature with upgrade prompts
3. If on Starter+: the **Options Chain Viewer** is available
4. Select a symbol from the quick-select list or enter a ticker
5. Choose an expiration date
6. View calls and puts in the chain table

**Understanding the Chain Table:**
- Left side: Calls | Right side: Puts
- Columns: Bid, Ask, Last, IV, Delta, Gamma, Theta, Volume, OI
- Highlighted rows indicate at-the-money options`,
      troubleshoot: `**Options Issues:**

**"Options not available" or upgrade prompt:**
- Free tier has no options access — Starter is minimum for Chain Viewer
- Check your plan in Settings → Billing

**Prices seem different from what I see elsewhere:**
- SSB options prices are simulated using Black-Scholes, not real market quotes
- The SimulatedData badge in the chain viewer confirms this

**Paper options trading not available:**
- Options paper trading requires Pro tier or above`,
    },
    relatedTopics: ['options_chain', 'options_greeks', 'entitlements'],
  },

  options_chain: {
    id: 'options_chain',
    title: 'Options Chain Viewer',
    keywords: ['options chain', 'chain viewer', 'expiration', 'strike price', 'bid ask', 'open interest'],
    aliases: ['option chain', 'chain table', 'options table'],
    pageScopes: ['options'],
    content: {
      definition: `**Options Chain Viewer** displays all available call and put contracts for a symbol, organized by strike price and expiration date.

**Chain Viewer Columns:**
- **Bid/Ask**: The current bid and ask prices for the contract
- **Last**: The last traded price (simulated in SSB)
- **IV (Implied Volatility)**: Market's expectation of future volatility, derived from the option price
- **Delta**: Rate of change in option price relative to the underlying ($0–$1 for calls, -$1–$0 for puts)
- **Gamma**: Rate of change of delta
- **Theta**: Time decay — how much value the option loses per day
- **Volume**: Number of contracts traded today
- **OI (Open Interest)**: Total open contracts outstanding

**Simulated Data Badge:**
All data in the chain viewer is generated by SSB's Black-Scholes educational model, not sourced from live market quotes. The "Simulated Data" badge is always visible as a reminder.

**Expiration Selector:**
Use the expiration selector to choose which expiry date to view. Standard expirations (weekly, monthly) are shown.

**Filters:**
- Filter by moneyness (ITM, ATM, OTM)
- Filter by call or put side`,
      how_to: `**Using the Chain Viewer:**

1. Go to **Options** page (Starter tier or above)
2. Enter or select a symbol (e.g., AAPL, SPY, TSLA)
3. Select an **expiration date** from the selector
4. View calls on the left, puts on the right
5. Highlighted rows = at-the-money (ATM) contracts
6. Use **filters** to narrow to ITM or OTM
7. Hover over a row for full contract details`,
    },
    relatedTopics: ['options_overview', 'options_greeks', 'entitlements'],
  },

  options_greeks: {
    id: 'options_greeks',
    title: 'Options Greeks',
    keywords: ['options greeks', 'delta', 'gamma', 'theta', 'vega', 'greeks'],
    aliases: ['option greeks', 'delta gamma theta vega'],
    pageScopes: ['global', 'options'],
    content: {
      definition: `**Options Greeks** are sensitivity measures that describe how an option's price responds to various factors.

**Delta (Δ):**
- Rate of change of option price relative to a $1 move in the underlying
- Call delta: 0 to +1; Put delta: -1 to 0
- ATM options have delta ≈ ±0.50
- High delta = option behaves more like owning the underlying

**Gamma (Γ):**
- Rate of change of delta per $1 move in the underlying
- Highest near ATM and near expiration
- High gamma = delta changes quickly; more risk/reward sensitivity

**Theta (Θ):**
- Time decay — how much the option loses in value per calendar day
- Always negative for option buyers; options lose value as expiration approaches
- Decay accelerates as expiration nears (especially the final 30 days)

**Vega (ν):**
- Sensitivity of option price to a 1% change in implied volatility (IV)
- Higher vega = option price changes more when IV shifts
- Long options benefit from rising IV; short options are hurt by it

**Rho (ρ):**
- Sensitivity to changes in interest rates
- Less commonly referenced for short-dated options

**Practical Rule of Thumb:**
- ITM options have higher delta, lower theta
- OTM options have lower delta, higher gamma near ATM
- All long options have negative theta (time decay hurts buyers)`,
    },
    relatedTopics: ['options_overview', 'options_chain', 'volatility'],
  },

  // -------------------------------------------------------------------------
  // Learn Feature
  // -------------------------------------------------------------------------
  learn_feature: {
    id: 'learn_feature',
    title: 'Learn — Modules & Learning Paths',
    keywords: ['learn feature', 'modules', 'learning paths', 'education', 'courses', 'curriculum'],
    aliases: ['learning modules', 'guided learning', 'investing education', 'lessons'],
    pageScopes: ['global', 'learn', 'dashboard'],
    content: {
      definition: `**Learn** is SSB's structured educational content library — a catalog of modules and guided paths that teach investing and platform skills.

**Modules (14 total):**
Bite-sized lessons covering specific topics:
- **Free (all tiers):** Modules 1–4, 7–10, 14
- **Pro+ only:** Modules 5–6, 11–13

**Topics covered include:**
- Investing foundations
- Portfolio construction and diversification
- Risk management and position sizing
- Market regime analysis and how to use it
- Backtesting and strategy validation
- Options fundamentals
- Advanced analytics and strategy development

**Learning Paths (4 total):**
Curated sequences that guide you through related modules in a recommended order:
- **Beginner paths** (free): Core investing and platform fundamentals
- **Intermediate / Advanced paths** (pro): Options, regime-based strategies, advanced analytics

**Tier Access:**
- Free: Free-tier modules + free paths
- Starter: Same as free (modules unlocked with Pro)
- Pro / Institutional / Founder: All 14 modules and all 4 paths

**Progress Tracking:**
Your module completions and path progress are saved between sessions.`,
      how_to: `**Using the Learn Feature:**

1. Navigate to **Learn** from the sidebar
2. Browse the **Modules** tab for individual lessons
3. Browse **Paths** for guided multi-module sequences
4. Click a module to start reading
5. Locked modules (🔒) require Pro tier — click for upgrade info
6. "Explore in SSB" links inside modules take you directly to related features
7. Your progress is automatically saved`,
      troubleshoot: `**Learn Issues:**

**Module shows "Pro Required":**
- Modules 5–6 and 11–13 are Pro tier only
- Upgrade in Settings → Billing to unlock

**Progress not saving:**
- Make sure you're logged in
- Progress requires a full module visit

**"Explore in SSB" link not working:**
- Some feature links are tier-gated (e.g., options requires Starter+)
- Check your plan if the feature page shows an upgrade prompt`,
    },
    relatedTopics: ['what_is_ssb', 'entitlements', 'options_overview', 'backtesting'],
  },

  // -------------------------------------------------------------------------
  // Demo Mode
  // -------------------------------------------------------------------------
  demo_mode: {
    id: 'demo_mode',
    title: 'Demo Mode — Try It Free',
    keywords: ['demo mode', 'demo session', 'try it free', 'no signup', 'guest', 'demo account'],
    aliases: ['try without account', 'free trial', 'guest access', 'demo login'],
    pageScopes: ['global', 'dashboard'],
    content: {
      definition: `**Demo Mode** lets anyone explore SSB with no account required — just click "Try It Free — No Signup" on the landing page for an instant 30-minute session.

**How It Works:**
- One-click access — no email, no password, no credit card
- Sessions last **30 minutes** (timer shown in the top banner)
- Uses a pre-seeded account with sample backtests and a sample paper portfolio
- Access is **free-tier only** — Pro features show upgrade prompts behind locked UI

**What You Can Do in Demo Mode:**
- Browse all navigation sections and feature pages
- View sample backtest results and the paper trading portfolio
- Explore the dashboard, market regime analysis, and risk pages
- See how tier-gated features look (with upgrade prompts)

**What Is Restricted:**
- Creating new backtests (requires signup)
- Placing paper trading orders (requires signup)
- Connecting a real broker or importing a portfolio
- Posting to the community

**Session End:**
- At 30 minutes the session expires and you're redirected to the landing page
- You can start a new demo session at any time
- All demo data is reset — no data persists between sessions

**Note:** Demo sessions are rate-limited to prevent abuse. If the button is temporarily unavailable, wait a moment and try again.`,
      how_to: `**Starting a Demo Session:**

1. Go to the **landing page** (smartstrategiesbuilder.ai)
2. Click **"Try It Free — No Signup"** (yellow button below the main CTAs)
3. You're instantly logged in to a demo account
4. The yellow "Demo Mode" banner at the top shows your remaining time

**Signing Up from Demo:**
- Click **"Sign up free"** in the banner or any upgrade prompt
- Your demo exploration does not carry over to the new account`,
      troubleshoot: `**Demo Mode Issues:**

**Button shows "Demo unavailable":**
- Briefly rate-limited; wait 60 seconds and try again
- The backend may be restarting — try again shortly

**Session expired before 30 minutes:**
- The session uses a short-lived token that expires exactly at 30 min
- Start a new demo from the landing page

**"Feature locked" prompts everywhere:**
- Demo accounts are on the Free plan — Pro and Starter features show upgrade prompts by design
- This is intentional to show what's available with a paid account`,
    },
    relatedTopics: ['what_is_ssb', 'entitlements', 'paper_trading'],
  },

  // -------------------------------------------------------------------------
  // Simulations
  // -------------------------------------------------------------------------
  simulations: {
    id: 'simulations',
    title: 'Portfolio Simulations',
    keywords: ['simulations', 'monte carlo', 'portfolio forecast', 'outcome projection', 'probability'],
    aliases: ['simulation', 'outcome simulation', 'portfolio projection', 'monte carlo simulation'],
    pageScopes: ['global', 'dashboard', 'simulations'],
    content: {
      definition: `**Portfolio Simulations** project a range of possible future portfolio outcomes using randomized return scenarios — similar in concept to Monte Carlo simulation.

**How It Works:**
1. You define a starting portfolio value and select a time horizon
2. SSB runs thousands of simulated return paths based on historical return distributions
3. The results are grouped into percentile bands (10th, 50th, 90th) showing the range of outcomes

**Key Output Metrics:**
- **Median Outcome (50th percentile)**: The middle-of-the-road projected value
- **Optimistic (90th percentile)**: Result achieved in the best 10% of scenarios
- **Pessimistic (10th percentile)**: Result only exceeded in the worst 10% of scenarios
- **Probability of Profit**: Estimated % of scenarios where the portfolio grows

**Time Horizons Available:**
- 1 Year, 3 Years, 5 Years, 10 Years, 20 Years

**Important Limitations:**
- Simulations are based on historical return distributions, which may not represent future markets
- Does not account for taxes, fees, or behavioral factors
- Results are probabilistic — they represent a range of possibilities, not a prediction

**Disclaimer:** Simulation results are hypothetical and for educational purposes only. They are not a forecast or guarantee of future performance.`,
      how_to: `**Running a Simulation:**

1. Navigate to **Simulations** from the sidebar
2. Enter your **starting portfolio value**
3. Select a **time horizon** preset (1Y, 3Y, 5Y, 10Y, 20Y)
4. Choose an **asset mix** or use the default (e.g., 60/40 stocks/bonds)
5. View the projected outcome chart with percentile bands
6. Adjust inputs to explore different scenarios

**Reading the Chart:**
- The shaded area shows the range between pessimistic and optimistic outcomes
- The center line is the median (50th percentile) projection
- Wider bands = more uncertainty over longer horizons`,
    },
    relatedTopics: ['backtesting', 'risk_analytics', 'stress_testing', 'portfolio_theory'],
  },

  // -------------------------------------------------------------------------
  // Signal Feed
  // -------------------------------------------------------------------------
  signal_feed: {
    id: 'signal_feed',
    title: 'Signal Feed',
    keywords: ['signal feed', 'signals', 'trade signal', 'technical setup', 'alerts'],
    aliases: ['signal alerts', 'trading signals', 'technical signals', 'signal list'],
    pageScopes: ['global', 'dashboard', 'signals'],
    content: {
      definition: `**Signal Feed** delivers live technical setups and pre-trade intelligence — pattern-based alerts generated from price action analysis across hundreds of symbols.

**What a Signal Includes:**
- **Symbol**: The ticker that triggered the signal
- **Signal Type**: The pattern or setup detected (e.g., momentum breakout, RSI oversold, trend reversal)
- **Strength**: Confidence rating for the signal
- **Direction**: Bullish or bearish bias of the setup
- **Supporting Indicators**: The technical factors that contributed to the signal
- **Context**: How the signal fits within the current market regime

**Signal Types:**
- Momentum breakouts
- Mean reversion setups (RSI extremes)
- Moving average crossovers
- Volume surges
- Support/resistance interactions

**Tier Access:**
- Starter and above

**Important Disclaimer:**
Signals are educational pattern detections, not buy/sell recommendations. They indicate technical conditions — not predictions of price direction. Always verify signals with your own analysis.`,
      how_to: `**Using the Signal Feed:**

1. Navigate to **Signal Feed** from the sidebar
2. Browse signals sorted by recency or strength
3. Click a signal to open its **detail page** with full indicator context
4. Use the regime context panel to understand how the signal fits the current market environment
5. Cross-reference with paper trading to test signal-based strategies risk-free`,
    },
    relatedTopics: ['market_regime', 'rsi_indicator', 'macd_indicator', 'backtesting', 'paper_trading'],
  },

  // -------------------------------------------------------------------------
  // Community
  // -------------------------------------------------------------------------
  community_feed: {
    id: 'community_feed',
    title: 'Community — Trade Ideas & Discussion',
    keywords: ['community feed', 'trade ideas', 'community post', 'discussion', 'idea sharing'],
    aliases: ['community', 'idea feed', 'social feed', 'shared ideas'],
    pageScopes: ['global', 'community'],
    content: {
      definition: `**Community** is SSB's social feed where users share trade ideas, analysis, and market discussion.

**Features:**
- **Trade Ideas**: Post a symbol with your thesis, timeframe, and supporting analysis
- **Discussion Posts**: Share market observations, educational content, or questions
- **Comments**: Engage with ideas from other community members
- **Upvotes & Reactions**: Surface the most insightful contributions

**Community Guidelines:**
- Share educational analysis, not specific trading advice
- No pump-and-dump or promotional content
- Constructive critique and healthy debate are encouraged

**Demo / Free Users:**
- Can read all community posts
- Posting requires a registered (non-demo) account

**Note:** Community content is user-generated and not verified by SSB. Nothing in the community constitutes financial advice.`,
      how_to: `**Participating in the Community:**

1. Navigate to **Community** from the sidebar
2. Browse the feed of recent trade ideas and posts
3. Click any idea to read the full thesis and comments
4. Click **"New Idea"** to share a trade setup (requires non-demo account)
5. React and comment to engage with other users`,
    },
    relatedTopics: ['signal_feed', 'paper_trading', 'backtesting'],
  },

  // -------------------------------------------------------------------------
  // Crypto Dashboard
  // -------------------------------------------------------------------------
  crypto_page: {
    id: 'crypto_page',
    title: 'Crypto Dashboard',
    keywords: ['cryptocurrency', 'crypto', 'bitcoin', 'ethereum', 'digital assets'],
    aliases: ['crypto page', 'crypto analytics', 'digital asset dashboard'],
    pageScopes: ['global', 'dashboard', 'crypto'],
    content: {
      definition: `**Crypto Dashboard** provides market data and analytics for major digital assets alongside traditional financial analysis tools.

**What's Included:**
- Price data and charts for major cryptocurrencies
- Market cap and volume overview
- Correlation of crypto assets to traditional equity markets
- Volatility metrics for digital assets

**Supported Assets:**
Bitcoin (BTC), Ethereum (ETH), and other major digital assets by market cap.

**Key Differences from Equities:**
- Crypto markets trade 24/7 (no market hours)
- Much higher historical volatility than most equities
- Different risk factors: regulation, network adoption, sentiment-driven
- No earnings reports or fundamental metrics in the traditional sense

**Important Disclaimer:**
Cryptocurrency is highly speculative and carries significant risk including the potential for total loss. SSB's crypto tools are educational and informational only. Not investment advice.`,
    },
    relatedTopics: ['volatility', 'risk_analytics', 'market_regime'],
  },

  // -------------------------------------------------------------------------
  // API Keys / Enterprise
  // -------------------------------------------------------------------------
  api_keys: {
    id: 'api_keys',
    title: 'API Keys & Developer Access',
    keywords: ['api keys', 'api access', 'developer', 'enterprise', 'webhooks', 'api documentation', 'api scopes', 'api rate limits'],
    aliases: ['api key', 'programmatic access', 'developer api', 'rest api', 'api credentials'],
    pageScopes: ['global', 'enterprise', 'settings'],
    content: {
      definition: `**API Keys** allow programmatic access to SSB's platform data — useful for building integrations, custom dashboards, or automated analysis workflows.

**Who Can Use API Keys:**
- Pro tier: market data, paper trading, portfolio, and analytics scopes
- Institutional: all Pro scopes + webhooks:manage

**Available Scopes (permissions):**
- **market_data:read** — Access news, market intelligence, and analytics endpoints
- **paper_trading:read** — Read paper trading positions and orders
- **paper_trading:write** — Place and manage paper trading orders
- **portfolio:read** — Read portfolio data and metrics
- **analytics:read** — Access risk analytics and backtesting data
- **webhooks:manage** — Create and manage webhook subscriptions (Institutional+)

**Authentication:**
Include your API key in requests using either:
\`\`\`
Authorization: Bearer ssb_live_xxxx
X-API-Key: ssb_live_xxxx
\`\`\`

**Rate Limits:**
- Pro: 100 requests/minute
- Institutional: 1,000 requests/minute
- Institutional (with IP allowlist): 5,000 requests/minute

**Usage Stats:**
View 24h and 7-day request counts per key in the API Keys management page.`,
      how_to: `**Creating an API Key:**

1. Go to **Enterprise → API Keys** from the sidebar
2. Click **"New API Key"**
3. Enter a name and select the scopes you need
4. Optionally add an IP allowlist (CIDR notation)
5. Click **Create** — copy the key immediately (shown only once)
6. Use the key in your API requests

**Viewing API Docs:**
- Click **"API Docs"** in the API Keys page header
- Full endpoint reference with curl, Python, and JavaScript examples

**Webhook Setup:**
- Requires Institutional tier and webhooks:manage scope
- Configure event subscriptions and your endpoint URL in the API Keys page`,
      troubleshoot: `**API Key Issues:**

**401 Unauthorized:**
- Verify the key is correct and hasn't been deleted
- Check that the key has the required scope for the endpoint

**403 Forbidden:**
- The key's scope doesn't include this endpoint
- Create a new key with the needed scope

**429 Too Many Requests:**
- You've hit your plan's rate limit
- Wait for the rate limit window to reset or upgrade

**Key not showing after creation:**
- Keys are only shown once at creation — if lost, delete and create a new one`,
    },
    relatedTopics: ['entitlements', 'what_is_ssb', 'audit_log'],
  },

  // -------------------------------------------------------------------------
  // Finance Concepts — Technical Analysis
  // -------------------------------------------------------------------------
  rsi_indicator: {
    id: 'rsi_indicator',
    title: 'RSI — Relative Strength Index',
    keywords: ['relative strength index', 'rsi', 'overbought', 'oversold', 'momentum indicator'],
    aliases: ['rsi indicator', 'rsi oscillator', 'relative strength'],
    pageScopes: ['global', 'paper', 'backtest', 'signals'],
    content: {
      definition: `**RSI (Relative Strength Index)** is a momentum oscillator that measures the speed and magnitude of recent price changes to evaluate overbought or oversold conditions.

**Range:** 0 to 100

**Key Levels:**
- **Above 70**: Often considered overbought — price may be due for a pullback
- **Below 30**: Often considered oversold — price may be due for a bounce
- **50**: Midpoint; above = net bullish momentum, below = net bearish

**Calculation:**
RSI = 100 − [100 / (1 + Average Gain / Average Loss)] over a 14-period default lookback.

**How to Use RSI:**
- **Divergence**: If price makes a new high but RSI does not, it may signal weakening momentum
- **Overbought/Oversold**: Useful in range-bound markets; less reliable in strong trends
- **Trend confirmation**: RSI above 50 in an uptrend supports bullish bias

**Limitations:**
- In a strong trend, RSI can remain overbought (or oversold) for extended periods
- Best used alongside other indicators (MACD, volume, trend direction)
- Not predictive on its own — confirms momentum, not direction

**In SSB:** RSI-based signals appear in the Signal Feed. The RSI mean reversion strategy is one of the available backtest strategy types.`,
      how_to: `**Using RSI in SSB:**

1. **Signal Feed**: Look for RSI-based setups (e.g., RSI oversold bounce)
2. **Backtesting**: Select "RSI Mean Reversion" as the strategy type
3. **Paper Trading**: Use chart overlays to observe price momentum alongside RSI signals`,
    },
    relatedTopics: ['signal_feed', 'macd_indicator', 'backtesting', 'technical_analysis'],
  },

  macd_indicator: {
    id: 'macd_indicator',
    title: 'MACD — Moving Average Convergence Divergence',
    keywords: ['macd indicator', 'macd', 'signal line', 'histogram', 'momentum'],
    aliases: ['macd oscillator', 'moving average crossover indicator'],
    pageScopes: ['global', 'paper', 'backtest', 'signals'],
    content: {
      definition: `**MACD (Moving Average Convergence Divergence)** is a trend-following momentum indicator that shows the relationship between two exponential moving averages.

**Components:**
- **MACD Line**: 12-period EMA minus 26-period EMA
- **Signal Line**: 9-period EMA of the MACD line
- **Histogram**: MACD line minus Signal line (visual of divergence/convergence)

**Key Signals:**
- **Bullish crossover**: MACD line crosses above Signal line → potential upward momentum
- **Bearish crossover**: MACD line crosses below Signal line → potential downward momentum
- **Zero-line cross**: MACD crosses above 0 (bullish) or below 0 (bearish)
- **Divergence**: Price moves in one direction while MACD moves in the opposite — often a trend weakening signal

**Histogram Interpretation:**
- Growing bars → momentum increasing in that direction
- Shrinking bars → momentum fading, potential reversal ahead

**Limitations:**
- MACD is a lagging indicator — based on past price data
- Generates more false signals in choppy, sideways markets
- Best used in trending conditions`,
    },
    relatedTopics: ['rsi_indicator', 'chart_overlay', 'signal_feed', 'technical_analysis'],
  },

  bollinger_bands: {
    id: 'bollinger_bands',
    title: 'Bollinger Bands',
    keywords: ['bollinger bands', 'upper band', 'lower band', 'band squeeze', 'volatility bands'],
    aliases: ['bb', 'bband', 'price bands', 'standard deviation bands'],
    pageScopes: ['global', 'paper', 'signals'],
    content: {
      definition: `**Bollinger Bands** are volatility-based price envelopes plotted two standard deviations above and below a moving average.

**Components:**
- **Middle Band**: 20-period Simple Moving Average (SMA)
- **Upper Band**: Middle Band + 2 standard deviations
- **Lower Band**: Middle Band − 2 standard deviations

**Key Concepts:**

**Band Width:**
- Wide bands = high volatility
- Narrow bands ("squeeze") = low volatility — often precedes a significant price move

**Price Touching Bands:**
- Touching the upper band is not inherently a sell signal (in a strong uptrend, prices can "walk" the band)
- In a ranging market, touching the lower band may signal oversold, upper band overbought

**%B Indicator:**
- Measures where price is relative to the bands (0 = lower band, 1 = upper band)

**Practical Uses:**
- Identify volatility contractions before breakouts
- Define relative high/low conditions in ranging markets
- Confirm momentum strength (price walking the band)

**Limitations:**
- Not predictive of direction — only measures relative price position vs. recent volatility
- Band width based on past volatility; actual forward volatility may differ`,
    },
    relatedTopics: ['chart_overlay', 'volatility', 'rsi_indicator', 'signal_feed'],
  },

  technical_analysis: {
    id: 'technical_analysis',
    title: 'Technical Analysis Overview',
    keywords: ['technical analysis', 'chart patterns', 'price action', 'support resistance', 'ta'],
    aliases: ['charting', 'price chart analysis', 'chart reading'],
    pageScopes: ['global', 'paper', 'backtest'],
    content: {
      definition: `**Technical Analysis (TA)** is the study of historical price and volume data to identify patterns, trends, and signals that may indicate future price behavior.

**Core Principles:**
1. **Price discounts everything** — all known information is already reflected in price
2. **Prices move in trends** — once established, trends are more likely to continue than reverse
3. **History repeats** — patterns recur because human psychology repeats

**Main Categories:**

**Trend Analysis:**
- Moving averages (SMA, EMA)
- Trendlines and channels
- Higher highs/lows (uptrend) vs. lower highs/lows (downtrend)

**Momentum:**
- RSI, MACD, Stochastics
- Rate of change (ROC)

**Volatility:**
- Bollinger Bands, ATR (Average True Range)

**Volume:**
- Volume confirms price moves; rising price on falling volume = weak move

**Support & Resistance:**
- **Support**: Price level where buying has historically emerged
- **Resistance**: Price level where selling pressure has historically appeared
- Once broken, support often becomes resistance (and vice versa)

**Chart Patterns:**
- Head & Shoulders (reversal), Double Top/Bottom (reversal)
- Flags, Pennants (continuation)
- Triangles (breakout setups)

**In SSB:**
Chart overlays (SMA, trend lines) are available in Paper Trading. The Signal Feed surfaces TA-based setups. Backtesting lets you quantify historical performance of TA-based strategies.

**Important:** Technical analysis is a probabilistic tool, not a crystal ball. No pattern has a 100% success rate.`,
    },
    relatedTopics: ['rsi_indicator', 'macd_indicator', 'bollinger_bands', 'chart_overlay', 'signal_feed'],
  },

  // -------------------------------------------------------------------------
  // Finance Concepts — Fundamental Analysis
  // -------------------------------------------------------------------------
  fundamental_analysis: {
    id: 'fundamental_analysis',
    title: 'Fundamental Analysis',
    keywords: ['fundamental analysis', 'pe ratio', 'eps', 'revenue', 'valuation', 'intrinsic value', 'free cash flow'],
    aliases: ['fundamentals', 'stock analysis', 'company valuation', 'financial ratios'],
    pageScopes: ['global', 'dashboard'],
    content: {
      definition: `**Fundamental Analysis** evaluates a company's intrinsic value by examining financial statements, competitive position, management, and macroeconomic factors.

**Key Valuation Ratios:**

**P/E Ratio (Price-to-Earnings):**
- Share price divided by earnings per share (EPS)
- High P/E = market expects high future growth (or stock is expensive)
- Low P/E = mature/value company or potentially undervalued
- Compare within the same sector — P/E varies widely across industries

**EPS (Earnings Per Share):**
- Net income divided by shares outstanding
- Growing EPS generally signals a healthy business

**P/B Ratio (Price-to-Book):**
- Share price divided by book value per share
- Under 1.0 may indicate undervaluation; used heavily in banking/finance analysis

**P/S Ratio (Price-to-Sales):**
- Market cap divided by annual revenue
- Useful for early-stage companies with no earnings

**EV/EBITDA:**
- Enterprise Value divided by Earnings Before Interest, Taxes, Depreciation, and Amortization
- A debt-agnostic valuation multiple

**Free Cash Flow (FCF):**
- Cash generated after capital expenditures
- More difficult to manipulate than earnings; often considered a "purer" profitability measure

**Qualitative Factors:**
- Competitive moat (brand, patents, network effects, switching costs)
- Management quality and capital allocation track record
- Industry trends and regulatory environment

**Fundamental vs. Technical Analysis:**
- Fundamental: What to buy (which company is undervalued)
- Technical: When to buy (timing entry and exit)
- Many investors use both in combination`,
      how_to: `**Applying Fundamental Analysis on SSB:**

1. Use **Backtesting** to test fundamental factor-based strategies (e.g., buy low-P/E stocks)
2. The **Learning Hub** covers valuation fundamentals in detail
3. Use risk analytics to complement fundamental views with quantitative risk measures
4. Use **Stress Testing** to model how fundamentally sound companies might behave in crisis scenarios`,
    },
    relatedTopics: ['backtesting', 'risk_analytics', 'portfolio_theory', 'learn_feature'],
  },

  // -------------------------------------------------------------------------
  // Finance Concepts — Portfolio & Risk
  // -------------------------------------------------------------------------
  portfolio_theory: {
    id: 'portfolio_theory',
    title: 'Modern Portfolio Theory (MPT)',
    keywords: ['portfolio theory', 'modern portfolio theory', 'efficient frontier', 'mean variance', 'diversification theory'],
    aliases: ['mpt', 'markowitz', 'optimal portfolio', 'efficient portfolio'],
    pageScopes: ['global', 'risk', 'portfolio', 'dashboard'],
    content: {
      definition: `**Modern Portfolio Theory (MPT)**, developed by Harry Markowitz in 1952, provides a mathematical framework for constructing portfolios that maximize expected return for a given level of risk.

**Core Idea:**
A portfolio's risk is not just the sum of individual asset risks — it depends on how assets move relative to each other (correlation). Combining uncorrelated assets can reduce overall portfolio risk without sacrificing expected return.

**Efficient Frontier:**
The set of portfolios offering the highest expected return for each level of risk. Portfolios on the frontier are "efficient." Those below it are suboptimal.

**Key Inputs:**
- Expected return of each asset
- Standard deviation (volatility) of each asset
- Correlation between each pair of assets

**Sharpe-Optimal Portfolio:**
The point on the efficient frontier with the highest Sharpe ratio — the best risk-adjusted return.

**Diversification Benefit:**
If assets are not perfectly correlated (+1), combining them reduces total portfolio volatility. This is the mathematical foundation for diversification.

**Key Criticism / Limitations:**
- Relies on expected returns being estimable (they're not reliably)
- Historical correlations are unstable — they often spike during crises
- Doesn't account for fat tails, skewness, or liquidity
- Ignores investor behavioral factors

**In SSB:**
The Portfolio Health panel (Pro+) reflects MPT principles: sector diversification, correlation analysis (Institutional+), and concentration warnings.`,
    },
    relatedTopics: ['correlation_analysis', 'portfolio_health', 'risk_analytics', 'drawdown', 'volatility'],
  },

  dollar_cost_averaging: {
    id: 'dollar_cost_averaging',
    title: 'Dollar Cost Averaging (DCA)',
    keywords: ['dollar cost averaging', 'dca', 'systematic investing', 'periodic investing'],
    aliases: ['dollar cost average', 'periodic purchases', 'regular investing'],
    pageScopes: ['global', 'dashboard', 'learn'],
    content: {
      definition: `**Dollar Cost Averaging (DCA)** is the practice of investing a fixed dollar amount at regular intervals, regardless of price — buying more shares when prices are low and fewer when prices are high.

**How It Works:**
- Example: Invest $500/month in SPY every month
- Month 1: SPY at $500 → buy 1.0 share
- Month 2: SPY at $400 → buy 1.25 shares
- Month 3: SPY at $550 → buy 0.91 shares
- Average cost per share < arithmetic average of the prices

**Benefits:**
- Removes the need to time the market
- Reduces the impact of volatility on average cost basis
- Instills disciplined, emotion-free investing habit
- Works well in volatile markets

**Limitations:**
- In a consistently rising market, lump-sum investing often outperforms DCA
- Doesn't eliminate risk — a sustained bear market still causes losses
- Opportunity cost if you hold cash waiting to deploy

**Lump Sum vs. DCA:**
Research generally shows lump-sum investing outperforms DCA ~2/3 of the time in markets that trend upward long-term. However, DCA reduces the psychological risk of investing at a local peak.

**In SSB:**
Use the **Backtesting** or **Simulations** tools to model DCA strategies against historical data and compare against lump-sum approaches.`,
    },
    relatedTopics: ['backtesting', 'simulations', 'position_sizing', 'portfolio_theory'],
  },

  position_sizing: {
    id: 'position_sizing',
    title: 'Position Sizing',
    keywords: ['position sizing', 'kelly criterion', 'bet size', 'how much to buy', 'risk management'],
    aliases: ['kelly formula', 'how much to invest', 'stake size', 'allocation size'],
    pageScopes: ['global', 'paper', 'backtest', 'risk'],
    content: {
      definition: `**Position Sizing** determines how much capital to allocate to a single trade or investment — one of the most important (and overlooked) aspects of risk management.

**Why It Matters:**
- Poor position sizing can blow up a portfolio even with a high win rate
- Good position sizing limits drawdown and preserves capital for future opportunities

**Common Methods:**

**Fixed Dollar Amount:**
- Invest the same dollar value per trade (e.g., always $1,000)
- Simple but ignores per-trade risk variability

**Fixed Percentage:**
- Invest X% of total capital per trade (e.g., 2–5% max)
- Scales with portfolio size; most commonly recommended for beginners

**Volatility-Based Sizing (ATR Method):**
- Size position so that the expected volatility-based stop loss equals a fixed % of capital
- More sophisticated; adjusts for how volatile the specific asset is

**Kelly Criterion:**
A mathematical formula for optimal bet/position sizing based on edge and odds:
\`\`\`
Kelly % = W − [(1 − W) / R]
\`\`\`
Where W = win rate, R = average win / average loss ratio
- Full Kelly is often too aggressive in practice
- "Half Kelly" or "Quarter Kelly" is common for smoother equity curves

**Example (Kelly):**
- Win rate: 55%, Average win: $200, Average loss: $100 → R = 2.0
- Kelly % = 0.55 − (0.45 / 2.0) = 0.55 − 0.225 = **32.5%** (very aggressive!)
- Half Kelly: 16.25% per trade

**Practical Rule of Thumb:**
Most professional traders risk no more than **1–2% of capital per trade**. This allows for 50+ consecutive losses before a 50% drawdown.

**In SSB:**
Use the Backtesting tool to analyze position sizing strategies and observe their effect on drawdown and Sharpe ratio in historical simulations.`,
    },
    relatedTopics: ['risk_analytics', 'drawdown', 'backtesting', 'dollar_cost_averaging'],
  },

  risk_reward: {
    id: 'risk_reward',
    title: 'Risk/Reward Ratio & Stop Loss / Take Profit',
    keywords: ['risk reward', 'stop loss', 'take profit', 'r/r', 'risk/reward ratio'],
    aliases: ['stop loss order', 'take profit order', 'risk reward ratio', 'reward risk'],
    pageScopes: ['global', 'paper', 'backtest'],
    content: {
      definition: `**Risk/Reward Ratio (R/R)** compares the potential profit of a trade to its potential loss.

**Formula:**
\`\`\`
Risk/Reward = Distance to Stop Loss / Distance to Take Profit
\`\`\`
A 1:2 R/R means you're risking $1 to make $2.

**Why R/R Matters:**
Even a strategy with a 40% win rate can be profitable with a good R/R:
- 40 wins × $200 average win = $8,000
- 60 losses × $100 average loss = $6,000
- Net: +$2,000

**Stop Loss:**
A pre-set price level at which you exit a losing trade to limit further losses.
- **Fixed stop**: Set at a specific price (e.g., 5% below entry)
- **Volatility stop (ATR-based)**: Stop distance based on recent price swings
- **Technical stop**: Placed below key support or above resistance

**Take Profit:**
A pre-set price level at which you exit a profitable trade to lock in gains.
- **Fixed target**: A specific price (e.g., 10% above entry)
- **Trailing stop**: Moves up as price rises, locking in gains dynamically
- **Technical target**: Placed at next resistance or Fibonacci extension level

**Common Minimum Threshold:**
Most traders look for at least a 1:2 R/R before entering a trade. At 1:1, you need >50% win rate to profit; at 1:2, you only need >33%.

**In SSB Paper Trading:**
Practice defining stop-loss and take-profit levels before placing orders. Use backtesting to evaluate how different stop/target parameters affect historical strategy performance.`,
    },
    relatedTopics: ['paper_trading', 'backtesting', 'position_sizing', 'drawdown'],
  },

  sector_rotation: {
    id: 'sector_rotation',
    title: 'Sector Rotation',
    keywords: ['sector rotation', 'sectors', 'sector exposure', 'cyclical', 'defensive', 'gics sectors'],
    aliases: ['sector investing', 'sector allocation', 'defensive sectors', 'cyclical sectors'],
    pageScopes: ['global', 'risk', 'portfolio', 'dashboard'],
    content: {
      definition: `**Sector Rotation** is the movement of investment capital from one industry sector to another, typically as economic conditions and the business cycle evolve.

**The 11 GICS Sectors:**
1. **Information Technology** — software, hardware, semiconductors
2. **Healthcare** — pharma, biotech, medical devices
3. **Financials** — banks, insurance, asset managers
4. **Consumer Discretionary** — retail, autos, leisure (cyclical)
5. **Consumer Staples** — food, beverages, household products (defensive)
6. **Industrials** — aerospace, machinery, transportation
7. **Energy** — oil, gas, renewables
8. **Materials** — mining, chemicals, steel
9. **Utilities** — electric, gas, water utilities (defensive)
10. **Real Estate** — REITs, property developers
11. **Communication Services** — telecom, media, internet

**Cyclical vs. Defensive:**
- **Cyclical**: Consumer Discretionary, Energy, Materials, Industrials, Tech — outperform in expansions
- **Defensive**: Consumer Staples, Utilities, Healthcare — hold up better in contractions

**Classic Business Cycle Rotation:**
- Early recovery: Financials, Consumer Discretionary
- Mid-cycle expansion: Tech, Industrials, Materials
- Late cycle: Energy, Consumer Staples
- Recession/contraction: Utilities, Consumer Staples, Healthcare, Bonds

**In SSB:**
The Portfolio Health panel (Pro+) shows your sector exposure breakdown. Pair with the Regime Analysis to understand which phase of the cycle the market appears to be in.`,
    },
    relatedTopics: ['portfolio_health', 'market_regime', 'risk_analytics', 'portfolio_theory'],
  },

  index_funds: {
    id: 'index_funds',
    title: 'Index Funds & Passive vs. Active Investing',
    keywords: ['index funds', 'passive investing', 'expense ratio', 'active vs passive', 'etf'],
    aliases: ['passive fund', 'index etf', 'market index', 'active management'],
    pageScopes: ['global', 'dashboard', 'learn'],
    content: {
      definition: `**Index Funds** are investment vehicles that track a market index (e.g., S&P 500, Nasdaq 100) by holding all or a representative sample of the index's components.

**Key Features:**
- **Low cost**: Expense ratios often 0.03–0.20% vs. 0.5–1.5%+ for active funds
- **Broad diversification**: One fund can hold 500+ stocks
- **Tax efficient**: Low turnover = fewer taxable events
- **Transparent**: Holdings are publicly known and match the index

**Common Index ETFs:**
- **SPY / VOO / IVV**: S&P 500
- **QQQ**: Nasdaq 100 (tech-heavy)
- **IWM**: Russell 2000 (small caps)
- **VTI**: Total US market
- **VT**: Total world market

**Expense Ratio:**
The annual fee deducted from the fund's assets. A 0.03% expense ratio on a $10,000 investment costs $3/year vs. $100/year for a 1.0% actively managed fund.

**Passive vs. Active Investing:**
- **Passive (index)**: Track the market; accept market return minus fees
- **Active (fund managers/stock picking)**: Attempt to beat the market through selection

**The Case for Passive:**
- After fees, ~80–90% of active funds underperform their benchmark over 10+ years (S&P SPIVA reports)
- Compounding: Small fee differences grow large over decades

**The Case for Active:**
- Potential for outperformance if you identify a genuine edge
- Ability to avoid specific sectors or express views
- Some active strategies (value, quality) have historically added alpha

**In SSB:**
Use **Backtesting** to compare a buy-and-hold index strategy (SPY) against active strategies. The SPY benchmark overlay on the backtest detail page makes this comparison visual.`,
    },
    relatedTopics: ['backtesting', 'dollar_cost_averaging', 'portfolio_theory', 'drawdown'],
  },

  fixed_income: {
    id: 'fixed_income',
    title: 'Fixed Income & Bonds',
    keywords: ['fixed income', 'bond', 'bonds', 'treasury', 'yield', 'coupon', 'duration'],
    aliases: ['bond investing', 'fixed income investing', 'treasuries', 'corporate bonds'],
    pageScopes: ['global', 'dashboard'],
    content: {
      definition: `**Fixed Income** refers to investment securities that pay a fixed return (coupon) on a schedule, with principal returned at maturity.

**Key Bond Concepts:**

**Par Value (Face Value):**
The principal amount returned at maturity (typically $1,000 per bond).

**Coupon Rate:**
The annual interest payment as a percentage of par. A 5% coupon on a $1,000 bond pays $50/year.

**Yield to Maturity (YTM):**
The total return anticipated if the bond is held to maturity, accounting for coupon payments and price discount/premium.

**Duration:**
A measure of a bond's price sensitivity to interest rate changes.
- **Higher duration = more price risk** when rates move
- Rule of thumb: A bond with duration 5 loses ~5% in price for each 1% rise in interest rates

**Bond Price / Yield Relationship:**
Bond prices and yields move in **opposite directions**:
- Rates rise → existing bond prices fall (newer bonds pay more)
- Rates fall → existing bond prices rise

**Types of Bonds:**
- **US Treasuries**: Issued by US government; lowest credit risk; benchmark for risk-free rate
- **Corporate Bonds**: Issued by companies; higher yield, higher risk
- **Municipal (Muni) Bonds**: Tax-advantaged income; issued by state/local governments
- **TIPS (Treasury Inflation-Protected Securities)**: Principal adjusts with CPI inflation

**Yield Curve:**
A graph of yields across maturities (3-month to 30-year Treasuries).
- **Normal (upward sloping)**: Longer terms have higher yields — healthy economy
- **Inverted**: Short-term yields > long-term yields — historically associated with recessions
- **Flat**: Similar yields across maturities — transitional period

**In SSB:**
The **Fixed Income** page provides bond screener tools and YTM/YTC calculations. The Regime Analysis page tracks the 10Y-2Y yield curve spread as a macro indicator.`,
    },
    relatedTopics: ['risk_analytics', 'market_regime', 'regime_indicators', 'stress_testing'],
  },
};

// =============================================================================
// Glossary (Quick Definitions)
// =============================================================================

export const GLOSSARY: KBGlossaryTerm[] = [
  { term: 'Alpha', aliases: ['alpha'], definition: 'Returns above a benchmark, often attributed to skill', category: 'analytics' },
  { term: 'At-the-Money (ATM)', aliases: ['atm', 'at the money'], definition: 'An option whose strike price is approximately equal to the current price of the underlying asset', category: 'trading' },
  { term: 'Beta', aliases: ['beta'], definition: 'Measure of volatility relative to the market; Beta > 1 = more volatile than market', category: 'risk' },
  { term: 'Black-Scholes', aliases: ['black scholes model', 'bsm'], definition: 'A mathematical model for pricing European-style options; SSB uses it to generate educational simulated options prices', category: 'analytics' },
  { term: 'Breadth Score', aliases: ['breadth', 'market breadth'], definition: 'Proportion of market components participating in the current trend (0–1); higher = broader participation', category: 'analytics' },
  { term: 'Calmar Ratio', definition: 'Annualized return divided by maximum drawdown; higher is better', category: 'analytics' },
  { term: 'Confidence Score', definition: 'In SSB regime analysis, the degree to which all indicators agree on the current regime classification (0–100%)', category: 'analytics' },
  { term: 'Correlation', aliases: ['correlation coefficient'], definition: 'Statistical measure of how two assets move together (-1 = opposite, 0 = independent, +1 = identical)', category: 'risk' },
  { term: 'Correlation Matrix', definition: 'Grid showing pairwise correlation between all portfolio positions; useful for assessing diversification', category: 'risk' },
  { term: 'CVaR', aliases: ['cvar', 'expected shortfall', 'conditional var'], definition: 'Conditional Value at Risk — the average loss in the worst-case tail beyond the VaR threshold', category: 'risk' },
  { term: 'Diversification', definition: 'Spreading investments across uncorrelated assets to reduce concentration risk', category: 'risk' },
  { term: 'Drawdown', aliases: ['dd', 'mdd', 'max drawdown'], definition: 'Peak-to-trough decline in portfolio value; maximum drawdown is the largest such decline historically', category: 'risk' },
  { term: 'Ensemble Model', definition: 'A model that combines multiple independent signals or classifiers to produce a more robust output', category: 'analytics' },
  { term: 'Call Option', aliases: ['call', 'calls'], definition: 'An options contract giving the buyer the right to purchase the underlying asset at the strike price before expiration', category: 'trading' },
  { term: 'Delta', aliases: ['option delta'], definition: 'Options greek measuring rate of change in option price per $1 move in the underlying; calls 0 to +1, puts -1 to 0', category: 'analytics' },
  { term: 'ETF', definition: 'Exchange-Traded Fund — a basket of securities trading like a stock', category: 'trading' },
  { term: 'Expiration Date', aliases: ['expiry', 'expiration'], definition: 'The date on which an options contract expires; after this date the option has no value if unexercised', category: 'trading' },
  { term: 'Gamma', aliases: ['option gamma'], definition: 'Options greek measuring rate of change of delta per $1 move in the underlying; highest for ATM options near expiration', category: 'analytics' },
  { term: 'Hedging', definition: 'Taking offsetting positions to reduce exposure to a specific risk', category: 'risk' },
  { term: 'Implied Volatility (IV)', aliases: ['iv', 'implied vol', 'implied volatility'], definition: 'The market\'s forward-looking expectation of volatility derived from an option\'s price; higher IV = more expensive options', category: 'analytics' },
  { term: 'In-the-Money (ITM)', aliases: ['itm', 'in the money'], definition: 'An option with intrinsic value: a call is ITM when the stock price is above the strike; a put is ITM when stock price is below the strike', category: 'trading' },
  { term: 'Liquidity', definition: 'How easily an asset can be bought or sold without materially affecting its price', category: 'trading' },
  { term: 'Open Interest (OI)', aliases: ['oi', 'open interest'], definition: 'The total number of outstanding options contracts that have not been settled or closed', category: 'trading' },
  { term: 'Out-of-the-Money (OTM)', aliases: ['otm', 'out of the money'], definition: 'An option with no intrinsic value: a call is OTM when stock price is below the strike; a put is OTM when above the strike', category: 'trading' },
  { term: 'Option Premium', aliases: ['premium', 'option price'], definition: 'The price paid to buy an options contract; composed of intrinsic value + time value', category: 'trading' },
  { term: 'Market Cap', definition: 'Total market value of all outstanding shares of a company', category: 'trading' },
  { term: 'P/E Ratio', definition: 'Price-to-Earnings ratio — a common equity valuation metric', category: 'analytics' },
  { term: 'P&L', aliases: ['pnl', 'pl', 'profit and loss'], definition: 'Profit and Loss — the net gain or loss on a position or account', category: 'trading' },
  { term: 'Put Option', aliases: ['put', 'puts'], definition: 'An options contract giving the buyer the right to sell the underlying asset at the strike price before expiration', category: 'trading' },
  { term: 'Rebalancing', definition: 'Adjusting portfolio weights back to target allocations after price movements shift them', category: 'trading' },
  { term: 'Regime Classification', aliases: ['regime label'], definition: 'The category assigned to the current market environment by SSB\'s ensemble model (e.g., Bull, Bear, Sideways, High Volatility)', category: 'analytics' },
  { term: 'Sharpe Ratio', definition: 'Risk-adjusted return measure: annualized excess return divided by annualized standard deviation; higher is better', category: 'analytics' },
  { term: 'Slippage', definition: 'Difference between the expected execution price and the actual fill price', category: 'trading' },
  { term: 'Sortino Ratio', definition: 'Like Sharpe but only penalizes downside volatility, not upside; higher is better', category: 'analytics' },
  { term: 'Spread', definition: 'Difference between the best bid and ask prices at any moment', category: 'trading' },
  { term: 'SMA', aliases: ['simple moving average', 'moving average'], definition: 'Simple Moving Average — the arithmetic mean of closing prices over N periods', category: 'analytics' },
  { term: 'Strike Price', aliases: ['strike', 'exercise price'], definition: 'The fixed price at which the holder of an options contract can buy (call) or sell (put) the underlying asset', category: 'trading' },
  { term: 'Theta', aliases: ['option theta', 'time decay'], definition: 'Options greek measuring time decay — how much value an option loses per calendar day; always negative for option buyers', category: 'analytics' },
  { term: 'Trend Score', aliases: ['trend'], definition: 'In SSB, a composite signal (-1 to +1) measuring price trend direction and momentum across multiple timeframes', category: 'analytics' },
  { term: 'VaR', aliases: ['value at risk'], definition: 'Value at Risk — the potential loss threshold at a given confidence level (e.g., 95%) over a defined time horizon', category: 'risk' },
  { term: 'VIX', aliases: ['vix', 'volatility index', 'fear index'], definition: 'CBOE Volatility Index — measures expected 30-day volatility of the S&P 500; above 30 = high fear, below 20 = calm', category: 'risk' },
  { term: 'Vega', aliases: ['option vega'], definition: 'Options greek measuring sensitivity of option price to a 1% change in implied volatility; long options benefit from rising IV', category: 'analytics' },
  { term: 'Volatility', aliases: ['vol', 'historical volatility'], definition: 'Measure of how much prices fluctuate over time; annualized standard deviation of returns', category: 'risk' },
  { term: 'Volatility Percentile', definition: 'In SSB, where current realized volatility ranks relative to its historical distribution (0 = lowest ever, 100 = highest ever)', category: 'analytics' },
  { term: 'Yield', definition: 'Income return on an investment, expressed as a percentage of its price', category: 'analytics' },
  { term: 'Yield Curve', aliases: ['yield curve slope', '10y-2y', 'treasury spread'], definition: 'The spread between long-term (10Y) and short-term (2Y) Treasury yields; positive = normal, negative (inverted) = historically associated with economic slowdowns', category: 'analytics' },

  // New additions
  { term: 'RSI', aliases: ['relative strength index', 'rsi indicator'], definition: 'Relative Strength Index — a momentum oscillator (0–100) measuring overbought (>70) and oversold (<30) conditions over a 14-period default lookback', category: 'analytics' },
  { term: 'MACD', aliases: ['moving average convergence divergence'], definition: 'Moving Average Convergence Divergence — a trend-following momentum indicator using two EMAs (12 and 26 period); crossovers of the signal line indicate momentum shifts', category: 'analytics' },
  { term: 'Bollinger Bands', aliases: ['bb', 'bollinger'], definition: 'Volatility bands plotted 2 standard deviations above and below a 20-period SMA; squeeze signals potential breakout, wide bands signal high volatility', category: 'analytics' },
  { term: 'ATR', aliases: ['average true range', 'true range'], definition: 'Average True Range — measures average volatility of price swings over N periods; used for stop-loss placement and position sizing', category: 'analytics' },
  { term: 'Support', aliases: ['support level', 'price floor'], definition: 'A price level where buying interest has historically been strong enough to halt or reverse a decline', category: 'analytics' },
  { term: 'Resistance', aliases: ['resistance level', 'price ceiling'], definition: 'A price level where selling pressure has historically been strong enough to halt or reverse a rise; broken resistance often becomes support', category: 'analytics' },
  { term: 'Dollar Cost Averaging', aliases: ['dca', 'dollar cost average'], definition: 'Investing a fixed dollar amount at regular intervals regardless of price; reduces average cost basis in volatile or declining markets', category: 'trading' },
  { term: 'Kelly Criterion', aliases: ['kelly formula', 'kelly'], definition: 'A formula for optimal position sizing based on win rate and average win/loss ratio: Kelly% = W − (1−W)/R; in practice, half-Kelly is often used', category: 'analytics' },
  { term: 'Stop Loss', aliases: ['stop-loss', 'stop order'], definition: 'A pre-set exit price to automatically close a losing position and limit further downside', category: 'trading' },
  { term: 'Take Profit', aliases: ['take-profit', 'tp', 'target price'], definition: 'A pre-set exit price to lock in gains when a position reaches a target level', category: 'trading' },
  { term: 'Risk/Reward Ratio', aliases: ['r/r', 'reward risk'], definition: 'Ratio of potential profit to potential loss on a trade; a 1:2 R/R means risking $1 to make $2; minimum 1:2 is a common threshold', category: 'risk' },
  { term: 'P/E Ratio', aliases: ['price to earnings', 'pe'], definition: 'Price-to-Earnings ratio — share price divided by EPS; higher = market expects growth or stock is expensive vs. peers', category: 'analytics' },
  { term: 'EPS', aliases: ['earnings per share'], definition: 'Earnings Per Share — net income divided by shares outstanding; a key profitability metric for equity analysis', category: 'analytics' },
  { term: 'Free Cash Flow', aliases: ['fcf', 'cash flow'], definition: 'Operating cash flow minus capital expenditures; considered a cleaner measure of profitability than accounting earnings', category: 'analytics' },
  { term: 'CAGR', aliases: ['compound annual growth rate'], definition: 'Compound Annual Growth Rate — the steady rate at which an investment would have grown if it grew at the same rate every year; (End Value / Start Value)^(1/n) − 1', category: 'analytics' },
  { term: 'Expense Ratio', definition: 'Annual fee charged by a fund as a % of assets under management; lower is better for long-term compounding', category: 'trading' },
  { term: 'Dividend', aliases: ['dividends', 'div'], definition: 'Cash distribution paid by a company to shareholders, typically from earnings; expressed as dividend yield = annual dividend / stock price', category: 'trading' },
  { term: 'Ex-Dividend Date', aliases: ['ex-div date', 'record date'], definition: 'The cutoff date to be eligible for the next dividend payment; buyers after this date do not receive the dividend', category: 'trading' },
  { term: 'Market Cap', aliases: ['market capitalization', 'market cap categories'], definition: 'Total market value of all outstanding shares; large-cap >$10B, mid-cap $2B–$10B, small-cap $300M–$2B, micro-cap <$300M', category: 'trading' },
  { term: 'Sector Rotation', definition: 'Movement of investment capital between industry sectors as the economic cycle evolves; cyclical sectors outperform in expansions, defensive in contractions', category: 'analytics' },
  { term: 'Efficient Frontier', definition: 'In MPT, the set of optimal portfolios offering the highest expected return for each level of risk; portfolios below the frontier are suboptimal', category: 'analytics' },
  { term: 'Monte Carlo Simulation', aliases: ['monte carlo'], definition: 'A technique that runs thousands of randomized scenarios to model a range of possible outcomes; used in SSB\'s Simulations feature for portfolio projections', category: 'analytics' },
  { term: 'Trailing Stop', aliases: ['trailing stop loss'], definition: 'A dynamic stop-loss that moves up as price rises, locking in profits while allowing further upside', category: 'trading' },
  { term: 'Volume', aliases: ['trading volume'], definition: 'The number of shares (or contracts) traded in a given period; high volume confirms price moves, low volume signals weak conviction', category: 'trading' },
  { term: 'Open Interest', aliases: ['oi'], definition: 'Total number of outstanding options (or futures) contracts that haven\'t been closed or settled; rising OI with rising price suggests new money entering the trend', category: 'trading' },
  { term: 'Intrinsic Value', definition: 'The calculated "true" value of an asset based on fundamentals (earnings, cash flow, assets); if market price is below intrinsic value, the asset may be undervalued', category: 'analytics' },
  { term: 'Duration', aliases: ['bond duration', 'modified duration'], definition: 'A bond\'s price sensitivity to interest rate changes; a duration of 5 means ~5% price decline for each 1% rise in rates', category: 'risk' },
  { term: 'Coupon', aliases: ['coupon rate', 'bond coupon'], definition: 'The annual interest payment on a bond, expressed as a % of par value; a 5% coupon on a $1,000 bond pays $50/year', category: 'trading' },
  { term: 'YTM', aliases: ['yield to maturity'], definition: 'Yield to Maturity — the total return expected on a bond if held to maturity, accounting for coupon payments and any price premium or discount', category: 'analytics' },
  { term: 'Demo Mode', aliases: ['demo session', 'try it free'], definition: 'SSB\'s no-account-required 30-minute exploration mode; uses a pre-seeded free-tier account with sample data', category: 'platform' },
  { term: 'SPY Benchmark', aliases: ['spy overlay', 'benchmark overlay'], definition: 'In SSB backtesting, a dashed overlay showing SPY buy-and-hold performance over the same date range as your backtest for direct comparison', category: 'platform' },
];

// =============================================================================
// Safety Patterns (questions to redirect)
// =============================================================================

export const SAFETY_PATTERNS = [
  // Direct advice requests
  /what (should|shall) i (buy|sell|trade|invest)/i,
  /should i (buy|sell|trade|invest)/i,
  /is (it|now) (a )?good time to (buy|sell)/i,
  /recommend.*(stock|etf|fund|ticker|symbol)/i,
  /what.*(stock|etf|fund|ticker).*(buy|recommend)/i,
  /which (stock|etf|fund) (should|to|will)/i,
  /tell me what to (buy|sell|trade)/i,
  /give me.*(tip|pick|recommendation)/i,
  // Prediction requests
  /will.*(go up|go down|rise|fall|crash|moon)/i,
  /predict.*(price|market|stock)/i,
  /where.*(price|market).*(going|headed)/i,
  /guarantee.*(return|profit|gain)/i,
];

export const SAFETY_RESPONSE = `I understand you're looking for specific guidance, but I can't provide personalized investment advice or buy/sell recommendations.

**What I CAN help with:**
- Explaining investment concepts and strategies
- Understanding risk metrics and analytics
- Learning how to use SSB's features
- General education about markets

**For specific decisions, consider:**
- Using SSB's Paper Trading to test ideas risk-free
- Running backtests to understand historical behavior
- Consulting a qualified financial advisor
- Doing your own research (DYOR)

Would you like me to explain any concepts that could help with your research?`;

export const DISCLAIMER = 'Educational only. Not financial advice. No trade execution.';

// =============================================================================
// Page-Smart Quick Prompts
// =============================================================================

export const PAGE_PROMPTS: Record<PageScope, string[]> = {
  global: [
    'What is SSB?',
    'What is VaR?',
    'Explain volatility',
    'How do tiers work?',
  ],
  dashboard: [
    'What do these metrics mean?',
    'How is total return calculated?',
    'What is market regime?',
    'Explain the charts',
  ],
  paper: [
    'How do I place an order?',
    'What is P&L?',
    'How do chart overlays work?',
    'Why is my order rejected?',
  ],
  backtest: [
    'How does backtesting work?',
    'What is overfitting?',
    'How to interpret results?',
    'What is drawdown?',
  ],
  risk: [
    'What is VaR?',
    'Explain Sharpe ratio',
    'What is volatility?',
    'How to reduce risk?',
  ],
  regime: [
    'What is a market regime?',
    'How are regimes detected?',
    'Bull vs bear market?',
    'Why do regimes matter?',
  ],
  stress: [
    'What is stress testing?',
    'Which scenarios exist?',
    'How accurate are tests?',
    'What do results mean?',
  ],
  settings: [
    'How to upgrade?',
    'Change my plan',
    'What are the tiers?',
    'Reset my account',
  ],
  billing: [
    'How to upgrade?',
    'Cancel subscription',
    'Change payment method',
    'What are the tiers?',
  ],
  audit: [
    'What is the audit log?',
    'What events are tracked?',
    'How far back does history go?',
    'What does this entry mean?',
  ],
  portfolio: [
    'What is portfolio health?',
    'What is a correlation matrix?',
    'How is the health score calculated?',
    'What is concentration risk?',
  ],
  options: [
    'What is an options chain?',
    'Explain delta and theta',
    'What is implied volatility?',
    'Call vs put options?',
  ],
  learn: [
    'What modules are available?',
    'What are learning paths?',
    'Which modules are free?',
    'How do I track my progress?',
  ],
  enterprise: [
    'How do I create an API key?',
    'What scopes are available?',
    'What are the rate limits?',
    'How do webhooks work?',
  ],
  simulations: [
    'How do simulations work?',
    'What is Monte Carlo simulation?',
    'How to read the outcome chart?',
    'What time horizons are available?',
  ],
  signals: [
    'What is the Signal Feed?',
    'How are signals generated?',
    'What is RSI?',
    'What is a momentum breakout?',
  ],
  community: [
    'How do I post a trade idea?',
    'What is the community feed?',
    'Can I comment on ideas?',
    'Are ideas verified?',
  ],
  crypto: [
    'How is crypto different from stocks?',
    'What assets are supported?',
    'Why is crypto so volatile?',
    'How do I analyze crypto risk?',
  ],
  news: [
    'Where does the news data come from?',
    'How current is the news?',
    'What are top movers?',
    'How do I interpret the market summary?',
  ],
};

/**
 * Get quick prompts for a specific page.
 */
export function getPagePrompts(page: PageScope): string[] {
  return PAGE_PROMPTS[page] || PAGE_PROMPTS.global;
}

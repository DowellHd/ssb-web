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
  | 'portfolio';

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
- **Backtesting**: Test investment hypotheses against historical data
- **Paper Trading**: Practice with simulated portfolios (no real money)
- **Stress Testing**: See how portfolios might perform in crisis scenarios

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
- Test across multiple market regimes`,
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

**Free:**
- Basic risk analytics
- Paper trading: 5 positions, 10 orders/day, 30-day history, 1 reset/week
- SMA 20 chart overlay only
- Regime data with delay; no Scenario Mode presets
- 1 Scenario override (no baseline compare)

**Starter:**
- Paper trading: 25 positions, 100 orders/day, 365-day history, daily resets
- SMA 20, SMA 50, Key Levels overlays
- 3 Scenario overrides, baseline compare, deltas, presets

**Pro:**
- Paper trading: 200 positions, 1,000 orders/day, unlimited resets
- All chart overlays
- Real-time regime insights
- Stress testing access
- Portfolio Health widget (sector, concentration, risk score)
- 3 Scenario overrides with full features

**Institutional:**
- All Pro features
- Portfolio Health correlation matrix and granular breakdown
- Scenario Mode export and custom labels
- Real-time data, no delay

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
};

// =============================================================================
// Glossary (Quick Definitions)
// =============================================================================

export const GLOSSARY: KBGlossaryTerm[] = [
  { term: 'Alpha', aliases: ['alpha'], definition: 'Returns above a benchmark, often attributed to skill', category: 'analytics' },
  { term: 'Beta', aliases: ['beta'], definition: 'Measure of volatility relative to the market; Beta > 1 = more volatile than market', category: 'risk' },
  { term: 'Breadth Score', aliases: ['breadth', 'market breadth'], definition: 'Proportion of market components participating in the current trend (0–1); higher = broader participation', category: 'analytics' },
  { term: 'Calmar Ratio', definition: 'Annualized return divided by maximum drawdown; higher is better', category: 'analytics' },
  { term: 'Confidence Score', definition: 'In SSB regime analysis, the degree to which all indicators agree on the current regime classification (0–100%)', category: 'analytics' },
  { term: 'Correlation', aliases: ['correlation coefficient'], definition: 'Statistical measure of how two assets move together (-1 = opposite, 0 = independent, +1 = identical)', category: 'risk' },
  { term: 'Correlation Matrix', definition: 'Grid showing pairwise correlation between all portfolio positions; useful for assessing diversification', category: 'risk' },
  { term: 'CVaR', aliases: ['cvar', 'expected shortfall', 'conditional var'], definition: 'Conditional Value at Risk — the average loss in the worst-case tail beyond the VaR threshold', category: 'risk' },
  { term: 'Diversification', definition: 'Spreading investments across uncorrelated assets to reduce concentration risk', category: 'risk' },
  { term: 'Drawdown', aliases: ['dd', 'mdd', 'max drawdown'], definition: 'Peak-to-trough decline in portfolio value; maximum drawdown is the largest such decline historically', category: 'risk' },
  { term: 'Ensemble Model', definition: 'A model that combines multiple independent signals or classifiers to produce a more robust output', category: 'analytics' },
  { term: 'ETF', definition: 'Exchange-Traded Fund — a basket of securities trading like a stock', category: 'trading' },
  { term: 'Hedging', definition: 'Taking offsetting positions to reduce exposure to a specific risk', category: 'risk' },
  { term: 'Liquidity', definition: 'How easily an asset can be bought or sold without materially affecting its price', category: 'trading' },
  { term: 'Market Cap', definition: 'Total market value of all outstanding shares of a company', category: 'trading' },
  { term: 'P/E Ratio', definition: 'Price-to-Earnings ratio — a common equity valuation metric', category: 'analytics' },
  { term: 'P&L', aliases: ['pnl', 'pl', 'profit and loss'], definition: 'Profit and Loss — the net gain or loss on a position or account', category: 'trading' },
  { term: 'Rebalancing', definition: 'Adjusting portfolio weights back to target allocations after price movements shift them', category: 'trading' },
  { term: 'Regime Classification', aliases: ['regime label'], definition: 'The category assigned to the current market environment by SSB\'s ensemble model (e.g., Bull, Bear, Sideways, High Volatility)', category: 'analytics' },
  { term: 'Sharpe Ratio', definition: 'Risk-adjusted return measure: annualized excess return divided by annualized standard deviation; higher is better', category: 'analytics' },
  { term: 'Slippage', definition: 'Difference between the expected execution price and the actual fill price', category: 'trading' },
  { term: 'Sortino Ratio', definition: 'Like Sharpe but only penalizes downside volatility, not upside; higher is better', category: 'analytics' },
  { term: 'Spread', definition: 'Difference between the best bid and ask prices at any moment', category: 'trading' },
  { term: 'SMA', aliases: ['simple moving average', 'moving average'], definition: 'Simple Moving Average — the arithmetic mean of closing prices over N periods', category: 'analytics' },
  { term: 'Trend Score', aliases: ['trend'], definition: 'In SSB, a composite signal (-1 to +1) measuring price trend direction and momentum across multiple timeframes', category: 'analytics' },
  { term: 'VaR', aliases: ['value at risk'], definition: 'Value at Risk — the potential loss threshold at a given confidence level (e.g., 95%) over a defined time horizon', category: 'risk' },
  { term: 'VIX', aliases: ['vix', 'volatility index', 'fear index'], definition: 'CBOE Volatility Index — measures expected 30-day volatility of the S&P 500; above 30 = high fear, below 20 = calm', category: 'risk' },
  { term: 'Volatility', aliases: ['vol', 'historical volatility'], definition: 'Measure of how much prices fluctuate over time; annualized standard deviation of returns', category: 'risk' },
  { term: 'Volatility Percentile', definition: 'In SSB, where current realized volatility ranks relative to its historical distribution (0 = lowest ever, 100 = highest ever)', category: 'analytics' },
  { term: 'Yield', definition: 'Income return on an investment, expressed as a percentage of its price', category: 'analytics' },
  { term: 'Yield Curve', aliases: ['yield curve slope', '10y-2y', 'treasury spread'], definition: 'The spread between long-term (10Y) and short-term (2Y) Treasury yields; positive = normal, negative (inverted) = historically associated with economic slowdowns', category: 'analytics' },
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
};

/**
 * Get quick prompts for a specific page.
 */
export function getPagePrompts(page: PageScope): string[] {
  return PAGE_PROMPTS[page] || PAGE_PROMPTS.global;
}

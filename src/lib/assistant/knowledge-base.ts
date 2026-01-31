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
  | 'billing';

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
    keywords: ['market regime', 'bull', 'bear', 'trend', 'conditions'],
    aliases: ['market state', 'market mood', 'market phase'],
    pageScopes: ['global', 'regime', 'dashboard'],
    content: {
      definition: `**Market Regime** refers to the current state or "mood" of the market.

**Common Regimes:**
- **Bull Market**: Rising prices, positive sentiment
- **Bear Market**: Falling prices, negative sentiment
- **Ranging/Sideways**: No clear direction
- **High Volatility**: Large price swings
- **Low Volatility**: Calm markets

**How SSB Analyzes Regimes:**
- Price trend analysis (moving averages, momentum)
- Volatility measurements (VIX levels)
- Breadth indicators
- Macro factors`,
      how_to: `**Using Regime Insights:**

1. Go to **Market Regime** page
2. View current regime classification
3. See historical regime changes
4. Consider regime when analyzing strategies

**Why It Matters:**
Different strategies work in different regimes:
- Trend-following in trending markets
- Mean reversion in ranging markets`,
    },
    relatedTopics: ['volatility', 'risk_analytics', 'backtesting'],
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
    keywords: ['plan', 'tier', 'subscription', 'free', 'starter', 'pro', 'upgrade'],
    aliases: ['pricing', 'membership', 'account type'],
    pageScopes: ['global', 'settings', 'billing', 'paper'],
    content: {
      definition: `**SSB Subscription Tiers** determine your feature access and limits.

**Free Tier:**
- Basic risk analytics
- Paper trading: 5 positions, 10 orders/day
- 30-day history, 1 reset/week
- SMA 20 overlay only

**Starter ($9/month):**
- 25 positions, 100 orders/day
- 365-day history, daily resets
- SMA 20, SMA 50, Key Levels overlays

**Pro ($29/month):**
- Real-time regime insights
- Stress testing access
- 200 positions, 1000 orders/day
- All chart overlays

**Founder/Institutional:**
- All features unlimited
- Priority support`,
      how_to: `**Managing Your Subscription:**

1. Go to **Settings** → **Billing**
2. View your current plan
3. Click **Upgrade** to change tiers
4. Manage payment methods

**Upgrading:**
- Changes take effect immediately
- Pro-rated billing for upgrades
- Can downgrade anytime`,
      troubleshoot: `**Subscription Issues:**

**"Feature not available":**
- Check if feature requires higher tier
- Upgrade if needed

**"Limit reached":**
- Free/Starter tiers have limits
- Wait for reset or upgrade

**Billing issues:**
- Check payment method in Settings
- Contact support if charges failed`,
    },
    relatedTopics: ['paper_trading', 'what_is_ssb'],
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
};

// =============================================================================
// Glossary (Quick Definitions)
// =============================================================================

export const GLOSSARY: KBGlossaryTerm[] = [
  { term: 'Alpha', aliases: ['alpha'], definition: 'Returns above a benchmark, often attributed to skill', category: 'analytics' },
  { term: 'Beta', aliases: ['beta'], definition: 'Measure of volatility relative to the market', category: 'risk' },
  { term: 'Correlation', definition: 'Statistical measure of how two assets move together', category: 'risk' },
  { term: 'Diversification', definition: 'Spreading investments to reduce risk', category: 'risk' },
  { term: 'Drawdown', aliases: ['dd', 'mdd'], definition: 'Peak-to-trough decline in portfolio value', category: 'risk' },
  { term: 'ETF', definition: 'Exchange-Traded Fund - basket of securities trading like a stock', category: 'trading' },
  { term: 'Hedging', definition: 'Taking positions to offset potential losses', category: 'risk' },
  { term: 'Liquidity', definition: 'How easily an asset can be bought/sold without affecting price', category: 'trading' },
  { term: 'Market Cap', definition: 'Total market value of a company\'s shares', category: 'trading' },
  { term: 'P/E Ratio', definition: 'Price-to-Earnings ratio - valuation metric', category: 'analytics' },
  { term: 'P&L', aliases: ['pnl', 'pl', 'profit and loss'], definition: 'Profit and Loss - money made or lost', category: 'trading' },
  { term: 'Rebalancing', definition: 'Adjusting portfolio to maintain target allocation', category: 'trading' },
  { term: 'Sharpe Ratio', definition: 'Risk-adjusted return measure (return per unit of risk)', category: 'analytics' },
  { term: 'Slippage', definition: 'Difference between expected and actual execution price', category: 'trading' },
  { term: 'Spread', definition: 'Difference between bid and ask prices', category: 'trading' },
  { term: 'SMA', aliases: ['simple moving average'], definition: 'Simple Moving Average - average price over N periods', category: 'analytics' },
  { term: 'VaR', aliases: ['value at risk'], definition: 'Value at Risk - potential loss at a confidence level', category: 'risk' },
  { term: 'Volatility', aliases: ['vol'], definition: 'Measure of price fluctuation over time', category: 'risk' },
  { term: 'Yield', definition: 'Income return on an investment', category: 'analytics' },
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
};

/**
 * Get quick prompts for a specific page.
 */
export function getPagePrompts(page: PageScope): string[] {
  return PAGE_PROMPTS[page] || PAGE_PROMPTS.global;
}

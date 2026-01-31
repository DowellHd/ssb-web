/**
 * SSB Assistant Knowledge Base
 *
 * Local knowledge base for rule-based assistant responses.
 * No external API calls - all responses are deterministic.
 */

export interface KBTopic {
  id: string;
  title: string;
  keywords: string[];
  content: string;
  relatedTopics?: string[];
}

export interface KBGlossaryTerm {
  term: string;
  definition: string;
  category: 'risk' | 'trading' | 'analytics' | 'platform';
}

// =============================================================================
// Core Topics
// =============================================================================

export const TOPICS: Record<string, KBTopic> = {
  what_is_ssb: {
    id: 'what_is_ssb',
    title: 'What is SSB?',
    keywords: ['ssb', 'smart strategies', 'what is', 'about', 'platform', 'overview'],
    content: `**Smart Strategies Builder (SSB)** is an educational platform for understanding market dynamics and portfolio risk.

**Key Features:**
- **Market Regime Analysis**: Understand whether markets are in bull, bear, or ranging conditions
- **Risk Analytics**: Calculate VaR, volatility, and drawdown metrics
- **Backtesting**: Test investment hypotheses against historical data
- **Paper Trading**: Practice with simulated portfolios (no real money)
- **Stress Testing**: See how portfolios might perform in crisis scenarios

SSB is designed for education and research. It does not execute real trades or provide personalized financial advice.`,
    relatedTopics: ['market_regime', 'risk_analytics', 'backtesting', 'paper_trading'],
  },

  market_regime: {
    id: 'market_regime',
    title: 'Market Regime Analysis',
    keywords: ['regime', 'bull', 'bear', 'market', 'trend', 'ranging', 'conditions', 'state'],
    content: `**Market Regime** refers to the current state or "mood" of the market.

**Common Regimes:**
- **Bull Market**: Generally rising prices, positive sentiment, expanding valuations
- **Bear Market**: Generally falling prices, negative sentiment, contracting valuations
- **Ranging/Sideways**: No clear direction, prices oscillate within a range
- **High Volatility**: Large price swings in either direction
- **Low Volatility**: Calm markets with small price movements

**How SSB Analyzes Regimes:**
SSB uses multiple indicators including:
- Price trend analysis (moving averages, momentum)
- Volatility measurements (VIX levels, realized volatility)
- Breadth indicators (advance/decline ratios)
- Macro factors (yield curve, economic data)

**Why It Matters:**
Different investment strategies perform differently in different regimes. Understanding the current regime can help you make more informed decisions about risk management.`,
    relatedTopics: ['risk_analytics', 'volatility', 'stress_testing'],
  },

  risk_var: {
    id: 'risk_var',
    title: 'Value at Risk (VaR)',
    keywords: ['var', 'value at risk', 'risk measure', 'loss', 'confidence', 'percentile'],
    content: `**Value at Risk (VaR)** measures the potential loss in a portfolio over a specific time period at a given confidence level.

**Example:**
"A 1-day 95% VaR of $10,000" means there's a 95% probability that you won't lose more than $10,000 in a single day.

**Key Components:**
- **Time Horizon**: How far ahead (1 day, 1 week, etc.)
- **Confidence Level**: Typically 95% or 99%
- **Portfolio Value**: The total value being analyzed

**Limitations:**
- VaR doesn't tell you how bad losses could be beyond the threshold
- Assumes normal market conditions (may underestimate tail risks)
- Historical VaR relies on past data which may not predict future

**SSB calculates VaR using:**
- Historical simulation (based on actual past returns)
- Parametric methods (assuming normal distribution)

VaR is one tool among many - always consider multiple risk metrics.`,
    relatedTopics: ['risk_analytics', 'volatility', 'drawdown'],
  },

  volatility: {
    id: 'volatility',
    title: 'Volatility',
    keywords: ['volatility', 'vol', 'vix', 'standard deviation', 'price swings', 'risk'],
    content: `**Volatility** measures how much prices fluctuate over time.

**Types of Volatility:**
- **Historical/Realized Volatility**: Measured from past price data
- **Implied Volatility**: Derived from option prices (forward-looking)
- **VIX**: The "fear index" - measures expected S&P 500 volatility

**Interpretation:**
- **High Volatility**: Large price swings, more uncertainty, higher risk
- **Low Volatility**: Smaller price movements, calmer markets

**Why It Matters:**
- Affects position sizing decisions
- Impacts option pricing
- Indicates market stress levels
- Helps set appropriate stop-losses

**SSB Volatility Metrics:**
- Annualized volatility (standard deviation of returns)
- Rolling volatility (changes over time)
- Volatility percentile (compared to history)

Remember: Volatility is not the same as direction. Markets can be volatile while going up, down, or sideways.`,
    relatedTopics: ['risk_var', 'risk_analytics', 'market_regime'],
  },

  drawdown: {
    id: 'drawdown',
    title: 'Drawdown',
    keywords: ['drawdown', 'max drawdown', 'peak', 'trough', 'decline', 'recovery'],
    content: `**Drawdown** measures the decline from a peak to a trough before a new peak is reached.

**Key Metrics:**
- **Maximum Drawdown**: The largest peak-to-trough decline in history
- **Current Drawdown**: How far below the most recent peak
- **Recovery Time**: How long it took to return to the previous peak

**Example:**
If a portfolio reached $100,000, then fell to $80,000, the drawdown is 20% (or $20,000).

**Why It Matters:**
- Helps set realistic expectations
- Important for risk budgeting
- Measures strategy resilience
- Required for calculating risk-adjusted returns (Calmar ratio)

**Historical Context:**
- 2008 Financial Crisis: S&P 500 max drawdown ~57%
- COVID Crash (2020): ~34% in about a month
- Dot-com Bust (2000-2002): ~49%

Understanding drawdowns helps you prepare mentally and financially for inevitable market declines.`,
    relatedTopics: ['risk_analytics', 'stress_testing', 'backtesting'],
  },

  stress_testing: {
    id: 'stress_testing',
    title: 'Stress Testing',
    keywords: ['stress test', 'stress', 'scenario', 'crisis', 'shock', 'what if'],
    content: `**Stress Testing** simulates how a portfolio might perform under extreme market conditions.

**Types of Stress Tests:**
- **Historical Scenarios**: Replay past crises (2008, COVID, etc.)
- **Hypothetical Scenarios**: Custom "what-if" scenarios
- **Sensitivity Analysis**: Impact of specific factor changes

**SSB Stress Test Scenarios:**
- 2008 Financial Crisis
- COVID-19 Market Crash
- Dot-com Bubble Burst
- Interest Rate Shock
- Currency Crisis

**What You Learn:**
- Portfolio vulnerability to specific risks
- Correlated losses across positions
- Potential worst-case scenarios
- Areas that may need hedging

**Limitations:**
- Past crises may not predict future ones
- Actual crises may be worse than simulated
- Model assumptions affect results

Stress testing is about preparation, not prediction. It helps you understand risks before they materialize.`,
    relatedTopics: ['risk_analytics', 'drawdown', 'market_regime'],
  },

  backtesting: {
    id: 'backtesting',
    title: 'Backtesting',
    keywords: ['backtest', 'historical', 'strategy', 'testing', 'simulation', 'past performance'],
    content: `**Backtesting** tests an investment strategy against historical data to see how it would have performed.

**How It Works:**
1. Define your strategy rules
2. Apply those rules to historical data
3. Calculate hypothetical returns and risk metrics
4. Analyze results

**SSB Backtesting Features:**
- Deterministic calculations (same inputs = same outputs)
- Transaction cost modeling
- Risk-adjusted return metrics
- Drawdown analysis

**Important Limitations:**
- **Past ≠ Future**: Historical performance doesn't guarantee future results
- **Overfitting Risk**: Strategies optimized for the past may fail in the future
- **Survivorship Bias**: Historical data may exclude failed companies
- **Execution Gaps**: Real trading faces slippage and timing differences

**Best Practices:**
- Use out-of-sample testing
- Account for realistic costs
- Be skeptical of perfect results
- Consider multiple market regimes

Backtesting is for learning and hypothesis testing, not for predicting future returns.`,
    relatedTopics: ['paper_trading', 'risk_analytics', 'strategy_overview'],
  },

  paper_trading: {
    id: 'paper_trading',
    title: 'Paper Trading',
    keywords: ['paper', 'simulated', 'practice', 'virtual', 'fake money', 'demo', 'sandbox'],
    content: `**Paper Trading** is simulated trading using virtual money - no real funds at risk.

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

**Tier Limits:**
- **Free**: 5 positions, 10 orders/day, 30-day history
- **Starter**: 25 positions, 100 orders/day, 365-day history
- **Pro**: 200 positions, 1000 orders/day, 10-year history

**Important Notes:**
- No real money is involved
- Fills may differ from live markets
- Emotions differ when real money isn't at stake
- Paper profits don't equal real profits

Paper trading is an excellent learning tool, but remember that real trading involves additional psychological and execution challenges.`,
    relatedTopics: ['backtesting', 'entitlements', 'risk_analytics'],
  },

  entitlements: {
    id: 'entitlements',
    title: 'Plans & Entitlements',
    keywords: ['tier', 'plan', 'subscription', 'free', 'starter', 'pro', 'limits', 'upgrade'],
    content: `**SSB Subscription Tiers** determine your access to features and limits.

**Free Tier:**
- Basic risk analytics
- Delayed regime insights (1 day)
- Paper trading: 5 positions, 10 orders/day
- 30-day history retention
- 1 weekly account reset

**Starter Tier ($9/month):**
- Enhanced paper trading limits
- 25 positions, 100 orders/day
- 365-day history
- Daily account resets
- 3 portfolios

**Pro Tier ($29/month):**
- Real-time regime insights
- Advanced risk analytics
- Stress testing access
- 200 positions, 1000 orders/day
- 10-year history
- Unlimited resets
- 10 portfolios

**Founder/Institutional:**
- All features unlocked
- Unlimited limits
- Priority support

Upgrade through the Billing page in your account settings.`,
    relatedTopics: ['paper_trading', 'what_is_ssb'],
  },

  strategy_overview: {
    id: 'strategy_overview',
    title: 'Investment Strategies Overview',
    keywords: ['strategy', 'strategies', 'approach', 'method', 'technique'],
    content: `**Common Investment Strategies** (Educational Overview)

These are general concepts for learning purposes only - not recommendations.

**Buy & Hold:**
- Purchase assets and hold long-term
- Ignores short-term volatility
- Relies on long-term market growth
- Low maintenance, low trading costs

**Dollar-Cost Averaging (DCA):**
- Invest fixed amounts at regular intervals
- Reduces impact of timing decisions
- Smooths out purchase prices over time
- Disciplined, systematic approach

**Trend Following:**
- Attempt to capture extended market moves
- Buy when prices trend up, sell when trending down
- Uses moving averages, momentum indicators
- Works in trending markets, struggles in ranges

**Mean Reversion:**
- Assumes prices return to average over time
- Buy oversold, sell overbought
- Contrarian approach
- Works in ranging markets, struggles in trends

**Important Disclaimers:**
- No strategy guarantees profits
- All strategies have periods of underperformance
- Past performance doesn't predict future results
- Consider your personal risk tolerance and goals
- Consult a qualified financial advisor for personal decisions`,
    relatedTopics: ['backtesting', 'market_regime', 'risk_analytics'],
  },

  risk_analytics: {
    id: 'risk_analytics',
    title: 'Risk Analytics Overview',
    keywords: ['risk', 'analytics', 'metrics', 'measure', 'assessment'],
    content: `**Risk Analytics** helps you understand and quantify investment risks.

**Key Metrics in SSB:**

**Volatility Metrics:**
- Annualized volatility
- Rolling volatility
- Volatility percentile

**Downside Metrics:**
- Value at Risk (VaR)
- Maximum drawdown
- Conditional VaR (CVaR/Expected Shortfall)

**Risk-Adjusted Returns:**
- Sharpe Ratio: Return per unit of total risk
- Sortino Ratio: Return per unit of downside risk
- Calmar Ratio: Return divided by max drawdown

**Correlation Analysis:**
- Asset correlations
- Diversification benefit
- Concentration risk

**Analytics Tiers:**
- **Basic** (Free): Core volatility and drawdown metrics
- **Advanced** (Pro): Full risk suite including stress tests
- **Institutional**: Custom scenarios, API access

Understanding risk is arguably more important than chasing returns. SSB helps you analyze risk so you can make more informed decisions.`,
    relatedTopics: ['risk_var', 'volatility', 'drawdown', 'stress_testing'],
  },
};

// =============================================================================
// Glossary
// =============================================================================

export const GLOSSARY: KBGlossaryTerm[] = [
  { term: 'Alpha', definition: 'Returns above a benchmark, often attributed to skill', category: 'analytics' },
  { term: 'Beta', definition: 'Measure of volatility relative to the market', category: 'risk' },
  { term: 'Correlation', definition: 'Statistical measure of how two assets move together', category: 'risk' },
  { term: 'Diversification', definition: 'Spreading investments to reduce risk', category: 'risk' },
  { term: 'Drawdown', definition: 'Peak-to-trough decline in portfolio value', category: 'risk' },
  { term: 'ETF', definition: 'Exchange-Traded Fund - basket of securities trading like a stock', category: 'trading' },
  { term: 'Hedging', definition: 'Taking positions to offset potential losses', category: 'risk' },
  { term: 'Liquidity', definition: 'How easily an asset can be bought/sold without affecting price', category: 'trading' },
  { term: 'Market Cap', definition: 'Total market value of a company\'s shares', category: 'trading' },
  { term: 'P/E Ratio', definition: 'Price-to-Earnings ratio - valuation metric', category: 'analytics' },
  { term: 'Rebalancing', definition: 'Adjusting portfolio to maintain target allocation', category: 'trading' },
  { term: 'Sharpe Ratio', definition: 'Risk-adjusted return measure (return per unit of risk)', category: 'analytics' },
  { term: 'Slippage', definition: 'Difference between expected and actual execution price', category: 'trading' },
  { term: 'Spread', definition: 'Difference between bid and ask prices', category: 'trading' },
  { term: 'VaR', definition: 'Value at Risk - potential loss at a confidence level', category: 'risk' },
  { term: 'Volatility', definition: 'Measure of price fluctuation over time', category: 'risk' },
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

export const SAFETY_RESPONSE = `I understand you're looking for specific guidance, but I can't provide personalized investment advice or specific buy/sell recommendations.

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

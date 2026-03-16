/**
 * Learn catalog content.
 *
 * All educational content lives here. IDs mirror the backend seed IDs so that
 * API-based progress tracking can reference the same identifiers.
 *
 * CONTENT GUARDRAILS:
 * - Educational only. No investment advice, no trade suggestions.
 * - External links must be from credible, authoritative sources only.
 */

import type {
  CatalogGlossaryTerm,
  CatalogMeta,
  CatalogModule,
  CatalogPath,
} from './catalog';

// ============================================================================
// Modules
// ============================================================================

export const CATALOG_MODULES: CatalogModule[] = [
  {
    id: 'module-001',
    title: 'Introduction to Investing',
    summary:
      'Learn the foundational concepts of investing, including stocks, bonds, and mutual funds.',
    category: 'fundamentals',
    level: 'beginner',
    durationMinutes: 15,
    tierRequired: 'free',
    prereqs: [],
    tags: ['stocks', 'bonds', 'asset classes', 'compounding'],
    sections: [
      { title: 'Why Invest?', summary: 'How investing beats inflation and grows wealth through compounding returns over time.' },
      { title: 'Main Asset Classes', summary: 'Overview of stocks (equities), bonds (fixed income), and cash equivalents — their risk/return profiles and roles in a portfolio.' },
      { title: 'Key Investing Principles', summary: 'Starting early, diversifying, understanding risk, staying disciplined, and committing to continuous learning.' },
    ],
    keyTermIds: ['term-012', 'term-013', 'term-003', 'term-010'],
    learningObjectives: [
      'Explain what investing is and why it matters',
      'Identify the main asset classes (stocks, bonds, cash)',
      'Describe the principle of compound growth',
      'List the core principles of disciplined investing',
    ],
    keyTakeaways: [
      'Investing helps beat inflation and build wealth over time',
      'Main asset classes include stocks, bonds, and cash equivalents',
      'Diversification and discipline are foundational principles',
      'Risk and potential return are positively related',
    ],
    videos: [
      {
        // Khan Academy Finance & Capital Markets — "Introduction to the stock market"
        // Verify ID in browser before removing linkOnly.
        title: 'Introduction to the Stock Market',
        youtubeId: 'F3QpgXBtDeo',
        source: 'Khan Academy',
        durationLabel: '13 min',
        tierRequired: 'free',
        linkOnly: true,
      },
    ],
    externalResources: [
      {
        label: 'Introduction to Investing',
        url: 'https://www.investor.gov/introduction-investing',
        source: 'SEC Investor.gov',
      },
      {
        label: 'Saving and Investing: A Roadmap to Your Financial Security',
        url: 'https://www.investor.gov/sites/investorgov/files/2019-02/saving-and-investing.pdf',
        source: 'SEC Investor.gov',
      },
    ],
    lastUpdated: '2025-10-15',
    content: `# Introduction to Investing

Investing is the act of allocating resources, usually money, with the expectation of generating income or profit over time.

## Why Invest?

1. **Beat Inflation**: Cash loses purchasing power over time due to inflation
2. **Build Wealth**: Compound returns can grow your wealth significantly
3. **Achieve Goals**: Fund retirement, education, or major purchases
4. **Generate Income**: Dividends and interest provide passive income

## Main Asset Classes

### Stocks (Equities)
- Ownership shares in a company
- Potential for capital appreciation and dividends
- Higher risk, higher potential return

### Bonds (Fixed Income)
- Loans to governments or corporations
- Regular interest payments
- Generally lower risk than stocks

### Cash and Cash Equivalents
- Savings accounts, money market funds
- Highest liquidity, lowest return
- Capital preservation

## Key Principles

1. **Start Early**: Time is your greatest asset due to compounding
2. **Diversify**: Don't put all eggs in one basket
3. **Understand Risk**: Higher returns come with higher risk
4. **Stay Disciplined**: Avoid emotional decisions
5. **Keep Learning**: Markets evolve, so should your knowledge`,
  },

  {
    id: 'module-002',
    title: 'Understanding Risk and Return',
    summary:
      'Explore the relationship between risk and return, and learn how to think about risk in a portfolio context.',
    category: 'risk_management',
    level: 'beginner',
    durationMinutes: 20,
    tierRequired: 'free',
    prereqs: ['module-001'],
    tags: ['risk', 'volatility', 'beta', 'drawdown', 'risk tolerance'],
    sections: [
      { title: 'Types of Investment Risk', summary: 'Systematic (market-wide) risk vs. unsystematic (security-specific) risk — what can and cannot be diversified away.' },
      { title: 'Measuring Risk', summary: 'How volatility (standard deviation), beta, and maximum drawdown quantify different dimensions of investment risk.' },
      { title: 'Risk Tolerance', summary: 'How time horizon, financial situation, goals, and emotional temperament shape the appropriate level of risk for an individual.' },
      { title: 'The Risk-Return Spectrum', summary: 'From cash through leveraged instruments — understanding the tradeoff between risk taken and potential return.' },
    ],
    keyTermIds: ['term-005', 'term-002', 'term-014', 'term-001'],
    learningObjectives: [
      'Distinguish between systematic and unsystematic risk',
      'Explain key risk measures: volatility, beta, and maximum drawdown',
      'Describe how time horizon and goals affect risk tolerance',
      'Understand the risk-return spectrum across asset classes',
    ],
    keyTakeaways: [
      'Risk and return are positively correlated',
      'Systematic risk affects all investments; unsystematic risk is security-specific',
      'Volatility, beta, and drawdown are common ways to measure risk',
      'Risk tolerance is personal and depends on time horizon, goals, and temperament',
    ],
    videos: [
      {
        // Khan Academy Finance — "Risk and reward introduction"
        // Verify ID in browser before removing linkOnly.
        title: 'Risk and Reward Introduction',
        youtubeId: 'nqTBE_Qxvyo',
        source: 'Khan Academy',
        durationLabel: '8 min',
        tierRequired: 'free',
        linkOnly: true,
      },
      {
        // Khan Academy Finance — "Variance of returns"
        // Verify ID in browser before removing linkOnly.
        title: 'Variance of Returns and Expected Value',
        youtubeId: 'JNm3M9cqWyc',
        source: 'Khan Academy',
        durationLabel: '10 min',
        tierRequired: 'pro',
        linkOnly: true,
      },
    ],
    externalResources: [
      {
        label: 'Understanding Risk',
        url: 'https://www.finra.org/investors/investing/investing-basics/risk',
        source: 'FINRA',
      },
      {
        label: 'Risk and Return',
        url: 'https://www.khanacademy.org/economics-finance-domain/core-finance/investment-vehicles-tutorial',
        source: 'Khan Academy',
      },
    ],
    relatedFeatures: ['risk', 'dashboard'],
    lastUpdated: '2025-10-18',
    content: `# Understanding Risk and Return

The relationship between risk and return is fundamental to investing. Generally, investments with higher potential returns carry higher risk.

## Types of Investment Risk

### Systematic Risk (Market Risk)
- Affects the entire market
- Cannot be diversified away
- Examples: recessions, interest rate changes, geopolitical events

### Unsystematic Risk (Specific Risk)
- Affects individual companies or sectors
- Can be reduced through diversification
- Examples: management changes, product failures, industry disruptions

## Measuring Risk

### Volatility (Standard Deviation)
- Measures the dispersion of returns
- Higher volatility = more uncertainty

### Beta
- Measures sensitivity to market movements
- Beta > 1: More volatile than the market
- Beta < 1: Less volatile than the market

### Maximum Drawdown
- Largest peak-to-trough decline
- Useful for understanding worst-case historical scenarios

## Factors That Influence Risk Tolerance

1. **Time Horizon**: Longer horizons allow more time to recover from downturns
2. **Financial Situation**: Emergency funds and income stability matter
3. **Goals**: Growth vs. capital preservation
4. **Emotional Capacity**: Ability to stay calm during volatility

## The Risk-Return Spectrum

Lower risk/return ←————————→ Higher risk/return

Cash → Bonds → Balanced → Stocks → Leveraged

The goal is not to avoid risk entirely, but to take appropriate, compensated risk aligned with your objectives.`,
  },

  {
    id: 'module-003',
    title: 'Portfolio Diversification',
    summary:
      'Learn how to build a diversified portfolio and why correlation is the key to effective diversification.',
    category: 'portfolio_theory',
    level: 'beginner',
    durationMinutes: 25,
    tierRequired: 'free',
    prereqs: ['module-001', 'module-002'],
    tags: ['diversification', 'correlation', 'asset allocation', 'rebalancing'],
    sections: [
      { title: 'The Math Behind Diversification', summary: 'How correlation between assets determines the diversification benefit — from perfect positive (+1) to perfect negative (-1) correlation.' },
      { title: 'Levels of Diversification', summary: 'Four dimensions: within asset classes, across asset classes, geographic diversification, and time diversification (dollar-cost averaging).' },
      { title: 'Building a Diversified Portfolio', summary: 'Practical steps: determine asset allocation, diversify within each class using index funds or ETFs, and rebalance periodically.' },
      { title: 'Common Mistakes', summary: 'Over-diversification, false diversification (correlated holdings), home bias, and ignoring correlation changes during market stress.' },
    ],
    keyTermIds: ['term-003', 'term-004', 'term-010', 'term-008'],
    learningObjectives: [
      'Explain why diversification reduces risk',
      'Define correlation and its role in portfolio construction',
      'Describe the four levels of diversification',
      'Understand common diversification mistakes to avoid',
    ],
    keyTakeaways: [
      'Diversification reduces risk by combining assets with low or negative correlation',
      'Diversify across securities, asset classes, geographies, and time',
      'Asset allocation is a primary driver of portfolio risk and return',
      'Periodic rebalancing maintains your target risk level',
    ],
    videos: [
      {
        // Khan Academy Finance — "Diversification"
        // Verify ID in browser before removing linkOnly.
        title: 'Diversification and Portfolio Risk',
        youtubeId: 'R1htiTBqW5s',
        source: 'Khan Academy',
        durationLabel: '7 min',
        tierRequired: 'free',
        linkOnly: true,
      },
      {
        // Khan Academy Finance — "Portfolio possibilities curve"
        // Verify ID in browser before removing linkOnly.
        title: 'Portfolio Possibilities and the Efficient Frontier',
        youtubeId: 'LGYJg-BxeaM',
        source: 'Khan Academy',
        durationLabel: '12 min',
        tierRequired: 'pro',
        linkOnly: true,
      },
    ],
    externalResources: [
      {
        label: 'Diversification: An Important Risk Management Tool',
        url: 'https://www.finra.org/investors/investing/investing-basics/diversification',
        source: 'FINRA',
      },
      {
        label: 'Asset Allocation',
        url: 'https://www.investor.gov/introduction-investing/investing-basics/investment-products/mutual-funds-and-exchange-traded-2',
        source: 'SEC Investor.gov',
      },
    ],
    relatedFeatures: ['dashboard', 'risk'],
    lastUpdated: '2025-10-20',
    content: `# Portfolio Diversification

Diversification is often called the only "free lunch" in investing. By spreading investments across different assets, you can reduce risk without necessarily sacrificing expected returns.

## The Math Behind Diversification

When assets are not perfectly correlated, combining them can reduce overall portfolio volatility.

- **Correlation = +1**: Assets move together perfectly — no diversification benefit
- **Correlation = 0**: No relationship — moderate diversification benefit
- **Correlation = -1**: Assets move in opposite directions — maximum diversification benefit

## Levels of Diversification

### 1. Within Asset Classes
- Multiple stocks across different sectors
- Bonds with various issuers and maturities

### 2. Across Asset Classes
- Stocks, bonds, real estate, commodities
- Each has different risk/return characteristics

### 3. Geographic Diversification
- Domestic and international exposure
- Developed and emerging markets

### 4. Time Diversification
- Regular investing (dollar-cost averaging)
- Reduces the risk of poor market timing

## Building a Diversified Portfolio

**Step 1**: Determine your target asset allocation based on risk tolerance and time horizon.

**Step 2**: Diversify within each asset class — index funds and ETFs provide broad exposure.

**Step 3**: Rebalance periodically (quarterly or annually) to restore target weights.

## Common Mistakes

1. **Over-diversification**: Too many holdings add complexity without meaningful benefit
2. **False diversification**: Holding assets that are highly correlated (e.g., all tech stocks)
3. **Home bias**: Overweighting domestic investments
4. **Ignoring correlation changes**: Correlations can rise sharply during market stress

Diversification does not eliminate risk or guarantee profits, but it is an essential tool for managing portfolio risk responsibly.`,
  },

  {
    id: 'module-004',
    title: 'Introduction to Technical Analysis',
    summary:
      'Understand the foundations of technical analysis, chart types, and key concepts like trends and support/resistance.',
    category: 'technical_analysis',
    level: 'intermediate',
    durationMinutes: 30,
    tierRequired: 'free',
    prereqs: ['module-001'],
    tags: ['charts', 'trends', 'moving averages', 'support', 'resistance', 'candlestick'],
    sections: [
      { title: 'Core Principles', summary: 'Three foundational assumptions: price discounts all information, prices move in trends, and historical patterns recur due to consistent psychology.' },
      { title: 'Types of Charts', summary: 'Line charts, OHLC bar charts, and candlestick charts — what each shows and when to use them.' },
      { title: 'Trends', summary: 'Identifying uptrends (higher highs and lows), downtrends (lower highs and lows), and sideways (range-bound) markets.' },
      { title: 'Support, Resistance, and Moving Averages', summary: 'Price levels where historical buying or selling pressure emerged, and how moving averages smooth noise to reveal underlying direction.' },
    ],
    keyTermIds: ['term-015', 'term-016', 'term-011'],
    learningObjectives: [
      'State the three core principles of technical analysis',
      'Identify common chart types (line, bar, candlestick)',
      'Define uptrend, downtrend, and sideways markets',
      'Explain support, resistance, and moving averages',
    ],
    keyTakeaways: [
      'Technical analysis studies price and volume patterns, not fundamentals',
      'Three principles: price discounts all information, prices trend, patterns recur',
      'Key concepts include chart types, trends, support/resistance, and moving averages',
      'Technical analysis is not predictive with certainty and should be paired with risk management',
    ],
    videos: [
      {
        // Khan Academy Finance — "Technical analysis introduction"
        // Verify ID in browser before removing linkOnly.
        title: 'Technical Analysis: Charts and Patterns',
        youtubeId: 'eynxyoKgpng',
        source: 'Khan Academy',
        durationLabel: '10 min',
        tierRequired: 'free',
        linkOnly: true,
      },
    ],
    externalResources: [
      {
        label: 'Technical Analysis',
        url: 'https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/technical-analysis',
        source: 'CFA Institute',
      },
    ],
    relatedFeatures: ['regime'],
    lastUpdated: '2025-11-01',
    content: `# Introduction to Technical Analysis

Technical analysis is the study of historical price and volume data to understand market behavior. Unlike fundamental analysis, it focuses on *what* the price is doing rather than *why*.

## Core Principles

1. **Price discounts everything**: All known information is reflected in current prices
2. **Prices move in trends**: Markets tend to trend until something changes the trend
3. **History tends to repeat**: Patterns recur due to consistent human psychology

## Types of Charts

### Line Charts
- Shows closing prices only
- Useful for identifying broad trends

### Bar Charts (OHLC)
- Shows Open, High, Low, Close per period
- More data than a line chart

### Candlestick Charts
- Visual OHLC representation
- Body = open-to-close range; wicks = full high/low range
- Widely used for pattern recognition

## Basic Concepts

### Trends
- **Uptrend**: Series of higher highs and higher lows
- **Downtrend**: Series of lower highs and lower lows
- **Sideways**: Range-bound, no clear directional bias

### Support and Resistance
- **Support**: A price level where buying interest has historically emerged
- **Resistance**: A price level where selling pressure has historically appeared
- Once broken, support can become resistance (and vice versa)

### Moving Averages
- Smooth price data to filter noise
- Common periods: 20, 50, 200 days
- Crossovers between short and long MAs are widely watched

## Important Caveats

- Technical analysis is not predictive with certainty
- Works better in liquid, actively traded markets
- Should always be combined with sound risk management
- Past patterns do not guarantee future outcomes`,
  },

  {
    id: 'module-005',
    title: 'Advanced Risk Metrics: VaR and CVaR',
    summary:
      'Deep dive into Value at Risk and Conditional Value at Risk — quantitative tools used in institutional risk management.',
    category: 'risk_management',
    level: 'advanced',
    durationMinutes: 45,
    tierRequired: 'pro',
    prereqs: ['module-002'],
    tags: ['VaR', 'CVaR', 'expected shortfall', 'tail risk', 'Monte Carlo', 'quantitative'],
    sections: [
      { title: 'Value at Risk (VaR)', summary: 'Definition, components (confidence level, time horizon, loss amount), and three calculation methods: historical simulation, parametric, and Monte Carlo.' },
      { title: 'Conditional Value at Risk (CVaR)', summary: 'Also called Expected Shortfall — measures the expected loss beyond the VaR threshold, capturing tail risk that VaR alone misses.' },
      { title: 'Limitations and Best Practices', summary: 'Model risk, distribution assumptions, correlation instability during crises, and how to combine VaR/CVaR with stress testing and other metrics.' },
    ],
    keyTermIds: ['term-006', 'term-007', 'term-005', 'term-009'],
    learningObjectives: [
      'Define Value at Risk (VaR) and its three components',
      'Compare historical simulation, parametric, and Monte Carlo VaR methods',
      'Explain why CVaR (Expected Shortfall) addresses limitations of VaR',
      'Identify the key limitations of both measures',
    ],
    keyTakeaways: [
      'VaR measures the maximum expected loss at a given confidence level over a time period',
      'Three calculation methods: historical simulation, parametric, and Monte Carlo',
      'CVaR (Expected Shortfall) captures tail risk beyond the VaR threshold',
      'Both measures have limitations and should be used alongside other risk tools',
    ],
    videos: [
      {
        // MIT OpenCourseWare / lecture on VaR — verify ID in browser before removing linkOnly.
        title: 'Value at Risk (VaR) Explained',
        youtubeId: 'T9kH9VZimxc',
        source: 'MIT OpenCourseWare',
        durationLabel: '15 min',
        tierRequired: 'pro',
        linkOnly: true,
      },
    ],
    externalResources: [
      {
        label: 'Risk Management (CFA Level I)',
        url: 'https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/risk-management-an-introduction',
        source: 'CFA Institute',
      },
      {
        label: 'Value at Risk — Federal Reserve',
        url: 'https://www.federalreserve.gov/pubs/feds/1997/199706/199706pap.pdf',
        source: 'Federal Reserve',
      },
    ],
    relatedFeatures: ['risk'],
    lastUpdated: '2025-11-10',
    content: `# Advanced Risk Metrics: VaR and CVaR

Value at Risk (VaR) and Conditional Value at Risk (CVaR) are quantitative tools used by professional investors and institutions to assess potential portfolio losses.

## Value at Risk (VaR)

VaR answers: *What is the maximum loss at a given confidence level over a specific time period?*

### Components
1. **Confidence Level**: Typically 95% or 99%
2. **Time Horizon**: Usually 1 day, 10 days, or 1 month
3. **Loss Threshold**: The dollar or percentage amount

### Calculation Methods

**Historical Simulation**
- Uses actual historical returns
- No distributional assumptions
- Simple but requires sufficient historical data

**Parametric (Variance-Covariance)**
- Assumes normally distributed returns
- VaR = μ − (z × σ)
- Computationally efficient but can underestimate tail risk

**Monte Carlo Simulation**
- Generates thousands of hypothetical scenarios
- Can model complex, non-normal distributions
- Most flexible; computationally intensive

### Example
A 95% 1-day VaR of $100,000 means: there is a 5% chance of losing more than $100,000 in a single day.

## Conditional Value at Risk (CVaR)

Also called *Expected Shortfall*, CVaR measures the expected loss given that losses already exceed the VaR threshold.

### Why CVaR?
- VaR tells you the *threshold* but not how bad losses get beyond it
- CVaR captures tail risk more fully
- CVaR is a "coherent" risk measure — it satisfies mathematical properties VaR does not

### Example
If 95% VaR = $100,000 and CVaR = $150,000: when losses exceed VaR, expect to lose approximately $150,000 on average.

## Limitations

1. **VaR can be gamed**: Portfolio restructuring can appear to reduce VaR while concentrating tail risk
2. **Model risk**: Wrong distributional assumptions produce wrong estimates
3. **Not predictive**: Based on historical data that may not reflect future conditions
4. **Correlation instability**: Asset correlations often increase during crises, worsening actual losses

## Best Practices

- Use multiple methods for cross-validation
- Stress test beyond VaR using severe historical scenarios
- Combine VaR/CVaR with other risk measures (beta, drawdown, factor exposures)
- Backtest models regularly against realized outcomes`,
  },

  {
    id: 'module-006',
    title: 'Market Regimes and Adaptive Thinking',
    summary:
      'Learn how to identify distinct market regimes and understand why market behavior changes across different environments.',
    category: 'market_mechanics',
    level: 'advanced',
    durationMinutes: 40,
    tierRequired: 'pro',
    prereqs: ['module-002', 'module-004'],
    tags: ['regimes', 'volatility', 'trend', 'VIX', 'market cycle', 'adaptive'],
    sections: [
      { title: 'What Is a Market Regime?', summary: 'A regime is a period with stable statistical properties: trend direction, volatility level, correlation patterns, and return distribution shape.' },
      { title: 'Common Regime Classifications', summary: 'Trend-based (bull/bear/range-bound), volatility-based (low/high/clustered), and economic cycle-based (expansion/peak/contraction/trough).' },
      { title: 'Regime Detection Indicators', summary: 'Trend signals (moving averages, ADX, breadth), volatility signals (VIX, historical percentile, ATR), and macro signals (yield curve, credit spreads).' },
      { title: 'Caveats and Limitations', summary: 'Regimes are identified in hindsight, transitions can be sudden and unpredictable, and past regimes do not repeat exactly.' },
    ],
    keyTermIds: ['term-011', 'term-012', 'term-013', 'term-005', 'term-014'],
    learningObjectives: [
      'Define what a market regime is and how regimes are categorized',
      'Identify indicators used to characterize different regime environments',
      'Explain how volatility clustering affects portfolio behavior',
      'Describe why regime detection is imperfect and transitions can be sudden',
    ],
    keyTakeaways: [
      'Market regimes are distinct periods with specific statistical properties',
      'Common classifications include trend-based, volatility-based, and economic cycle-based',
      'Indicators like VIX, yield curves, and moving averages help characterize current conditions',
      'Regime detection is inherently imperfect — transitions can be abrupt and unpredictable',
    ],
    externalResources: [
      {
        label: 'Business Cycle Basics',
        url: 'https://www.federalreserve.gov/releases/g17/',
        source: 'Federal Reserve',
      },
      {
        label: 'Market Volatility — FINRA',
        url: 'https://www.finra.org/investors/investing/investing-basics/market-volatility',
        source: 'FINRA',
      },
    ],
    videos: [
      {
        // Khan Academy Finance — "Market Regimes" / economic cycles
        // Verify ID in browser before removing linkOnly.
        title: 'Economic Cycles and Market Behavior',
        youtubeId: 'PHe0bXAIuk0',
        source: 'Khan Academy',
        durationLabel: '12 min',
        tierRequired: 'pro',
        linkOnly: true,
      },
    ],
    relatedFeatures: ['regime', 'risk'],
    lastUpdated: '2025-11-15',
    content: `# Market Regimes and Adaptive Thinking

Markets don't behave uniformly over time. Understanding how to characterize distinct market environments — or "regimes" — helps investors reason about risk more clearly.

## What Is a Market Regime?

A regime is a period characterized by relatively stable statistical properties:
- Trend direction and strength
- Volatility level and clustering
- Correlation patterns across assets
- Return distribution shape (normal vs. fat-tailed)

## Common Regime Classifications

### By Trend
- **Bull Market**: Sustained upward trend, strong breadth
- **Bear Market**: Sustained downward trend, weak breadth
- **Range-bound**: No clear directional bias

### By Volatility
- **Low Volatility**: Calm markets, small daily moves, compressed VIX
- **High Volatility**: Elevated uncertainty, large daily swings, elevated VIX
- **Volatility Clustering**: Calm and turbulent periods tend to cluster together

### By Economic Cycle
- **Expansion**: GDP growth, rising employment, improving earnings
- **Peak**: Maximum activity, early signs of overheating
- **Contraction**: Declining activity, rising unemployment
- **Trough**: Bottom of cycle, early signals of recovery

## Indicators Used to Characterize Regimes

### Trend Signals
- Price relative to 200-day moving average
- ADX (Average Directional Index) — trend strength
- Breadth indicators (advance/decline lines)

### Volatility Signals
- VIX level and term structure
- Historical volatility percentile
- ATR (Average True Range)

### Macro Signals
- Yield curve shape (flat, steep, inverted)
- Credit spreads (investment grade vs. high yield)
- Leading economic indicators

## Why Regime Awareness Matters

Different environments behave differently. Strategies that work well in calm, trending markets may not work as intended during high-stress, correlation-breakdown environments.

Understanding the characteristics of different regimes helps frame questions like:
- How has this type of environment behaved historically?
- What risk measures are most relevant right now?
- Are current conditions consistent with historical analogues?

## Important Caveats

1. **Regimes are identified in hindsight**: Real-time detection is inherently uncertain
2. **Transitions can be sudden**: Regimes do not announce themselves
3. **Past regimes don't repeat exactly**: Each cycle has unique features
4. **No single indicator is sufficient**: Combine multiple signals for a clearer picture

This framework is for developing market literacy, not for making directional predictions.`,
  },

  // ── Expansion modules ──────────────────────────────────────────────────────

  {
    id: 'module-007',
    title: 'Long-Term Investing and Buy-and-Hold',
    summary:
      'Understand the philosophy and evidence behind long-term, buy-and-hold investing and why staying invested matters.',
    category: 'fundamentals',
    level: 'beginner',
    durationMinutes: 20,
    tierRequired: 'free',
    prereqs: ['module-001'],
    tags: ['buy and hold', 'compounding', 'long-term', 'patience', 'equity returns'],
    sections: [
      {
        title: 'Time in Market vs. Timing the Market',
        summary:
          'Historical evidence shows that missing a small number of the market\'s best days dramatically reduces long-term returns, making consistent participation more important than perfect timing.',
      },
      {
        title: 'The Power of Compounding Over Decades',
        summary:
          'How small differences in annual return compound into large wealth gaps over 20–40 year horizons, and why starting early outweighs starting with more money.',
      },
      {
        title: 'Staying Invested Through Market Cycles',
        summary:
          'Historical context for bear markets, typical recovery timelines, and the behavioral challenge of holding through drawdowns.',
      },
    ],
    keyTermIds: ['term-026', 'term-027', 'term-012', 'term-013'],
    learningObjectives: [
      'Explain why "time in the market" generally outperforms market timing',
      'Quantify the impact of missing the best market days on long-term returns',
      'Describe how compound growth amplifies small return differences over decades',
      'Articulate the behavioral challenges of holding through bear markets',
    ],
    keyTakeaways: [
      'Consistent long-term participation typically beats attempting to time the market',
      'Compound growth means starting early matters more than starting with a larger sum',
      'Bear markets are historically temporary; patience is a structural advantage',
      'Transaction costs and taxes from frequent trading reduce net returns',
    ],
    externalResources: [
      {
        label: 'Long-Term Investing Basics',
        url: 'https://www.investor.gov/introduction-investing/getting-started/start-save-early',
        source: 'SEC Investor.gov',
      },
      {
        label: 'The Costs of Jumping In and Out of Markets',
        url: 'https://www.finra.org/investors/investing/investing-basics/buy-and-hold',
        source: 'FINRA',
      },
    ],
    relatedFeatures: ['dashboard'],
    lastUpdated: '2025-12-01',
    content: `# Long-Term Investing and Buy-and-Hold

One of the most well-supported findings in investment research is that long-term, disciplined participation in markets has historically delivered better outcomes than frequent trading or market timing.

## Time in the Market vs. Timing the Market

A widely cited analysis of the S&P 500 shows that missing only the 10 best trading days over a 20-year period can cut returns roughly in half. Since the best days often cluster near periods of maximum fear and volatility, investors who exit during downturns frequently miss the recovery.

The implication: **consistent participation matters more than finding the perfect entry or exit point**.

## The Power of Compounding Over Decades

Compounding is the process of earning returns on previously earned returns. The effect is non-linear:

| Years | $10,000 at 7% annualized |
|-------|--------------------------|
| 10    | ~$19,700                 |
| 20    | ~$38,700                 |
| 30    | ~$76,100                 |
| 40    | ~$149,700                |

Key insight: **the last 10 years contribute more absolute dollars than the first 30 years combined**.

Starting 10 years earlier with the same amount produces more wealth than doubling your initial investment at the original start date.

## Historical Equity Returns

Over very long horizons (50+ years), global equity markets have generally delivered positive real (inflation-adjusted) returns. U.S. large-cap equities have returned approximately 7% annually in real terms over the 20th and early 21st centuries — though with significant year-to-year and decade-to-decade variation.

**Important**: Historical averages do not guarantee future results. Individual country and sector returns vary widely.

## Staying Invested Through Market Cycles

Bear markets (20%+ declines from peak) are a normal feature of equity investing:
- They occur roughly every 3–5 years on average
- The median bear market duration has been roughly 1–2 years
- Markets have historically reached new highs following every prior bear market

The primary challenge is **behavioral**: selling during panic crystallizes losses and risks missing the recovery.

## Key Principles

1. **Define your time horizon**: The longer your horizon, the more appropriate equity exposure tends to be
2. **Automate contributions**: Dollar-cost averaging removes the temptation to time purchases
3. **Minimize friction**: Low-cost index funds reduce the drag of fees and active management
4. **Review, don't react**: Regular reviews are healthy; reactive changes based on headlines are not

Long-term investing is not passive inattention — it is active discipline applied to a principled strategy.`,
  },

  {
    id: 'module-008',
    title: 'Dollar-Cost Averaging',
    summary:
      'Learn how investing fixed amounts at regular intervals reduces timing risk and builds disciplined saving habits.',
    category: 'fundamentals',
    level: 'beginner',
    durationMinutes: 15,
    tierRequired: 'free',
    prereqs: ['module-001'],
    tags: ['DCA', 'dollar-cost averaging', 'systematic investing', 'regular investing', 'timing'],
    sections: [
      {
        title: 'How DCA Works',
        summary:
          'Investing a fixed dollar amount at regular intervals — weekly, monthly, or per paycheck — regardless of market price level.',
      },
      {
        title: 'DCA vs. Lump-Sum Investing',
        summary:
          'Lump-sum investing has historically outperformed DCA when markets trend upward, but DCA wins in volatile, declining, or sideways markets — and is more practical for most investors.',
      },
      {
        title: 'Psychological and Practical Benefits',
        summary:
          'DCA removes the anxiety of timing, fits naturally with regular income, and enforces saving discipline through automation.',
      },
    ],
    keyTermIds: ['term-023', 'term-026', 'term-024'],
    learningObjectives: [
      'Define dollar-cost averaging and explain how it works mechanically',
      'Compare DCA and lump-sum investing across different market environments',
      'Describe the psychological benefits of systematic investing',
      'Explain when DCA provides the most benefit relative to lump-sum',
    ],
    keyTakeaways: [
      'DCA invests a fixed amount at regular intervals regardless of market price',
      'In volatile or declining markets, DCA lowers average purchase cost',
      'Lump-sum investing outperforms DCA on average in rising markets',
      'DCA\'s main advantage is behavioral: it removes timing anxiety and builds discipline',
    ],
    externalResources: [
      {
        label: 'Dollar-Cost Averaging',
        url: 'https://www.investor.gov/introduction-investing/investing-basics/investment-products/mutual-funds-and-exchange-traded-2',
        source: 'SEC Investor.gov',
      },
      {
        label: 'Systematic Investment Plans',
        url: 'https://www.finra.org/investors/investing/investing-basics/dollar-cost-averaging',
        source: 'FINRA',
      },
    ],
    relatedFeatures: ['dashboard'],
    lastUpdated: '2025-12-01',
    content: `# Dollar-Cost Averaging

Dollar-cost averaging (DCA) is the practice of investing a fixed dollar amount at regular intervals — weekly, bi-weekly, monthly — regardless of the current market price.

## How DCA Works

**Example**: Investing $500/month in a stock or ETF:

| Month | Price | Shares Purchased | Cumulative Shares |
|-------|-------|-----------------|-------------------|
| Jan   | $50   | 10.0            | 10.0              |
| Feb   | $40   | 12.5            | 22.5              |
| Mar   | $60   | 8.3             | 30.8              |

After investing $1,500 over 3 months:
- Average purchase price: ~$48.60 (lower than the $50 average price)
- Reason: more shares were purchased when the price was lower

## DCA vs. Lump-Sum Investing

Research (including Vanguard's analysis) generally shows:
- **Lump-sum wins ~67% of the time** when markets trend upward — putting all money to work immediately captures early gains
- **DCA wins in volatile, flat, or declining markets** — it avoids investing everything at a peak

For most investors, DCA is not a conscious choice — it's the natural outcome of investing from regular income (paycheck-based contributions).

## The Averaging Effect

When prices fall, your fixed contribution buys *more* shares. When prices rise, it buys *fewer*. Over time, this means your average cost per share is lower than the simple average price during the period.

This is **not** a guarantee of profit — it simply reduces the risk of buying at a single unfortunate moment.

## Practical Implementation

1. **Automate contributions**: Set up recurring transfers to your investment account
2. **Choose a fixed amount**: One you can sustain through market downturns
3. **Stick to the schedule**: Consistency is more important than optimization
4. **Reinvest dividends**: Compounds the effect over time

## Limitations

- Does not protect against long-term declining markets — if an asset falls permanently, DCA just means more shares at successively lower prices
- May underperform a well-timed lump sum in strongly trending markets
- Transaction costs can erode benefits in accounts with per-trade fees`,
  },

  {
    id: 'module-009',
    title: 'ETFs and Index Funds',
    summary:
      'Understand how exchange-traded funds and index funds work, and why low-cost passive investing has compelling evidence behind it.',
    category: 'fundamentals',
    level: 'beginner',
    durationMinutes: 20,
    tierRequired: 'free',
    prereqs: ['module-001'],
    tags: ['ETF', 'index fund', 'passive investing', 'expense ratio', 'diversification', 'S&P 500'],
    sections: [
      {
        title: 'What Is an ETF?',
        summary:
          'An exchange-traded fund is a basket of securities that trades on a stock exchange like a single stock, typically designed to track an index.',
      },
      {
        title: 'How Index Tracking Works',
        summary:
          'Index funds replicate a benchmark (e.g., S&P 500) by holding its constituent securities in proportion to their index weights.',
      },
      {
        title: 'Expense Ratios and Why They Matter',
        summary:
          'The annual fee charged by a fund as a percentage of assets — even small differences in expense ratios compound into large differences over decades.',
      },
      {
        title: 'Passive vs. Active Management',
        summary:
          'Evidence from SPIVA and academic research consistently shows that the majority of active fund managers underperform their benchmark after fees over long periods.',
      },
    ],
    keyTermIds: ['term-021', 'term-022', 'term-025', 'term-038', 'term-003'],
    learningObjectives: [
      'Explain what an ETF is and how it differs from a mutual fund',
      'Describe how index funds track their benchmark index',
      'Calculate the long-term impact of expense ratios on portfolio value',
      'Summarize the evidence on passive vs. active management performance',
    ],
    keyTakeaways: [
      'ETFs trade on exchanges like stocks; index mutual funds are priced once daily',
      'Index funds aim to match benchmark returns minus a small expense ratio',
      'Even 0.5% annual fee difference compounds significantly over 30+ years',
      'The majority of active funds underperform their index benchmark after fees over time',
    ],
    externalResources: [
      {
        label: 'Exchange-Traded Funds — SEC',
        url: 'https://www.sec.gov/investor/pubs/etfs.htm',
        source: 'SEC',
      },
      {
        label: 'Index Funds: A Brief Introduction',
        url: 'https://www.finra.org/investors/investing/investment-products/mutual-funds/index-funds',
        source: 'FINRA',
      },
    ],
    relatedFeatures: ['dashboard'],
    lastUpdated: '2025-12-01',
    content: `# ETFs and Index Funds

Exchange-traded funds (ETFs) and index mutual funds are among the most widely used investment vehicles for individual investors — and for good reason.

## What Is an ETF?

An ETF is a fund that holds a basket of assets (stocks, bonds, commodities) and trades on a stock exchange just like an individual stock. Key characteristics:
- Bought and sold throughout the trading day at market prices
- Usually designed to track an index (e.g., S&P 500, Bloomberg Aggregate)
- Generally low cost compared to actively managed funds
- Transparent — holdings are published daily

**vs. Mutual Fund**: Traditional index mutual funds also track benchmarks, but they price once per day after market close and are purchased directly from the fund company.

## How Index Tracking Works

An index fund replicates a benchmark by holding its constituent securities in proportion to their weights.

**S&P 500 example**: A fund tracking the S&P 500 holds shares of all 500 companies in the index, in proportion to each company's market capitalization. As the index composition changes, the fund rebalances.

**Full replication vs. sampling**: Large indices like the S&P 500 are easy to replicate fully. Broader indices (Russell 3000, global all-country) may use sampling — holding a representative subset to minimize transaction costs.

## Expense Ratios

The expense ratio is the annual fee charged by a fund expressed as a percentage of net assets. It is deducted automatically from fund assets — you never see a direct charge.

**Why it matters over time**:

| Starting value | 30-year return | 0.05% fee | 0.75% fee | Difference |
|---------------|----------------|-----------|-----------|------------|
| $100,000      | 7% gross/year  | ~$728,000 | ~$574,000 | ~$154,000  |

Even a 0.70% difference in fees translates into more than $150,000 over 30 years in this example.

Typical expense ratios:
- Broad market ETFs: 0.03%–0.10%
- Active mutual funds: 0.50%–1.50%+

## Passive vs. Active Management

Multiple long-running studies (SPIVA, Morningstar) consistently find:
- **Over 10 years**: 80–90% of active large-cap U.S. equity funds underperform their benchmark after fees
- **Over 20 years**: The underperformance rate is even higher
- **Survivorship bias**: Many underperforming funds close, making active management appear better than it is in aggregate

This does not mean active management never adds value — it means it is difficult to identify in advance which active managers will outperform.

## Types of ETFs

- **Market-cap weighted**: Standard S&P 500, MSCI World — largest companies have the most weight
- **Equal-weight**: Every holding has the same weight, giving more exposure to smaller companies
- **Factor/Smart Beta**: Tilts toward factors like value, low-volatility, momentum, or quality
- **Sector ETFs**: Focus on specific sectors (technology, healthcare, energy)
- **Bond ETFs**: Government, corporate, municipal, and international fixed income

## Getting Started

For most beginners, a combination of a broad domestic equity ETF and a broad bond ETF (or a single all-in-one balanced ETF) provides instant diversification at minimal cost.`,
  },

  {
    id: 'module-010',
    title: 'Behavioral Finance: Cognitive Biases in Investing',
    summary:
      'Explore the psychological biases that lead investors to make suboptimal decisions, and learn strategies to counteract them.',
    category: 'behavioral_finance',
    level: 'intermediate',
    durationMinutes: 25,
    tierRequired: 'free',
    prereqs: ['module-001'],
    tags: [
      'behavioral finance',
      'loss aversion',
      'confirmation bias',
      'overconfidence',
      'anchoring',
      'herding',
    ],
    sections: [
      {
        title: 'Loss Aversion and Prospect Theory',
        summary:
          'Research by Kahneman and Tversky shows losses are felt approximately twice as intensely as equivalent gains, leading investors to hold losers too long and sell winners too early.',
      },
      {
        title: 'Confirmation Bias and Overconfidence',
        summary:
          'The tendency to seek information that confirms existing beliefs, and to overestimate one\'s ability to predict outcomes — two biases that reinforce each other.',
      },
      {
        title: 'Recency Bias, Herding, and Anchoring',
        summary:
          'Overweighting recent events, following the crowd, and fixating on irrelevant reference prices (like a purchase price) are common distortions that affect both individual and institutional investors.',
      },
      {
        title: 'Strategies to Mitigate Biases',
        summary:
          'Pre-commitment rules, investment policy statements, checklists, and systematic rebalancing are practical tools to reduce the impact of emotional decision-making.',
      },
    ],
    keyTermIds: ['term-029', 'term-030', 'term-031'],
    learningObjectives: [
      'Define loss aversion and explain how it distorts investment decisions',
      'Describe confirmation bias and overconfidence and their consequences',
      'Explain recency bias, herding behavior, and anchoring',
      'List at least three practical strategies to mitigate cognitive biases',
    ],
    keyTakeaways: [
      'Losses hurt approximately twice as much as equivalent gains (loss aversion)',
      'Confirmation bias causes investors to ignore evidence that contradicts their views',
      'Recency bias leads to overweighting recent market performance when forming expectations',
      'Systematic rules and pre-commitment help counteract emotional decision-making',
    ],
    externalResources: [
      {
        label: 'Behavioural Finance — CFA Institute',
        url: 'https://www.cfainstitute.org/en/research/financial-analysts-journal/2015/behavioral-finance-where-do-investors-biases-come-from',
        source: 'CFA Institute',
      },
      {
        label: 'Investor Psychology — FINRA',
        url: 'https://www.finra.org/investors/insights/investor-psychology',
        source: 'FINRA',
      },
    ],
    lastUpdated: '2025-12-01',
    content: `# Behavioral Finance: Cognitive Biases in Investing

Standard financial theory assumes investors behave rationally. Behavioral finance — pioneered by Daniel Kahneman, Amos Tversky, Richard Thaler, and others — documents the systematic ways real investors deviate from rationality.

## Loss Aversion and Prospect Theory

Kahneman and Tversky's Prospect Theory found that **losses are felt approximately twice as intensely as equivalent gains**. A $1,000 loss causes roughly twice the emotional pain as a $1,000 gain provides pleasure.

Practical consequences:
- **Holding losers too long**: Unwillingness to realize a loss ("it'll come back")
- **Selling winners too early**: Locking in gains to feel good, before the thesis plays out
- **Paralysis**: Fear of making a wrong decision leads to doing nothing

The disposition effect — the tendency to sell winners and hold losers — has been documented extensively across retail and institutional investors.

## Confirmation Bias

The tendency to seek, interpret, and remember information that confirms pre-existing beliefs.

**Example**: An investor bullish on a stock reads positive analyst reports, dismisses negative news as "noise," and joins forums populated by other bulls.

Combined with overconfidence — the tendency to overestimate one's ability to predict outcomes — confirmation bias can lead to concentrated, under-researched positions.

## Recency Bias

Overweighting recent events when forming expectations about the future.

After a bull market: investors extrapolate gains and take on more risk.
After a crash: investors extrapolate losses and reduce risk — often near the bottom.

Recency bias is partly why individual investors, on average, earn returns meaningfully below the funds they invest in (due to poorly timed entries and exits).

## Herding Behavior

Following the crowd because it provides psychological comfort and social validation.

- Institutional herding: fund managers invest in the same popular stocks to avoid career risk (underperforming while holding unpopular names)
- Retail herding: buying "hot" investments (meme stocks, trend-following) after social media buzz peaks

Herding can create momentum — and then reversal — as buyers and sellers pile in and out together.

## Anchoring

Fixating on an arbitrary reference price (the "anchor") when making decisions.

**Example**: Refusing to sell a stock at $80 because you paid $100 — even when the fundamental outlook has changed. The purchase price is irrelevant to the current question of whether to hold or sell.

Other anchors: 52-week highs/lows, round numbers, prior portfolio highs.

## Strategies to Mitigate Biases

1. **Investment Policy Statement (IPS)**: Write down your strategy, criteria for buying and selling, and target allocation before emotions are engaged
2. **Pre-commitment rules**: Define sell triggers in advance (e.g., "I will rebalance when any asset class drifts >5% from target")
3. **Decision checklists**: Ask structured questions before making changes: "Has my original thesis changed? What would need to be true for me to sell?"
4. **Seek disconfirming evidence**: Actively look for arguments against your current position
5. **Systematic rebalancing**: Calendar or threshold-based rebalancing removes the emotional element from allocation decisions

Awareness of biases does not eliminate them — but it can create the pause needed to apply a more deliberate process.`,
  },

  {
    id: 'module-011',
    title: 'Drawdowns and Recovery Analysis',
    summary:
      'Learn to measure and interpret portfolio drawdowns, understand historical recovery periods, and use this knowledge to set realistic expectations.',
    category: 'risk_management',
    level: 'intermediate',
    durationMinutes: 30,
    tierRequired: 'pro',
    prereqs: ['module-002'],
    tags: ['drawdown', 'recovery', 'underwater', 'max drawdown', 'risk management', 'equity curve'],
    sections: [
      {
        title: 'Measuring Drawdown Depth and Duration',
        summary:
          'How to calculate peak-to-trough drawdown percentage, how long drawdowns typically last, and the difference between depth and duration as risk dimensions.',
      },
      {
        title: 'The Underwater Equity Curve',
        summary:
          'A visualization of the portfolio\'s percentage below its all-time high at each point in time — a powerful tool for understanding the ongoing cost of bear markets.',
      },
      {
        title: 'Historical Drawdowns Across Asset Classes',
        summary:
          'Typical drawdown ranges for equities, bonds, and balanced portfolios, and the amplifying effect of leverage on drawdown severity.',
      },
      {
        title: 'Using Drawdown Analysis Practically',
        summary:
          'How to use max drawdown and recovery time in portfolio sizing, stress-testing, and setting investor expectations around tolerable loss levels.',
      },
    ],
    keyTermIds: ['term-014', 'term-028', 'term-006', 'term-005'],
    learningObjectives: [
      'Calculate maximum drawdown and explain what it measures',
      'Distinguish between drawdown depth, duration, and recovery time',
      'Describe the underwater equity curve and its practical uses',
      'Apply drawdown analysis to position sizing and investor expectation-setting',
    ],
    keyTakeaways: [
      'Drawdown measures the peak-to-trough decline; recovery time measures how long to reach a new high',
      'Deeper drawdowns take exponentially longer to recover: a 50% loss requires a 100% gain to break even',
      'Leverage amplifies drawdowns — a 2x leveraged strategy can experience devastating permanent loss',
      'The underwater equity curve shows the ongoing cost of holding through a downturn',
    ],
    externalResources: [
      {
        label: 'Investor Bulletin: Stop Orders — Understanding Drawdowns',
        url: 'https://www.finra.org/investors/investing/investing-basics/market-volatility',
        source: 'FINRA',
      },
      {
        label: 'Portfolio Risk — CFA Institute',
        url: 'https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/portfolio-risk-and-return-part-i',
        source: 'CFA Institute',
      },
    ],
    relatedFeatures: ['risk'],
    lastUpdated: '2025-12-01',
    content: `# Drawdowns and Recovery Analysis

A drawdown is the decline from a portfolio's peak value to its subsequent trough. Understanding drawdowns — not just returns — is essential for setting realistic risk expectations.

## Measuring Drawdown

**Maximum Drawdown (MDD)**:

MDD = (Trough Value − Peak Value) / Peak Value × 100%

**Example**: Portfolio grows from $100K → $150K, falls to $90K, then recovers to $160K.
- Maximum drawdown: ($90K − $150K) / $150K = −40%

**Why depth ≠ duration**: Two portfolios with the same max drawdown can have very different recovery experiences. A shallow, long-lasting drawdown may be psychologically more damaging than a sharp, brief one.

## The Asymmetry of Recovery

Losses and gains are asymmetric:

| Loss (%) | Gain needed to break even (%) |
|----------|-------------------------------|
| 10%      | 11.1%                         |
| 25%      | 33.3%                         |
| 50%      | 100.0%                        |
| 75%      | 300.0%                        |

A 50% loss requires a 100% gain to recover. This is why managing downside is as important as maximizing upside.

## The Underwater Equity Curve

The underwater equity curve plots, at each point in time, how far below its all-time high a portfolio is. A value of 0% means a new all-time high was set. A value of −30% means the portfolio is still 30% below its peak.

This visualization:
- Shows the cumulative cost of holding through a bear market
- Reveals how long an investor went without reaching new highs
- Helps calibrate realistic expectations for holding periods

## Historical Drawdown Benchmarks

| Asset Class                | Typical MDD Range |
|----------------------------|-------------------|
| U.S. equities (S&P 500)   | −20% to −55%      |
| Developed international    | −40% to −60%      |
| Bonds (U.S. aggregate)     | −5% to −20%       |
| 60/40 balanced portfolio   | −20% to −35%      |
| 2x Leveraged equity ETF   | −60% to −95%+     |

Historical drawdowns provide reference points — but extreme events can exceed historical precedent.

## Leverage and Drawdown Amplification

Leverage amplifies both gains and losses. For a 2x leveraged position:
- A 50% decline in the underlying produces a roughly 100% loss — complete capital destruction
- Volatility decay (path dependency) means leveraged products lose value over time even in sideways markets

This is why leverage requires strict position sizing and risk management.

## Practical Applications

1. **Position sizing**: Size positions so that a historically plausible drawdown does not cause portfolio ruin
2. **Stress testing**: Ask "what would a 2008-style drawdown do to this portfolio?"
3. **Expectation setting**: Communicate realistic worst-case scenarios to avoid panic-selling during normal drawdowns
4. **Calmar ratio**: Annual return divided by maximum drawdown — a useful risk-adjusted return metric

Drawdown analysis does not tell you when drawdowns will occur — it tells you what to prepare for.`,
  },

  {
    id: 'module-012',
    title: 'Strategic Asset Allocation',
    summary:
      'Learn how to construct and maintain a portfolio that matches your goals, time horizon, and risk tolerance through strategic asset allocation.',
    category: 'portfolio_theory',
    level: 'intermediate',
    durationMinutes: 35,
    tierRequired: 'pro',
    prereqs: ['module-003'],
    tags: ['asset allocation', '60/40', 'rebalancing', 'glide path', 'strategic allocation', 'goals-based'],
    sections: [
      {
        title: 'Strategic vs. Tactical Allocation',
        summary:
          'Strategic allocation sets long-term target weights based on goals and risk tolerance; tactical allocation makes short-term deviations based on market views.',
      },
      {
        title: 'Classic Portfolio Frameworks',
        summary:
          'The 60/40 portfolio, permanent portfolio (25/25/25/25), and all-weather portfolio — their rationale, historical performance, and limitations.',
      },
      {
        title: 'Glide Paths and Age-Based Allocation',
        summary:
          'How target-date funds shift from equity-heavy to bond-heavy as retirement approaches, and the debate around "to" vs. "through" glide paths.',
      },
      {
        title: 'Rebalancing Strategies',
        summary:
          'Calendar rebalancing (quarterly, annually) vs. threshold-based rebalancing (when drift exceeds a band), and the tax and transaction cost tradeoffs.',
      },
    ],
    keyTermIds: ['term-010', 'term-024', 'term-008', 'term-003'],
    learningObjectives: [
      'Distinguish strategic from tactical asset allocation',
      'Describe classic portfolio frameworks and their underlying logic',
      'Explain how glide paths adjust allocation over a life cycle',
      'Compare calendar and threshold rebalancing strategies',
    ],
    keyTakeaways: [
      'Strategic allocation is the primary driver of long-term portfolio risk and return',
      'Classic frameworks like 60/40 provide starting points, not universal solutions',
      'Glide paths reduce equity exposure as the investment horizon shortens',
      'Rebalancing restores target weights and implicitly sells relative winners to buy relative losers',
    ],
    externalResources: [
      {
        label: 'Asset Allocation — SEC Investor.gov',
        url: 'https://www.investor.gov/introduction-investing/investing-basics/investment-products/mutual-funds-and-exchange-traded-2',
        source: 'SEC Investor.gov',
      },
      {
        label: 'CFA: Portfolio Management — Setting Capital Market Expectations',
        url: 'https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/asset-allocation',
        source: 'CFA Institute',
      },
    ],
    relatedFeatures: ['dashboard', 'risk'],
    lastUpdated: '2025-12-01',
    content: `# Strategic Asset Allocation

Asset allocation — the mix of stocks, bonds, and other asset classes — is consistently cited as the primary driver of long-term portfolio returns and volatility. Getting allocation right matters more than stock selection.

## Strategic vs. Tactical Allocation

**Strategic allocation** (SAA): A long-term target mix based on investor goals, risk tolerance, and time horizon. Set in advance and maintained through rebalancing.

**Tactical allocation** (TAA): Short-term deviations from the strategic target based on market views. Example: reducing equity from 60% to 50% when valuations appear stretched.

Most academic and practitioner evidence suggests strategic allocation should be the dominant determinant of portfolio construction. Tactical tilts, if used at all, should be modest and cost-aware.

## Classic Portfolio Frameworks

### The 60/40 Portfolio
- 60% global equities / 40% high-quality bonds
- Rationale: stocks for growth, bonds for income and crisis diversification
- Historical Sharpe ratio has been attractive over multi-decade periods
- Limitation: bonds and stocks can be positively correlated in high-inflation environments

### The Permanent Portfolio (Harry Browne)
- 25% equities / 25% long-term bonds / 25% gold / 25% cash
- Designed to perform reasonably well across four economic regimes:
  prosperity (stocks), deflation (bonds), inflation (gold), recession (cash)
- Very conservative; historically lower returns than 60/40 in bull markets

### The All-Weather Portfolio (Ray Dalio)
- Risk parity approach: size positions to equalize risk contribution
- Typical rough weights: ~30% equities, ~40% long-term bonds, ~15% intermediate bonds, ~7.5% gold, ~7.5% commodities
- Emphasizes diversification across economic environments

## Glide Paths

A glide path is the planned change in asset allocation over time as a goal (usually retirement) approaches.

**"To" glide path**: Reaches its most conservative allocation at the target date, then stays there.
**"Through" glide path**: Continues to shift more conservatively for 10–20 years after the target date.

Target-date funds automate this shift. The appropriate glide path depends on:
- Spending rate in retirement
- Other income sources (Social Security, pension)
- Investor risk tolerance

## Rebalancing

As asset prices move, actual weights drift from strategic targets. Rebalancing restores target weights.

**Calendar rebalancing**: Rebalance at fixed intervals (quarterly, annually). Simple, predictable, low transaction frequency.

**Threshold-based rebalancing**: Rebalance when any asset class drifts beyond a set band (e.g., ±5%). More responsive; can have higher trading frequency.

**Tradeoffs**:
- Rebalancing has a small expected return premium (systematically buying underperformers)
- But frequent rebalancing generates transaction costs and taxable events in taxable accounts
- In tax-advantaged accounts, rebalance more freely; in taxable accounts, prefer threshold-based or use cash flows to rebalance

## Building Your Strategic Allocation

1. Define your time horizon and major financial goals
2. Assess true risk tolerance — not what you think you'd tolerate, but what you have tolerated historically
3. Choose a starting allocation framework (60/40 is a reasonable default for many)
4. Build in a rebalancing policy and stick to it
5. Review annually or after major life changes; avoid reactive changes based on markets

Asset allocation is a framework, not a formula. Adjust it to your circumstances, not to market conditions.`,
  },

  {
    id: 'module-013',
    title: 'Introduction to Backtesting',
    summary:
      'Understand what backtesting is, why it can be misleading, and how to interpret backtest results with appropriate skepticism.',
    category: 'quantitative',
    level: 'intermediate',
    durationMinutes: 35,
    tierRequired: 'pro',
    prereqs: ['module-003', 'module-004'],
    tags: ['backtesting', 'overfitting', 'survivorship bias', 'out-of-sample', 'quantitative', 'strategy testing'],
    sections: [
      {
        title: 'What Is Backtesting?',
        summary:
          'Applying a trading or investment strategy to historical data to estimate how it would have performed — its uses, limitations, and why results are rarely as good live.',
      },
      {
        title: 'Critical Biases: Survivorship, Look-Ahead, and Data-Snooping',
        summary:
          'The three most common biases that inflate backtest performance: using only data from assets that survived, accidentally using future information, and over-fitting parameters to historical noise.',
      },
      {
        title: 'Overfitting and Out-of-Sample Validation',
        summary:
          'How adding parameters "explains" past data but degrades forward performance, and why splitting data into in-sample and out-of-sample periods is essential.',
      },
      {
        title: 'Interpreting Backtest Metrics',
        summary:
          'CAGR, Sharpe ratio, maximum drawdown, and Calmar ratio — what they measure, what makes a backtest result credible, and key red flags.',
      },
    ],
    keyTermIds: ['term-032', 'term-033', 'term-008', 'term-014'],
    learningObjectives: [
      'Define backtesting and its role in strategy evaluation',
      'Identify survivorship bias, look-ahead bias, and data-snooping bias',
      'Explain overfitting and why out-of-sample validation matters',
      'Interpret CAGR, Sharpe ratio, and max drawdown in a backtesting context',
    ],
    keyTakeaways: [
      'Backtesting simulates historical performance but cannot predict future returns',
      'Survivorship bias, look-ahead bias, and overfitting consistently inflate backtest results',
      'Out-of-sample testing is essential to assess genuine predictive power',
      'A credible backtest has few parameters, robust OOS performance, and realistic transaction cost assumptions',
    ],
    externalResources: [
      {
        label: 'Quantitative Investment Strategies — CFA Institute',
        url: 'https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/backtesting-and-simulation',
        source: 'CFA Institute',
      },
      {
        label: 'Common Backtesting Mistakes',
        url: 'https://www.finra.org/investors/investing/investing-basics/investment-research',
        source: 'FINRA',
      },
    ],
    relatedFeatures: ['backtests', 'risk', 'regime'],
    lastUpdated: '2025-12-01',
    content: `# Introduction to Backtesting

Backtesting applies a strategy's rules to historical data to estimate how it would have performed. It is a widely used tool in quantitative finance — and a widely misused one.

## What Is Backtesting?

A backtest simulates applying an investment rule set to historical prices and other data:
1. Define rules (e.g., "buy when 50-day MA crosses above 200-day MA")
2. Apply rules to historical data as if trading in real time
3. Calculate resulting portfolio equity curve, returns, and risk metrics

**What a backtest can do**:
- Show whether a strategy would have worked historically
- Reveal worst-case periods and stress scenarios
- Compare two strategies on equal footing

**What a backtest cannot do**:
- Guarantee future performance
- Account for structural changes in market behavior
- Fully capture real trading frictions (slippage, market impact, funding costs)

## Three Critical Biases

### 1. Survivorship Bias
Using data only from assets that exist today, ignoring those that went bankrupt, were delisted, or merged.

**Effect**: Overestimates returns because failed companies (which would have been bought and lost money) are excluded.

**Example**: A backtest of "buy S&P 500 stocks" using today's constituent list appears to work better than it would have historically, because today's list excludes hundreds of companies that failed.

### 2. Look-Ahead Bias (Data Leakage)
Accidentally using information that would not have been available at the time of the decision.

**Common sources**:
- Using end-of-day prices to trigger orders at that same day's price
- Backtesting on earnings data before earnings were released
- Using index constituent data based on current membership

**Effect**: Strategy "works" in backtesting because it uses future information.

### 3. Data-Snooping Bias (Over-optimization)
Adjusting strategy parameters until the backtest looks good, then claiming those parameters are optimal.

**Effect**: The strategy fits historical noise rather than genuine signal. It is essentially memorizing the past.

## Overfitting

A model is overfitted when it has so many parameters that it can explain all historical data — but has no generalization power on new data.

**Analogy**: Fitting a polynomial of degree 99 through 100 data points will fit perfectly but predict nothing useful for point 101.

**Signs of overfitting**:
- Many rules or parameters
- Performance degrades sharply in out-of-sample periods
- The strategy only "works" in specific market environments tested

## Out-of-Sample Validation

Split your historical data:
- **In-sample (IS)**: used to develop and tune the strategy
- **Out-of-sample (OOS)**: held out, never used in development; test here after strategy is finalized

A robust strategy should show reasonable (not perfect) OOS performance. Dramatic IS vs. OOS degradation is a red flag.

**Walk-forward testing**: A rolling OOS test across multiple periods, reducing the risk of a "lucky" OOS window.

## Key Backtest Metrics

| Metric | What it measures |
|--------|-----------------|
| CAGR | Annualized compound return |
| Sharpe Ratio | Return per unit of total volatility |
| Max Drawdown | Worst peak-to-trough loss |
| Calmar Ratio | CAGR / Max Drawdown |
| Win Rate | % of trades that were profitable |

**Red flags in backtests**:
- CAGR significantly better than reasonable market expectations
- Very high Sharpe ratio (>3) over long periods without plausible explanation
- Small number of trades (too little statistical significance)
- No OOS test results
- Transaction costs not modeled

The most credible backtests have few parameters, realistic assumptions, robust OOS performance, and reasonable Sharpe ratios.`,
  },

  {
    id: 'module-014',
    title: 'Fixed Income Basics: How Bonds Work',
    summary:
      'Build a solid understanding of bonds — how they are priced, what drives their returns, and how they function in a portfolio.',
    category: 'fundamentals',
    level: 'intermediate',
    durationMinutes: 25,
    tierRequired: 'free',
    prereqs: ['module-001'],
    tags: ['bonds', 'fixed income', 'yield', 'duration', 'credit risk', 'interest rates', 'coupon'],
    sections: [
      {
        title: 'Bond Mechanics: Coupon, Face Value, and Maturity',
        summary:
          'The structural anatomy of a bond — what the issuer promises, how periodic interest payments work, and what happens at maturity.',
      },
      {
        title: 'Price, Yield, and the Inverse Relationship',
        summary:
          'Why bond prices move opposite to yields, and the intuition behind this fundamental relationship that governs all fixed income markets.',
      },
      {
        title: 'Duration and Interest Rate Sensitivity',
        summary:
          'Duration as a measure of a bond\'s sensitivity to interest rate changes — and why it matters for portfolio risk management.',
      },
      {
        title: 'Credit Risk and Bond Types',
        summary:
          'How credit ratings assess default risk, the yield spread as compensation for that risk, and the main categories of bonds (government, corporate, municipal, inflation-protected).',
      },
    ],
    keyTermIds: ['term-035', 'term-036', 'term-037'],
    learningObjectives: [
      'Explain bond mechanics: coupon rate, face value, maturity, and yield to maturity',
      'Describe the inverse relationship between bond prices and yields',
      'Define duration and explain how it measures interest rate sensitivity',
      'Compare government, corporate, municipal, and inflation-protected bonds',
    ],
    keyTakeaways: [
      'Bonds are loans to governments or corporations that pay periodic interest and return principal at maturity',
      'Bond prices move inversely with yields — when rates rise, existing bond prices fall',
      'Duration measures how sensitive a bond\'s price is to interest rate changes',
      'Credit ratings assess the likelihood of default; higher credit risk means higher yield spread',
    ],
    externalResources: [
      {
        label: 'Bonds — SEC Investor.gov',
        url: 'https://www.investor.gov/introduction-investing/investing-basics/investment-products/bonds',
        source: 'SEC Investor.gov',
      },
      {
        label: 'Understanding Bond Risk',
        url: 'https://www.finra.org/investors/investing/investment-products/bonds',
        source: 'FINRA',
      },
    ],
    lastUpdated: '2025-12-01',
    content: `# Fixed Income Basics: How Bonds Work

Bonds are one of the two major building blocks of most portfolios. Understanding how they are priced and what drives their behavior is essential for any well-rounded investor.

## What Is a Bond?

A bond is a loan from the investor (bondholder) to the issuer (government or corporation). In exchange, the issuer promises:
1. **Coupon payments**: Periodic interest at a stated rate on the face value
2. **Face value repayment**: Return of principal at maturity

**Example**: A $1,000 face value bond with a 5% coupon pays $50/year (typically $25 semi-annually) and returns $1,000 at maturity.

Key terms:
- **Face value (par)**: Principal amount — typically $1,000
- **Coupon rate**: Annual interest as % of face value
- **Maturity**: Date principal is repaid
- **Yield to Maturity (YTM)**: The total return if held to maturity, accounting for current price

## The Price-Yield Inverse Relationship

When market interest rates rise, newly issued bonds offer higher coupons — making existing lower-coupon bonds less attractive. Their prices fall to compensate. The reverse is also true.

**Intuition**:
- You hold a 3% coupon bond
- New bonds are now paying 5%
- Buyers will only buy your bond at a discount (lower price) so the effective yield matches 5%

This is the most important concept in fixed income: **prices and yields move in opposite directions**.

## Duration

Duration is a measure of a bond's sensitivity to interest rate changes, expressed in years.

**Modified duration rule of thumb**: A bond with duration of 7 years will change in price by approximately 7% for a 1% change in interest rates.

Factors that increase duration:
- Longer maturity
- Lower coupon rate
- Lower yield

**Why it matters for portfolio management**: In a rising rate environment, high-duration bonds lose more value. Portfolio managers reduce duration when they expect rates to rise.

## Credit Risk

Credit risk is the risk that the issuer defaults on its obligations (fails to pay coupons or principal).

**Credit ratings** (Moody's, S&P, Fitch):
- Investment grade: AAA, AA, A, BBB
- High yield ("junk"): BB, B, CCC and below

**Yield spread**: The additional yield above a risk-free benchmark (e.g., U.S. Treasuries) that compensates for credit risk. Wider spreads = higher perceived risk.

## Types of Bonds

| Type | Issuer | Risk Level | Notes |
|------|--------|-----------|-------|
| U.S. Treasuries | U.S. government | Very low | Considered risk-free for credit; rates risk only |
| Agency bonds | Govt-sponsored entities | Low | Fannie Mae, Freddie Mac |
| Corporate bonds | Corporations | Low to high | Investment grade to high yield |
| Municipal bonds | State/local government | Low to medium | Often tax-exempt for U.S. investors |
| TIPS | U.S. government | Very low | Principal adjusted for CPI inflation |

## Role of Bonds in a Portfolio

- **Income**: Predictable coupon payments
- **Diversification**: Historically low or negative correlation with equities in deflationary/recessionary environments
- **Capital preservation**: Lower volatility than equities over most periods
- **Risk management**: Reduce portfolio duration in rising rate environments

Note: In high-inflation environments, the traditional stock-bond diversification benefit can break down as both may sell off together.`,
  },
];

// ============================================================================
// Learning Paths
// ============================================================================

export const CATALOG_PATHS: CatalogPath[] = [
  {
    id: 'path-001',
    title: 'Investing Fundamentals',
    summary:
      'Start your investment education with foundational concepts: the basics of investing, understanding risk, and building a diversified portfolio.',
    level: 'beginner',
    tierRequired: 'free',
    moduleIds: ['module-001', 'module-002', 'module-003'],
    estimatedHours: 1.0,
    tags: ['beginner', 'foundations', 'diversification', 'risk'],
    nextPathId: 'path-003',
    lastUpdated: '2025-10-20',
  },
  {
    id: 'path-002',
    title: 'Risk Management Mastery',
    summary:
      'Build on the fundamentals with a focused study of risk concepts — from basic volatility measures to advanced quantitative tools used by institutions.',
    level: 'advanced',
    tierRequired: 'pro',
    moduleIds: ['module-002', 'module-005', 'module-006'],
    estimatedHours: 1.75,
    tags: ['risk', 'VaR', 'CVaR', 'regimes', 'quantitative'],
    nextPathId: 'path-004',
    lastUpdated: '2025-11-15',
  },
  {
    id: 'path-003',
    title: 'Practical Investing Toolkit',
    summary:
      'Take your investing knowledge further with hands-on concepts: long-term strategy, dollar-cost averaging, ETFs, and fixed income basics.',
    level: 'beginner',
    tierRequired: 'free',
    moduleIds: ['module-007', 'module-008', 'module-009', 'module-014'],
    estimatedHours: 1.3,
    tags: ['ETF', 'DCA', 'index funds', 'long-term', 'bonds', 'beginner'],
    nextPathId: 'path-004',
    lastUpdated: '2025-12-01',
  },
  {
    id: 'path-004',
    title: 'Applied Portfolio Management',
    summary:
      'Master intermediate-level concepts: behavioral biases, drawdown analysis, strategic asset allocation, and backtesting fundamentals.',
    level: 'intermediate',
    tierRequired: 'pro',
    moduleIds: ['module-010', 'module-011', 'module-012', 'module-013'],
    estimatedHours: 2.1,
    tags: ['behavioral finance', 'drawdown', 'asset allocation', 'backtesting', 'intermediate'],
    lastUpdated: '2025-12-01',
  },
];

// ============================================================================
// Glossary
// ============================================================================

export const CATALOG_GLOSSARY: CatalogGlossaryTerm[] = [
  {
    id: 'term-001',
    term: 'Alpha',
    definition:
      'A measure of an investment\'s performance relative to a benchmark index. Positive alpha indicates outperformance; negative alpha indicates underperformance after adjusting for risk.',
    category: 'fundamentals',
    level: 'intermediate',
    example:
      'A fund with an alpha of 2% generated returns 2 percentage points higher than its benchmark after adjusting for risk.',
    relatedTerms: ['Beta', 'Sharpe Ratio'],
    seeAlso: ['term-002', 'term-008'],
    lastUpdated: '2025-09-01',
  },
  {
    id: 'term-002',
    term: 'Beta',
    definition:
      'A measure of a security\'s volatility relative to the overall market. Beta of 1 indicates the security moves with the market; above 1 indicates higher volatility; below 1 indicates lower volatility.',
    category: 'fundamentals',
    level: 'intermediate',
    example: 'A stock with a beta of 1.5 is expected to move 1.5% for every 1% move in the market.',
    relatedTerms: ['Alpha', 'Volatility', 'Systematic Risk'],
    seeAlso: ['term-001', 'term-005'],
    lastUpdated: '2025-09-01',
  },
  {
    id: 'term-003',
    term: 'Diversification',
    definition:
      'An investment strategy that involves spreading investments across various assets, sectors, or geographies to reduce risk. The goal is to minimize the impact of any single investment\'s poor performance.',
    category: 'portfolio_theory',
    level: 'beginner',
    example:
      'Instead of investing entirely in tech stocks, a diversified portfolio might include stocks, bonds, real estate, and international investments.',
    relatedTerms: ['Correlation', 'Asset Allocation', 'Risk Management'],
    seeAlso: ['term-004', 'term-010'],
    lastUpdated: '2025-09-01',
  },
  {
    id: 'term-004',
    term: 'Correlation',
    definition:
      'A statistical measure of the degree to which two securities move in relation to each other. Ranges from -1 (perfect negative correlation) to +1 (perfect positive correlation).',
    category: 'portfolio_theory',
    level: 'intermediate',
    example:
      'Gold often has low or negative correlation with stocks, making it a potential diversifier in a portfolio.',
    relatedTerms: ['Diversification', 'Covariance'],
    seeAlso: ['term-003'],
    lastUpdated: '2025-09-01',
  },
  {
    id: 'term-005',
    term: 'Volatility',
    definition:
      'A statistical measure of the dispersion of returns for a given security or market index. Higher volatility indicates greater price fluctuations and is commonly associated with higher risk.',
    category: 'risk_management',
    level: 'beginner',
    example:
      'A stock with 30% annual volatility is expected to move within roughly ±30% of its expected return in a typical year.',
    relatedTerms: ['Standard Deviation', 'VIX', 'Beta'],
    seeAlso: ['term-002', 'term-006'],
    lastUpdated: '2025-09-01',
  },
  {
    id: 'term-006',
    term: 'Value at Risk (VaR)',
    definition:
      'A statistical technique that estimates the maximum potential loss of a portfolio over a specified time period at a given confidence level.',
    category: 'risk_management',
    level: 'advanced',
    example:
      'A 95% daily VaR of $10,000 means there is a 5% chance of losing more than $10,000 in a single day.',
    relatedTerms: ['CVaR', 'Expected Shortfall', 'Risk Management'],
    seeAlso: ['term-007'],
    lastUpdated: '2025-09-01',
  },
  {
    id: 'term-007',
    term: 'Conditional Value at Risk (CVaR)',
    definition:
      'Also known as Expected Shortfall. CVaR measures the expected loss given that the loss exceeds the VaR threshold. It provides insight into tail risk that VaR alone does not capture.',
    category: 'risk_management',
    level: 'advanced',
    example:
      'If the 95% VaR is $10,000 and CVaR is $15,000, the expected loss when losses exceed VaR is $15,000.',
    relatedTerms: ['VaR', 'Tail Risk', 'Expected Shortfall'],
    seeAlso: ['term-006'],
    lastUpdated: '2025-09-01',
  },
  {
    id: 'term-008',
    term: 'Sharpe Ratio',
    definition:
      'A measure of risk-adjusted return calculated by subtracting the risk-free rate from the portfolio return and dividing by the portfolio\'s standard deviation.',
    category: 'portfolio_theory',
    level: 'intermediate',
    example:
      'A Sharpe ratio of 1.5 means the investment earned 1.5 units of excess return per unit of risk taken.',
    relatedTerms: ['Alpha', 'Sortino Ratio', 'Risk-Adjusted Return'],
    seeAlso: ['term-001', 'term-009'],
    lastUpdated: '2025-09-01',
  },
  {
    id: 'term-009',
    term: 'Sortino Ratio',
    definition:
      'Similar to the Sharpe ratio but considers only downside volatility (negative returns) rather than total volatility, making it useful for investors focused on limiting losses.',
    category: 'portfolio_theory',
    level: 'advanced',
    example:
      'A Sortino ratio of 2.0 indicates strong risk-adjusted returns relative to harmful downside volatility.',
    relatedTerms: ['Sharpe Ratio', 'Downside Risk', 'Semi-Deviation'],
    seeAlso: ['term-008'],
    lastUpdated: '2025-09-01',
  },
  {
    id: 'term-010',
    term: 'Asset Allocation',
    definition:
      'The process of dividing a portfolio among different asset categories such as stocks, bonds, and cash. Asset allocation is a primary driver of portfolio risk and long-term return.',
    category: 'portfolio_theory',
    level: 'beginner',
    example:
      'A common moderate allocation might be 60% stocks, 30% bonds, and 10% cash equivalents.',
    relatedTerms: ['Diversification', 'Rebalancing', 'Strategic Allocation'],
    seeAlso: ['term-003'],
    lastUpdated: '2025-09-01',
  },
  {
    id: 'term-011',
    term: 'Market Regime',
    definition:
      'A distinct period characterized by specific market conditions, such as trend direction, volatility level, and correlation patterns.',
    category: 'market_mechanics',
    level: 'intermediate',
    example:
      'During a high-volatility regime, option prices tend to rise and correlations between assets often increase.',
    relatedTerms: ['Bull Market', 'Bear Market', 'Volatility Regime'],
    seeAlso: ['term-012', 'term-013'],
    lastUpdated: '2025-09-01',
  },
  {
    id: 'term-012',
    term: 'Bull Market',
    definition:
      'A market condition characterized by rising prices, investor optimism, and general economic growth. Typically defined as a 20% rise from recent lows.',
    category: 'market_mechanics',
    level: 'beginner',
    example:
      'The period from March 2009 to February 2020 was one of the longest bull markets in U.S. history.',
    relatedTerms: ['Bear Market', 'Market Cycle', 'Trend'],
    seeAlso: ['term-011', 'term-013'],
    lastUpdated: '2025-09-01',
  },
  {
    id: 'term-013',
    term: 'Bear Market',
    definition:
      'A market condition characterized by falling prices (typically 20% or more from recent highs), investor pessimism, and often weak economic conditions.',
    category: 'market_mechanics',
    level: 'beginner',
    example:
      'The 2008 financial crisis produced a bear market where the S&P 500 declined approximately 57% peak to trough.',
    relatedTerms: ['Bull Market', 'Correction', 'Recession'],
    seeAlso: ['term-011', 'term-012'],
    lastUpdated: '2025-09-01',
  },
  {
    id: 'term-014',
    term: 'Maximum Drawdown',
    definition:
      'The largest peak-to-trough decline in portfolio value before a new peak is reached. It measures the worst-case loss for an investor who bought at the highest point.',
    category: 'risk_management',
    level: 'intermediate',
    example:
      'If a portfolio grew from $100 to $150, then fell to $90, then recovered to $160, the maximum drawdown is 40% (from $150 to $90).',
    relatedTerms: ['Drawdown', 'Recovery Period', 'Risk Management'],
    seeAlso: ['term-005', 'term-006'],
    lastUpdated: '2025-09-01',
  },
  {
    id: 'term-015',
    term: 'Moving Average',
    definition:
      'A technical indicator that smooths price data by calculating the average price over a specific number of periods. Common types include SMA (Simple) and EMA (Exponential).',
    category: 'technical_analysis',
    level: 'beginner',
    example:
      'A 50-day moving average sums the closing prices of the last 50 trading days and divides by 50.',
    relatedTerms: ['SMA', 'EMA', 'Trend Following'],
    seeAlso: ['term-016'],
    lastUpdated: '2025-09-01',
  },
  {
    id: 'term-016',
    term: 'Support and Resistance',
    definition:
      'Price levels where buying (support) or selling (resistance) pressure has historically been strong enough to slow or reverse price movement.',
    category: 'technical_analysis',
    level: 'intermediate',
    example:
      'If a stock has bounced off $50 multiple times, $50 is considered support. If it has repeatedly failed to break $60, $60 is resistance.',
    relatedTerms: ['Technical Analysis', 'Price Action', 'Breakout'],
    seeAlso: ['term-015'],
    lastUpdated: '2025-09-01',
  },
  {
    id: 'term-017',
    term: 'P/E Ratio',
    definition:
      'Price-to-Earnings ratio — a stock\'s price divided by its earnings per share. Indicates how much investors are willing to pay for each dollar of earnings.',
    category: 'fundamentals',
    level: 'beginner',
    example:
      'A stock at $100 with $5 annual earnings has a P/E ratio of 20, meaning investors pay $20 per $1 of earnings.',
    relatedTerms: ['Valuation', 'Earnings', 'PEG Ratio'],
    seeAlso: ['term-018'],
    lastUpdated: '2025-09-01',
  },
  {
    id: 'term-018',
    term: 'Dividend Yield',
    definition:
      'Annual dividend payment divided by stock price, expressed as a percentage. Represents the income return from holding a dividend-paying stock.',
    category: 'fundamentals',
    level: 'beginner',
    example:
      'A stock paying $2 annual dividend at a $50 price has a dividend yield of 4%.',
    relatedTerms: ['Dividend', 'Yield', 'Income Investing'],
    seeAlso: ['term-017'],
    lastUpdated: '2025-09-01',
  },
  {
    id: 'term-019',
    term: 'Liquidity',
    definition:
      'The ease with which an asset can be bought or sold without significantly affecting its price. High liquidity allows an asset to be quickly converted to cash near its market value.',
    category: 'market_mechanics',
    level: 'beginner',
    example:
      'Large-cap stocks like those in the S&P 500 are highly liquid with millions of shares traded daily, while small-cap stocks may trade infrequently.',
    relatedTerms: ['Bid-Ask Spread', 'Volume', 'Market Depth'],
    seeAlso: ['term-020'],
    lastUpdated: '2025-09-01',
  },
  {
    id: 'term-020',
    term: 'Bid-Ask Spread',
    definition:
      'The difference between the highest price a buyer will pay (bid) and the lowest price a seller will accept (ask). Narrower spreads typically indicate higher market liquidity.',
    category: 'market_mechanics',
    level: 'beginner',
    example:
      'If a stock has a bid of $49.95 and an ask of $50.05, the bid-ask spread is $0.10 (0.2%).',
    relatedTerms: ['Liquidity', 'Market Maker', 'Transaction Costs'],
    seeAlso: ['term-019'],
    lastUpdated: '2025-09-01',
  },

  // ── Expansion terms ────────────────────────────────────────────────────────

  {
    id: 'term-021',
    term: 'ETF (Exchange-Traded Fund)',
    definition:
      'A fund that holds a basket of assets — stocks, bonds, or commodities — and trades on a stock exchange like a single stock. Most ETFs track an index and offer low-cost diversification.',
    category: 'fundamentals',
    level: 'beginner',
    example:
      'An S&P 500 ETF holds shares of all 500 index constituents; buying one share gives proportional exposure to all of them.',
    relatedTerms: ['Index Fund', 'Expense Ratio', 'Passive Investing'],
    seeAlso: ['term-022', 'term-025'],
    lastUpdated: '2025-12-01',
  },
  {
    id: 'term-022',
    term: 'Index Fund',
    definition:
      'A fund designed to replicate the performance of a market index by holding its constituent securities in proportion to their weights. Available as both mutual funds and ETFs.',
    category: 'fundamentals',
    level: 'beginner',
    example:
      'A total market index fund holds thousands of stocks proportionally to market cap, providing broad exposure to the entire equity market.',
    relatedTerms: ['ETF', 'Passive Investing', 'Expense Ratio'],
    seeAlso: ['term-021', 'term-025', 'term-038'],
    lastUpdated: '2025-12-01',
  },
  {
    id: 'term-023',
    term: 'Dollar-Cost Averaging (DCA)',
    definition:
      'An investment strategy of contributing a fixed dollar amount at regular intervals, regardless of market price. Results in purchasing more shares when prices are low and fewer when prices are high.',
    category: 'fundamentals',
    level: 'beginner',
    example:
      'Investing $500 every month into an ETF regardless of price — automatically buying more shares during market dips.',
    relatedTerms: ['Systematic Investing', 'Market Timing', 'Lump-Sum Investing'],
    seeAlso: ['term-026'],
    lastUpdated: '2025-12-01',
  },
  {
    id: 'term-024',
    term: 'Rebalancing',
    definition:
      'The process of restoring a portfolio to its target asset allocation by selling overweight assets and buying underweight assets. Maintains intended risk levels and implicitly buys low/sells high.',
    category: 'portfolio_theory',
    level: 'intermediate',
    example:
      'If equities rise from 60% to 70% of a portfolio, rebalancing sells equities and buys bonds to restore the 60/40 target.',
    relatedTerms: ['Asset Allocation', 'Drift', 'Target Weights'],
    seeAlso: ['term-010', 'term-003'],
    lastUpdated: '2025-12-01',
  },
  {
    id: 'term-025',
    term: 'Expense Ratio',
    definition:
      'The annual fee charged by a fund, expressed as a percentage of assets under management. Deducted continuously from fund assets; even small differences compound significantly over decades.',
    category: 'fundamentals',
    level: 'beginner',
    example:
      'A fund with a 0.03% expense ratio charges $3 per year on a $10,000 investment; one with 1.00% charges $100.',
    relatedTerms: ['ETF', 'Index Fund', 'Total Return'],
    seeAlso: ['term-021', 'term-022'],
    lastUpdated: '2025-12-01',
  },
  {
    id: 'term-026',
    term: 'Compound Interest',
    definition:
      'Interest (or investment returns) calculated on both the original principal and previously earned interest. The "snowball" effect causes wealth to grow exponentially over long time horizons.',
    category: 'fundamentals',
    level: 'beginner',
    example:
      '$10,000 earning 7% annually: after 10 years ≈ $19,700; after 30 years ≈ $76,100 — returns accelerate as the base grows.',
    relatedTerms: ['Time Value of Money', 'CAGR', 'Reinvestment'],
    seeAlso: ['term-027'],
    lastUpdated: '2025-12-01',
  },
  {
    id: 'term-027',
    term: 'Time Value of Money',
    definition:
      'The principle that a dollar available today is worth more than a dollar in the future, because today\'s dollar can be invested to earn returns. Underpins discounted cash flow valuation and retirement planning.',
    category: 'fundamentals',
    level: 'beginner',
    example:
      'Receiving $1,000 today and investing it at 7% is worth more than receiving $1,000 in 5 years, since the invested amount grows to ~$1,403.',
    relatedTerms: ['Compound Interest', 'Present Value', 'Discount Rate'],
    seeAlso: ['term-026'],
    lastUpdated: '2025-12-01',
  },
  {
    id: 'term-028',
    term: 'Drawdown Recovery Period',
    definition:
      'The time required for a portfolio to return to its previous peak value after experiencing a drawdown. Deeper drawdowns typically require disproportionately longer recovery periods due to the asymmetry of losses and gains.',
    category: 'risk_management',
    level: 'intermediate',
    example:
      'After the 2008–09 financial crisis, the S&P 500 took until March 2013 to fully recover its October 2007 peak — approximately 5.5 years.',
    relatedTerms: ['Maximum Drawdown', 'Underwater Equity Curve', 'Recovery Rate'],
    seeAlso: ['term-014', 'term-005'],
    lastUpdated: '2025-12-01',
  },
  {
    id: 'term-029',
    term: 'Behavioral Finance',
    definition:
      'A field of study combining psychology and economics to explain why investors often make irrational decisions. Identifies systematic cognitive and emotional biases that lead to suboptimal financial choices.',
    category: 'behavioral_finance',
    level: 'intermediate',
    example:
      'Behavioral finance research explains why investors sell during market panics (loss aversion) and chase recent winners (recency bias).',
    relatedTerms: ['Loss Aversion', 'Cognitive Bias', 'Prospect Theory'],
    seeAlso: ['term-030', 'term-031'],
    lastUpdated: '2025-12-01',
  },
  {
    id: 'term-030',
    term: 'Loss Aversion',
    definition:
      'The psychological tendency to feel the pain of losses approximately twice as strongly as the pleasure of equivalent gains. A core finding of Kahneman and Tversky\'s Prospect Theory.',
    category: 'behavioral_finance',
    level: 'intermediate',
    example:
      'Losing $500 typically feels roughly as bad as gaining $1,000 feels good, which is why investors often make suboptimal decisions to avoid realizing losses.',
    relatedTerms: ['Behavioral Finance', 'Prospect Theory', 'Disposition Effect'],
    seeAlso: ['term-029', 'term-031'],
    lastUpdated: '2025-12-01',
  },
  {
    id: 'term-031',
    term: 'Confirmation Bias',
    definition:
      'The tendency to search for, interpret, and recall information in a way that confirms one\'s preexisting beliefs or hypotheses, while giving less weight to disconfirming evidence.',
    category: 'behavioral_finance',
    level: 'intermediate',
    example:
      'An investor bullish on a stock reads only positive analyst reports and dismisses negative earnings revisions as temporary noise.',
    relatedTerms: ['Behavioral Finance', 'Overconfidence', 'Anchoring'],
    seeAlso: ['term-029', 'term-030'],
    lastUpdated: '2025-12-01',
  },
  {
    id: 'term-032',
    term: 'Backtesting',
    definition:
      'The process of testing an investment strategy on historical data to estimate how it would have performed. Results must be interpreted carefully due to biases including survivorship, look-ahead, and overfitting.',
    category: 'quantitative',
    level: 'intermediate',
    example:
      'Applying a moving-average crossover rule to 20 years of historical S&P 500 data to see what returns and drawdowns it would have generated.',
    relatedTerms: ['Overfitting', 'Out-of-Sample Testing', 'Survivorship Bias'],
    seeAlso: ['term-033'],
    lastUpdated: '2025-12-01',
  },
  {
    id: 'term-033',
    term: 'Overfitting',
    definition:
      'In quantitative modeling, the error of tuning a model\'s parameters so specifically to historical data that it captures noise rather than genuine patterns, resulting in poor performance on new data.',
    category: 'quantitative',
    level: 'advanced',
    example:
      'A trading strategy with 15 parameters can be optimized to show excellent historical performance but may fail completely in live trading because it was fitted to random historical noise.',
    relatedTerms: ['Backtesting', 'Out-of-Sample Testing', 'Model Risk'],
    seeAlso: ['term-032'],
    lastUpdated: '2025-12-01',
  },
  {
    id: 'term-034',
    term: 'Factor Investing',
    definition:
      'An investment approach that targets systematic, persistent return drivers (factors) such as value, size, momentum, low volatility, and quality. Supported by decades of academic research.',
    category: 'quantitative',
    level: 'advanced',
    example:
      'A value factor ETF overweights stocks with low price-to-book ratios, seeking to capture the historically documented value premium.',
    relatedTerms: ['Smart Beta', 'Risk Premia', 'Alpha'],
    seeAlso: ['term-001', 'term-008'],
    lastUpdated: '2025-12-01',
  },
  {
    id: 'term-035',
    term: 'Yield Curve',
    definition:
      'A graph plotting yields of bonds with the same credit quality across different maturities. The shape — normal (upward sloping), flat, or inverted (downward sloping) — provides information about economic expectations.',
    category: 'fundamentals',
    level: 'intermediate',
    example:
      'An inverted yield curve (short-term yields above long-term yields) has historically preceded U.S. recessions.',
    relatedTerms: ['Interest Rate Risk', 'Duration', 'Fixed Income'],
    seeAlso: ['term-036'],
    lastUpdated: '2025-12-01',
  },
  {
    id: 'term-036',
    term: 'Duration',
    definition:
      'A measure of a bond\'s price sensitivity to interest rate changes, expressed in years. Modified duration approximates the percentage price change for a 1% change in interest rates.',
    category: 'fundamentals',
    level: 'intermediate',
    example:
      'A bond with a duration of 8 years will fall approximately 8% in price if interest rates rise by 1% (and rise ~8% if rates fall by 1%).',
    relatedTerms: ['Interest Rate Risk', 'Yield', 'Fixed Income'],
    seeAlso: ['term-035', 'term-037'],
    lastUpdated: '2025-12-01',
  },
  {
    id: 'term-037',
    term: 'Credit Rating',
    definition:
      'An assessment by a rating agency (Moody\'s, S&P, Fitch) of the creditworthiness of a bond issuer — the likelihood that the issuer will meet its debt obligations. Ranges from AAA (highest) to D (default).',
    category: 'fundamentals',
    level: 'beginner',
    example:
      'A BBB-rated corporate bond pays a higher yield than an AAA-rated bond of the same maturity, compensating for its higher default risk.',
    relatedTerms: ['Credit Spread', 'Default Risk', 'High Yield'],
    seeAlso: ['term-035', 'term-036'],
    lastUpdated: '2025-12-01',
  },
  {
    id: 'term-038',
    term: 'Passive vs. Active Management',
    definition:
      'Passive management aims to replicate a market index at low cost; active management uses research and judgment to try to outperform the index. Evidence consistently shows most active managers underperform their benchmark after fees over the long term.',
    category: 'fundamentals',
    level: 'beginner',
    example:
      'An S&P 500 index fund (passive) charges 0.03% per year; an active large-cap U.S. equity mutual fund might charge 0.80%–1.50% and still underperform the index in most years.',
    relatedTerms: ['Index Fund', 'ETF', 'Expense Ratio', 'Alpha'],
    seeAlso: ['term-021', 'term-022', 'term-025'],
    lastUpdated: '2025-12-01',
  },
];

// ============================================================================
// Catalog metadata
// ============================================================================

export const CATALOG_META: CatalogMeta = {
  catalogLastUpdated: '2025-12-01',
  totalModules: CATALOG_MODULES.length,
  totalPaths: CATALOG_PATHS.length,
  totalGlossaryTerms: CATALOG_GLOSSARY.length,
};

// ============================================================================
// Lookup helpers
// ============================================================================

export function getModuleById(id: string): CatalogModule | undefined {
  return CATALOG_MODULES.find((m) => m.id === id);
}

export function getPathById(id: string): CatalogPath | undefined {
  return CATALOG_PATHS.find((p) => p.id === id);
}

export function getGlossaryTermById(id: string): CatalogGlossaryTerm | undefined {
  return CATALOG_GLOSSARY.find((t) => t.id === id);
}

export function getModulesForPath(pathId: string): CatalogModule[] {
  const path = getPathById(pathId);
  if (!path) return [];
  return path.moduleIds
    .map((id) => getModuleById(id))
    .filter((m): m is CatalogModule => m !== undefined);
}

/**
 * Returns the glossary terms explicitly listed in a module's keyTermIds.
 */
export function getKeyTermsForModule(moduleId: string): CatalogGlossaryTerm[] {
  const m = getModuleById(moduleId);
  if (!m) return [];
  return m.keyTermIds
    .map((id) => getGlossaryTermById(id))
    .filter((t): t is CatalogGlossaryTerm => t !== undefined);
}

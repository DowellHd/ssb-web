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
      {
        // Khan Academy Finance — "Introduction to compound interest"
        // Verify ID in browser before removing linkOnly.
        title: 'Introduction to Compound Interest',
        youtubeId: 'MXmFZAjqtLs',
        source: 'Khan Academy',
        durationLabel: '8 min',
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
    nextPathId: 'path-002',
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
    lastUpdated: '2025-11-15',
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
];

// ============================================================================
// Catalog metadata
// ============================================================================

export const CATALOG_META: CatalogMeta = {
  catalogLastUpdated: '2025-11-15',
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

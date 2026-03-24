/**
 * Quiz questions for each learn module.
 * 4-5 multiple-choice questions per module, testing core concepts.
 * Educational only — no investment advice.
 */

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ModuleQuiz {
  moduleId: string;
  questions: QuizQuestion[];
}

const QUIZZES: ModuleQuiz[] = [
  {
    moduleId: 'module-001',
    questions: [
      {
        id: 'q001-1',
        question: 'What is the primary purpose of investing?',
        options: [
          'To keep money safe under a mattress',
          'To allocate resources with the expectation of generating income or growth over time',
          'To spend money on consumable goods',
          'To eliminate all financial risk',
        ],
        correctIndex: 1,
        explanation:
          'Investing is the act of allocating resources, usually money, with the expectation of generating income or profit over time — helping beat inflation and grow wealth.',
      },
      {
        id: 'q001-2',
        question: 'Which of the following best describes compound growth?',
        options: [
          'Earning interest only on the original principal',
          'Losing money at an accelerating rate',
          'Earning returns on both the principal and previously accumulated gains',
          'A fixed annual payment from a bond',
        ],
        correctIndex: 2,
        explanation:
          'Compound growth means your returns generate their own returns over time — often called "interest on interest" — which dramatically accelerates wealth building over long periods.',
      },
      {
        id: 'q001-3',
        question: 'Which asset class is generally considered the most volatile?',
        options: ['Cash equivalents', 'Government bonds', 'Stocks (equities)', 'Money market funds'],
        correctIndex: 2,
        explanation:
          'Stocks represent ownership in companies and can fluctuate significantly in value. In exchange for this higher risk, they have historically delivered higher long-term returns than bonds or cash.',
      },
      {
        id: 'q001-4',
        question: 'What does diversification help reduce?',
        options: [
          'The potential for any returns',
          'Tax obligations completely',
          'Concentration risk by spreading investments across different assets',
          'The need to monitor a portfolio',
        ],
        correctIndex: 2,
        explanation:
          'Diversification spreads risk across different assets, sectors, or geographies. If one investment declines, others may hold steady or rise, reducing the impact of any single loss.',
      },
      {
        id: 'q001-5',
        question: 'Why does starting to invest early matter?',
        options: [
          'Young investors get guaranteed higher returns',
          'Early investors pay no taxes on gains',
          'More time allows compound growth to work longer, potentially creating substantially more wealth',
          'Markets are less volatile for young investors',
        ],
        correctIndex: 2,
        explanation:
          "Time is the most powerful factor in compound growth. Starting 10 years earlier can more than double final wealth, even with the same monthly contributions — that's the power of compounding.",
      },
    ],
  },
  {
    moduleId: 'module-002',
    questions: [
      {
        id: 'q002-1',
        question: 'What does a stock represent?',
        options: [
          'A loan made to a company',
          'Ownership in a corporation and a claim on its assets and earnings',
          'A guaranteed fixed annual payment',
          'A government-backed savings certificate',
        ],
        correctIndex: 1,
        explanation:
          'A stock (equity) represents fractional ownership in a company. Shareholders are entitled to a portion of the company\'s assets and earnings, and their returns depend on company performance.',
      },
      {
        id: 'q002-2',
        question: 'What is a P/E ratio used for?',
        options: [
          'Measuring how fast a company grows its workforce',
          'Comparing a stock\'s price to the company\'s earnings per share',
          'Calculating dividend payments',
          'Determining the bond\'s yield to maturity',
        ],
        correctIndex: 1,
        explanation:
          'The Price-to-Earnings (P/E) ratio divides the stock price by earnings per share. It indicates how much investors are willing to pay for each dollar of earnings, helping assess relative valuation.',
      },
      {
        id: 'q002-3',
        question: 'Which best describes a dividend?',
        options: [
          'The fee charged by a broker to buy shares',
          'A company\'s total annual revenue',
          'A distribution of a portion of company profits to shareholders',
          'The change in a stock\'s price over one year',
        ],
        correctIndex: 2,
        explanation:
          "Dividends are periodic cash payments (or stock distributions) companies make to shareholders from profits. Not all companies pay dividends — growth companies often reinvest profits instead.",
      },
      {
        id: 'q002-4',
        question: 'Market capitalization is calculated as:',
        options: [
          'Annual revenue ÷ total shares outstanding',
          'Stock price × total shares outstanding',
          'Total assets − total liabilities',
          'Earnings per share × book value',
        ],
        correctIndex: 1,
        explanation:
          'Market cap = stock price × shares outstanding. It represents the total market value of a company\'s equity and is used to categorize companies as small-cap, mid-cap, or large-cap.',
      },
    ],
  },
  {
    moduleId: 'module-003',
    questions: [
      {
        id: 'q003-1',
        question: 'When you buy a bond, you are:',
        options: [
          'Purchasing ownership equity in a company',
          'Lending money to an issuer in exchange for periodic interest and repayment of principal',
          'Buying a derivative contract on an underlying asset',
          'Opening a savings account at a bank',
        ],
        correctIndex: 1,
        explanation:
          'Bonds are debt instruments. The buyer (investor) lends money to the issuer (government or corporation) and receives regular coupon payments plus return of principal at maturity.',
      },
      {
        id: 'q003-2',
        question: 'What happens to bond prices when interest rates rise?',
        options: [
          'Bond prices rise proportionally',
          'Bond prices are unaffected',
          'Bond prices fall (inverse relationship)',
          'Bond yields fall',
        ],
        correctIndex: 2,
        explanation:
          'Bond prices and interest rates move inversely. When rates rise, existing bonds paying lower coupons become less attractive, so their market prices fall to make their yield competitive.',
      },
      {
        id: 'q003-3',
        question: 'Which bond type is considered safest?',
        options: [
          'High-yield (junk) corporate bonds',
          'Convertible bonds',
          'U.S. Treasury bonds',
          'Subordinated debentures',
        ],
        correctIndex: 2,
        explanation:
          'U.S. Treasury bonds are backed by the full faith and credit of the U.S. government and are considered essentially risk-free from a credit default perspective, making them the benchmark for risk-free rates.',
      },
      {
        id: 'q003-4',
        question: 'What is a bond\'s "yield to maturity" (YTM)?',
        options: [
          'The coupon rate printed on the bond certificate',
          'The total return anticipated if held until maturity, including interest payments and price appreciation/depreciation',
          'The maximum price an investor will pay for a bond',
          'The annual management fee on a bond fund',
        ],
        correctIndex: 1,
        explanation:
          'YTM represents the total annualized return if you buy a bond now and hold it to maturity, accounting for the current price, coupon payments, and repayment of face value — the most complete measure of bond return.',
      },
    ],
  },
  {
    moduleId: 'module-004',
    questions: [
      {
        id: 'q004-1',
        question: 'What does a mutual fund offer individual investors?',
        options: [
          'Guaranteed positive returns each year',
          'Direct ownership of one specific company\'s stock',
          'Pooled investment in a diversified basket of assets managed by professionals',
          'A fixed interest rate like a savings account',
        ],
        correctIndex: 2,
        explanation:
          'Mutual funds pool money from many investors to buy a diversified portfolio of assets. This gives small investors access to diversification and professional management they couldn\'t achieve alone.',
      },
      {
        id: 'q004-2',
        question: 'How do ETFs (Exchange-Traded Funds) differ from traditional mutual funds?',
        options: [
          'ETFs always outperform mutual funds',
          'ETFs trade on exchanges throughout the day like stocks; mutual funds price once daily at NAV',
          'Mutual funds have lower fees than ETFs in all cases',
          'ETFs can only hold bonds, not stocks',
        ],
        correctIndex: 1,
        explanation:
          'ETFs trade continuously on exchanges during market hours at market prices. Traditional mutual funds are priced once per day at their Net Asset Value (NAV) and are bought/sold directly through the fund company.',
      },
      {
        id: 'q004-3',
        question: 'What is an expense ratio?',
        options: [
          'The percentage of fund assets charged annually as a management fee',
          'The ratio of gains to losses in a fund',
          'The fund\'s total earnings divided by number of shares',
          'The markup charged when buying from a broker',
        ],
        correctIndex: 0,
        explanation:
          'The expense ratio is the annual fee expressed as a percentage of assets under management, covering fund operating costs. Lower expense ratios mean more of your return stays in your pocket.',
      },
      {
        id: 'q004-4',
        question: 'Index funds are designed to:',
        options: [
          'Beat the market by active stock picking',
          'Replicate the performance of a specific market index (like the S&P 500)',
          'Guarantee returns equal to the current interest rate',
          'Invest only in government securities',
        ],
        correctIndex: 1,
        explanation:
          'Index funds passively track a market index by holding the same securities in the same proportions. They typically have lower fees than active funds and, over time, tend to outperform most active managers.',
      },
    ],
  },
  {
    moduleId: 'module-005',
    questions: [
      {
        id: 'q005-1',
        question: 'Modern Portfolio Theory suggests that the optimal portfolio:',
        options: [
          'Holds only the single best-performing asset',
          'Maximizes expected return for a given level of risk through diversification',
          'Always equals the market portfolio',
          'Minimizes returns to also minimize risk',
        ],
        correctIndex: 1,
        explanation:
          'Harry Markowitz\'s MPT shows that combining assets with low correlation can improve the risk-return tradeoff — an investor can achieve higher expected return for the same risk through diversification.',
      },
      {
        id: 'q005-2',
        question: 'The efficient frontier represents:',
        options: [
          'The maximum possible return at every risk level',
          'Portfolios that are always 100% in equities',
          'The set of portfolios with the highest expected return for each level of risk',
          'Only government bond portfolios',
        ],
        correctIndex: 2,
        explanation:
          'The efficient frontier is the set of optimal portfolios that offer the highest expected return for a given level of volatility. Any portfolio below the frontier is sub-optimal.',
      },
      {
        id: 'q005-3',
        question: 'The Sharpe Ratio measures:',
        options: [
          'Total portfolio return over one year',
          'Risk-adjusted return — excess return per unit of volatility',
          'The ratio of bonds to stocks in a portfolio',
          'Maximum drawdown of a strategy',
        ],
        correctIndex: 1,
        explanation:
          'Sharpe = (Return − Risk-free rate) / Standard deviation. A higher Sharpe ratio means you\'re getting more return per unit of risk taken — making it useful for comparing strategies with different risk levels.',
      },
      {
        id: 'q005-4',
        question: 'Correlation of -1.0 between two assets means:',
        options: [
          'They move together perfectly',
          'They move independently with no relationship',
          'They move in exactly opposite directions — adding one reduces overall portfolio risk',
          'Both assets always return 0%',
        ],
        correctIndex: 2,
        explanation:
          'A correlation of -1 means perfect negative correlation — when one asset rises, the other falls by the same proportion. Combining negatively correlated assets can dramatically reduce portfolio volatility.',
      },
    ],
  },
  {
    moduleId: 'module-006',
    questions: [
      {
        id: 'q006-1',
        question: 'What does a moving average help traders identify?',
        options: [
          'Exact future price levels',
          'The trend direction by smoothing out short-term price fluctuations',
          'A company\'s accounting profits',
          'The precise moment to buy or sell',
        ],
        correctIndex: 1,
        explanation:
          'Moving averages smooth price data over a specified period to reveal the underlying trend. When price is above a moving average, the trend is generally considered bullish; below is bearish.',
      },
      {
        id: 'q006-2',
        question: 'RSI (Relative Strength Index) values above 70 typically indicate:',
        options: [
          'A deeply oversold condition — likely to rise',
          'An overbought condition — the asset may be due for a pullback',
          'A neutral market with no directional bias',
          'A guaranteed sell signal',
        ],
        correctIndex: 1,
        explanation:
          'RSI measures momentum on a 0-100 scale. Above 70 is conventionally overbought (price may have risen too far too fast); below 30 is oversold. These are signals for heightened attention, not guaranteed reversals.',
      },
      {
        id: 'q006-3',
        question: 'Support levels in technical analysis refer to:',
        options: [
          'Price levels where selling pressure has historically caused reversals',
          'Price levels where buying interest has historically prevented further declines',
          'The highest price a stock has ever traded',
          'The intrinsic value of a company',
        ],
        correctIndex: 1,
        explanation:
          'Support is a price level where demand has historically been strong enough to halt a decline. Prices often "bounce" off support. A break below support can signal a more significant downturn.',
      },
    ],
  },
  {
    moduleId: 'module-007',
    questions: [
      {
        id: 'q007-1',
        question: 'Standard deviation in an investment context measures:',
        options: [
          'The average annual return of a portfolio',
          'The dispersion of returns around the mean — a proxy for volatility/risk',
          'The total drawdown from peak to trough',
          'The difference between two benchmarks',
        ],
        correctIndex: 1,
        explanation:
          'Standard deviation quantifies how much returns vary from the average. A higher standard deviation means wider swings — more uncertainty. It\'s the most common statistical measure of investment risk.',
      },
      {
        id: 'q007-2',
        question: 'Value at Risk (VaR) at 95% confidence over one day represents:',
        options: [
          'The maximum possible loss in any scenario',
          'The average daily return of the portfolio',
          'The loss that will not be exceeded on 95% of trading days',
          'The probability that returns exceed zero',
        ],
        correctIndex: 2,
        explanation:
          'A 1-day 95% VaR of $10,000 means there\'s a 5% chance of losing more than $10,000 on any given day. VaR is widely used in risk management but has limitations — it says nothing about losses beyond that threshold.',
      },
      {
        id: 'q007-3',
        question: 'What is maximum drawdown?',
        options: [
          'The highest annual return achieved',
          'The peak-to-trough decline in portfolio value over a specific period',
          'The total amount withdrawn from a retirement account',
          'The difference between best and worst trading days',
        ],
        correctIndex: 1,
        explanation:
          'Maximum drawdown measures the largest peak-to-valley decline in value before a new peak is reached. A strategy with a 30% max drawdown lost 30% from its high point at some moment — important for assessing survivability.',
      },
      {
        id: 'q007-4',
        question: 'Which is NOT a commonly used risk-adjusted performance metric?',
        options: [
          'Sharpe Ratio',
          'Sortino Ratio',
          'Calmar Ratio',
          'Earnings Per Share (EPS)',
        ],
        correctIndex: 3,
        explanation:
          'EPS (Earnings Per Share) is a fundamental valuation metric, not a risk-adjusted performance measure. Sharpe, Sortino, and Calmar all adjust returns for some form of risk (volatility, downside deviation, or drawdown respectively).',
      },
    ],
  },
  {
    moduleId: 'module-008',
    questions: [
      {
        id: 'q008-1',
        question: 'The Efficient Market Hypothesis (EMH) in its strong form asserts that:',
        options: [
          'Only technical analysis can beat the market',
          'All public and private information is already reflected in stock prices',
          'Markets are only efficient for large-cap stocks',
          'Insider trading always leads to profits',
        ],
        correctIndex: 1,
        explanation:
          'Strong-form EMH claims stock prices reflect all information — public, private, and insider. If true, no one, not even those with inside information, could consistently beat the market.',
      },
      {
        id: 'q008-2',
        question: 'Anchoring bias refers to investors:',
        options: [
          'Buying index funds instead of individual stocks',
          'Relying too heavily on the first piece of information encountered (e.g., the purchase price)',
          'Diversifying across too many sectors',
          'Selling all positions before earnings announcements',
        ],
        correctIndex: 1,
        explanation:
          'Anchoring occurs when we fixate on an initial reference point (like our purchase price) even when new information makes it irrelevant. It can lead to holding losers too long or selling winners too early.',
      },
      {
        id: 'q008-3',
        question: 'Loss aversion means investors typically:',
        options: [
          'Feel gains and losses equally',
          'Prefer guaranteed losses over uncertain ones',
          'Feel the pain of losses about twice as intensely as the pleasure of equivalent gains',
          'Always sell losing positions immediately',
        ],
        correctIndex: 2,
        explanation:
          'Kahneman and Tversky\'s prospect theory showed losses feel roughly twice as painful as equivalent gains feel good. This asymmetry leads to irrational decisions like holding losers too long to avoid realizing a loss.',
      },
    ],
  },
  {
    moduleId: 'module-009',
    questions: [
      {
        id: 'q009-1',
        question: 'In a Discounted Cash Flow (DCF) valuation, the discount rate represents:',
        options: [
          'The company\'s revenue growth rate',
          'The required rate of return, reflecting the risk of the investment',
          'The stock\'s current price-to-earnings ratio',
          'The annual dividend yield',
        ],
        correctIndex: 1,
        explanation:
          'The discount rate in DCF reflects the opportunity cost of capital — the return required by investors given the risk. Higher risk businesses use higher discount rates, which reduces the present value of future cash flows.',
      },
      {
        id: 'q009-2',
        question: 'A higher P/B ratio generally indicates:',
        options: [
          'The company has lower book value than peers',
          'Investors are paying a premium above the company\'s net asset value',
          'The company is near bankruptcy',
          'The stock is trading at book value',
        ],
        correctIndex: 1,
        explanation:
          'P/B = Price ÷ Book Value per Share. A ratio above 1 means the market values the company higher than its accounting net assets — typically due to intangible assets, growth expectations, or strong returns on equity.',
      },
      {
        id: 'q009-3',
        question: 'Return on Equity (ROE) measures:',
        options: [
          'The total revenue generated by the company annually',
          'How profitably management uses shareholders\' equity to generate earnings',
          'The company\'s total debt relative to assets',
          'The cash flow available for dividends',
        ],
        correctIndex: 1,
        explanation:
          'ROE = Net Income / Shareholders\' Equity. It shows how many dollars of profit are generated per dollar of equity. A consistently high ROE (15%+) is often a sign of competitive advantage and efficient management.',
      },
    ],
  },
  {
    moduleId: 'module-010',
    questions: [
      {
        id: 'q010-1',
        question: 'Sector rotation refers to:',
        options: [
          'Replacing every stock in a portfolio each quarter',
          'The shifting of investment capital from one industry sector to another as the economic cycle progresses',
          'Rotating between growth and value styles daily',
          'Buying ETFs that rotate their holdings automatically',
        ],
        correctIndex: 1,
        explanation:
          'Sector rotation is a strategy based on the business cycle: different sectors tend to outperform at different phases (e.g., defensives in recessions, cyclicals in recoveries). Understanding this can help with tactical asset allocation.',
      },
      {
        id: 'q010-2',
        question: 'Which sector typically outperforms during an economic expansion?',
        options: [
          'Utilities',
          'Consumer Staples',
          'Technology and Consumer Discretionary',
          'Healthcare',
        ],
        correctIndex: 2,
        explanation:
          'During economic expansions, consumers and businesses spend more, boosting cyclical sectors like Technology and Consumer Discretionary. Defensive sectors like Utilities and Staples tend to outperform during contractions.',
      },
      {
        id: 'q010-3',
        question: 'Relative strength in sector rotation analysis compares:',
        options: [
          'A sector\'s absolute return to its historical average',
          'A sector\'s performance relative to the overall market benchmark',
          'Two individual stocks within the same sector',
          'Bond and stock sector returns directly',
        ],
        correctIndex: 1,
        explanation:
          'Relative strength measures how a sector performs versus a benchmark (typically the broad market). Sectors with improving relative strength are gaining momentum; those weakening are losing ground.',
      },
    ],
  },
  {
    moduleId: 'module-011',
    questions: [
      {
        id: 'q011-1',
        question: 'An options call contract gives the buyer:',
        options: [
          'The obligation to sell shares at the strike price',
          'The right, but not the obligation, to buy shares at the strike price before expiration',
          'Ownership of 100 shares immediately',
          'A guaranteed profit equal to the premium paid',
        ],
        correctIndex: 1,
        explanation:
          'A call option gives the holder the right (not obligation) to purchase the underlying asset at the strike price on or before expiration. The buyer pays a premium for this right.',
      },
      {
        id: 'q011-2',
        question: 'Options theta represents:',
        options: [
          'Sensitivity of the option price to changes in the underlying\'s price',
          'The rate at which an option\'s time value decays as expiration approaches',
          'The implied volatility of the option',
          'The probability the option expires in-the-money',
        ],
        correctIndex: 1,
        explanation:
          'Theta (time decay) measures how much an option\'s value decreases each day, all else equal. Options lose time value as expiration approaches, which accelerates in the final weeks — a key factor for option sellers.',
      },
      {
        id: 'q011-3',
        question: 'A covered call strategy involves:',
        options: [
          'Buying calls to hedge a short position',
          'Owning the underlying stock and selling a call against it to generate income',
          'Buying both a call and put on the same stock simultaneously',
          'Selling puts without owning the underlying',
        ],
        correctIndex: 1,
        explanation:
          'In a covered call, you hold the stock (covering your obligation) and sell a call option. The premium received generates income, but you cap your upside at the strike price. It\'s a conservative income strategy.',
      },
    ],
  },
  {
    moduleId: 'module-012',
    questions: [
      {
        id: 'q012-1',
        question: 'Factor investing targets systematic return drivers. Which is NOT a traditional factor?',
        options: [
          'Value (low valuation multiples)',
          'Momentum (recent outperformers continuing)',
          'CEO tenure (years in role)',
          'Quality (high profitability and low leverage)',
        ],
        correctIndex: 2,
        explanation:
          'Classic factors include Value, Momentum, Size, Quality, and Low Volatility — all backed by decades of academic research. CEO tenure alone is not a well-established systematic return factor.',
      },
      {
        id: 'q012-2',
        question: 'The size factor (SMB — Small Minus Big) suggests:',
        options: [
          'Large-cap stocks always outperform small-caps',
          'Small-cap stocks have historically provided a return premium over large-caps over long periods',
          'Mid-cap stocks are riskier than small-caps',
          'Stock size has no impact on expected returns',
        ],
        correctIndex: 1,
        explanation:
          'Fama and French documented that smaller companies have historically earned higher returns than larger ones — the size premium. This may reflect higher risk, lower liquidity, or informational inefficiency.',
      },
      {
        id: 'q012-3',
        question: 'Factor timing (trying to predict which factor will lead next) is:',
        options: [
          'Consistently profitable and widely practiced by all successful managers',
          'Notoriously difficult — most evidence suggests factors go through long, unpredictable cycles',
          'Illegal in most jurisdictions',
          'Only relevant for institutional investors',
        ],
        correctIndex: 1,
        explanation:
          'Factor performance cycles are long and difficult to predict. Value underperformed for over a decade before rebounding. Most research suggests staying diversified across factors rather than attempting to time them.',
      },
    ],
  },
  {
    moduleId: 'module-013',
    questions: [
      {
        id: 'q013-1',
        question: 'In algorithmic trading, backtesting refers to:',
        options: [
          'Testing a strategy on live markets with real money',
          'Applying a trading strategy to historical data to evaluate hypothetical performance',
          'Backing up trade records to a secure database',
          'Testing the speed of trade execution systems',
        ],
        correctIndex: 1,
        explanation:
          'Backtesting simulates a strategy on historical data to see how it would have performed. It\'s a critical step before live deployment, though it cannot account for future market regime changes or execution slippage.',
      },
      {
        id: 'q013-2',
        question: 'Overfitting in a trading strategy means:',
        options: [
          'The strategy has too few parameters to capture market dynamics',
          'The strategy is too complex or tuned too closely to historical data, performing poorly on new data',
          'Trade execution is faster than the market can process',
          'The strategy trades too infrequently',
        ],
        correctIndex: 1,
        explanation:
          'Overfitting occurs when a strategy is excessively tailored to historical patterns that don\'t repeat. An overfit strategy looks great in backtests but fails in live trading — the cardinal sin of systematic trading.',
      },
      {
        id: 'q013-3',
        question: 'Slippage in algorithmic trading refers to:',
        options: [
          'An error in the trading algorithm code',
          'The difference between expected execution price and actual fill price',
          'Regulatory penalties for rule violations',
          'Tax slippage on gains',
        ],
        correctIndex: 1,
        explanation:
          'Slippage is the gap between the price when an order was placed and the actual execution price. It\'s caused by market impact, bid-ask spread, and latency — and must be accounted for in realistic backtests.',
      },
    ],
  },
  {
    moduleId: 'module-014',
    questions: [
      {
        id: 'q014-1',
        question: 'A financial plan typically begins with:',
        options: [
          'Selecting the highest-returning investments',
          'Defining clear goals, time horizons, and current financial situation',
          'Copying a successful investor\'s portfolio',
          'Maximizing short-term trading profits',
        ],
        correctIndex: 1,
        explanation:
          'Effective financial planning starts with understanding where you are (income, debts, savings) and where you want to go (goals and timelines). Investment selection comes after this foundation is established.',
      },
      {
        id: 'q014-2',
        question: 'Dollar-cost averaging (DCA) is the practice of:',
        options: [
          'Investing a lump sum at the lowest possible price',
          'Investing a fixed amount at regular intervals regardless of price',
          'Averaging down only on losing positions',
          'Converting all holdings to dollars during a bear market',
        ],
        correctIndex: 1,
        explanation:
          'DCA involves investing a fixed amount (e.g., $500/month) on a regular schedule. You buy more shares when prices are low and fewer when prices are high, potentially reducing average cost and smoothing out volatility impact.',
      },
      {
        id: 'q014-3',
        question: 'Tax-loss harvesting refers to:',
        options: [
          'Selling investments at a loss to offset gains and reduce taxable income',
          'Harvesting dividend income tax-free',
          'Converting taxable accounts to Roth accounts',
          'Deducting investment losses from earned income without limits',
        ],
        correctIndex: 0,
        explanation:
          'Tax-loss harvesting is selling positions at a loss to realize capital losses that can offset capital gains or up to $3,000 of ordinary income annually. The proceeds are typically reinvested in a similar (but not identical) asset.',
      },
      {
        id: 'q014-4',
        question: 'Asset allocation primarily refers to:',
        options: [
          'Selecting the best individual stocks within each sector',
          'How a portfolio is divided across major asset classes (stocks, bonds, cash, alternatives)',
          'The timing of when to buy and sell specific securities',
          'The geographic distribution of investments',
        ],
        correctIndex: 1,
        explanation:
          'Asset allocation — the mix between stocks, bonds, and other asset classes — is the single most important determinant of long-term portfolio returns and risk. It should reflect your goals, time horizon, and risk tolerance.',
      },
    ],
  },
];

export function getQuizForModule(moduleId: string): ModuleQuiz | undefined {
  return QUIZZES.find((q) => q.moduleId === moduleId);
}

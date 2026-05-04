import { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { LegalPageLayout } from '@/components/legal';

export const metadata: Metadata = {
  title: 'Trading & Educational Disclaimer — Smart Strategies Builder (SSB)',
  description: 'Important disclaimer regarding the educational nature of Smart Strategies Builder (SSB). SSB finance tools are for educational and informational purposes only.',
  alternates: { canonical: 'https://www.smartstrategiesbuilder.ai/disclaimer' },
};

const LAST_UPDATED = 'April 12, 2026';

export default function DisclaimerPage() {
  return (
    <LegalPageLayout title="Trading & Educational Disclaimer" lastUpdated={LAST_UPDATED}>
      {/* Prominent Warning Banner */}
      <div className="mb-8 p-6 bg-amber-900/50 border-2 border-amber-600 rounded-lg">
        <div className="flex items-start gap-4">
          <AlertTriangle className="h-8 w-8 text-amber-400 shrink-0 mt-1" />
          <div>
            <h2 className="text-xl font-bold text-amber-100 mb-2">Important Notice</h2>
            <p className="text-amber-100 text-lg">
              Smart Strategies Builder (SSB) is an <strong>educational platform only</strong>. It is <strong>not</strong> a broker-dealer, registered investment adviser, or financial service provider. Nothing on this platform constitutes financial, investment, tax, or legal advice.
            </p>
          </div>
        </div>
      </div>

      {/* Table of Contents */}
      <nav className="mb-8 p-4 bg-muted rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Contents</h2>
        <ul className="space-y-1 text-sm">
          <li><a href="#educational" className="text-primary hover:underline">1. Educational Purpose Only</a></li>
          <li><a href="#no-advice" className="text-primary hover:underline">2. Not Financial Advice</a></li>
          <li><a href="#no-guarantee" className="text-primary hover:underline">3. No Guarantees</a></li>
          <li><a href="#risks" className="text-primary hover:underline">4. Investment Risks</a></li>
          <li><a href="#simulated" className="text-primary hover:underline">5. Simulated Trading</a></li>
          <li><a href="#options" className="text-primary hover:underline">6. Options Disclaimer</a></li>
          <li><a href="#ai-models" className="text-primary hover:underline">7. AI &amp; Algorithmic Model Disclaimer</a></li>
          <li><a href="#broker-data" className="text-primary hover:underline">8. Broker Account Data</a></li>
          <li><a href="#algo-strategies" className="text-primary hover:underline">9. Algorithmic Strategies</a></li>
          <li><a href="#responsibility" className="text-primary hover:underline">10. User Responsibility</a></li>
          <li><a href="#data" className="text-primary hover:underline">11. Data Accuracy &amp; Disruptions</a></li>
          <li><a href="#liability" className="text-primary hover:underline">12. Limitation of Liability</a></li>
          <li><a href="#global-markets" className="text-primary hover:underline">13. Global Markets &amp; Sovereign Debt Data</a></li>
          <li><a href="#alternatives" className="text-primary hover:underline">14. Alternative Investments &amp; Private Markets</a></li>
          <li><a href="#fixed-income" className="text-primary hover:underline">15. Fixed Income &amp; Tax Calculations</a></li>
        </ul>
      </nav>

      {/* Content */}
      <section id="educational" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Educational Purpose Only</h2>
        <p className="mb-4">
          SSB is designed exclusively for educational and informational purposes. The platform provides tools for:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>Learning about market concepts, risk metrics, and portfolio analysis</li>
          <li>Exploring historical market data and analytical patterns</li>
          <li>Practicing with simulated trading (paper trading) using virtual funds</li>
          <li>Understanding backtesting, factor analysis, and valuation methodologies</li>
          <li>Exploring options concepts using educational models</li>
          <li>Learning about portfolio construction and risk management principles</li>
        </ul>
        <p className="font-medium">
          The content, analytics, AI-generated outputs, and insights provided are for learning purposes and should not be used as the basis for real investment decisions.
        </p>
      </section>

      <section id="no-advice" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Not Financial Advice</h2>
        <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg mb-4">
          <p className="font-semibold text-red-200 text-lg">
            Nothing on SSB constitutes a recommendation or solicitation to buy, sell, or hold any security, cryptocurrency, options contract, or financial instrument.
          </p>
        </div>
        <p className="mb-4">SSB does not:</p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>Provide personalized investment advice</li>
          <li>Recommend specific securities, options, or investments</li>
          <li>Tell you when to buy, sell, or hold any position</li>
          <li>Manage money or execute trades on your behalf through general platform features</li>
          <li>Guarantee profits or any investment performance</li>
          <li>Act as a fiduciary with respect to your investments</li>
        </ul>
        <p>
          You should always consult with a qualified licensed financial advisor, accountant, or attorney before making any investment or financial decisions. General educational content on the platform is not a substitute for professional advice tailored to your specific circumstances.
        </p>
      </section>

      <section id="no-guarantee" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. No Guarantees</h2>
        <p className="mb-4">
          We make no guarantees regarding:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>The accuracy or completeness of any information, data, or model output</li>
          <li>The reliability of any analytics, AI-generated insights, or algorithmic outputs</li>
          <li>Future investment performance based on historical data or backtests</li>
          <li>The suitability of any strategy, model, or approach for your specific financial situation</li>
          <li>Platform availability, uptime, or uninterrupted service</li>
        </ul>
        <p className="font-medium">
          Past performance — whether of a real portfolio, a backtest, or a simulated strategy — is not indicative of future results. Historical backtests and simulations are subject to hindsight bias, overfitting, and other limitations that cause them to overstate expected future performance.
        </p>
      </section>

      <section id="risks" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Investment Risks</h2>
        <p className="mb-4">
          Investing and trading involve substantial risks, including but not limited to:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li><strong>Loss of principal:</strong> You can lose some or all of your invested capital</li>
          <li><strong>Market volatility:</strong> Prices can change rapidly, dramatically, and unpredictably</li>
          <li><strong>Liquidity risk:</strong> You may not be able to sell a position when you want or at the price you expect</li>
          <li><strong>Model error:</strong> Analytical models, including AI models, may be flawed, incorrect, or misapplied</li>
          <li><strong>Timing risk:</strong> Entry and exit timing can significantly impact results</li>
          <li><strong>Emotional risk:</strong> Fear, greed, and cognitive biases can lead to poor decisions</li>
          <li><strong>Leverage risk:</strong> Borrowing to invest amplifies both potential gains and potential losses</li>
          <li><strong>Concentration risk:</strong> Holding too few positions or too much in one sector increases risk</li>
          <li><strong>Systemic risk:</strong> Market-wide or macroeconomic events can affect all investments simultaneously</li>
          <li><strong>Regulatory risk:</strong> Changes in laws or regulations can affect investment values</li>
        </ul>
        <p>
          Only invest money you can afford to lose entirely. Carefully consider your financial situation, investment objectives, time horizon, and risk tolerance before investing.
        </p>
      </section>

      <section id="simulated" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Simulated Trading</h2>
        <div className="p-4 bg-blue-900/30 border border-blue-700 rounded-lg mb-4">
          <p className="font-semibold text-blue-200">
            Paper trading on SSB uses virtual funds only. No real money is involved. No actual securities transactions occur through paper trading features.
          </p>
        </div>
        <p className="mb-4">
          Simulated trading differs from real trading in important ways:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>Simulated fills may not reflect actual market execution quality or availability</li>
          <li>Bid-ask spreads, slippage, and market impact are not fully or accurately modeled</li>
          <li>Emotional and psychological factors differ substantially when real money is not at stake</li>
          <li>Market conditions during any simulation period may not be representative of future conditions</li>
          <li>Transaction costs, commissions, short-sell fees, and taxes are not always accounted for</li>
          <li>Simulated results are inherently backward-looking and subject to look-ahead bias in certain configurations</li>
        </ul>
        <p className="font-medium">
          Success in paper trading does not guarantee, predict, or imply success in real trading. Real trading involves real financial risk that simulation cannot replicate.
        </p>
      </section>

      <section id="options" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Options Disclaimer</h2>
        <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg mb-4">
          <p className="font-semibold text-red-200">
            Options are complex financial instruments with unique risks. They are not suitable for all investors.
          </p>
        </div>
        <p className="mb-4">
          SSB&apos;s options features — including the options chain viewer and options paper trading — are provided for <strong>educational and simulation purposes only</strong>. Key disclosures:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>All options chain data, pricing, Greeks (delta, gamma, theta, vega), and implied volatility values displayed are generated using an educational mathematical model (Black-Scholes). They are <strong>approximations for educational purposes only</strong> and do not reflect real market prices or conditions</li>
          <li>Real options trading requires a brokerage account with options trading approval and involves real financial risk, including the potential loss of 100% of the premium paid</li>
          <li>Options strategies involving multiple legs (spreads, straddles, etc.) carry additional complexity and risk not fully represented in educational models</li>
          <li>Writing (selling) options involves potentially unlimited risk and requires specific regulatory approval from your broker</li>
          <li>SSB does not execute real options trades and does not provide options investment advice</li>
        </ul>
        <p>
          Before trading real options, obtain the Options Disclosure Document (&quot;Characteristics and Risks of Standardized Options&quot;) from your broker and carefully read it. Consider consulting a qualified financial advisor experienced in options trading.
        </p>
      </section>

      <section id="ai-models" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. AI &amp; Algorithmic Model Disclaimer</h2>
        <p className="mb-4">
          SSB includes features powered by machine learning models, statistical algorithms, and AI-generated analysis. This includes market regime detection, portfolio risk analysis, factor exposure analysis, technical indicators, predictive analytics, and the AI assistant.
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li><strong>AI outputs are probabilistic, not certain.</strong> Model predictions and regime classifications may be materially incorrect at any given time</li>
          <li><strong>Historical training data does not predict the future.</strong> All models are trained on historical data and cannot account for unprecedented market events, regime changes, or structural breaks</li>
          <li><strong>AI-generated content is not financial advice.</strong> Regime classifications, risk scores, and any AI assistant responses are general educational information only</li>
          <li><strong>Model degradation.</strong> Model performance can deteriorate significantly in market environments not well-represented in training data, including during market crises or structural changes</li>
          <li><strong>Overfitting risk.</strong> Complex models may perform well on historical data but poorly in real-world application — a phenomenon known as overfitting</li>
          <li><strong>Interpretability limitations.</strong> Some AI outputs may be difficult to explain or audit, and the reasoning behind a particular output may not be fully transparent</li>
        </ul>
        <p className="font-medium">
          Never rely solely on AI or algorithmic outputs from SSB for real investment decisions. These tools are meant to assist learning and exploration, not to drive real capital allocation.
        </p>
      </section>

      <section id="broker-data" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. Broker Account Data</h2>
        <p className="mb-4">
          If you connect a brokerage account, SSB displays your real holdings and account values for portfolio analysis and educational purposes. Important disclosures:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>Displayed holdings and values are retrieved from third-party data providers and may be delayed, incomplete, or inaccurate</li>
          <li>Portfolio analytics calculated on your holdings (sector allocations, P&amp;L, wash-sale flags, benchmarks) are estimates based on available data and simplified models — they are not tax advice, legal advice, or official investment reports</li>
          <li>Wash-sale detection is an educational flag based on simplified rules and does not constitute tax advice. Consult a qualified tax professional for wash-sale determinations</li>
          <li>Sector classifications are based on approximate mapping and may not reflect the precise GICS classification of every security</li>
          <li>SSB does not independently verify the accuracy of data received from third-party data providers</li>
        </ul>
      </section>

      <section id="algo-strategies" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">9. Algorithmic Strategies</h2>
        <p className="mb-4">
          SSB&apos;s algorithmic strategy builder and templates are provided for educational and exploratory purposes only:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>Strategy templates are illustrative examples of common approaches — they are not trading recommendations</li>
          <li>Backtested performance of any strategy template is subject to hindsight bias and data-snooping and does not predict real-world results</li>
          <li>SSB does not execute algorithmic strategies in real brokerage accounts through general platform features</li>
          <li>Institutional API access does not authorize automated trading through SSB; SSB provides data and analytics only</li>
          <li>Users are solely responsible for ensuring that any algorithmic approaches they develop or employ in real markets comply with all applicable laws and regulations</li>
        </ul>
      </section>

      <section id="responsibility" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">10. User Responsibility</h2>
        <p className="mb-4 font-medium text-lg">
          You are solely responsible for your own investment decisions and their outcomes.
        </p>
        <p className="mb-4">By using SSB, you acknowledge and agree that:</p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>You make all investment decisions independently, based on your own research and judgment</li>
          <li>You perform your own due diligence before making any investment</li>
          <li>You understand the risks involved in investing and trading</li>
          <li>You accept full personal responsibility for any and all losses or gains arising from any investment decisions you make</li>
          <li>You will not rely solely on SSB or any single source of information for investment decisions</li>
          <li>You will seek professional advice when appropriate</li>
        </ul>
      </section>

      <section id="data" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">11. Data Accuracy &amp; Disruptions</h2>
        <p className="mb-4">
          Market data and information on SSB may be subject to:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li><strong>Delays:</strong> Data may be delayed by 15 minutes or more from real-time prices</li>
          <li><strong>Inaccuracies:</strong> Data may contain errors, omissions, or stale values</li>
          <li><strong>Outages:</strong> Service interruptions may occur without notice</li>
          <li><strong>Third-party issues:</strong> Data providers may experience outages, API changes, or data quality issues</li>
          <li><strong>Model errors:</strong> Calculations and analytical outputs may contain bugs, approximations, or errors</li>
          <li><strong>Corporate actions:</strong> Splits, dividends, mergers, and other corporate actions may not be reflected immediately or accurately</li>
        </ul>
        <p>
          We strive for accuracy but cannot guarantee error-free operation. <strong>Do not rely on data from SSB for real-time trading decisions.</strong>
        </p>
      </section>

      <section id="liability" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">12. Limitation of Liability</h2>
        <p className="mb-4">
          To the maximum extent permitted by applicable law:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>SSB shall not be liable for any trading, investment, or financial losses of any kind</li>
          <li>SSB shall not be liable for any decisions made based on platform content, analytics, AI outputs, or data</li>
          <li>SSB shall not be liable for data inaccuracies, service interruptions, or model errors</li>
          <li>SSB disclaims all liability for indirect, incidental, consequential, special, punitive, or exemplary damages</li>
          <li>SSB shall not be liable for losses arising from broker connection features, including inaccurate holdings data or delayed information</li>
        </ul>
        <p className="mb-4">
          Your use of SSB is entirely at your own risk. SSB&apos;s total aggregate liability to you for any and all claims shall not exceed the amount you paid to SSB in the twelve months preceding the event giving rise to the claim. See the full Terms of Service for the complete limitation of liability provision.
        </p>
      </section>

      <section id="global-markets" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">13. Global Markets &amp; Sovereign Debt Data</h2>
        <p className="mb-4">
          SSB's Global Markets features include sovereign bond data, ADR listings, FX rates, country risk premiums, and sector performance information. You must understand the following limitations before relying on any of this content:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li><strong>Sovereign bond yields and spreads are illustrative.</strong> Yield figures shown for government bonds are sourced from public data and static snapshots — they are not real-time and may not reflect current market conditions or credit events.</li>
          <li><strong>FX rates and forward calculations are for analysis only.</strong> Spot rates displayed are approximate. Covered Interest Rate Parity (CIP) forward rate calculations are mathematical estimates — actual hedging costs, swap rates, and currency derivatives pricing differ based on counterparty, tenor, and market conditions.</li>
          <li><strong>SSB cannot execute international trades.</strong> Nothing in the Global Markets section constitutes an offer or ability to transact in foreign securities, currencies, or derivatives. All brokerage execution remains subject to your own broker's capabilities and applicable regulations.</li>
          <li><strong>Country risk premiums are model-based estimates.</strong> Country risk and default probability data displayed reflect publicly available frameworks (e.g., Damodaran country risk premiums) and may not reflect current sovereign credit conditions.</li>
          <li><strong>International tax information is general only.</strong> Withholding tax rates, foreign tax credit descriptions, and ADR tax treatment summaries are provided for general educational awareness. Tax treatment varies by jurisdiction, treaty, investor type, and individual circumstances. Consult a qualified tax professional before making investment decisions involving foreign securities.</li>
          <li><strong>Geopolitical and regulatory risk.</strong> International investing involves risks not present in domestic markets, including currency risk, political instability, capital controls, differing regulatory regimes, and settlement risk. SSB does not monitor or alert you to changes in these conditions.</li>
        </ul>
        <p>
          All global market content is provided for educational and analytical purposes. It does not constitute investment advice, a recommendation to buy or sell any foreign security, or guidance on international portfolio construction.
        </p>
      </section>

      <section id="alternatives" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">14. Alternative Investments &amp; Private Markets</h2>
        <p className="mb-4">
          SSB's Alternatives features cover REITs, commodities, private equity, venture capital, hedge funds, and other non-traditional asset classes. These asset classes involve unique and significant risks that differ materially from publicly traded equities and bonds.
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li><strong>Alternatives involve significant risk and limited liquidity.</strong> Private equity, venture capital, hedge funds, real assets, and collectibles are illiquid by nature. You may not be able to exit positions on demand, and holding periods of 5–10+ years are common in private markets. SSB's liquidity scores are rough categorical estimates, not guarantees.</li>
          <li><strong>PE/VC IRR and MOIC calculations are projections only.</strong> Internal Rate of Return (IRR) and Multiple on Invested Capital (MOIC) figures calculated in SSB's tools are based solely on the cashflow inputs you provide. They do not account for management fees, carried interest, taxes, reinvestment assumptions, or actual fund performance. These outputs are for illustrative modeling and should not be used to evaluate real fund investments.</li>
          <li><strong>REIT metrics are snapshots, not recommendations.</strong> P/FFO ratios, NAV premium/discount, dividend yield, and debt/equity figures shown for REITs are derived from publicly available data and may be outdated. REITs are subject to interest rate risk, real estate market cycles, leverage risk, and changes in tax treatment. Past dividend payments do not guarantee future distributions.</li>
          <li><strong>Commodity futures term structures are illustrative.</strong> Contango and backwardation term structure data shown is for educational visualization. Actual futures pricing depends on storage costs, convenience yields, supply/demand dynamics, and market microstructure. Do not use SSB's commodity visuals to make futures trading decisions.</li>
          <li><strong>Hedge fund strategy data is educational.</strong> AUM percentages, Sharpe ratios, and fee structures shown for hedge fund strategies are industry-level generalizations, not specific fund data. Individual hedge fund performance varies enormously. Most hedge funds are restricted to accredited and qualified purchasers under applicable securities laws.</li>
          <li><strong>Art, collectibles, and other hard assets.</strong> Valuations for illiquid hard assets are highly subjective and depend on provenance, condition, market trends, and expert appraisals. SSB does not provide appraisals, valuations, or transaction services for these asset classes.</li>
          <li><strong>Accredited investor requirements.</strong> Many alternative investments are only available to accredited investors or qualified purchasers under applicable law. SSB does not verify investor accreditation status and does not facilitate access to any private placement or restricted investment.</li>
        </ul>
        <p>
          Alternative investment content on SSB is strictly educational. It does not constitute an offer, solicitation, or recommendation to invest in any alternative asset class, fund, or private investment vehicle.
        </p>
      </section>

      <section id="fixed-income" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">15. Fixed Income &amp; Tax Calculations</h2>
        <p className="mb-4">
          SSB's Fixed Income features include a bond screener, yield calculations (YTM, YTC), a tax tools module, and a bond ladder builder. These tools involve financial and tax mathematics that are estimates only.
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li><strong>Bond screener data is illustrative.</strong> Bonds listed in SSB's screener are static sample data intended to demonstrate the tool's functionality. They do not represent real-time market quotes, available inventory, or actual tradeable securities. Yield, price, and rating information may be outdated or hypothetical.</li>
          <li><strong>Yield-to-Maturity and Yield-to-Call are mathematical estimates.</strong> YTM and YTC figures are calculated using iterative numerical methods (Newton-Raphson) on the inputs you provide. These calculations assume full and timely coupon payments, reinvestment of coupons at the same rate, and holding to maturity or call date — assumptions that rarely hold in practice.</li>
          <li><strong>Tax calculations are estimates only — not tax advice.</strong> The Tax Tools module calculates tax-equivalent yield (TEY), after-tax yield, and real yield using the federal and state tax rates and inflation rate you input. These are mathematical estimates. Actual tax liability depends on your complete tax picture, filing status, applicable deductions, AMT exposure, state-specific municipal bond rules, and other factors. SSB is not a tax advisor and cannot account for your individual tax situation.</li>
          <li><strong>Consult a qualified tax professional.</strong> Municipal bond tax treatment, including federal tax exemption and state-level exemptions, depends on the bond's issuer, your state of residence, and current tax law — which is subject to change. Do not make tax-motivated investment decisions based solely on SSB's calculations.</li>
          <li><strong>TIPS and inflation data are approximations.</strong> TIPS breakeven inflation rates and real yield calculations use approximate CPI figures and may not reflect current TIPS market pricing, accrued principal adjustments, or the actual breakeven implied by current TIPS vs. nominal Treasury spreads.</li>
          <li><strong>Bond ladder projections are illustrative.</strong> A bond ladder's projected cash flows assume bonds are held to maturity, coupons are paid as scheduled, and there are no defaults or early redemptions. Real bond ladders involve reinvestment risk, call risk, default risk, and tax complications not modeled in SSB's tool.</li>
          <li><strong>Credit ratings and risk classifications.</strong> Investment-grade (IG) and high-yield (HY) classifications and any credit rating data shown reflect publicly available rating agency information and may not reflect current ratings or credit events. Credit ratings are opinions, not guarantees of repayment.</li>
        </ul>
        <p>
          All fixed income calculations, screener data, and tax estimates are provided for educational and illustrative purposes only. They do not constitute investment advice, tax advice, or a recommendation to buy or sell any fixed income security.
        </p>
      </section>

      {/* Final Warning */}
      <div className="mt-12 p-6 bg-amber-900/50 border-2 border-amber-600 rounded-lg">
        <h2 className="text-xl font-bold text-amber-100 mb-3">Summary</h2>
        <ul className="space-y-2 text-amber-100">
          <li>• SSB is for education only — not a broker, adviser, or financial service provider</li>
          <li>• No financial advice of any kind is provided</li>
          <li>• All trading simulations use virtual funds only</li>
          <li>• Options data is educational/simulated — not real market prices</li>
          <li>• AI and algorithmic outputs may be incorrect — do not rely on them alone</li>
          <li>• Past performance and backtests do not predict future results</li>
          <li>• Broker data displayed may be delayed or inaccurate</li>
          <li>• Global market data (sovereign yields, FX rates, ADRs) is illustrative — not real-time</li>
          <li>• Alternative investment metrics (IRR, MOIC, liquidity scores) are estimates — not valuations</li>
          <li>• Fixed income and tax calculations are mathematical estimates — not tax or legal advice</li>
          <li>• You are solely responsible for your own investment decisions</li>
          <li>• Always consult qualified licensed professionals before investing</li>
        </ul>
      </div>

      {/* Related Links */}
      <div className="mt-12 pt-8 border-t">
        <p className="text-sm text-muted-foreground mb-4">Related policies:</p>
        <div className="flex gap-4">
          <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
          <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
        </div>
      </div>
    </LegalPageLayout>
  );
}

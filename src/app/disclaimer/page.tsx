import { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { LegalPageLayout } from '@/components/legal';

export const metadata: Metadata = {
  title: 'Trading & Educational Disclaimer - Smart Strategies Builder',
  description: 'Important disclaimer regarding the educational nature of Smart Strategies Builder (SSB) platform.',
};

const LAST_UPDATED = 'April 10, 2026';

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

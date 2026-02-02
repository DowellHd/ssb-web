import { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { LegalPageLayout } from '@/components/legal';

export const metadata: Metadata = {
  title: 'Trading & Educational Disclaimer - Smart Strategies Builder',
  description: 'Important disclaimer regarding the educational nature of Smart Strategies Builder (SSB) platform.',
};

const LAST_UPDATED = 'February 1, 2025';

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
              Smart Strategies Builder (SSB) is an <strong>educational platform only</strong>. It is <strong>not</strong> a broker, investment advisor, or financial service provider. Nothing on this platform constitutes financial, investment, tax, or legal advice.
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
          <li><a href="#responsibility" className="text-primary hover:underline">6. User Responsibility</a></li>
          <li><a href="#data" className="text-primary hover:underline">7. Data Accuracy & Disruptions</a></li>
          <li><a href="#liability" className="text-primary hover:underline">8. Limitation of Liability</a></li>
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
          <li>Exploring historical market data and patterns</li>
          <li>Practicing with simulated trading (paper trading)</li>
          <li>Understanding backtesting methodologies</li>
        </ul>
        <p className="font-medium">
          The content, analytics, and insights provided are for learning purposes and should not be used as the basis for real investment decisions.
        </p>
      </section>

      <section id="no-advice" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Not Financial Advice</h2>
        <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg mb-4">
          <p className="font-semibold text-red-200 text-lg">
            Nothing on SSB constitutes a recommendation or solicitation to buy, sell, or hold any security, cryptocurrency, or financial instrument.
          </p>
        </div>
        <p className="mb-4">SSB does not:</p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>Provide personalized investment advice</li>
          <li>Recommend specific securities or investments</li>
          <li>Tell you when to buy or sell</li>
          <li>Manage money or execute trades on your behalf</li>
          <li>Guarantee profits or investment performance</li>
        </ul>
        <p>
          You should always consult with a qualified financial advisor, accountant, or attorney before making any investment or financial decisions.
        </p>
      </section>

      <section id="no-guarantee" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. No Guarantees</h2>
        <p className="mb-4">
          We make no guarantees regarding:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>The accuracy or completeness of any information</li>
          <li>The reliability of any analytics or insights</li>
          <li>Future investment performance based on historical data</li>
          <li>The suitability of any strategy for your situation</li>
          <li>Platform availability or uninterrupted service</li>
        </ul>
        <p className="font-medium">
          Past performance is not indicative of future results. Historical backtests and simulations do not guarantee future performance.
        </p>
      </section>

      <section id="risks" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Investment Risks</h2>
        <p className="mb-4">
          Investing and trading involve significant risks, including but not limited to:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li><strong>Loss of principal:</strong> You can lose some or all of your invested capital</li>
          <li><strong>Market volatility:</strong> Prices can change rapidly and unpredictably</li>
          <li><strong>Liquidity risk:</strong> You may not be able to sell when you want</li>
          <li><strong>Model error:</strong> Analytical models may be flawed or misapplied</li>
          <li><strong>Timing risk:</strong> Entry and exit timing can significantly impact results</li>
          <li><strong>Emotional risk:</strong> Fear and greed can lead to poor decisions</li>
          <li><strong>Leverage risk:</strong> Borrowing to invest amplifies both gains and losses</li>
          <li><strong>Systemic risk:</strong> Market-wide events can affect all investments</li>
        </ul>
        <p>
          Only invest money you can afford to lose. Consider your financial situation, investment objectives, and risk tolerance carefully.
        </p>
      </section>

      <section id="simulated" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Simulated Trading</h2>
        <div className="p-4 bg-blue-900/30 border border-blue-700 rounded-lg mb-4">
          <p className="font-semibold text-blue-200">
            Paper trading on SSB uses virtual funds only. No real money is involved. No actual securities transactions occur.
          </p>
        </div>
        <p className="mb-4">
          Simulated trading differs from real trading in important ways:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>Simulated fills may not reflect actual market execution</li>
          <li>Slippage, spreads, and market impact are not fully modeled</li>
          <li>Emotional factors differ when real money is not at stake</li>
          <li>Market conditions during simulation may not represent future conditions</li>
          <li>Transaction costs and taxes are not always accounted for</li>
        </ul>
        <p className="font-medium">
          Success in paper trading does not guarantee success in real trading.
        </p>
      </section>

      <section id="responsibility" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. User Responsibility</h2>
        <p className="mb-4 font-medium text-lg">
          You are solely responsible for your own investment decisions.
        </p>
        <p className="mb-4">By using SSB, you acknowledge that:</p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>You make your own investment decisions independently</li>
          <li>You perform your own research and due diligence</li>
          <li>You understand the risks involved in investing</li>
          <li>You accept full responsibility for any losses or gains</li>
          <li>You will not rely solely on SSB for investment decisions</li>
        </ul>
      </section>

      <section id="data" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Data Accuracy & Disruptions</h2>
        <p className="mb-4">
          Market data and information on SSB may be subject to:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li><strong>Delays:</strong> Data may be delayed by 15 minutes or more</li>
          <li><strong>Inaccuracies:</strong> Data may contain errors or omissions</li>
          <li><strong>Outages:</strong> Service interruptions may occur without notice</li>
          <li><strong>Third-party issues:</strong> Data providers may experience problems</li>
          <li><strong>Technical errors:</strong> Calculations may contain bugs or errors</li>
        </ul>
        <p>
          We strive for accuracy but cannot guarantee error-free operation. Do not rely on real-time data accuracy for trading decisions.
        </p>
      </section>

      <section id="liability" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
        <p className="mb-4">
          To the maximum extent permitted by applicable law:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>SSB shall not be liable for any trading or investment losses</li>
          <li>SSB shall not be liable for any decisions made based on platform content</li>
          <li>SSB shall not be liable for data inaccuracies or service interruptions</li>
          <li>SSB disclaims all liability for indirect, incidental, or consequential damages</li>
        </ul>
        <p className="mb-4">
          Your use of SSB is at your own risk. You agree that SSB's total liability to you for any claims shall not exceed the amount you paid for the service in the preceding 12 months.
        </p>
      </section>

      {/* Final Warning */}
      <div className="mt-12 p-6 bg-amber-900/50 border-2 border-amber-600 rounded-lg">
        <h2 className="text-xl font-bold text-amber-100 mb-3">Summary</h2>
        <ul className="space-y-2 text-amber-100">
          <li>• SSB is for education only — not a broker or advisor</li>
          <li>• No financial advice is provided</li>
          <li>• All trading simulations use virtual funds only</li>
          <li>• Past performance does not predict future results</li>
          <li>• You are responsible for your own investment decisions</li>
          <li>• Always consult qualified professionals before investing</li>
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

import { Metadata } from 'next';
import Link from 'next/link';
import { LegalPageLayout } from '@/components/legal';

export const metadata: Metadata = {
  title: 'Terms of Service — Smart Strategies Builder (SSB)',
  description: 'Terms of Service for Smart Strategies Builder (SSB) — the SSB trading and portfolio analytics platform.',
  alternates: { canonical: 'https://www.smartstrategiesbuilder.ai/terms' },
};

const LAST_UPDATED = 'April 10, 2026';

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated={LAST_UPDATED}>
      {/* Table of Contents */}
      <nav className="mb-8 p-4 bg-muted rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Contents</h2>
        <ul className="space-y-1 text-sm">
          <li><a href="#acceptance" className="text-primary hover:underline">1. Acceptance of Terms</a></li>
          <li><a href="#eligibility" className="text-primary hover:underline">2. Eligibility</a></li>
          <li><a href="#educational" className="text-primary hover:underline">3. Educational Purpose</a></li>
          <li><a href="#no-brokerage" className="text-primary hover:underline">4. No Brokerage / No Advisory Services</a></li>
          <li><a href="#broker-connections" className="text-primary hover:underline">5. Broker Account Connections</a></li>
          <li><a href="#account" className="text-primary hover:underline">6. Account &amp; Security</a></li>
          <li><a href="#acceptable-use" className="text-primary hover:underline">7. Acceptable Use</a></li>
          <li><a href="#data" className="text-primary hover:underline">8. Data &amp; Market Information</a></li>
          <li><a href="#paper-trading" className="text-primary hover:underline">9. Paper Trading &amp; Simulations</a></li>
          <li><a href="#ai-features" className="text-primary hover:underline">10. AI-Powered &amp; Algorithmic Features</a></li>
          <li><a href="#api-access" className="text-primary hover:underline">11. API Access &amp; Institutional Use</a></li>
          <li><a href="#advisor" className="text-primary hover:underline">12. Advisor Platform</a></li>
          <li><a href="#third-party" className="text-primary hover:underline">13. Third-Party Services</a></li>
          <li><a href="#ip" className="text-primary hover:underline">14. Intellectual Property</a></li>
          <li><a href="#warranties" className="text-primary hover:underline">15. Disclaimers of Warranties</a></li>
          <li><a href="#liability" className="text-primary hover:underline">16. Limitation of Liability</a></li>
          <li><a href="#indemnification" className="text-primary hover:underline">17. Indemnification</a></li>
          <li><a href="#dispute" className="text-primary hover:underline">18. Dispute Resolution &amp; Arbitration</a></li>
          <li><a href="#governing-law" className="text-primary hover:underline">19. Governing Law</a></li>
          <li><a href="#billing-cancellation" className="text-primary hover:underline">20. Subscription, Billing &amp; Cancellation</a></li>
          <li><a href="#termination" className="text-primary hover:underline">21. Termination</a></li>
          <li><a href="#changes" className="text-primary hover:underline">22. Changes to Terms</a></li>
          <li><a href="#contact" className="text-primary hover:underline">23. Contact</a></li>
        </ul>
      </nav>

      {/* Content */}
      <section id="acceptance" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
        <p className="mb-4">
          By accessing or using Smart Strategies Builder (&quot;SSB,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you may not use the platform.
        </p>
        <p>
          These Terms constitute a legally binding agreement between you and SSB governing your access to and use of the platform, including any content, functionality, and services offered. Use of the platform after any update to these Terms constitutes your acceptance of the revised Terms.
        </p>
      </section>

      <section id="eligibility" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Eligibility</h2>
        <p className="mb-4">
          You must be at least 18 years old to use SSB. By using this platform, you represent and warrant that you meet this age requirement and have the full legal capacity to enter into this agreement.
        </p>
        <p className="mb-4">
          You are responsible for ensuring that your use of SSB complies with all applicable laws and regulations in your jurisdiction. Access to certain features may be restricted or prohibited in certain jurisdictions. SSB makes no representation that the platform is appropriate or available for use in any particular location.
        </p>
        <p>
          By creating an account, you represent that all information you provide is accurate, current, and complete.
        </p>
      </section>

      <section id="educational" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. Educational Purpose</h2>
        <div className="p-4 bg-amber-900/30 border border-amber-700 rounded-lg mb-4">
          <p className="font-semibold text-amber-200">
            SSB is an educational and informational platform only. Nothing on this platform constitutes financial, investment, legal, or tax advice.
          </p>
        </div>
        <p className="mb-4">
          All analytics, insights, regime analysis, simulations, algorithmic models, and content provided through SSB are for educational purposes only. You should not rely on any information from SSB to make financial decisions.
        </p>
        <p className="mb-4">
          SSB does not provide personalized financial advice. Any content that resembles a recommendation is general educational information, not tailored advice. The fact that a particular strategy, security, or approach is discussed on the platform does not constitute an endorsement or recommendation of that strategy, security, or approach.
        </p>
        <p>
          Always consult with qualified professionals (licensed financial advisors, accountants, attorneys) before making any investment or financial decisions.
        </p>
      </section>

      <section id="no-brokerage" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. No Brokerage / No Advisory Services</h2>
        <p className="mb-4">
          SSB is <strong>not</strong> a registered broker-dealer, investment adviser, commodity trading adviser, futures commission merchant, or any other regulated financial services firm under federal or state securities laws, FINRA rules, or any equivalent foreign regulations.
        </p>
        <p className="mb-4">SSB does <strong>not</strong>:</p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>Execute trades on behalf of general users</li>
          <li>Hold, custody, or manage your money or securities</li>
          <li>Provide personalized investment recommendations to the general public</li>
          <li>Guarantee any investment returns or outcomes</li>
          <li>Act as a fiduciary with respect to your investment decisions</li>
          <li>Solicit the purchase or sale of any security</li>
        </ul>
        <p className="mb-4">
          Certain restricted, personal-use execution features may be available to specific authenticated account holders under separate, explicit agreements. Such features are not offered to the general public, are not investment advisory services, and are operated solely at the direction and sole risk of the authorized account holder. Any such restricted feature is subject to all disclaimers and limitations set forth in these Terms and any supplemental agreement.
        </p>
        <p>
          Paper trading and simulation features are entirely simulated using virtual funds. No real money is involved in those features, and no actual securities transactions occur through them.
        </p>
      </section>

      <section id="broker-connections" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Broker Account Connections</h2>
        <p className="mb-4">
          SSB may allow you to connect your existing brokerage accounts to the platform through third-party data aggregation services (including Plaid Financial Ltd. and its affiliates). By connecting a brokerage account, you:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>Authorize SSB and its data service providers to access read-only account data, including holdings, balances, transaction history, and account identifiers</li>
          <li>Authorize the applicable data provider to retrieve your financial data on your behalf</li>
          <li>Represent that you are the authorized owner of the connected account</li>
          <li>Acknowledge that SSB stores a cache of your holdings and balance data to power analytics features</li>
        </ul>
        <p className="mb-4">
          SSB uses broker connection data solely to provide portfolio analysis, visualization, and educational features. SSB does <strong>not</strong>:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>Use your credentials to place trades in your live brokerage accounts (except through any separately disclosed restricted execution feature you have explicitly activated)</li>
          <li>Sell, rent, or transfer your account credentials or financial data to third parties for marketing purposes</li>
          <li>Store your brokerage login credentials — credentials are handled exclusively by the third-party data provider</li>
        </ul>
        <p className="mb-4">
          You may disconnect a broker account at any time through your account settings. Disconnecting removes SSB&apos;s access to future data but does not automatically delete previously cached data. To request deletion of cached financial data, contact us at the address in Section 23.
        </p>
        <p>
          Broker connections are subject to the terms of service of the applicable third-party data aggregation provider. SSB is not responsible for the availability, accuracy, or security of data provided by those services.
        </p>
      </section>

      <section id="account" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Account &amp; Security</h2>
        <p className="mb-4">
          You are responsible for maintaining the confidentiality of your account credentials, including your password and any API keys you generate. You agree to:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>Use a strong, unique password</li>
          <li>Enable multi-factor authentication when available</li>
          <li>Notify us immediately of any unauthorized access or suspected compromise</li>
          <li>Not share your account credentials with others</li>
          <li>Keep any API keys confidential and revoke them if compromised</li>
        </ul>
        <p>
          We are not liable for any loss or damage arising from your failure to protect your account credentials, including any API keys. You are solely responsible for all activity that occurs under your account.
        </p>
      </section>

      <section id="acceptable-use" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Acceptable Use</h2>
        <p className="mb-4">You agree not to:</p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>Use SSB for any unlawful purpose or in violation of any applicable laws or regulations</li>
          <li>Attempt to gain unauthorized access to our systems, other users&apos; accounts, or our data</li>
          <li>Interfere with or disrupt the platform&apos;s operation, servers, or networks</li>
          <li>Scrape, harvest, or collect data from SSB without prior written permission</li>
          <li>Reverse engineer, decompile, disassemble, or attempt to derive source code from any part of the platform</li>
          <li>Use the platform for commercial redistribution of financial data or analytics without authorization</li>
          <li>Use the platform to engage in market manipulation, front-running, or any activity that violates securities laws</li>
          <li>Circumvent any security, access control, or rate-limiting mechanisms</li>
          <li>Use automated means to access the platform except through the official API with a valid API key under our API terms</li>
          <li>Impersonate any person or entity or misrepresent your affiliation</li>
        </ul>
        <p>
          We reserve the right to investigate suspected violations and to suspend or terminate access, cooperate with law enforcement, and pursue legal remedies.
        </p>
      </section>

      <section id="data" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. Data &amp; Market Information</h2>
        <p className="mb-4">
          Market data, quotes, price information, fundamental data, and other financial information displayed on SSB may be:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>Delayed by 15 minutes or more from real-time prices</li>
          <li>Subject to inaccuracies, errors, or omissions</li>
          <li>Sourced from third-party providers with their own licensing terms</li>
          <li>Subject to interruptions, outages, or discontinuation without notice</li>
          <li>Generated by analytical models that may contain errors or simplifying assumptions</li>
        </ul>
        <p className="mb-4">
          We do not guarantee the accuracy, completeness, or timeliness of any market data or analytical output. <strong>Do not rely on data or analytics from SSB for real trading decisions.</strong>
        </p>
        <p>
          Any data you export from SSB is provided &quot;as is&quot; for educational use. SSB is not responsible for decisions made based on exported data.
        </p>
      </section>

      <section id="paper-trading" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">9. Paper Trading &amp; Simulations</h2>
        <p className="mb-4">
          SSB&apos;s paper trading, options simulation, backtesting, and Monte Carlo simulation features use virtual funds and hypothetical market conditions. They do not involve real money or actual securities transactions. Key limitations:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>All trades are simulated with virtual currency — no real money is involved</li>
          <li>Simulated fills may differ significantly from actual market execution</li>
          <li>Slippage, bid-ask spreads, market impact, and liquidity constraints are not fully modeled</li>
          <li>Transaction costs, commissions, margin interest, and taxes may not be fully reflected</li>
          <li>Past simulated performance does not predict future real trading results</li>
          <li>Emotional and psychological factors differ substantially when real money is not at stake</li>
          <li>Market conditions during any simulation period may not be representative of future conditions</li>
        </ul>
        <p className="font-medium">
          Success in simulated trading is not indicative of and does not guarantee success in real trading. Simulated results have inherent limitations.
        </p>
      </section>

      <section id="ai-features" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">10. AI-Powered &amp; Algorithmic Features</h2>
        <p className="mb-4">
          SSB includes features that use machine learning models, statistical algorithms, and AI-generated analysis, including but not limited to market regime detection, portfolio risk analysis, factor analysis, sentiment analysis, and the AI assistant. You acknowledge and agree that:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>AI and algorithmic outputs are probabilistic, not certain, and may be materially incorrect</li>
          <li>Models are trained on historical data and cannot predict future market conditions</li>
          <li>AI-generated content does not constitute financial advice and should not be relied upon for investment decisions</li>
          <li>Model performance can degrade significantly in market regimes not well-represented in training data</li>
          <li>Algorithmic strategy templates are for educational exploration only and do not constitute trading system recommendations</li>
          <li>You are solely responsible for any decisions made based on AI or algorithmic output from the platform</li>
        </ul>
        <p>
          SSB does not warrant the accuracy, reliability, or fitness of any AI-generated or algorithmically-generated content for any particular purpose.
        </p>
      </section>

      <section id="api-access" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">11. API Access &amp; Institutional Use</h2>
        <p className="mb-4">
          Certain subscription tiers allow programmatic access to SSB features through an API using API keys. By accessing the SSB API, you agree that:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>API access is subject to all Terms set forth herein, including all disclaimers regarding educational use and no financial advice</li>
          <li>You will not use the API to build systems that provide personalized financial advice to third parties without appropriate regulatory licenses</li>
          <li>You are responsible for all use of your API keys, including by third parties to whom you grant access</li>
          <li>Automated or high-frequency use of the API remains subject to all applicable rate limits and acceptable use restrictions</li>
          <li>You will not use API-retrieved data to create competing products or services without prior written consent</li>
          <li>SSB may suspend API access without notice for violation of these Terms or excessive use</li>
        </ul>
        <p>
          API access does not grant any right to redistribute SSB data or analytics. Enterprise customers are solely responsible for ensuring their own downstream use of API data complies with applicable regulations.
        </p>
      </section>

      <section id="advisor" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">12. Advisor Platform</h2>
        <p className="mb-4">
          SSB&apos;s advisor platform features are provided as organizational and educational tools only. By using advisor platform features, you represent, warrant, and agree that:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>You hold all licenses, registrations, and authorizations required by applicable law to provide investment advice in your jurisdiction before using these features in connection with client management</li>
          <li>SSB is a technology tool only — it is not a registered investment adviser and does not provide advice, compliance oversight, or supervision services to you or your clients</li>
          <li>You are solely responsible for all investment decisions, advice, and compliance obligations with respect to your clients</li>
          <li>Model portfolios and analytics generated by SSB are analytical outputs, not fiduciary recommendations</li>
          <li>SSB does not review, supervise, or approve any advice you provide to clients using the platform</li>
        </ul>
        <p>
          SSB expressly disclaims any responsibility for regulatory compliance failures arising from use of the advisor platform. You agree to indemnify SSB for any claims arising from your advisory activities conducted using the platform.
        </p>
      </section>

      <section id="third-party" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">13. Third-Party Services</h2>
        <p className="mb-4">
          SSB integrates with and relies on third-party services including, without limitation, financial data providers, broker account connection services (including Plaid Financial Ltd.), payment processors, hosting infrastructure, and analytics tools. We are not responsible for the content, accuracy, availability, security, or practices of any third-party service.
        </p>
        <p className="mb-4">
          Your use of connected third-party services is governed by their respective terms of service and privacy policies. We encourage you to review those policies. SSB does not endorse any third-party service.
        </p>
        <p>
          If a third-party service becomes unavailable or changes its terms, certain SSB features may be affected or discontinued. SSB is not liable for any disruption to its services caused by third-party service failures.
        </p>
      </section>

      <section id="ip" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">14. Intellectual Property</h2>
        <p className="mb-4">
          All content, features, and functionality of SSB, including but not limited to text, graphics, logos, icons, software, models, algorithms, and code, are the exclusive property of SSB or its licensors and are protected by applicable intellectual property laws.
        </p>
        <p className="mb-4">
          You are granted a limited, non-exclusive, non-transferable, revocable license to access and use SSB for your personal, non-commercial, educational use, subject to these Terms. You may not copy, modify, distribute, sublicense, sell, or create derivative works based on SSB content without our express written permission.
        </p>
        <p>
          Any feedback, suggestions, or ideas you provide to us regarding the platform may be used by us without restriction or compensation to you.
        </p>
      </section>

      <section id="warranties" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">15. Disclaimers of Warranties</h2>
        <p className="mb-4 uppercase font-semibold">
          SSB IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW.
        </p>
        <p className="mb-4">
          We expressly disclaim all warranties, including but not limited to implied warranties of merchantability, fitness for a particular purpose, title, and non-infringement. We do not warrant that:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>The platform will be uninterrupted, error-free, or free from security vulnerabilities</li>
          <li>Any data, analytics, or model outputs are accurate, complete, or reliable</li>
          <li>The platform will meet your requirements or produce any particular outcome</li>
          <li>Any defects will be corrected</li>
        </ul>
        <p>
          Some jurisdictions do not allow the exclusion of certain warranties, so some of the above exclusions may not apply to you.
        </p>
      </section>

      <section id="liability" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">16. Limitation of Liability</h2>
        <p className="mb-4 uppercase font-semibold">
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, SSB AND ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, LICENSORS, AND SERVICE PROVIDERS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES.
        </p>
        <p className="mb-4">This includes, without limitation, any:</p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>Loss of profits, revenue, data, goodwill, or other intangible losses</li>
          <li>Trading or investment losses of any kind</li>
          <li>Damages resulting from your use of or inability to use the platform</li>
          <li>Damages resulting from reliance on any information, analytics, or output provided through SSB</li>
          <li>Damages resulting from unauthorized access to or alteration of your data</li>
          <li>Damages resulting from third-party service failures or data inaccuracies</li>
        </ul>
        <p className="mb-4">
          In no event shall SSB&apos;s total aggregate liability to you for all claims arising out of or relating to these Terms or your use of the platform exceed the greater of (a) the total amount you paid to SSB in the twelve (12) months immediately preceding the event giving rise to the claim, or (b) one hundred U.S. dollars ($100).
        </p>
        <p>
          The limitations in this section apply regardless of the theory of liability (contract, tort, strict liability, or otherwise) and even if SSB has been advised of the possibility of such damages. Some jurisdictions do not allow certain limitations of liability; in those jurisdictions, our liability shall be limited to the maximum extent permitted by law.
        </p>
      </section>

      <section id="indemnification" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">17. Indemnification</h2>
        <p className="mb-4">
          You agree to defend, indemnify, and hold harmless SSB and its affiliates, officers, directors, employees, agents, licensors, and service providers from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys&apos; fees) arising out of or relating to:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>Your use of or access to the platform</li>
          <li>Your violation of these Terms</li>
          <li>Your violation of any applicable law or regulation</li>
          <li>Any investment or financial decisions you make based on information obtained from the platform</li>
          <li>Your use of the advisor platform in connection with services you provide to third parties</li>
          <li>Your use of API access in downstream applications or services you operate</li>
          <li>Any content you submit, post, or transmit through the platform</li>
          <li>Your infringement of any third-party intellectual property rights</li>
        </ul>
      </section>

      <section id="dispute" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">18. Dispute Resolution &amp; Arbitration</h2>
        <div className="p-4 bg-amber-900/30 border border-amber-700 rounded-lg mb-4">
          <p className="font-semibold text-amber-200">
            Please read this section carefully. It affects your legal rights, including your right to file a lawsuit in court.
          </p>
        </div>
        <h3 className="text-lg font-medium mb-2">Informal Resolution First</h3>
        <p className="mb-4">
          Before initiating any legal proceeding, you agree to contact us at the address in Section 22 and attempt to resolve the dispute informally. We will attempt to resolve any dispute within thirty (30) days. If not resolved, either party may initiate arbitration as described below.
        </p>
        <h3 className="text-lg font-medium mb-2">Binding Arbitration</h3>
        <p className="mb-4">
          Except for claims that qualify for small claims court, all disputes, claims, or controversies arising out of or relating to these Terms or the use of SSB (including any claim that any part of these Terms is invalid, illegal, or unenforceable) shall be resolved by binding individual arbitration administered by the American Arbitration Association (&quot;AAA&quot;) under its Consumer Arbitration Rules. The arbitration shall be conducted in English. The arbitrator&apos;s decision will be final and binding.
        </p>
        <h3 className="text-lg font-medium mb-2">Class Action Waiver</h3>
        <p className="mb-4">
          <strong>YOU AND SSB AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS, COLLECTIVE, CONSOLIDATED, OR REPRESENTATIVE ACTION.</strong> The arbitrator may not consolidate more than one person&apos;s claims and may not preside over any form of a representative or class proceeding.
        </p>
        <h3 className="text-lg font-medium mb-2">Opt-Out</h3>
        <p>
          You may opt out of the arbitration agreement by sending written notice to us within thirty (30) days of first accepting these Terms. Opting out does not affect any other part of these Terms.
        </p>
      </section>

      <section id="governing-law" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">19. Governing Law</h2>
        <p className="mb-4">
          These Terms and any dispute arising out of or relating to them or the use of SSB shall be governed by and construed in accordance with the laws of the United States and the laws of the State of California, without regard to conflict-of-law principles.
        </p>
        <p>
          Subject to the arbitration agreement in Section 18, you and SSB consent to the exclusive jurisdiction of the state and federal courts located in California for the resolution of any disputes not subject to arbitration.
        </p>
      </section>

      <section id="billing-cancellation" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">20. Subscription, Billing &amp; Cancellation</h2>

        <h3 className="text-lg font-medium mb-2">Subscription Plans</h3>
        <p className="mb-4">
          SSB offers a Free plan and paid subscription plans (Starter, Pro, Institutional) billed on a monthly or annual basis. Plan features and pricing are described at{' '}
          <a href="/pricing" className="text-primary hover:underline">/pricing</a>. We reserve the right to change plan pricing or features upon reasonable notice.
        </p>

        <h3 className="text-lg font-medium mb-2">Billing</h3>
        <p className="mb-4">
          By subscribing to a paid plan, you authorize SSB to charge your payment method on a recurring basis at the beginning of each billing period. All charges are in U.S. dollars. Taxes may apply depending on your jurisdiction and will be added to your invoice where required. All payments are processed through Stripe — SSB does not store your full payment card information.
        </p>

        <h3 className="text-lg font-medium mb-2">Cancellation</h3>
        <p className="mb-4">
          You may cancel your subscription at any time through the Billing section of your account settings or by contacting us at smartstrategiesbuilder@gmail.com. Cancellations take effect at the end of the current billing period. You retain full access to your paid plan features until the end of the period for which you have already paid. No early termination fees apply.
        </p>

        <h3 className="text-lg font-medium mb-2">Refunds</h3>
        <p className="mb-4">
          <strong>Monthly plans:</strong> No prorated refunds are issued for unused days within a billing period. Your access continues until the end of the month you paid for.
        </p>
        <p className="mb-4">
          <strong>Annual plans:</strong> Annual subscriptions are billed upfront. No prorated refunds are issued for the unused portion of an annual term upon cancellation, except where required by applicable law (including California law).
        </p>
        <p className="mb-4">
          <strong>Refund requests:</strong> We evaluate refund requests on a case-by-case basis for extenuating circumstances. To request a refund, contact us within 7 days of the charge at smartstrategiesbuilder@gmail.com. Approved refunds are processed within 5–10 business days.
        </p>

        <h3 className="text-lg font-medium mb-2">Downgrades</h3>
        <p className="mb-4">
          You may downgrade to a lower plan at any time. The downgrade takes effect at the start of your next billing period. You retain your current plan&apos;s features until then. No refund is issued for the difference in plan price.
        </p>

        <h3 className="text-lg font-medium mb-2">Failed Payments</h3>
        <p className="mb-4">
          If a payment fails, we will notify you and may attempt to reprocess the charge. If payment remains outstanding, your account may be downgraded to the Free plan and access to paid features may be suspended until the balance is resolved.
        </p>

        <h3 className="text-lg font-medium mb-2">Early Access</h3>
        <p>
          During any early access or beta period, all plan features may be available at no cost and no real charges will occur. When paid billing is activated, we will notify you in advance and require your explicit action to begin a paid subscription. No charges will be applied automatically or without your consent.
        </p>
      </section>

      <section id="termination" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">21. Termination</h2>
        <p className="mb-4">
          We reserve the right to suspend, restrict, or terminate your access to SSB at any time, with or without cause, and with or without notice, including but not limited to for violations of these Terms, suspected fraudulent activity, or legal obligations.
        </p>
        <p className="mb-4">
          Upon termination, your right to use the platform ceases immediately. Sections 3, 4, 14, 15, 16, 17, 18, and 19 survive termination of these Terms.
        </p>
        <p>
          You may terminate your account at any time by contacting us or using the account deletion feature in settings.
        </p>
      </section>

      <section id="changes" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">22. Changes to Terms</h2>
        <p className="mb-4">
          We may modify these Terms of Service at any time at our sole discretion. Changes will be effective when posted on this page with an updated &quot;Last updated&quot; date. For material changes, we will make reasonable efforts to notify you (such as through an in-app notice or email). Your continued use of SSB after changes are posted constitutes your acceptance of the modified Terms.
        </p>
        <p>
          We encourage you to review these Terms periodically. If you do not agree to the modified Terms, you must stop using the platform.
        </p>
      </section>

      <section id="contact" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">23. Contact</h2>
        <p className="mb-4">
          If you have questions about these Terms of Service, please contact us at:
        </p>
        <p className="font-medium">
          smartstrategiesbuilder@gmail.com
        </p>
      </section>

      {/* Related Links */}
      <div className="mt-12 pt-8 border-t">
        <p className="text-sm text-muted-foreground mb-4">Related policies:</p>
        <div className="flex gap-4">
          <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
          <Link href="/disclaimer" className="text-primary hover:underline">Trading Disclaimer</Link>
        </div>
      </div>
    </LegalPageLayout>
  );
}

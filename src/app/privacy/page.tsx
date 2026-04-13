import { Metadata } from 'next';
import Link from 'next/link';
import { LegalPageLayout } from '@/components/legal';

export const metadata: Metadata = {
  title: 'Privacy Policy - Smart Strategies Builder',
  description: 'Privacy Policy for Smart Strategies Builder (SSB) platform.',
};

const LAST_UPDATED = 'April 13, 2026';

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated={LAST_UPDATED}>
      {/* Table of Contents */}
      <nav className="mb-8 p-4 bg-muted rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Contents</h2>
        <ul className="space-y-1 text-sm">
          <li><a href="#collect" className="text-primary hover:underline">1. Information We Collect</a></li>
          <li><a href="#financial-data" className="text-primary hover:underline">2. Financial Account Data</a></li>
          <li><a href="#use" className="text-primary hover:underline">3. How We Use Your Information</a></li>
          <li><a href="#sharing" className="text-primary hover:underline">4. Information Sharing</a></li>
          <li><a href="#third-party-providers" className="text-primary hover:underline">5. Third-Party Service Providers</a></li>
          <li><a href="#cookies" className="text-primary hover:underline">6. Cookies &amp; Local Storage</a></li>
          <li><a href="#retention" className="text-primary hover:underline">7. Data Retention</a></li>
          <li><a href="#security" className="text-primary hover:underline">8. Security</a></li>
          <li><a href="#choices" className="text-primary hover:underline">9. Your Choices &amp; Rights</a></li>
          <li><a href="#california" className="text-primary hover:underline">10. California &amp; State Privacy Rights</a></li>
          <li><a href="#children" className="text-primary hover:underline">11. Children&apos;s Privacy</a></li>
          <li><a href="#changes" className="text-primary hover:underline">12. Changes to This Policy</a></li>
          <li><a href="#contact" className="text-primary hover:underline">13. Contact Us</a></li>
        </ul>
      </nav>

      {/* Introduction */}
      <p className="mb-8 text-lg">
        This Privacy Policy describes how Smart Strategies Builder (&quot;SSB,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects, uses, shares, and protects your personal information when you use our platform. By using SSB, you agree to the collection and use of information in accordance with this Policy.
      </p>

      {/* Content */}
      <section id="collect" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>

        <h3 className="text-lg font-medium mb-2">Account Information</h3>
        <p className="mb-4">When you create an account, we collect:</p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>Email address</li>
          <li>Full name (optional)</li>
          <li>Password (stored in hashed/encrypted form — plaintext is never retained)</li>
          <li>Account preferences and settings</li>
          <li>Subscription tier and billing history</li>
          <li>Multi-factor authentication configuration</li>
        </ul>

        <h3 className="text-lg font-medium mb-2">Usage Information</h3>
        <p className="mb-4">We automatically collect information about your use of SSB:</p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>Features accessed and actions taken within the platform</li>
          <li>Paper trading activity and simulation results</li>
          <li>Analytical queries and backtest configurations</li>
          <li>Preferences and settings changes</li>
          <li>API key usage (when using programmatic access)</li>
        </ul>

        <h3 className="text-lg font-medium mb-2">Device &amp; Technical Information</h3>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>Browser type and version</li>
          <li>Operating system</li>
          <li>IP address</li>
          <li>Device identifiers</li>
          <li>Timezone and language settings</li>
          <li>Referring URL and exit pages</li>
        </ul>

        <h3 className="text-lg font-medium mb-2">Log &amp; Security Data</h3>
        <p>
          We maintain logs for security, debugging, and audit purposes. These logs may include access times, pages viewed, error messages, API calls, authentication events, and referring URLs. Audit logs are retained to fulfill compliance and security obligations.
        </p>

        <h3 className="text-lg font-medium mb-2 mt-6">Advisor CRM Data (Enterprise Plan)</h3>
        <p className="mb-4">
          Users on the Enterprise (institutional) plan who use the Advisor CRM feature may enter and store information about their own clients within the platform. This data is entered by the advisor and is not collected directly from the advisor&apos;s clients by SSB. This may include:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>Client contact details (name, email, phone number)</li>
          <li>Client financial profile (assets under management, risk tolerance, investment horizon)</li>
          <li>KYC / suitability data (date of birth, occupation, employer, annual income, net worth)</li>
          <li>Fee structure and segmentation classification</li>
          <li>Advisor-entered notes, meeting summaries, and call logs</li>
          <li>Task and follow-up records</li>
          <li>Model portfolio assignments</li>
        </ul>
        <p className="mb-4">
          This data is stored on behalf of the advisor user and is used solely to provide the Advisor CRM functionality. SSB does not independently use, analyze, or share this data beyond what is necessary to render the service. Advisors are solely responsible for ensuring they have appropriate authorization and consent from their own clients to enter and store such data on the SSB platform, and for compliance with applicable financial regulations (including KYC/AML obligations).
        </p>
      </section>

      <section id="financial-data" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Financial Account Data</h2>
        <div className="p-4 bg-blue-900/30 border border-blue-700 rounded-lg mb-4">
          <p className="font-semibold text-blue-200">
            If you choose to connect a brokerage account, we collect and store certain financial data. This section explains exactly what we collect and how we use it.
          </p>
        </div>

        <h3 className="text-lg font-medium mb-2">What We Collect via Broker Connections</h3>
        <p className="mb-4">
          When you connect a brokerage account through our third-party data aggregation provider (Plaid Financial Ltd.), we receive and store:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>Holdings (security name, ticker symbol, quantity, estimated value)</li>
          <li>Account balances (cash balance, total account value)</li>
          <li>Account type and institution name</li>
          <li>An access token issued by the data provider (not your brokerage login credentials)</li>
        </ul>
        <p className="mb-4">
          <strong>We do not receive, store, or have access to your brokerage username, password, or any credentials you enter into Plaid&apos;s interface.</strong> Those credentials are handled exclusively by Plaid under their own privacy policy.
        </p>

        <h3 className="text-lg font-medium mb-2">How We Use Financial Account Data</h3>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>To display your portfolio summary, sector allocations, and P&amp;L within the platform</li>
          <li>To power portfolio analytics, benchmarking, wash-sale detection, and comparison features</li>
          <li>To enable the paper trading import feature (copy holdings to a simulated account)</li>
          <li>To populate order preparation tools for your reference</li>
        </ul>

        <h3 className="text-lg font-medium mb-2">What We Do Not Do with Financial Account Data</h3>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>We do not sell your financial account data to any third party</li>
          <li>We do not use your holdings data to place trades in your live accounts (except through any explicitly activated restricted execution feature)</li>
          <li>We do not share your specific holdings data with advertisers or data brokers</li>
          <li>We do not use your holdings data to provide personalized investment advice</li>
        </ul>

        <h3 className="text-lg font-medium mb-2">Disconnecting a Broker Account</h3>
        <p>
          You may disconnect a broker account at any time in your account settings. This revokes SSB&apos;s access token and stops future data retrieval. Previously cached holdings and balance data will be retained for up to 30 days and then deleted unless a longer retention period is required by law. To request immediate deletion, contact us at the address in Section 13.
        </p>
      </section>

      <section id="use" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
        <p className="mb-4">We use your information to:</p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li><strong>Provide our services:</strong> Authenticate your account, deliver features, process your requests, and power analytics</li>
          <li><strong>Improve the platform:</strong> Analyze aggregate usage patterns, fix bugs, and develop new features. We use anonymized or aggregated data where possible</li>
          <li><strong>Ensure security:</strong> Detect fraud, prevent abuse, monitor for unauthorized access, and maintain audit logs</li>
          <li><strong>Communicate:</strong> Send account notifications, security alerts, and (if opted-in) product updates and newsletters</li>
          <li><strong>Provide support:</strong> Respond to your inquiries, diagnose issues, and resolve disputes</li>
          <li><strong>Process payments:</strong> Manage your subscription and billing through our payment processor</li>
          <li><strong>Comply with legal obligations:</strong> Meet regulatory requirements, respond to valid legal process, and enforce our Terms</li>
        </ul>
        <p>
          We do not use your personal information for automated decision-making that produces legal or similarly significant effects without human review.
        </p>
      </section>

      <section id="sharing" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Information Sharing</h2>
        <div className="p-4 bg-green-900/30 border border-green-700 rounded-lg mb-4">
          <p className="font-semibold text-green-200">
            We do not sell your personal information or financial account data to third parties.
          </p>
        </div>
        <p className="mb-4">We may share your information only in the following circumstances:</p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li><strong>Service providers:</strong> Companies that help us operate the platform (cloud hosting, payment processing, email delivery, analytics, error monitoring). These providers are contractually bound to protect your information and use it only for the purposes we specify.</li>
          <li><strong>Data aggregation providers:</strong> We share necessary information with Plaid Financial Ltd. to facilitate broker account connections you have authorized.</li>
          <li><strong>Legal requirements:</strong> When required by law, valid court order, subpoena, or other legal process, or when we believe in good faith that disclosure is necessary to protect our rights, your safety, or the safety of others.</li>
          <li><strong>Business transfers:</strong> In connection with a merger, acquisition, bankruptcy, or sale of all or substantially all of our assets, in which case your information may be transferred. We will notify you before your information becomes subject to a materially different privacy policy.</li>
          <li><strong>With your consent:</strong> In other circumstances where you have explicitly consented to the sharing.</li>
        </ul>
      </section>

      <section id="third-party-providers" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Third-Party Service Providers</h2>
        <p className="mb-4">
          We use the following categories of third-party service providers that may have access to certain personal information as necessary to provide their services:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li><strong>Cloud infrastructure:</strong> Hosting and database services that store your account and usage data</li>
          <li><strong>Financial data aggregation:</strong> Plaid Financial Ltd. for broker account connections — governed by Plaid&apos;s Privacy Policy</li>
          <li><strong>Payment processing:</strong> Third-party payment processor for subscription billing — your full card number is not stored by SSB</li>
          <li><strong>Email delivery:</strong> Transactional and notification email services</li>
          <li><strong>Error monitoring:</strong> Services that capture application errors and performance data to help us fix issues</li>
          <li><strong>Analytics:</strong> Usage analytics to help us understand how the platform is used in aggregate</li>
        </ul>
        <p>
          All service providers are required by contract to implement appropriate security measures and to process your information only as directed by us and consistent with this Privacy Policy.
        </p>
      </section>

      <section id="cookies" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Cookies &amp; Local Storage</h2>
        <p className="mb-4">We use cookies and browser local storage to:</p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>Maintain your authenticated session (session cookies — required for the platform to function)</li>
          <li>Remember your preferences, such as theme and display settings</li>
          <li>Improve security (CSRF protection tokens)</li>
          <li>Analyze platform usage in aggregate (analytics cookies)</li>
        </ul>
        <p className="mb-4">
          We do not use third-party advertising cookies or cross-site tracking cookies. Most web browsers allow you to control or disable cookies through browser settings. Note that disabling certain cookies may impair the functionality of the platform.
        </p>
      </section>

      <section id="retention" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
        <p className="mb-4">We retain your information for as long as:</p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>Your account is active and you are using our services</li>
          <li>Needed to provide the services you have requested</li>
          <li>Required by applicable law, regulation, or legal process</li>
          <li>Necessary for legitimate business purposes such as fraud prevention, dispute resolution, or enforcing our agreements</li>
        </ul>
        <p className="mb-4">
          When you delete your account, we will delete or anonymize your personal information within 30 days, except:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>Security and audit logs, which may be retained for up to 12 months</li>
          <li>Financial transaction records (subscription payments), which may be retained as required by law</li>
          <li>Anonymized or aggregated data that no longer identifies you, which we may retain indefinitely</li>
        </ul>
      </section>

      <section id="security" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. Security</h2>
        <p className="mb-4">We implement technical and organizational security measures to protect your information, including:</p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>Encryption of all data in transit using TLS/HTTPS</li>
          <li>Encryption of sensitive data at rest</li>
          <li>Hashed storage of passwords (never stored in plaintext)</li>
          <li>Multi-factor authentication options</li>
          <li>Regular security monitoring and audit logging</li>
          <li>Access controls limiting employee access to personal data on a need-to-know basis</li>
        </ul>
        <p className="mb-4">
          While we implement industry-standard security practices, no system is 100% secure. We cannot guarantee absolute security of your information. In the event of a data breach that affects your personal information, we will notify you as required by applicable law.
        </p>
        <p>
          We encourage you to use a strong, unique password and to enable multi-factor authentication on your account.
        </p>
      </section>

      <section id="choices" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">9. Your Choices &amp; Rights</h2>
        <p className="mb-4">You have the following rights regarding your personal information:</p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
          <li><strong>Correction:</strong> Update inaccurate or incomplete information through your account settings or by contacting us</li>
          <li><strong>Deletion:</strong> Request deletion of your account and associated personal data (subject to retention obligations described above)</li>
          <li><strong>Portability:</strong> Request an export of your data in a machine-readable format</li>
          <li><strong>Opt-out of marketing:</strong> Unsubscribe from marketing communications at any time using the unsubscribe link in any email or through account settings</li>
          <li><strong>Broker disconnection:</strong> Disconnect any linked brokerage account at any time through account settings</li>
          <li><strong>API key revocation:</strong> Revoke any API key at any time through the enterprise settings</li>
        </ul>
        <p>
          To exercise any of these rights, use your account settings or contact us at the address in Section 13. We will respond to verified requests within 30 days (or as otherwise required by applicable law).
        </p>
      </section>

      <section id="california" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">10. California &amp; State Privacy Rights</h2>

        <h3 className="text-lg font-medium mb-2">California Residents (CCPA / CPRA)</h3>
        <p className="mb-4">
          If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA):
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li><strong>Right to Know:</strong> Request disclosure of the categories and specific pieces of personal information we have collected about you in the past 12 months</li>
          <li><strong>Right to Delete:</strong> Request deletion of personal information we have collected from you, subject to certain exceptions</li>
          <li><strong>Right to Correct:</strong> Request correction of inaccurate personal information</li>
          <li><strong>Right to Opt-Out of Sale/Sharing:</strong> We do not sell or share your personal information as defined under the CCPA/CPRA. No opt-out is needed, but you may contact us to confirm.</li>
          <li><strong>Right to Limit Use of Sensitive Personal Information:</strong> We use sensitive personal information (including financial account data) only for the purposes described in this Policy, consistent with CPRA limitations</li>
          <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising your privacy rights</li>
        </ul>
        <p className="mb-4">
          To exercise California privacy rights, contact us at the address in Section 13. We do not charge a fee for reasonable requests and will verify your identity before processing requests.
        </p>

        <h3 className="text-lg font-medium mb-2">Other U.S. State Residents</h3>
        <p>
          Residents of Virginia (VCDPA), Colorado (CPA), Connecticut (CTDPA), and other states with comprehensive privacy laws have similar rights to access, correct, delete, and obtain a copy of their personal data. Contact us at the address in Section 13 to exercise these rights.
        </p>
      </section>

      <section id="children" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">11. Children&apos;s Privacy</h2>
        <p>
          SSB is not directed to or intended for use by individuals under 18 years of age. We do not knowingly collect personal information from children under 18. If you believe that a child under 18 has provided us with personal information, please contact us immediately at the address in Section 13 and we will take steps to delete such information.
        </p>
      </section>

      <section id="changes" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">12. Changes to This Policy</h2>
        <p className="mb-4">
          We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated &quot;Last updated&quot; date. For material changes — particularly those involving new categories of data collection or significant changes to how we use your data — we will notify you through an in-app notice or by email prior to the change taking effect.
        </p>
        <p>
          Your continued use of SSB after the effective date of any updated Policy constitutes your acceptance of the revised Policy. If you do not agree to the updated Policy, you must discontinue use of the platform.
        </p>
      </section>

      <section id="contact" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">13. Contact Us</h2>
        <p className="mb-4">
          If you have questions about this Privacy Policy, our data practices, or wish to exercise your privacy rights, please contact us at:
        </p>
        <p className="font-medium">
          privacy@smartstrategiesbuilder.com
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          We will respond to privacy requests within 30 days, or as otherwise required by applicable law.
        </p>
      </section>

      {/* Related Links */}
      <div className="mt-12 pt-8 border-t">
        <p className="text-sm text-muted-foreground mb-4">Related policies:</p>
        <div className="flex gap-4">
          <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
          <Link href="/disclaimer" className="text-primary hover:underline">Trading Disclaimer</Link>
        </div>
      </div>
    </LegalPageLayout>
  );
}

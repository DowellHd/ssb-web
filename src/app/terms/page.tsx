import { Metadata } from 'next';
import Link from 'next/link';
import { LegalPageLayout } from '@/components/legal';

export const metadata: Metadata = {
  title: 'Terms of Service - Smart Strategies Builder',
  description: 'Terms of Service for Smart Strategies Builder (SSB) platform.',
};

const LAST_UPDATED = 'February 1, 2025';

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
          <li><a href="#no-brokerage" className="text-primary hover:underline">4. No Brokerage / No Trade Execution</a></li>
          <li><a href="#account" className="text-primary hover:underline">5. Account & Security</a></li>
          <li><a href="#acceptable-use" className="text-primary hover:underline">6. Acceptable Use</a></li>
          <li><a href="#data" className="text-primary hover:underline">7. Data & Market Information</a></li>
          <li><a href="#paper-trading" className="text-primary hover:underline">8. Paper Trading</a></li>
          <li><a href="#third-party" className="text-primary hover:underline">9. Third-Party Services</a></li>
          <li><a href="#ip" className="text-primary hover:underline">10. Intellectual Property</a></li>
          <li><a href="#warranties" className="text-primary hover:underline">11. Disclaimers of Warranties</a></li>
          <li><a href="#liability" className="text-primary hover:underline">12. Limitation of Liability</a></li>
          <li><a href="#termination" className="text-primary hover:underline">13. Termination</a></li>
          <li><a href="#changes" className="text-primary hover:underline">14. Changes to Terms</a></li>
          <li><a href="#contact" className="text-primary hover:underline">15. Contact</a></li>
        </ul>
      </nav>

      {/* Content */}
      <section id="acceptance" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
        <p className="mb-4">
          By accessing or using Smart Strategies Builder ("SSB," "we," "us," or "our"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the platform.
        </p>
        <p>
          These terms constitute a legally binding agreement between you and SSB governing your access to and use of the platform, including any content, functionality, and services offered.
        </p>
      </section>

      <section id="eligibility" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Eligibility</h2>
        <p className="mb-4">
          You must be at least 18 years old to use SSB. By using this platform, you represent and warrant that you meet this age requirement and have the legal capacity to enter into this agreement.
        </p>
        <p>
          You are responsible for ensuring that your use of SSB complies with all applicable laws and regulations in your jurisdiction.
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
          All analytics, insights, simulations, and content provided through SSB are for educational purposes. You should not rely on any information from SSB to make financial decisions.
        </p>
        <p>
          Always consult with qualified professionals (financial advisors, accountants, lawyers) before making any investment or financial decisions.
        </p>
      </section>

      <section id="no-brokerage" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. No Brokerage / No Trade Execution</h2>
        <p className="mb-4">
          SSB is <strong>not</strong> a broker, dealer, or registered investment advisor. We do not:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>Execute trades on your behalf</li>
          <li>Hold or manage your money or securities</li>
          <li>Provide personalized investment recommendations</li>
          <li>Guarantee any investment returns or outcomes</li>
        </ul>
        <p>
          Any "paper trading" or simulation features are entirely simulated and use virtual funds only. No real money is involved, and no actual securities transactions occur.
        </p>
      </section>

      <section id="account" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Account & Security</h2>
        <p className="mb-4">
          You are responsible for maintaining the confidentiality of your account credentials. You agree to:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>Use a strong, unique password</li>
          <li>Enable multi-factor authentication when available</li>
          <li>Notify us immediately of any unauthorized access</li>
          <li>Not share your account with others</li>
        </ul>
        <p>
          We are not liable for any loss or damage arising from your failure to protect your account credentials.
        </p>
      </section>

      <section id="acceptable-use" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Acceptable Use</h2>
        <p className="mb-4">You agree not to:</p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>Use SSB for any unlawful purpose</li>
          <li>Attempt to gain unauthorized access to our systems</li>
          <li>Interfere with or disrupt the platform's operation</li>
          <li>Scrape, harvest, or collect data without permission</li>
          <li>Reverse engineer or decompile any part of the platform</li>
          <li>Use the platform for commercial redistribution without authorization</li>
        </ul>
      </section>

      <section id="data" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Data & Market Information</h2>
        <p className="mb-4">
          Market data, quotes, and other financial information displayed on SSB may be:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>Delayed by 15 minutes or more</li>
          <li>Subject to inaccuracies or errors</li>
          <li>Sourced from third-party providers with their own terms</li>
          <li>Subject to interruptions or outages</li>
        </ul>
        <p>
          We do not guarantee the accuracy, completeness, or timeliness of any market data. Do not rely on this data for real trading decisions.
        </p>
      </section>

      <section id="paper-trading" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. Paper Trading</h2>
        <p className="mb-4">
          SSB's paper trading feature uses simulated funds and does not involve real money. Key points:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>All trades are simulated with virtual currency</li>
          <li>Results do not reflect actual trading conditions</li>
          <li>Simulated fills may differ from real market execution</li>
          <li>Past performance in simulation does not predict real trading results</li>
          <li>Emotional factors differ when real money is not at stake</li>
        </ul>
      </section>

      <section id="third-party" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">9. Third-Party Services</h2>
        <p className="mb-4">
          SSB may integrate with or link to third-party services. We are not responsible for the content, accuracy, or practices of third-party services. Your use of third-party services is governed by their respective terms and policies.
        </p>
      </section>

      <section id="ip" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">10. Intellectual Property</h2>
        <p className="mb-4">
          All content, features, and functionality of SSB, including but not limited to text, graphics, logos, icons, software, and code, are the exclusive property of SSB or its licensors and are protected by intellectual property laws.
        </p>
        <p>
          You may not copy, modify, distribute, or create derivative works based on SSB content without our express written permission.
        </p>
      </section>

      <section id="warranties" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">11. Disclaimers of Warranties</h2>
        <p className="mb-4 uppercase font-semibold">
          SSB IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.
        </p>
        <p className="mb-4">
          We do not warrant that the platform will be uninterrupted, error-free, secure, or free of viruses. We disclaim all warranties, including but not limited to merchantability, fitness for a particular purpose, and non-infringement.
        </p>
      </section>

      <section id="liability" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">12. Limitation of Liability</h2>
        <p className="mb-4">
          To the maximum extent permitted by law, SSB and its affiliates, officers, directors, employees, and agents shall not be liable for:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>Any indirect, incidental, special, consequential, or punitive damages</li>
          <li>Any loss of profits, data, use, goodwill, or other intangible losses</li>
          <li>Any damages resulting from your use or inability to use the platform</li>
          <li>Any damages resulting from reliance on information provided through SSB</li>
          <li>Any trading or investment losses</li>
        </ul>
      </section>

      <section id="termination" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">13. Termination</h2>
        <p className="mb-4">
          We reserve the right to suspend or terminate your access to SSB at any time, with or without cause, and with or without notice. Upon termination, your right to use the platform ceases immediately.
        </p>
        <p>
          You may also terminate your account at any time by contacting us or using the account deletion feature in settings.
        </p>
      </section>

      <section id="changes" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">14. Changes to Terms</h2>
        <p className="mb-4">
          We may modify these Terms of Service at any time. Changes will be effective when posted on this page with an updated "Last updated" date. Your continued use of SSB after changes constitutes acceptance of the modified terms.
        </p>
        <p>
          We encourage you to review these terms periodically for any changes.
        </p>
      </section>

      <section id="contact" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">15. Contact</h2>
        <p className="mb-4">
          If you have questions about these Terms of Service, please contact us at:
        </p>
        <p className="font-medium">
          support@smartstrategiesbuilder.com
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

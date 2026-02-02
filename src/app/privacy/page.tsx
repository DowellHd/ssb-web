import { Metadata } from 'next';
import Link from 'next/link';
import { LegalPageLayout } from '@/components/legal';

export const metadata: Metadata = {
  title: 'Privacy Policy - Smart Strategies Builder',
  description: 'Privacy Policy for Smart Strategies Builder (SSB) platform.',
};

const LAST_UPDATED = 'February 1, 2025';

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated={LAST_UPDATED}>
      {/* Table of Contents */}
      <nav className="mb-8 p-4 bg-muted rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Contents</h2>
        <ul className="space-y-1 text-sm">
          <li><a href="#collect" className="text-primary hover:underline">1. Information We Collect</a></li>
          <li><a href="#use" className="text-primary hover:underline">2. How We Use Your Information</a></li>
          <li><a href="#sharing" className="text-primary hover:underline">3. Information Sharing</a></li>
          <li><a href="#cookies" className="text-primary hover:underline">4. Cookies & Local Storage</a></li>
          <li><a href="#retention" className="text-primary hover:underline">5. Data Retention</a></li>
          <li><a href="#security" className="text-primary hover:underline">6. Security</a></li>
          <li><a href="#choices" className="text-primary hover:underline">7. Your Choices & Rights</a></li>
          <li><a href="#children" className="text-primary hover:underline">8. Children's Privacy</a></li>
          <li><a href="#changes" className="text-primary hover:underline">9. Changes to This Policy</a></li>
          <li><a href="#contact" className="text-primary hover:underline">10. Contact Us</a></li>
        </ul>
      </nav>

      {/* Introduction */}
      <p className="mb-8 text-lg">
        This Privacy Policy describes how Smart Strategies Builder ("SSB," "we," "us," or "our") collects, uses, and protects your personal information when you use our platform.
      </p>

      {/* Content */}
      <section id="collect" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>

        <h3 className="text-lg font-medium mb-2">Account Information</h3>
        <p className="mb-4">When you create an account, we collect:</p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>Email address</li>
          <li>Full name (optional)</li>
          <li>Password (encrypted)</li>
          <li>Account preferences and settings</li>
        </ul>

        <h3 className="text-lg font-medium mb-2">Usage Information</h3>
        <p className="mb-4">We automatically collect information about your use of SSB:</p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>Features accessed and actions taken</li>
          <li>Paper trading activity and simulation results</li>
          <li>Preferences and settings changes</li>
          <li>Search queries within the platform</li>
        </ul>

        <h3 className="text-lg font-medium mb-2">Device & Technical Information</h3>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>Browser type and version</li>
          <li>Operating system</li>
          <li>IP address</li>
          <li>Device identifiers</li>
          <li>Timezone and language settings</li>
        </ul>

        <h3 className="text-lg font-medium mb-2">Log Data</h3>
        <p>
          We maintain logs for security, debugging, and audit purposes. These logs may include access times, pages viewed, error messages, and referring URLs.
        </p>
      </section>

      <section id="use" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
        <p className="mb-4">We use your information to:</p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li><strong>Provide our services:</strong> Authenticate your account, deliver features, and process your requests</li>
          <li><strong>Improve the platform:</strong> Analyze usage patterns, fix bugs, and develop new features</li>
          <li><strong>Ensure security:</strong> Detect fraud, prevent abuse, and protect against unauthorized access</li>
          <li><strong>Communicate:</strong> Send account notifications, security alerts, and (if opted-in) product updates</li>
          <li><strong>Provide support:</strong> Respond to your inquiries and resolve issues</li>
          <li><strong>Comply with legal obligations:</strong> Meet regulatory requirements and respond to legal requests</li>
        </ul>
      </section>

      <section id="sharing" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
        <div className="p-4 bg-green-900/30 border border-green-700 rounded-lg mb-4">
          <p className="font-semibold text-green-200">
            We do not sell your personal information to third parties.
          </p>
        </div>
        <p className="mb-4">We may share your information with:</p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li><strong>Service providers:</strong> Companies that help us operate the platform (hosting, analytics, email delivery)</li>
          <li><strong>Legal requirements:</strong> When required by law, legal process, or to protect our rights</li>
          <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
        </ul>
        <p>
          All service providers are contractually bound to protect your information and use it only for the purposes we specify.
        </p>
      </section>

      <section id="cookies" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Cookies & Local Storage</h2>
        <p className="mb-4">We use cookies and browser local storage to:</p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>Keep you logged in (session cookies)</li>
          <li>Remember your preferences (theme, settings)</li>
          <li>Improve security (CSRF tokens)</li>
          <li>Analyze platform usage (analytics)</li>
        </ul>
        <p className="mb-4">
          Most web browsers allow you to control cookies through settings. Note that disabling cookies may affect platform functionality.
        </p>
      </section>

      <section id="retention" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Data Retention</h2>
        <p className="mb-4">We retain your information for as long as:</p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>Your account is active</li>
          <li>Needed to provide our services</li>
          <li>Required by law or for legitimate business purposes</li>
        </ul>
        <p>
          When you delete your account, we will delete or anonymize your personal information within 30 days, except where retention is required by law.
        </p>
      </section>

      <section id="security" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Security</h2>
        <p className="mb-4">We implement security measures to protect your information:</p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>Encryption of data in transit (TLS/HTTPS)</li>
          <li>Encryption of sensitive data at rest</li>
          <li>Multi-factor authentication options</li>
          <li>Regular security audits and monitoring</li>
          <li>Access controls and employee training</li>
        </ul>
        <p>
          While we strive to protect your information, no system is 100% secure. We encourage you to use strong passwords and enable MFA.
        </p>
      </section>

      <section id="choices" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Your Choices & Rights</h2>
        <p className="mb-4">You have the right to:</p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li><strong>Access:</strong> Request a copy of your personal information</li>
          <li><strong>Correct:</strong> Update inaccurate information in your account settings</li>
          <li><strong>Delete:</strong> Request deletion of your account and associated data</li>
          <li><strong>Export:</strong> Download your data in a portable format</li>
          <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
        </ul>
        <p>
          To exercise these rights, use the settings in your account or contact us at the email below.
        </p>
      </section>

      <section id="children" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. Children's Privacy</h2>
        <p>
          SSB is not intended for children under 18. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us so we can delete it.
        </p>
      </section>

      <section id="changes" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">9. Changes to This Policy</h2>
        <p className="mb-4">
          We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last updated" date.
        </p>
        <p>
          We encourage you to review this policy periodically. Continued use of SSB after changes constitutes acceptance of the updated policy.
        </p>
      </section>

      <section id="contact" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
        <p className="mb-4">
          If you have questions about this Privacy Policy or our data practices, contact us at:
        </p>
        <p className="font-medium">
          privacy@smartstrategiesbuilder.com
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

import { Metadata } from 'next';
import Link from 'next/link';
import { Check, X, FlaskConical, Zap, Building, Star, Gift } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pricing — SSB Trading Platform Plans',
  description: 'Simple, transparent pricing for SSB — the Smart Strategies Builder trading platform. Free to start, no credit card required.',
  alternates: { canonical: 'https://www.smartstrategiesbuilder.ai/pricing' },
  openGraph: {
    title: 'SSB Pricing — Smart Strategies Builder Plans',
    description: 'Free, Starter ($9/mo), Pro ($79/mo), and Institutional ($299/mo) plans. Start paper trading with SSB for free.',
    url: 'https://www.smartstrategiesbuilder.ai/pricing',
  },
};

const PLANS = [
  {
    key: 'free',
    name: 'Free',
    price: 0,
    priceYearly: 0,
    description: 'Learn the basics. No credit card required.',
    cta: 'Get Started Free',
    ctaHref: '/auth/signup',
    highlight: false,
    trial: false,
    features: [
      'Delayed regime data',
      'Basic risk analytics',
      'Limited paper trading',
      'Crypto watchlist',
      '4 free learning modules',
      'Community access',
    ],
  },
  {
    key: 'starter',
    name: 'Starter',
    price: 9,
    priceYearly: 90,
    description: 'Level up with real analytics and full paper trading.',
    cta: 'Try Free for 14 Days',
    ctaHref: '/auth/signup',
    highlight: false,
    trial: true,
    features: [
      'Reduced data delay',
      'Standard risk analytics',
      'Standard paper trading',
      'Options chain viewer',
      'Crypto portfolio tracker',
      'All 14 learning modules',
    ],
  },
  {
    key: 'pro',
    name: 'Pro',
    price: 79,
    priceYearly: 790,
    description: 'Advanced tools for serious learners and active paper traders.',
    cta: 'Try Free for 14 Days',
    ctaHref: '/auth/signup',
    highlight: true,
    badge: 'Most Popular',
    trial: true,
    features: [
      'Real-time regime data',
      'Advanced risk analytics',
      'Advanced paper trading + options',
      'Backtesting engine',
      'Monte Carlo simulation',
      'Factor & benchmark analysis',
      'Alternative investments tracker',
      'Webhooks (up to 20)',
      'Algo strategies (up to 5)',
    ],
  },
  {
    key: 'institutional',
    name: 'Institutional',
    price: 299,
    priceYearly: 2990,
    description: 'Full platform access for professionals and institutions.',
    cta: 'Get Started',
    ctaHref: '/auth/signup',
    highlight: false,
    trial: false,
    features: [
      'Real-time + priority data',
      'Full risk analytics suite',
      'Unlimited paper trading',
      'Institutional API keys',
      'Webhooks (unlimited)',
      'Advisor CRM platform',
      'Unlimited algo strategies',
      'Compliance & audit reports',
    ],
  },
];

interface ComparisonRow {
  label: string;
  free: string | boolean;
  starter: string | boolean;
  pro: string | boolean;
  institutional: string | boolean;
}

interface ComparisonSection {
  section: string;
  rows: ComparisonRow[];
}

const COMPARISON: ComparisonSection[] = [
  {
    section: 'Data & Intelligence',
    rows: [
      { label: 'Regime Data', free: 'Delayed', starter: 'Reduced delay', pro: 'Real-time', institutional: 'Real-time priority' },
      { label: 'Risk Analytics', free: 'Basic', starter: 'Standard', pro: 'Advanced', institutional: 'Full suite' },
      { label: 'Stress Testing', free: false, starter: false, pro: true, institutional: true },
      { label: 'Factor Analysis', free: false, starter: false, pro: true, institutional: true },
      { label: 'Benchmark Comparison', free: false, starter: false, pro: true, institutional: true },
      { label: 'Monte Carlo Simulation', free: false, starter: false, pro: true, institutional: true },
    ],
  },
  {
    section: 'Paper Trading & Options',
    rows: [
      { label: 'Paper Positions', free: 'Limited', starter: 'Standard', pro: 'Advanced', institutional: 'Unlimited' },
      { label: 'Options Chain Viewer', free: false, starter: true, pro: true, institutional: true },
      { label: 'Options Paper Trading', free: false, starter: false, pro: true, institutional: true },
      { label: 'Copy Real Portfolio to Paper', free: false, starter: false, pro: true, institutional: true },
    ],
  },
  {
    section: 'Analytics',
    rows: [
      { label: 'Backtesting Engine', free: false, starter: false, pro: 'Standard', institutional: 'Advanced' },
      { label: 'Portfolio Optimization (MPT)', free: false, starter: false, pro: true, institutional: true },
      { label: 'DCF & Valuation Tools', free: false, starter: false, pro: true, institutional: true },
      { label: 'Sector Rotation Analysis', free: false, starter: false, pro: true, institutional: true },
      { label: 'Wash Sale Detection', free: false, starter: true, pro: true, institutional: true },
    ],
  },
  {
    section: 'Market Data',
    rows: [
      { label: 'News Feed', free: 'Basic', starter: 'Standard', pro: 'Premium', institutional: 'Premium' },
      { label: 'Crypto Watchlist', free: true, starter: true, pro: true, institutional: true },
      { label: 'Crypto Portfolio', free: false, starter: true, pro: true, institutional: true },
      { label: 'Alternative Investments', free: false, starter: false, pro: true, institutional: true },
    ],
  },
  {
    section: 'Learning',
    rows: [
      { label: 'Learning Modules', free: '4 free modules', starter: 'All 14 modules', pro: 'All 14 modules', institutional: 'All 14 modules' },
      { label: 'Learning Paths', free: 'Beginner only', starter: 'All paths', pro: 'All paths', institutional: 'All paths' },
    ],
  },
  {
    section: 'Community',
    rows: [
      { label: 'Community Feed', free: true, starter: true, pro: true, institutional: true },
      { label: 'Trade Ideas & Posts', free: true, starter: true, pro: true, institutional: true },
      { label: 'Investment Clubs', free: 'View only', starter: 'Standard', pro: 'Standard', institutional: 'Unlimited' },
    ],
  },
  {
    section: 'Enterprise & API',
    rows: [
      { label: 'Broker Connections (Plaid)', free: true, starter: true, pro: true, institutional: true },
      { label: 'Webhooks', free: false, starter: false, pro: 'Up to 20', institutional: 'Unlimited' },
      { label: 'API Keys', free: false, starter: false, pro: false, institutional: true },
      { label: 'Advisor CRM', free: false, starter: false, pro: false, institutional: true },
      { label: 'Compliance & Audit Reports', free: false, starter: false, pro: false, institutional: true },
      { label: 'Algo Strategy Builder', free: false, starter: false, pro: 'Up to 5', institutional: 'Unlimited' },
      { label: 'Audit Log', free: true, starter: true, pro: true, institutional: true },
    ],
  },
];

function Cell({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="h-4 w-4 text-green-500 mx-auto" />;
  if (value === false) return <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />;
  return <span className="text-sm text-foreground/80">{value}</span>;
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg">SSB</Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms</Link>
          <Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy</Link>
          <Link href="/disclaimer" className="text-muted-foreground hover:text-foreground">Disclaimer</Link>
          <Link href="/auth/login" className="text-muted-foreground hover:text-foreground">Sign in</Link>
          <Link href="/auth/signup" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            Get Started
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-16 space-y-20">

        {/* Hero */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Simple, transparent pricing</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free. Upgrade when you&apos;re ready. Cancel anytime — no questions asked.
          </p>
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-2 text-sm font-medium text-green-800 dark:text-green-300">
            <Gift className="h-4 w-4" />
            Starter and Pro include a <strong className="mx-1">14-day free trial</strong> — no credit card charged until day 15
          </div>
        </div>

        {/* Early Access Banner */}
        <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-6 py-4 flex items-start gap-3 max-w-3xl mx-auto">
          <FlaskConical className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Early Access:</strong> SSB is currently in early access. All features are available at no cost and no real charges will occur. Pricing will apply after general availability. You will be notified before any charges begin.
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => (
            <div
              key={plan.key}
              className={`relative rounded-2xl border p-6 flex flex-col ${
                plan.highlight
                  ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                  : 'border-border bg-card'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground">
                    <Star className="h-3 w-3" />{plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  {plan.key === 'pro' && <Zap className="h-4 w-4 text-blue-500" />}
                  {plan.key === 'institutional' && <Building className="h-4 w-4 text-purple-500" />}
                  <h2 className="font-bold text-lg">{plan.name}</h2>
                </div>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
              </div>

              <div className="mb-6">
                {plan.price === 0 ? (
                  <p className="text-4xl font-bold">Free</p>
                ) : (
                  <div>
                    <p className="text-4xl font-bold">
                      ${plan.price}
                      <span className="text-base font-normal text-muted-foreground">/mo</span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      or ${plan.priceYearly}/yr <span className="text-green-600 dark:text-green-400 font-medium">(save ~17%)</span>
                    </p>
                    {plan.trial && (
                      <p className="text-xs text-green-700 dark:text-green-400 font-medium mt-2 flex items-center gap-1">
                        <Gift className="h-3 w-3" />
                        14-day free trial included
                      </p>
                    )}
                  </div>
                )}
              </div>

              <ul className="space-y-2 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.ctaHref}
                className={`w-full text-center py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
                  plan.highlight
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'border border-border bg-background hover:bg-muted'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Annual savings callout */}
        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>All paid plans include a <strong>~17% discount</strong> when billed annually. Monthly billing available on all plans.</p>
          <p>Starter and Pro plans include a <strong>14-day free trial</strong>. Your card is only charged after the trial ends. Cancel before day 15 and pay nothing.</p>
        </div>

        {/* Full Comparison Table */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center">Full Feature Comparison</h2>
          <div className="rounded-xl border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium w-1/3">Feature</th>
                  <th className="text-center px-4 py-3 font-medium">Free</th>
                  <th className="text-center px-4 py-3 font-medium">Starter</th>
                  <th className="text-center px-4 py-3 font-medium bg-primary/5">Pro</th>
                  <th className="text-center px-4 py-3 font-medium">Institutional</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((section) => (
                  <>
                    <tr key={section.section} className="bg-muted/20">
                      <td colSpan={5} className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {section.section}
                      </td>
                    </tr>
                    {section.rows.map((row) => (
                      <tr key={row.label} className="border-t border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-2.5 pl-6 text-foreground/80">{row.label}</td>
                        <td className="px-4 py-2.5 text-center"><Cell value={row.free} /></td>
                        <td className="px-4 py-2.5 text-center"><Cell value={row.starter} /></td>
                        <td className="px-4 py-2.5 text-center bg-primary/5"><Cell value={row.pro} /></td>
                        <td className="px-4 py-2.5 text-center"><Cell value={row.institutional} /></td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cancellation Policy */}
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold">Cancellation &amp; Refund Policy</h2>
          <div className="rounded-xl border border-border bg-card divide-y divide-border">

            <div className="p-6 space-y-2">
              <h3 className="font-semibold">Cancel anytime, no penalty</h3>
              <p className="text-sm text-muted-foreground">
                You can cancel your subscription at any time — no early termination fees, no questions asked.
                Cancellation takes effect at the end of your current billing period. You retain full access
                to all paid features until then.
              </p>
            </div>

            <div className="p-6 space-y-2">
              <h3 className="font-semibold">Monthly billing</h3>
              <p className="text-sm text-muted-foreground">
                When you cancel a monthly subscription, your access continues through the end of the current
                month you paid for. No partial refunds are issued for unused days within a billing period.
              </p>
            </div>

            <div className="p-6 space-y-2">
              <h3 className="font-semibold">Annual billing</h3>
              <p className="text-sm text-muted-foreground">
                Annual subscriptions are billed upfront for the full year. If you cancel an annual plan,
                your access continues until the end of the annual period. We do not issue prorated refunds
                for the unused portion of an annual term, except where required by applicable law.
              </p>
            </div>

            <div className="p-6 space-y-2">
              <h3 className="font-semibold">Downgrades</h3>
              <p className="text-sm text-muted-foreground">
                You may downgrade to a lower plan or to Free at any time. The downgrade takes effect at
                the start of your next billing period. You will retain your current plan&apos;s features
                until then.
              </p>
            </div>

            <div className="p-6 space-y-2">
              <h3 className="font-semibold">Refund requests</h3>
              <p className="text-sm text-muted-foreground">
                We evaluate refund requests on a case-by-case basis for extenuating circumstances.
                To request a refund, contact us at{' '}
                <a href="mailto:smartstrategiesbuilder@gmail.com" className="text-primary hover:underline">
                  smartstrategiesbuilder@gmail.com
                </a>{' '}
                within 7 days of your charge. Approved refunds are processed within 5–10 business days.
              </p>
            </div>

            <div className="p-6 space-y-2">
              <h3 className="font-semibold">Early access period</h3>
              <p className="text-sm text-muted-foreground">
                During early access, all plans are available at no cost and no real charges occur.
                When paid billing is activated, you will receive advance notice and must take explicit
                action to subscribe. No charges will be applied automatically or without your consent.
              </p>
            </div>

          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: 'How does the 14-day free trial work?',
                a: 'When you subscribe to Starter or Pro, your trial begins immediately. You have full access to all plan features for 14 days. Your card is not charged until the trial ends. Cancel any time before day 15 and you pay nothing.',
              },
              {
                q: 'Do I need a credit card to sign up?',
                a: 'No. The Free plan requires no payment information whatsoever. Credit card is only required when upgrading to a paid plan — and even then, you won\'t be charged until after the 14-day trial.',
              },
              {
                q: 'What happens to my data if I cancel?',
                a: 'Your account and data are retained for 30 days after cancellation in case you decide to reactivate. You can also request full deletion by contacting support.',
              },
              {
                q: 'Can I switch between plans?',
                a: 'Yes. You can upgrade immediately — the new plan takes effect right away and you are charged the prorated difference for the current period. Downgrades take effect at the next billing cycle.',
              },
              {
                q: 'Is SSB a broker or investment adviser?',
                a: 'No. SSB is an educational platform only. We do not execute trades on your behalf, hold your money, or provide personalized investment advice. See our Disclaimer for full details.',
              },
              {
                q: 'What does "paper trading" mean?',
                a: 'Paper trading is simulated trading with virtual (not real) money. It is designed for learning and practice only. No real money is involved and no actual securities transactions occur.',
              },
              {
                q: 'Do you offer refunds?',
                a: 'We do not issue automatic prorated refunds, but we evaluate refund requests for extenuating circumstances within 7 days of a charge. Contact smartstrategiesbuilder@gmail.com.',
              },
            ].map(({ q, a }) => (
              <div key={q} className="rounded-xl border border-border bg-card p-5 space-y-2">
                <p className="font-medium">{q}</p>
                <p className="text-sm text-muted-foreground">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4 pb-8">
          <h2 className="text-2xl font-bold">Ready to get started?</h2>
          <p className="text-muted-foreground">Free to join. No credit card required.</p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Create Free Account
          </Link>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Smart Strategies Builder. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="/disclaimer" className="hover:text-foreground">Disclaimer</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

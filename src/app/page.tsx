import Link from 'next/link';
import { Eye, Lock, Server, Shield, LineChart, TrendingUp } from 'lucide-react';
import { BrandName, BRAND_NAME } from '@/components/ui/brand-name';
import { DemoCTA } from '@/components/demo-cta';
import { DemoExpiredBanner } from '@/components/demo-expired-banner';

const TRUST_SIGNALS = [
  { icon: Shield, text: 'Bank-level encryption' },
  { icon: Lock, text: 'Read-only brokerage access via Plaid' },
  { icon: Eye, text: 'We never execute trades on your behalf' },
  { icon: Server, text: 'SOC2-ready infrastructure' },
];

const COMPARISON = [
  ['Regime Detection',       '✅ Included', '✅ $24k/yr'],
  ['Portfolio Attribution',  '✅ Included', '✅ $24k/yr'],
  ['Risk Analytics (VaR)',   '✅ Included', '✅ $24k/yr'],
  ['Strategy Backtesting',   '✅ Included', '⚠️ Limited'],
  ['Starting Price',         'Free',        '$24,000/yr'],
];

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    description: 'Core analytics, paper trading, learn hub',
    cta: 'Get started free',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$79/mo',
    description: 'All intelligence engines, AI insights, unlimited backtests',
    cta: 'Start 14-day trial',
    highlight: true,
  },
  {
    name: 'Institutional',
    price: '$299/mo',
    description: 'Advisor CRM, API access, compliance tools',
    cta: 'Get started',
    highlight: false,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="w-full py-6 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">SSB</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/pricing"
              className="hidden sm:inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium hover:text-primary transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className="hidden sm:inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium hover:text-primary transition-colors"
            >
              About
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium hover:text-primary transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="flex flex-col items-center justify-center px-4 py-16 sm:py-24">
        <div className="max-w-5xl w-full">
          <DemoExpiredBanner />

          <div className="text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] [text-wrap:balance]">
              Know what the market is doing{' '}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                — before you act.
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              SSB combines regime intelligence, AI risk analytics, and strategy backtesting
              so you trade with data, not guesses.
            </p>
            <p className="text-sm text-muted-foreground">
              Join investors using SSB to analyze the market — free during Early Access.
            </p>

            {/* CTAs */}
            <div className="flex flex-col items-center gap-4 mt-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center rounded-md border border-input bg-card px-8 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Sign In
                </Link>
              </div>
              <DemoCTA />
            </div>

            {/* Trust bar */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-6 border-t border-border/30">
              {TRUST_SIGNALS.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon className="h-3 w-3 text-primary shrink-0" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="rounded-lg border bg-card p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <Lock className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-xl font-semibold">Secure & Auditable</div>
              <p className="text-muted-foreground text-sm">
                Multi-factor authentication, encrypted data, and full audit logging for compliance.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Shield className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-xl font-semibold">Risk Intelligence</div>
              <p className="text-muted-foreground text-sm">
                Market regime detection, portfolio risk analytics, and stress testing scenarios.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <LineChart className="h-5 w-5 text-purple-500" />
              </div>
              <div className="text-xl font-semibold">Simulation & Backtesting</div>
              <p className="text-muted-foreground text-sm">
                Deterministic strategy simulations with historical data and explainable results.
              </p>
            </div>
          </div>

          {/* Comparison table */}
          <div className="mt-16 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-6">
              Institutional intelligence. Retail price.
            </p>
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto text-sm">
              <div className="text-muted-foreground font-medium">Feature</div>
              <div className="text-foreground font-semibold">SSB</div>
              <div className="text-muted-foreground font-medium">Bloomberg Terminal</div>
              {COMPARISON.map(([feature, ssb, bloomberg]) => (
                <>
                  <div key={feature} className="text-muted-foreground text-left py-1 border-t border-border/30">{feature}</div>
                  <div className="text-primary font-medium py-1 border-t border-border/30">{ssb}</div>
                  <div className="text-muted-foreground py-1 border-t border-border/30">{bloomberg}</div>
                </>
              ))}
            </div>
          </div>

          {/* Pricing preview */}
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-2">Simple, transparent pricing</h2>
            <p className="text-muted-foreground mb-8">Start free. Upgrade when you&apos;re ready.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-xl border p-5 text-left ${
                    plan.highlight
                      ? 'border-primary/50 bg-primary/5'
                      : 'border-border/70 bg-card'
                  }`}
                >
                  <p className="text-sm font-medium text-muted-foreground">{plan.name}</p>
                  <p className="text-2xl font-bold my-1">{plan.price}</p>
                  <p className="text-xs text-muted-foreground mb-4">{plan.description}</p>
                  <Link
                    href="/auth/signup"
                    className={`block text-center text-sm py-2 rounded-lg font-medium transition-colors ${
                      plan.highlight
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'border border-border hover:border-primary/50 text-foreground'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
            <Link
              href="/pricing"
              className="text-xs text-muted-foreground hover:text-foreground mt-4 inline-block transition-colors"
            >
              View full pricing details →
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-8 px-4 border-t mt-16">
        <div className="max-w-5xl mx-auto space-y-4">
          {/* Disclaimer — moved from hero */}
          <p className="text-xs text-muted-foreground text-center max-w-2xl mx-auto">
            SSB is a read-only analytical tool. It does not execute trades, provide buy/sell
            recommendations, or guarantee profits. All outputs are for educational and
            informational purposes only. Not financial advice.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/30">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm justify-center">
              <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="/disclaimer" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                Disclaimer
              </a>
              <a href="mailto:standleydowell@gmail.com" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

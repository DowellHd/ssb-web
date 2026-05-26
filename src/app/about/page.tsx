import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  TrendingUp,
  Shield,
  LineChart,
  Zap,
  BookOpen,
  CandlestickChart,
  FlaskConical,
  PieChart,
  Linkedin,
  Mail,
  GraduationCap,
  Building2,
} from 'lucide-react';
import { BRAND_NAME } from '@/components/ui/brand-name';
import { AboutHeader } from './about-header';

export const metadata: Metadata = {
  title: `About — ${BRAND_NAME}`,
  description:
    'SSB is built by a solo founder who wanted institutional-grade market intelligence without the Bloomberg terminal price tag.',
  alternates: { canonical: 'https://www.smartstrategiesbuilder.ai/about' },
};

const FEATURES = [
  {
    icon: Zap,
    name: 'Market Regime Detection',
    description:
      'Identifies bull, bear, neutral, and risk-off environments using multi-factor regime models — so you know what kind of market you\'re operating in before you trade.',
  },
  {
    icon: Shield,
    name: 'Portfolio Risk Analytics',
    description:
      'Value-at-Risk, correlation matrices, drawdown analysis, and concentration metrics — the same risk tools used by quant desks, surfaced in a clean UI.',
  },
  {
    icon: LineChart,
    name: 'Strategy Backtesting',
    description:
      'Test any rule-based strategy against historical data with realistic fills and transaction costs. No black boxes — every result is explainable.',
  },
  {
    icon: FlaskConical,
    name: 'Monte Carlo Simulations',
    description:
      'Model uncertainty across thousands of possible futures. Understand the range of outcomes, not just the expected one.',
  },
  {
    icon: TrendingUp,
    name: 'AI-Powered Signals',
    description:
      'Momentum, volatility, and breakout signals filtered by regime context, with confidence scores and full transparency on how each signal was generated.',
  },
  {
    icon: CandlestickChart,
    name: 'Paper Trading Engine',
    description:
      'A full order management system — market, limit, and stop orders — with a realistic P&L engine. Practice strategies without touching real capital.',
  },
  {
    icon: PieChart,
    name: 'Options Chain Viewer',
    description:
      'Black-Scholes pricing, Greeks (delta, gamma, theta, vega), and probability-of-profit calculations. Educational and analytical, not speculative.',
  },
  {
    icon: BookOpen,
    name: 'Structured Learning Hub',
    description:
      '14 modules across 4 guided learning paths — from market fundamentals to advanced quantitative strategies. Context-linked throughout the platform.',
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <AboutHeader />

      <div className="max-w-5xl mx-auto px-4 py-16 space-y-24">

        {/* Hero */}
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.1]">
            Institutional intelligence.<br />
            <span className="text-primary">Retail price.</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            SSB was built on a single premise: the tools that let professionals understand
            market risk, test strategies, and detect regime shifts shouldn&apos;t cost $24,000 a year.
          </p>
        </section>

        {/* Founder card */}
        <section className="rounded-2xl border bg-card p-8 sm:p-10">
          <div className="flex flex-col sm:flex-row items-start gap-8">
            {/* Avatar */}
            <div className="shrink-0">
              <div className="relative h-24 w-24 rounded-2xl overflow-hidden ring-2 ring-border">
                <Image
                  src="/founder.png"
                  alt="Dowell Standley Jr."
                  fill
                  className="object-cover object-top"
                  priority
                />
              </div>
            </div>

            {/* Bio */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold">Dowell Standley Jr.</h2>
                <p className="text-primary font-medium mt-0.5">Founder &amp; Engineer</p>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4 shrink-0" />
                    Computer Science — Cal State East Bay
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 shrink-0" />
                    Solo founder
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  I&apos;ve always been drawn to the intersection of markets and systems thinking.
                  After studying CS and spending years building software, I kept running into the
                  same wall: the tools serious investors use — Bloomberg, FactSet, institutional
                  risk platforms — are priced out of reach for everyone else.
                </p>
                <p>
                  SSB is my answer to that. Every feature was chosen because it makes you a
                  more informed, more disciplined investor — not because it makes the interface
                  look impressive. Regime detection, backtesting, risk analytics, structured
                  learning. The stuff that actually matters.
                </p>
                <p>
                  This is a one-person project built with real conviction. I use SSB every day
                  to manage my own portfolio analysis. When something is wrong or missing, I&apos;m
                  the first to know.
                </p>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <a
                  href="https://www.linkedin.com/in/dowellstandley"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </a>
                <a
                  href="mailto:standleydowell@gmail.com"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  standleydowell@gmail.com
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-center">Why SSB exists</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              A Bloomberg Terminal costs $24,000 a year. Most of what makes it valuable —
              regime context, risk analytics, strategy simulation — has nothing to do with
              the price. It has to do with distribution. Institutional tools are sold to
              institutions.
            </p>
            <p>
              SSB doesn&apos;t try to be Bloomberg. It takes the analytical thinking that makes
              professional investors better — understanding what the market is doing, not just
              what prices are doing — and makes it accessible at a price anyone can justify.
            </p>
            <p>
              The platform is deliberately opinionated: no real trade execution, no hot tips,
              no noise. Just the data and tools that help you think more clearly about risk,
              timing, and strategy.
            </p>
          </div>
        </section>

        {/* What's under the hood */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold">What&apos;s under the hood</h2>
            <p className="text-muted-foreground mt-2">
              Eight core capabilities, built from scratch.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map(({ icon: Icon, name, description }) => (
              <div key={name} className="rounded-xl border bg-card p-5 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm">{name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center space-y-6 py-8">
          <h2 className="text-2xl font-bold">Ready to see it for yourself?</h2>
          <p className="text-muted-foreground">
            Free during Early Access. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-md border border-input bg-card px-8 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="w-full py-8 px-4 border-t mt-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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

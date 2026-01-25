'use client';

import Link from 'next/link';
import { TrendingUp, Shield, LineChart, BarChart3 } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Hero/Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-primary/5 to-background flex-col justify-between p-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <TrendingUp className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Smart Strategies Builder
          </span>
        </Link>

        <div className="flex-1 flex flex-col justify-center max-w-md">
          <h1 className="text-4xl font-bold mb-4">
            AI-Powered Financial Intelligence
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Analyze market regimes, stress test portfolios, and backtest strategies with institutional-grade tools.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Market Regime Analysis</h3>
                <p className="text-sm text-muted-foreground">Real-time regime classification with confidence scores</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-green-100 text-green-600">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Risk Analytics</h3>
                <p className="text-sm text-muted-foreground">VaR, volatility, and portfolio risk metrics</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                <LineChart className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Strategy Backtesting</h3>
                <p className="text-sm text-muted-foreground">Deterministic backtests with historical data</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Smart Strategies Builder. For educational purposes only.
        </p>
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header (shown only on mobile) */}
        <header className="lg:hidden w-full py-6 px-4">
          <Link href="/" className="flex items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Smart Strategies Builder
            </span>
          </Link>
        </header>

        {/* Auth content */}
        <main className="flex-1 flex items-center justify-center px-4 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="w-full py-4 px-4 text-center text-sm text-muted-foreground">
          <p>
            By continuing, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-foreground">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}

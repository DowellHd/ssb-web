'use client';

import Link from 'next/link';
import { TrendingUp, Shield, LineChart, BarChart3 } from 'lucide-react';

function AuthMarketingPanel({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <h1 className="text-2xl lg:text-4xl font-bold mb-3 lg:mb-4">
        AI-Powered Financial Intelligence
      </h1>
      <p className="text-sm lg:text-lg text-muted-foreground mb-4 lg:mb-8">
        Analyze market regimes, stress test portfolios, and backtest strategies with institutional-grade tools.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3 lg:gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shrink-0">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm lg:text-base">Market Regime Analysis</h3>
            <p className="text-xs lg:text-sm text-muted-foreground">Real-time regime classification with confidence scores</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 shrink-0">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm lg:text-base">Risk Analytics</h3>
            <p className="text-xs lg:text-sm text-muted-foreground">VaR, volatility, and portfolio risk metrics</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 shrink-0">
            <LineChart className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm lg:text-base">Strategy Backtesting</h3>
            <p className="text-xs lg:text-sm text-muted-foreground">Deterministic backtests with historical data</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Left side - Hero/Branding (stacked on mobile, side-by-side on desktop) */}
      <div className="lg:w-1/2 bg-gradient-to-br from-primary/10 via-primary/5 to-background flex flex-col justify-between p-6 lg:p-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <TrendingUp className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Smart Strategies Builder
          </span>
        </Link>

        {/* Marketing content - visible on all screen sizes */}
        <AuthMarketingPanel className="flex-1 flex flex-col justify-center max-w-md py-6 lg:py-0" />

        <p className="hidden lg:block text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Smart Strategies Builder. For educational purposes only.
        </p>
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 flex flex-col">
        {/* Auth content */}
        <main className="flex-1 flex items-center justify-center px-4 py-6 lg:py-8">
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
          <p className="lg:hidden text-xs mt-2">
            &copy; {new Date().getFullYear()} Smart Strategies Builder. For educational purposes only.
          </p>
        </footer>
      </div>
    </div>
  );
}

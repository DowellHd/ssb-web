import Link from 'next/link';
import { TrendingUp, Shield, LineChart, Lock } from 'lucide-react';

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
          <div className="flex gap-3">
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
          <div className="text-center space-y-8">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
              Smart Strategies Builder
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              AI-powered financial intelligence platform for risk analysis,
              regime detection, and strategy backtesting with explainable insights.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
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

          {/* Disclaimer */}
          <div className="mt-16 p-4 bg-amber-900/50 border border-amber-700 rounded-lg">
            <p className="text-sm text-amber-100">
              <strong>Important:</strong> This platform is a read-only analytical tool. It does not
              execute trades, provide buy/sell recommendations, or guarantee profits. All outputs
              are for educational and informational purposes only. Not financial advice.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-6 px-4 border-t">
        <div className="max-w-5xl mx-auto text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Smart Strategies Builder. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}

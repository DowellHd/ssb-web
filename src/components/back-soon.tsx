import { TrendingUp } from 'lucide-react';

const PORTFOLIO_URL = 'https://dowellstandley.com';

export function BackSoon() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <section className="mx-auto w-full max-w-xl text-center">
        <div className="flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <TrendingUp className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
          </div>
          <span className="text-xl font-bold tracking-tight">SSB</span>
        </div>

        <h1 className="mt-10 text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl">
          We&apos;ll be back soon
        </h1>
        <p className="mt-4 text-lg text-foreground">
          Smart Strategies Builder is temporarily unavailable. Thanks for your patience.
        </p>
        <p className="mt-6 text-base text-muted-foreground">
          Smart Strategies Builder is a risk-first financial intelligence platform for market
          regime detection, portfolio risk analytics, and strategy backtesting.
        </p>

        <a
          href={PORTFOLIO_URL}
          className="mt-10 inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Visit my portfolio
        </a>
      </section>
    </main>
  );
}

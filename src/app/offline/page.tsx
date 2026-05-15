import Link from 'next/link';
import type { Metadata } from 'next';
import { RetryButton } from './_retry-button';

export const metadata: Metadata = {
  title: 'Offline',
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <svg
          className="h-8 w-8 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3l18 18M8.457 8.457A7.468 7.468 0 005.25 12c0 4.142 3.358 7.5 7.5 7.5 1.458 0 2.817-.418 3.968-1.139M10.5 6.054A7.5 7.5 0 0119.5 12c0 .64-.08 1.26-.232 1.852M12 3v.01"
          />
        </svg>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">You&apos;re offline</h1>
        <p className="max-w-sm text-muted-foreground text-sm">
          SSB needs an internet connection to load market data. Check your connection and try again.
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <RetryButton className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors" />
        <Link
          href="/app"
          className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}

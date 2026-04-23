'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, BarChart2, Loader2, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DisclaimerBanner } from '@/components/signals/disclaimer-banner';
import { getSignalPerformance, type TradePerformanceResponse } from '@/lib/api/signals';

function Stat({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${color ?? ''}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export default function SignalPerformancePage() {
  const [data, setData] = useState<TradePerformanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await getSignalPerformance();
        setData(res);
      } catch {
        setError('Unable to load performance data.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const fmt = (v: number | null, suffix = '%') =>
    v === null ? '—' : `${v >= 0 ? '+' : ''}${v.toFixed(1)}${suffix}`;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Back */}
        <Link
          href="/app/signals"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Signal Feed
        </Link>

        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
            <BarChart2 className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">My Trade Log</h1>
            <p className="text-sm text-muted-foreground">
              Performance of trades you logged based on SSB signals
            </p>
          </div>
        </div>

        <DisclaimerBanner className="mb-6" />

        {loading && (
          <div className="flex justify-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        )}

        {!loading && !error && data && (
          <>
            {data.total_logged === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
                <TrendingUp className="h-10 w-10 text-muted-foreground/40" aria-hidden="true" />
                <div>
                  <p className="font-medium">No trades logged yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    When you click &ldquo;I Took This Trade&rdquo; on a signal, your results will appear here.
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/app/signals">Browse Signals</Link>
                </Button>
              </div>
            ) : (
              <>
                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
                  <Stat label="Total Logged" value={String(data.total_logged)} />
                  <Stat label="Open" value={String(data.open_trades)} sub="awaiting exit" />
                  <Stat label="Closed" value={String(data.closed_trades)} />
                  <Stat
                    label="Win Rate"
                    value={data.win_rate !== null ? `${Math.round(data.win_rate * 100)}%` : '—'}
                    sub={data.closed_trades > 0 ? `${data.closed_trades} closed trades` : 'No closed trades yet'}
                    color={data.win_rate !== null && data.win_rate >= 0.5 ? 'text-green-600' : 'text-red-600'}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
                  <Stat
                    label="Avg Return"
                    value={fmt(data.avg_return_pct)}
                    color={data.avg_return_pct !== null && data.avg_return_pct >= 0 ? 'text-green-600' : 'text-red-600'}
                  />
                  <Stat
                    label="Avg Risk:Reward"
                    value={data.avg_risk_reward !== null ? `1:${data.avg_risk_reward.toFixed(1)}` : '—'}
                  />
                  <Stat
                    label="Best Trade"
                    value={fmt(data.best_trade_pct)}
                    color="text-green-600"
                  />
                  <Stat
                    label="Worst Trade"
                    value={fmt(data.worst_trade_pct)}
                    color="text-red-600"
                  />
                </div>

                <div className="rounded-xl border bg-muted/30 p-5">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">About this data:</strong> Performance metrics
                    reflect only trades you manually logged using the &ldquo;I Took This Trade&rdquo; button.
                    Past performance of logged trades does not guarantee future results.
                    This data is private — it is never shared or used for social comparison without
                    your explicit opt-in.
                  </p>
                </div>
              </>
            )}
          </>
        )}

        {/* Bottom disclaimer */}
        <div className="mt-8">
          <DisclaimerBanner />
        </div>
      </div>
    </div>
  );
}

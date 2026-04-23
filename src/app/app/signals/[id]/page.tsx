'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  AlertTriangle,
  ArrowLeft,
  BookmarkPlus,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
  Target,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DisclaimerBanner } from '@/components/signals/disclaimer-banner';
import {
  getSignalDetail,
  logTrade,
  type SignalDetail,
  type LogTradeRequest,
} from '@/lib/api/signals';
import { cn } from '@/lib/utils';

const BROKERS: { key: string; label: string; url: (t: string) => string }[] = [
  { key: 'robinhood',     label: 'Robinhood',        url: (t) => `https://robinhood.com/stocks/${t}` },
  { key: 'webull',        label: 'Webull',            url: (t) => `https://www.webull.com/quote/${t.toLowerCase()}` },
  { key: 'alpaca',        label: 'Alpaca',            url: (t) => `https://app.alpaca.markets/trade/${t}` },
  { key: 'td_ameritrade', label: 'TD Ameritrade',     url: (t) => `https://invest.ameritrade.com/grid/p/site#r=jPage/cgi-bin/apps/u/TradeStocks&symbol=${t}` },
  { key: 'fidelity',      label: 'Fidelity',          url: (t) => `https://digital.fidelity.com/ftgw/digital/trade-equity/index.html#/tradeEquity?symbol=${t}` },
  { key: 'ibkr',          label: 'IBKR',              url: (t) => `https://www.interactivebrokers.com/portal/#!f=trade&tws=1&stock=${t}` },
];

const TIME_HORIZON_LABELS: Record<string, string> = {
  short_term:  'Short-term (1–5 days)',
  medium_term: 'Medium-term (1–4 weeks)',
  long_term:   'Long-term (1–3 months)',
};

function MetricBox({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border bg-muted/40 p-3 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-base font-bold">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

function IndicatorRow({ name, value, signal }: { name: string; value: unknown; signal?: string }) {
  const signalColor =
    signal === 'bullish' || signal === 'oversold' ? 'text-green-600 dark:text-green-400' :
    signal === 'bearish' || signal === 'overbought' ? 'text-red-600 dark:text-red-400' :
    'text-muted-foreground';

  const displayValue =
    typeof value === 'number' ? value.toFixed(2) :
    value === null || value === undefined ? '—' :
    String(value);

  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0 text-sm">
      <span className="text-muted-foreground">{name}</span>
      <div className="flex items-center gap-2">
        <span className="font-medium tabular-nums">{displayValue}</span>
        {signal && (
          <span className={cn('text-xs capitalize', signalColor)}>{signal}</span>
        )}
      </div>
    </div>
  );
}

export default function SignalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [signal, setSignal] = useState<SignalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // "I Took This Trade" modal state
  const [showLogModal, setShowLogModal] = useState(false);
  const [entryPrice, setEntryPrice] = useState('');
  const [positionSize, setPositionSize] = useState('');
  const [notes, setNotes] = useState('');
  const [logLoading, setLogLoading] = useState(false);
  const [logSuccess, setLogSuccess] = useState(false);
  const [logError, setLogError] = useState<string | null>(null);

  // Smart order section expand — open by default
  const [orderExpanded, setOrderExpanded] = useState(true);

  // Preferred broker from localStorage (set in settings)
  const [preferredBroker, setPreferredBroker] = useState<string>('');

  useEffect(() => {
    const saved = localStorage.getItem('ssb_preferred_broker') ?? '';
    setPreferredBroker(saved);
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getSignalDetail(id);
        setSignal(data);
      } catch {
        setError('Signal not found or has expired.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleLogTrade = async () => {
    if (!signal || !entryPrice) return;
    setLogLoading(true);
    setLogError(null);
    try {
      const body: LogTradeRequest = {
        entry_price: parseFloat(entryPrice),
        position_size_usd: positionSize ? parseFloat(positionSize) : undefined,
        notes: notes || undefined,
      };
      await logTrade(signal.id, body);
      setLogSuccess(true);
      setShowLogModal(false);
    } catch {
      setLogError('Failed to log trade. Please try again.');
    } finally {
      setLogLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
      </div>
    );
  }

  if (error || !signal) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <AlertTriangle className="h-10 w-10 text-muted-foreground/50" aria-hidden="true" />
        <p className="font-medium">{error ?? 'Signal not found'}</p>
        <Button variant="outline" onClick={() => router.push('/app/signals')}>
          Back to Signal Feed
        </Button>
      </div>
    );
  }

  const isBullish = signal.trend_bias === 'bullish';
  const confPct = Math.round(signal.confidence_score * 100);
  const indicators = signal.supporting_data?.indicators as Array<{
    name: string; value: number | null; signal?: string
  }> | undefined;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Back */}
        <button
          onClick={() => router.push('/app/signals')}
          className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Signal Feed
        </button>

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl',
                isBullish ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
              )}
            >
              {isBullish
                ? <TrendingUp className="h-7 w-7 text-green-600 dark:text-green-400" aria-hidden="true" />
                : <TrendingDown className="h-7 w-7 text-red-600 dark:text-red-400" aria-hidden="true" />
              }
            </div>
            <div>
              <h1 className="text-3xl font-bold">{signal.ticker}</h1>
              <p className="text-muted-foreground capitalize">{signal.asset_class} · {signal.signal_type.replace(/_/g, ' ')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {logSuccess ? (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                Trade logged ✓
              </span>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowLogModal(true)}
              >
                <BookmarkPlus className="mr-1.5 h-4 w-4" aria-hidden="true" />
                I Took This Trade
              </Button>
            )}
          </div>
        </div>

        {/* Disclaimer — non-dismissible */}
        <DisclaimerBanner className="mb-6" />

        {/* Signal summary */}
        <section className="mb-6 rounded-xl border bg-card p-5">
          <h2 className="mb-3 text-base font-semibold">Signal Summary</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {signal.plain_english_summary}
          </p>

          {/* Key metrics */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricBox label="Confidence" value={`${confPct}%`} />
            <MetricBox label="Bias" value={signal.trend_bias} />
            <MetricBox label="Strength" value={`${signal.signal_strength.toFixed(0)}/100`} />
            <MetricBox
              label="Time Horizon"
              value={
                signal.time_horizon === 'short_term' ? 'Short' :
                signal.time_horizon === 'medium_term' ? 'Medium' : 'Long'
              }
              sub={TIME_HORIZON_LABELS[signal.time_horizon]}
            />
          </div>
        </section>

        {/* Technical indicators */}
        {indicators && indicators.length > 0 && (
          <section className="mb-6 rounded-xl border bg-card p-5">
            <h2 className="mb-3 text-base font-semibold">Technical Breakdown</h2>
            <div className="divide-y">
              {indicators.slice(0, 15).map((ind) => (
                <IndicatorRow
                  key={ind.name}
                  name={ind.name}
                  value={ind.value}
                  signal={ind.signal}
                />
              ))}
            </div>
            {signal.historical_accuracy !== null && signal.historical_accuracy !== undefined && (
              <p className="mt-3 text-xs text-muted-foreground">
                Historical accuracy of this signal type: {Math.round(signal.historical_accuracy * 100)}% over the last 6 months (backtested).
              </p>
            )}
          </section>
        )}

        {/* Smart order suggestions */}
        <section className="mb-6 rounded-xl border bg-card">
          <button
            className="flex w-full items-center justify-between p-5"
            onClick={() => setOrderExpanded((v) => !v)}
            aria-expanded={orderExpanded}
          >
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <h2 className="text-base font-semibold">If You Decide to Trade</h2>
            </div>
            {orderExpanded
              ? <ChevronUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              : <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            }
          </button>

          {orderExpanded && (
            <div className="border-t px-5 pb-5">
              {/* Legal label */}
              <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 dark:bg-amber-950/30 dark:border-amber-700 dark:text-amber-200 mb-4">
                <strong>These are suggested order parameters for your consideration — not instructions.</strong>{' '}
                You are in full control of all trading decisions. SSB never submits orders on your behalf.
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {signal.entry_zone_low !== null && signal.entry_zone_high !== null && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Suggested Entry Zone</p>
                    <p className="mt-1 font-semibold">
                      ${signal.entry_zone_low?.toFixed(2)} – ${signal.entry_zone_high?.toFixed(2)}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Consider a limit order within this range
                    </p>
                  </div>
                )}

                {signal.stop_loss !== null && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Suggested Stop-Loss</p>
                    <p className="mt-1 font-semibold text-red-600 dark:text-red-400">
                      ${signal.stop_loss?.toFixed(2)}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      ATR-based key support level
                    </p>
                  </div>
                )}

                {signal.take_profit !== null && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Suggested Take-Profit</p>
                    <p className="mt-1 font-semibold text-green-600 dark:text-green-400">
                      ${signal.take_profit?.toFixed(2)}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Based on resistance / R:R ratio
                    </p>
                  </div>
                )}
              </div>

              {signal.risk_reward_ratio !== null && (
                <p className="mt-3 text-sm text-muted-foreground">
                  Projected risk/reward ratio:{' '}
                  <strong className="text-foreground">1:{signal.risk_reward_ratio?.toFixed(1)}</strong>
                </p>
              )}

              {/* Open in broker — show all brokers, highlight preferred */}
              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-2">
                  Open in your broker — SSB does not place orders on your behalf.
                </p>
                <div className="flex flex-wrap gap-2">
                  {BROKERS.map((b) => (
                    <a
                      key={b.key}
                      href={b.url(signal.ticker)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
                        preferredBroker === b.key
                          ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
                          : 'bg-muted hover:bg-muted/80'
                      )}
                    >
                      {b.label}
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  ))}
                </div>
                {!preferredBroker && (
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    <a href="/app/settings/trading" className="underline">Set a preferred broker</a> to highlight it above.
                  </p>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Bottom disclaimer — non-dismissible */}
        <DisclaimerBanner />
      </div>

      {/* Log Trade Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border bg-card shadow-2xl">
            <div className="border-b px-6 py-4">
              <h2 className="font-semibold">Log a Trade — {signal.ticker}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Record a trade you executed. This is private and never shared.
              </p>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label htmlFor="entry-price" className="text-sm font-medium">
                  Entry Price <span className="text-destructive">*</span>
                </label>
                <input
                  id="entry-price"
                  type="number"
                  min={0}
                  step={0.01}
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  placeholder="e.g. 182.50"
                  className="mt-1 block w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label htmlFor="position-size" className="text-sm font-medium">
                  Position Size (USD, optional)
                </label>
                <input
                  id="position-size"
                  type="number"
                  min={0}
                  step={1}
                  value={positionSize}
                  onChange={(e) => setPositionSize(e.target.value)}
                  placeholder="e.g. 5000"
                  className="mt-1 block w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label htmlFor="trade-notes" className="text-sm font-medium">
                  Notes (optional)
                </label>
                <textarea
                  id="trade-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Why did you take this trade?"
                  className="mt-1 block w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
              {logError && <p className="text-xs text-destructive">{logError}</p>}
            </div>
            <div className="border-t px-6 py-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowLogModal(false)} disabled={logLoading}>
                Cancel
              </Button>
              <Button onClick={handleLogTrade} disabled={logLoading || !entryPrice}>
                {logLoading ? 'Saving…' : 'Log Trade'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

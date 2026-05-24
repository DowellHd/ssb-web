'use client';

import { useState } from 'react';
import {
  CheckCircle,
  Loader2,
  FlaskConical,
  X,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  ShieldAlert,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createAccount, getAccount, placeOrder } from '@/lib/api/paper';
import { cn } from '@/lib/utils';

export interface PaperTradeButtonProps {
  ticker: string;
  trendBias: string;
  // Signal context — passed from detail page for entry-zone validation
  entryZoneLow?: number | null;
  entryZoneHigh?: number | null;
  stopLoss?: number | null;
  takeProfit?: number | null;
  /** Price recorded when the signal was generated (yesterday's close in most cases). */
  signalPrice?: number | null;
  /** 'short_term' | 'medium_term' | 'long_term' */
  timeHorizon?: string | null;
  className?: string;
  size?: 'sm' | 'default';
}

// ── helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}

const TIME_HORIZON_LABELS: Record<string, string> = {
  short_term: 'Short-term (1–5 days)',
  medium_term: 'Medium-term (1–4 weeks)',
  long_term: 'Long-term (1–3 months)',
};

// ── Confirmation modal ────────────────────────────────────────────────────────

function ConfirmModal({
  ticker,
  trendBias,
  entryZoneLow,
  entryZoneHigh,
  stopLoss,
  takeProfit,
  signalPrice,
  timeHorizon,
  loading,
  error,
  onConfirm,
  onCancel,
}: PaperTradeButtonProps & {
  loading: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const side = trendBias === 'bearish' ? 'sell' : 'buy';
  const hasEntryZone = entryZoneLow != null && entryZoneHigh != null;
  const isShortTerm = timeHorizon === 'short_term';

  // Is the signal's reference price within the entry zone?
  const priceInZone =
    hasEntryZone && signalPrice != null
      ? signalPrice >= entryZoneLow! && signalPrice <= entryZoneHigh!
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl border bg-card shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary shrink-0" />
            <div>
              <h2 className="font-semibold leading-none">Paper Trade · {ticker}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Simulated — no real money involved</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">

          {/* ── Time-horizon risk warning for short-term signals ── */}
          {isShortTerm && (
            <div className="flex gap-2.5 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-3 text-xs text-amber-800 dark:text-amber-300">
              <Clock className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>
                <strong>Short-term signal.</strong> This setup is sensitive to entry timing.
                A fill even a few percent away from the entry zone can invalidate the
                risk/reward parameters below.
              </span>
            </div>
          )}

          {/* ── Entry zone section ── */}
          {hasEntryZone ? (
            <div className="rounded-lg border bg-muted/30 p-3 space-y-2.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Signal Entry Zone
              </p>

              {/* Zone range */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Suggested range</span>
                <span className="text-sm font-semibold">
                  {fmt(entryZoneLow!)} – {fmt(entryZoneHigh!)}
                </span>
              </div>

              {/* Signal reference price */}
              {signalPrice != null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Signal reference price</span>
                  <span className={cn(
                    'text-sm font-semibold',
                    priceInZone === true ? 'text-green-600 dark:text-green-400' :
                    priceInZone === false ? 'text-red-500 dark:text-red-400' : ''
                  )}>
                    {fmt(signalPrice)}
                    {priceInZone === true && ' ✓'}
                    {priceInZone === false && ' ✗'}
                  </span>
                </div>
              )}

              {/* Market-price caveat — always shown */}
              <div className="flex gap-2 rounded-md border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-2.5 text-xs text-amber-800 dark:text-amber-300">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>
                  Your paper trade will fill at the <strong>current live market price</strong>,
                  not the signal reference price. If the market has moved since this signal
                  was generated, your fill may be outside this entry zone — changing the
                  risk/reward completely.
                </span>
              </div>
            </div>
          ) : (
            /* No entry zone data */
            <div className="flex gap-2.5 rounded-lg border border-muted bg-muted/30 p-3 text-xs text-muted-foreground">
              <ShieldAlert className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>
                No entry zone data is available for this signal. Without knowing the
                suggested entry range, you cannot validate whether the current price
                is a good entry point. Review the full signal analysis before trading.
              </span>
            </div>
          )}

          {/* ── Risk parameters ── */}
          {(stopLoss != null || takeProfit != null) && (
            <div className="grid grid-cols-2 gap-2">
              {stopLoss != null && (
                <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-2.5">
                  <div className="flex items-center gap-1 mb-0.5">
                    <TrendingDown className="h-3 w-3 text-red-500" />
                    <p className="text-[10px] font-medium text-red-600 dark:text-red-400 uppercase tracking-wide">Stop-Loss</p>
                  </div>
                  <p className="text-sm font-bold text-red-600 dark:text-red-400">{fmt(stopLoss)}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {signalPrice != null
                      ? `${(((signalPrice - stopLoss) / signalPrice) * 100).toFixed(1)}% below reference`
                      : 'Risk level'}
                  </p>
                </div>
              )}
              {takeProfit != null && (
                <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 p-2.5">
                  <div className="flex items-center gap-1 mb-0.5">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <p className="text-[10px] font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">Take-Profit</p>
                  </div>
                  <p className="text-sm font-bold text-green-600 dark:text-green-400">{fmt(takeProfit)}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {signalPrice != null
                      ? `${(((takeProfit - signalPrice) / signalPrice) * 100).toFixed(1)}% above reference`
                      : 'Target level'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Order summary ── */}
          <div className="rounded-lg bg-muted/50 border px-3 py-2.5 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order</span>
              <span className="font-medium capitalize">
                {side === 'buy' ? '📈 Buy' : '📉 Sell'} 1 share · Market
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fill price</span>
              <span className="font-medium">Current market price</span>
            </div>
            {timeHorizon && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Horizon</span>
                <span className="font-medium">{TIME_HORIZON_LABELS[timeHorizon] ?? timeHorizon}</span>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-destructive bg-destructive/10 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          {/* Fine print */}
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Paper trading uses simulated virtual funds only. No real money is involved.
            All risk parameters shown are based on the signal&apos;s reference price and
            may not apply if your fill price differs significantly.
          </p>
        </div>

        {/* Footer */}
        <div className="border-t px-5 py-4 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={loading}
            className="gap-1.5"
          >
            {loading
              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Placing…</>
              : <><FlaskConical className="h-3.5 w-3.5" /> Place Paper Order</>
            }
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Public component ──────────────────────────────────────────────────────────

export function PaperTradeButton({
  ticker,
  trendBias,
  entryZoneLow,
  entryZoneHigh,
  stopLoss,
  takeProfit,
  signalPrice,
  timeHorizon,
  className,
  size = 'sm',
}: PaperTradeButtonProps) {
  const [state, setState] = useState<'idle' | 'confirming' | 'loading' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleConfirm() {
    setState('loading');
    setErrorMsg(null);
    try {
      try { await getAccount(); } catch { await createAccount(); }
      const side = trendBias === 'bearish' ? 'sell' : 'buy';
      await placeOrder({ symbol: ticker, side, quantity: 1, order_type: 'market' });
      setState('done');
      setTimeout(() => setState('idle'), 5000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Failed to place paper trade. Try again.';
      setErrorMsg(msg);
      setState('error');
      // Stay in 'error' state inside the modal so user sees it — don't auto-dismiss
    }
  }

  function handleCancel() {
    setErrorMsg(null);
    setState('idle');
  }

  // ── Done state ──────────────────────────────────────────────────────────────
  if (state === 'done') {
    return (
      <Button
        size={size}
        variant="outline"
        className={cn('gap-1.5 text-green-600 border-green-200 dark:border-green-800 cursor-default', className)}
        disabled
      >
        <CheckCircle className="h-3.5 w-3.5" />
        Paper order placed!
      </Button>
    );
  }

  return (
    <>
      <Button
        size={size}
        variant="outline"
        className={cn('gap-1.5', className)}
        onClick={() => setState('confirming')}
      >
        <FlaskConical className="h-3.5 w-3.5" />
        Paper Trade
      </Button>

      {(state === 'confirming' || state === 'loading' || state === 'error') && (
        <ConfirmModal
          ticker={ticker}
          trendBias={trendBias}
          entryZoneLow={entryZoneLow}
          entryZoneHigh={entryZoneHigh}
          stopLoss={stopLoss}
          takeProfit={takeProfit}
          signalPrice={signalPrice}
          timeHorizon={timeHorizon}
          loading={state === 'loading'}
          error={state === 'error' ? errorMsg : null}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </>
  );
}

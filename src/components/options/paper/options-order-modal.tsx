/**
 * Options paper order placement modal.
 *
 * Supports buy_to_open and sell_to_close actions.
 * All orders are simulated — no real contracts or money.
 */
'use client';

import { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlaceOptionsPaperOrder } from '@/hooks/use-options-paper';
import type { OptionsPaperPositionRaw } from '@/lib/api/options-paper';

const CONTRACT_MULTIPLIER = 100;

// ============================================================================
// Buy-to-open modal
// ============================================================================

interface BuyToOpenModalProps {
  symbol: string;
  optionType: 'call' | 'put';
  expiration: string; // ISO "YYYY-MM-DD"
  strike: number;
  estimatedPremium: number;
  maxContracts: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BuyToOpenModal({
  symbol,
  optionType,
  expiration,
  strike,
  estimatedPremium,
  maxContracts,
  onClose,
  onSuccess,
}: BuyToOpenModalProps) {
  const [contracts, setContracts] = useState(1);
  const { mutate, isPending, error } = usePlaceOptionsPaperOrder();

  const totalCost = estimatedPremium * CONTRACT_MULTIPLIER * contracts;
  const cappedMax = Math.min(maxContracts, 20); // cap input range for UX

  function handleSubmit() {
    mutate(
      {
        symbol,
        option_type: optionType,
        expiration,
        strike,
        contracts,
        action: 'buy_to_open',
        estimated_premium: estimatedPremium,
      },
      {
        onSuccess: () => {
          onSuccess?.();
          onClose();
        },
      },
    );
  }

  const expirationLabel = new Date(expiration + 'T00:00:00').toLocaleDateString(
    'en-US',
    { month: 'short', day: 'numeric', year: 'numeric' },
  );

  return (
    <ModalOverlay onClose={onClose}>
      <div className="space-y-4">
        <ModalHeader
          title="Buy to Open"
          subtitle={`${symbol} ${strike} ${optionType === 'call' ? 'Call' : 'Put'} · Exp ${expirationLabel}`}
          onClose={onClose}
        />

        <SimulatedNotice />

        {/* Order details */}
        <div className="rounded-md border bg-muted/30 p-4 space-y-2 text-sm">
          <DetailRow label="Action" value="Buy to Open" />
          <DetailRow
            label="Option type"
            value={optionType === 'call' ? 'Call' : 'Put'}
          />
          <DetailRow label="Strike" value={`$${strike.toFixed(2)}`} />
          <DetailRow label="Expiration" value={expirationLabel} />
          <DetailRow
            label="Est. premium"
            value={`$${estimatedPremium.toFixed(4)} / share`}
          />
        </div>

        {/* Contracts input */}
        <div className="space-y-1">
          <label className="text-sm font-medium">
            Contracts
            {maxContracts > 0 && (
              <span className="ml-1.5 text-xs text-muted-foreground">
                (max {maxContracts})
              </span>
            )}
          </label>
          <input
            type="number"
            min={1}
            max={cappedMax > 0 ? cappedMax : 20}
            value={contracts}
            onChange={(e) =>
              setContracts(Math.max(1, parseInt(e.target.value) || 1))
            }
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Cost summary */}
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/30">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
            Estimated cost
          </p>
          <p className="text-xl font-bold text-amber-900 dark:text-amber-200">
            ${totalCost.toFixed(2)}
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-400">
            {contracts} contract{contracts !== 1 ? 's' : ''} ×{' '}
            {CONTRACT_MULTIPLIER} shares × ${estimatedPremium.toFixed(4)}
          </p>
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-500">
            Deducted from your simulated paper account balance.
          </p>
        </div>

        <ErrorMessage error={error} />

        <div className="flex gap-2 pt-1">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? 'Placing…' : 'Confirm Order'}
          </Button>
        </div>
      </div>
    </ModalOverlay>
  );
}

// ============================================================================
// Sell-to-close modal
// ============================================================================

interface SellToCloseModalProps {
  position: OptionsPaperPositionRaw;
  estimatedPremium: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SellToCloseModal({
  position,
  estimatedPremium,
  onClose,
  onSuccess,
}: SellToCloseModalProps) {
  const { mutate, isPending, error } = usePlaceOptionsPaperOrder();

  const proceeds = estimatedPremium * CONTRACT_MULTIPLIER * position.contracts;
  const entryValue =
    Number(position.entry_premium) * CONTRACT_MULTIPLIER * position.contracts;
  const pl = proceeds - entryValue;
  const plPct = entryValue !== 0 ? (pl / entryValue) * 100 : 0;

  const expirationLabel = new Date(
    position.expiration + 'T00:00:00',
  ).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  function handleSubmit() {
    mutate(
      {
        symbol: position.symbol,
        option_type: position.option_type,
        expiration: position.expiration,
        strike: Number(position.strike),
        contracts: position.contracts,
        action: 'sell_to_close',
        estimated_premium: estimatedPremium,
        position_id: position.id,
      },
      {
        onSuccess: () => {
          onSuccess?.();
          onClose();
        },
      },
    );
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="space-y-4">
        <ModalHeader
          title="Sell to Close"
          subtitle={`${position.symbol} ${position.strike} ${position.option_type === 'call' ? 'Call' : 'Put'} · Exp ${expirationLabel}`}
          onClose={onClose}
        />

        <SimulatedNotice />

        {/* Position summary */}
        <div className="rounded-md border bg-muted/30 p-4 space-y-2 text-sm">
          <DetailRow
            label="Contracts"
            value={`${position.contracts} contract${position.contracts !== 1 ? 's' : ''}`}
          />
          <DetailRow
            label="Entry premium"
            value={`$${Number(position.entry_premium).toFixed(4)} / share`}
          />
          <DetailRow
            label="Est. close premium"
            value={`$${estimatedPremium.toFixed(4)} / share`}
          />
        </div>

        {/* P&L summary */}
        <div
          className={`rounded-md border px-4 py-3 ${
            pl >= 0
              ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30'
              : 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30'
          }`}
        >
          <p
            className={`text-sm font-medium ${pl >= 0 ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}
          >
            Estimated proceeds
          </p>
          <p
            className={`text-xl font-bold ${pl >= 0 ? 'text-green-900 dark:text-green-200' : 'text-red-900 dark:text-red-200'}`}
          >
            ${proceeds.toFixed(2)}
          </p>
          <p
            className={`text-xs ${pl >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}
          >
            P&amp;L: {pl >= 0 ? '+' : ''}${pl.toFixed(2)} ({pl >= 0 ? '+' : ''}
            {plPct.toFixed(1)}%)
          </p>
          <p
            className={`mt-1 text-xs ${pl >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}
          >
            Returned to your simulated paper account balance.
          </p>
        </div>

        <ErrorMessage error={error} />

        <div className="flex gap-2 pt-1">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={pl >= 0 ? 'default' : 'destructive'}
            className="flex-1"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? 'Closing…' : 'Confirm Close'}
          </Button>
        </div>
      </div>
    </ModalOverlay>
  );
}

// ============================================================================
// Shared sub-components
// ============================================================================

function ModalOverlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-xl">
        {children}
      </div>
    </div>
  );
}

function ModalHeader({
  title,
  subtitle,
  onClose,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <button
        onClick={onClose}
        className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function SimulatedNotice() {
  return (
    <div className="flex items-start gap-2 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>
        Simulated order — no real contracts or money involved. Educational only.
      </span>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function ErrorMessage({ error }: { error: Error | null }) {
  if (!error) return null;
  const message =
    (error as { response?: { data?: { detail?: string } } })?.response?.data
      ?.detail ?? error.message;
  return (
    <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

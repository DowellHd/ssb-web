/**
 * Options paper positions table.
 *
 * Shows open (or closed/expired) simulated options positions with
 * mark prices, unrealized P&L, and close actions for open positions.
 */
'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SellToCloseModal } from './options-order-modal';
import type { OptionsPaperPositionRaw } from '@/lib/api/options-paper';

const CONTRACT_MULTIPLIER = 100;

interface OptionsPositionsTableProps {
  positions: OptionsPaperPositionRaw[];
  totalValue: number;
  totalPl: number;
  showCloseButton?: boolean;
}

export function OptionsPositionsTable({
  positions,
  totalValue,
  totalPl,
  showCloseButton = true,
}: OptionsPositionsTableProps) {
  const [closingPosition, setClosingPosition] =
    useState<OptionsPaperPositionRaw | null>(null);

  if (positions.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        No positions found.
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-xs text-muted-foreground">
              <th className="px-4 py-2 text-left font-medium">Position</th>
              <th className="px-4 py-2 text-right font-medium">Contracts</th>
              <th className="px-4 py-2 text-right font-medium">Entry</th>
              <th className="px-4 py-2 text-right font-medium">Mark</th>
              <th className="px-4 py-2 text-right font-medium">Value</th>
              <th className="px-4 py-2 text-right font-medium">P&amp;L</th>
              <th className="px-4 py-2 text-right font-medium">DTE</th>
              <th className="px-4 py-2 text-right font-medium">Status</th>
              {showCloseButton && (
                <th className="px-4 py-2 text-right font-medium" />
              )}
            </tr>
          </thead>
          <tbody>
            {positions.map((pos) => (
              <PositionRow
                key={pos.id}
                position={pos}
                showCloseButton={showCloseButton}
                onClose={() => setClosingPosition(pos)}
              />
            ))}
          </tbody>
          {positions.length > 1 && (
            <tfoot>
              <tr className="border-t text-xs font-medium">
                <td colSpan={4} className="px-4 py-2 text-muted-foreground">
                  Total
                </td>
                <td className="px-4 py-2 text-right font-mono">
                  ${totalValue.toFixed(2)}
                </td>
                <td
                  className={`px-4 py-2 text-right font-mono ${plColorClass(totalPl)}`}
                >
                  {formatPl(totalPl)}
                </td>
                <td colSpan={showCloseButton ? 3 : 2} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Mobile cards */}
      <div className="block sm:hidden space-y-3 px-3 py-3">
        {positions.map((pos) => (
          <PositionCard
            key={pos.id}
            position={pos}
            showCloseButton={showCloseButton}
            onClose={() => setClosingPosition(pos)}
          />
        ))}
      </div>

      {/* Sell-to-close modal */}
      {closingPosition && (
        <SellToCloseModal
          position={closingPosition}
          estimatedPremium={Number(closingPosition.current_premium ?? closingPosition.entry_premium)}
          onClose={() => setClosingPosition(null)}
        />
      )}
    </>
  );
}

// ============================================================================
// Desktop row
// ============================================================================

function PositionRow({
  position: pos,
  showCloseButton,
  onClose,
}: {
  position: OptionsPaperPositionRaw;
  showCloseButton: boolean;
  onClose: () => void;
}) {
  const dte = Math.max(
    0,
    Math.round(
      (new Date(pos.expiration).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    ),
  );
  const pl = Number(pos.unrealized_pl ?? 0);
  const plPct = Number(pos.unrealized_pl_pct ?? 0);
  const currentValue = Number(pos.current_contract_value ?? 0);

  return (
    <tr className="border-b last:border-0 hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3">
        <div className="font-medium">
          {pos.symbol}{' '}
          <span className="text-muted-foreground">
            ${Number(pos.strike).toFixed(0)}{' '}
            {pos.option_type === 'call' ? 'C' : 'P'}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          Exp{' '}
          {new Date(pos.expiration + 'T00:00:00').toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </div>
      </td>
      <td className="px-4 py-3 text-right font-mono">{pos.contracts}</td>
      <td className="px-4 py-3 text-right font-mono">
        ${Number(pos.entry_premium).toFixed(4)}
      </td>
      <td className="px-4 py-3 text-right font-mono">
        {pos.current_premium != null
          ? `$${Number(pos.current_premium).toFixed(4)}`
          : '—'}
      </td>
      <td className="px-4 py-3 text-right font-mono">
        ${currentValue.toFixed(2)}
      </td>
      <td className={`px-4 py-3 text-right font-mono ${plColorClass(pl)}`}>
        <PlCell pl={pl} plPct={plPct} />
      </td>
      <td className="px-4 py-3 text-right">
        <DteBadge dte={dte} status={pos.status} />
      </td>
      <td className="px-4 py-3 text-right">
        <StatusBadge status={pos.status} />
      </td>
      {showCloseButton && (
        <td className="px-4 py-3 text-right">
          {pos.status === 'open' && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={onClose}
            >
              Close
            </Button>
          )}
        </td>
      )}
    </tr>
  );
}

// ============================================================================
// Mobile card
// ============================================================================

function PositionCard({
  position: pos,
  showCloseButton,
  onClose,
}: {
  position: OptionsPaperPositionRaw;
  showCloseButton: boolean;
  onClose: () => void;
}) {
  const dte = Math.max(
    0,
    Math.round(
      (new Date(pos.expiration).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    ),
  );
  const pl = Number(pos.unrealized_pl ?? 0);
  const plPct = Number(pos.unrealized_pl_pct ?? 0);
  const currentValue = Number(pos.current_contract_value ?? 0);

  return (
    <div className="rounded-md border bg-card p-3 space-y-2">
      <div className="flex items-start justify-between">
        <div>
          <span className="font-semibold">{pos.symbol}</span>{' '}
          <span className="text-muted-foreground text-sm">
            ${Number(pos.strike).toFixed(0)}{' '}
            {pos.option_type === 'call' ? 'Call' : 'Put'}
          </span>
          <div className="text-xs text-muted-foreground">
            Exp{' '}
            {new Date(pos.expiration + 'T00:00:00').toLocaleDateString(
              'en-US',
              { month: 'short', day: 'numeric' },
            )}{' '}
            · {pos.contracts} contract{pos.contracts !== 1 ? 's' : ''}
          </div>
        </div>
        <StatusBadge status={pos.status} />
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="text-muted-foreground">Entry</p>
          <p className="font-mono">${Number(pos.entry_premium).toFixed(4)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Mark</p>
          <p className="font-mono">
            {pos.current_premium != null
              ? `$${Number(pos.current_premium).toFixed(4)}`
              : '—'}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">DTE</p>
          <DteBadge dte={dte} status={pos.status} />
        </div>
        <div>
          <p className="text-muted-foreground">Value</p>
          <p className="font-mono">${currentValue.toFixed(2)}</p>
        </div>
        <div className="col-span-2">
          <p className="text-muted-foreground">P&amp;L</p>
          <p className={`font-mono ${plColorClass(pl)}`}>
            <PlCell pl={pl} plPct={plPct} />
          </p>
        </div>
      </div>
      {showCloseButton && pos.status === 'open' && (
        <Button
          variant="outline"
          size="sm"
          className="w-full h-7 text-xs"
          onClick={onClose}
        >
          Close Position
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// Small helpers
// ============================================================================

function PlCell({ pl, plPct }: { pl: number; plPct: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {pl > 0 ? (
        <TrendingUp className="h-3.5 w-3.5" />
      ) : pl < 0 ? (
        <TrendingDown className="h-3.5 w-3.5" />
      ) : (
        <Minus className="h-3.5 w-3.5" />
      )}
      {pl >= 0 ? '+' : ''}${pl.toFixed(2)} ({plPct >= 0 ? '+' : ''}
      {plPct.toFixed(1)}%)
    </span>
  );
}

function DteBadge({
  dte,
  status,
}: {
  dte: number;
  status: string;
}) {
  if (status === 'expired') return <span className="text-xs text-muted-foreground">Expired</span>;
  if (status === 'closed') return <span className="text-xs text-muted-foreground">Closed</span>;
  const colorClass =
    dte <= 3
      ? 'text-red-600 dark:text-red-400'
      : dte <= 7
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-muted-foreground';
  return <span className={`text-xs font-mono ${colorClass}`}>{dte}d</span>;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    open: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    closed: 'bg-muted text-muted-foreground',
    expired: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? styles.closed}`}
    >
      {status}
    </span>
  );
}

function plColorClass(pl: number): string {
  if (pl > 0) return 'text-green-600 dark:text-green-400';
  if (pl < 0) return 'text-red-600 dark:text-red-400';
  return 'text-muted-foreground';
}

function formatPl(pl: number): string {
  return `${pl >= 0 ? '+' : ''}$${pl.toFixed(2)}`;
}

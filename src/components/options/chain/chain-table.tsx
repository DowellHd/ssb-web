/**
 * Options chain table.
 *
 * Desktop: full table with all columns.
 * Mobile (< md): compact card layout per contract.
 *
 * Educational labels on column headers help users understand each metric.
 * No "best contract" or recommendation language anywhere.
 */

'use client';

import { cn } from '@/lib/utils';
import type { OptionsContract, OptionType } from '@/lib/options/types';
import {
  formatPremium,
  formatIV,
  formatDelta,
  formatGreek,
  formatTheta,
  formatVolOI,
  moneynessColor,
  moneynessRowClass,
} from '@/lib/options/utils';

// ============================================================================
// Column header with optional description tooltip
// ============================================================================

interface ColHeaderProps {
  label: string;
  description?: string;
}

function ColHeader({ label, description }: ColHeaderProps) {
  return (
    <th
      className="px-3 py-2 text-right text-xs font-medium text-muted-foreground"
      title={description}
    >
      {label}
    </th>
  );
}

// ============================================================================
// Moneyness badge
// ============================================================================

function MoneynessLabel({
  moneyness,
  optionType,
}: {
  moneyness: OptionsContract['moneyness'];
  optionType: OptionType;
}) {
  return (
    <span
      className={cn(
        'inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase',
        moneynessColor(moneyness, optionType),
      )}
    >
      {moneyness}
    </span>
  );
}

// ============================================================================
// Desktop table row
// ============================================================================

interface TableRowProps {
  contract: OptionsContract;
}

function TableRow({ contract }: TableRowProps) {
  const { moneyness, optionType } = contract;
  return (
    <tr
      className={cn(
        'border-b last:border-0 transition-colors hover:bg-muted/40',
        moneynessRowClass(moneyness, optionType),
      )}
    >
      {/* Strike + moneyness */}
      <td className="px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-medium tabular-nums">
            ${contract.strike.toFixed(2)}
          </span>
          <MoneynessLabel moneyness={moneyness} optionType={optionType} />
        </div>
      </td>

      {/* Bid */}
      <td className="px-3 py-2 text-right font-mono tabular-nums text-sm">
        {formatPremium(contract.bid)}
      </td>

      {/* Ask */}
      <td className="px-3 py-2 text-right font-mono tabular-nums text-sm">
        {formatPremium(contract.ask)}
      </td>

      {/* Last */}
      <td className="hidden md:table-cell px-3 py-2 text-right font-mono tabular-nums text-sm text-muted-foreground">
        {formatPremium(contract.last)}
      </td>

      {/* IV */}
      <td className="px-3 py-2 text-right text-sm">
        {formatIV(contract.impliedVolatility)}
      </td>

      {/* Delta */}
      <td className="px-3 py-2 text-right font-mono tabular-nums text-sm">
        {formatDelta(contract.greeks.delta)}
      </td>

      {/* Gamma */}
      <td className="hidden lg:table-cell px-3 py-2 text-right font-mono tabular-nums text-sm text-muted-foreground">
        {formatGreek(contract.greeks.gamma)}
      </td>

      {/* Theta */}
      <td className="hidden lg:table-cell px-3 py-2 text-right font-mono tabular-nums text-sm text-muted-foreground">
        {formatTheta(contract.greeks.theta)}
      </td>

      {/* Vega */}
      <td className="hidden lg:table-cell px-3 py-2 text-right font-mono tabular-nums text-sm text-muted-foreground">
        {formatGreek(contract.greeks.vega)}
      </td>

      {/* Volume */}
      <td className="hidden md:table-cell px-3 py-2 text-right text-sm text-muted-foreground">
        {formatVolOI(contract.volume)}
      </td>

      {/* OI */}
      <td className="hidden md:table-cell px-3 py-2 text-right text-sm text-muted-foreground">
        {formatVolOI(contract.openInterest)}
      </td>
    </tr>
  );
}

// ============================================================================
// Mobile card per contract
// ============================================================================

function ContractCard({ contract }: TableRowProps) {
  const { moneyness, optionType } = contract;
  return (
    <div
      className={cn(
        'rounded-lg border p-3 text-sm',
        moneynessRowClass(moneyness, optionType),
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold">${contract.strike.toFixed(2)}</span>
          <MoneynessLabel moneyness={moneyness} optionType={optionType} />
        </div>
        <span className="text-xs text-muted-foreground">
          IV: {formatIV(contract.impliedVolatility)}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs">
        <div>
          <span className="text-muted-foreground">Bid </span>
          <span className="font-mono">{formatPremium(contract.bid)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Ask </span>
          <span className="font-mono">{formatPremium(contract.ask)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Last </span>
          <span className="font-mono">{formatPremium(contract.last)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Δ </span>
          <span className="font-mono">{formatDelta(contract.greeks.delta)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">θ </span>
          <span className="font-mono">{formatTheta(contract.greeks.theta)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Vol </span>
          <span>{formatVolOI(contract.volume)}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main chain table
// ============================================================================

interface ChainTableProps {
  contracts: OptionsContract[];
  optionType: OptionType;
  isLoading?: boolean;
  /** When true, renders compact mobile cards instead of the table. */
  mobileCards?: boolean;
}

export function ChainTable({
  contracts,
  optionType,
  isLoading,
  mobileCards,
}: ChainTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-1.5">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-9 animate-pulse rounded bg-muted" />
        ))}
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
        No contracts match the current filters.
      </div>
    );
  }

  // Mobile cards (< sm breakpoint)
  if (mobileCards) {
    return (
      <div className="space-y-2">
        {contracts.map((c) => (
          <ContractCard key={c.optionSymbol} contract={c} />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
              Strike
            </th>
            <ColHeader label="Bid" description="Highest price a buyer is willing to pay" />
            <ColHeader label="Ask" description="Lowest price a seller is willing to accept" />
            <ColHeader
              label="Last"
              description="Price of the most recent transaction"
            />
            <ColHeader
              label="IV"
              description="Implied volatility — the market's expectation of future price movement, annualized"
            />
            <ColHeader
              label="Delta (Δ)"
              description="Estimated change in option price per $1 move in the underlying. Calls: 0 to 1. Puts: -1 to 0."
            />
            <ColHeader
              label="Gamma (Γ)"
              description="Rate of change of delta per $1 move in the underlying"
            />
            <ColHeader
              label="Theta (θ)"
              description="Estimated daily time decay — how much value this option loses per calendar day, all else equal"
            />
            <ColHeader
              label="Vega (ν)"
              description="Estimated change in option price per 1% change in implied volatility"
            />
            <ColHeader label="Volume" description="Number of contracts traded today" />
            <ColHeader
              label="OI"
              description="Open interest — total number of outstanding contracts"
            />
          </tr>
        </thead>
        <tbody>
          {contracts.map((contract) => (
            <TableRow key={contract.optionSymbol} contract={contract} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

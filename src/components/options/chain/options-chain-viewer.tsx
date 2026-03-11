/**
 * Options Chain Viewer.
 *
 * Orchestrates symbol selection, expiration selection, filters, and
 * the chain table. Renders within the /app/options page for entitled users.
 *
 * All data is simulated for educational purposes. The SimulatedDataBadge
 * must remain visible at all times.
 */

'use client';

import { useState, useMemo } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOptionsExpirations, useOptionsChain } from '@/hooks/use-options-chain';
import { useQuery } from '@tanstack/react-query';
import { getOptionsEntitlements } from '@/lib/api/options';
import { SimulatedDataBadge } from './simulated-data-badge';
import { ExpirationSelector } from './expiration-selector';
import { ChainFilters, type ContractDisplay } from './chain-filters';
import { ChainTable } from './chain-table';
import { BuyToOpenModal } from '@/components/options/paper/options-order-modal';
import type { OptionsContract } from '@/lib/options/types';

const DEFAULT_SYMBOL = 'SPY';

// ============================================================================
// Underlying price display
// ============================================================================

function UnderlyingPriceDisplay({
  symbol,
  price,
  isLoading,
}: {
  symbol: string;
  price: number | null;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <div className="h-5 w-24 animate-pulse rounded bg-muted" />;
  }
  if (!price) return null;
  return (
    <span className="text-sm text-muted-foreground">
      {symbol} underlying:{' '}
      <span className="font-mono font-medium text-foreground">
        ${price.toFixed(2)}
      </span>
      <span className="ml-1.5 text-xs italic">(simulated reference price)</span>
    </span>
  );
}

// ============================================================================
// Section tab (Calls / Puts) used when display = 'both'
// ============================================================================

function SectionHeading({ label }: { label: string }) {
  return (
    <div className="border-b px-4 py-2">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </h3>
    </div>
  );
}

// ============================================================================
// Main viewer
// ============================================================================

export function OptionsChainViewer() {
  const [symbol, setSymbol] = useState(DEFAULT_SYMBOL);
  const [display, setDisplay] = useState<ContractDisplay>('both');
  const [strikeMin, setStrikeMin] = useState('');
  const [strikeMax, setStrikeMax] = useState('');
  const [buyingContract, setBuyingContract] = useState<OptionsContract | null>(null);

  // Check paper trading entitlement to show buy buttons
  const { data: entitlements } = useQuery({
    queryKey: ['options', 'entitlements'],
    queryFn: getOptionsEntitlements,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
  const paperTradingEnabled = entitlements?.paperTradingEnabled ?? false;

  // Expirations
  const {
    data: expirations,
    isLoading: expLoading,
  } = useOptionsExpirations(symbol);

  // Track selected expiration — auto-select first when expirations load
  const [selectedExpiration, setSelectedExpiration] = useState('');
  const activeExpiration =
    selectedExpiration && expirations?.includes(selectedExpiration)
      ? selectedExpiration
      : expirations?.[0] ?? '';

  // Chain data
  const {
    data: chain,
    isLoading: chainLoading,
    isError,
    refetch,
  } = useOptionsChain(symbol, activeExpiration);

  // Filter contracts by strike range
  const filterContracts = (contracts: OptionsContract[]): OptionsContract[] => {
    const min = strikeMin ? parseFloat(strikeMin) : null;
    const max = strikeMax ? parseFloat(strikeMax) : null;
    return contracts.filter((c) => {
      if (min !== null && c.strike < min) return false;
      if (max !== null && c.strike > max) return false;
      return true;
    });
  };

  const filteredCalls = useMemo(
    () => filterContracts(chain?.calls ?? []),
    [chain, strikeMin, strikeMax],
  );

  const filteredPuts = useMemo(
    () => filterContracts(chain?.puts ?? []),
    [chain, strikeMin, strikeMax],
  );

  const isLoadingAny = expLoading || chainLoading;

  return (
    <div className="rounded-lg border bg-card">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-semibold">Options Chain</h2>
          <SimulatedDataBadge />
          {chain && (
            <UnderlyingPriceDisplay
              symbol={symbol}
              price={chain.underlyingPrice}
              isLoading={chainLoading}
            />
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoadingAny}
          className="h-7 text-xs"
        >
          <RefreshCw
            className={`mr-1.5 h-3 w-3 ${isLoadingAny ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="border-b px-4 py-3">
        <ChainFilters
          symbol={symbol}
          onSymbolChange={(s) => {
            setSymbol(s);
            setSelectedExpiration('');
          }}
          display={display}
          onDisplayChange={setDisplay}
          strikeMin={strikeMin}
          strikeMax={strikeMax}
          onStrikeMinChange={setStrikeMin}
          onStrikeMaxChange={setStrikeMax}
        />
      </div>

      {/* Expiration selector */}
      <div className="border-b px-4 py-3">
        <ExpirationSelector
          expirations={expirations ?? []}
          selected={activeExpiration}
          onChange={setSelectedExpiration}
          isLoading={expLoading}
        />
      </div>

      {/* Error state */}
      {isError && (
        <div className="flex items-center gap-2 px-4 py-6 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4" />
          Unable to generate chain data. Please try a different symbol.
        </div>
      )}

      {/* Chain content */}
      {!isError && (
        <>
          {/* Calls */}
          {(display === 'calls' || display === 'both') && (
            <div>
              {display === 'both' && <SectionHeading label="Calls" />}
              {/* Desktop table */}
              <div className="hidden sm:block">
                <ChainTable
                  contracts={filteredCalls}
                  optionType="call"
                  isLoading={isLoadingAny}
                  onBuyToOpen={paperTradingEnabled ? setBuyingContract : undefined}
                />
              </div>
              {/* Mobile cards */}
              <div className="block sm:hidden px-3 py-3 space-y-2">
                <ChainTable
                  contracts={filteredCalls}
                  optionType="call"
                  isLoading={isLoadingAny}
                  mobileCards
                  onBuyToOpen={paperTradingEnabled ? setBuyingContract : undefined}
                />
              </div>
            </div>
          )}

          {/* Puts */}
          {(display === 'puts' || display === 'both') && (
            <div className={display === 'both' ? 'border-t' : ''}>
              {display === 'both' && <SectionHeading label="Puts" />}
              {/* Desktop table */}
              <div className="hidden sm:block">
                <ChainTable
                  contracts={filteredPuts}
                  optionType="put"
                  isLoading={isLoadingAny}
                  onBuyToOpen={paperTradingEnabled ? setBuyingContract : undefined}
                />
              </div>
              {/* Mobile cards */}
              <div className="block sm:hidden px-3 py-3 space-y-2">
                <ChainTable
                  contracts={filteredPuts}
                  optionType="put"
                  isLoading={isLoadingAny}
                  mobileCards
                  onBuyToOpen={paperTradingEnabled ? setBuyingContract : undefined}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Buy-to-open modal */}
      {buyingContract && (
        <BuyToOpenModal
          symbol={buyingContract.symbol}
          optionType={buyingContract.optionType}
          expiration={buyingContract.expiration}
          strike={buyingContract.strike}
          estimatedPremium={buyingContract.ask}
          maxContracts={entitlements?.maxContracts ?? 10}
          onClose={() => setBuyingContract(null)}
        />
      )}

      {/* Footer note */}
      <div className="border-t px-4 py-2">
        <p className="text-xs text-muted-foreground">
          All values are approximations generated by an educational pricing
          model. Delta, Gamma, Theta, and Vega are computed using a
          Black-Scholes approximation and are not real market quotes.
          Hover column headers for descriptions.
        </p>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { getOptionsEntitlements } from '@/lib/api/options';
import {
  useOptionsPaperPositions,
  useOptionsPaperOrders,
} from '@/hooks/use-options-paper';
import { OptionsPositionsTable } from '@/components/options/paper/options-positions-table';
import { OptionsOrdersList } from '@/components/options/paper/options-orders-list';
import { OptionsDisclaimer } from '@/components/options/options-disclaimer';
import { SimulatedDataBadge } from '@/components/options/chain/simulated-data-badge';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

// ============================================================================
// Tab bar
// ============================================================================

type Tab = 'open' | 'closed' | 'orders';

function TabBar({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
}) {
  const tabs: { id: Tab; label: string }[] = [
    { id: 'open', label: 'Open Positions' },
    { id: 'closed', label: 'Closed / Expired' },
    { id: 'orders', label: 'Order History' },
  ];
  return (
    <div className="flex gap-1 border-b">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            active === t.id
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// Page
// ============================================================================

export default function OptionsPaperPage() {
  const [tab, setTab] = useState<Tab>('open');

  const { data: entitlements, isLoading: entLoading } = useQuery({
    queryKey: ['options', 'entitlements'],
    queryFn: getOptionsEntitlements,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const positionStatus = tab === 'closed' ? 'closed' : 'open';
  const {
    data: positionsData,
    isLoading: posLoading,
    isError: posError,
    refetch: refetchPositions,
  } = useOptionsPaperPositions(positionStatus);

  const {
    data: ordersData,
    isLoading: ordersLoading,
    isError: ordersError,
    refetch: refetchOrders,
  } = useOptionsPaperOrders();

  const paperTradingEnabled = entitlements?.paperTradingEnabled ?? false;

  // ── Not entitled ────────────────────────────────────────────────────────────
  if (!entLoading && !paperTradingEnabled) {
    return (
      <div className="space-y-6">
        <BackLink />
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-5 py-6 dark:border-blue-900 dark:bg-blue-950/30 text-center space-y-3">
          <p className="font-semibold text-blue-800 dark:text-blue-300">
            Options Paper Trading requires a Pro plan
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            Upgrade to simulate long calls and puts, track P&amp;L, and explore
            options strategies with virtual funds.
          </p>
          <Link
            href="/app/billing"
            className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            View Plans
          </Link>
        </div>
      </div>
    );
  }

  const isLoading =
    tab === 'orders' ? ordersLoading : posLoading || entLoading;
  const isError = tab === 'orders' ? ordersError : posError;

  function handleRefresh() {
    if (tab === 'orders') {
      refetchOrders();
    } else {
      refetchPositions();
    }
  }

  // Aggregate stats for open positions
  const totalValue = Number(positionsData?.total_positions_value ?? 0);
  const totalPl = Number(positionsData?.total_unrealized_pl ?? 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <BackLink />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Options Paper Trading</h1>
            <SimulatedDataBadge />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-8 text-xs"
          >
            <RefreshCw
              className={`mr-1.5 h-3 w-3 ${isLoading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      <OptionsDisclaimer showSimulatedWarning />

      {/* Open positions summary strip */}
      {tab === 'open' && !posLoading && positionsData && positionsData.total > 0 && (
        <div className="flex flex-wrap gap-4 rounded-lg border bg-card px-5 py-3 text-sm">
          <SummaryItem
            label="Open positions"
            value={String(positionsData.total)}
          />
          <SummaryItem
            label="Portfolio value"
            value={`$${totalValue.toFixed(2)}`}
          />
          <SummaryItem
            label="Unrealized P&L"
            value={`${totalPl >= 0 ? '+' : ''}$${totalPl.toFixed(2)}`}
            className={
              totalPl > 0
                ? 'text-green-600 dark:text-green-400'
                : totalPl < 0
                  ? 'text-red-600 dark:text-red-400'
                  : ''
            }
          />
        </div>
      )}

      {/* Tab content */}
      <div className="rounded-lg border bg-card">
        <div className="px-4 pt-3">
          <TabBar active={tab} onChange={setTab} />
        </div>

        {isError && (
          <div className="flex items-center gap-2 px-4 py-8 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            Unable to load data. Please try refreshing.
          </div>
        )}

        {isLoading && !isError && (
          <div className="space-y-2 p-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-md bg-muted" />
            ))}
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {(tab === 'open' || tab === 'closed') && positionsData && (
              <OptionsPositionsTable
                positions={positionsData.positions}
                totalValue={totalValue}
                totalPl={totalPl}
                showCloseButton={tab === 'open'}
              />
            )}

            {tab === 'orders' && ordersData && (
              <OptionsOrdersList orders={ordersData.orders} />
            )}
          </>
        )}
      </div>

      {/* How to open a position note */}
      <div className="rounded-lg border bg-card px-5 py-4">
        <h2 className="font-semibold mb-1 text-sm">
          How to open a paper position
        </h2>
        <p className="text-sm text-muted-foreground">
          Go to the{' '}
          <Link href="/app/options" className="underline hover:text-foreground">
            Options Chain
          </Link>{' '}
          and click any row to simulate a buy-to-open order. Positions will
          appear here with a simulated mark price that decays over time.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function BackLink() {
  return (
    <Link
      href="/app/options"
      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
    >
      <ChevronLeft className="h-4 w-4" />
      Options
    </Link>
  );
}

function SummaryItem({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`font-semibold font-mono ${className ?? ''}`}>{value}</p>
    </div>
  );
}

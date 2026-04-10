'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, Plus, TrendingUp, TrendingDown, DollarSign, BarChart3, Download, CheckCircle, XCircle, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAccount, usePositions, useOrders, useTierLimits } from '@/hooks/use-paper-trading';
import { usePortfolioHealth } from '@/hooks/use-portfolio-health';
import { cn, formatCurrency, formatPercent, isUnlimited, safeNumber } from '@/lib/utils';
import { importRealPortfolio, type ImportPortfolioResult } from '@/lib/api/paper';
import { AccountSummaryCard } from '@/components/paper/account-summary-card';
import { PositionsTable } from '@/components/paper/positions-table';
import { OrdersList } from '@/components/paper/orders-list';
import { TierLimitsBanner } from '@/components/paper/tier-limits-banner';
import { NewOrderModal } from '@/components/paper/new-order-modal';
import { ChartSection } from '@/components/paper/chart-section';
import { HealthAtAGlance, PortfolioHealthPanel } from '@/components/portfolio-health';
import { getRegimeAnalysis } from '@/lib/api/intelligence';
import type { RegimeType } from '@/lib/chart/regime-context';

export default function PaperTradingPage() {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderSymbol, setOrderSymbol] = useState<string | undefined>();
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [selectedChartSymbol, setSelectedChartSymbol] = useState<string | undefined>();
  const [showHealthPanel, setShowHealthPanel] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportPortfolioResult | null>(null);

  const { data: account, isLoading: accountLoading, refetch: refetchAccount } = useAccount();
  const { data: positions, isLoading: positionsLoading, refetch: refetchPositions } = usePositions();
  const { data: orders, isLoading: ordersLoading, refetch: refetchOrders } = useOrders();
  const { data: limits, isLoading: limitsLoading } = useTierLimits();

  // Fetch regime data for portfolio health calculations
  const { data: regimeData } = useQuery({
    queryKey: ['regime', 'SPY'],
    queryFn: () => getRegimeAnalysis({ symbol: 'SPY', lookback_days: 200 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Portfolio health hook
  const { health, entitlements: healthEntitlements, hasAccess: hasHealthAccess, isScenarioAdjusted } = usePortfolioHealth({
    regime: regimeData?.regime as RegimeType | undefined,
    volatilityPercentile: regimeData?.indicators?.volatility_percentile,
  });

  const isLoading = accountLoading || positionsLoading || ordersLoading || limitsLoading;

  const handleRefresh = () => {
    refetchAccount();
    refetchPositions();
    refetchOrders();
  };

  const handleNewOrder = () => {
    setOrderSymbol(undefined);
    setOrderSide('buy');
    setIsOrderModalOpen(true);
  };

  const handleSellPosition = (symbol: string) => {
    setOrderSymbol(symbol);
    setOrderSide('sell');
    setIsOrderModalOpen(true);
  };

  const handleSelectSymbol = (symbol: string) => {
    setSelectedChartSymbol(symbol);
  };

  const handleImportPortfolio = async () => {
    setImporting(true);
    setImportResult(null);
    try {
      const result = await importRealPortfolio();
      setImportResult(result);
      if (result.summary.imported_count > 0) {
        handleRefresh();
      }
    } catch (err: any) {
      setImportResult({
        imported: [],
        skipped: [],
        failed: [],
        summary: { imported_count: 0, skipped_count: 0, failed_count: 0 },
        disclaimer: err?.response?.data?.detail || 'Import failed',
      });
    } finally {
      setImporting(false);
      setShowImportConfirm(false);
    }
  };

  if (isLoading && !account) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading paper trading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Paper Trading</h1>
          <p className="text-muted-foreground">Simulated trading with virtual funds</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => { setImportResult(null); setShowImportConfirm(true); }}>
            <Download className="h-4 w-4 mr-2" />
            Copy Real Portfolio
          </Button>
          <Button size="sm" onClick={handleNewOrder}>
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      {/* Tier Limits Banner */}
      {limits && !limits.is_unlimited && (
        <TierLimitsBanner limits={limits} />
      )}

      {/* Account Summary */}
      {account && (
        <div className="grid gap-4 md:grid-cols-4">
          <AccountSummaryCard
            title="Total Value"
            value={formatCurrency(account.total_value)}
            icon={DollarSign}
          />
          <AccountSummaryCard
            title="Cash Available"
            value={formatCurrency(account.current_cash)}
            icon={DollarSign}
            variant="muted"
          />
          <AccountSummaryCard
            title="Total Return"
            value={formatCurrency(account.total_return)}
            subtitle={formatPercent(account.total_return_pct)}
            icon={account.total_return >= 0 ? TrendingUp : TrendingDown}
            variant={account.total_return >= 0 ? 'success' : 'danger'}
          />
          <AccountSummaryCard
            title="Positions"
            value={String(account.positions_count)}
            subtitle={limits ? `of ${isUnlimited(limits.max_positions) ? 'Unlimited' : limits.max_positions}` : undefined}
            icon={BarChart3}
          />
        </div>
      )}

      {/* Portfolio Health at a Glance Widget */}
      <HealthAtAGlance
        health={health}
        hasAccess={hasHealthAccess}
        isScenarioAdjusted={isScenarioAdjusted}
        onExpand={() => setShowHealthPanel(!showHealthPanel)}
      />

      {/* Full Portfolio Health Panel (expanded) */}
      {showHealthPanel && (
        <PortfolioHealthPanel
          health={health}
          entitlements={healthEntitlements}
          hasAccess={hasHealthAccess}
          isScenarioAdjusted={isScenarioAdjusted}
        />
      )}

      {/* Price Chart */}
      <ChartSection
        symbol={selectedChartSymbol || (positions?.positions?.[0]?.symbol ?? '')}
        limits={limits ?? null}
      />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Positions */}
        <div className="rounded-lg border bg-card">
          <div className="border-b px-4 py-3">
            <h2 className="font-semibold">Positions</h2>
          </div>
          <PositionsTable
            positions={positions?.positions || []}
            onSell={handleSellPosition}
            onSelect={handleSelectSymbol}
            selectedSymbol={selectedChartSymbol}
          />
        </div>

        {/* Recent Orders */}
        <div className="rounded-lg border bg-card">
          <div className="border-b px-4 py-3">
            <h2 className="font-semibold">Recent Orders</h2>
          </div>
          <OrdersList orders={orders?.orders || []} />
        </div>
      </div>

      {/* Disclaimer */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 px-4 py-3">
        <p className="text-sm text-amber-700 dark:text-amber-400">
          <strong>Paper Trading Disclaimer:</strong> This is simulated trading using virtual funds.
          No real money is involved. Past performance in paper trading does not guarantee future results
          in live trading.
        </p>
      </div>

      {/* Copy Real Portfolio — Confirm */}
      {showImportConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border bg-card p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-lg">Copy Real Portfolio</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              This will place paper market buy orders for each holding in your connected
              broker accounts, mirroring your real portfolio with virtual funds.
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 bg-muted/40 rounded-lg p-3">
              <li>• Existing positions are skipped (not duplicated)</li>
              <li>• Uses real holding quantities from your last sync</li>
              <li>• Only standard equity tickers are imported</li>
              <li>• Virtual cash must cover the positions</li>
            </ul>
            <div className="flex gap-2 pt-1">
              <Button onClick={handleImportPortfolio} disabled={importing} className="flex-1">
                {importing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                {importing ? 'Importing…' : 'Copy Portfolio'}
              </Button>
              <Button variant="ghost" onClick={() => setShowImportConfirm(false)} disabled={importing}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Copy Real Portfolio — Result */}
      {importResult && !showImportConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border bg-card p-6 space-y-4 shadow-xl">
            <h2 className="font-semibold text-lg">Import Complete</h2>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 p-3">
                <p className="text-2xl font-bold text-green-600">{importResult.summary.imported_count}</p>
                <p className="text-xs text-green-700 dark:text-green-400">Imported</p>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <p className="text-2xl font-bold">{importResult.summary.skipped_count}</p>
                <p className="text-xs text-muted-foreground">Skipped</p>
              </div>
              <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-3">
                <p className="text-2xl font-bold text-red-600">{importResult.summary.failed_count}</p>
                <p className="text-xs text-red-700 dark:text-red-400">Failed</p>
              </div>
            </div>

            {importResult.imported.length > 0 && (
              <div className="max-h-40 overflow-y-auto space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Imported</p>
                {importResult.imported.map(h => (
                  <div key={h.symbol} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                      {h.symbol}
                    </span>
                    <span className="text-muted-foreground tabular-nums">{h.quantity} shares</span>
                  </div>
                ))}
              </div>
            )}

            {importResult.failed.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Failed</p>
                {importResult.failed.map(h => (
                  <div key={h.symbol} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5">
                      <XCircle className="h-3.5 w-3.5 text-red-500" />
                      {h.symbol}
                    </span>
                    <span className="text-xs text-muted-foreground">{h.reason}</span>
                  </div>
                ))}
              </div>
            )}

            {importResult.skipped.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Skipped</p>
                {importResult.skipped.map(h => (
                  <div key={h.symbol} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5">
                      <SkipForward className="h-3.5 w-3.5 text-muted-foreground" />
                      {h.symbol}
                    </span>
                    <span className="text-xs text-muted-foreground">{h.reason}</span>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground">{importResult.disclaimer}</p>

            <Button className="w-full" onClick={() => setImportResult(null)}>Done</Button>
          </div>
        </div>
      )}

      {/* New Order Modal */}
      <NewOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        defaultSymbol={orderSymbol}
        defaultSide={orderSide}
        currentCash={safeNumber(account?.current_cash, 0)}
        positions={positions?.positions || []}
      />
    </div>
  );
}

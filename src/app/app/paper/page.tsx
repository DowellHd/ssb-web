'use client';

import { useState } from 'react';
import { RefreshCw, Plus, TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAccount, usePositions, useOrders, useTierLimits } from '@/hooks/use-paper-trading';
import { cn, formatCurrency, formatPercent, isUnlimited, safeNumber } from '@/lib/utils';
import { AccountSummaryCard } from '@/components/paper/account-summary-card';
import { PositionsTable } from '@/components/paper/positions-table';
import { OrdersList } from '@/components/paper/orders-list';
import { TierLimitsBanner } from '@/components/paper/tier-limits-banner';
import { NewOrderModal } from '@/components/paper/new-order-modal';

export default function PaperTradingPage() {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderSymbol, setOrderSymbol] = useState<string | undefined>();
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');

  const { data: account, isLoading: accountLoading, refetch: refetchAccount } = useAccount();
  const { data: positions, isLoading: positionsLoading, refetch: refetchPositions } = usePositions();
  const { data: orders, isLoading: ordersLoading, refetch: refetchOrders } = useOrders();
  const { data: limits, isLoading: limitsLoading } = useTierLimits();

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

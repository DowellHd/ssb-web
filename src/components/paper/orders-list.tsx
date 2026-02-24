'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, formatCurrency } from '@/lib/utils';
import { useCancelOrder, useDismissOrders } from '@/hooks/use-paper-trading';
import type { Order } from '@/lib/api/paper';

interface OrdersListProps {
  orders: Order[];
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  filled: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  canceled: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  expired: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

export function OrdersList({ orders }: OrdersListProps) {
  const [manageMode, setManageMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const cancelMutation = useCancelOrder();
  const dismissMutation = useDismissOrders();

  const visibleOrders = orders.slice(0, 10);
  const allSelected =
    visibleOrders.length > 0 && selectedIds.size === visibleOrders.length;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(visibleOrders.map((o) => o.id)));
    }
  };

  const handleDismissSelected = () => {
    if (selectedIds.size === 0) return;
    dismissMutation.mutate(Array.from(selectedIds), {
      onSuccess: () => {
        setSelectedIds(new Set());
        setManageMode(false);
      },
    });
  };

  const handleClearAll = () => {
    dismissMutation.mutate(
      visibleOrders.map((o) => o.id),
      {
        onSuccess: () => {
          setSelectedIds(new Set());
          setManageMode(false);
        },
      }
    );
  };

  const exitManage = () => {
    setManageMode(false);
    setSelectedIds(new Set());
  };

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">No orders yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Place an order to get started
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b">
        {manageMode ? (
          <>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleAll}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {allSelected ? 'Deselect all' : 'Select all'}
              </button>
              {selectedIds.size > 0 && (
                <span className="text-xs text-muted-foreground">
                  ({selectedIds.size} selected)
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {selectedIds.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleDismissSelected}
                  disabled={dismissMutation.isPending}
                >
                  Remove {selectedIds.size}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground"
                onClick={handleClearAll}
                disabled={dismissMutation.isPending}
              >
                Clear all
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={exitManage}
              >
                Done
              </Button>
            </div>
          </>
        ) : (
          <>
            <span className="text-xs text-muted-foreground">
              {orders.length} order{orders.length !== 1 ? 's' : ''}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setManageMode(true)}
            >
              Manage
            </Button>
          </>
        )}
      </div>

      {/* Order rows */}
      <div className="divide-y max-h-[400px] overflow-y-auto">
        {visibleOrders.map((order) => {
          const isSelected = selectedIds.has(order.id);
          return (
            <div
              key={order.id}
              className={cn(
                'px-4 py-3 transition-colors',
                manageMode
                  ? isSelected
                    ? 'bg-muted/50 cursor-pointer'
                    : 'hover:bg-muted/30 cursor-pointer'
                  : 'hover:bg-muted/50'
              )}
              onClick={manageMode ? () => toggleSelect(order.id) : undefined}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Selection indicator in manage mode */}
                  {manageMode && (
                    <span
                      className={cn(
                        'flex h-4 w-4 shrink-0 rounded border transition-colors',
                        isSelected
                          ? 'bg-primary border-primary'
                          : 'border-muted-foreground/40'
                      )}
                    >
                      {isSelected && (
                        <svg
                          className="m-auto h-3 w-3 text-primary-foreground"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </span>
                  )}
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded text-xs font-medium uppercase',
                      order.side === 'buy'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    )}
                  >
                    {order.side}
                  </span>
                  <span className="font-medium">{order.symbol}</span>
                  <span className="text-muted-foreground">x{order.quantity}</span>
                </div>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded text-xs',
                    STATUS_STYLES[order.status]
                  )}
                >
                  {order.status}
                </span>
              </div>
              <div
                className={cn(
                  'mt-1 flex items-center justify-between text-sm text-muted-foreground',
                  manageMode && 'pl-7'
                )}
              >
                <div>
                  {order.order_type === 'limit'
                    ? `Limit @ ${formatCurrency(order.limit_price!)}`
                    : 'Market'}{' '}
                  {order.avg_fill_price && (
                    <span className="text-foreground">
                      filled @ {formatCurrency(order.avg_fill_price)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span>
                    {formatDistanceToNow(new Date(order.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                  {!manageMode && order.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        cancelMutation.mutate(order.id);
                      }}
                      disabled={cancelMutation.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  {manageMode && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissMutation.mutate([order.id]);
                      }}
                      disabled={dismissMutation.isPending}
                      title="Remove from history"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import { formatDistanceToNow } from 'date-fns';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, formatCurrency } from '@/lib/utils';
import { useCancelOrder } from '@/hooks/use-paper-trading';
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
  const cancelMutation = useCancelOrder();

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
    <div className="divide-y max-h-[400px] overflow-y-auto">
      {orders.slice(0, 10).map((order) => (
        <div key={order.id} className="px-4 py-3 hover:bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'px-2 py-0.5 rounded text-xs font-medium uppercase',
                  order.side === 'buy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                )}
              >
                {order.side}
              </span>
              <span className="font-medium">{order.symbol}</span>
              <span className="text-muted-foreground">x{order.quantity}</span>
            </div>
            <span className={cn('px-2 py-0.5 rounded text-xs', STATUS_STYLES[order.status])}>
              {order.status}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-sm text-muted-foreground">
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
              <span>{formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}</span>
              {order.status === 'pending' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => cancelMutation.mutate(order.id)}
                  disabled={cancelMutation.isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

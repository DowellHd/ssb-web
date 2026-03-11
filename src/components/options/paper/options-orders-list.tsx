/**
 * Options paper orders history list.
 *
 * Displays recent paper options orders (fills, opens, closes).
 */
'use client';

import type { OptionsPaperOrderRaw } from '@/lib/api/options-paper';

const CONTRACT_MULTIPLIER = 100;

interface OptionsOrdersListProps {
  orders: OptionsPaperOrderRaw[];
}

export function OptionsOrdersList({ orders }: OptionsOrdersListProps) {
  if (orders.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        No orders yet. Place a buy-to-open order to get started.
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
              <th className="px-4 py-2 text-left font-medium">Time</th>
              <th className="px-4 py-2 text-left font-medium">Position</th>
              <th className="px-4 py-2 text-left font-medium">Action</th>
              <th className="px-4 py-2 text-right font-medium">Contracts</th>
              <th className="px-4 py-2 text-right font-medium">Premium</th>
              <th className="px-4 py-2 text-right font-medium">Total Value</th>
              <th className="px-4 py-2 text-right font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="block sm:hidden space-y-3 px-3 py-3">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </>
  );
}

// ============================================================================
// Desktop row
// ============================================================================

function OrderRow({ order }: { order: OptionsPaperOrderRaw }) {
  const premium = Number(order.filled_premium ?? order.estimated_premium);
  const totalValue = premium * CONTRACT_MULTIPLIER * order.contracts;
  const ts = order.filled_at ?? order.created_at;

  return (
    <tr className="border-b last:border-0 hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3 text-xs text-muted-foreground">
        {new Date(ts).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })}
      </td>
      <td className="px-4 py-3">
        <span className="font-medium">{order.symbol}</span>{' '}
        <span className="text-muted-foreground">
          ${Number(order.strike).toFixed(0)}{' '}
          {order.option_type === 'call' ? 'C' : 'P'}
        </span>
        <div className="text-xs text-muted-foreground">
          Exp{' '}
          {new Date(order.expiration + 'T00:00:00').toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </div>
      </td>
      <td className="px-4 py-3">
        <ActionBadge action={order.action} />
      </td>
      <td className="px-4 py-3 text-right font-mono">{order.contracts}</td>
      <td className="px-4 py-3 text-right font-mono">
        ${premium.toFixed(4)}
      </td>
      <td className="px-4 py-3 text-right font-mono">
        {order.action === 'buy_to_open' ? '−' : '+'}${totalValue.toFixed(2)}
      </td>
      <td className="px-4 py-3 text-right">
        <OrderStatusBadge status={order.status} />
      </td>
    </tr>
  );
}

// ============================================================================
// Mobile card
// ============================================================================

function OrderCard({ order }: { order: OptionsPaperOrderRaw }) {
  const premium = Number(order.filled_premium ?? order.estimated_premium);
  const totalValue = premium * CONTRACT_MULTIPLIER * order.contracts;
  const ts = order.filled_at ?? order.created_at;

  return (
    <div className="rounded-md border bg-card p-3 space-y-2">
      <div className="flex items-start justify-between">
        <div>
          <span className="font-semibold">{order.symbol}</span>{' '}
          <span className="text-muted-foreground text-sm">
            ${Number(order.strike).toFixed(0)}{' '}
            {order.option_type === 'call' ? 'Call' : 'Put'}
          </span>
          <div className="text-xs text-muted-foreground">
            {new Date(ts).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </div>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>
      <div className="flex items-center justify-between text-sm">
        <ActionBadge action={order.action} />
        <span className="text-muted-foreground">
          {order.contracts} contract{order.contracts !== 1 ? 's' : ''}
        </span>
        <span className="font-mono">
          {order.action === 'buy_to_open' ? '−' : '+'}${totalValue.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Shared sub-components
// ============================================================================

function ActionBadge({ action }: { action: string }) {
  const isBuy = action === 'buy_to_open';
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        isBuy
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
          : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      }`}
    >
      {isBuy ? 'Buy to Open' : 'Sell to Close'}
    </span>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    filled: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    canceled: 'bg-muted text-muted-foreground',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? styles.canceled}`}
    >
      {status}
    </span>
  );
}

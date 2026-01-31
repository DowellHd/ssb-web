'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, formatCurrency, formatPercent } from '@/lib/utils';
import type { Position } from '@/lib/api/paper';

interface PositionsTableProps {
  positions: Position[];
  onSell: (symbol: string) => void;
  onSelect?: (symbol: string) => void;
  selectedSymbol?: string;
}

export function PositionsTable({ positions, onSell, onSelect, selectedSymbol }: PositionsTableProps) {
  if (positions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">No positions yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Place a buy order to open a position
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Symbol</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Qty</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Avg Cost</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Price</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">P&L</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Action</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((position) => {
            const isProfit = position.unrealized_pl >= 0;
            const isSelected = selectedSymbol === position.symbol;
            return (
              <tr
                key={position.id}
                className={cn(
                  'border-b last:border-0 cursor-pointer transition-colors',
                  isSelected ? 'bg-primary/5' : 'hover:bg-muted/50'
                )}
                onClick={() => onSelect?.(position.symbol)}
              >
                <td className="px-4 py-3 font-medium">{position.symbol}</td>
                <td className="px-4 py-3 text-right">{position.quantity}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(position.avg_cost)}</td>
                <td className="px-4 py-3 text-right">
                  {position.current_price ? formatCurrency(position.current_price) : '-'}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {isProfit ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={cn(isProfit ? 'text-green-500' : 'text-red-500')}>
                      {formatCurrency(position.unrealized_pl)}
                    </span>
                    <span className={cn('text-xs', isProfit ? 'text-green-500' : 'text-red-500')}>
                      ({formatPercent(position.unrealized_pl_pct)})
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSell(position.symbol)}
                  >
                    Sell
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

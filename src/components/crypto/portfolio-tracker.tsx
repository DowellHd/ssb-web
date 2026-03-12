'use client';

import { useState } from 'react';
import { Plus, Trash2, Briefcase, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import { useCryptoPortfolio, useAddPortfolioHolding, useRemovePortfolioHolding } from '@/hooks/use-crypto';
import { CryptoSearch } from './crypto-search';
import type { CoinSearchResult } from '@/lib/crypto/types';
import { getErrorMessage } from '@/lib/api-client';
import { cn } from '@/lib/utils';

function fmtUsd(value: number | null | undefined): string {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function fmtPct(value: number | null | undefined): string {
  if (value == null) return '—';
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

// ============================================================================
// Add holding form
// ============================================================================

interface AddHoldingFormProps {
  onClose: () => void;
}

function AddHoldingForm({ onClose }: AddHoldingFormProps) {
  const [selected, setSelected] = useState<CoinSearchResult | null>(null);
  const [quantity, setQuantity] = useState('');
  const [avgCost, setAvgCost] = useState('');
  const [notes, setNotes] = useState('');

  const addHolding = useAddPortfolioHolding();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !quantity || !avgCost) return;

    addHolding.mutate(
      {
        coin_id: selected.coin_id,
        symbol: selected.symbol,
        name: selected.name,
        quantity,
        avg_cost_usd: avgCost,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          toast.success(`${selected.name} added to portfolio`);
          onClose();
        },
        onError: (err) => toast.error(getErrorMessage(err)),
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 rounded-lg border bg-muted/30">
      <h4 className="text-sm font-semibold">Add Holding</h4>

      {!selected ? (
        <CryptoSearch
          placeholder="Search coin…"
          onSelect={(result) => setSelected(result)}
        />
      ) : (
        <div className="flex items-center justify-between rounded-md border bg-background px-3 py-2">
          <span className="text-sm font-medium">{selected.name}</span>
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Quantity</label>
          <input
            type="number"
            step="any"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Avg Cost (USD)</label>
          <input
            type="number"
            step="any"
            min="0"
            value={avgCost}
            onChange={(e) => setAvgCost(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Notes (optional)</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Long-term hold"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!selected || !quantity || !avgCost || addHolding.isPending}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {addHolding.isPending ? 'Adding…' : 'Add'}
        </button>
      </div>
    </form>
  );
}

// ============================================================================
// Main portfolio tracker
// ============================================================================

export function PortfolioTracker() {
  const [showForm, setShowForm] = useState(false);
  const { data: portfolio, isLoading } = useCryptoPortfolio();
  const removeHolding = useRemovePortfolioHolding();

  function handleRemove(holdingId: string, name: string) {
    removeHolding.mutate(holdingId, {
      onSuccess: () => toast.success(`${name} removed from portfolio`),
      onError: (err) => toast.error(getErrorMessage(err)),
    });
  }

  const totalPl = portfolio?.total_unrealized_pl_usd ?? 0;
  const totalPlPct = portfolio?.total_unrealized_pl_pct ?? 0;
  const isUp = totalPl >= 0;

  return (
    <div className="rounded-lg border bg-card space-y-0">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold">Portfolio</h3>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="p-4">
          <AddHoldingForm onClose={() => setShowForm(false)} />
        </div>
      )}

      {/* Summary */}
      {portfolio && portfolio.total_holdings > 0 && (
        <div className="grid grid-cols-3 divide-x border-b">
          <div className="px-4 py-3">
            <p className="text-xs text-muted-foreground">Value</p>
            <p className="text-sm font-semibold">{fmtUsd(portfolio.total_current_value_usd)}</p>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs text-muted-foreground">Cost</p>
            <p className="text-sm font-semibold">{fmtUsd(portfolio.total_cost_basis_usd)}</p>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs text-muted-foreground">P&amp;L</p>
            <p
              className={cn(
                'text-sm font-semibold',
                isUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
              )}
            >
              {fmtUsd(totalPl)}
              <span className="text-xs ml-1">({fmtPct(totalPlPct)})</span>
            </p>
          </div>
        </div>
      )}

      {/* Holdings list */}
      <div className="p-4">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : !portfolio || portfolio.total_holdings === 0 ? (
          <p className="text-sm text-muted-foreground py-2">
            No holdings yet. Click &ldquo;Add&rdquo; to track a coin.
          </p>
        ) : (
          <div className="space-y-2">
            {portfolio.holdings.map((holding) => {
              const pl = holding.unrealized_pl_usd;
              const plUp = pl != null && pl >= 0;
              return (
                <div
                  key={holding.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2 group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{holding.name}</p>
                      <span className="text-xs text-muted-foreground uppercase shrink-0">
                        {holding.symbol}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {holding.quantity} @ {fmtUsd(parseFloat(holding.avg_cost_usd))}
                    </p>
                  </div>
                  <div className="text-right ml-3 shrink-0">
                    <p className="text-sm font-medium">{fmtUsd(holding.current_value_usd)}</p>
                    {pl != null && (
                      <p
                        className={cn(
                          'text-xs',
                          plUp
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400',
                        )}
                      >
                        {fmtPct(holding.unrealized_pl_pct)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemove(holding.id, holding.name)}
                    disabled={removeHolding.isPending}
                    className="ml-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive disabled:opacity-50 transition-opacity"
                    title="Remove holding"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

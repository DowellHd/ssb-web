'use client';

import { Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useWatchlist, useRemoveFromWatchlist } from '@/hooks/use-crypto';
import { CryptoSearch } from './crypto-search';
import { getErrorMessage } from '@/lib/api-client';

export function WatchlistPanel() {
  const { data: watchlist, isLoading } = useWatchlist();
  const removeItem = useRemoveFromWatchlist();

  function handleRemove(coinId: string, name: string) {
    removeItem.mutate(coinId, {
      onSuccess: () => toast.success(`${name} removed from watchlist`),
      onError: (err) => toast.error(getErrorMessage(err)),
    });
  }

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-500" />
          <h3 className="font-semibold">Watchlist</h3>
          {watchlist && (
            <span className="text-xs text-muted-foreground">
              ({watchlist.total})
            </span>
          )}
        </div>
      </div>

      {/* Search to add */}
      <CryptoSearch showWatchlistAdd placeholder="Add a coin…" />

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-9 animate-pulse rounded bg-muted" />
          ))}
        </div>
      ) : watchlist?.items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">
          Your watchlist is empty. Search above to add coins.
        </p>
      ) : (
        <ul className="space-y-1">
          {watchlist?.items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted/50 group"
            >
              <div>
                <span className="text-sm font-medium">{item.name}</span>
                <span className="ml-2 text-xs text-muted-foreground uppercase">
                  {item.symbol}
                </span>
              </div>
              <button
                onClick={() => handleRemove(item.coin_id, item.name)}
                disabled={removeItem.isPending}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive disabled:opacity-50 transition-opacity"
                title="Remove from watchlist"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

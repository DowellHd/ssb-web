'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { useCoinSearch, useAddToWatchlist } from '@/hooks/use-crypto';
import type { CoinSearchResult } from '@/lib/crypto/types';
import { getErrorMessage } from '@/lib/api-client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CryptoSearchProps {
  /** If true, show "Add to watchlist" button for each result. */
  showWatchlistAdd?: boolean;
  /** Called when a result is selected (non-watchlist use case). */
  onSelect?: (result: CoinSearchResult) => void;
  placeholder?: string;
  inputId?: string;
}

export function CryptoSearch({
  showWatchlistAdd = false,
  onSelect,
  placeholder = 'Search coins…',
  inputId = 'crypto-coin-search',
}: CryptoSearchProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, isFetching } = useCoinSearch(query);
  const addToWatchlist = useAddToWatchlist();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const results = data?.results ?? [];
  const showDropdown = open && query.trim().length >= 2;

  function handleAdd(result: CoinSearchResult) {
    addToWatchlist.mutate(
      { coin_id: result.coin_id, symbol: result.symbol, name: result.name },
      {
        onSuccess: () => {
          toast.success(`${result.name} added to watchlist`);
          setQuery('');
          setOpen(false);
        },
        onError: (err) => {
          toast.error(getErrorMessage(err));
        },
      },
    );
  }

  function handleSelect(result: CoinSearchResult) {
    onSelect?.(result);
    setQuery('');
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          id={inputId}
          name={inputId}
          type="text"
          autoComplete="off"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-md border bg-background pl-9 pr-8 py-2 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setOpen(false); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg overflow-hidden">
          {isFetching && results.length === 0 && (
            <div className="px-4 py-3 text-sm text-muted-foreground">Searching…</div>
          )}
          {!isFetching && results.length === 0 && (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              No results for &ldquo;{query}&rdquo;
            </div>
          )}
          {results.map((result) => (
            <div
              key={result.coin_id}
              className="flex items-center justify-between px-3 py-2 hover:bg-muted cursor-pointer"
              onClick={() => !showWatchlistAdd && handleSelect(result)}
            >
              <div className="flex items-center gap-2">
                {result.thumb && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={result.thumb}
                    alt={result.name}
                    className="h-5 w-5 rounded-full"
                  />
                )}
                <div>
                  <p className="text-sm font-medium">{result.name}</p>
                  <p className="text-xs text-muted-foreground uppercase">
                    {result.symbol}
                    {result.market_cap_rank && ` · #${result.market_cap_rank}`}
                  </p>
                </div>
              </div>
              {showWatchlistAdd && (
                <button
                  onClick={() => handleAdd(result)}
                  disabled={addToWatchlist.isPending}
                  className="ml-2 shrink-0 flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  Add
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

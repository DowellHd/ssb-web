/**
 * Filter controls for the options chain viewer.
 * Provides: symbol input, calls/puts/both toggle, and strike range filter.
 */

'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { QUICK_SYMBOLS } from '@/lib/options/utils';

export type ContractDisplay = 'calls' | 'puts' | 'both';

interface ChainFiltersProps {
  symbol: string;
  onSymbolChange: (symbol: string) => void;
  display: ContractDisplay;
  onDisplayChange: (display: ContractDisplay) => void;
  strikeMin: string;
  strikeMax: string;
  onStrikeMinChange: (val: string) => void;
  onStrikeMaxChange: (val: string) => void;
}

export function ChainFilters({
  symbol,
  onSymbolChange,
  display,
  onDisplayChange,
  strikeMin,
  strikeMax,
  onStrikeMinChange,
  onStrikeMaxChange,
}: ChainFiltersProps) {
  const [inputValue, setInputValue] = useState(symbol);

  const handleSymbolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputValue.trim().toUpperCase();
    if (clean) onSymbolChange(clean);
  };

  const handleQuickSymbol = (sym: string) => {
    setInputValue(sym);
    onSymbolChange(sym);
  };

  return (
    <div className="space-y-3">
      {/* Symbol input row */}
      <div className="flex flex-wrap items-center gap-2">
        <form onSubmit={handleSymbolSubmit} className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value.toUpperCase())}
              placeholder="Symbol"
              className="h-8 w-24 pl-8 text-sm uppercase"
              maxLength={10}
            />
          </div>
          <Button type="submit" size="sm" variant="outline" className="h-8 text-xs">
            Load
          </Button>
        </form>

        {/* Quick-select symbols */}
        <div className="flex flex-wrap gap-1">
          {QUICK_SYMBOLS.map((sym) => (
            <button
              key={sym}
              onClick={() => handleQuickSymbol(sym)}
              className={cn(
                'rounded px-2 py-1 text-xs font-medium transition-colors',
                sym === symbol
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
              )}
            >
              {sym}
            </button>
          ))}
        </div>
      </div>

      {/* Calls / puts toggle + strike range */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Display toggle */}
        <div className="inline-flex rounded-md border bg-card p-0.5">
          {(['calls', 'both', 'puts'] as ContractDisplay[]).map((mode) => (
            <button
              key={mode}
              onClick={() => onDisplayChange(mode)}
              className={cn(
                'rounded px-3 py-1 text-xs font-medium capitalize transition-colors',
                display === mode
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Strike range */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Strike</span>
          <Input
            type="number"
            value={strikeMin}
            onChange={(e) => onStrikeMinChange(e.target.value)}
            placeholder="Min"
            className="h-7 w-16 text-xs"
            min={0}
          />
          <span className="text-xs text-muted-foreground">–</span>
          <Input
            type="number"
            value={strikeMax}
            onChange={(e) => onStrikeMaxChange(e.target.value)}
            placeholder="Max"
            className="h-7 w-16 text-xs"
            min={0}
          />
        </div>
      </div>
    </div>
  );
}

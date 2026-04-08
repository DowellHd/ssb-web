'use client';

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Globe,
  Loader2,
  Plus,
  Search,
  Shield,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  listExchanges,
  listADRs,
  getCountryRisk,
  searchGlobalSymbols,
  getGlobalQuote,
  getFXRates,
  getGlobalWatchlist,
  addToGlobalWatchlist,
  removeFromGlobalWatchlist,
  type Exchange,
  type ADR,
  type CountryRisk,
  type GlobalQuote,
  type FXRates,
  type WatchlistItem,
  type SymbolSearchResult,
} from '@/lib/api/global-markets';

const MAJOR_CURRENCIES = ['EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'INR'];

const RISK_COLOR: Record<string, string> = {
  'Very Low':  'text-green-600',
  'Low':       'text-emerald-600',
  'Moderate':  'text-yellow-600',
  'High':      'text-orange-600',
  'Very High': 'text-red-600',
};

type Tab = 'overview' | 'adrs' | 'fx' | 'watchlist';

export default function GlobalMarketsPage() {
  const [tab, setTab]           = useState<Tab>('overview');
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [adrs, setAdrs]         = useState<ADR[]>([]);
  const [risks, setRisks]       = useState<CountryRisk[]>([]);
  const [fxRates, setFxRates]   = useState<FXRates | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SymbolSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<GlobalQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  // Add-to-watchlist state
  const [addSymbol, setAddSymbol] = useState('');
  const [adding, setAdding]       = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [exData, adrData, riskData, fxData, wlData] = await Promise.all([
        listExchanges(),
        listADRs(),
        getCountryRisk(),
        getFXRates(),
        getGlobalWatchlist(),
      ]);
      setExchanges(exData.exchanges);
      setAdrs(adrData.adrs);
      setRisks((riskData.countries || []) as CountryRisk[]);
      setFxRates(fxData);
      setWatchlist(wlData.items);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load global markets data');
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const { results } = await searchGlobalSymbols(searchQuery);
      setSearchResults(results);
    } catch {
      setError('Symbol search failed');
    } finally {
      setSearching(false);
    }
  }

  async function handleGetQuote(symbol: string) {
    setQuoteLoading(true);
    setSelectedQuote(null);
    try {
      const q = await getGlobalQuote(symbol);
      setSelectedQuote(q);
    } catch {
      setError(`Failed to fetch quote for ${symbol}`);
    } finally {
      setQuoteLoading(false);
    }
  }

  async function handleAddToWatchlist(symbol: string, name?: string) {
    setAdding(true);
    try {
      await addToGlobalWatchlist({ symbol, display_name: name });
      const { items } = await getGlobalWatchlist();
      setWatchlist(items);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to add to watchlist');
    } finally {
      setAdding(false);
    }
  }

  async function handleRemoveFromWatchlist(id: string) {
    try {
      await removeFromGlobalWatchlist(id);
      setWatchlist(prev => prev.filter(w => w.id !== id));
    } catch {
      setError('Failed to remove from watchlist');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'adrs',     label: 'ADRs' },
    { key: 'fx',       label: 'FX Rates' },
    { key: 'watchlist',label: 'Watchlist' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Globe className="h-6 w-6 text-primary" />
          Global Markets
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          International equities, FX rates, ADRs, and country risk analysis.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="rounded-lg border border-blue-300 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800 p-3 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
        <Shield className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <span>
          <strong>Informational only.</strong> Global market data is for analysis and education. SSB cannot execute international trades or convert currencies.
        </span>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
          <button className="ml-auto text-xs underline" onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === t.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview ──────────────────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {/* Symbol search */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <h2 className="font-semibold text-sm">Search Global Symbols</h2>
            <div className="flex gap-2">
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="e.g. HSBC, Toyota, Shopify…"
                className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button size="sm" onClick={handleSearch} disabled={searching}>
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Use exchange suffixes for international stocks: <code className="bg-muted px-1 rounded">HSBA.LON</code> (London), <code className="bg-muted px-1 rounded">RY.TRT</code> (Toronto), <code className="bg-muted px-1 rounded">BHP.AUS</code> (Australia)
            </p>

            {searchResults.length > 0 && (
              <div className="rounded-lg border overflow-hidden">
                {searchResults.map((r, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 text-sm hover:bg-muted/30 border-b last:border-0">
                    <div>
                      <span className="font-semibold">{r.symbol}</span>
                      <span className="ml-2 text-muted-foreground">{r.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{r.region} · {r.currency}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleGetQuote(r.symbol)}>Quote</Button>
                      <Button size="sm" variant="ghost" onClick={() => handleAddToWatchlist(r.symbol, r.name)}>
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {quoteLoading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Fetching quote…
              </div>
            )}

            {selectedQuote && (
              <div className="rounded-lg border bg-muted/20 p-3 text-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-base">{selectedQuote.symbol}</span>
                  <button onClick={() => setSelectedQuote(null)}><X className="h-4 w-4 text-muted-foreground" /></button>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    ['Price', selectedQuote.price?.toFixed(2) ?? '—'],
                    ['Change', `${Number(selectedQuote.change_pct) >= 0 ? '+' : ''}${selectedQuote.change_pct}%`],
                    ['Volume', selectedQuote.volume?.toLocaleString() ?? '—'],
                    ['High',   selectedQuote.high?.toFixed(2) ?? '—'],
                    ['Low',    selectedQuote.low?.toFixed(2) ?? '—'],
                    ['Prev Close', selectedQuote.previous_close?.toFixed(2) ?? '—'],
                  ].map(([label, val]) => (
                    <div key={label} className="rounded bg-muted/40 p-2">
                      <p className="text-muted-foreground">{label}</p>
                      <p className={cn('font-semibold', label === 'Change' && Number(selectedQuote.change_pct) < 0 ? 'text-red-500' : label === 'Change' ? 'text-green-600' : '')}>{val}</p>
                    </div>
                  ))}
                </div>
                {selectedQuote._simulated && (
                  <p className="text-[10px] text-muted-foreground">Simulated data — configure ALPHA_VANTAGE_API_KEY for live quotes.</p>
                )}
              </div>
            )}
          </div>

          {/* Exchange directory */}
          <div className="space-y-2">
            <h2 className="font-semibold text-sm">Major Exchanges</h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {exchanges.map(ex => (
                <div key={ex.code} className="rounded-lg border bg-card p-3 text-xs">
                  <p className="font-semibold">{ex.code}</p>
                  <p className="text-muted-foreground truncate">{ex.name}</p>
                  <p className="text-muted-foreground mt-1">{ex.region} · {ex.currency}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Country risk — top 10 safest */}
          <div className="space-y-2">
            <h2 className="font-semibold text-sm">Country Risk Profiles</h2>
            <p className="text-[11px] text-muted-foreground">Damodaran risk premium framework (illustrative). Lower score = lower risk.</p>
            <div className="rounded-lg border overflow-hidden">
              <div className="grid grid-cols-4 gap-2 px-3 py-2 bg-muted/30 text-[10px] font-semibold text-muted-foreground uppercase">
                <span>Country</span>
                <span className="text-right">Risk Score</span>
                <span className="text-right">Rating</span>
                <span className="text-right">Risk Premium</span>
              </div>
              {risks.map(r => (
                <div key={r.country_code} className="grid grid-cols-4 gap-2 px-3 py-2 text-xs border-t hover:bg-muted/20">
                  <span className="font-semibold">{r.country_code}</span>
                  <span className={cn('text-right font-medium', RISK_COLOR[r.risk_level] || '')}>{r.risk_score}</span>
                  <span className="text-right">{r.rating}</span>
                  <span className="text-right">{r.risk_premium_pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ADRs ──────────────────────────────────────────────────────────────── */}
      {tab === 'adrs' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            American Depositary Receipts (ADRs) let US investors trade foreign company shares on US exchanges. Currency risk and foreign taxes apply.
          </p>
          <div className="rounded-lg border overflow-hidden">
            <div className="grid grid-cols-4 gap-2 px-3 py-2 bg-muted/30 text-[10px] font-semibold text-muted-foreground uppercase">
              <span>Symbol</span>
              <span>Company</span>
              <span>Country</span>
              <span>Sector</span>
            </div>
            {adrs.map(a => (
              <div key={a.symbol} className="grid grid-cols-4 gap-2 px-3 py-2 text-xs border-t hover:bg-muted/20 items-center">
                <span className="font-semibold">{a.symbol}</span>
                <span className="truncate">{a.name}</span>
                <span>{a.country} · {a.exchange}</span>
                <span className="text-muted-foreground">{a.sector}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── FX Rates ──────────────────────────────────────────────────────────── */}
      {tab === 'fx' && (
        <div className="space-y-4">
          {fxRates && (
            <>
              <p className="text-sm text-muted-foreground">
                USD exchange rates — 1 unit of each currency in USD.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {MAJOR_CURRENCIES.map(ccy => {
                  const rate = fxRates.rates[ccy];
                  return (
                    <div key={ccy} className="rounded-xl border bg-card p-3">
                      <p className="text-xs text-muted-foreground">USD / {ccy}</p>
                      <p className="text-xl font-bold tabular-nums mt-1">
                        {rate ? rate.toFixed(4) : '—'}
                      </p>
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-muted-foreground">{fxRates.disclaimer}</p>
            </>
          )}
        </div>
      )}

      {/* ── Watchlist ─────────────────────────────────────────────────────────── */}
      {tab === 'watchlist' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              value={addSymbol}
              onChange={e => setAddSymbol(e.target.value.toUpperCase())}
              placeholder="Symbol (e.g. HSBA.LON)"
              className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button
              size="sm"
              onClick={() => addSymbol && handleAddToWatchlist(addSymbol)}
              disabled={adding || !addSymbol}
            >
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
              Add
            </Button>
          </div>

          {watchlist.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              <Globe className="h-8 w-8 mx-auto mb-2 opacity-40" />
              No international stocks in your watchlist yet.
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              {watchlist.map(item => (
                <div key={item.id} className="flex items-center justify-between px-3 py-3 text-sm border-b last:border-0 hover:bg-muted/20">
                  <div>
                    <span className="font-semibold">{item.symbol}</span>
                    {item.display_name && <span className="ml-2 text-muted-foreground">{item.display_name}</span>}
                    {item.country_code && <span className="ml-2 text-xs text-muted-foreground">{item.country_code}</span>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleGetQuote(item.symbol)}>
                      <TrendingUp className="h-3.5 w-3.5 mr-1" />Quote
                    </Button>
                    <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={() => handleRemoveFromWatchlist(item.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {quoteLoading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Fetching quote…
            </div>
          )}

          {selectedQuote && (
            <div className="rounded-lg border bg-muted/20 p-3 text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-base">{selectedQuote.symbol}</span>
                <button onClick={() => setSelectedQuote(null)}><X className="h-4 w-4 text-muted-foreground" /></button>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  ['Price', selectedQuote.price?.toFixed(2) ?? '—'],
                  ['Change %', `${Number(selectedQuote.change_pct) >= 0 ? '+' : ''}${selectedQuote.change_pct}%`],
                  ['Volume', selectedQuote.volume?.toLocaleString() ?? '—'],
                ].map(([label, val]) => (
                  <div key={label} className="rounded bg-muted/40 p-2">
                    <p className="text-muted-foreground">{label}</p>
                    <p className="font-semibold">{val}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

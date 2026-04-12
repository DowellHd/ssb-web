'use client';

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeftRight,
  BarChart3,
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

// ── Static simulated data ─────────────────────────────────────────────────────

const SOVEREIGN_BONDS = [
  { country: 'United States', code: 'US',  currency: 'USD', rating: 'AA+', '2Y': 4.85, '5Y': 4.55, '10Y': 4.35, '30Y': 4.65, market: 'Developed' },
  { country: 'Germany',       code: 'DE',  currency: 'EUR', rating: 'AAA', '2Y': 2.45, '5Y': 2.35, '10Y': 2.50, '30Y': 2.85, market: 'Developed' },
  { country: 'United Kingdom',code: 'GB',  currency: 'GBP', rating: 'AA-', '2Y': 4.35, '5Y': 4.20, '10Y': 4.45, '30Y': 4.90, market: 'Developed' },
  { country: 'Japan',         code: 'JP',  currency: 'JPY', rating: 'A+',  '2Y': 0.45, '5Y': 0.70, '10Y': 1.25, '30Y': 2.15, market: 'Developed' },
  { country: 'Canada',        code: 'CA',  currency: 'CAD', rating: 'AAA', '2Y': 3.95, '5Y': 3.80, '10Y': 3.85, '30Y': 4.15, market: 'Developed' },
  { country: 'France',        code: 'FR',  currency: 'EUR', rating: 'AA-', '2Y': 2.65, '5Y': 2.75, '10Y': 3.05, '30Y': 3.55, market: 'Developed' },
  { country: 'Italy',         code: 'IT',  currency: 'EUR', rating: 'BBB', '2Y': 3.05, '5Y': 3.35, '10Y': 3.75, '30Y': 4.45, market: 'Developed' },
  { country: 'Australia',     code: 'AU',  currency: 'AUD', rating: 'AAA', '2Y': 3.95, '5Y': 4.05, '10Y': 4.35, '30Y': 4.80, market: 'Developed' },
  { country: 'South Korea',   code: 'KR',  currency: 'KRW', rating: 'AA',  '2Y': 3.30, '5Y': 3.40, '10Y': 3.55, '30Y': 3.80, market: 'Developed' },
  { country: 'China',         code: 'CN',  currency: 'CNY', rating: 'A+',  '2Y': 1.75, '5Y': 1.90, '10Y': 2.15, '30Y': 2.45, market: 'Emerging' },
  { country: 'Brazil',        code: 'BR',  currency: 'BRL', rating: 'BB',  '2Y': 12.10,'5Y': 12.85,'10Y': 13.40,'30Y': 14.05, market: 'Emerging' },
  { country: 'India',         code: 'IN',  currency: 'INR', rating: 'BBB-','2Y': 6.90, '5Y': 7.05, '10Y': 7.15, '30Y': 7.35, market: 'Emerging' },
  { country: 'Mexico',        code: 'MX',  currency: 'MXN', rating: 'BBB-','2Y': 9.80, '5Y': 10.10,'10Y': 10.35,'30Y': 10.80, market: 'Emerging' },
  { country: 'South Africa',  code: 'ZA',  currency: 'ZAR', rating: 'BB-', '2Y': 9.05, '5Y': 9.95, '10Y': 10.85,'30Y': 11.70, market: 'Emerging' },
  { country: 'Turkey',        code: 'TR',  currency: 'TRY', rating: 'B+',  '2Y': 38.50,'5Y': 33.20,'10Y': 29.80,'30Y': 27.40, market: 'Emerging' },
] as const;

const GLOBAL_SECTORS = [
  { name: 'Technology',        us: 28.5,  europe: 7.2,  asia: 18.4, emerging: 12.1 },
  { name: 'Financials',        us: 13.2,  europe: 19.8, asia: 22.6, emerging: 25.3 },
  { name: 'Healthcare',        us: 12.8,  europe: 14.5, asia:  6.3, emerging:  3.8 },
  { name: 'Consumer Disc.',    us: 10.4,  europe:  8.9, asia: 14.2, emerging: 10.5 },
  { name: 'Industrials',       us:  8.7,  europe: 16.2, asia: 11.8, emerging:  7.4 },
  { name: 'Energy',            us:  4.8,  europe:  6.1, asia:  4.5, emerging: 11.2 },
  { name: 'Materials',         us:  2.6,  europe:  8.3, asia:  7.2, emerging:  9.6 },
  { name: 'Utilities',         us:  2.4,  europe:  4.8, asia:  3.5, emerging:  3.2 },
  { name: 'Real Estate',       us:  2.3,  europe:  1.9, asia:  3.8, emerging:  2.4 },
  { name: 'Comm. Services',    us:  8.8,  europe:  3.5, asia:  8.4, emerging:  9.7 },
  { name: 'Consumer Staples',  us:  5.5,  europe: 12.8, asia:  8.9, emerging:  4.8 },
] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

function calcForwardRate(spot: number, domesticRate: number, foreignRate: number, years: number): number {
  // Covered Interest Rate Parity: F = S × ((1 + r_d) / (1 + r_f))^t
  return spot * Math.pow((1 + domesticRate / 100) / (1 + foreignRate / 100), years);
}

const MAJOR_CURRENCIES = ['EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'INR'];

// Approximate central bank rates for CIP forward rate calc (illustrative)
const CCY_RATES: Record<string, number> = {
  USD: 5.25, EUR: 3.75, GBP: 5.00, CAD: 4.50, AUD: 4.25,
  JPY: 0.10, CHF: 1.50, CNY: 2.50, INR: 6.50,
};

const RISK_COLOR: Record<string, string> = {
  'Very Low':  'text-green-600',
  'Low':       'text-emerald-600',
  'Moderate':  'text-yellow-600',
  'High':      'text-orange-600',
  'Very High': 'text-red-600',
};

const RATING_COLOR = (r: string) => {
  if (r.startsWith('AAA') || r.startsWith('AA')) return 'text-green-600';
  if (r.startsWith('A'))  return 'text-emerald-600';
  if (r.startsWith('BBB')) return 'text-yellow-600';
  if (r.startsWith('BB')) return 'text-orange-600';
  return 'text-red-600';
};

type Tab = 'overview' | 'sovereign' | 'adrs' | 'fx' | 'watchlist';

// ── Page ──────────────────────────────────────────────────────────────────────

export default function GlobalMarketsPage() {
  const [tab, setTab]             = useState<Tab>('overview');
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [adrs, setAdrs]           = useState<ADR[]>([]);
  const [risks, setRisks]         = useState<CountryRisk[]>([]);
  const [fxRates, setFxRates]     = useState<FXRates | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery]     = useState('');
  const [searchResults, setSearchResults] = useState<SymbolSearchResult[]>([]);
  const [searching, setSearching]         = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<GlobalQuote | null>(null);
  const [quoteLoading, setQuoteLoading]   = useState(false);

  // Watchlist add
  const [addSymbol, setAddSymbol] = useState('');
  const [adding, setAdding]       = useState(false);

  // Sovereign bond filters
  const [sovMarketFilter, setSovMarketFilter] = useState<'All' | 'Developed' | 'Emerging'>('All');
  const [sovMaturity, setSovMaturity]         = useState<'2Y' | '5Y' | '10Y' | '30Y'>('10Y');

  // Country risk filter
  const [riskMarketFilter, setRiskMarketFilter] = useState<'All' | 'Developed' | 'Emerging'>('All');

  // FX tools
  const [fxFrom, setFxFrom]           = useState('USD');
  const [fxTo, setFxTo]               = useState('EUR');
  const [fxAmount, setFxAmount]       = useState(10000);
  const [hedgeYears, setHedgeYears]   = useState(1);

  useEffect(() => { loadData(); }, []);

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
    } catch { setError('Symbol search failed'); }
    finally { setSearching(false); }
  }

  async function handleGetQuote(symbol: string) {
    setQuoteLoading(true); setSelectedQuote(null);
    try {
      const q = await getGlobalQuote(symbol);
      setSelectedQuote(q);
    } catch { setError(`Failed to fetch quote for ${symbol}`); }
    finally { setQuoteLoading(false); }
  }

  async function handleAddToWatchlist(symbol: string, name?: string) {
    setAdding(true);
    try {
      await addToGlobalWatchlist({ symbol, display_name: name });
      const { items } = await getGlobalWatchlist();
      setWatchlist(items);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to add to watchlist');
    } finally { setAdding(false); }
  }

  async function handleRemoveFromWatchlist(id: string) {
    try {
      await removeFromGlobalWatchlist(id);
      setWatchlist(prev => prev.filter(w => w.id !== id));
    } catch { setError('Failed to remove from watchlist'); }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'overview',  label: 'Overview' },
    { key: 'sovereign', label: 'Sovereign Debt' },
    { key: 'adrs',      label: 'ADRs' },
    { key: 'fx',        label: 'FX & Hedging' },
    { key: 'watchlist', label: 'Watchlist' },
  ];

  // FX tools derived values
  const spotRate = fxRates
    ? (fxFrom === 'USD' ? (fxRates.rates[fxTo] ?? 1) : (fxTo === 'USD' ? 1 / (fxRates.rates[fxFrom] ?? 1) : (fxRates.rates[fxTo] ?? 1) / (fxRates.rates[fxFrom] ?? 1)))
    : 1;
  const convertedAmount = fxAmount * spotRate;
  const forwardRate = calcForwardRate(spotRate, CCY_RATES[fxFrom] ?? 5, CCY_RATES[fxTo] ?? 3.5, hedgeYears);
  const forwardConverted = fxAmount * forwardRate;
  const hedgeCost = ((forwardRate - spotRate) / spotRate) * 100;

  const filteredSovBonds = SOVEREIGN_BONDS.filter(b => sovMarketFilter === 'All' || b.market === sovMarketFilter);
  const DEVELOPED_COUNTRY_CODES = ['US', 'DE', 'GB', 'JP', 'CA', 'FR', 'AU', 'CH', 'NL', 'SE', 'DK', 'NO', 'NZ', 'KR', 'SG', 'HK', 'AT', 'BE', 'FI', 'IE', 'IT', 'ES', 'PT'];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Globe className="h-6 w-6 text-primary" />
          Global Markets
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          International equities, sovereign debt, FX rates, ADRs, and country risk analysis.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="rounded-lg border border-blue-300 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800 p-3 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
        <Shield className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <span>
          <strong>Informational only.</strong> Global market data and sovereign bond yields are for analysis and education only. SSB cannot execute international trades, convert currencies, or provide tax advice. Sovereign bond yields are illustrative.
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
      <div className="flex gap-1 border-b overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
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
              Use exchange suffixes: <code className="bg-muted px-1 rounded">HSBA.LON</code> (London), <code className="bg-muted px-1 rounded">RY.TRT</code> (Toronto), <code className="bg-muted px-1 rounded">BHP.AUS</code> (Australia)
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
                    ['Price',      selectedQuote.price?.toFixed(2) ?? '—'],
                    ['Change',     `${Number(selectedQuote.change_pct) >= 0 ? '+' : ''}${selectedQuote.change_pct}%`],
                    ['Volume',     selectedQuote.volume?.toLocaleString() ?? '—'],
                    ['High',       selectedQuote.high?.toFixed(2) ?? '—'],
                    ['Low',        selectedQuote.low?.toFixed(2) ?? '—'],
                    ['Prev Close', selectedQuote.previous_close?.toFixed(2) ?? '—'],
                  ].map(([label, val]) => (
                    <div key={label} className="rounded bg-muted/40 p-2">
                      <p className="text-muted-foreground">{label}</p>
                      <p className={cn('font-semibold', label === 'Change' && Number(selectedQuote.change_pct) < 0 ? 'text-red-500' : label === 'Change' ? 'text-green-600' : '')}>{val}</p>
                    </div>
                  ))}
                </div>
                {selectedQuote._simulated && (
                  <p className="text-[10px] text-muted-foreground">Simulated — configure ALPHA_VANTAGE_API_KEY for live quotes.</p>
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

          {/* Global sector weights */}
          <div className="space-y-2">
            <h2 className="font-semibold text-sm">Global Sector Weights (%)</h2>
            <p className="text-[11px] text-muted-foreground">Approximate index weights by region. Illustrative only.</p>
            <div className="rounded-lg border overflow-hidden">
              <div className="grid grid-cols-5 gap-2 px-3 py-2 bg-muted/30 text-[10px] font-semibold text-muted-foreground uppercase">
                <span>Sector</span>
                <span className="text-right">US</span>
                <span className="text-right">Europe</span>
                <span className="text-right">Asia Dev.</span>
                <span className="text-right">Emerging</span>
              </div>
              {GLOBAL_SECTORS.map(s => (
                <div key={s.name} className="grid grid-cols-5 gap-2 px-3 py-2 text-xs border-t hover:bg-muted/20">
                  <span>{s.name}</span>
                  <span className="text-right tabular-nums">{s.us}%</span>
                  <span className="text-right tabular-nums">{s.europe}%</span>
                  <span className="text-right tabular-nums">{s.asia}%</span>
                  <span className="text-right tabular-nums">{s.emerging}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Country risk */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-sm">Country Risk Profiles</h2>
                <p className="text-[11px] text-muted-foreground">Damodaran risk premium framework. Lower score = lower risk.</p>
              </div>
              <div className="flex gap-1">
                {(['All', 'Developed', 'Emerging'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setRiskMarketFilter(f)}
                    className={cn(
                      'px-2.5 py-1 text-xs rounded-full border transition-colors',
                      riskMarketFilter === f ? 'bg-primary text-primary-foreground border-primary' : 'text-muted-foreground hover:bg-muted',
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-lg border overflow-hidden">
              <div className="grid grid-cols-5 gap-2 px-3 py-2 bg-muted/30 text-[10px] font-semibold text-muted-foreground uppercase">
                <span>Country</span>
                <span>Market</span>
                <span className="text-right">Risk Score</span>
                <span className="text-right">Rating</span>
                <span className="text-right">Risk Premium</span>
              </div>
              {risks
                .filter(r => riskMarketFilter === 'All' || (riskMarketFilter === 'Developed' ? DEVELOPED_COUNTRY_CODES.includes(r.country_code) : !DEVELOPED_COUNTRY_CODES.includes(r.country_code)))
                .map(r => (
                  <div key={r.country_code} className="grid grid-cols-5 gap-2 px-3 py-2 text-xs border-t hover:bg-muted/20">
                    <span className="font-semibold">{r.country_code}</span>
                    <span className="text-muted-foreground text-[10px]">
                      {DEVELOPED_COUNTRY_CODES.includes(r.country_code) ? 'Developed' : 'Emerging'}
                    </span>
                    <span className={cn('text-right font-medium', RISK_COLOR[r.risk_level] || '')}>{r.risk_score}</span>
                    <span className="text-right">{r.rating}</span>
                    <span className="text-right">{r.risk_premium_pct}%</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Sovereign Debt ────────────────────────────────────────────────────── */}
      {tab === 'sovereign' && (
        <div className="space-y-4">
          <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-3 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>Sovereign bond yields are illustrative and may not reflect real-time market conditions. Actual yields vary by market environment and credit conditions.</span>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-1">
              {(['All', 'Developed', 'Emerging'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setSovMarketFilter(f)}
                  className={cn(
                    'px-2.5 py-1 text-xs rounded-full border transition-colors',
                    sovMarketFilter === f ? 'bg-primary text-primary-foreground border-primary' : 'text-muted-foreground hover:bg-muted',
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex gap-1 ml-auto">
              {(['2Y', '5Y', '10Y', '30Y'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setSovMaturity(m)}
                  className={cn(
                    'px-2.5 py-1 text-xs rounded-full border transition-colors',
                    sovMaturity === m ? 'bg-primary text-primary-foreground border-primary' : 'text-muted-foreground hover:bg-muted',
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Yield bar chart */}
          <div className="rounded-xl border bg-card p-4">
            <h2 className="font-semibold text-sm mb-3">Government Bond Yields — {sovMaturity} ({sovMarketFilter})</h2>
            <div className="space-y-2">
              {[...filteredSovBonds]
                .sort((a, b) => (b[sovMaturity] as number) - (a[sovMaturity] as number))
                .map(b => {
                  const yld = b[sovMaturity] as number;
                  const maxYld = Math.max(...filteredSovBonds.map(x => x[sovMaturity] as number));
                  const barWidth = (yld / maxYld) * 100;
                  return (
                    <div key={b.code} className="flex items-center gap-3 text-xs">
                      <span className="w-28 truncate font-medium">{b.country}</span>
                      <div className="flex-1 bg-muted/30 rounded-full h-5 overflow-hidden">
                        <div
                          className={cn('h-5 rounded-full flex items-center pl-2 text-[10px] font-semibold text-white transition-all',
                            b.market === 'Emerging' ? 'bg-orange-500/80' : 'bg-primary/70')}
                          style={{ width: `${Math.max(barWidth, 8)}%` }}
                        >
                          {yld.toFixed(2)}%
                        </div>
                      </div>
                      <span className={cn('w-12 text-right font-medium', RATING_COLOR(b.rating))}>{b.rating}</span>
                      <span className="w-8 text-right text-muted-foreground">{b.currency}</span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Full table */}
          <div className="rounded-lg border overflow-hidden">
            <div className="grid grid-cols-7 gap-2 px-3 py-2 bg-muted/30 text-[10px] font-semibold text-muted-foreground uppercase">
              <span className="col-span-2">Country</span>
              <span className="text-right">2Y</span>
              <span className="text-right">5Y</span>
              <span className="text-right">10Y</span>
              <span className="text-right">30Y</span>
              <span className="text-right">Rating</span>
            </div>
            {filteredSovBonds.map(b => (
              <div key={b.code} className="grid grid-cols-7 gap-2 px-3 py-2 text-xs border-t hover:bg-muted/20">
                <span className="col-span-2 font-medium">
                  {b.country}
                  <span className={cn('ml-2 text-[10px] px-1 py-0.5 rounded',
                    b.market === 'Emerging' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  )}>{b.market === 'Emerging' ? 'EM' : 'DM'}</span>
                </span>
                <span className="text-right tabular-nums">{(b['2Y'] as number).toFixed(2)}%</span>
                <span className="text-right tabular-nums">{(b['5Y'] as number).toFixed(2)}%</span>
                <span className="text-right tabular-nums font-semibold">{(b['10Y'] as number).toFixed(2)}%</span>
                <span className="text-right tabular-nums">{(b['30Y'] as number).toFixed(2)}%</span>
                <span className={cn('text-right font-semibold', RATING_COLOR(b.rating))}>{b.rating}</span>
              </div>
            ))}
          </div>

          <div className="rounded-lg border bg-card p-3 text-xs space-y-1.5">
            <p className="font-semibold">Key Concepts</p>
            <p className="text-muted-foreground"><strong>Spread vs UST:</strong> The premium EM bonds offer over US Treasuries — compensates for currency, political, and credit risk.</p>
            <p className="text-muted-foreground"><strong>Yield curve shape:</strong> Compare 2Y vs 10Y to gauge market expectations for growth and inflation in each country.</p>
            <p className="text-muted-foreground"><strong>Credit rating:</strong> AAA–A+ = investment grade; BBB range = lowest IG; BB and below = high yield / speculative.</p>
          </div>
        </div>
      )}

      {/* ── ADRs ──────────────────────────────────────────────────────────────── */}
      {tab === 'adrs' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            American Depositary Receipts (ADRs) let US investors trade foreign company shares on US exchanges.
          </p>

          <div className="rounded-lg border bg-card p-3 text-xs space-y-1.5">
            <p className="font-semibold flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> International Tax Considerations</p>
            <p className="text-muted-foreground">ADR dividends may be subject to <strong>foreign withholding tax</strong> (typically 15–30%), which can reduce effective yield. A foreign tax credit may be available on US tax returns (Form 1116).</p>
            <p className="text-muted-foreground"><strong>Currency risk:</strong> Even though ADRs trade in USD, the underlying asset is priced in a foreign currency. Exchange rate movements affect total returns.</p>
            <p className="text-muted-foreground"><strong>GDRs</strong> (Global Depositary Receipts) work similarly but trade on non-US exchanges (e.g. London, Luxembourg).</p>
          </div>

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

      {/* ── FX & Hedging ──────────────────────────────────────────────────────── */}
      {tab === 'fx' && (
        <div className="space-y-4">
          {fxRates && (
            <>
              {/* Spot rates */}
              <div>
                <h2 className="font-semibold text-sm mb-2">USD Spot Rates</h2>
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
                <p className="text-[11px] text-muted-foreground mt-2">{fxRates.disclaimer}</p>
              </div>

              {/* Currency converter */}
              <div className="rounded-xl border bg-card p-4 space-y-3">
                <h2 className="font-semibold text-sm flex items-center gap-2">
                  <ArrowLeftRight className="h-4 w-4" /> Currency Converter & Forward Rate
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Amount</label>
                    <input
                      type="number"
                      value={fxAmount}
                      onChange={e => setFxAmount(parseFloat(e.target.value) || 0)}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">From</label>
                    <select value={fxFrom} onChange={e => setFxFrom(e.target.value)}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                      {['USD', ...MAJOR_CURRENCIES].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">To</label>
                    <select value={fxTo} onChange={e => setFxTo(e.target.value)}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                      {['USD', ...MAJOR_CURRENCIES].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Hedge Horizon (years)</label>
                    <input
                      type="number"
                      min="0.25" max="5" step="0.25"
                      value={hedgeYears}
                      onChange={e => setHedgeYears(parseFloat(e.target.value) || 1)}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg bg-muted/30 p-3 text-xs">
                    <p className="text-muted-foreground">Spot Conversion</p>
                    <p className="text-lg font-bold tabular-nums mt-1">
                      {convertedAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} {fxTo}
                    </p>
                    <p className="text-muted-foreground">Spot: {spotRate.toFixed(4)}</p>
                  </div>
                  <div className="rounded-lg bg-muted/30 p-3 text-xs">
                    <p className="text-muted-foreground">Forward Rate ({hedgeYears}Y)</p>
                    <p className="text-lg font-bold tabular-nums mt-1">{forwardRate.toFixed(4)}</p>
                    <p className={cn('font-medium', hedgeCost >= 0 ? 'text-red-500' : 'text-green-600')}>
                      {hedgeCost >= 0 ? '+' : ''}{hedgeCost.toFixed(2)}% hedge cost
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/30 p-3 text-xs">
                    <p className="text-muted-foreground">Forward Converted</p>
                    <p className="text-lg font-bold tabular-nums mt-1">
                      {forwardConverted.toLocaleString(undefined, { maximumFractionDigits: 2 })} {fxTo}
                    </p>
                    <p className="text-muted-foreground">vs spot: {(forwardConverted - convertedAmount).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                </div>

                <div className="rounded-lg border bg-muted/10 p-2.5 text-xs text-muted-foreground space-y-1">
                  <p><strong>Covered Interest Rate Parity (CIP):</strong> Forward rate = Spot × ((1 + r_domestic) / (1 + r_foreign))^t</p>
                  <p>Using approximate central bank rates: {fxFrom} ≈ {CCY_RATES[fxFrom] ?? '—'}%, {fxTo} ≈ {CCY_RATES[fxTo] ?? '—'}%. Actual forward rates depend on interbank markets.</p>
                </div>
              </div>

              {/* Hedging strategies */}
              <div className="rounded-xl border bg-card p-4 space-y-3">
                <h2 className="font-semibold text-sm">Currency Hedging Strategies</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { name: 'Forward Contract',    pros: 'Locks in rate precisely', cons: 'No upside if currency moves favorably', use: 'Corporations hedging receivables/payables' },
                    { name: 'Currency Options',    pros: 'Caps downside, keeps upside', cons: 'Premium cost (0.5–3% of notional)', use: 'Portfolio managers, importers' },
                    { name: 'Currency Swap',       pros: 'Hedge over longer term', cons: 'Counterparty risk, complexity', use: 'Cross-border debt issuance' },
                    { name: 'Natural Hedge',       pros: 'No derivative cost', cons: 'Requires matched revenues/costs', use: 'Multinationals with local ops' },
                  ].map(s => (
                    <div key={s.name} className="rounded-lg border p-3 text-xs space-y-1">
                      <p className="font-semibold text-sm">{s.name}</p>
                      <p className="text-green-600"><strong>Pro:</strong> {s.pros}</p>
                      <p className="text-red-500"><strong>Con:</strong> {s.cons}</p>
                      <p className="text-muted-foreground"><strong>Used by:</strong> {s.use}</p>
                    </div>
                  ))}
                </div>
              </div>
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
            <Button size="sm" onClick={() => addSymbol && handleAddToWatchlist(addSymbol)} disabled={adding || !addSymbol}>
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
                  ['Price',    selectedQuote.price?.toFixed(2) ?? '—'],
                  ['Change %', `${Number(selectedQuote.change_pct) >= 0 ? '+' : ''}${selectedQuote.change_pct}%`],
                  ['Volume',   selectedQuote.volume?.toLocaleString() ?? '—'],
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

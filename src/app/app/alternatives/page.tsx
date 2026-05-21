'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  BarChart3,
  Loader2,
  Plus,
  Shield,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  listAlternativeCategories,
  listREITs,
  listCommodityETFs,
  getCommodityPrice,
  listCommodities,
  listAlternativeETFs,
  getAlternativeAllocation,
  listAlternativePositions,
  addAlternativePosition,
  removeAlternativePosition,
  type AlternativeCategory,
  type REIT,
  type CommodityETF,
  type CommodityPrice,
  type AlternativeETF,
  type AlternativeAllocation,
  type AlternativePosition,
} from '@/lib/api/alternatives';

// ── Static simulated data ─────────────────────────────────────────────────────

interface REITMetric {
  ticker: string;
  dividendYield: number;
  pFFO: number;
  navPremiumPct: number;
  debtToEquity: number;
}

const REIT_METRICS: Record<string, REITMetric> = {
  VNQ:  { ticker: 'VNQ',  dividendYield: 4.2, pFFO: 16.8, navPremiumPct:  2.4, debtToEquity: 0.65 },
  O:    { ticker: 'O',    dividendYield: 5.4, pFFO: 14.2, navPremiumPct: -1.2, debtToEquity: 0.72 },
  SPG:  { ticker: 'SPG',  dividendYield: 4.8, pFFO: 12.5, navPremiumPct:  5.1, debtToEquity: 1.10 },
  PLD:  { ticker: 'PLD',  dividendYield: 2.8, pFFO: 22.4, navPremiumPct: 18.5, debtToEquity: 0.38 },
  AMT:  { ticker: 'AMT',  dividendYield: 3.1, pFFO: 20.6, navPremiumPct: 12.3, debtToEquity: 1.85 },
  WELL: { ticker: 'WELL', dividendYield: 2.4, pFFO: 24.1, navPremiumPct: 22.0, debtToEquity: 0.58 },
  PSA:  { ticker: 'PSA',  dividendYield: 4.5, pFFO: 17.3, navPremiumPct:  3.8, debtToEquity: 0.44 },
  EQIX: { ticker: 'EQIX', dividendYield: 2.1, pFFO: 26.5, navPremiumPct: 35.4, debtToEquity: 0.92 },
  DLR:  { ticker: 'DLR',  dividendYield: 3.6, pFFO: 18.9, navPremiumPct:  9.7, debtToEquity: 0.76 },
};

// Commodity futures term structure (simulated — illustrative contango/backwardation)
interface TermStructurePoint { label: string; price: number }

const FUTURES_TERM_STRUCTURES: Record<string, { name: string; structure: 'contango' | 'backwardation'; points: TermStructurePoint[]; explanation: string }> = {
  CRUDE_OIL: {
    name: 'Crude Oil (WTI)',
    structure: 'contango',
    points: [
      { label: 'Spot', price: 74.25 },
      { label: '1M',   price: 74.80 },
      { label: '3M',   price: 75.90 },
      { label: '6M',   price: 77.10 },
      { label: '12M',  price: 78.50 },
      { label: '24M',  price: 79.80 },
    ],
    explanation: 'Contango: futures price > spot. Storage costs and financing drive the premium. Roll yield is negative for long futures positions.',
  },
  GOLD: {
    name: 'Gold',
    structure: 'contango',
    points: [
      { label: 'Spot', price: 2345.00 },
      { label: '1M',   price: 2358.40 },
      { label: '3M',   price: 2385.20 },
      { label: '6M',   price: 2422.10 },
      { label: '12M',  price: 2495.80 },
      { label: '24M',  price: 2643.50 },
    ],
    explanation: 'Gold is nearly always in contango. The premium reflects cost of carry (storage + financing minus lease rate).',
  },
  NATURAL_GAS: {
    name: 'Natural Gas (Henry Hub)',
    structure: 'backwardation',
    points: [
      { label: 'Spot', price: 3.85 },
      { label: '1M',   price: 3.72 },
      { label: '3M',   price: 3.50 },
      { label: '6M',   price: 3.25 },
      { label: '12M',  price: 3.10 },
      { label: '24M',  price: 2.95 },
    ],
    explanation: 'Backwardation: futures price < spot. Signals tight current supply or seasonal demand peak. Positive roll yield for long positions.',
  },
  COPPER: {
    name: 'Copper',
    structure: 'backwardation',
    points: [
      { label: 'Spot', price: 4.42 },
      { label: '1M',   price: 4.38 },
      { label: '3M',   price: 4.30 },
      { label: '6M',   price: 4.18 },
      { label: '12M',  price: 4.05 },
      { label: '24M',  price: 3.95 },
    ],
    explanation: 'Copper in backwardation often reflects strong near-term industrial demand. Miners may be short, pushing up spot.',
  },
  WHEAT: {
    name: 'Wheat',
    structure: 'contango',
    points: [
      { label: 'Spot', price: 5.82 },
      { label: '1M',   price: 5.95 },
      { label: '3M',   price: 6.12 },
      { label: '6M',   price: 6.35 },
      { label: '12M',  price: 6.58 },
      { label: '24M',  price: 6.80 },
    ],
    explanation: 'Grain contango is common post-harvest with plentiful supply. Forward prices reflect carry costs until next crop cycle.',
  },
};

// Hedge fund strategy reference data
const HF_STRATEGIES = [
  {
    name: 'Long/Short Equity',
    aum_pct: 28,
    typical_net_exposure: '30–60%',
    target_sharpe: '0.8–1.2',
    typical_fee: '2/20',
    description: 'Holds long positions in undervalued stocks and short positions in overvalued ones. Net exposure determines directional bias.',
    risks: 'Stock selection, crowding, market correlation',
  },
  {
    name: 'Global Macro',
    aum_pct: 19,
    typical_net_exposure: 'Variable',
    target_sharpe: '0.6–1.0',
    typical_fee: '2/20',
    description: 'Takes large directional bets on currencies, interest rates, commodities, and equity indices based on macroeconomic views.',
    risks: 'Timing, leverage, tail events',
  },
  {
    name: 'Event-Driven',
    aum_pct: 17,
    typical_net_exposure: '20–50%',
    target_sharpe: '0.7–1.1',
    typical_fee: '1.5/15',
    description: 'Profits from corporate events: M&A (merger arbitrage), restructurings, spin-offs, and distressed situations.',
    risks: 'Deal break risk, illiquidity in distressed',
  },
  {
    name: 'Relative Value / Arbitrage',
    aum_pct: 15,
    typical_net_exposure: '0–10%',
    target_sharpe: '1.0–2.0',
    typical_fee: '2/20',
    description: 'Exploits pricing inefficiencies between related instruments: convertible arb, fixed income arb, statistical arb.',
    risks: 'Convergence failure, liquidity squeeze',
  },
  {
    name: 'Multi-Strategy',
    aum_pct: 13,
    typical_net_exposure: 'Variable',
    target_sharpe: '1.0–1.5',
    typical_fee: '1/10–2/20',
    description: 'Allocates dynamically across multiple strategies to diversify risk and smooth returns through market cycles.',
    risks: 'Internal allocation, manager aggregation',
  },
  {
    name: 'Quant / Systematic',
    aum_pct: 8,
    typical_net_exposure: 'Variable',
    target_sharpe: '0.8–1.8',
    typical_fee: '2/20',
    description: 'Uses quantitative models and algorithms: trend following (CTA), statistical arbitrage, factor-based strategies.',
    risks: 'Model overfitting, factor crowding, regime change',
  },
];

// ── Math helpers ──────────────────────────────────────────────────────────────

function calcIRR(cashflows: number[], maxIter = 1000): number {
  // Newton-Raphson IRR from cashflows array (index 0 = initial investment, negative)
  let r = 0.1;
  for (let i = 0; i < maxIter; i++) {
    let npv = 0, dnpv = 0;
    for (let t = 0; t < cashflows.length; t++) {
      npv  += cashflows[t] / Math.pow(1 + r, t);
      dnpv -= t * cashflows[t] / Math.pow(1 + r, t + 1);
    }
    if (Math.abs(dnpv) < 1e-12) break;
    const rNew = r - npv / dnpv;
    if (Math.abs(rNew - r) < 1e-8) { r = rNew; break; }
    r = rNew;
  }
  return r * 100;
}

// ── Liquidity scoring ─────────────────────────────────────────────────────────

const LIQUIDITY_SCORES: Record<string, { label: string; color: string; days: string }> = {
  reit:             { label: 'Daily',        color: 'text-green-600',  days: 'T+2 settlement' },
  commodity:        { label: 'Daily',        color: 'text-green-600',  days: 'T+2 settlement' },
  private_equity:   { label: 'Illiquid',     color: 'text-red-500',    days: '5–10 years lockup' },
  hedge_fund:       { label: 'Quarterly',    color: 'text-yellow-600', days: '90-day redemption notice' },
  infrastructure:   { label: 'Semi-liquid',  color: 'text-orange-500', days: '6–18 months' },
  natural_resources:{ label: 'Daily–Annual', color: 'text-yellow-600', days: 'Depends on vehicle' },
  structured:       { label: 'Variable',     color: 'text-orange-500', days: 'Depends on instrument' },
  art_collectibles: { label: 'Illiquid',     color: 'text-red-500',    days: '3–18+ months at auction' },
  other:            { label: 'Variable',     color: 'text-muted-foreground', days: 'Varies by instrument' },
};

// ── Types & constants ─────────────────────────────────────────────────────────

type Tab = 'reits' | 'commodities' | 'pe-hf' | 'allocation' | 'positions';

const CATEGORY_COLORS: Record<string, string> = {
  reit:             'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  commodity:        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  private_equity:   'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  hedge_fund:       'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  infrastructure:   'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  natural_resources:'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  structured:       'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
  art_collectibles: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  other:            'bg-muted text-muted-foreground',
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AlternativesPage() {
  const [tab, setTab]           = useState<Tab>('reits');
  const [categories, setCategories] = useState<AlternativeCategory[]>([]);
  const [reits, setReits]       = useState<REIT[]>([]);
  const [commEtfs, setCommEtfs] = useState<CommodityETF[]>([]);
  const [altEtfs, setAltEtfs]   = useState<AlternativeETF[]>([]);
  const [positions, setPositions] = useState<AlternativePosition[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  // Commodity price lookup
  const [commodities, setCommodities] = useState<{ symbol: string; name: string; unit: string }[]>([]);
  const [commPrice, setCommPrice]     = useState<CommodityPrice | null>(null);
  const [commLoading, setCommLoading] = useState(false);
  const [selectedFuturesCommodity, setSelectedFuturesCommodity] = useState<string>('CRUDE_OIL');

  // Allocation optimizer
  const [allocInput, setAllocInput]   = useState({ target_alt_pct: 15, portfolio_value: 100000 });
  const [allocation, setAllocation]   = useState<AlternativeAllocation | null>(null);
  const [allocLoading, setAllocLoading] = useState(false);

  // Add position
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPos, setNewPos]           = useState({ name: '', category: 'reit', ticker: '', value_usd: '', notes: '' });
  const [addingPos, setAddingPos]     = useState(false);

  // PE/VC IRR calculator
  const [irr_investment, setIrrInvestment] = useState(-100000);
  const [irr_year1, setIrrYear1]           = useState(0);
  const [irr_year2, setIrrYear2]           = useState(0);
  const [irr_year3, setIrrYear3]           = useState(0);
  const [irr_year4, setIrrYear4]           = useState(0);
  const [irr_year5, setIrrYear5]           = useState(250000);
  const [irrResult, setIrrResult]          = useState<number | null>(null);
  const [moic, setMoic]                    = useState<number | null>(null);

  // REIT sector filter
  const [reitSector, setReitSector]   = useState<string>('All');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [catData, reitData, commEtfData, altEtfData, posData, commData] = await Promise.all([
        listAlternativeCategories(), listREITs(), listCommodityETFs(),
        listAlternativeETFs(), listAlternativePositions(), listCommodities(),
      ]);
      setCategories(catData.categories);
      setReits(reitData.reits);
      setCommEtfs(commEtfData.etfs);
      setAltEtfs(altEtfData.etfs);
      setPositions(posData.positions);
      setCommodities(commData.commodities);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load alternatives data');
    } finally { setLoading(false); }
  }

  async function handleGetCommPrice(symbol: string) {
    setCommLoading(true); setCommPrice(null);
    try {
      const data = await getCommodityPrice(symbol);
      setCommPrice(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to fetch commodity price');
    } finally { setCommLoading(false); }
  }

  async function handleGetAllocation() {
    setAllocLoading(true);
    try {
      const result = await getAlternativeAllocation(allocInput);
      setAllocation(result);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Allocation calculation failed');
    } finally { setAllocLoading(false); }
  }

  async function handleAddPosition() {
    setAddingPos(true);
    try {
      await addAlternativePosition({
        name: newPos.name, category: newPos.category,
        ticker: newPos.ticker || undefined,
        value_usd: newPos.value_usd ? parseFloat(newPos.value_usd) : undefined,
        notes: newPos.notes || undefined,
      });
      const { positions: updated } = await listAlternativePositions();
      setPositions(updated);
      setShowAddForm(false);
      setNewPos({ name: '', category: 'reit', ticker: '', value_usd: '', notes: '' });
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to add position');
    } finally { setAddingPos(false); }
  }

  async function handleRemovePosition(id: string) {
    try {
      await removeAlternativePosition(id);
      setPositions(prev => prev.filter(p => p.id !== id));
    } catch { setError('Failed to remove position'); }
  }

  function handleCalcIRR() {
    const cfs = [irr_investment, irr_year1, irr_year2, irr_year3, irr_year4, irr_year5];
    const totalIn  = Math.abs(irr_investment);
    const totalOut = irr_year1 + irr_year2 + irr_year3 + irr_year4 + irr_year5;
    setMoic(totalIn > 0 ? totalOut / totalIn : null);
    try {
      const result = calcIRR(cfs);
      setIrrResult(isFinite(result) ? result : null);
    } catch { setIrrResult(null); }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'reits',      label: 'REITs' },
    { key: 'commodities',label: 'Commodities' },
    { key: 'pe-hf',      label: 'PE / HF / Infra' },
    { key: 'allocation', label: 'Allocation Optimizer' },
    { key: 'positions',  label: 'My Positions' },
  ];

  const allSectors = ['All', ...Array.from(new Set(reits.map(r => r.sector)))];
  const filteredReits = reitSector === 'All' ? reits : reits.filter(r => r.sector === reitSector);
  const futuresData = FUTURES_TERM_STRUCTURES[selectedFuturesCommodity];

  // Extended categories list for position form (includes art_collectibles)
  const extendedCategories = [
    ...categories,
    { key: 'art_collectibles', name: 'Art & Collectibles', description: 'Artwork, wine, watches, collectibles' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Alternative Investments
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          REITs, commodities, private equity, hedge funds, infrastructure, art & collectibles, and more.
        </p>
      </div>

      <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-3 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
        <Shield className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <span>
          <strong>Higher risk, lower liquidity.</strong> Alternative investments may involve significant risk, limited liquidity, lock-up periods, and different tax treatment. PE/VC and hedge funds are typically restricted to accredited investors. SSB is informational only — not investment advice.
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
              tab === t.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── REITs ─────────────────────────────────────────────────────────────── */}
      {tab === 'reits' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            REITs must distribute 90%+ of taxable income as dividends. They provide real estate exposure without direct property ownership.
          </p>

          {/* Key metrics explainer */}
          <div className="rounded-xl border bg-card p-4 space-y-2">
            <h2 className="font-semibold text-sm">Key REIT Metrics</h2>
            <div className="grid gap-2 sm:grid-cols-2 text-xs text-muted-foreground">
              <p><strong>P/FFO:</strong> Price-to-Funds From Operations — the REIT equivalent of P/E. Lower = cheaper relative to earnings power.</p>
              <p><strong>Dividend Yield:</strong> Annual dividend / current price. REITs typically yield 2–6%; higher yield may signal risk.</p>
              <p><strong>NAV Premium/Discount:</strong> Difference between share price and estimated Net Asset Value per share.</p>
              <p><strong>Debt/Equity:</strong> Leverage ratio. REITs use significant debt; &gt;1.5x warrants scrutiny.</p>
            </div>
          </div>

          {/* Sector filter */}
          <div className="flex flex-wrap gap-1">
            {allSectors.map(s => (
              <button
                key={s}
                onClick={() => setReitSector(s)}
                className={cn(
                  'px-2.5 py-1 text-xs rounded-full border transition-colors',
                  reitSector === s ? 'bg-primary text-primary-foreground border-primary' : 'text-muted-foreground hover:bg-muted',
                )}
              >
                {s}
              </button>
            ))}
          </div>

          {(['Diversified', 'Infrastructure', 'Data Centers', 'Industrial', 'Retail', 'Residential', 'Healthcare', 'Self-Storage', 'Gaming/Hospitality'] as string[])
            .filter(sector => reitSector === 'All' || sector === reitSector)
            .map(sector => {
              const items = filteredReits.filter(r => r.sector === sector);
              if (!items.length) return null;
              return (
                <div key={sector}>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{sector}</h3>
                  <div className="rounded-lg border overflow-hidden">
                    <div className="grid grid-cols-6 gap-2 px-3 py-2 bg-muted/30 text-[10px] font-semibold text-muted-foreground uppercase">
                      <span className="col-span-2">Name</span>
                      <span className="text-right">Div. Yield</span>
                      <span className="text-right">P/FFO</span>
                      <span className="text-right">NAV ±%</span>
                      <span className="text-right">D/E</span>
                    </div>
                    {items.map(r => {
                      const m = REIT_METRICS[r.ticker];
                      return (
                        <div key={r.ticker} className="grid grid-cols-6 gap-2 px-3 py-2 text-xs border-t hover:bg-muted/20 items-center">
                          <div className="col-span-2 flex items-center gap-2">
                            <span className="font-semibold w-14">{r.ticker}</span>
                            <span className="text-muted-foreground truncate hidden sm:inline">{r.name}</span>
                          </div>
                          <span className={cn('text-right tabular-nums font-medium', m ? 'text-green-600' : 'text-muted-foreground')}>
                            {m ? `${m.dividendYield.toFixed(1)}%` : '—'}
                          </span>
                          <span className="text-right tabular-nums">{m ? `${m.pFFO.toFixed(1)}x` : '—'}</span>
                          <span className={cn('text-right tabular-nums', m ? (m.navPremiumPct > 10 ? 'text-red-500' : m.navPremiumPct < -5 ? 'text-green-600' : '') : '')}>
                            {m ? `${m.navPremiumPct > 0 ? '+' : ''}${m.navPremiumPct.toFixed(1)}%` : '—'}
                          </span>
                          <span className={cn('text-right tabular-nums', m && m.debtToEquity > 1.2 ? 'text-amber-600' : '')}>
                            {m ? `${m.debtToEquity.toFixed(2)}x` : '—'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

          <p className="text-[10px] text-muted-foreground">Figures are for illustrative purposes. Actual REIT financials vary. Not a recommendation.</p>
        </div>
      )}

      {/* ── Commodities ───────────────────────────────────────────────────────── */}
      {tab === 'commodities' && (
        <div className="space-y-4">
          {/* Spot price lookup */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <h2 className="font-semibold text-sm">Physical Commodity Prices</h2>
            <div className="flex flex-wrap gap-2">
              {commodities.map(c => (
                <button
                  key={c.symbol}
                  onClick={() => handleGetCommPrice(c.symbol)}
                  className="rounded-full border px-3 py-1 text-xs font-medium hover:bg-muted transition-colors"
                >
                  {c.name}
                </button>
              ))}
            </div>
            {commLoading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Fetching price…
              </div>
            )}
            {commPrice && (
              <div className="rounded-lg bg-muted/20 border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-bold">{commPrice.name}</p>
                  <p className="text-xs text-muted-foreground">{commPrice.unit}</p>
                </div>
                <div className="flex items-baseline gap-3">
                  <p className="text-2xl font-bold tabular-nums">{commPrice.current_price?.toFixed(4) ?? '—'}</p>
                  {commPrice.mom_change_pct !== null && (
                    <p className={cn('text-sm font-medium', (commPrice.mom_change_pct || 0) >= 0 ? 'text-green-600' : 'text-red-500')}>
                      {(commPrice.mom_change_pct || 0) >= 0 ? '+' : ''}{commPrice.mom_change_pct?.toFixed(2)}% MoM
                    </p>
                  )}
                </div>
                {commPrice._simulated && <p className="text-[10px] text-muted-foreground">Simulated — configure ALPHA_VANTAGE_API_KEY for live prices</p>}
              </div>
            )}
          </div>

          {/* Futures term structure */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <h2 className="font-semibold text-sm">Futures Term Structure</h2>
            <p className="text-xs text-muted-foreground">
              The shape of the futures curve determines roll yield for passive commodity investors.
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(FUTURES_TERM_STRUCTURES).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setSelectedFuturesCommodity(key)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    selectedFuturesCommodity === key ? 'bg-primary text-primary-foreground border-primary' : 'text-muted-foreground hover:bg-muted',
                  )}
                >
                  {val.name}
                </button>
              ))}
            </div>

            {futuresData && (
              <>
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full capitalize',
                    futuresData.structure === 'contango'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  )}>
                    {futuresData.structure}
                  </span>
                  <span className="text-xs text-muted-foreground">{futuresData.name}</span>
                </div>

                {/* Visual curve */}
                <div className="rounded-lg border p-3">
                  <div className="flex items-end gap-2 h-24">
                    {futuresData.points.map((pt, i) => {
                      const prices = futuresData.points.map(p => p.price);
                      const min = Math.min(...prices);
                      const max = Math.max(...prices);
                      const range = max - min || 1;
                      const heightPct = 20 + ((pt.price - min) / range) * 70;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-[9px] text-muted-foreground tabular-nums">{pt.price.toFixed(pt.price > 100 ? 0 : 2)}</span>
                          <div
                            className={cn('w-full rounded-t transition-all', futuresData.structure === 'contango' ? 'bg-red-400/70' : 'bg-green-500/70')}
                            style={{ height: `${heightPct}%` }}
                          />
                          <span className="text-[9px] text-muted-foreground">{pt.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-lg bg-muted/20 p-2.5 text-xs text-muted-foreground">
                  {futuresData.explanation}
                </div>
              </>
            )}

            {/* Contango / backwardation explainer */}
            <div className="grid gap-2 sm:grid-cols-2 text-xs">
              <div className="rounded-lg border border-red-200 dark:border-red-800 p-2.5">
                <p className="font-semibold text-red-600 mb-1">Contango</p>
                <p className="text-muted-foreground">Futures &gt; spot. Storage costs are embedded. Long futures positions lose to negative roll yield as near-month contracts expire above spot.</p>
              </div>
              <div className="rounded-lg border border-green-200 dark:border-green-800 p-2.5">
                <p className="font-semibold text-green-600 mb-1">Backwardation</p>
                <p className="text-muted-foreground">Futures &lt; spot. Implies tight current supply or convenience yield. Long futures positions benefit from positive roll yield.</p>
              </div>
            </div>
          </div>

          {/* Commodity ETFs */}
          <h2 className="font-semibold text-sm">Commodity ETFs</h2>
          {['precious_metals', 'energy', 'agriculture', 'industrial_metals', 'broad'].map(cat => {
            const items = commEtfs.filter(e => e.category === cat);
            if (!items.length) return null;
            return (
              <div key={cat}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{cat.replace('_', ' ')}</h3>
                <div className="rounded-lg border overflow-hidden">
                  {items.map(e => (
                    <div key={e.ticker} className="flex items-center justify-between px-3 py-2 text-xs border-b last:border-0 hover:bg-muted/20">
                      <span className="font-semibold w-14">{e.ticker}</span>
                      <span className="flex-1 text-muted-foreground">{e.name}</span>
                      <span className="text-muted-foreground">{e.commodity}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── PE / HF / Infra ───────────────────────────────────────────────────── */}
      {tab === 'pe-hf' && (
        <div className="space-y-4">
          {/* PE/VC IRR Calculator */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <h2 className="font-semibold text-sm">Private Equity / VC Returns Calculator</h2>
            <p className="text-xs text-muted-foreground">
              Track IRR (Internal Rate of Return) and MOIC (Multiple on Invested Capital) for illiquid private holdings. Enter actual or projected cashflows.
            </p>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {[
                { label: 'Initial Investment ($)', value: irr_investment, set: setIrrInvestment, note: 'Enter as negative' },
                { label: 'Year 1 Cashflow ($)',     value: irr_year1,      set: setIrrYear1,      note: '0 if reinvested' },
                { label: 'Year 2 Cashflow ($)',     value: irr_year2,      set: setIrrYear2,      note: '' },
                { label: 'Year 3 Cashflow ($)',     value: irr_year3,      set: setIrrYear3,      note: '' },
                { label: 'Year 4 Cashflow ($)',     value: irr_year4,      set: setIrrYear4,      note: '' },
                { label: 'Year 5 Exit Value ($)',   value: irr_year5,      set: setIrrYear5,      note: 'Sale + dividends' },
              ].map(({ label, value, set, note }) => (
                <div key={label} className="space-y-1">
                  <label className="text-xs font-medium">{label}</label>
                  {note && <p className="text-[10px] text-muted-foreground">{note}</p>}
                  <input type="number" step="1000" value={value}
                    onChange={e => set(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
                </div>
              ))}
            </div>
            <Button size="sm" onClick={handleCalcIRR}>Calculate</Button>

            {irrResult !== null && moic !== null && (
              <div className="grid gap-3 sm:grid-cols-3">
                <div className={cn('rounded-lg p-3 text-xs', irrResult >= 20 ? 'bg-green-50 dark:bg-green-900/20' : irrResult >= 10 ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-red-50 dark:bg-red-900/20')}>
                  <p className="text-muted-foreground">IRR (5-year)</p>
                  <p className={cn('text-2xl font-bold tabular-nums', irrResult >= 20 ? 'text-green-700 dark:text-green-400' : irrResult >= 10 ? 'text-yellow-700 dark:text-yellow-400' : 'text-red-700 dark:text-red-400')}>
                    {irrResult.toFixed(1)}%
                  </p>
                  <p className="text-muted-foreground mt-1">
                    {irrResult >= 25 ? 'Excellent (top quartile VC/PE)' : irrResult >= 15 ? 'Good (median PE)' : irrResult >= 8 ? 'Below PE hurdle rate' : 'Negative real return'}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/30 p-3 text-xs">
                  <p className="text-muted-foreground">MOIC</p>
                  <p className="text-2xl font-bold tabular-nums">{moic.toFixed(2)}x</p>
                  <p className="text-muted-foreground mt-1">
                    {moic >= 3 ? 'Top quartile' : moic >= 2 ? 'Solid return' : moic >= 1 ? 'Capital preserved' : 'Loss of capital'}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/30 p-3 text-xs">
                  <p className="text-muted-foreground">Net Profit</p>
                  <p className="text-2xl font-bold tabular-nums">
                    ${(irr_year1 + irr_year2 + irr_year3 + irr_year4 + irr_year5 + irr_investment).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-muted-foreground mt-1">Total cash in vs out</p>
                </div>
              </div>
            )}
          </div>

          {/* Hedge Fund Strategies */}
          <div className="space-y-3">
            <div>
              <h2 className="font-semibold text-sm">Hedge Fund Strategy Breakdown</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Major strategies by estimated industry AUM share. ETF proxies available for indirect exposure.
              </p>
            </div>
            {HF_STRATEGIES.map(s => (
              <div key={s.name} className="rounded-lg border bg-card p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm">{s.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">~{s.aum_pct}% of HF AUM</span>
                    <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{s.typical_fee}</span>
                  </div>
                </div>
                {/* AUM bar */}
                <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                  <div className="h-1.5 rounded-full bg-primary/60" style={{ width: `${s.aum_pct * 3}%` }} />
                </div>
                <p className="text-xs text-muted-foreground">{s.description}</p>
                <div className="flex flex-wrap gap-3 text-xs">
                  <span className="text-muted-foreground">Net exposure: <strong>{s.typical_net_exposure}</strong></span>
                  <span className="text-muted-foreground">Target Sharpe: <strong>{s.target_sharpe}</strong></span>
                  <span className="text-red-500 text-[10px]">Risks: {s.risks}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Infrastructure / Alt ETFs */}
          <div>
            <h2 className="font-semibold text-sm mb-2">ETF Exposure to Private-Market Strategies</h2>
            <p className="text-xs text-muted-foreground mb-3">
              Publicly-traded ETFs provide exposure to PE, hedge fund strategies, and infrastructure without direct investment minimums or lock-ups.
            </p>
            {['private_equity', 'hedge_fund', 'infrastructure', 'natural_resources', 'structured'].map(cat => {
              const items = altEtfs.filter(e => e.category === cat);
              if (!items.length) return null;
              return (
                <div key={cat} className="mb-3">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{cat.replace('_', ' ')}</h3>
                  <div className="rounded-lg border overflow-hidden">
                    {items.map(e => (
                      <div key={e.ticker} className="flex items-center justify-between px-3 py-2 text-xs border-b last:border-0 hover:bg-muted/20">
                        <span className="font-semibold w-14">{e.ticker}</span>
                        <span className="flex-1 text-muted-foreground">{e.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Allocation Optimizer ──────────────────────────────────────────────── */}
      {tab === 'allocation' && (
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <h2 className="font-semibold text-sm">Alternative Asset Allocation</h2>
            <p className="text-xs text-muted-foreground">
              Based on Endowment / Institutional allocation frameworks (Yale/Harvard model).
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium">Target Alt Allocation (%)</label>
                <input type="number" min="1" max="60" step="1"
                  value={allocInput.target_alt_pct}
                  onChange={e => setAllocInput(p => ({ ...p, target_alt_pct: parseFloat(e.target.value) || 0 }))}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Portfolio Value ($)</label>
                <input type="number" step="10000"
                  value={allocInput.portfolio_value}
                  onChange={e => setAllocInput(p => ({ ...p, portfolio_value: parseFloat(e.target.value) || 0 }))}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
              </div>
            </div>
            <Button size="sm" onClick={handleGetAllocation} disabled={allocLoading}>
              {allocLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Calculate Allocation
            </Button>
          </div>

          {allocation && (
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sm">Suggested Allocation</h2>
                <span className="text-xs text-muted-foreground">
                  {allocation.target_alt_allocation_pct}% = ${allocation.alt_dollar_value.toLocaleString()}
                </span>
              </div>
              <div className="space-y-2">
                {allocation.allocations.map(a => (
                  <div key={a.category} className="flex items-center gap-3">
                    <span className="w-32 text-xs font-medium capitalize">{a.category.replace('_', ' ')}</span>
                    <div className="flex-1 bg-muted/30 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-primary/70"
                        style={{ width: `${(a.weight_pct / Math.max(...allocation.allocations.map(x => x.weight_pct))) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs tabular-nums w-10 text-right">{a.weight_pct}%</span>
                    <span className="text-xs tabular-nums w-20 text-right text-muted-foreground">${a.dollar_value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground">{allocation.disclaimer}</p>
            </div>
          )}
        </div>
      )}

      {/* ── My Positions ─────────────────────────────────────────────────────── */}
      {tab === 'positions' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Track all alternative positions including private equity, collectibles, and illiquid assets.
            </p>
            <Button size="sm" onClick={() => setShowAddForm(v => !v)}>
              <Plus className="h-4 w-4 mr-1" /> Add Position
            </Button>
          </div>

          {showAddForm && (
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <h2 className="font-semibold text-sm">Add Position</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Name *</label>
                  <input value={newPos.name} onChange={e => setNewPos(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Banksy print, Rolex Submariner, Fund II LP"
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Category</label>
                  <select value={newPos.category} onChange={e => setNewPos(p => ({ ...p, category: e.target.value }))}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                    {extendedCategories.map(c => <option key={c.key} value={c.key}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Ticker / ID (optional)</label>
                  <input value={newPos.ticker} onChange={e => setNewPos(p => ({ ...p, ticker: e.target.value.toUpperCase() }))}
                    placeholder="VNQ or fund code" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Current Value ($)</label>
                  <input type="number" value={newPos.value_usd} onChange={e => setNewPos(p => ({ ...p, value_usd: e.target.value }))}
                    placeholder="25000" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-medium">Notes</label>
                  <input value={newPos.notes} onChange={e => setNewPos(p => ({ ...p, notes: e.target.value }))}
                    placeholder="Vintage year, appraisal date, lock-up terms, etc."
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddPosition} disabled={addingPos || !newPos.name}>
                  {addingPos ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {positions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-40" />
              No alternative positions tracked yet.
            </div>
          ) : (
            <>
              {/* Category summary */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Object.entries(
                  positions.reduce((acc, p) => {
                    const cat = p.category;
                    if (!acc[cat]) acc[cat] = 0;
                    acc[cat] += p.value_usd || 0;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([cat, val]) => (
                  <div key={cat} className="rounded-lg border bg-card p-2.5">
                    <p className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium inline-block mb-1', CATEGORY_COLORS[cat] || CATEGORY_COLORS.other)}>
                      {cat.replace('_', ' ')}
                    </p>
                    <p className="text-sm font-bold">${val.toLocaleString()}</p>
                  </div>
                ))}
              </div>

              {/* Position list with liquidity */}
              <div className="rounded-lg border overflow-hidden">
                {positions.map(p => {
                  const liq = LIQUIDITY_SCORES[p.category] || LIQUIDITY_SCORES.other;
                  return (
                    <div key={p.id} className="flex items-center justify-between px-3 py-3 text-sm border-b last:border-0 hover:bg-muted/20">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold truncate">{p.name}</p>
                          {p.ticker && <span className="text-xs font-mono text-muted-foreground shrink-0">{p.ticker}</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={cn('px-1.5 py-0.5 rounded-full text-[10px] font-medium', CATEGORY_COLORS[p.category] || CATEGORY_COLORS.other)}>
                            {p.category.replace('_', ' ')}
                          </span>
                          {p.value_usd && <span className="text-xs text-muted-foreground">${p.value_usd.toLocaleString()}</span>}
                          <span className={cn('text-[10px]', liq.color)}>● {liq.label}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{liq.days}</p>
                      </div>
                      <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive shrink-0" onClick={() => handleRemovePosition(p.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  );
                })}
              </div>

              {/* Liquidity profile summary */}
              <div className="rounded-xl border bg-card p-3 text-xs">
                <p className="font-semibold mb-2">Portfolio Liquidity Profile</p>
                <div className="space-y-1">
                  {(['Daily', 'Quarterly', 'Semi-liquid', 'Illiquid', 'Variable'] as string[]).map(label => {
                    const totalVal = positions
                      .filter(p => (LIQUIDITY_SCORES[p.category] || LIQUIDITY_SCORES.other).label === label)
                      .reduce((s, p) => s + (p.value_usd || 0), 0);
                    const totalPortfolio = positions.reduce((s, p) => s + (p.value_usd || 0), 0);
                    if (totalVal === 0) return null;
                    const pct = totalPortfolio > 0 ? (totalVal / totalPortfolio) * 100 : 0;
                    return (
                      <div key={label} className="flex items-center gap-2">
                        <span className="w-20 text-muted-foreground">{label}</span>
                        <div className="flex-1 bg-muted/30 rounded-full h-2 overflow-hidden">
                          <div className="h-2 rounded-full bg-primary/60" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-12 text-right tabular-nums">{pct.toFixed(1)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

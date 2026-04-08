'use client';

import { useEffect, useState } from 'react';
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

type Tab = 'reits' | 'commodities' | 'pe-hf' | 'allocation' | 'positions';

const CATEGORY_COLORS: Record<string, string> = {
  reit:             'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  commodity:        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  private_equity:   'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  hedge_fund:       'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  infrastructure:   'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  natural_resources:'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  structured:       'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
  other:            'bg-muted text-muted-foreground',
};

export default function AlternativesPage() {
  const [tab, setTab] = useState<Tab>('reits');
  const [categories, setCategories] = useState<AlternativeCategory[]>([]);
  const [reits, setReits]           = useState<REIT[]>([]);
  const [commEtfs, setCommEtfs]     = useState<CommodityETF[]>([]);
  const [altEtfs, setAltEtfs]       = useState<AlternativeETF[]>([]);
  const [positions, setPositions]   = useState<AlternativePosition[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  // Commodity price lookup
  const [commodities, setCommodities] = useState<{ symbol: string; name: string; unit: string }[]>([]);
  const [commPrice, setCommPrice]     = useState<CommodityPrice | null>(null);
  const [commLoading, setCommLoading] = useState(false);

  // Allocation optimizer
  const [allocInput, setAllocInput] = useState({ target_alt_pct: 15, portfolio_value: 100000 });
  const [allocation, setAllocation] = useState<AlternativeAllocation | null>(null);
  const [allocLoading, setAllocLoading] = useState(false);

  // Add position
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPos, setNewPos]           = useState({ name: '', category: 'reit', ticker: '', value_usd: '', notes: '' });
  const [addingPos, setAddingPos]     = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [catData, reitData, commEtfData, altEtfData, posData, commData] = await Promise.all([
        listAlternativeCategories(),
        listREITs(),
        listCommodityETFs(),
        listAlternativeETFs(),
        listAlternativePositions(),
        listCommodities(),
      ]);
      setCategories(catData.categories);
      setReits(reitData.reits);
      setCommEtfs(commEtfData.etfs);
      setAltEtfs(altEtfData.etfs);
      setPositions(posData.positions);
      setCommodities(commData.commodities);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load alternatives data');
    } finally {
      setLoading(false);
    }
  }

  async function handleGetCommPrice(symbol: string) {
    setCommLoading(true);
    setCommPrice(null);
    try {
      const data = await getCommodityPrice(symbol);
      setCommPrice(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to fetch commodity price');
    } finally {
      setCommLoading(false);
    }
  }

  async function handleGetAllocation() {
    setAllocLoading(true);
    try {
      const result = await getAlternativeAllocation(allocInput);
      setAllocation(result);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Allocation calculation failed');
    } finally {
      setAllocLoading(false);
    }
  }

  async function handleAddPosition() {
    setAddingPos(true);
    try {
      await addAlternativePosition({
        name: newPos.name,
        category: newPos.category,
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
    } finally {
      setAddingPos(false);
    }
  }

  async function handleRemovePosition(id: string) {
    try {
      await removeAlternativePosition(id);
      setPositions(prev => prev.filter(p => p.id !== id));
    } catch {
      setError('Failed to remove position');
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
    { key: 'reits',      label: 'REITs' },
    { key: 'commodities',label: 'Commodities' },
    { key: 'pe-hf',      label: 'PE / HF / Infra' },
    { key: 'allocation', label: 'Allocation Optimizer' },
    { key: 'positions',  label: 'My Positions' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Alternative Investments
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          REITs, commodities, private equity, hedge funds, infrastructure, and more.
        </p>
      </div>

      <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-3 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
        <Shield className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <span>
          <strong>Higher risk, lower liquidity.</strong> Alternative investments may involve significant risk, limited liquidity, and different tax treatment. Consult a financial advisor. SSB is informational only.
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

      {/* ── REITs ─────────────────────────────────────────────────────────────── */}
      {tab === 'reits' && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            REITs must distribute 90%+ of taxable income as dividends. They provide real estate exposure without direct property ownership.
          </p>
          {['Diversified', 'Infrastructure', 'Data Centers', 'Industrial', 'Retail', 'Residential', 'Healthcare', 'Self-Storage', 'Gaming/Hospitality'].map(sector => {
            const items = reits.filter(r => r.sector === sector);
            if (!items.length) return null;
            return (
              <div key={sector}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{sector}</h3>
                <div className="rounded-lg border overflow-hidden">
                  {items.map(r => (
                    <div key={r.ticker} className="flex items-center justify-between px-3 py-2 text-sm border-b last:border-0 hover:bg-muted/20">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold w-14">{r.ticker}</span>
                        <span className="text-muted-foreground text-xs">{r.name}</span>
                      </div>
                      <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium', r.type === 'etf' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-muted text-muted-foreground')}>
                        {r.type.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Commodities ───────────────────────────────────────────────────────── */}
      {tab === 'commodities' && (
        <div className="space-y-4">
          {/* Price lookup */}
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
                {commPrice._simulated && (
                  <p className="text-[10px] text-muted-foreground">Simulated — configure ALPHA_VANTAGE_API_KEY for live prices</p>
                )}
              </div>
            )}
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
          <p className="text-sm text-muted-foreground">
            Publicly-traded ETFs provide exposure to private equity, hedge fund strategies, and infrastructure without direct investment minimums.
          </p>
          {['private_equity', 'hedge_fund', 'infrastructure', 'natural_resources', 'structured'].map(cat => {
            const items = altEtfs.filter(e => e.category === cat);
            if (!items.length) return null;
            const label = cat.replace('_', ' ');
            return (
              <div key={cat}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{label}</h3>
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
                  {allocation.target_alt_allocation_pct}% of portfolio = ${allocation.alt_dollar_value.toLocaleString()}
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
              Track all your alternative investment positions in one place.
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
                    placeholder="e.g. Vanguard Real Estate ETF" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Category</label>
                  <select value={newPos.category} onChange={e => setNewPos(p => ({ ...p, category: e.target.value }))}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                    {categories.map(c => <option key={c.key} value={c.key}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Ticker (optional)</label>
                  <input value={newPos.ticker} onChange={e => setNewPos(p => ({ ...p, ticker: e.target.value.toUpperCase() }))}
                    placeholder="VNQ" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Current Value ($)</label>
                  <input type="number" value={newPos.value_usd} onChange={e => setNewPos(p => ({ ...p, value_usd: e.target.value }))}
                    placeholder="25000" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-medium">Notes</label>
                  <input value={newPos.notes} onChange={e => setNewPos(p => ({ ...p, notes: e.target.value }))}
                    placeholder="Optional notes" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
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

              <div className="rounded-lg border overflow-hidden">
                {positions.map(p => (
                  <div key={p.id} className="flex items-center justify-between px-3 py-3 text-sm border-b last:border-0 hover:bg-muted/20">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{p.name}</p>
                        {p.ticker && <span className="text-xs font-mono text-muted-foreground">{p.ticker}</span>}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <span className={cn('px-1.5 py-0.5 rounded-full text-[10px] font-medium', CATEGORY_COLORS[p.category] || CATEGORY_COLORS.other)}>
                          {p.category.replace('_', ' ')}
                        </span>
                        {p.value_usd && <span className="ml-2">${p.value_usd.toLocaleString()}</span>}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={() => handleRemovePosition(p.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

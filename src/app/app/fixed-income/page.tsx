'use client';

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  BarChart3,
  Calculator,
  Loader2,
  Plus,
  Shield,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  getYieldCurve,
  getCreditSpreads,
  getBondETFs,
  analyzeBond,
  buildBondLadder,
  listBondPositions,
  addBondPosition,
  removeBondPosition,
  type YieldCurve,
  type CreditSpreads,
  type BondETF,
  type BondMetrics,
  type BondLadder,
  type BondPosition,
} from '@/lib/api/fixed-income';

type Tab = 'yield-curve' | 'calculator' | 'ladder' | 'etfs' | 'positions';

const CURVE_SHAPE_COLOR: Record<string, string> = {
  steep:    'text-green-600',
  normal:   'text-blue-600',
  flat:     'text-yellow-600',
  inverted: 'text-red-600',
};

export default function FixedIncomePage() {
  const [tab, setTab] = useState<Tab>('yield-curve');
  const [yieldCurve, setYieldCurve]   = useState<YieldCurve | null>(null);
  const [spreads, setSpreads]         = useState<CreditSpreads | null>(null);
  const [etfs, setEtfs]               = useState<BondETF[]>([]);
  const [positions, setPositions]     = useState<BondPosition[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);

  // Bond calculator state
  const [calcInput, setCalcInput] = useState({
    face_value: 1000, coupon_rate: 0.05, years_to_maturity: 10,
    current_price: 950, frequency: 2,
  });
  const [bondMetrics, setBondMetrics] = useState<BondMetrics | null>(null);
  const [calcLoading, setCalcLoading] = useState(false);

  // Ladder builder state
  const [ladderInput, setLadderInput] = useState({
    total_investment: 100000, rungs: 5,
    first_maturity_years: 1, final_maturity_years: 10, avg_yield_pct: 4.5,
  });
  const [ladder, setLadder]         = useState<BondLadder | null>(null);
  const [ladderLoading, setLadderLoading] = useState(false);

  // Add position state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPos, setNewPos] = useState({ name: '', bond_type: 'treasury', coupon_rate: '', face_value: '', maturity_date: '', currency: 'USD' });
  const [addingPos, setAddingPos]     = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [yc, sp, etfData, pos] = await Promise.all([
        getYieldCurve(),
        getCreditSpreads(),
        getBondETFs(),
        listBondPositions(),
      ]);
      setYieldCurve(yc);
      setSpreads(sp);
      setEtfs(etfData.etfs);
      setPositions(pos.positions);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load fixed income data');
    } finally {
      setLoading(false);
    }
  }

  async function handleAnalyze() {
    setCalcLoading(true);
    setBondMetrics(null);
    try {
      const result = await analyzeBond(calcInput);
      setBondMetrics(result);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Bond analysis failed');
    } finally {
      setCalcLoading(false);
    }
  }

  async function handleBuildLadder() {
    setLadderLoading(true);
    setLadder(null);
    try {
      const result = await buildBondLadder(ladderInput);
      setLadder(result);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to build ladder');
    } finally {
      setLadderLoading(false);
    }
  }

  async function handleAddPosition() {
    setAddingPos(true);
    try {
      await addBondPosition({
        name: newPos.name,
        bond_type: newPos.bond_type,
        coupon_rate: newPos.coupon_rate ? parseFloat(newPos.coupon_rate) : undefined,
        face_value: newPos.face_value ? parseFloat(newPos.face_value) : undefined,
        maturity_date: newPos.maturity_date || undefined,
        currency: newPos.currency,
      });
      const { positions: updated } = await listBondPositions();
      setPositions(updated);
      setShowAddForm(false);
      setNewPos({ name: '', bond_type: 'treasury', coupon_rate: '', face_value: '', maturity_date: '', currency: 'USD' });
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to add position');
    } finally {
      setAddingPos(false);
    }
  }

  async function handleRemovePosition(id: string) {
    try {
      await removeBondPosition(id);
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
    { key: 'yield-curve',  label: 'Yield Curve' },
    { key: 'calculator',   label: 'Bond Calculator' },
    { key: 'ladder',       label: 'Bond Ladder' },
    { key: 'etfs',         label: 'Bond ETFs' },
    { key: 'positions',    label: 'My Positions' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Fixed Income Analytics
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Yield curve analysis, bond calculators, credit spreads, and fixed income tools.
        </p>
      </div>

      <div className="rounded-lg border border-blue-300 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800 p-3 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
        <Shield className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <span>
          <strong>Educational tools only.</strong> Bond analytics and yield curve data are for informational purposes. Fixed income investing involves interest rate, credit, and liquidity risks.
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

      {/* ── Yield Curve ───────────────────────────────────────────────────────── */}
      {tab === 'yield-curve' && yieldCurve && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Curve shape:</span>
            <span className={cn('text-sm font-bold capitalize', CURVE_SHAPE_COLOR[yieldCurve.curve_shape] || '')}>
              {yieldCurve.curve_shape}
            </span>
            {yieldCurve.curve_shape === 'inverted' && (
              <span className="text-xs text-orange-600 bg-orange-50 dark:bg-orange-950/30 px-2 py-0.5 rounded-full">
                Historically precedes recessions
              </span>
            )}
          </div>

          {/* Yield curve visual */}
          <div className="rounded-xl border bg-card p-4">
            <h2 className="font-semibold text-sm mb-3">US Treasury Yield Curve</h2>
            <div className="flex items-end gap-1.5 h-32">
              {yieldCurve.maturities.map(({ maturity, yield_pct }) => {
                const maxYield = Math.max(...yieldCurve.maturities.map(m => m.yield_pct));
                const heightPct = (yield_pct / maxYield) * 100;
                return (
                  <div key={maturity} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] text-muted-foreground tabular-nums">{yield_pct.toFixed(2)}%</span>
                    <div
                      className="w-full rounded-t bg-primary/70 min-h-[4px] transition-all"
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-[9px] text-muted-foreground">{maturity}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Credit spreads */}
          {spreads && (
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <h2 className="font-semibold text-sm">Credit Spreads & Macro Rates</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'HY Spread',    value: `${spreads.hy_spread?.toFixed(2)}%`,  sub: 'High Yield OAS' },
                  { label: 'IG Spread',    value: `${spreads.ig_spread?.toFixed(2)}%`,  sub: 'Investment Grade OAS' },
                  { label: '10Y-2Y Slope', value: `${spreads.t10y2y?.toFixed(2)}%`,     sub: spreads.t10y2y < 0 ? 'Inverted' : 'Normal' },
                  { label: '10Y Breakeven',value: `${spreads.t10yie?.toFixed(2)}%`,     sub: 'Inflation Expectation' },
                ].map(({ label, value, sub }) => (
                  <div key={label} className="rounded-lg bg-muted/30 p-2.5">
                    <p className="text-[10px] text-muted-foreground">{label}</p>
                    <p className="text-sm font-bold tabular-nums">{value ?? '—'}</p>
                    <p className="text-[10px] text-muted-foreground">{sub}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground">{spreads.disclaimer}</p>
            </div>
          )}
          <p className="text-[10px] text-muted-foreground">{yieldCurve.disclaimer}</p>
        </div>
      )}

      {/* ── Bond Calculator ───────────────────────────────────────────────────── */}
      {tab === 'calculator' && (
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <Calculator className="h-4 w-4" /> Bond Analytics Calculator
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: 'Face Value ($)',     key: 'face_value',         type: 'number', step: '100' },
                { label: 'Coupon Rate (e.g. 0.05 = 5%)', key: 'coupon_rate', type: 'number', step: '0.001' },
                { label: 'Years to Maturity', key: 'years_to_maturity',  type: 'number', step: '0.5' },
                { label: 'Current Price ($)', key: 'current_price',       type: 'number', step: '1' },
                { label: 'Payments/Year (1 or 2)', key: 'frequency',     type: 'number', step: '1' },
              ].map(({ label, key, type, step }) => (
                <div key={key} className="space-y-1">
                  <label className="text-xs font-medium">{label}</label>
                  <input
                    type={type}
                    step={step}
                    value={(calcInput as any)[key]}
                    onChange={e => setCalcInput(prev => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              ))}
            </div>
            <Button onClick={handleAnalyze} disabled={calcLoading} size="sm">
              {calcLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Calculate
            </Button>
          </div>

          {bondMetrics && (
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <h2 className="font-semibold text-sm">Results</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {[
                  { label: 'YTM',              value: `${bondMetrics.ytm_pct?.toFixed(3)}%` },
                  { label: 'Current Yield',    value: `${bondMetrics.current_yield_pct?.toFixed(3)}%` },
                  { label: 'Macaulay Duration',value: `${bondMetrics.macaulay_duration_years?.toFixed(3)} yrs` },
                  { label: 'Modified Duration',value: bondMetrics.modified_duration?.toFixed(4) },
                  { label: 'Convexity',        value: bondMetrics.convexity?.toFixed(4) },
                  { label: 'DV01',             value: `$${bondMetrics.dv01?.toFixed(4)}` },
                  { label: '+50bp Impact',     value: `$${bondMetrics.price_change_up50bp?.toFixed(2)}` },
                  { label: '-50bp Impact',     value: `$${bondMetrics.price_change_down50bp?.toFixed(2)}` },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg bg-muted/30 p-2.5">
                    <p className="text-[10px] text-muted-foreground">{label}</p>
                    <p className="text-sm font-bold tabular-nums">{value}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 text-xs">
                <span className={cn('px-2 py-1 rounded-full', bondMetrics.is_premium ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-muted text-muted-foreground')}>
                  {bondMetrics.is_premium ? 'Premium Bond' : bondMetrics.is_discount ? 'Discount Bond' : 'Par Bond'}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">{bondMetrics.disclaimer}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Bond Ladder ───────────────────────────────────────────────────────── */}
      {tab === 'ladder' && (
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <h2 className="font-semibold text-sm">Bond Ladder Builder</h2>
            <p className="text-xs text-muted-foreground">
              A bond ladder staggers maturities to reduce interest rate risk and provide regular cash flows.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: 'Total Investment ($)',    key: 'total_investment',      step: '1000' },
                { label: 'Number of Rungs',         key: 'rungs',                 step: '1' },
                { label: 'First Maturity (years)',  key: 'first_maturity_years',  step: '0.5' },
                { label: 'Final Maturity (years)',  key: 'final_maturity_years',  step: '1' },
                { label: 'Avg Yield % (e.g. 4.5)', key: 'avg_yield_pct',         step: '0.1' },
              ].map(({ label, key, step }) => (
                <div key={key} className="space-y-1">
                  <label className="text-xs font-medium">{label}</label>
                  <input
                    type="number"
                    step={step}
                    value={(ladderInput as any)[key]}
                    onChange={e => setLadderInput(prev => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              ))}
            </div>
            <Button onClick={handleBuildLadder} disabled={ladderLoading} size="sm">
              {ladderLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Build Ladder
            </Button>
          </div>

          {ladder && (
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Annual Income',   value: `$${ladder.annual_income.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
                  { label: 'Annual Yield',    value: `${ladder.annual_yield_pct.toFixed(3)}%` },
                  { label: 'Avg Maturity',    value: `${ladder.avg_maturity_years} yrs` },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg bg-muted/30 p-2.5">
                    <p className="text-[10px] text-muted-foreground">{label}</p>
                    <p className="text-sm font-bold tabular-nums">{value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border overflow-hidden">
                <div className="grid grid-cols-4 gap-2 px-3 py-2 bg-muted/30 text-[10px] font-semibold text-muted-foreground uppercase">
                  <span>Rung</span>
                  <span className="text-right">Maturity</span>
                  <span className="text-right">Investment</span>
                  <span className="text-right">Annual Coupon</span>
                </div>
                {ladder.ladder.map(rung => (
                  <div key={rung.rung} className="grid grid-cols-4 gap-2 px-3 py-2 text-xs border-t hover:bg-muted/20">
                    <span>#{rung.rung}</span>
                    <span className="text-right">{rung.maturity_years}Y</span>
                    <span className="text-right">${rung.investment.toLocaleString()}</span>
                    <span className="text-right">${rung.annual_coupon.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground">{ladder.disclaimer}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Bond ETFs ─────────────────────────────────────────────────────────── */}
      {tab === 'etfs' && (
        <div className="space-y-3">
          {['treasury', 'tips', 'corporate_ig', 'high_yield', 'municipal', 'international', 'broad'].map(cat => {
            const catEtfs = etfs.filter(e => e.category === cat);
            if (!catEtfs.length) return null;
            return (
              <div key={cat}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  {cat.replace('_', ' ')}
                </h3>
                <div className="rounded-lg border overflow-hidden">
                  {catEtfs.map(e => (
                    <div key={e.ticker} className="flex items-center justify-between px-3 py-2 text-sm border-b last:border-0 hover:bg-muted/20">
                      <div>
                        <span className="font-semibold">{e.ticker}</span>
                        <span className="ml-2 text-muted-foreground text-xs">{e.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{e.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          <p className="text-[10px] text-muted-foreground">Bond ETF directory is for reference only. Not a recommendation.</p>
        </div>
      )}

      {/* ── My Positions ─────────────────────────────────────────────────────── */}
      {tab === 'positions' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setShowAddForm(v => !v)}>
              <Plus className="h-4 w-4 mr-1" /> Add Position
            </Button>
          </div>

          {showAddForm && (
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <h2 className="font-semibold text-sm">Add Bond Position</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Name *</label>
                  <input value={newPos.name} onChange={e => setNewPos(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. US 10Y Treasury 2034" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Type</label>
                  <select value={newPos.bond_type} onChange={e => setNewPos(p => ({ ...p, bond_type: e.target.value }))}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                    {['treasury', 'corporate', 'municipal', 'tips', 'international'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Coupon Rate (decimal)</label>
                  <input type="number" step="0.001" value={newPos.coupon_rate} onChange={e => setNewPos(p => ({ ...p, coupon_rate: e.target.value }))}
                    placeholder="0.045" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Face Value ($)</label>
                  <input type="number" value={newPos.face_value} onChange={e => setNewPos(p => ({ ...p, face_value: e.target.value }))}
                    placeholder="1000" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Maturity Date</label>
                  <input type="date" value={newPos.maturity_date} onChange={e => setNewPos(p => ({ ...p, maturity_date: e.target.value }))}
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
              No bond positions tracked yet.
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              {positions.map(p => (
                <div key={p.id} className="flex items-center justify-between px-3 py-3 text-sm border-b last:border-0 hover:bg-muted/20">
                  <div>
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.bond_type} · {p.coupon_rate ? `${(p.coupon_rate * 100).toFixed(2)}% coupon` : 'no coupon set'}
                      {p.maturity_date ? ` · matures ${p.maturity_date}` : ''}
                      {p.credit_rating ? ` · ${p.credit_rating}` : ''}
                    </p>
                  </div>
                  <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={() => handleRemovePosition(p.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

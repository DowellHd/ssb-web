'use client';

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  BarChart3,
  Calculator,
  Filter,
  Loader2,
  Plus,
  Receipt,
  Shield,
  Trash2,
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

// ── Static screener data ──────────────────────────────────────────────────────

interface ScreenerBond {
  name: string;
  type: 'treasury' | 'corporate' | 'municipal' | 'tips' | 'agency';
  rating: string;
  ytm: number;
  coupon: number;
  maturityYears: number;
  duration: number;
  callable: boolean;
}

const SCREENER_BONDS: ScreenerBond[] = [
  { name: 'US Treasury 2Y',          type: 'treasury',  rating: 'AA+',  ytm: 4.85, coupon: 4.75, maturityYears: 2,  duration: 1.9,  callable: false },
  { name: 'US Treasury 5Y',          type: 'treasury',  rating: 'AA+',  ytm: 4.55, coupon: 4.50, maturityYears: 5,  duration: 4.5,  callable: false },
  { name: 'US Treasury 10Y',         type: 'treasury',  rating: 'AA+',  ytm: 4.35, coupon: 4.25, maturityYears: 10, duration: 8.3,  callable: false },
  { name: 'US Treasury 30Y',         type: 'treasury',  rating: 'AA+',  ytm: 4.65, coupon: 4.50, maturityYears: 30, duration: 18.2, callable: false },
  { name: 'TIPS 10Y',                type: 'tips',      rating: 'AA+',  ytm: 2.05, coupon: 1.75, maturityYears: 10, duration: 9.1,  callable: false },
  { name: 'FNMA Agency 5Y',          type: 'agency',    rating: 'AA+',  ytm: 4.70, coupon: 4.625,maturityYears: 5,  duration: 4.4,  callable: true  },
  { name: 'Apple Corp 5Y',           type: 'corporate', rating: 'AA+',  ytm: 4.90, coupon: 4.75, maturityYears: 5,  duration: 4.5,  callable: false },
  { name: 'Microsoft Corp 10Y',      type: 'corporate', rating: 'AAA',  ytm: 4.55, coupon: 4.40, maturityYears: 10, duration: 8.6,  callable: false },
  { name: 'JPMorgan Chase 5Y',       type: 'corporate', rating: 'A-',   ytm: 5.10, coupon: 5.00, maturityYears: 5,  duration: 4.4,  callable: false },
  { name: 'Ford Motor Credit 3Y',    type: 'corporate', rating: 'BB+',  ytm: 6.80, coupon: 6.50, maturityYears: 3,  duration: 2.8,  callable: true  },
  { name: 'Delta Air Lines 5Y',      type: 'corporate', rating: 'BB',   ytm: 7.25, coupon: 7.00, maturityYears: 5,  duration: 4.2,  callable: true  },
  { name: 'Sprint / T-Mobile HY 7Y', type: 'corporate', rating: 'B+',   ytm: 8.40, coupon: 8.25, maturityYears: 7,  duration: 5.1,  callable: true  },
  { name: 'CA GO Muni 10Y',          type: 'municipal', rating: 'Aa2',  ytm: 3.05, coupon: 3.00, maturityYears: 10, duration: 8.1,  callable: false },
  { name: 'NY State Muni 5Y',        type: 'municipal', rating: 'Aa1',  ytm: 2.85, coupon: 2.75, maturityYears: 5,  duration: 4.6,  callable: false },
  { name: 'TX Tollway Muni 15Y',     type: 'municipal', rating: 'A1',   ytm: 3.45, coupon: 3.25, maturityYears: 15, duration: 11.0, callable: true  },
  { name: 'IL Pension Muni 10Y',     type: 'municipal', rating: 'Baa1', ytm: 4.10, coupon: 4.00, maturityYears: 10, duration: 7.8,  callable: true  },
  { name: 'TIPS 5Y',                 type: 'tips',      rating: 'AA+',  ytm: 2.15, coupon: 1.875,maturityYears: 5,  duration: 4.8,  callable: false },
  { name: 'World Bank Agency 3Y',    type: 'agency',    rating: 'AAA',  ytm: 4.55, coupon: 4.50, maturityYears: 3,  duration: 2.9,  callable: false },
  { name: 'Verizon Corp 10Y',        type: 'corporate', rating: 'BBB',  ytm: 5.45, coupon: 5.25, maturityYears: 10, duration: 7.9,  callable: false },
  { name: 'Amazon Corp 7Y',          type: 'corporate', rating: 'AA',   ytm: 4.70, coupon: 4.55, maturityYears: 7,  duration: 6.3,  callable: false },
];

const RATING_GRADES: Record<string, string> = {
  'AAA': 'text-green-600', 'AA+': 'text-green-600', 'AA': 'text-green-600',
  'AA-': 'text-green-600', 'Aa1': 'text-green-600', 'Aa2': 'text-green-600',
  'Aa3': 'text-green-600', 'A+': 'text-emerald-600', 'A': 'text-emerald-600',
  'A-': 'text-emerald-600', 'A1': 'text-emerald-600',
  'BBB': 'text-yellow-600', 'BBB-': 'text-yellow-600', 'Baa1': 'text-yellow-600',
  'BB+': 'text-orange-500', 'BB': 'text-orange-500', 'BB-': 'text-orange-500',
  'B+': 'text-red-500', 'B': 'text-red-500',
};

// ── Math helpers ──────────────────────────────────────────────────────────────

function calcYTC(faceValue: number, coupon: number, callPrice: number, yearsToCall: number, frequency = 2): number {
  // Newton-Raphson YTC approximation
  const c = (faceValue * coupon) / frequency;
  let ytc = coupon; // initial guess
  for (let i = 0; i < 100; i++) {
    const n = yearsToCall * frequency;
    let pv = 0;
    for (let t = 1; t <= n; t++) pv += c / Math.pow(1 + ytc / frequency, t);
    pv += callPrice / Math.pow(1 + ytc / frequency, n);
    const diff = pv - faceValue;
    if (Math.abs(diff) < 0.001) break;
    ytc += diff * 0.0001;
  }
  return ytc * 100;
}

function calcTEY(muniYield: number, taxRate: number): number {
  return muniYield / (1 - taxRate / 100);
}

function calcAfterTaxYield(taxableYield: number, taxRate: number): number {
  return taxableYield * (1 - taxRate / 100);
}

function calcRealYield(nominalYield: number, inflationRate: number): number {
  // Fisher equation: (1 + r) = (1 + n) / (1 + i)
  return ((1 + nominalYield / 100) / (1 + inflationRate / 100) - 1) * 100;
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Tab = 'yield-curve' | 'screener' | 'calculator' | 'tax-tools' | 'ladder' | 'etfs' | 'positions';

const CURVE_SHAPE_COLOR: Record<string, string> = {
  steep:    'text-green-600',
  normal:   'text-blue-600',
  flat:     'text-yellow-600',
  inverted: 'text-red-600',
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FixedIncomePage() {
  const [tab, setTab]           = useState<Tab>('yield-curve');
  const [yieldCurve, setYieldCurve] = useState<YieldCurve | null>(null);
  const [spreads, setSpreads]   = useState<CreditSpreads | null>(null);
  const [etfs, setEtfs]         = useState<BondETF[]>([]);
  const [positions, setPositions] = useState<BondPosition[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  // Bond calculator
  const [calcInput, setCalcInput] = useState({
    face_value: 1000, coupon_rate: 0.05, years_to_maturity: 10,
    current_price: 950, frequency: 2,
    call_price: 1000, years_to_call: 3,
  });
  const [bondMetrics, setBondMetrics] = useState<BondMetrics | null>(null);
  const [ytcResult, setYtcResult]     = useState<number | null>(null);
  const [calcLoading, setCalcLoading] = useState(false);

  // Ladder builder
  const [ladderInput, setLadderInput] = useState({
    total_investment: 100000, rungs: 5,
    first_maturity_years: 1, final_maturity_years: 10, avg_yield_pct: 4.5,
  });
  const [ladder, setLadder]           = useState<BondLadder | null>(null);
  const [ladderLoading, setLadderLoading] = useState(false);

  // Screener filters
  const [sTypeFilter, setSTypeFilter]       = useState<string>('all');
  const [sMaxMaturity, setSMaxMaturity]     = useState<number>(30);
  const [sMinYTM, setSMinYTM]               = useState<number>(0);
  const [sMaxYTM, setSMaxYTM]               = useState<number>(15);
  const [sCallable, setSCallable]           = useState<'all' | 'yes' | 'no'>('all');
  const [sSortKey, setSSortKey]             = useState<keyof ScreenerBond>('ytm');
  const [sSortDir, setSSortDir]             = useState<'asc' | 'desc'>('desc');

  // Tax tools
  const [taxRate, setTaxRate]               = useState(32);
  const [stateRate, setStateRate]           = useState(5);
  const [muniYield, setMuniYield]           = useState(3.05);
  const [taxableYield, setTaxableYield]     = useState(4.35);
  const [inflation, setInflation]           = useState(2.4);

  // Add position
  const [showAddForm, setShowAddForm]   = useState(false);
  const [newPos, setNewPos]             = useState({ name: '', bond_type: 'treasury', coupon_rate: '', face_value: '', maturity_date: '', currency: 'USD' });
  const [addingPos, setAddingPos]       = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [yc, sp, etfData, pos] = await Promise.all([
        getYieldCurve(), getCreditSpreads(), getBondETFs(), listBondPositions(),
      ]);
      setYieldCurve(yc); setSpreads(sp); setEtfs(etfData.etfs); setPositions(pos.positions);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load fixed income data');
    } finally { setLoading(false); }
  }

  async function handleAnalyze() {
    setCalcLoading(true); setBondMetrics(null); setYtcResult(null);
    try {
      const result = await analyzeBond(calcInput);
      setBondMetrics(result);
      const ytc = calcYTC(calcInput.face_value, calcInput.coupon_rate, calcInput.call_price, calcInput.years_to_call, calcInput.frequency);
      setYtcResult(ytc);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Bond analysis failed');
    } finally { setCalcLoading(false); }
  }

  async function handleBuildLadder() {
    setLadderLoading(true); setLadder(null);
    try {
      const result = await buildBondLadder(ladderInput);
      setLadder(result);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to build ladder');
    } finally { setLadderLoading(false); }
  }

  async function handleAddPosition() {
    setAddingPos(true);
    try {
      await addBondPosition({
        name: newPos.name, bond_type: newPos.bond_type,
        coupon_rate: newPos.coupon_rate ? parseFloat(newPos.coupon_rate) : undefined,
        face_value: newPos.face_value ? parseFloat(newPos.face_value) : undefined,
        maturity_date: newPos.maturity_date || undefined, currency: newPos.currency,
      });
      const { positions: updated } = await listBondPositions();
      setPositions(updated);
      setShowAddForm(false);
      setNewPos({ name: '', bond_type: 'treasury', coupon_rate: '', face_value: '', maturity_date: '', currency: 'USD' });
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to add position');
    } finally { setAddingPos(false); }
  }

  async function handleRemovePosition(id: string) {
    try {
      await removeBondPosition(id);
      setPositions(prev => prev.filter(p => p.id !== id));
    } catch { setError('Failed to remove position'); }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'yield-curve', label: 'Yield Curve' },
    { key: 'screener',    label: 'Bond Screener' },
    { key: 'calculator',  label: 'Bond Calculator' },
    { key: 'tax-tools',   label: 'Tax Tools' },
    { key: 'ladder',      label: 'Bond Ladder' },
    { key: 'etfs',        label: 'Bond ETFs' },
    { key: 'positions',   label: 'My Positions' },
  ];

  // Screener results
  const filteredBonds = SCREENER_BONDS
    .filter(b =>
      (sTypeFilter === 'all' || b.type === sTypeFilter) &&
      b.maturityYears <= sMaxMaturity &&
      b.ytm >= sMinYTM && b.ytm <= sMaxYTM &&
      (sCallable === 'all' || (sCallable === 'yes') === b.callable)
    )
    .sort((a, b) => {
      const av = a[sSortKey] as number | boolean | string;
      const bv = b[sSortKey] as number | boolean | string;
      if (typeof av === 'number' && typeof bv === 'number') {
        return sSortDir === 'asc' ? av - bv : bv - av;
      }
      return 0;
    });

  const tey = calcTEY(muniYield, taxRate + stateRate);
  const aty = calcAfterTaxYield(taxableYield, taxRate + stateRate);
  const realTreasury = calcRealYield(taxableYield, inflation);
  const realMuni = calcRealYield(muniYield, inflation);
  const muniWins = tey > taxableYield;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Fixed Income Analytics
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Yield curve, bond screener, analytics, tax tools, and portfolio tracking.
        </p>
      </div>

      <div className="rounded-lg border border-blue-300 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800 p-3 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
        <Shield className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <span>
          <strong>Educational tools only.</strong> Bond analytics are for informational purposes. Fixed income involves interest rate, credit, and liquidity risks. Tax calculations are illustrative — consult a tax advisor.
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

          <div className="rounded-xl border bg-card p-4">
            <h2 className="font-semibold text-sm mb-3">US Treasury Yield Curve</h2>
            <div className="flex items-end gap-1.5 h-32">
              {yieldCurve.maturities.map(({ maturity, yield_pct }) => {
                const maxYield = Math.max(...yieldCurve.maturities.map(m => m.yield_pct));
                const heightPct = (yield_pct / maxYield) * 100;
                return (
                  <div key={maturity} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] text-muted-foreground tabular-nums">{yield_pct.toFixed(2)}%</span>
                    <div className="w-full rounded-t bg-primary/70 min-h-[4px]" style={{ height: `${heightPct}%` }} />
                    <span className="text-[9px] text-muted-foreground">{maturity}</span>
                  </div>
                );
              })}
            </div>
          </div>

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

      {/* ── Bond Screener ─────────────────────────────────────────────────────── */}
      {tab === 'screener' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <h2 className="font-semibold text-sm flex items-center gap-2"><Filter className="h-4 w-4" /> Screener Filters</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Bond Type</label>
                <select value={sTypeFilter} onChange={e => setSTypeFilter(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                  <option value="all">All Types</option>
                  <option value="treasury">Treasury</option>
                  <option value="corporate">Corporate</option>
                  <option value="municipal">Municipal</option>
                  <option value="tips">TIPS</option>
                  <option value="agency">Agency</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Max Maturity (years): {sMaxMaturity}</label>
                <input type="range" min="1" max="30" value={sMaxMaturity}
                  onChange={e => setSMaxMaturity(parseInt(e.target.value))}
                  className="w-full" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Min YTM (%): {sMinYTM.toFixed(1)}</label>
                <input type="range" min="0" max="15" step="0.1" value={sMinYTM}
                  onChange={e => setSMinYTM(parseFloat(e.target.value))}
                  className="w-full" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Max YTM (%): {sMaxYTM.toFixed(1)}</label>
                <input type="range" min="0" max="15" step="0.1" value={sMaxYTM}
                  onChange={e => setSMaxYTM(parseFloat(e.target.value))}
                  className="w-full" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Callable</label>
                <select value={sCallable} onChange={e => setSCallable(e.target.value as typeof sCallable)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                  <option value="all">All</option>
                  <option value="no">Non-callable only</option>
                  <option value="yes">Callable only</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Sort by</label>
                <div className="flex gap-2">
                  <select value={sSortKey as string} onChange={e => setSSortKey(e.target.value as keyof ScreenerBond)}
                    className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm">
                    <option value="ytm">YTM</option>
                    <option value="coupon">Coupon</option>
                    <option value="maturityYears">Maturity</option>
                    <option value="duration">Duration</option>
                  </select>
                  <button onClick={() => setSSortDir(v => v === 'asc' ? 'desc' : 'asc')}
                    className="px-3 rounded-lg border bg-background text-sm hover:bg-muted">
                    {sSortDir === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{filteredBonds.length} bond{filteredBonds.length !== 1 ? 's' : ''} matching</p>
          </div>

          {filteredBonds.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">No bonds match your filters.</div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <div className="grid grid-cols-7 gap-2 px-3 py-2 bg-muted/30 text-[10px] font-semibold text-muted-foreground uppercase">
                <span className="col-span-2">Name</span>
                <span>Type</span>
                <span className="text-right">Rating</span>
                <span className="text-right">YTM</span>
                <span className="text-right">Coupon</span>
                <span className="text-right">Duration</span>
              </div>
              {filteredBonds.map(b => (
                <div key={b.name} className="grid grid-cols-7 gap-2 px-3 py-2 text-xs border-t hover:bg-muted/20 items-center">
                  <span className="col-span-2 font-medium truncate">
                    {b.name}
                    {b.callable && <span className="ml-1 text-[9px] text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-1 rounded">CALL</span>}
                  </span>
                  <span className="capitalize text-muted-foreground">{b.type}</span>
                  <span className={cn('text-right font-semibold', RATING_GRADES[b.rating] || 'text-muted-foreground')}>{b.rating}</span>
                  <span className="text-right tabular-nums font-semibold text-primary">{b.ytm.toFixed(2)}%</span>
                  <span className="text-right tabular-nums">{b.coupon.toFixed(2)}%</span>
                  <span className="text-right tabular-nums">{b.duration.toFixed(1)}yr</span>
                </div>
              ))}
            </div>
          )}
          <p className="text-[10px] text-muted-foreground">Sample bond universe for illustrative purposes only. Not a recommendation or offer to buy/sell.</p>
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
                { label: 'Face Value ($)',           key: 'face_value',        step: '100' },
                { label: 'Coupon Rate (e.g. 0.05)',  key: 'coupon_rate',       step: '0.001' },
                { label: 'Years to Maturity',        key: 'years_to_maturity', step: '0.5' },
                { label: 'Current Price ($)',         key: 'current_price',     step: '1' },
                { label: 'Payments / Year',          key: 'frequency',         step: '1' },
              ].map(({ label, key, step }) => (
                <div key={key} className="space-y-1">
                  <label className="text-xs font-medium">{label}</label>
                  <input type="number" step={step} value={(calcInput as any)[key]}
                    onChange={e => setCalcInput(prev => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
                </div>
              ))}
            </div>

            {/* Callable inputs */}
            <div className="border-t pt-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Optional: Callable Bond Analysis</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Call Price ($)</label>
                  <input type="number" step="1" value={calcInput.call_price}
                    onChange={e => setCalcInput(prev => ({ ...prev, call_price: parseFloat(e.target.value) || 0 }))}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Years to First Call</label>
                  <input type="number" step="0.5" value={calcInput.years_to_call}
                    onChange={e => setCalcInput(prev => ({ ...prev, years_to_call: parseFloat(e.target.value) || 0 }))}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
                </div>
              </div>
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
                  { label: 'YTM',               value: `${bondMetrics.ytm_pct?.toFixed(3)}%` },
                  { label: 'Current Yield',     value: `${bondMetrics.current_yield_pct?.toFixed(3)}%` },
                  { label: 'YTC',               value: ytcResult != null ? `${ytcResult.toFixed(3)}%` : '—', highlight: ytcResult != null && ytcResult < bondMetrics.ytm_pct },
                  { label: 'Macaulay Duration', value: `${bondMetrics.macaulay_duration_years?.toFixed(3)} yrs` },
                  { label: 'Modified Duration', value: bondMetrics.modified_duration?.toFixed(4) },
                  { label: 'Convexity',         value: bondMetrics.convexity?.toFixed(4) },
                  { label: 'DV01',              value: `$${bondMetrics.dv01?.toFixed(4)}` },
                  { label: '+50bp Impact',      value: `$${bondMetrics.price_change_up50bp?.toFixed(2)}` },
                  { label: '-50bp Impact',      value: `$${bondMetrics.price_change_down50bp?.toFixed(2)}` },
                ].map(({ label, value, highlight }) => (
                  <div key={label} className="rounded-lg bg-muted/30 p-2.5">
                    <p className="text-[10px] text-muted-foreground">{label}</p>
                    <p className={cn('text-sm font-bold tabular-nums', highlight ? 'text-amber-600' : '')}>{value}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className={cn('px-2 py-1 rounded-full', bondMetrics.is_premium ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-muted text-muted-foreground')}>
                  {bondMetrics.is_premium ? 'Premium Bond' : bondMetrics.is_discount ? 'Discount Bond' : 'Par Bond'}
                </span>
                {ytcResult != null && ytcResult < bondMetrics.ytm_pct && (
                  <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    YTC &lt; YTM — likely called early if rates fall
                  </span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground">{bondMetrics.disclaimer}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Tax Tools ─────────────────────────────────────────────────────────── */}
      {tab === 'tax-tools' && (
        <div className="space-y-4">
          {/* Tax rate inputs */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <Receipt className="h-4 w-4" /> Your Tax Rates
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Federal Marginal Rate (%)</label>
                <input type="number" min="0" max="50" step="1" value={taxRate}
                  onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">State Income Tax (%)</label>
                <input type="number" min="0" max="15" step="0.1" value={stateRate}
                  onChange={e => setStateRate(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Inflation Rate (%)</label>
                <input type="number" min="0" max="15" step="0.1" value={inflation}
                  onChange={e => setInflation(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
              </div>
            </div>
          </div>

          {/* Muni vs Taxable */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <h2 className="font-semibold text-sm">Municipal Bond Tax-Equivalent Yield</h2>
            <p className="text-xs text-muted-foreground">
              Munis are federally tax-exempt and often state-exempt. The TEY shows what taxable yield you'd need to match a muni.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium">Municipal Bond Yield (%)</label>
                <input type="number" min="0" max="10" step="0.01" value={muniYield}
                  onChange={e => setMuniYield(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Taxable Bond Yield to Compare (%)</label>
                <input type="number" min="0" max="15" step="0.01" value={taxableYield}
                  onChange={e => setTaxableYield(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-muted/30 p-3 text-xs">
                <p className="text-muted-foreground">Muni Yield</p>
                <p className="text-lg font-bold tabular-nums">{muniYield.toFixed(2)}%</p>
                <p className="text-muted-foreground">Tax-free</p>
              </div>
              <div className="rounded-lg bg-muted/30 p-3 text-xs">
                <p className="text-muted-foreground">Tax-Equivalent Yield</p>
                <p className={cn('text-lg font-bold tabular-nums', muniWins ? 'text-green-600' : '')}>{tey.toFixed(2)}%</p>
                <p className="text-muted-foreground">At {taxRate + stateRate}% combined rate</p>
              </div>
              <div className="rounded-lg bg-muted/30 p-3 text-xs">
                <p className="text-muted-foreground">After-Tax Treasury Yield</p>
                <p className="text-lg font-bold tabular-nums">{aty.toFixed(2)}%</p>
                <p className="text-muted-foreground">From {taxableYield}% pre-tax</p>
              </div>
              <div className={cn('rounded-lg p-3 text-xs border-2', muniWins ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20')}>
                <p className="text-muted-foreground">Better Choice</p>
                <p className={cn('text-sm font-bold', muniWins ? 'text-green-700 dark:text-green-400' : 'text-blue-700 dark:text-blue-400')}>
                  {muniWins ? 'Municipal Bond' : 'Taxable Bond'}
                </p>
                <p className="text-muted-foreground">
                  {muniWins
                    ? `TEY (${tey.toFixed(2)}%) > taxable (${taxableYield}%)`
                    : `Taxable (${taxableYield}%) > TEY (${tey.toFixed(2)}%)`}
                </p>
              </div>
            </div>
          </div>

          {/* Real Yield (TIPS context) */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <h2 className="font-semibold text-sm">Real Yield & TIPS Analysis</h2>
            <p className="text-xs text-muted-foreground">
              Inflation-adjusted real yield shows the actual purchasing power return. TIPS automatically adjust principal for CPI changes.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-muted/30 p-3 text-xs">
                <p className="text-muted-foreground">Real Treasury Yield</p>
                <p className={cn('text-lg font-bold tabular-nums', realTreasury > 0 ? 'text-green-600' : 'text-red-500')}>{realTreasury.toFixed(2)}%</p>
                <p className="text-muted-foreground">{taxableYield.toFixed(2)}% nominal − {inflation}% inflation</p>
              </div>
              <div className="rounded-lg bg-muted/30 p-3 text-xs">
                <p className="text-muted-foreground">Real Muni Yield</p>
                <p className={cn('text-lg font-bold tabular-nums', realMuni > 0 ? 'text-green-600' : 'text-red-500')}>{realMuni.toFixed(2)}%</p>
                <p className="text-muted-foreground">{muniYield.toFixed(2)}% nominal − {inflation}% inflation</p>
              </div>
              <div className="rounded-lg bg-muted/30 p-3 text-xs">
                <p className="text-muted-foreground">TIPS Breakeven</p>
                <p className="text-lg font-bold tabular-nums">{inflation.toFixed(2)}%</p>
                <p className="text-muted-foreground">Prefer TIPS if actual inflation &gt; this</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold">Formulas Used</p>
            <p>TEY = Muni Yield / (1 − Combined Tax Rate)</p>
            <p>After-Tax Yield = Taxable Yield × (1 − Combined Tax Rate)</p>
            <p>Real Yield = (1 + Nominal) / (1 + Inflation) − 1 (Fisher Equation)</p>
            <p>These are educational estimates. State-specific muni exemptions, AMT, and NIIT may affect actual results.</p>
          </div>
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
                  <input type="number" step={step} value={(ladderInput as any)[key]}
                    onChange={e => setLadderInput(prev => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
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
                  { label: 'Annual Income', value: `$${ladder.annual_income.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
                  { label: 'Annual Yield',  value: `${ladder.annual_yield_pct.toFixed(3)}%` },
                  { label: 'Avg Maturity',  value: `${ladder.avg_maturity_years} yrs` },
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
                    placeholder="e.g. US 10Y Treasury 2034"
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
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
                  <input type="number" step="0.001" value={newPos.coupon_rate}
                    onChange={e => setNewPos(p => ({ ...p, coupon_rate: e.target.value }))}
                    placeholder="0.045"
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Face Value ($)</label>
                  <input type="number" value={newPos.face_value}
                    onChange={e => setNewPos(p => ({ ...p, face_value: e.target.value }))}
                    placeholder="1000"
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Maturity Date</label>
                  <input type="date" value={newPos.maturity_date}
                    onChange={e => setNewPos(p => ({ ...p, maturity_date: e.target.value }))}
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

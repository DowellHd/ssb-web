'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Pencil,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import {
  alternativesApi,
  ALT_ASSET_CLASSES,
  type AltHolding,
  type AltPortfolioSummary,
  type CreateAltHoldingRequest,
  type AltAssetClass,
} from '@/lib/api/enterprise';

function fmt(val: string | number | null | undefined, decimals = 2): string {
  if (val == null) return '—';
  const n = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(n)) return '—';
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtUsd(val: string | null | undefined): string {
  if (!val) return '—';
  const n = parseFloat(val);
  if (isNaN(n)) return '—';
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function GainBadge({ pct }: { pct: number }) {
  const positive = pct >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${positive ? 'text-green-400' : 'text-red-400'}`}>
      {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {positive ? '+' : ''}{fmt(pct)}%
    </span>
  );
}

interface AddHoldingFormProps {
  onAdd: (data: CreateAltHoldingRequest) => Promise<void>;
  onCancel: () => void;
}

function AddHoldingForm({ onAdd, onCancel }: AddHoldingFormProps) {
  const [form, setForm] = useState<Partial<CreateAltHoldingRequest>>({
    asset_class: 'reit',
    currency: 'USD',
    quantity: '1',
  });
  const [loading, setLoading] = useState(false);

  const set = (k: keyof CreateAltHoldingRequest, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.cost_basis_usd || !form.quantity || !form.asset_class) return;
    setLoading(true);
    try {
      await onAdd(form as CreateAltHoldingRequest);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-5 space-y-4">
      <h3 className="font-semibold">Add Alternative Investment</h3>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Asset Class</label>
          <select
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={form.asset_class}
            onChange={(e) => set('asset_class', e.target.value)}
          >
            {ALT_ASSET_CLASSES.map((ac) => (
              <option key={ac.key} value={ac.key}>
                {ac.icon} {ac.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Name *</label>
          <input
            required
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder="e.g. Vanguard Real Estate ETF"
            value={form.name || ''}
            onChange={(e) => set('name', e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Ticker (optional)</label>
          <input
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder="e.g. VNQ"
            value={form.ticker || ''}
            onChange={(e) => set('ticker', e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Quantity *</label>
          <input
            required
            type="number"
            min="0"
            step="any"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={form.quantity || ''}
            onChange={(e) => set('quantity', e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Cost Basis (USD) *</label>
          <input
            required
            type="number"
            min="0"
            step="any"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder="0.00"
            value={form.cost_basis_usd || ''}
            onChange={(e) => set('cost_basis_usd', e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Current Value (USD)</label>
          <input
            type="number"
            min="0"
            step="any"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder="0.00"
            value={form.current_value_usd || ''}
            onChange={(e) => set('current_value_usd', e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Annual Yield %</label>
          <input
            type="number"
            min="0"
            max="100"
            step="any"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder="e.g. 4.5"
            value={form.annual_yield_pct || ''}
            onChange={(e) => set('annual_yield_pct', e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Acquisition Date</label>
          <input
            type="date"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={form.acquisition_date || ''}
            onChange={(e) => set('acquisition_date', e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? 'Adding…' : 'Add Holding'}
        </button>
      </div>
    </form>
  );
}

export default function AlternativesPage() {
  const [summary, setSummary] = useState<AltPortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await alternativesApi.getSummary();
      setSummary(data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg || 'Failed to load alternative investments.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(data: CreateAltHoldingRequest) {
    await alternativesApi.create(data);
    setShowForm(false);
    await load();
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await alternativesApi.delete(id);
      await load();
    } finally {
      setDeleting(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Alternative Investments</h1>
          <p className="text-sm text-muted-foreground">
            REITs, commodities, forex, private equity, DeFi, and more.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Holding
        </button>
      </div>

      {showForm && (
        <AddHoldingForm onAdd={handleAdd} onCancel={() => setShowForm(false)} />
      )}

      {summary && (
        <>
          {/* Summary cards */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Total Holdings', value: summary.total_holdings.toString() },
              { label: 'Cost Basis', value: fmtUsd(summary.total_cost_basis_usd) },
              { label: 'Current Value', value: fmtUsd(summary.total_current_value_usd) },
              {
                label: 'Unrealized P&L',
                value: fmtUsd(summary.total_unrealized_gain_usd),
                sub: <GainBadge pct={summary.total_unrealized_gain_pct} />,
              },
            ].map((card) => (
              <div key={card.label} className="rounded-xl border border-border bg-card p-4 space-y-1">
                <p className="text-xs text-muted-foreground">{card.label}</p>
                <p className="text-lg font-semibold">{card.value}</p>
                {card.sub && card.sub}
              </div>
            ))}
          </div>

          {/* By asset class */}
          {Object.keys(summary.by_asset_class).length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">By Asset Class</h2>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {Object.entries(summary.by_asset_class).map(([cls, data]) => {
                  const meta = ALT_ASSET_CLASSES.find((a) => a.key === cls);
                  return (
                    <div key={cls} className="flex items-center gap-3 rounded-lg bg-muted/40 p-3">
                      <span className="text-xl">{meta?.icon ?? '📦'}</span>
                      <div>
                        <p className="text-xs font-medium">{meta?.label ?? cls}</p>
                        <p className="text-xs text-muted-foreground">{data.count} holding{data.count !== 1 ? 's' : ''}</p>
                        <p className="text-xs font-semibold">{fmtUsd(data.current_value_usd)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Holdings table */}
          {summary.holdings.length > 0 ? (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {['Asset', 'Class', 'Quantity', 'Cost Basis', 'Current Value', 'Yield', ''].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {summary.holdings.map((h) => {
                    const meta = ALT_ASSET_CLASSES.find((a) => a.key === h.asset_class);
                    const costV = parseFloat(h.cost_basis_usd);
                    const currV = h.current_value_usd ? parseFloat(h.current_value_usd) : null;
                    const gainPct = currV != null && costV ? ((currV - costV) / costV) * 100 : null;
                    return (
                      <tr key={h.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">{h.name}</p>
                            {h.ticker && <p className="text-xs text-muted-foreground">{h.ticker}</p>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-xs">
                            {meta?.icon} {meta?.label ?? h.asset_class}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">{fmt(h.quantity, 4)}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{fmtUsd(h.cost_basis_usd)}</td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          <div className="space-y-0.5">
                            <p>{fmtUsd(h.current_value_usd)}</p>
                            {gainPct != null && <GainBadge pct={gainPct} />}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {h.annual_yield_pct ? `${fmt(h.annual_yield_pct)}%` : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDelete(h.id)}
                            disabled={deleting === h.id}
                            className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            {deleting === h.id ? (
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            !showForm && (
              <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center space-y-2">
                <p className="text-muted-foreground text-sm">No alternative investments yet.</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Add your first holding →
                </button>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}

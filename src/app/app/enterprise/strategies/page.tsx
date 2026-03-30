'use client';

import { useState, useEffect } from 'react';
import {
  Bot,
  Plus,
  Play,
  Archive,
  Trash2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import {
  strategiesApi,
  type AlgoStrategy,
  type StrategyTemplate,
  type CreateStrategyRequest,
  type StrategyStatus,
} from '@/lib/api/enterprise';

const STATUS_STYLES: Record<StrategyStatus, string> = {
  draft: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  active: 'bg-green-500/10 text-green-400 border border-green-500/20',
  archived: 'bg-muted text-muted-foreground border border-border',
};

function StrategyCard({
  strategy,
  onStatusChange,
  onDelete,
}: {
  strategy: AlgoStrategy;
  onStatusChange: (id: string, status: StrategyStatus) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-lg bg-muted shrink-0">
            <Bot className="h-4 w-4 text-foreground/70" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold truncate">{strategy.name}</p>
            <p className="text-xs text-muted-foreground">
              {strategy.template} · {strategy.symbols.slice(0, 3).join(', ')}
              {strategy.symbols.length > 3 ? ` +${strategy.symbols.length - 3}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[strategy.status]}`}>
            {strategy.status}
          </span>
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border p-4 space-y-4">
          {strategy.description && (
            <p className="text-sm text-muted-foreground">{strategy.description}</p>
          )}

          <div className="grid gap-3 sm:grid-cols-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Max Position</p>
              <p className="font-medium">{strategy.max_position_pct}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Stop Loss</p>
              <p className="font-medium">{strategy.stop_loss_pct ?? '—'}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Take Profit</p>
              <p className="font-medium">{strategy.take_profit_pct ?? '—'}%</p>
            </div>
          </div>

          {Object.keys(strategy.parameters).length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Parameters</p>
              <div className="grid gap-1 sm:grid-cols-3">
                {Object.entries(strategy.parameters).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-1.5 text-xs">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-medium">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            {strategy.status === 'draft' && (
              <button
                onClick={() => onStatusChange(strategy.id, 'active')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors"
              >
                <Play className="h-3 w-3" />
                Activate
              </button>
            )}
            {strategy.status === 'active' && (
              <button
                onClick={() => onStatusChange(strategy.id, 'archived')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-border hover:bg-muted transition-colors"
              >
                <Archive className="h-3 w-3" />
                Archive
              </button>
            )}
            {strategy.last_backtest_id && (
              <Link
                href={`/app/backtests`}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-border hover:bg-muted transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                View Backtest
              </Link>
            )}
            <button
              onClick={() => onDelete(strategy.id)}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md text-destructive border border-destructive/20 hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CreateStrategyForm({
  templates,
  onSubmit,
  onCancel,
}: {
  templates: StrategyTemplate[];
  onSubmit: (data: CreateStrategyRequest) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Partial<CreateStrategyRequest>>({
    template: templates[0]?.key ?? '',
    asset_class: 'stocks',
    max_position_pct: '10',
    symbols: [],
    parameters: {},
  });
  const [symbolInput, setSymbolInput] = useState('AAPL,MSFT,GOOGL');
  const [loading, setLoading] = useState(false);

  const selectedTemplate = templates.find((t) => t.key === form.template);

  function set<K extends keyof CreateStrategyRequest>(k: K, v: CreateStrategyRequest[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function setParam(k: string, v: string) {
    setForm((f) => ({ ...f, parameters: { ...f.parameters, [k]: v } }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const symbols = symbolInput.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
    setLoading(true);
    try {
      await onSubmit({ ...form, symbols } as CreateStrategyRequest);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-5 space-y-4">
      <h3 className="font-semibold">Create New Strategy</h3>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Name *</label>
          <input
            required
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={form.name || ''}
            onChange={(e) => set('name', e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Template *</label>
          <select
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={form.template}
            onChange={(e) => { set('template', e.target.value); set('parameters', {}); }}
          >
            {templates.map((t) => (
              <option key={t.key} value={t.key}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2 space-y-1">
          <label className="text-xs text-muted-foreground">Symbols (comma-separated) *</label>
          <input
            required
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono"
            value={symbolInput}
            onChange={(e) => setSymbolInput(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Max Position %</label>
          <input
            type="number" min="1" max="100"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={form.max_position_pct || '10'}
            onChange={(e) => set('max_position_pct', e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Stop Loss %</label>
          <input
            type="number" min="0.1" step="0.1"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder="e.g. 5"
            value={form.stop_loss_pct || ''}
            onChange={(e) => set('stop_loss_pct', e.target.value)}
          />
        </div>
      </div>

      {selectedTemplate && Object.keys(selectedTemplate.parameters).length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Strategy Parameters</p>
          <p className="text-xs text-muted-foreground">{selectedTemplate.description}</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {Object.entries(selectedTemplate.parameters).map(([k, schema]) => (
              <div key={k} className="space-y-1">
                <label className="text-xs text-muted-foreground capitalize">{k.replace(/_/g, ' ')}</label>
                {schema.options ? (
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={String((form.parameters as Record<string, unknown>)?.[k] ?? schema.default)}
                    onChange={(e) => setParam(k, e.target.value)}
                  >
                    {schema.options.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    type="number"
                    min={schema.min}
                    max={schema.max}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={String((form.parameters as Record<string, unknown>)?.[k] ?? schema.default)}
                    onChange={(e) => setParam(k, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 justify-end pt-1">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
          {loading ? 'Creating…' : 'Create Strategy'}
        </button>
      </div>
    </form>
  );
}

export default function StrategiesPage() {
  const [strategies, setStrategies] = useState<AlgoStrategy[]>([]);
  const [templates, setTemplates] = useState<StrategyTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [strats, tmplData] = await Promise.all([
        strategiesApi.list(),
        strategiesApi.getTemplates(),
      ]);
      setStrategies(strats);
      setTemplates(tmplData.templates);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed to load strategies.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(data: CreateStrategyRequest) {
    await strategiesApi.create(data);
    setShowForm(false);
    await load();
  }

  async function handleStatusChange(id: string, status: StrategyStatus) {
    await strategiesApi.update(id, { status });
    await load();
  }

  async function handleDelete(id: string) {
    await strategiesApi.delete(id);
    await load();
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Algorithmic Strategies</h1>
          <p className="text-sm text-muted-foreground">Build and backtest rule-based trading strategies.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Strategy
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</div>
      )}

      {showForm && (
        <CreateStrategyForm templates={templates} onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      )}

      <div className="space-y-3">
        {strategies.length === 0 && !showForm ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center space-y-2">
            <p className="text-muted-foreground text-sm">No strategies yet.</p>
            <button onClick={() => setShowForm(true)} className="text-sm text-primary hover:underline">
              Create your first strategy →
            </button>
          </div>
        ) : (
          strategies.map((s) => (
            <StrategyCard
              key={s.id}
              strategy={s}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

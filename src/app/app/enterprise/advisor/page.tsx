'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users, Plus, Pencil, Trash2, RefreshCw, TrendingUp, DollarSign,
  UserPlus, Search, CheckSquare, AlertTriangle, Calendar, ChevronRight,
  BarChart3, ClipboardList, Building2, Lock,
} from 'lucide-react';
import {
  advisorApi,
  type AdvisorClient,
  type AdvisorClientStatus,
  type CRMDashboard,
  type CreateAdvisorClientRequest,
} from '@/lib/api/enterprise';
import { usePlanStore } from '@/stores/plan-store';

const STATUS_STYLES: Record<AdvisorClientStatus, string> = {
  prospect:   'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  active:     'bg-green-500/10 text-green-400 border-green-500/20',
  inactive:   'bg-muted text-muted-foreground border-border',
  terminated: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const STATUS_OPTIONS: AdvisorClientStatus[] = ['prospect', 'active', 'inactive', 'terminated'];

const SEGMENT_LABELS: Record<string, string> = {
  mass_market: 'Mass Market',
  affluent:    'Affluent',
  hnw:         'HNW',
  uhnw:        'UHNW',
  unassigned:  'Unassigned',
};

const KYC_STYLES: Record<string, string> = {
  pending:  'text-yellow-400',
  approved: 'text-green-400',
  rejected: 'text-red-400',
};

function fmtAum(val: string | null | number): string {
  if (!val) return '—';
  const n = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(n)) return '—';
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function fmtDate(d: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function InstitutionalUpgradeGate() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
      <div className="flex justify-center">
        <div className="p-4 rounded-2xl bg-purple-500/10">
          <Building2 className="h-10 w-10 text-purple-400" />
        </div>
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Advisor CRM</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Full client relationship management, KYC tracking, task management, and
          portfolio linking are available on the Institutional plan.
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-6 text-left space-y-3 max-w-sm mx-auto">
        <p className="text-sm font-medium">Institutional plan includes:</p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {[
            'Unlimited client profiles with KYC fields',
            'Activity notes: meetings, calls, emails',
            'Task & follow-up management with due dates',
            'Model portfolio assignment per client',
            'CRM dashboard with AUM & pipeline metrics',
            'Compliance audit reports',
            'Institutional API keys & webhooks',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-purple-400 mt-0.5">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <Link
        href="/app/billing"
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        <Lock className="h-4 w-4" />
        Upgrade to Institutional
      </Link>
    </div>
  );
}

export default function AdvisorPage() {
  const { normalized, isLoaded } = usePlanStore();
  const [clients, setClients] = useState<AdvisorClient[]>([]);
  const [dashboard, setDashboard] = useState<CRMDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<AdvisorClientStatus | ''>('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateAdvisorClientRequest>({ name: '' });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [c, d] = await Promise.all([
        advisorApi.listClients(statusFilter || undefined),
        advisorApi.getDashboard().catch(() => null),
      ]);
      setClients(c);
      setDashboard(d);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [statusFilter]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await advisorApi.createClient(form);
      setShowForm(false);
      setForm({ name: '' });
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await advisorApi.deleteClient(id);
    await load();
  }

  const filtered = clients.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.email ?? '').toLowerCase().includes(q) ||
      (c.tags ?? []).some((t) => t.toLowerCase().includes(q))
    );
  });

  // Wait for plan store to hydrate before deciding access
  const isInstitutional = normalized.isAllAccess || normalized.plan === 'institutional';
  if (isLoaded && !isInstitutional) {
    return <InstitutionalUpgradeGate />;
  }

  if (loading || !isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Advisor CRM</h1>
          <p className="text-sm text-muted-foreground">
            Client relationship management &amp; portfolio oversight.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setForm({ name: '' }); }}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          Add Client
        </button>
      </div>

      {/* Dashboard stats */}
      {dashboard && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Users,
              label: 'Total Clients',
              value: dashboard.total_clients,
              sub: `${dashboard.by_status['active'] ?? 0} active`,
            },
            {
              icon: DollarSign,
              label: 'Total AUM',
              value: fmtAum(dashboard.total_aum_usd),
              sub: `Avg ${fmtAum(dashboard.avg_aum_usd)}`,
            },
            {
              icon: CheckSquare,
              label: 'Open Tasks',
              value: dashboard.open_tasks,
              sub: dashboard.overdue_tasks > 0
                ? `${dashboard.overdue_tasks} overdue`
                : 'None overdue',
              subStyle: dashboard.overdue_tasks > 0 ? 'text-red-400' : undefined,
            },
            {
              icon: Calendar,
              label: 'Due for Review',
              value: dashboard.clients_due_review,
              sub: 'Next 30 days',
              subStyle: dashboard.clients_due_review > 0 ? 'text-yellow-400' : undefined,
            },
          ].map((card) => (
            <div key={card.label} className="rounded-xl border border-border bg-card p-4 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-muted mt-0.5">
                <card.icon className="h-4 w-4 text-foreground/70" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{card.label}</p>
                <p className="text-lg font-semibold">{card.value}</p>
                <p className={`text-xs ${card.subStyle ?? 'text-muted-foreground'}`}>{card.sub}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pipeline breakdown */}
      {dashboard && dashboard.total_clients > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-medium mb-3">Pipeline</h3>
          <div className="grid gap-2 sm:grid-cols-4">
            {STATUS_OPTIONS.map((s) => {
              const count = dashboard.by_status[s] ?? 0;
              const pct = dashboard.total_clients > 0
                ? Math.round((count / dashboard.total_clients) * 100)
                : 0;
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
                  className={`text-left p-3 rounded-lg border transition-colors ${
                    statusFilter === s
                      ? 'border-primary/50 bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full border capitalize ${STATUS_STYLES[s]}`}>
                      {s}
                    </span>
                    <span className="text-xs text-muted-foreground">{pct}%</span>
                  </div>
                  <p className="text-xl font-bold">{count}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Add client form */}
      {showForm && (
        <form onSubmit={handleCreate} className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h3 className="font-semibold">New Client</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Full Name *</label>
              <input
                required
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Email</label>
              <input
                type="email"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={form.email || ''}
                onChange={(e) => setForm({ ...form, email: e.target.value || undefined })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Phone</label>
              <input
                type="tel"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={form.phone || ''}
                onChange={(e) => setForm({ ...form, phone: e.target.value || undefined })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Risk Tolerance</label>
              <select
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={form.risk_tolerance || ''}
                onChange={(e) => setForm({ ...form, risk_tolerance: (e.target.value as 'low' | 'medium' | 'high') || undefined })}
              >
                <option value="">— Select —</option>
                <option value="low">Conservative (Low)</option>
                <option value="medium">Moderate</option>
                <option value="high">Aggressive (High)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">AUM (USD)</label>
              <input
                type="number"
                min="0"
                step="1000"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                placeholder="e.g. 500000"
                value={form.aum_usd || ''}
                onChange={(e) => setForm({ ...form, aum_usd: e.target.value || undefined })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Segment</label>
              <select
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={form.segment || ''}
                onChange={(e) => setForm({ ...form, segment: (e.target.value as any) || undefined })}
              >
                <option value="">— Select —</option>
                <option value="mass_market">Mass Market (&lt;$100K)</option>
                <option value="affluent">Affluent ($100K–$1M)</option>
                <option value="hnw">HNW ($1M–$10M)</option>
                <option value="uhnw">UHNW (&gt;$10M)</option>
              </select>
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs text-muted-foreground">Notes</label>
              <textarea
                rows={2}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm resize-none"
                value={form.notes || ''}
                onChange={(e) => setForm({ ...form, notes: e.target.value || undefined })}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saving ? 'Adding…' : 'Add Client'}
            </button>
          </div>
        </form>
      )}

      {/* Search & filter bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            className="w-full rounded-md border border-border bg-background pl-9 pr-3 py-2 text-sm"
            placeholder="Search by name, email, or tag…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {statusFilter && (
          <button
            onClick={() => setStatusFilter('')}
            className="px-3 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Client list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center space-y-2">
            <Users className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">
              {search || statusFilter ? 'No clients match your filters.' : 'No clients yet. Add your first client above.'}
            </p>
          </div>
        ) : (
          filtered.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 hover:border-border/80 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-semibold shrink-0">
                  {c.name[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm">{c.name}</p>
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full border capitalize ${STATUS_STYLES[c.status]}`}>
                      {c.status}
                    </span>
                    {c.kyc_status !== 'approved' && (
                      <span className={`text-xs ${KYC_STYLES[c.kyc_status]}`}>
                        KYC {c.kyc_status}
                      </span>
                    )}
                    {c.segment && (
                      <span className="text-xs text-muted-foreground">
                        {SEGMENT_LABELS[c.segment] ?? c.segment}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {c.email ?? 'No email'}
                    {c.risk_tolerance && ` · ${c.risk_tolerance === 'low' ? 'Conservative' : c.risk_tolerance === 'medium' ? 'Moderate' : 'Aggressive'}`}
                    {c.aum_usd && ` · ${fmtAum(c.aum_usd)} AUM`}
                    {c.next_review_date && ` · Review ${fmtDate(c.next_review_date)}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <Link
                  href={`/app/enterprise/advisor/${c.id}`}
                  className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground"
                  title="View client"
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  title="Delete client"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

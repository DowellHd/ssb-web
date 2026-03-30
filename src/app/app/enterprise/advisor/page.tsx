'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, Pencil, Trash2, RefreshCw, TrendingUp, DollarSign, UserPlus } from 'lucide-react';
import {
  advisorApi,
  type AdvisorClient,
  type CreateAdvisorClientRequest,
  type AdvisorClientStatus,
} from '@/lib/api/enterprise';

const STATUS_STYLES: Record<AdvisorClientStatus, string> = {
  prospect: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  active: 'bg-green-500/10 text-green-400 border-green-500/20',
  inactive: 'bg-muted text-muted-foreground border-border',
  terminated: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const RISK_LABELS = { low: 'Conservative', medium: 'Moderate', high: 'Aggressive' };

function fmtAum(val: string | null): string {
  if (!val) return '—';
  const n = parseFloat(val);
  if (isNaN(n)) return '—';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export default function AdvisorPage() {
  const [clients, setClients] = useState<AdvisorClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<AdvisorClient | null>(null);
  const [form, setForm] = useState<CreateAdvisorClientRequest>({ name: '' });

  async function load() {
    setLoading(true);
    try { setClients(await advisorApi.listClients()); } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingClient) {
      await advisorApi.updateClient(editingClient.id, form);
    } else {
      await advisorApi.createClient(form);
    }
    setShowForm(false);
    setEditingClient(null);
    setForm({ name: '' });
    await load();
  }

  function openEdit(client: AdvisorClient) {
    setEditingClient(client);
    setForm({
      name: client.name,
      email: client.email ?? undefined,
      phone: client.phone ?? undefined,
      risk_tolerance: client.risk_tolerance ?? undefined,
      aum_usd: client.aum_usd ?? undefined,
      notes: client.notes ?? undefined,
    });
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    await advisorApi.deleteClient(id);
    await load();
  }

  const totalAum = clients.reduce((s, c) => s + (c.aum_usd ? parseFloat(c.aum_usd) : 0), 0);
  const activeCount = clients.filter((c) => c.status === 'active').length;

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Advisor Platform</h1>
          <p className="text-sm text-muted-foreground">Manage your client portfolio and model allocations.</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingClient(null); setForm({ name: '' }); }}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
          <UserPlus className="h-4 w-4" />Add Client
        </button>
      </div>

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: Users, label: 'Total Clients', value: clients.length },
          { icon: TrendingUp, label: 'Active Clients', value: activeCount },
          { icon: DollarSign, label: 'Total AUM', value: fmtAum(String(totalAum)) },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted"><card.icon className="h-4 w-4 text-foreground/70" /></div>
            <div>
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <p className="text-lg font-semibold">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h3 className="font-semibold">{editingClient ? 'Edit Client' : 'New Client'}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Name *</label>
              <input required className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Email</label>
              <input type="email" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Risk Tolerance</label>
              <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={form.risk_tolerance || ''} onChange={(e) => setForm({ ...form, risk_tolerance: e.target.value as 'low' | 'medium' | 'high' || undefined })}>
                <option value="">— Select —</option>
                <option value="low">Conservative</option>
                <option value="medium">Moderate</option>
                <option value="high">Aggressive</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">AUM (USD)</label>
              <input type="number" min="0" step="1000" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                placeholder="e.g. 500000"
                value={form.aum_usd || ''} onChange={(e) => setForm({ ...form, aum_usd: e.target.value })} />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs text-muted-foreground">Notes</label>
              <textarea rows={2} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm resize-none"
                value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => { setShowForm(false); setEditingClient(null); }} className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              {editingClient ? 'Save' : 'Add Client'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {clients.length === 0 && !showForm ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center space-y-2">
            <Users className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">No clients yet.</p>
          </div>
        ) : (
          clients.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-semibold shrink-0">
                  {c.name[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{c.name}</p>
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full border ${STATUS_STYLES[c.status]}`}>{c.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {c.email ?? 'No email'}
                    {c.risk_tolerance && ` · ${RISK_LABELS[c.risk_tolerance]}`}
                    {c.aum_usd && ` · ${fmtAum(c.aum_usd)} AUM`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openEdit(c)} className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
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

'use client';

import { useState, useEffect } from 'react';
import { Webhook, Plus, Copy, Trash2, RefreshCw, CheckCircle, XCircle, Pause } from 'lucide-react';
import {
  webhooksApi,
  WEBHOOK_EVENTS,
  type WebhookSubscription,
  type WebhookDelivery,
  type CreateWebhookRequest,
} from '@/lib/api/enterprise';

const STATUS_ICONS = {
  active: <CheckCircle className="h-4 w-4 text-green-400" />,
  paused: <Pause className="h-4 w-4 text-yellow-400" />,
  failed: <XCircle className="h-4 w-4 text-red-400" />,
};

function DeliveryBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    success: 'bg-green-500/10 text-green-400 border-green-500/20',
    failed: 'bg-red-500/10 text-red-400 border-red-500/20',
    retrying: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    pending: 'bg-muted text-muted-foreground border-border',
  };
  return (
    <span className={`text-xs font-medium px-1.5 py-0.5 rounded border ${styles[status] ?? styles.pending}`}>
      {status}
    </span>
  );
}

export default function WebhooksPage() {
  const [subs, setSubs] = useState<WebhookSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);
  const [form, setForm] = useState<CreateWebhookRequest>({ url: '', events: [] });

  async function load() {
    setLoading(true);
    try { setSubs(await webhooksApi.list()); setError(null); }
    catch { setError('Failed to load webhooks.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const created = await webhooksApi.create(form);
      setNewSecret((created as { signing_secret?: string }).signing_secret ?? null);
      setForm({ url: '', events: [] });
      setShowForm(false);
      await load();
    } catch {
      setError('Failed to create webhook.');
    }
  }

  async function handleDelete(id: string) {
    await webhooksApi.delete(id);
    await load();
  }

  async function handleViewDeliveries(id: string) {
    if (selectedSub === id) { setSelectedSub(null); return; }
    setSelectedSub(id);
    setLoadingDeliveries(true);
    try {
      setDeliveries(await webhooksApi.listDeliveries(id));
    } finally {
      setLoadingDeliveries(false);
    }
  }

  async function copySecret() {
    if (newSecret) { await navigator.clipboard.writeText(newSecret); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Webhooks</h1>
          <p className="text-sm text-muted-foreground">Receive real-time event notifications via HTTPS.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" />Add Endpoint
        </button>
      </div>

      {error && <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</div>}

      {newSecret && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4 space-y-2">
          <p className="text-sm font-medium text-green-400">Webhook created! Save your signing secret — it won't be shown again.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-muted rounded px-3 py-2 font-mono break-all">{newSecret}</code>
            <button onClick={copySecret} className="px-3 py-2 text-xs rounded-md border border-border hover:bg-muted transition-colors flex items-center gap-1">
              <Copy className="h-3.5 w-3.5" />{copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <button onClick={() => setNewSecret(null)} className="text-xs text-muted-foreground hover:text-foreground">Dismiss</button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h3 className="font-semibold">New Webhook Endpoint</h3>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">HTTPS URL *</label>
            <input required type="url" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder="https://your-server.com/webhook" value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Events (empty = all)</label>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {WEBHOOK_EVENTS.map((ev) => (
                <label key={ev.key} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.events?.includes(ev.key)}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...(form.events ?? []), ev.key]
                        : (form.events ?? []).filter((x) => x !== ev.key);
                      setForm({ ...form, events: next });
                    }} />
                  {ev.label}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">Create</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {subs.length === 0 && !showForm ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center space-y-2">
            <Webhook className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">No webhook endpoints yet.</p>
          </div>
        ) : (
          subs.map((sub) => (
            <div key={sub.id} className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3 min-w-0">
                  {STATUS_ICONS[sub.status]}
                  <div className="min-w-0">
                    <p className="text-sm font-mono truncate">{sub.url}</p>
                    <p className="text-xs text-muted-foreground">
                      {sub.events.length === 0 ? 'All events' : sub.events.join(', ')}
                      {sub.consecutive_failures > 0 && ` · ${sub.consecutive_failures} failure${sub.consecutive_failures !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleViewDeliveries(sub.id)} className="text-xs px-2.5 py-1 rounded-md border border-border hover:bg-muted transition-colors">
                    {selectedSub === sub.id ? 'Hide' : 'Deliveries'}
                  </button>
                  <button onClick={() => handleDelete(sub.id)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {selectedSub === sub.id && (
                <div className="border-t border-border bg-muted/20 p-4">
                  {loadingDeliveries ? (
                    <div className="flex justify-center py-4"><RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" /></div>
                  ) : deliveries.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-2">No deliveries yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {deliveries.slice(0, 10).map((d) => (
                        <div key={d.id} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <DeliveryBadge status={d.status} />
                            <span className="text-muted-foreground truncate">{d.event_type}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 text-muted-foreground">
                            {d.http_status && <span>{d.http_status}</span>}
                            <span>{new Date(d.created_at).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

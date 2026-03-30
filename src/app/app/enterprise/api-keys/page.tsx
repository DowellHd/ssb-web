'use client';

import { useState, useEffect } from 'react';
import { Key, Plus, Copy, Trash2, RefreshCw, Shield } from 'lucide-react';
import { apiKeysApi, API_KEY_SCOPES, type APIKey, type CreateAPIKeyRequest } from '@/lib/api/enterprise';

export default function APIKeysPage() {
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newRawKey, setNewRawKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState<CreateAPIKeyRequest>({ name: '', scopes: ['portfolio:read'] });

  async function load() {
    setLoading(true);
    try { setKeys(await apiKeysApi.list()); } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const created = await apiKeysApi.create(form);
    setNewRawKey((created as { raw_key?: string }).raw_key ?? null);
    setForm({ name: '', scopes: ['portfolio:read'] });
    setShowForm(false);
    await load();
  }

  async function handleRevoke(id: string) {
    await apiKeysApi.revoke(id);
    await load();
  }

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">API Keys</h1>
          <p className="text-sm text-muted-foreground">Programmatic access for institutional integrations.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" />Create Key
        </button>
      </div>

      {newRawKey && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4 space-y-2">
          <p className="text-sm font-medium text-green-400">API key created — copy it now. It won't be shown again.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-muted rounded px-3 py-2 font-mono break-all">{newRawKey}</code>
            <button onClick={() => copy(newRawKey)} className="px-3 py-2 text-xs rounded-md border border-border hover:bg-muted transition-colors flex items-center gap-1">
              <Copy className="h-3.5 w-3.5" />{copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <button onClick={() => setNewRawKey(null)} className="text-xs text-muted-foreground hover:text-foreground">Dismiss</button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h3 className="font-semibold">New API Key</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Name *</label>
              <input required className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                placeholder="e.g. Production Integration"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Expires In (days)</label>
              <input type="number" min="1" max="3650" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                placeholder="Never"
                value={form.expires_in_days || ''}
                onChange={(e) => setForm({ ...form, expires_in_days: e.target.value ? parseInt(e.target.value) : undefined })} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Scopes</label>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {API_KEY_SCOPES.map((s) => (
                <label key={s.key} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.scopes?.includes(s.key)}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...(form.scopes ?? []), s.key]
                        : (form.scopes ?? []).filter((x) => x !== s.key);
                      setForm({ ...form, scopes: next });
                    }} />
                  {s.label}
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
        {keys.length === 0 && !showForm ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center space-y-2">
            <Shield className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">No API keys yet.</p>
          </div>
        ) : (
          keys.map((k) => (
            <div key={k.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-muted shrink-0"><Key className="h-4 w-4 text-foreground/70" /></div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{k.name}</p>
                    {!k.is_active && <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">revoked</span>}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">{k.key_prefix}…</p>
                  <p className="text-xs text-muted-foreground">{k.scopes.join(', ')} · last used {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : 'never'}</p>
                </div>
              </div>
              {k.is_active && (
                <button onClick={() => handleRevoke(k.id)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

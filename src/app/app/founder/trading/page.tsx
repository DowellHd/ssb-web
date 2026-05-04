'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Loader2,
  RefreshCw,
  XCircle,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/api-client';
import {
  getIBKRPolicy,
  getPendingIntents,
  createIntent,
  approveIntent,
  getAuditLog,
  type IBKRPolicy,
  type TradeIntent,
  type AuditEntry,
  type IntentSide,
  type OrderType,
} from '@/lib/api/ibkr';

// This page is intentionally excluded from all navigation.
// Access is restricted to accounts with is_founder: true.

// ============================================================================
// Sub-components
// ============================================================================

function StatusBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
      active ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
             : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-green-500' : 'bg-red-500'}`} />
      {label}
    </span>
  );
}

function KillSwitchBadge({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
      active ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
             : 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-red-500' : 'bg-green-500'}`} />
      {active ? 'KILL SWITCH ACTIVE' : 'Kill switch off'}
    </span>
  );
}

function ModeBadge({ mode }: { mode: string }) {
  const colours: Record<string, string> = {
    paper: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    live: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
    simulation: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${colours[mode] ?? colours.simulation}`}>
      {mode} mode
    </span>
  );
}

function IntentStatusBadge({ status }: { status: TradeIntent['status'] }) {
  const map: Record<string, string> = {
    draft:    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
    approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    queued:   'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    executed: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    expired:  'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  };
  return (
    <span className={`inline-flex rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${map[status] ?? map.expired}`}>
      {status}
    </span>
  );
}

// ============================================================================
// MFA modal
// ============================================================================

interface MFAModalProps {
  intent: TradeIntent;
  onConfirm: (code: string) => Promise<void>;
  onCancel: () => void;
}

function MFAModal({ intent, onConfirm, onCancel }: MFAModalProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (code.length !== 6 || !/^\d+$/.test(code)) {
      toast.error('Enter a 6-digit MFA code');
      return;
    }
    setLoading(true);
    try {
      await onConfirm(code);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-xl border bg-background shadow-2xl p-6 space-y-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold text-base">Confirm Approval</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Approving{' '}
              <span className="font-medium text-foreground">
                {intent.side.toUpperCase()} {intent.quantity} {intent.symbol}
              </span>{' '}
              ({intent.order_type})
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-muted/60 px-4 py-3 text-sm space-y-1">
          {intent.limit_price && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Limit price</span>
              <span className="font-medium">${intent.limit_price.toFixed(2)}</span>
            </div>
          )}
          {intent.max_loss_usd && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max loss</span>
              <span className="font-medium">${intent.max_loss_usd.toFixed(2)}</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">MFA Code</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="000000"
            autoFocus
            className="w-full rounded-lg border bg-background px-3 py-2 text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={submit} disabled={loading || code.length !== 6}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Approve'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main page
// ============================================================================

const DEFAULT_FORM = {
  symbol: '',
  side: 'buy' as IntentSide,
  quantity: 1,
  order_type: 'market' as OrderType,
  limit_price: '',
  max_loss_usd: '',
  notes: '',
};

export default function FounderTradingPage() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [policy, setPolicy] = useState<IBKRPolicy | null>(null);
  const [intents, setIntents] = useState<TradeIntent[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [auditOpen, setAuditOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [pendingApproval, setPendingApproval] = useState<TradeIntent | null>(null);

  const fetchData = useCallback(async () => {
    const [pol, ints] = await Promise.all([getIBKRPolicy(), getPendingIntents()]);
    setPolicy(pol);
    setIntents(ints);
  }, []);

  const fetchAudit = useCallback(async () => {
    const log = await getAuditLog(50);
    setAuditLog(log.items);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const user = await getCurrentUser();
        if (!user.is_founder) {
          router.replace('/app/dashboard');
          return;
        }
        setAuthorized(true);
      } catch {
        router.replace('/auth/login');
        return;
      } finally {
        setLoading(false);
      }
      // Data fetch errors (e.g. IBKR disabled) must not trigger a logout.
      try {
        await fetchData();
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    })();
  }, [router, fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.symbol.trim()) { toast.error('Symbol is required'); return; }
    if (form.order_type === 'limit' && !form.limit_price) { toast.error('Limit price is required for limit orders'); return; }
    setSubmitting(true);
    try {
      await createIntent({
        symbol: form.symbol.trim().toUpperCase(),
        side: form.side,
        quantity: form.quantity,
        order_type: form.order_type,
        limit_price: form.limit_price ? parseFloat(form.limit_price) : null,
        max_loss_usd: form.max_loss_usd ? parseFloat(form.max_loss_usd) : null,
        notes: form.notes || null,
      });
      toast.success('Intent created — approve it to queue for execution');
      setForm(DEFAULT_FORM);
      await fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (code: string) => {
    if (!pendingApproval) return;
    try {
      await approveIntent(pendingApproval.id, code);
      toast.success('Intent approved and queued');
      setPendingApproval(null);
      await fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const toggleAudit = async () => {
    if (!auditOpen && auditLog.length === 0) await fetchAudit();
    setAuditOpen((v) => !v);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!authorized) return null;

  const canSubmit = !policy?.kill_switch_active && policy?.ibkr_enabled;

  return (
    <>
      {pendingApproval && (
        <MFAModal
          intent={pendingApproval}
          onConfirm={handleApprove}
          onCancel={() => setPendingApproval(null)}
        />
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="h-6 w-6 text-orange-500" />
              Execution Console
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Founder-only · IBKR paper execution pipeline
            </p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {policy && (
              <>
                <KillSwitchBadge active={policy.kill_switch_active} />
                <ModeBadge mode={policy.execution_mode} />
                <StatusBadge active={policy.ibkr_enabled} label={policy.ibkr_enabled ? 'IBKR enabled' : 'IBKR disabled'} />
                {policy.execution_mode === 'live' && (
                  <StatusBadge active={policy.live_trading_enabled} label={policy.live_trading_enabled ? 'Live unlocked' : 'Live locked'} />
                )}
              </>
            )}
            <Button variant="ghost" size="icon" onClick={fetchData} title="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Disclaimer — non-dismissible */}
        <div className="flex gap-3 rounded-lg border border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-4">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900 dark:text-amber-200 space-y-1">
            <p className="font-semibold">Founder-only execution console — internal use only</p>
            <p>
              Intents submitted here are routed through the local IBKR executor running on your machine.
              The SSB platform never calls IBKR directly. All approvals require MFA. Review each intent
              carefully before approving — approved intents are immediately queued for execution.
            </p>
            <p>This page is not indexed, not linked, and not accessible to any other user.</p>
          </div>
        </div>

        {/* Kill switch warning */}
        {policy?.kill_switch_active && (
          <div className="flex gap-3 rounded-lg border border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30 p-4">
            <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-sm text-red-900 dark:text-red-200">
              <p className="font-semibold">Kill switch is active — all execution is blocked</p>
              <p>Disable the kill switch in the policy settings to resume execution.</p>
            </div>
          </div>
        )}

        {/* Create intent form */}
        <section className="rounded-xl border bg-card p-5 space-y-4">
          <h2 className="text-base font-semibold">New Trade Intent</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Symbol */}
              <div className="space-y-1">
                <label className="text-sm font-medium">Symbol</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. AAPL"
                  value={form.symbol}
                  onChange={(e) => setForm((f) => ({ ...f, symbol: e.target.value.toUpperCase() }))}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Side */}
              <div className="space-y-1">
                <label className="text-sm font-medium">Side</label>
                <select
                  value={form.side}
                  onChange={(e) => setForm((f) => ({ ...f, side: e.target.value as IntentSide }))}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
              </div>

              {/* Quantity */}
              <div className="space-y-1">
                <label className="text-sm font-medium">Quantity</label>
                <input
                  required
                  type="number"
                  min={1}
                  step={1}
                  value={form.quantity}
                  onChange={(e) => setForm((f) => ({ ...f, quantity: parseInt(e.target.value) || 1 }))}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Order type */}
              <div className="space-y-1">
                <label className="text-sm font-medium">Order Type</label>
                <select
                  value={form.order_type}
                  onChange={(e) => setForm((f) => ({ ...f, order_type: e.target.value as OrderType }))}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="market">Market</option>
                  <option value="limit">Limit</option>
                </select>
              </div>

              {/* Limit price — only when limit order */}
              {form.order_type === 'limit' && (
                <div className="space-y-1">
                  <label className="text-sm font-medium">Limit Price (USD)</label>
                  <input
                    required
                    type="number"
                    min={0.01}
                    step={0.01}
                    placeholder="0.00"
                    value={form.limit_price}
                    onChange={(e) => setForm((f) => ({ ...f, limit_price: e.target.value }))}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}

              {/* Max loss */}
              <div className="space-y-1">
                <label className="text-sm font-medium">Max Loss USD <span className="text-muted-foreground font-normal">(optional)</span></label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                  value={form.max_loss_usd}
                  onChange={(e) => setForm((f) => ({ ...f, max_loss_usd: e.target.value }))}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Notes <span className="text-muted-foreground font-normal">(optional)</span></label>
              <input
                type="text"
                placeholder="e.g. Earnings play, stop at 50% loss"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={submitting || !canSubmit}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Intent
              </Button>
              {!canSubmit && (
                <p className="text-xs text-muted-foreground">
                  {policy?.kill_switch_active ? 'Blocked by kill switch' : 'IBKR integration disabled'}
                </p>
              )}
            </div>
          </form>
        </section>

        {/* Pending intents */}
        <section className="rounded-xl border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
              Pending Intents
            </h2>
            <span className="text-xs text-muted-foreground">{intents.length} intent{intents.length !== 1 ? 's' : ''}</span>
          </div>

          {intents.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
              No pending intents. Create one above.
            </div>
          ) : (
            <div className="divide-y">
              {intents.map((intent) => (
                <div key={intent.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-sm font-semibold ${intent.side === 'buy' ? 'text-green-600' : 'text-red-600'}`}>
                        {intent.side.toUpperCase()}
                      </span>
                      <span className="text-sm font-mono font-medium">{intent.symbol}</span>
                      <span className="text-sm text-muted-foreground">×{intent.quantity}</span>
                      <span className="text-xs text-muted-foreground capitalize">{intent.order_type}</span>
                      {intent.limit_price && (
                        <span className="text-xs text-muted-foreground">@ ${intent.limit_price.toFixed(2)}</span>
                      )}
                      <IntentStatusBadge status={intent.status} />
                    </div>
                    {intent.notes && (
                      <p className="text-xs text-muted-foreground truncate">{intent.notes}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(intent.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    {intent.status === 'draft' && (
                      <Button
                        size="sm"
                        variant="default"
                        disabled={policy?.kill_switch_active}
                        onClick={() => setPendingApproval(intent)}
                      >
                        Approve
                      </Button>
                    )}
                    {(intent.status === 'queued' || intent.status === 'executed') && (
                      <span className="text-xs text-muted-foreground self-center">read-only</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Execution log — collapsible */}
        <section className="rounded-xl border bg-card overflow-hidden">
          <button
            onClick={toggleAudit}
            className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-muted/30 transition-colors"
          >
            <h2 className="text-base font-semibold">Execution Audit Log</h2>
            {auditOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>

          {auditOpen && (
            <div className="border-t">
              {auditLog.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-muted-foreground">No audit entries yet.</div>
              ) : (
                <div className="divide-y max-h-96 overflow-y-auto">
                  {auditLog.map((entry) => (
                    <div key={entry.id} className="px-5 py-3 flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono font-medium">{entry.event_type}</span>
                          {entry.intent_id && (
                            <span className="text-xs text-muted-foreground font-mono truncate">
                              intent:{entry.intent_id.slice(0, 8)}…
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(entry.created_at).toLocaleString()}
                        </p>
                        {Object.keys(entry.details).length > 0 && (
                          <pre className="mt-1 text-xs text-muted-foreground font-mono whitespace-pre-wrap break-all">
                            {JSON.stringify(entry.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

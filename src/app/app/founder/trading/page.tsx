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
  Plus,
  RefreshCw,
  Trash2,
  XCircle,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/api-client';
import {
  getIBKRPolicy,
  getMyIntents,
  createIntent,
  approveIntent,
  getAuditLog,
  type IBKRPolicy,
  type TradeIntent,
  type AuditEntry,
  type IntentLeg,
  type ExecutionMode,
  type PricingPolicy,
  type TimeInForce,
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
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${colours[mode] ?? colours.paper}`}>
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
    failed:   'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  };
  return (
    <span className={`inline-flex rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${map[status] ?? map.rejected}`}>
      {status}
    </span>
  );
}

function formatLegs(legs: IntentLeg[]): string {
  return legs
    .map(l => `${l.side.toUpperCase()} ${l.qty}× ${l.right.toUpperCase()} @$${l.strike}`)
    .join(' / ');
}

// ============================================================================
// Confirmation modal (no MFA code — backend validates MFA at session level)
// ============================================================================

interface ConfirmModalProps {
  intent: TradeIntent;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

function ConfirmModal({ intent, onConfirm, onCancel }: ConfirmModalProps) {
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await onConfirm();
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
                {intent.strategy_type.toUpperCase()} on {intent.symbol}
              </span>{' '}
              ({intent.mode})
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-muted/60 px-4 py-3 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Legs</span>
            <span className="font-medium font-mono text-xs">{formatLegs(intent.legs)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Max debit</span>
            <span className="font-medium">${intent.max_debit_usd}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Max loss</span>
            <span className="font-medium">${intent.max_loss_usd}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={submit} disabled={loading}>
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

interface LegForm {
  right: 'call' | 'put';
  strike: string;
  side: 'buy' | 'sell';
  qty: number;
}

interface FormState {
  symbol: string;
  strategy_type: string;
  expiry: string;
  legs: LegForm[];
  pricing_policy: PricingPolicy;
  max_debit_usd: string;
  max_loss_usd: string;
  time_in_force: TimeInForce;
  mode: ExecutionMode;
}

const DEFAULT_LEG: LegForm = { right: 'call', strike: '', side: 'buy', qty: 1 };

const DEFAULT_FORM: FormState = {
  symbol: '',
  strategy_type: '',
  expiry: '',
  legs: [{ ...DEFAULT_LEG }],
  pricing_policy: 'mid',
  max_debit_usd: '',
  max_loss_usd: '',
  time_in_force: 'DAY',
  mode: 'paper',
};

const STRATEGIES = [
  'long_call', 'long_put', 'bull_call_spread', 'bear_put_spread',
  'iron_condor', 'straddle', 'strangle', 'covered_call', 'cash_secured_put',
];

export default function FounderTradingPage() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [policy, setPolicy] = useState<IBKRPolicy | null>(null);
  const [intents, setIntents] = useState<TradeIntent[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [auditOpen, setAuditOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [pendingApproval, setPendingApproval] = useState<TradeIntent | null>(null);

  const fetchData = useCallback(async () => {
    const [pol, ints] = await Promise.all([getIBKRPolicy(), getMyIntents()]);
    setPolicy(pol);
    setIntents(ints);
  }, []);

  const fetchAudit = useCallback(async () => {
    const logs = await getAuditLog(50);
    setAuditLog(logs);
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
      try {
        await fetchData();
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    })();
  }, [router, fetchData]);

  const updateLeg = (index: number, field: keyof LegForm, value: string | number) => {
    setForm(f => {
      const legs = f.legs.map((l, i) => i === index ? { ...l, [field]: value } : l);
      return { ...f, legs };
    });
  };

  const addLeg = () => {
    setForm(f => ({ ...f, legs: [...f.legs, { ...DEFAULT_LEG }] }));
  };

  const removeLeg = (index: number) => {
    setForm(f => ({ ...f, legs: f.legs.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.symbol.trim()) { toast.error('Symbol is required'); return; }
    if (!form.strategy_type.trim()) { toast.error('Strategy type is required'); return; }
    if (form.legs.some(l => !l.strike || parseFloat(l.strike) <= 0)) {
      toast.error('All legs need a valid strike price');
      return;
    }
    setSubmitting(true);
    try {
      await createIntent({
        symbol: form.symbol.trim().toUpperCase(),
        strategy_type: form.strategy_type.trim(),
        expiry: form.expiry || null,
        legs: form.legs.map(l => ({
          right: l.right,
          strike: l.strike,
          side: l.side,
          qty: l.qty,
        })),
        pricing_policy: form.pricing_policy,
        max_debit_usd: parseFloat(form.max_debit_usd) || 0,
        max_loss_usd: parseFloat(form.max_loss_usd) || 0,
        time_in_force: form.time_in_force,
        mode: form.mode,
      });
      toast.success('Intent created — approve it to queue for execution');
      setForm({ ...DEFAULT_FORM, legs: [{ ...DEFAULT_LEG }] });
      await fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async () => {
    if (!pendingApproval) return;
    try {
      await approveIntent(pendingApproval.id);
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
    setAuditOpen(v => !v);
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
        <ConfirmModal
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

        {/* Disclaimer */}
        <div className="flex gap-3 rounded-lg border border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-4">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900 dark:text-amber-200 space-y-1">
            <p className="font-semibold">Founder-only execution console — internal use only</p>
            <p>
              Intents submitted here are routed through the local IBKR executor running on your machine.
              The SSB platform never calls IBKR directly. All approvals require MFA to be active on your
              account. Review each intent carefully before approving — approved intents are immediately
              queued for execution.
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
        <section className="rounded-xl border bg-card p-5 space-y-5">
          <h2 className="text-base font-semibold">New Trade Intent</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Symbol + Strategy + Mode */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Symbol</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. AAPL"
                  value={form.symbol}
                  onChange={e => setForm(f => ({ ...f, symbol: e.target.value.toUpperCase() }))}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Strategy</label>
                <input
                  required
                  list="strategy-list"
                  type="text"
                  placeholder="e.g. long_call"
                  value={form.strategy_type}
                  onChange={e => setForm(f => ({ ...f, strategy_type: e.target.value }))}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <datalist id="strategy-list">
                  {STRATEGIES.map(s => <option key={s} value={s} />)}
                </datalist>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Mode</label>
                <select
                  value={form.mode}
                  onChange={e => setForm(f => ({ ...f, mode: e.target.value as ExecutionMode }))}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="paper">Paper</option>
                  <option value="live" disabled={!policy?.live_trading_enabled}>Live</option>
                </select>
              </div>
            </div>

            {/* Expiry + Pricing + TIF */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Expiry <span className="text-muted-foreground font-normal">(optional)</span></label>
                <input
                  type="date"
                  value={form.expiry}
                  onChange={e => setForm(f => ({ ...f, expiry: e.target.value }))}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Pricing</label>
                <select
                  value={form.pricing_policy}
                  onChange={e => setForm(f => ({ ...f, pricing_policy: e.target.value as PricingPolicy }))}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="mid">Mid</option>
                  <option value="mark">Mark</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Time in Force</label>
                <select
                  value={form.time_in_force}
                  onChange={e => setForm(f => ({ ...f, time_in_force: e.target.value as TimeInForce }))}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="DAY">DAY</option>
                  <option value="GTC">GTC</option>
                  <option value="IOC">IOC</option>
                </select>
              </div>
            </div>

            {/* Legs */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Legs</label>
                <Button type="button" variant="ghost" size="sm" onClick={addLeg} className="h-7 gap-1 text-xs">
                  <Plus className="h-3 w-3" /> Add Leg
                </Button>
              </div>
              {form.legs.map((leg, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto_auto] gap-2 items-end">
                  <div className="space-y-1">
                    {i === 0 && <span className="text-xs text-muted-foreground">Right</span>}
                    <select
                      value={leg.right}
                      onChange={e => updateLeg(i, 'right', e.target.value)}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="call">Call</option>
                      <option value="put">Put</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    {i === 0 && <span className="text-xs text-muted-foreground">Strike ($)</span>}
                    <input
                      required
                      type="number"
                      min={0.01}
                      step={0.5}
                      placeholder="0.00"
                      value={leg.strike}
                      onChange={e => updateLeg(i, 'strike', e.target.value)}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    {i === 0 && <span className="text-xs text-muted-foreground">Side</span>}
                    <select
                      value={leg.side}
                      onChange={e => updateLeg(i, 'side', e.target.value)}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="buy">Buy</option>
                      <option value="sell">Sell</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    {i === 0 && <span className="text-xs text-muted-foreground">Qty</span>}
                    <input
                      required
                      type="number"
                      min={1}
                      step={1}
                      value={leg.qty}
                      onChange={e => updateLeg(i, 'qty', parseInt(e.target.value) || 1)}
                      className="w-20 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className={i === 0 ? 'mt-5' : ''}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-muted-foreground hover:text-destructive"
                      onClick={() => removeLeg(i)}
                      disabled={form.legs.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Max debit + Max loss */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">Max Debit USD</label>
                <input
                  required
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                  value={form.max_debit_usd}
                  onChange={e => setForm(f => ({ ...f, max_debit_usd: e.target.value }))}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Max Loss USD</label>
                <input
                  required
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                  value={form.max_loss_usd}
                  onChange={e => setForm(f => ({ ...f, max_loss_usd: e.target.value }))}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
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

        {/* Intent list */}
        <section className="rounded-xl border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
              Intents
            </h2>
            <span className="text-xs text-muted-foreground">{intents.length} intent{intents.length !== 1 ? 's' : ''}</span>
          </div>

          {intents.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
              No intents yet. Create one above.
            </div>
          ) : (
            <div className="divide-y">
              {intents.map(intent => (
                <div key={intent.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold font-mono">{intent.symbol}</span>
                      <span className="text-sm text-muted-foreground">{intent.strategy_type}</span>
                      <ModeBadge mode={intent.mode} />
                      <IntentStatusBadge status={intent.status} />
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      {formatLegs(intent.legs)}
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>debit ${intent.max_debit_usd}</span>
                      <span>loss ${intent.max_loss_usd}</span>
                      {intent.expiry && <span>exp {intent.expiry}</span>}
                      <span>{new Date(intent.created_at).toLocaleString()}</span>
                    </div>
                    {intent.rejection_reason && (
                      <p className="text-xs text-red-500">{intent.rejection_reason}</p>
                    )}
                  </div>

                  <div className="flex gap-2 shrink-0">
                    {intent.status === 'draft' && (
                      <Button
                        size="sm"
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

        {/* Execution audit log */}
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
                  {auditLog.map(entry => (
                    <div key={entry.id} className="px-5 py-3 flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono font-medium">{entry.action}</span>
                          {entry.intent_id && (
                            <span className="text-xs text-muted-foreground font-mono truncate">
                              intent:{entry.intent_id.slice(0, 8)}…
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(entry.created_at).toLocaleString()}
                        </p>
                        {entry.details && Object.keys(entry.details).length > 0 && (
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

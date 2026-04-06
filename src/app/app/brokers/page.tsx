'use client';

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle,
  Clock,
  ExternalLink,
  HelpCircle,
  Loader2,
  Lock,
  Plus,
  RefreshCw,
  Trash2,
  Wifi,
  WifiOff,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  listBrokerConnections,
  connectBroker,
  removeBrokerConnection,
  getBrokerAccountSummary,
  syncBrokerAccount,
  getSupportedBrokers,
  type BrokerConnection,
} from '@/lib/api/portfolio';

const STATUS_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  connected:    { icon: CheckCircle,  label: 'Connected',    color: 'text-green-600' },
  pending:      { icon: Clock,        label: 'Pending Setup', color: 'text-yellow-600' },
  disconnected: { icon: WifiOff,      label: 'Disconnected', color: 'text-muted-foreground' },
  error:        { icon: XCircle,      label: 'Error',        color: 'text-destructive' },
};

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Pick your broker',
    desc: 'Click "+ Add Broker" and select your brokerage from the list of supported platforms.',
  },
  {
    step: '2',
    title: 'Authorize read-only access',
    desc: "Log in to your broker's website and grant SSB permission to view your account. SSB can never place trades, move money, or change settings — read-only only.",
  },
  {
    step: '3',
    title: 'Sync & view your data',
    desc: 'Once authorized, click "Sync" to pull your account summary, positions, and P&L into SSB.',
  },
];

export default function BrokersPage() {
  const [connections, setConnections] = useState<BrokerConnection[]>([]);
  const [supported, setSupported] = useState<{ key: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<Record<string, Record<string, unknown>>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [conns, sup] = await Promise.all([
        listBrokerConnections(),
        getSupportedBrokers(),
      ]);
      setConnections(conns);
      setSupported(sup.brokers);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load broker connections');
    } finally {
      setLoading(false);
    }
  }

  async function handleConnect(brokerKey: string, brokerName: string) {
    setConnecting(brokerKey);
    try {
      const conn = await connectBroker({ broker_name: brokerKey, display_name: brokerName });
      setConnections(prev => [conn, ...prev]);
      setShowAdd(false);
      setShowHelp(false);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to connect broker');
    } finally {
      setConnecting(null);
    }
  }

  async function handleSync(id: string) {
    setSyncing(id);
    try {
      await syncBrokerAccount(id);
      const summary = await getBrokerAccountSummary(id);
      setSummaries(prev => ({ ...prev, [id]: summary }));
      setConnections(prev => prev.map(c =>
        c.id === id ? { ...c, last_sync_at: new Date().toISOString() } : c
      ));
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Sync failed');
    } finally {
      setSyncing(null);
    }
  }

  async function handleRemove(id: string) {
    await removeBrokerConnection(id);
    setConnections(prev => prev.filter(c => c.id !== id));
    setSummaries(prev => { const n = { ...prev }; delete n[id]; return n; });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const connectedBrokerKeys = new Set(connections.map(c => c.broker_name));

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Broker Connections</h1>
          <p className="text-muted-foreground text-sm mt-1">
            View your real brokerage accounts inside SSB. Read-only — SSB can never place trades or move funds.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHelp(v => !v)}
          >
            <HelpCircle className="h-4 w-4 mr-1.5" />
            How it works
          </Button>
          <Button onClick={() => { setShowAdd(v => !v); setShowHelp(false); }} size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Broker
          </Button>
        </div>
      </div>

      {/* Security banner */}
      <div className="rounded-lg border border-blue-300 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800 p-3 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
        <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <span>
          <strong>Your account is always safe.</strong> SSB connects with read-only access only.
          We cannot execute orders, transfer funds, or change anything at your broker. You can
          revoke access at any time directly from your broker&apos;s security settings.
        </span>
      </div>

      {/* How it works panel */}
      {showHelp && (
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <h2 className="font-semibold text-base">How to connect your broker — 3 steps</h2>
          <div className="space-y-3">
            {HOW_IT_WORKS.map(item => (
              <div key={item.step} className="flex gap-4">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {item.step}
                </div>
                <div>
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 text-xs text-amber-800 dark:text-amber-300">
            <strong>Early Access Note:</strong> Direct OAuth (one-click login) is coming soon for all brokers.
            Until then, adding a broker registers your intent — click <strong>Sync</strong> after completing
            any required setup steps directly on your broker&apos;s website.
          </div>
          <Button variant="outline" size="sm" onClick={() => { setShowHelp(false); setShowAdd(true); }}>
            Got it — add a broker
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Add broker panel */}
      {showAdd && (
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <div>
            <h2 className="font-semibold">Select your broker</h2>
            <p className="text-xs text-muted-foreground mt-1">
              After selecting, SSB will register the connection. You&apos;ll then need to complete
              authorization on your broker&apos;s website, then come back and click <strong>Sync</strong>.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {supported.map(broker => {
              const alreadyConnected = connectedBrokerKeys.has(broker.key);
              return (
                <button
                  key={broker.key}
                  onClick={() => !alreadyConnected && handleConnect(broker.key, broker.name)}
                  disabled={alreadyConnected || connecting === broker.key}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg border p-3 text-sm transition-colors text-left',
                    alreadyConnected
                      ? 'bg-muted/30 text-muted-foreground cursor-default'
                      : 'hover:bg-muted/50 hover:border-primary/40 cursor-pointer',
                  )}
                >
                  {connecting === broker.key ? (
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                  ) : (
                    <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium leading-tight">{broker.name}</p>
                    {alreadyConnected
                      ? <p className="text-[10px] text-muted-foreground">Already added</p>
                      : <p className="text-[10px] text-muted-foreground">Click to add</p>
                    }
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            Don&apos;t see your broker?{' '}
            <span className="text-primary">More brokers are being added — check back soon.</span>
          </p>
        </div>
      )}

      {/* Empty state */}
      {connections.length === 0 ? (
        <div className="rounded-xl border bg-muted/20 py-14 text-center px-8 space-y-4">
          <Wifi className="h-10 w-10 mx-auto text-muted-foreground" />
          <div>
            <p className="font-semibold mb-1">No brokers connected yet</p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Connect your brokerage account to view your portfolio, positions, and P&amp;L
              alongside your SSB analysis — all in one place.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Button size="sm" variant="outline" onClick={() => setShowHelp(true)}>
              <HelpCircle className="h-4 w-4 mr-1.5" />
              See how it works
            </Button>
            <Button size="sm" onClick={() => setShowAdd(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Add your first broker
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {connections.map(conn => {
            const status = STATUS_CONFIG[conn.connection_status] || STATUS_CONFIG.disconnected;
            const StatusIcon = status.icon;
            const summary = summaries[conn.id] as any;

            return (
              <div key={conn.id} className="rounded-xl border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="font-semibold leading-tight">{conn.display_name || conn.broker_name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <StatusIcon className={cn('h-3.5 w-3.5', status.color)} />
                        <span className={cn('text-xs', status.color)}>{status.label}</span>
                        {conn.last_sync_at && (
                          <span className="text-xs text-muted-foreground">
                            · synced {new Date(conn.last_sync_at).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSync(conn.id)}
                      disabled={syncing === conn.id}
                      title="Pull latest account data from your broker"
                    >
                      {syncing === conn.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <RefreshCw className="h-3.5 w-3.5" />
                      }
                      <span className="ml-1.5 text-xs hidden sm:inline">Sync</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemove(conn.id)}
                      title="Remove this broker connection"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Pending state — clear step-by-step */}
                {conn.connection_status === 'pending' && (
                  <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 space-y-2">
                    <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-300">
                      Action required — 2 steps to finish setup:
                    </p>
                    <ol className="space-y-1.5 text-xs text-yellow-800 dark:text-yellow-300">
                      <li className="flex items-start gap-2">
                        <span className="font-bold shrink-0">1.</span>
                        <span>
                          Log in to <strong>{conn.display_name}</strong>&apos;s website and navigate to
                          {' '}Settings → Linked Apps (or Security → Third-Party Access) and authorize
                          read-only data access for Smart Strategies Builder.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold shrink-0">2.</span>
                        <span>
                          Once authorized on {conn.display_name}&apos;s side, come back here and click
                          {' '}<strong>Sync</strong> (the refresh icon above) to load your account data.
                        </span>
                      </li>
                    </ol>
                    <p className="text-[10px] text-yellow-700 dark:text-yellow-400 mt-1">
                      Not sure where to find Third-Party Access settings? Search &ldquo;{conn.display_name} linked apps&rdquo;
                      {' '}for step-by-step instructions on their support site.
                    </p>
                  </div>
                )}

                {/* Error state */}
                {conn.connection_status === 'error' && conn.error_message && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-xs text-destructive">
                    <strong>Connection error:</strong> {conn.error_message}
                    {' '}Try clicking <strong>Sync</strong> again, or remove and re-add this broker.
                  </div>
                )}

                {/* Account summary after sync */}
                {summary?.account_summary && (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                      { label: 'Total Value', value: `$${summary.account_summary.total_value?.toLocaleString()}` },
                      { label: 'Cash', value: `$${summary.account_summary.cash?.toLocaleString()}` },
                      { label: 'Day P&L', value: `$${Math.abs(summary.account_summary.day_pnl)?.toLocaleString()}`, color: summary.account_summary.day_pnl >= 0 ? 'text-green-600' : 'text-red-600' },
                      { label: 'Unrealized P&L', value: `$${Math.abs(summary.account_summary.unrealized_pnl)?.toLocaleString()}`, color: summary.account_summary.unrealized_pnl >= 0 ? 'text-green-600' : 'text-red-600' },
                    ].map(stat => (
                      <div key={stat.label} className="rounded-lg bg-muted/30 p-2.5">
                        <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                        <p className={cn('text-sm font-bold tabular-nums', stat.color)}>{stat.value}</p>
                      </div>
                    ))}
                  </div>
                )}

                {summary?.disclaimer && (
                  <p className="text-[10px] text-muted-foreground">{summary.disclaimer}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

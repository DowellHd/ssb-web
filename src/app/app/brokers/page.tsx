'use client';

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Building2,
  CheckCircle,
  Clock,
  Construction,
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
  connected:    { icon: CheckCircle,  label: 'Connected',     color: 'text-green-600' },
  pending:      { icon: Clock,        label: 'Coming Soon',   color: 'text-yellow-600' },
  disconnected: { icon: WifiOff,      label: 'Disconnected',  color: 'text-muted-foreground' },
  error:        { icon: XCircle,      label: 'Error',         color: 'text-destructive' },
};

const COMING_SOON_BROKERS = [
  { key: 'robinhood',   name: 'Robinhood',         eta: 'Q3 2026' },
  { key: 'fidelity',    name: 'Fidelity',           eta: 'Q3 2026' },
  { key: 'schwab',      name: 'Charles Schwab',     eta: 'Q3 2026' },
  { key: 'tdameritrade',name: 'TD Ameritrade',      eta: 'Q4 2026' },
  { key: 'etrade',      name: 'E*TRADE',            eta: 'Q4 2026' },
  { key: 'ibkr',        name: 'Interactive Brokers',eta: 'Q4 2026' },
  { key: 'webull',      name: 'Webull',             eta: 'Q4 2026' },
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
      setError(err?.response?.data?.detail || 'Failed to load');
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
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to register broker');
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
        <Button onClick={() => setShowAdd(v => !v)} size="sm" className="shrink-0">
          <Plus className="h-4 w-4 mr-1.5" />
          Add Broker
        </Button>
      </div>

      {/* Honest "in development" banner */}
      <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700 p-4 space-y-1">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
          <Construction className="h-4 w-4 shrink-0" />
          <strong className="text-sm">Live broker sync is in development</strong>
        </div>
        <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
          Real-time account data requires SSB to complete OAuth registration with each broker — a process
          that takes several months of engineering and compliance review per broker. We&apos;re actively
          building this. For now, you can <strong>register your broker intent</strong> below so your
          connection is ready the moment the integration goes live.
        </p>
      </div>

      {/* Security note */}
      <div className="rounded-lg border border-blue-300 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800 p-3 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
        <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <span>
          When live, SSB will use <strong>read-only OAuth</strong> — we cannot execute orders, transfer
          funds, or change anything at your broker. You can revoke access at any time from your broker&apos;s
          security settings.
        </span>
      </div>

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
            <h2 className="font-semibold">Register a broker</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Registering your broker saves your preference. When the live OAuth integration for your
              broker launches, your connection will activate automatically — no re-setup required.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {supported.map(broker => {
              const alreadyConnected = connectedBrokerKeys.has(broker.key);
              const eta = COMING_SOON_BROKERS.find(b => b.key === broker.key)?.eta;
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
                    <p className="text-[10px] text-muted-foreground">
                      {alreadyConnected ? 'Already registered' : eta ? `Est. ${eta}` : 'Coming soon'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* What to expect when live */}
      <div className="rounded-xl border bg-card p-5 space-y-3">
        <h2 className="font-semibold text-sm">What live broker sync will do</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: '📊', title: 'Portfolio snapshot', desc: 'See total value, cash, and positions synced from your real account' },
            { icon: '📈', title: 'P&L tracking', desc: 'Day P&L and unrealized gains/losses pulled directly from your broker' },
            { icon: '🔒', title: 'Read-only, always', desc: 'OAuth read-only scope — SSB cannot touch your money or place trades' },
          ].map(item => (
            <div key={item.title} className="rounded-lg bg-muted/20 p-3 space-y-1">
              <p className="text-lg">{item.icon}</p>
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Registered connections */}
      {connections.length === 0 ? (
        <div className="rounded-xl border bg-muted/20 py-12 text-center px-8 space-y-3">
          <Wifi className="h-10 w-10 mx-auto text-muted-foreground" />
          <div>
            <p className="font-semibold mb-1">No brokers registered yet</p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Register your broker now to be first in line when live sync launches.
            </p>
          </div>
          <Button size="sm" onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Register a broker
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground font-medium">Registered brokers ({connections.length})</p>
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
                            · last synced {new Date(conn.last_sync_at).toLocaleTimeString()}
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
                      title="Load demo account data"
                    >
                      {syncing === conn.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <RefreshCw className="h-3.5 w-3.5" />
                      }
                      <span className="ml-1.5 text-xs hidden sm:inline">Preview data</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemove(conn.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Pending — honest messaging */}
                {conn.connection_status === 'pending' && (
                  <div className="rounded-lg bg-muted/30 border p-3 text-xs text-muted-foreground space-y-1">
                    <p className="font-medium text-foreground">Registered — waiting for integration launch</p>
                    <p>
                      SSB is not yet registered as an OAuth app with {conn.display_name}. Once our
                      integration goes live, you&apos;ll receive a notification and this connection will
                      activate automatically. No action needed on {conn.display_name}&apos;s side right now.
                    </p>
                    <p className="text-[10px]">
                      Want to see what the data view will look like? Click <strong>Preview data</strong> to
                      load a simulated account summary.
                    </p>
                  </div>
                )}

                {/* Demo summary */}
                {summary?.account_summary && (
                  <>
                    <div className="flex items-center gap-1.5 text-[10px] text-amber-600 dark:text-amber-400">
                      <AlertCircle className="h-3 w-3" />
                      Simulated demo data — not your real account
                    </div>
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
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

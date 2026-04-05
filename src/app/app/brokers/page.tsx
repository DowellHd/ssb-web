'use client';

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Building2,
  CheckCircle,
  Clock,
  ExternalLink,
  Loader2,
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Broker Connections</h1>
          <p className="text-muted-foreground text-sm mt-1">
            View your brokerage accounts in one place. Read-only — SSB cannot place trades.
          </p>
        </div>
        <Button onClick={() => setShowAdd(v => !v)} size="sm" className="shrink-0">
          <Plus className="h-4 w-4 mr-1.5" />
          Add Broker
        </Button>
      </div>

      <div className="rounded-lg border border-blue-300 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800 p-3 text-xs text-blue-800 dark:text-blue-300">
        <strong>Read-Only Access:</strong> All broker integrations are strictly read-only. SSB cannot
        execute orders, transfer funds, or modify your account in any way. You retain full control
        at your broker.
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Add broker panel */}
      {showAdd && (
        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold mb-4">Connect a Broker</h2>
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
                    {alreadyConnected && <p className="text-[10px] text-muted-foreground">Already connected</p>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Connection list */}
      {connections.length === 0 ? (
        <div className="rounded-xl border bg-muted/20 py-16 text-center">
          <Wifi className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="font-medium mb-1">No brokers connected</p>
          <p className="text-sm text-muted-foreground">Add a broker connection to view your accounts here.</p>
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
                    >
                      {syncing === conn.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
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

                {conn.connection_status === 'pending' && (
                  <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 text-xs text-yellow-800 dark:text-yellow-300">
                    Complete OAuth setup with {conn.display_name} to enable account viewing.
                    Click "Sync" to load account data after completing setup with your broker.
                  </div>
                )}

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

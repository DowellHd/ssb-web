'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import {
  AlertCircle,
  Building2,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Lock,
  Plus,
  RefreshCw,
  Trash2,
  TrendingUp,
  Wallet,
  WifiOff,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  listBrokerConnections,
  removeBrokerConnection,
  syncBrokerAccount,
  getBrokerHoldings,
  createPlaidLinkToken,
  exchangePlaidToken,
  type BrokerConnection,
  type PlaidHolding,
  type PlaidAccount,
} from '@/lib/api/portfolio';

const STATUS_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  connected:    { icon: CheckCircle, label: 'Connected',    color: 'text-green-600' },
  error:        { icon: XCircle,     label: 'Error',        color: 'text-destructive' },
  disconnected: { icon: WifiOff,     label: 'Disconnected', color: 'text-muted-foreground' },
  pending:      { icon: WifiOff,     label: 'Pending',      color: 'text-muted-foreground' },
};

// ── Plaid Link button ──────────────────────────────────────────────────────────

function PlaidConnectButton({ onSuccess }: { onSuccess: () => void }) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loadingToken, setLoadingToken] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchToken = useCallback(async () => {
    setLoadingToken(true);
    setError(null);
    try {
      const { link_token } = await createPlaidLinkToken();
      setLinkToken(link_token);
    } catch {
      setError('Failed to start connection. Please try again.');
    } finally {
      setLoadingToken(false);
    }
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken ?? '',
    onSuccess: async (public_token, metadata) => {
      try {
        await exchangePlaidToken({
          public_token,
          institution_name: metadata.institution?.name ?? 'Unknown',
          institution_id: metadata.institution?.institution_id ?? '',
        });
        onSuccess();
      } catch {
        setError('Failed to complete connection. Please try again.');
      }
    },
    onExit: () => {
      // User closed the modal — reset token so they can retry
      setLinkToken(null);
    },
  });

  // Auto-open once token is ready
  useEffect(() => {
    if (linkToken && ready) {
      open();
    }
  }, [linkToken, ready, open]);

  return (
    <div>
      <Button
        onClick={fetchToken}
        disabled={loadingToken}
        size="sm"
      >
        {loadingToken
          ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
          : <Plus className="h-4 w-4 mr-1.5" />
        }
        Connect a broker
      </Button>
      {error && (
        <p className="text-xs text-destructive mt-2">{error}</p>
      )}
    </div>
  );
}

// ── Holdings table ─────────────────────────────────────────────────────────────

function HoldingsPanel({ connectionId }: { connectionId: string }) {
  const [holdings, setHoldings] = useState<PlaidHolding[] | null>(null);
  const [accounts, setAccounts] = useState<PlaidAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  async function load() {
    if (holdings) { setExpanded(e => !e); return; }
    setLoading(true);
    setExpanded(true);
    try {
      const data = await getBrokerHoldings(connectionId);
      setHoldings(data.holdings);
      setAccounts(data.accounts);
    } catch {
      setError('Failed to load holdings');
    } finally {
      setLoading(false);
    }
  }

  const totalValue = holdings?.reduce((s, h) => s + h.institution_value, 0) ?? 0;

  return (
    <div>
      <button
        onClick={load}
        className="flex items-center gap-1.5 text-xs text-primary hover:underline"
      >
        <TrendingUp className="h-3.5 w-3.5" />
        {holdings ? (expanded ? 'Hide' : 'Show') : 'Load'} holdings
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {loading && (
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Fetching from Plaid…
        </div>
      )}

      {error && (
        <p className="mt-2 text-xs text-destructive">{error}</p>
      )}

      {expanded && holdings && (
        <div className="mt-3 space-y-3">
          {/* Account balances */}
          {accounts.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {accounts.slice(0, 4).map(a => (
                <div key={a.account_id} className="rounded-lg bg-muted/30 p-2.5">
                  <p className="text-[10px] text-muted-foreground truncate">{a.name}</p>
                  <p className="text-sm font-bold tabular-nums">
                    ${a.current.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-muted-foreground capitalize">{a.subtype}</p>
                </div>
              ))}
            </div>
          )}

          {/* Holdings table */}
          {holdings.length > 0 ? (
            <div className="rounded-lg border overflow-hidden">
              <div className="grid grid-cols-4 gap-2 px-3 py-2 bg-muted/30 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                <span>Symbol</span>
                <span className="text-right">Qty</span>
                <span className="text-right">Price</span>
                <span className="text-right">Value</span>
              </div>
              <div className="divide-y">
                {holdings.map((h, i) => {
                  const gainLoss = h.cost_basis !== null
                    ? h.institution_value - h.cost_basis * h.quantity
                    : null;
                  return (
                    <div key={i} className="grid grid-cols-4 gap-2 px-3 py-2 text-xs hover:bg-muted/20">
                      <div>
                        <p className="font-semibold">{h.symbol}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{h.name}</p>
                      </div>
                      <p className="text-right tabular-nums">{h.quantity.toFixed(4)}</p>
                      <p className="text-right tabular-nums">${h.institution_price.toFixed(2)}</p>
                      <div className="text-right">
                        <p className="tabular-nums font-medium">${h.institution_value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                        {gainLoss !== null && (
                          <p className={cn('text-[10px] tabular-nums', gainLoss >= 0 ? 'text-green-600' : 'text-red-500')}>
                            {gainLoss >= 0 ? '+' : ''}${gainLoss.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="px-3 py-2 bg-muted/20 flex justify-between text-xs font-semibold">
                <span>{holdings.length} positions</span>
                <span>${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No investment holdings found in this account.</p>
          )}

          <p className="text-[10px] text-muted-foreground">
            Data provided by Plaid. SSB is read-only and cannot execute trades.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function BrokersPage() {
  const [connections, setConnections] = useState<BrokerConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [syncResults, setSyncResults] = useState<Record<string, { total_balance: number; holding_count: number }>>({});

  useEffect(() => { loadConnections(); }, []);

  async function loadConnections() {
    setLoading(true);
    try {
      setConnections(await listBrokerConnections());
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load connections');
    } finally {
      setLoading(false);
    }
  }

  async function handleSync(id: string) {
    setSyncing(id);
    try {
      const result = await syncBrokerAccount(id);
      setSyncResults(prev => ({ ...prev, [id]: result }));
      setConnections(prev => prev.map(c =>
        c.id === id ? { ...c, last_sync_at: new Date().toISOString(), connection_status: 'connected' } : c
      ));
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Sync failed');
    } finally {
      setSyncing(null);
    }
  }

  async function handleRemove(id: string) {
    try {
      await removeBrokerConnection(id);
      setConnections(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to remove connection');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Broker Connections</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Connect your real brokerage accounts via Plaid to view holdings and balances in SSB.
          </p>
        </div>
        <PlaidConnectButton onSuccess={loadConnections} />
      </div>

      {/* Security banner */}
      <div className="rounded-lg border border-blue-300 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800 p-3 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
        <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <span>
          <strong>Read-only, always.</strong> SSB uses Plaid&apos;s read-only OAuth — we cannot
          execute orders, transfer funds, or change anything at your broker. Revoke access at any
          time from your broker&apos;s security settings or Plaid&apos;s{' '}
          <a href="https://my.plaid.com" target="_blank" rel="noopener noreferrer" className="underline">
            Connected Apps portal
          </a>.
        </span>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
          <button className="ml-auto text-xs underline" onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {/* Empty state */}
      {connections.length === 0 ? (
        <div className="rounded-xl border bg-muted/20 py-14 text-center px-8 space-y-4">
          <Wallet className="h-10 w-10 mx-auto text-muted-foreground" />
          <div>
            <p className="font-semibold mb-1">No broker accounts connected</p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Click <strong>Connect a broker</strong> to securely link your brokerage via Plaid.
              You&apos;ll be able to search 12,000+ institutions including Robinhood, Fidelity, Schwab, and more.
            </p>
          </div>
          <PlaidConnectButton onSuccess={loadConnections} />
        </div>
      ) : (
        <div className="space-y-3">
          {connections.map(conn => {
            const status = STATUS_CONFIG[conn.connection_status] || STATUS_CONFIG.disconnected;
            const StatusIcon = status.icon;
            const syncResult = syncResults[conn.id];

            return (
              <div key={conn.id} className="rounded-xl border bg-card p-4 space-y-4">
                {/* Header row */}
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
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Sync summary */}
                {syncResult && (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
                    <div className="rounded-lg bg-muted/30 p-2.5">
                      <p className="text-[10px] text-muted-foreground">Total Balance</p>
                      <p className="text-sm font-bold tabular-nums">
                        ${syncResult.total_balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-2.5">
                      <p className="text-[10px] text-muted-foreground">Holdings</p>
                      <p className="text-sm font-bold">{syncResult.holding_count} positions</p>
                    </div>
                  </div>
                )}

                {/* Error state */}
                {conn.connection_status === 'error' && conn.error_message && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-xs text-destructive">
                    <strong>Connection error:</strong> {conn.error_message}
                  </div>
                )}

                {/* Holdings drill-down */}
                {conn.connection_status === 'connected' && (
                  <HoldingsPanel connectionId={conn.id} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

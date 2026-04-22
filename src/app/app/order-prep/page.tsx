'use client';

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle,
  ClipboardList,
  ExternalLink,
  Loader2,
  Plus,
  Shield,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  createOrderTicket,
  listOrderTickets,
  getPortfolioSummary,
  type OrderTicket,
  type PlaidHolding,
} from '@/lib/api/portfolio';

const ORDER_TYPES = ['market', 'limit', 'stop', 'stop_limit', 'oco', 'bracket'];

// Holdings from broker — used for "From Holdings" pre-fill
interface HoldingOption {
  symbol: string;
  quantity: number;
  broker: string;
}

export default function OrderPrepPage() {
  const [tickets, setTickets] = useState<OrderTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<OrderTicket | null>(null);
  const [holdings, setHoldings] = useState<HoldingOption[]>([]);
  const [holdingsLoading, setHoldingsLoading] = useState(false);
  const [showHoldingsPicker, setShowHoldingsPicker] = useState(false);

  const [form, setForm] = useState({
    symbol: '',
    order_type: 'limit',
    direction: 'buy',
    quantity: '',
    limit_price: '',
    stop_price: '',
    notes: '',
  });

  useEffect(() => {
    loadTickets();
  }, []);

  async function loadTickets() {
    setLoading(true);
    try {
      const data = await listOrderTickets();
      setTickets(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }

  async function loadHoldings() {
    setHoldingsLoading(true);
    try {
      const summary = await getPortfolioSummary();
      // We need per-holding detail — re-fetch from connections via portfolio-summary
      // The summary only has sector data; we need to call the brokers holdings endpoint.
      // For simplicity: use the cached_holdings via the summary connections list.
      // Actually getPortfolioSummary doesn't return individual holdings list.
      // We'll use the brokers list endpoint and aggregate from connection-level data.
      // getPortfolioSummary gives connections with holding_count — so let's also just
      // fetch per-connection holdings. For now, build from portfolio-summary + a second call.
      // Simpler: add a flat holdings endpoint later. For now, use the summary to show symbols.
      // We'll make a holdings list by fetching each connection's holdings.
      const { listBrokerConnections, getBrokerHoldings } = await import('@/lib/api/portfolio');
      const connections = await listBrokerConnections();
      const allHoldings: HoldingOption[] = [];
      for (const conn of connections.filter(c => c.connection_status === 'connected')) {
        try {
          const data = await getBrokerHoldings(conn.id);
          for (const h of data.holdings) {
            allHoldings.push({
              symbol: h.symbol,
              quantity: h.quantity,
              broker: conn.display_name || conn.broker_name,
            });
          }
        } catch {
          // Skip failed connections
        }
      }
      setHoldings(allHoldings);
      setShowHoldingsPicker(true);
    } catch {
      // No broker connections or error — just open form empty
      setShowHoldingsPicker(false);
    } finally {
      setHoldingsLoading(false);
    }
  }

  function prefillFromHolding(h: HoldingOption) {
    setForm(f => ({
      ...f,
      symbol: h.symbol,
      quantity: h.quantity.toString(),
      direction: 'sell',
    }));
    setShowHoldingsPicker(false);
    setShowForm(true);
  }

  async function handleCreate() {
    if (!form.symbol || !form.quantity) return;
    setCreating(true);
    setError(null);
    try {
      const ticket = await createOrderTicket({
        symbol: form.symbol.toUpperCase(),
        order_type: form.order_type,
        direction: form.direction,
        quantity: parseFloat(form.quantity),
        limit_price: form.limit_price ? parseFloat(form.limit_price) : undefined,
        stop_price: form.stop_price ? parseFloat(form.stop_price) : undefined,
        notes: form.notes || undefined,
      });
      setTickets(prev => [ticket, ...prev]);
      setSelectedTicket(ticket);
      setShowForm(false);
      setForm({ symbol: '', order_type: 'limit', direction: 'buy', quantity: '', limit_price: '', stop_price: '', notes: '' });
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to create order ticket');
    } finally {
      setCreating(false);
    }
  }

  const tca = selectedTicket?.tca_estimate as any;
  const compliance = selectedTicket?.compliance_check as any;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Disclaimer */}
      <div className="rounded-lg bg-amber-50 border border-amber-300 p-4 text-sm text-slate-800">
        <strong>Disclaimer:</strong> Order preparation tools are for informational purposes only.
        SSB does not execute trades. This is not investment advice. Always do your own research.
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Order Preparation</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Prepare orders with trade cost analysis and send them to your broker. SSB does not execute trades.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            onClick={async () => { setShowForm(false); await loadHoldings(); }}
            size="sm"
            variant="outline"
            disabled={holdingsLoading}
          >
            {holdingsLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <TrendingUp className="h-4 w-4 mr-1.5" />}
            From Holdings
          </Button>
          <Button onClick={() => { setShowHoldingsPicker(false); setShowForm(v => !v); }} size="sm" className="shrink-0">
            <Plus className="h-4 w-4 mr-1.5" />
            New Order Ticket
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-blue-300 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800 p-3 text-xs text-blue-800 dark:text-blue-300">
        <strong>No Execution:</strong> SSB prepares and analyzes orders only. All "Send to Broker" links
        open your broker's website — no orders are placed through SSB.
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Holdings picker — pre-fill from real portfolio */}
      {showHoldingsPicker && (
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm">Select a holding to pre-fill</p>
            <button onClick={() => setShowHoldingsPicker(false)} className="text-xs text-muted-foreground hover:text-foreground">
              Dismiss
            </button>
          </div>
          {holdings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No connected broker holdings found. Connect a broker first.</p>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-1.5">
              {holdings.map((h, i) => (
                <button
                  key={`${h.symbol}-${i}`}
                  onClick={() => prefillFromHolding(h)}
                  className="flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-sm hover:bg-muted/40 transition-colors text-left"
                >
                  <div>
                    <span className="font-semibold">{h.symbol}</span>
                    <span className="text-xs text-muted-foreground ml-2">{h.broker}</span>
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">{h.quantity} shares</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Order form */}
      {showForm && (
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <h2 className="font-semibold">New Order Ticket</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Symbol</label>
              <input
                value={form.symbol}
                onChange={e => setForm(f => ({ ...f, symbol: e.target.value }))}
                placeholder="AAPL"
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 uppercase"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Quantity</label>
              <input
                value={form.quantity}
                onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                placeholder="100"
                type="number"
                min="0"
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Direction</label>
              <select
                value={form.direction}
                onChange={e => setForm(f => ({ ...f, direction: e.target.value }))}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Order Type</label>
              <select
                value={form.order_type}
                onChange={e => setForm(f => ({ ...f, order_type: e.target.value }))}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 capitalize"
              >
                {ORDER_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ').toUpperCase()}</option>)}
              </select>
            </div>
            {['limit', 'stop_limit', 'oco', 'bracket'].includes(form.order_type) && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">Limit Price</label>
                <input
                  value={form.limit_price}
                  onChange={e => setForm(f => ({ ...f, limit_price: e.target.value }))}
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            )}
            {['stop', 'stop_limit', 'oco', 'bracket'].includes(form.order_type) && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">Stop Price</label>
                <input
                  value={form.stop_price}
                  onChange={e => setForm(f => ({ ...f, stop_price: e.target.value }))}
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Trade rationale..."
              rows={2}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreate} disabled={creating || !form.symbol || !form.quantity}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ClipboardList className="h-4 w-4 mr-2" />}
              Prepare Order + Run TCA
            </Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Selected ticket detail */}
      {selectedTicket && (
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Order Ticket — {selectedTicket.symbol}</h2>
            <span className={cn('ml-auto rounded-full px-2 py-0.5 text-xs font-semibold capitalize', selectedTicket.direction === 'buy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
              {selectedTicket.direction}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: 'Order Type', value: selectedTicket.order_type.replace('_', ' ').toUpperCase() },
              { label: 'Quantity', value: selectedTicket.quantity.toString() },
              { label: 'Limit Price', value: selectedTicket.limit_price ? `$${selectedTicket.limit_price}` : '—' },
              { label: 'Stop Price', value: selectedTicket.stop_price ? `$${selectedTicket.stop_price}` : '—' },
            ].map(s => (
              <div key={s.label} className="rounded-lg bg-muted/30 p-2.5">
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
                <p className="text-sm font-semibold">{s.value}</p>
              </div>
            ))}
          </div>

          {/* TCA */}
          {tca && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" /> Trade Cost Analysis
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mb-3">
                {[
                  { label: 'Spread Cost', value: `$${tca.spread_cost_usd?.toFixed(2)}` },
                  { label: 'Market Impact', value: `$${tca.market_impact_usd?.toFixed(2)}` },
                  { label: 'Total Cost', value: `$${tca.total_cost_usd?.toFixed(2)}` },
                  { label: 'Total (bps)', value: `${tca.total_cost_bps?.toFixed(1)} bps` },
                ].map(s => (
                  <div key={s.label} className="rounded-lg bg-muted/30 p-2.5">
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                    <p className="text-sm font-semibold tabular-nums">{s.value}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Best execution window: <strong>{tca.best_execution_time}</strong></p>
            </div>
          )}

          {/* Compliance */}
          {compliance && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" /> Pre-Trade Compliance
              </p>
              <div className="space-y-1.5">
                {compliance.checks?.map((c: any) => (
                  <div key={c.check} className="flex items-center gap-2 text-sm">
                    {c.status === 'pass' ? (
                      <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                    )}
                    <span>{c.check}</span>
                  </div>
                ))}
                {compliance.warnings?.map((w: string, i: number) => (
                  <p key={i} className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded p-2">{w}</p>
                ))}
              </div>
            </div>
          )}

          {/* Send to broker */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <ArrowUpRight className="h-3.5 w-3.5" /> Send to Broker
            </p>
            <p className="text-xs text-muted-foreground mb-2">
              These links open your broker's website. SSB does not execute orders.
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(selectedTicket.broker_links).map(([name, url]) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
                >
                  {name}
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tickets list */}
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-3">Recent Tickets ({tickets.length})</p>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="rounded-xl border bg-muted/20 py-12 text-center">
            <ClipboardList className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No order tickets yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tickets.map(ticket => (
              <button
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={cn(
                  'w-full flex items-center justify-between rounded-lg border p-3 text-sm text-left transition-colors hover:bg-muted/30',
                  selectedTicket?.id === ticket.id && 'border-primary/50 bg-primary/5',
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{ticket.symbol}</span>
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize', ticket.direction === 'buy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                    {ticket.direction}
                  </span>
                  <span className="text-muted-foreground">{ticket.order_type.replace('_', ' ')} · {ticket.quantity} shares</span>
                </div>
                <span className="text-xs text-muted-foreground">{new Date(ticket.created_at).toLocaleDateString()}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

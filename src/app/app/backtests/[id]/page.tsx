'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart2,
  AlertTriangle,
  Clock,
  Download,
  Trash2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
} from 'recharts';
import {
  getBacktest,
  getEquityCurve,
  getBacktestTrades,
  getBacktestBenchmark,
  deleteBacktest,
  exportBacktestCSV,
  type BacktestDetails,
  type BenchmarkPoint,
  type EquityCurvePoint,
  type BacktestTrade,
} from '@/lib/api/backtests';
import { safeToFixed } from '@/lib/utils';

const STRATEGY_LABELS: Record<string, string> = {
  buy_and_hold: 'Buy & Hold',
  sma_crossover: 'SMA Crossover',
  rsi_mean_reversion: 'RSI Mean Reversion',
  momentum: 'Momentum',
};

function MetricCard({
  label,
  value,
  sub,
  positive,
}: {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p
        className={`text-xl font-bold ${
          positive === true
            ? 'text-green-500'
            : positive === false
              ? 'text-red-500'
              : ''
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatChartDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function BacktestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [backtest, setBacktest] = useState<BacktestDetails | null>(null);
  const [curve, setCurve] = useState<EquityCurvePoint[]>([]);
  const [trades, setTrades] = useState<BacktestTrade[]>([]);
  const [benchmark, setBenchmark] = useState<BenchmarkPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const bt = await getBacktest(id);
        setBacktest(bt);
        if (bt.status === 'completed') {
          const [curveData, tradesData, benchData] = await Promise.allSettled([
            getEquityCurve(id),
            getBacktestTrades(id),
            getBacktestBenchmark(id, 'SPY'),
          ]);
          if (curveData.status === 'fulfilled') setCurve(curveData.value.curve);
          if (tradesData.status === 'fulfilled') setTrades(tradesData.value.trades);
          if (benchData.status === 'fulfilled') setBenchmark(benchData.value.points);
        }
      } catch {
        setError('Failed to load backtest');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleDelete = async () => {
    if (!backtest) return;
    setDeleting(true);
    try {
      await deleteBacktest(backtest.id);
      router.push('/app/backtests');
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !backtest) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <p className="text-destructive">{error ?? 'Backtest not found'}</p>
        <Link href="/app/backtests" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Backtests
        </Link>
      </div>
    );
  }

  const returnPct = backtest.total_return_pct;
  const isPositive = returnPct != null && returnPct >= 0;
  const winRate =
    backtest.total_trades && backtest.total_trades > 0
      ? ((backtest.winning_trades ?? 0) / backtest.total_trades) * 100
      : null;

  // Chart data — merge equity curve with SPY benchmark by date
  const benchByDate = Object.fromEntries(
    benchmark.map((b) => [b.date, parseFloat(safeToFixed(b.cumulative_return * 100, 2))]),
  );
  const chartData = curve.map((pt) => ({
    date: formatChartDate(pt.date),
    equity: pt.equity,
    return_pct: parseFloat(safeToFixed(pt.cumulative_return * 100, 2)),
    drawdown_pct: parseFloat(safeToFixed(pt.drawdown * 100, 2)),
    spy_pct: benchByDate[pt.date] ?? null,
  }));

  const statusBadge = {
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    running: 'bg-blue-100 text-blue-800',
    pending: 'bg-yellow-100 text-yellow-800',
  }[backtest.status];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <Link
          href="/app/backtests"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Backtests
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <BarChart2 className="h-7 w-7 text-purple-600" />
              {backtest.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge}`}>
                {backtest.status.charAt(0).toUpperCase() + backtest.status.slice(1)}
              </span>
              <span>{STRATEGY_LABELS[backtest.strategy_type] ?? backtest.strategy_type}</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(backtest.start_date)} — {formatDate(backtest.end_date)}
              </span>
              <span>{backtest.symbols.join(', ')}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {backtest.execution_time_ms != null && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                Ran in {(backtest.execution_time_ms / 1000).toFixed(1)}s
              </div>
            )}
            {backtest.status === 'completed' && curve.length > 0 && (
              <button
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => exportBacktestCSV(backtest, trades, curve)}
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </button>
            )}
            {confirmDelete ? (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Delete this backtest?</span>
                <button
                  className="text-red-600 font-medium hover:underline disabled:opacity-50"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting…' : 'Yes, delete'}
                </button>
                <button
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-500 transition-colors"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Failed state */}
      {backtest.status === 'failed' && backtest.error_message && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          <strong>Backtest failed:</strong> {backtest.error_message}
        </div>
      )}

      {backtest.status === 'completed' && (
        <>
          {/* Metrics grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Total Return"
              value={returnPct != null ? `${safeToFixed(returnPct, 2)}%` : '—'}
              sub={backtest.total_return != null ? `$${safeToFixed(backtest.total_return, 0)}` : undefined}
              positive={returnPct != null ? isPositive : undefined}
            />
            <MetricCard
              label="Max Drawdown"
              value={backtest.max_drawdown != null ? `${safeToFixed(backtest.max_drawdown * 100, 1)}%` : '—'}
              positive={false}
            />
            <MetricCard
              label="Sharpe Ratio"
              value={backtest.sharpe_ratio != null ? safeToFixed(backtest.sharpe_ratio, 2) : '—'}
              positive={backtest.sharpe_ratio != null ? backtest.sharpe_ratio > 0 : undefined}
            />
            <MetricCard
              label="Sortino Ratio"
              value={backtest.sortino_ratio != null ? safeToFixed(backtest.sortino_ratio, 2) : '—'}
              positive={backtest.sortino_ratio != null ? backtest.sortino_ratio > 0 : undefined}
            />
            <MetricCard
              label="Annualized Vol"
              value={backtest.volatility != null ? `${safeToFixed(backtest.volatility * 100, 1)}%` : '—'}
            />
            <MetricCard
              label="Total Trades"
              value={backtest.total_trades?.toString() ?? '0'}
              sub={winRate != null ? `${safeToFixed(winRate, 0)}% win rate` : undefined}
            />
            <MetricCard
              label="Initial Capital"
              value={`$${backtest.initial_capital?.toLocaleString() ?? '—'}`}
            />
            <MetricCard
              label="Final Equity"
              value={backtest.final_equity != null ? `$${safeToFixed(backtest.final_equity, 0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` : '—'}
              positive={isPositive}
            />
          </div>

          {/* Equity curve chart */}
          {chartData.length > 1 && (
            <div className="rounded-lg border bg-card p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                {isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                Equity Curve
                <span className="text-sm font-normal text-muted-foreground">
                  (cumulative return %)
                </span>
              </h2>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="returnGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="spyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.12} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${v}%`}
                      width={52}
                    />
                    <Tooltip
                      formatter={(v: number, name: string) => [
                        `${v?.toFixed(2)}%`,
                        name === 'return_pct' ? 'Strategy' : 'SPY',
                      ]}
                      labelStyle={{ fontWeight: 600 }}
                    />
                    <Legend
                      formatter={(value) => (value === 'return_pct' ? 'Strategy' : 'SPY')}
                      iconType="line"
                      wrapperStyle={{ fontSize: 11 }}
                    />
                    <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 2" />
                    <Area
                      type="monotone"
                      dataKey="return_pct"
                      stroke={isPositive ? '#22c55e' : '#ef4444'}
                      strokeWidth={2}
                      fill="url(#returnGrad)"
                      dot={false}
                      name="return_pct"
                    />
                    {benchmark.length > 0 && (
                      <Area
                        type="monotone"
                        dataKey="spy_pct"
                        stroke="#6366f1"
                        strokeWidth={1.5}
                        strokeDasharray="5 3"
                        fill="url(#spyGrad)"
                        dot={false}
                        name="spy_pct"
                        connectNulls
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Trades table */}
          {trades.length > 0 && (
            <div className="rounded-lg border bg-card overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="font-semibold">Trade History</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{trades.length} trades executed</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Symbol</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Side</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Qty</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Fill Price</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Value</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Realized P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map((trade) => (
                      <tr key={trade.id} className="border-t hover:bg-muted/20">
                        <td className="p-3 text-muted-foreground">{formatDate(trade.bar_date)}</td>
                        <td className="p-3 font-medium">{trade.symbol}</td>
                        <td className="p-3">
                          <span
                            className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                              trade.side === 'buy'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {trade.side.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3 text-right">{trade.quantity}</td>
                        <td className="p-3 text-right">${safeToFixed(trade.fill_price, 2)}</td>
                        <td className="p-3 text-right">${safeToFixed(trade.fill_value, 0)}</td>
                        <td
                          className={`p-3 text-right font-medium ${
                            trade.realized_pnl > 0
                              ? 'text-green-600'
                              : trade.realized_pnl < 0
                                ? 'text-red-600'
                                : 'text-muted-foreground'
                          }`}
                        >
                          {trade.realized_pnl !== 0
                            ? `${trade.realized_pnl > 0 ? '+' : ''}$${safeToFixed(trade.realized_pnl, 2)}`
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {trades.length === 0 && (
            <div className="rounded-lg border border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground">
              No trades were executed in this backtest.
            </div>
          )}
        </>
      )}

      {/* Config summary */}
      <div className="rounded-lg border bg-card p-4 text-sm">
        <p className="font-medium mb-2">Configuration</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-muted-foreground">
          <div><span className="font-medium text-foreground">Fill Price</span><br />{backtest.fill_price}</div>
          <div><span className="font-medium text-foreground">Slippage</span><br />{backtest.slippage_bps} bps</div>
          <div><span className="font-medium text-foreground">Commission</span><br />{backtest.commission_bps} bps</div>
          {backtest.bars_processed != null && (
            <div><span className="font-medium text-foreground">Bars</span><br />{backtest.bars_processed}</div>
          )}
        </div>
        {Object.keys(backtest.strategy_params ?? {}).length > 0 && (
          <div className="mt-3 pt-3 border-t grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-muted-foreground">
            {Object.entries(backtest.strategy_params).map(([k, v]) => (
              <div key={k}>
                <span className="font-medium text-foreground">{k.replace(/_/g, ' ')}</span>
                <br />{String(v)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="rounded-lg bg-amber-50 border border-amber-300 p-4 text-xs text-slate-700">
        <strong>Disclaimer:</strong> Backtest results are hypothetical and based on historical data.
        Past performance does not guarantee future results. Not financial advice.
      </div>
    </div>
  );
}

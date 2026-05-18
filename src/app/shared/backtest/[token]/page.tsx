'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { AlertTriangle, BarChart2, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { getSharedBacktest, type BacktestPublicData } from '@/lib/api/backtests';
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
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-lg border bg-white dark:bg-neutral-900 p-4">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p
        className={`text-xl font-bold ${
          positive === true
            ? 'text-green-600'
            : positive === false
              ? 'text-red-500'
              : 'text-gray-900 dark:text-gray-100'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatChartDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Approximate CAGR from total return pct + date range
function calcCAGR(totalReturnPct: number | null, startDate: string, endDate: string): string {
  if (totalReturnPct === null) return '—';
  const years =
    (new Date(endDate).getTime() - new Date(startDate).getTime()) / (365.25 * 24 * 3600 * 1000);
  if (years <= 0) return '—';
  const cagr = (Math.pow(1 + totalReturnPct / 100, 1 / years) - 1) * 100;
  return `${safeToFixed(cagr, 2)}%`;
}

export default function SharedBacktestPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<BacktestPublicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!token) return;
    getSharedBacktest(token)
      .then((d) => setData(d))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex flex-col items-center justify-center gap-4 px-4">
        <AlertTriangle className="h-12 w-12 text-gray-400" />
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Backtest not found
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
          This shared backtest link may have expired or been removed.
        </p>
        <Link
          href="/"
          className="mt-2 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          Create your own backtests on SSB
        </Link>
      </div>
    );
  }

  const m = data.metrics;
  const returnPct = m.total_return_pct;
  const isPositive = returnPct != null && returnPct >= 0;

  const chartData = data.equity_curve.map((pt) => ({
    date: formatChartDate(pt.date),
    return_pct: parseFloat(safeToFixed(pt.cumulative_return * 100, 2)),
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      {/* Top bar */}
      <header className="border-b bg-white dark:bg-neutral-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-purple-600" />
          <span className="font-bold text-sm text-gray-900 dark:text-gray-100">SSB Backtest</span>
        </div>
        <Link
          href="/"
          className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          Try SSB free
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Title & meta */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data.name}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
            <span>{STRATEGY_LABELS[data.strategy_type] ?? data.strategy_type}</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(data.start_date)} — {formatDate(data.end_date)}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                data.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetricCard
            label="Total Return"
            value={returnPct != null ? `${safeToFixed(returnPct, 2)}%` : '—'}
            positive={returnPct != null ? isPositive : undefined}
          />
          <MetricCard
            label="CAGR"
            value={calcCAGR(returnPct, data.start_date, data.end_date)}
            positive={returnPct != null ? isPositive : undefined}
          />
          <MetricCard
            label="Sharpe Ratio"
            value={m.sharpe_ratio != null ? safeToFixed(m.sharpe_ratio, 2) : '—'}
            positive={m.sharpe_ratio != null ? m.sharpe_ratio > 0 : undefined}
          />
          <MetricCard
            label="Max Drawdown"
            value={m.max_drawdown != null ? `${safeToFixed(m.max_drawdown * 100, 1)}%` : '—'}
            positive={false}
          />
        </div>

        {/* Equity curve */}
        {chartData.length > 1 && (
          <div className="rounded-xl border bg-white dark:bg-neutral-900 p-6">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              Equity Curve
              <span className="text-sm font-normal text-gray-400">(cumulative return %)</span>
            </h2>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sharedReturnGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={isPositive ? '#22c55e' : '#ef4444'}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={isPositive ? '#22c55e' : '#ef4444'}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
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
                    formatter={(v: number) => [`${v?.toFixed(2)}%`, 'Return']}
                    labelStyle={{ fontWeight: 600 }}
                  />
                  <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="4 2" />
                  <Area
                    type="monotone"
                    dataKey="return_pct"
                    stroke={isPositive ? '#22c55e' : '#ef4444'}
                    strokeWidth={2}
                    fill="url(#sharedReturnGrad)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-xs text-slate-700">
          <strong>Disclaimer:</strong> Backtest results are hypothetical and based on historical
          data. Past performance does not guarantee future results. Not financial advice.
        </div>

        {/* CTA */}
        <div className="rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-6 text-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
            Create your own backtests on SSB
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Run historical strategy simulations, analyze risk, and explore markets — free to start.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Get started for free
          </Link>
        </div>
      </main>
    </div>
  );
}

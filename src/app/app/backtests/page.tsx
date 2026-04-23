'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LineChart, RefreshCw, AlertCircle, Plus, TrendingUp, TrendingDown, Calendar, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { listBacktests, getBacktestEntitlements, type BacktestSummary, type BacktestEntitlements } from '@/lib/api/backtests';
import { isValidNumber, isUnlimited, formatLimit, safeToFixed } from '@/lib/utils';

function formatDateRange(days: number | null | undefined): string {
  if (!isValidNumber(days) || days <= 0) return '—';
  if (isUnlimited(days)) return 'Unlimited';
  const years = Math.floor(days / 365);
  return years === 1 ? '1 year' : `${years} years`;
}

export default function BacktestsPage() {
  const router = useRouter();
  const [backtests, setBacktests] = useState<BacktestSummary[]>([]);
  const [entitlements, setEntitlements] = useState<BacktestEntitlements | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canCreateBacktest = entitlements && (isUnlimited(entitlements.monthly_limit) || (entitlements.monthly_remaining ?? 0) > 0);

  const handleCreateBacktest = () => {
    router.push('/app/backtests/new');
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [backtestsData, entitlementsData] = await Promise.all([
        listBacktests({ limit: 20, offset: 0 }),
        getBacktestEntitlements(),
      ]);
      setBacktests(backtestsData.backtests);
      setEntitlements(entitlementsData);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load backtests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Completed</span>;
      case 'running':
        return <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">Running</span>;
      case 'pending':
        return <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Pending</span>;
      case 'failed':
        return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">Failed</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="text-muted-foreground">Loading backtests...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-destructive">{error}</p>
        <Button onClick={loadData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <div className="rounded-lg bg-amber-50 border border-amber-300 p-4 text-sm text-slate-800">
        <strong>Disclaimer:</strong> Backtest results are hypothetical and based on historical data.
        Past performance does not guarantee future results. Not investment advice.
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <LineChart className="h-7 w-7 text-purple-600" />
            Strategy Backtesting
          </h1>
          <p className="text-muted-foreground mt-1">
            Test strategies against historical data with deterministic results.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadData} variant="ghost" size="icon" aria-label="Refresh backtests">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleCreateBacktest}
            disabled={!canCreateBacktest}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Backtest
          </Button>
        </div>
      </div>

      {/* Usage stats */}
      {entitlements && (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Monthly Used</p>
            <p className="text-2xl font-bold">
              {isUnlimited(entitlements.monthly_limit)
                ? `${entitlements.monthly_used ?? 0} / Unlimited`
                : `${entitlements.monthly_used ?? 0} / ${formatLimit(entitlements.monthly_limit)}`}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Remaining</p>
            <p className="text-2xl font-bold text-green-600">
              {formatLimit(entitlements.monthly_remaining)}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Max Range</p>
            <p className="text-2xl font-bold">
              {formatDateRange(entitlements.max_date_range_days)}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Asset Classes</p>
            <p className="text-lg font-bold">{entitlements.allowed_asset_classes?.length ?? 0}</p>
          </div>
        </div>
      )}

      {/* Backtests list */}
      {backtests.length > 0 ? (
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Symbols</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Period</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Return</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Drawdown</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {backtests.map((backtest) => (
                <tr key={backtest.id} className="border-t hover:bg-muted/30 cursor-pointer">
                  <td className="p-4 font-medium">{backtest.name}</td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {backtest.symbols.slice(0, 3).join(', ')}
                    {backtest.symbols.length > 3 && ` +${backtest.symbols.length - 3}`}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(backtest.start_date).toLocaleDateString()} - {new Date(backtest.end_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-4">
                    {isValidNumber(backtest.total_return_pct) ? (
                      <span className={`flex items-center gap-1 ${backtest.total_return_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {backtest.total_return_pct >= 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        {safeToFixed(backtest.total_return_pct, 2)}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="p-4">
                    {isValidNumber(backtest.max_drawdown) ? (
                      <span className="text-red-600">{safeToFixed(backtest.max_drawdown * 100, 1)}%</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="p-4">{getStatusBadge(backtest.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed bg-muted/50 p-12 text-center">
          <LineChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No Backtests Yet</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
            Create your first backtest to simulate strategy performance using historical market data.
            Results are 100% deterministic and reproducible.
          </p>
          <Button
            onClick={handleCreateBacktest}
            disabled={!canCreateBacktest}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Backtest
          </Button>
        </div>
      )}

      {/* Info banner */}
      <div className="rounded-lg bg-purple-50 border border-purple-200 p-4 text-sm text-slate-800">
        <strong>Note:</strong> Backtests are educational tools for understanding historical portfolio behavior.
        Past performance does not guarantee future results. All results are deterministic: same inputs always produce identical outputs.
      </div>
    </div>
  );
}

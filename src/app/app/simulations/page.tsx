'use client';

import { useState } from 'react';
import { Activity, Plus, Trash2, TrendingUp, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  runSimulation,
  type PortfolioHolding,
  type SimulationResponse,
} from '@/lib/api/intelligence';
import { safeToFixed } from '@/lib/utils';

// ============================================================================
// Horizon presets
// ============================================================================

const HORIZONS = [
  { label: '1 Month', days: 21 },
  { label: '3 Months', days: 63 },
  { label: '6 Months', days: 126 },
  { label: '1 Year', days: 252 },
  { label: '2 Years', days: 504 },
  { label: '3 Years', days: 756 },
];

// ============================================================================
// Components
// ============================================================================

function PercentileBar({
  label,
  value,
  initial,
  color,
}: {
  label: string;
  value: number;
  initial: number;
  color: string;
}) {
  const pct = ((value - initial) / initial) * 100;
  return (
    <div className="flex items-center gap-3">
      <span className="w-8 text-xs text-muted-foreground shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.min(100, Math.max(2, (value / (initial * 2)) * 100))}%` }}
        />
      </div>
      <span className="w-24 text-right text-sm font-medium">
        ${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}
      </span>
      <span
        className={`w-16 text-right text-xs ${
          pct >= 0 ? 'text-green-600' : 'text-red-600'
        }`}
      >
        {pct >= 0 ? '+' : ''}
        {pct.toFixed(1)}%
      </span>
    </div>
  );
}

// ============================================================================
// Page
// ============================================================================

export default function SimulationsPage() {
  const [holdings, setHoldings] = useState<{ symbol: string; weight: string }[]>([
    { symbol: 'SPY', weight: '60' },
    { symbol: 'AGG', weight: '40' },
  ]);
  const [initialValue, setInitialValue] = useState('100000');
  const [horizonDays, setHorizonDays] = useState(252);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulationResponse | null>(null);

  const addHolding = () => {
    setHoldings((prev) => [...prev, { symbol: '', weight: '' }]);
  };

  const removeHolding = (i: number) => {
    setHoldings((prev) => prev.filter((_, idx) => idx !== i));
  };

  const updateHolding = (i: number, field: 'symbol' | 'weight', value: string) => {
    setHoldings((prev) =>
      prev.map((h, idx) => (idx === i ? { ...h, [field]: field === 'symbol' ? value.toUpperCase() : value } : h))
    );
  };

  const totalWeight = holdings.reduce((sum, h) => sum + (parseFloat(h.weight) || 0), 0);

  const handleRun = async () => {
    if (Math.abs(totalWeight - 100) > 0.5) {
      toast.error(`Weights must sum to 100% (currently ${totalWeight.toFixed(1)}%)`);
      return;
    }

    const parsedHoldings: PortfolioHolding[] = holdings
      .filter((h) => h.symbol && parseFloat(h.weight) > 0)
      .map((h) => ({
        symbol: h.symbol,
        weight: parseFloat(h.weight) / 100,
        asset_class: 'us_equities',
      }));

    if (parsedHoldings.length === 0) {
      toast.error('Add at least one holding');
      return;
    }

    const capital = parseFloat(initialValue);
    if (isNaN(capital) || capital < 1000) {
      toast.error('Initial value must be at least $1,000');
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const data = await runSimulation({
        holdings: parsedHoldings,
        horizon_days: horizonDays,
        num_simulations: 1000,
        initial_value: capital,
      });
      setResult(data);
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail ?? err?.message ?? 'Simulation failed';
      toast.error(typeof detail === 'string' ? detail : JSON.stringify(detail));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Activity className="h-7 w-7 text-blue-600" />
          Portfolio Simulation
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Analytical outcome scenarios based on historical volatility.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="rounded-lg bg-amber-50 border border-amber-300 p-3 text-xs text-slate-700 flex gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
        <span>
          Results are analytical estimates using log-normal distribution assumptions — not
          guaranteed outcomes. Not financial advice. Past volatility does not predict future
          returns.
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input panel */}
        <div className="space-y-5">
          {/* Holdings */}
          <div className="rounded-lg border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm">Portfolio Holdings</h2>
              <span
                className={`text-xs font-medium ${
                  Math.abs(totalWeight - 100) < 0.5 ? 'text-green-600' : 'text-red-500'
                }`}
              >
                {totalWeight.toFixed(1)}% allocated
              </span>
            </div>

            <div className="space-y-2">
              {holdings.map((h, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    className="w-24 text-sm font-mono"
                    placeholder="AAPL"
                    value={h.symbol}
                    onChange={(e) => updateHolding(i, 'symbol', e.target.value)}
                    maxLength={10}
                  />
                  <Input
                    className="w-20 text-sm"
                    placeholder="50"
                    type="number"
                    min="0.1"
                    max="100"
                    step="0.5"
                    value={h.weight}
                    onChange={(e) => updateHolding(i, 'weight', e.target.value)}
                  />
                  <span className="text-xs text-muted-foreground">%</span>
                  <button
                    type="button"
                    onClick={() => removeHolding(i)}
                    className="text-muted-foreground hover:text-red-500 transition-colors"
                    disabled={holdings.length <= 1}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addHolding}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add holding
            </button>
          </div>

          {/* Simulation parameters */}
          <div className="rounded-lg border bg-card p-5 space-y-4">
            <h2 className="font-semibold text-sm">Parameters</h2>

            <div>
              <Label>Initial Portfolio Value</Label>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">$</span>
                <Input
                  type="number"
                  min="1000"
                  max="100000000"
                  step="1000"
                  value={initialValue}
                  onChange={(e) => setInitialValue(e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>

            <div>
              <Label>Horizon</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {HORIZONS.map((h) => (
                  <button
                    key={h.days}
                    type="button"
                    onClick={() => setHorizonDays(h.days)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                      horizonDays === h.days
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-border hover:border-blue-300 text-muted-foreground'
                    }`}
                  >
                    {h.label}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={handleRun} disabled={loading} className="w-full">
              {loading ? 'Simulating…' : 'Run Simulation'}
            </Button>
          </div>
        </div>

        {/* Results panel */}
        <div>
          {result ? (
            <div className="rounded-lg border bg-card p-5 space-y-5">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <h2 className="font-semibold text-sm">Outcome Scenarios</h2>
                <span className="ml-auto text-xs text-muted-foreground">
                  {HORIZONS.find((h) => h.days === result.horizon_days)?.label ??
                    `${result.horizon_days}d`}{' '}
                  horizon
                </span>
              </div>

              <div className="space-y-3">
                <PercentileBar
                  label="5th"
                  value={Number(result.results.percentile_5)}
                  initial={Number(result.initial_value)}
                  color="bg-red-400"
                />
                <PercentileBar
                  label="25th"
                  value={Number(result.results.percentile_25)}
                  initial={Number(result.initial_value)}
                  color="bg-orange-400"
                />
                <PercentileBar
                  label="50th"
                  value={Number(result.results.percentile_50)}
                  initial={Number(result.initial_value)}
                  color="bg-blue-500"
                />
                <PercentileBar
                  label="75th"
                  value={Number(result.results.percentile_75)}
                  initial={Number(result.initial_value)}
                  color="bg-emerald-400"
                />
                <PercentileBar
                  label="95th"
                  value={Number(result.results.percentile_95)}
                  initial={Number(result.initial_value)}
                  color="bg-green-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t text-xs">
                <div>
                  <p className="text-muted-foreground">Prob. of Loss</p>
                  <p className="font-semibold text-red-600">
                    {(result.results.probability_of_loss * 100).toFixed(0)}%
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Expected Shortfall</p>
                  <p className="font-semibold text-red-600">
                    ${Number(result.results.expected_shortfall).toLocaleString('en-US', {
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Mean Outcome</p>
                  <p className="font-semibold">
                    ${Number(result.results.mean_value).toLocaleString('en-US', {
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Simulations Run</p>
                  <p className="font-semibold">{result.simulations_run.toLocaleString()}</p>
                </div>
              </div>

              {result.insights.length > 0 && (
                <div className="pt-2 border-t space-y-1">
                  {result.insights.map((ins, i) => (
                    <p key={i} className="text-xs text-muted-foreground">
                      • {ins}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed bg-muted/30 h-full min-h-[300px] flex items-center justify-center">
              <p className="text-sm text-muted-foreground text-center px-6">
                Configure your portfolio and run a simulation to see outcome scenarios.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  LineChart,
  Calendar,
  DollarSign,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createBacktest, runBacktest } from '@/lib/api/backtests';

// ============================================================================
// Strategy Definitions
// ============================================================================

interface StrategyParam {
  key: string;
  label: string;
  type: 'number';
  defaultValue: number;
  min?: number;
  max?: number;
  description?: string;
}

interface StrategyDef {
  id: string;
  name: string;
  description: string;
  params: StrategyParam[];
}

const STRATEGIES: StrategyDef[] = [
  {
    id: 'buy_and_hold',
    name: 'Buy & Hold',
    description:
      'Equal-weight allocation at start, hold until end. The classic passive benchmark.',
    params: [],
  },
  {
    id: 'sma_crossover',
    name: 'SMA Crossover',
    description:
      'Buy on the golden cross (fast SMA crosses above slow SMA); sell on the death cross. Trend-following.',
    params: [
      {
        key: 'fast_period',
        label: 'Fast Period (days)',
        type: 'number',
        defaultValue: 50,
        min: 2,
        max: 200,
        description: 'Short-term SMA window',
      },
      {
        key: 'slow_period',
        label: 'Slow Period (days)',
        type: 'number',
        defaultValue: 200,
        min: 10,
        max: 1000,
        description: 'Long-term SMA window (must be > fast period)',
      },
    ],
  },
  {
    id: 'rsi_mean_reversion',
    name: 'RSI Mean Reversion',
    description:
      'Buy when RSI drops below oversold threshold; sell when RSI rises above overbought threshold.',
    params: [
      {
        key: 'rsi_period',
        label: 'RSI Period (days)',
        type: 'number',
        defaultValue: 14,
        min: 2,
        max: 100,
        description: "Wilder's RSI lookback window",
      },
      {
        key: 'oversold_threshold',
        label: 'Oversold Threshold',
        type: 'number',
        defaultValue: 30,
        min: 1,
        max: 49,
        description: 'RSI level that triggers a buy signal',
      },
      {
        key: 'overbought_threshold',
        label: 'Overbought Threshold',
        type: 'number',
        defaultValue: 70,
        min: 51,
        max: 99,
        description: 'RSI level that triggers a sell signal',
      },
    ],
  },
  {
    id: 'momentum',
    name: 'Momentum',
    description:
      'Monthly rebalancing into the top N performers ranked by lookback-period return.',
    params: [
      {
        key: 'lookback_period',
        label: 'Lookback Period (days)',
        type: 'number',
        defaultValue: 90,
        min: 5,
        max: 365,
        description: "Days used to measure each symbol's return",
      },
      {
        key: 'top_n',
        label: 'Top N Holdings',
        type: 'number',
        defaultValue: 3,
        min: 1,
        max: 50,
        description: 'Number of top performers to hold',
      },
    ],
  },
];

// ============================================================================
// Page Component
// ============================================================================

const TODAY = new Date().toISOString().split('T')[0];

export default function NewBacktestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('buy_and_hold');

  const [formData, setFormData] = useState({
    name: '',
    symbols: '',
    startDate: '',
    endDate: '',
    initialCapital: '100000',
  });

  // Strategy-specific param values keyed by strategy id then param key
  const [strategyParams, setStrategyParams] = useState<Record<string, Record<string, number>>>(
    () =>
      Object.fromEntries(
        STRATEGIES.map((s) => [
          s.id,
          Object.fromEntries(s.params.map((p) => [p.key, p.defaultValue])),
        ])
      )
  );

  const selectedStrategy = STRATEGIES.find((s) => s.id === selectedStrategyId)!;

  const updateParam = (strategyId: string, key: string, value: number) => {
    setStrategyParams((prev) => ({
      ...prev,
      [strategyId]: { ...prev[strategyId], [key]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate required fields
    if (!formData.name.trim()) {
      toast.error('Please enter a backtest name');
      setLoading(false);
      return;
    }

    if (!formData.symbols.trim()) {
      toast.error('Please enter at least one symbol');
      setLoading(false);
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      toast.error('Please select start and end dates');
      setLoading(false);
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    if (formData.endDate > today) {
      toast.error('End date cannot be in the future');
      setLoading(false);
      return;
    }

    if (formData.endDate <= formData.startDate) {
      toast.error('End date must be after start date');
      setLoading(false);
      return;
    }

    const capitalNum = parseFloat(formData.initialCapital);
    if (isNaN(capitalNum) || capitalNum < 1000) {
      toast.error('Initial capital must be at least $1,000');
      setLoading(false);
      return;
    }

    const symbols = formData.symbols
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    if (symbols.length === 0) {
      toast.error('Please enter at least one valid symbol');
      setLoading(false);
      return;
    }

    try {
      // Create the backtest
      const backtest = await createBacktest({
        name: formData.name.trim(),
        symbols,
        start_date: formData.startDate,
        end_date: formData.endDate,
        initial_capital: capitalNum,
        strategy_type: selectedStrategyId,
        strategy_params: strategyParams[selectedStrategyId] ?? {},
        fill_price: 'open',
      });

      toast.success('Backtest created — running now...');

      // Immediately run the backtest
      await runBacktest(backtest.id);

      toast.success('Backtest complete!');
      router.push('/app/backtests');
    } catch (err: any) {
      const raw = err?.response?.data?.detail ?? err?.message ?? 'Failed to create backtest';
      const detail = Array.isArray(raw)
        ? raw.map((e: any) => e?.msg ?? JSON.stringify(e)).join('; ')
        : typeof raw === 'string'
          ? raw
          : JSON.stringify(raw);
      toast.error(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <Link
          href="/app/backtests"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Backtests
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <LineChart className="h-7 w-7 text-purple-600" />
          Create New Backtest
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure and run a deterministic backtest on historical data.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Config */}
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            Configuration
          </h2>

          {/* Backtest Name */}
          <div>
            <Label htmlFor="name">Backtest Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="My Strategy Backtest"
              className="mt-1"
            />
          </div>

          {/* Symbols */}
          <div>
            <Label htmlFor="symbols">
              <span className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Symbols (comma-separated)
              </span>
            </Label>
            <Input
              id="symbols"
              value={formData.symbols}
              onChange={(e) => setFormData({ ...formData, symbols: e.target.value })}
              placeholder="SPY, QQQ, IWM"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter stock symbols separated by commas.
            </p>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Start Date
                </span>
              </Label>
              <Input
                id="startDate"
                type="date"
                max={TODAY}
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="endDate">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  End Date
                </span>
              </Label>
              <Input
                id="endDate"
                type="date"
                max={TODAY}
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          {/* Initial Capital */}
          <div>
            <Label htmlFor="initialCapital">
              <span className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Initial Capital (USD)
              </span>
            </Label>
            <Input
              id="initialCapital"
              type="number"
              min="1000"
              max="10000000"
              value={formData.initialCapital}
              onChange={(e) => setFormData({ ...formData, initialCapital: e.target.value })}
              className="mt-1"
            />
          </div>
        </div>

        {/* Strategy Selector */}
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            Strategy
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {STRATEGIES.map((strategy) => {
              const isSelected = selectedStrategyId === strategy.id;
              return (
                <button
                  key={strategy.id}
                  type="button"
                  onClick={() => setSelectedStrategyId(strategy.id)}
                  className={`text-left rounded-lg border p-4 transition-all ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-400'
                      : 'border-border hover:border-purple-300 hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-sm">{strategy.name}</span>
                    {isSelected && (
                      <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {strategy.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Strategy-specific params */}
          {selectedStrategy.params.length > 0 && (
            <div className="space-y-3 pt-2 border-t">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {selectedStrategy.name} Parameters
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {selectedStrategy.params.map((param) => (
                  <div key={param.key}>
                    <Label htmlFor={`param-${param.key}`}>{param.label}</Label>
                    {param.description && (
                      <p className="text-xs text-muted-foreground mb-1">{param.description}</p>
                    )}
                    <Input
                      id={`param-${param.key}`}
                      type="number"
                      min={param.min}
                      max={param.max}
                      value={strategyParams[selectedStrategyId]?.[param.key] ?? param.defaultValue}
                      onChange={(e) =>
                        updateParam(selectedStrategyId, param.key, parseFloat(e.target.value))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="rounded-lg bg-amber-50 border border-amber-300 p-4 text-sm text-slate-800">
          <strong>Disclaimer:</strong> Backtest results are hypothetical and based on historical data.
          Past performance does not guarantee future results. Not investment advice.
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Running...' : 'Create & Run Backtest'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/app/backtests')}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

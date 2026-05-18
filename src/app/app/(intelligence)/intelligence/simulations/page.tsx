'use client';

import { useState } from 'react';
import {
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  AlertCircle,
} from 'lucide-react';
import { useIntelligence } from '@/contexts/intelligence-context';
import { EquityCurveChart } from '@/components/intelligence';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { demoSimulationsList } from '@/lib/demo-data';

export default function SimulationsPage() {
  const { isDemoMode } = useIntelligence();
  const [selectedSimulationId, setSelectedSimulationId] = useState<string>(
    demoSimulationsList[0]?.id || ''
  );
  const [showMethodology, setShowMethodology] = useState(false);

  const selectedSimulation = demoSimulationsList.find(
    (s) => s.id === selectedSimulationId
  );

  const getReturnColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-foreground';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold">Simulations</h2>
        <p className="text-muted-foreground mt-1">
          Backtest results and performance analysis
        </p>
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Simulation list */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border bg-card">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Your Simulations</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {demoSimulationsList.length} simulations
              </p>
            </div>
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {demoSimulationsList.map((sim) => (
                <button
                  key={sim.id}
                  onClick={() => setSelectedSimulationId(sim.id)}
                  className={`w-full text-left p-4 hover:bg-muted/50 transition-colors ${
                    selectedSimulationId === sim.id ? 'bg-muted/70' : ''
                  }`}
                >
                  <div className="space-y-1">
                    <p className="font-medium text-sm truncate">{sim.name}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(sim.created_at)}
                      </span>
                      <span
                        className={`text-sm font-bold ${getReturnColor(
                          sim.metrics.total_return
                        )}`}
                      >
                        {sim.metrics.total_return > 0 ? '+' : ''}
                        {formatPercent(sim.metrics.total_return, 1)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Simulation detail */}
        <div className="lg:col-span-3 space-y-6">
          {selectedSimulation ? (
            <>
              {/* Simulation header */}
              <div className="rounded-lg border bg-card p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold">{selectedSimulation.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 capitalize">
                      {selectedSimulation.strategy_type.replace('_', ' ')} Strategy
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(selectedSimulation.start_date)} -{' '}
                        {formatDate(selectedSimulation.end_date)}
                      </span>
                      <span className="capitalize px-2 py-0.5 rounded bg-muted text-xs">
                        {selectedSimulation.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Return</p>
                    <p
                      className={`text-3xl font-bold ${getReturnColor(
                        selectedSimulation.metrics.total_return
                      )}`}
                    >
                      {selectedSimulation.metrics.total_return > 0 ? '+' : ''}
                      {formatPercent(selectedSimulation.metrics.total_return, 1)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Performance metrics */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border bg-card p-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    CAGR
                  </p>
                  <p
                    className={`text-2xl font-bold mt-1 ${getReturnColor(
                      selectedSimulation.metrics.cagr
                    )}`}
                  >
                    {selectedSimulation.metrics.cagr > 0 ? '+' : ''}
                    {formatPercent(selectedSimulation.metrics.cagr, 1)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Compound Annual Growth
                  </p>
                </div>

                <div className="rounded-lg border bg-card p-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Sharpe Ratio
                  </p>
                  <p
                    className={`text-2xl font-bold mt-1 ${
                      selectedSimulation.metrics.sharpe_ratio >= 1
                        ? 'text-green-600'
                        : selectedSimulation.metrics.sharpe_ratio >= 0.5
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }`}
                  >
                    {selectedSimulation.metrics.sharpe_ratio.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Risk-adjusted return
                  </p>
                </div>

                <div className="rounded-lg border bg-card p-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Max Drawdown
                  </p>
                  <p className="text-2xl font-bold mt-1 text-red-600">
                    -{formatPercent(selectedSimulation.metrics.max_drawdown, 1)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Peak-to-trough decline
                  </p>
                </div>

                <div className="rounded-lg border bg-card p-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Win Rate
                  </p>
                  <p
                    className={`text-2xl font-bold mt-1 ${
                      selectedSimulation.metrics.win_rate >= 50
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {formatPercent(selectedSimulation.metrics.win_rate, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Profitable trades
                  </p>
                </div>
              </div>

              {/* Equity curve chart */}
              <div className="rounded-lg border bg-card p-6">
                <h4 className="font-semibold mb-4">Equity Curve</h4>
                <EquityCurveChart data={selectedSimulation.equity_curve} />
              </div>

              {/* Additional metrics */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Trading stats */}
                <div className="rounded-lg border bg-card p-6">
                  <h4 className="font-semibold mb-4">Trading Statistics</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Total Trades
                      </span>
                      <span className="font-medium">
                        {selectedSimulation.metrics.total_trades}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Winning Trades
                      </span>
                      <span className="font-medium text-green-600">
                        {Math.round(
                          selectedSimulation.metrics.total_trades *
                            (selectedSimulation.metrics.win_rate / 100)
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Losing Trades
                      </span>
                      <span className="font-medium text-red-600">
                        {Math.round(
                          selectedSimulation.metrics.total_trades *
                            (1 - selectedSimulation.metrics.win_rate / 100)
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Sortino Ratio
                      </span>
                      <span className="font-medium">
                        {selectedSimulation.metrics.sortino_ratio.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Volatility
                      </span>
                      <span className="font-medium">
                        {formatPercent(selectedSimulation.metrics.volatility_annual, 1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recent trades */}
                <div className="rounded-lg border bg-card p-6">
                  <h4 className="font-semibold mb-4">Recent Trades</h4>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {selectedSimulation.trades.slice(0, 10).map((trade) => (
                      <div
                        key={trade.id}
                        className="flex items-center justify-between text-sm py-2 border-b last:border-b-0"
                      >
                        <div className="flex items-center gap-2">
                          {trade.side === 'buy' ? (
                            <ArrowUpRight className="h-4 w-4 text-green-500" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-500" />
                          )}
                          <span className="font-mono">{trade.symbol}</span>
                          <span className="text-muted-foreground capitalize">
                            {trade.side}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {trade.quantity} @ {formatCurrency(trade.price)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(trade.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-lg border bg-card p-6 text-center text-muted-foreground">
              Select a simulation to view details
            </div>
          )}
        </div>
      </div>

      {/* Methodology card */}
      <div className="rounded-lg border bg-card">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="text-sm font-medium">About Simulations</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Simulations backtest trading strategies against historical market data.
                Results include transaction costs and realistic execution assumptions.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t">
          <button
            onClick={() => setShowMethodology(!showMethodology)}
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors"
          >
            <span>View Details</span>
            <span className="text-muted-foreground">{showMethodology ? '−' : '+'}</span>
          </button>

          {showMethodology && (
            <div className="border-t px-4 py-4 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <h5 className="text-sm font-medium">Important Limitations</h5>
                </div>
                <ul className="space-y-1 ml-6">
                  <li className="text-xs text-muted-foreground list-disc">
                    Past performance does not guarantee future results
                  </li>
                  <li className="text-xs text-muted-foreground list-disc">
                    Backtests may suffer from survivorship bias
                  </li>
                  <li className="text-xs text-muted-foreground list-disc">
                    Slippage and market impact may differ in live trading
                  </li>
                  <li className="text-xs text-muted-foreground list-disc">
                    Strategy capacity may be limited at larger scales
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

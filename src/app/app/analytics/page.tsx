'use client';

import { useState } from 'react';
import {
  BarChart3,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Activity,
  Globe,
  Cpu,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  optimizePortfolio,
  getTechnicalAnalysis,
  getSectorRotation,
  runMonteCarlo,
  type OptimizationResponse,
  type TechnicalAnalysisResponse,
  type SectorRotationResponse,
  type MonteCarloResponse,
} from '@/lib/api/analytics';
import { EfficientFrontierChart } from '@/components/analytics/efficient-frontier-chart';
import { TechnicalIndicatorsView } from '@/components/analytics/technical-indicators-view';
import { SectorRotationView } from '@/components/analytics/sector-rotation-view';
import { MonteCarloChart } from '@/components/analytics/monte-carlo-chart';
import { cn } from '@/lib/utils';

// ============================================================================
// Section wrapper
// ============================================================================

function Section({
  title,
  icon: Icon,
  defaultOpen = true,
  children,
  className,
}: {
  title: string;
  icon: React.ElementType;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={cn('rounded-lg border bg-card', className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold">{title}</h2>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

// ============================================================================
// Error notice
// ============================================================================

function ErrorNotice({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-destructive bg-destructive/10 p-3">
      <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
      <p className="text-sm text-destructive">{message}</p>
    </div>
  );
}

// ============================================================================
// Analytics page
// ============================================================================

export default function AnalyticsPage() {
  // Portfolio symbols input
  const [portfolioSymbols, setPortfolioSymbols] = useState('AAPL,MSFT,GOOGL,AMZN,NVDA');
  const [technicalSymbol, setTechnicalSymbol] = useState('SPY');

  // Results state
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResponse | null>(null);
  const [technicalResult, setTechnicalResult] = useState<TechnicalAnalysisResponse | null>(null);
  const [sectorResult, setSectorResult] = useState<SectorRotationResponse | null>(null);
  const [monteCarloResult, setMonteCarloResult] = useState<MonteCarloResponse | null>(null);

  // Loading / error state per section
  const [loadingOptimize, setLoadingOptimize] = useState(false);
  const [loadingTechnical, setLoadingTechnical] = useState(false);
  const [loadingSector, setLoadingSector] = useState(false);
  const [loadingMonteCarlo, setLoadingMonteCarlo] = useState(false);

  const [errorOptimize, setErrorOptimize] = useState<string | null>(null);
  const [errorTechnical, setErrorTechnical] = useState<string | null>(null);
  const [errorSector, setErrorSector] = useState<string | null>(null);
  const [errorMonteCarlo, setErrorMonteCarlo] = useState<string | null>(null);

  // ── Helpers ──────────────────────────────────────────────────────────────

  function parseSymbols(raw: string) {
    return raw
      .split(',')
      .map((s) => s.trim().toUpperCase().replace(/[^A-Z0-9.]/g, ''))
      .filter((s) => s.length > 0 && s.length <= 10);
  }

  function buildEqualWeightHoldings(symbols: string[]) {
    const w = 1 / symbols.length;
    return symbols.map((symbol) => ({ symbol, weight: w }));
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  const runOptimization = async () => {
    const symbols = parseSymbols(portfolioSymbols);
    if (symbols.length < 2) {
      setErrorOptimize('Enter at least 2 symbols for portfolio optimization.');
      return;
    }
    setLoadingOptimize(true);
    setErrorOptimize(null);
    try {
      const holdings = buildEqualWeightHoldings(symbols);
      const result = await optimizePortfolio(holdings);
      setOptimizationResult(result);
    } catch (err: any) {
      setErrorOptimize(err?.response?.data?.detail || err?.message || 'Optimization failed');
    } finally {
      setLoadingOptimize(false);
    }
  };

  const runTechnical = async () => {
    const sym = technicalSymbol.trim().toUpperCase();
    if (!sym) {
      setErrorTechnical('Enter a symbol.');
      return;
    }
    setLoadingTechnical(true);
    setErrorTechnical(null);
    try {
      const result = await getTechnicalAnalysis(sym);
      setTechnicalResult(result);
    } catch (err: any) {
      setErrorTechnical(err?.response?.data?.detail || err?.message || 'Technical analysis failed');
    } finally {
      setLoadingTechnical(false);
    }
  };

  const runSector = async () => {
    setLoadingSector(true);
    setErrorSector(null);
    try {
      const result = await getSectorRotation();
      setSectorResult(result);
    } catch (err: any) {
      setErrorSector(err?.response?.data?.detail || err?.message || 'Sector rotation analysis failed');
    } finally {
      setLoadingSector(false);
    }
  };

  const runMC = async () => {
    const symbols = parseSymbols(portfolioSymbols);
    if (symbols.length < 1) {
      setErrorMonteCarlo('Enter at least one symbol.');
      return;
    }
    setLoadingMonteCarlo(true);
    setErrorMonteCarlo(null);
    try {
      const holdings = buildEqualWeightHoldings(symbols);
      const result = await runMonteCarlo(holdings, { initialValue: 100000, horizonDays: 252 });
      setMonteCarloResult(result);
    } catch (err: any) {
      setErrorMonteCarlo(err?.response?.data?.detail || err?.message || 'Monte Carlo simulation failed');
    } finally {
      setLoadingMonteCarlo(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <BarChart3 className="h-7 w-7 text-blue-600" />
          Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          Portfolio optimization, technical analysis, sector rotation, and Monte Carlo simulation.
        </p>
      </div>

      {/* Shared symbol input */}
      <div className="rounded-lg border bg-card p-5 space-y-4">
        <div>
          <Label htmlFor="portfolio-symbols">Portfolio Symbols (comma-separated)</Label>
          <Input
            id="portfolio-symbols"
            value={portfolioSymbols}
            onChange={(e) => setPortfolioSymbols(e.target.value)}
            placeholder="AAPL, MSFT, GOOGL"
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Used for Portfolio Optimization and Monte Carlo. Equal-weighted by default.
          </p>
        </div>
      </div>

      {/* ── Portfolio Optimization ── */}
      <Section title="Portfolio Optimization" icon={TrendingUp}>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={runOptimization} disabled={loadingOptimize}>
              {loadingOptimize ? (
                <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Optimizing...</>
              ) : (
                'Run Optimization'
              )}
            </Button>
          </div>

          {errorOptimize && <ErrorNotice message={errorOptimize} />}

          {optimizationResult && (
            <div className="space-y-5">
              {/* Efficient frontier */}
              {optimizationResult.efficient_frontier.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-3">Efficient Frontier</h3>
                  <EfficientFrontierChart
                    frontier={optimizationResult.efficient_frontier}
                    maxSharpe={optimizationResult.max_sharpe_portfolio}
                    minVariance={optimizationResult.min_variance_portfolio}
                    currentPortfolio={optimizationResult.current_portfolio}
                  />
                </div>
              )}

              {/* Key portfolios */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    <h4 className="text-sm font-medium">Max Sharpe Portfolio</h4>
                  </div>
                  <PortfolioStats p={optimizationResult.max_sharpe_portfolio} />
                </div>
                <div className="rounded-lg border p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <h4 className="text-sm font-medium">Min Variance Portfolio</h4>
                  </div>
                  <PortfolioStats p={optimizationResult.min_variance_portfolio} />
                </div>
              </div>

              {/* Explanation */}
              {optimizationResult.explanation && (
                <ExplanationCard explanation={optimizationResult.explanation} />
              )}
            </div>
          )}

          {!optimizationResult && !loadingOptimize && !errorOptimize && (
            <EmptyState message="Run optimization to see the efficient frontier and optimal portfolio weights." />
          )}
        </div>
      </Section>

      {/* ── Technical Analysis ── */}
      <Section title="Technical Analysis" icon={Activity}>
        <div className="space-y-4">
          <div className="flex gap-2 items-end">
            <div className="flex-1 max-w-xs">
              <Label htmlFor="tech-symbol">Symbol</Label>
              <Input
                id="tech-symbol"
                value={technicalSymbol}
                onChange={(e) => setTechnicalSymbol(e.target.value.toUpperCase())}
                placeholder="SPY"
                className="mt-1"
              />
            </div>
            <Button onClick={runTechnical} disabled={loadingTechnical}>
              {loadingTechnical ? (
                <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Analyzing...</>
              ) : (
                'Analyze'
              )}
            </Button>
          </div>

          {errorTechnical && <ErrorNotice message={errorTechnical} />}

          {technicalResult && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{technicalResult.symbol}</span>
                <span>·</span>
                <span>{new Date(technicalResult.analysis_date).toLocaleDateString()}</span>
              </div>
              <TechnicalIndicatorsView result={technicalResult} />
              {technicalResult.explanation && (
                <ExplanationCard explanation={technicalResult.explanation} />
              )}
            </div>
          )}

          {!technicalResult && !loadingTechnical && !errorTechnical && (
            <EmptyState message="Enter a symbol and click Analyze to compute 30+ technical indicators." />
          )}
        </div>
      </Section>

      {/* ── Sector Rotation ── */}
      <Section title="Sector Rotation" icon={Globe}>
        <div className="space-y-4">
          <Button onClick={runSector} disabled={loadingSector}>
            {loadingSector ? (
              <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Loading...</>
            ) : (
              'Analyze Sector Rotation'
            )}
          </Button>

          {errorSector && <ErrorNotice message={errorSector} />}

          {sectorResult && (
            <div className="space-y-4">
              <SectorRotationView result={sectorResult} />
              {sectorResult.explanation && (
                <ExplanationCard explanation={sectorResult.explanation} />
              )}
            </div>
          )}

          {!sectorResult && !loadingSector && !errorSector && (
            <EmptyState message="Analyze sector momentum and Relative Rotation Graph (RRG) quadrant positioning." />
          )}
        </div>
      </Section>

      {/* ── Monte Carlo Simulation ── */}
      <Section title="Monte Carlo Simulation" icon={Cpu}>
        <div className="space-y-4">
          <Button onClick={runMC} disabled={loadingMonteCarlo}>
            {loadingMonteCarlo ? (
              <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Simulating...</>
            ) : (
              'Run Simulation'
            )}
          </Button>

          {errorMonteCarlo && <ErrorNotice message={errorMonteCarlo} />}

          {monteCarloResult && (
            <div className="space-y-4">
              {/* Summary stats */}
              <div className="grid gap-3 sm:grid-cols-3">
                <StatCard
                  label="Prob. of Loss"
                  value={`${(monteCarloResult.prob_of_loss * 100).toFixed(1)}%`}
                  valueClass={monteCarloResult.prob_of_loss > 0.4 ? 'text-red-600' : 'text-green-600'}
                />
                <StatCard
                  label="Expected Final Value"
                  value={`$${monteCarloResult.expected_final_value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                />
                <StatCard
                  label="Expected Return"
                  value={`${(monteCarloResult.expected_return * 100).toFixed(2)}%`}
                  valueClass={monteCarloResult.expected_return >= 0 ? 'text-green-600' : 'text-red-600'}
                />
              </div>

              <MonteCarloChart result={monteCarloResult} />

              <p className="text-xs text-muted-foreground">
                {monteCarloResult.n_simulations.toLocaleString()} simulations ·{' '}
                {monteCarloResult.horizon_days}-day horizon ·{' '}
                Initial value: ${monteCarloResult.initial_value.toLocaleString()}
              </p>

              {monteCarloResult.explanation && (
                <ExplanationCard explanation={monteCarloResult.explanation} />
              )}
            </div>
          )}

          {!monteCarloResult && !loadingMonteCarlo && !errorMonteCarlo && (
            <EmptyState message="Simulate portfolio outcomes across 1,000 paths using Geometric Brownian Motion." />
          )}
        </div>
      </Section>
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function PortfolioStats({ p }: { p: { weights: Record<string, number>; expected_return: number; volatility: number; sharpe_ratio: number } }) {
  return (
    <div className="space-y-1.5 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Expected Return</span>
        <span className="font-medium">{(p.expected_return * 100).toFixed(2)}%</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Volatility</span>
        <span className="font-medium">{(p.volatility * 100).toFixed(2)}%</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Sharpe Ratio</span>
        <span className="font-medium">{p.sharpe_ratio.toFixed(2)}</span>
      </div>
      <div className="pt-2 border-t space-y-1">
        {Object.entries(p.weights).map(([sym, w]) => (
          <div key={sym} className="flex justify-between text-xs">
            <span className="text-muted-foreground">{sym}</span>
            <span>{(w * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('text-lg font-bold mt-0.5', valueClass)}>{value}</p>
    </div>
  );
}

function ExplanationCard({ explanation }: { explanation: { summary: string; key_factors: string[]; limitations: string[] } }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4 space-y-3 text-sm">
      <p className="text-muted-foreground">{explanation.summary}</p>
      {explanation.key_factors.length > 0 && (
        <div>
          <p className="font-medium text-xs mb-1.5">Key Factors</p>
          <ul className="list-disc list-inside space-y-0.5 text-xs text-muted-foreground">
            {explanation.key_factors.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </div>
      )}
      {explanation.limitations.length > 0 && (
        <div className="border-t pt-2">
          <p className="font-medium text-xs mb-1">Limitations</p>
          <ul className="list-disc list-inside space-y-0.5 text-xs text-muted-foreground">
            {explanation.limitations.map((l, i) => <li key={i}>{l}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed bg-muted/30 py-8 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

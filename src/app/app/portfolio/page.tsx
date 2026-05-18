'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  Building2,
  ChevronDown,
  ChevronRight,
  Leaf,
  Loader2,
  PieChart,
  RefreshCw,
  Shield,
  Shuffle,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  getAttribution,
  getCorrelation,
  getRebalance,
  runStressTest,
  getTaxLoss,
  getBenchmarks,
  getBenchmarkComparison,
  getPortfolioSummary,
  getWashSaleScan,
  getRealVsPaperComparison,
  listBrokerConnections,
  getBrokerHoldings,
  type AttributionResponse,
  type CorrelationResponse,
  type RebalanceResponse,
  type StressTestResponse,
  type TaxLossResponse,
  type Benchmark,
  type BenchmarkComparisonResult,
  type HoldingInput,
  type PlaidHolding,
  type PortfolioSummary,
  type PortfolioPeriod,
  type WashSaleScanResult,
  type RealVsPaperResult,
} from '@/lib/api/portfolio';

// ── Demo fallback helpers ──────────────────────────────────────────────────────
// Used only when no broker account is connected.

const DEMO_HOLDINGS: HoldingInput[] = [
  { symbol: 'AAPL', weight: 0.25, sector: 'Technology', return_pct: 0.032 },
  { symbol: 'MSFT', weight: 0.20, sector: 'Technology', return_pct: 0.028 },
  { symbol: 'JPM',  weight: 0.15, sector: 'Financials', return_pct: 0.019 },
  { symbol: 'XOM',  weight: 0.10, sector: 'Energy',     return_pct: 0.041 },
  { symbol: 'JNJ',  weight: 0.10, sector: 'Healthcare', return_pct: 0.012 },
  { symbol: 'AMZN', weight: 0.20, sector: 'Consumer Disc.', return_pct: 0.022 },
];

const DEMO_POSITIONS = [
  { symbol: 'AAPL', cost_basis: 185.00, current_price: 172.50, quantity: 50 },
  { symbol: 'NFLX', cost_basis: 520.00, current_price: 445.00, quantity: 10 },
  { symbol: 'INTC', cost_basis: 38.00,  current_price: 21.50,  quantity: 200 },
  { symbol: 'PFE',  cost_basis: 32.00,  current_price: 26.80,  quantity: 100 },
];

type Position = { symbol: string; cost_basis: number; current_price: number; quantity: number };

function plaidToHoldings(plaid: PlaidHolding[]): { holdings: HoldingInput[]; positions: Position[] } {
  const totalValue = plaid.reduce((sum, h) => sum + h.institution_value, 0);
  const holdings: HoldingInput[] = plaid.map(h => ({
    symbol: h.symbol,
    weight: totalValue > 0 ? h.institution_value / totalValue : 0,
    return_pct: h.cost_basis != null && h.cost_basis > 0
      ? (h.institution_price - h.cost_basis) / h.cost_basis
      : undefined,
  }));
  const positions: Position[] = plaid
    .filter(h => h.cost_basis != null && h.cost_basis > 0)
    .map(h => ({
      symbol: h.symbol,
      cost_basis: h.cost_basis!,
      current_price: h.institution_price,
      quantity: h.quantity,
    }));
  return { holdings, positions };
}

// ── Tab config ────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'portfolio',  label: 'My Portfolio', icon: PieChart },
  { id: 'vs-paper',   label: 'vs Paper',     icon: BarChart3 },
  { id: 'wash-sales', label: 'Wash Sales',   icon: Leaf },
  { id: 'benchmarks', label: 'Benchmarks',   icon: Shield },
  { id: 'tools',      label: 'Tools',        icon: Zap },
] as const;

type TabId = (typeof TABS)[number]['id'];

// ── Shared sub-components ─────────────────────────────────────────────────────

function Section({ title, icon: Icon, children, defaultOpen = false }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-primary" />
          <span className="font-semibold">{title}</span>
        </div>
        {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="border-t px-5 py-4">{children}</div>}
    </div>
  );
}

function Disclaimer({ text }: { text: string }) {
  return <p className="mt-3 text-xs text-muted-foreground bg-muted/40 rounded p-2">{text}</p>;
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="rounded-lg border bg-card/60 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('text-xl font-bold tabular-nums', accent)}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function EmptyState({ icon: Icon, title, description, action }: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <Icon className="h-10 w-10 text-muted-foreground/40" />
      <p className="font-semibold text-sm">{title}</p>
      <p className="text-xs text-muted-foreground max-w-sm">{description}</p>
      {action}
    </div>
  );
}

// ── Tools Tab ─────────────────────────────────────────────────────────────────

function ToolsTab() {
  const [attribution, setAttribution] = useState<AttributionResponse | null>(null);
  const [rebalance, setRebalance] = useState<RebalanceResponse | null>(null);
  const [stress, setStress] = useState<StressTestResponse | null>(null);
  const [taxLoss, setTaxLoss] = useState<TaxLossResponse | null>(null);
  const [correlation, setCorrelation] = useState<CorrelationResponse | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [realHoldings, setRealHoldings] = useState<HoldingInput[] | null>(null);
  const [realPositions, setRealPositions] = useState<Position[] | null>(null);
  const [holdingsReady, setHoldingsReady] = useState(false);

  useEffect(() => {
    async function loadRealHoldings() {
      try {
        const connections = await listBrokerConnections();
        const active = connections.filter(c => c.connection_status === 'active');
        if (active.length === 0) return;
        const results = await Promise.allSettled(active.map(c => getBrokerHoldings(c.id)));
        const allPlaid: PlaidHolding[] = [];
        results.forEach(r => { if (r.status === 'fulfilled') allPlaid.push(...r.value.holdings); });
        if (allPlaid.length > 0) {
          const { holdings, positions } = plaidToHoldings(allPlaid);
          setRealHoldings(holdings);
          setRealPositions(positions);
        }
      } catch {
        // silently fall back to demo data
      } finally {
        setHoldingsReady(true);
      }
    }
    loadRealHoldings();
  }, []);

  const holdings = realHoldings ?? DEMO_HOLDINGS;
  const positions = realPositions ?? DEMO_POSITIONS;
  const isDemo = realHoldings === null;
  const portfolioLabel = isDemo ? '(demo portfolio)' : '(your portfolio)';

  async function run(key: string, fn: () => Promise<void>) {
    setLoading(l => ({ ...l, [key]: true }));
    setErrors(e => ({ ...e, [key]: '' }));
    try { await fn(); } catch (err: any) {
      setErrors(e => ({ ...e, [key]: err?.response?.data?.detail || 'Request failed' }));
    } finally {
      setLoading(l => ({ ...l, [key]: false }));
    }
  }

  if (!holdingsReady) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      {isDemo && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800 p-3 text-xs text-blue-800 dark:text-blue-300">
          Running on a <strong>demo portfolio</strong> — these results are illustrative only.{' '}
          <Link href="/app/brokers" className="underline font-medium">Connect a broker</Link> to run tools on your real holdings.
        </div>
      )}

      {/* Performance Attribution */}
      <Section title="Performance Attribution" icon={BarChart3} defaultOpen>
        <p className="text-sm text-muted-foreground mb-4">
          Decompose your portfolio's active return into allocation, selection, and interaction effects vs the S&P 500 benchmark (Brinson model).
        </p>
        <Button
          size="sm"
          onClick={() => run('attribution', async () => setAttribution(await getAttribution({ holdings, benchmark_symbol: 'SPY', period_days: 30 })))}
          disabled={loading.attribution}
        >
          {loading.attribution ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Run Attribution {portfolioLabel}
        </Button>
        {errors.attribution && <p className="text-sm text-destructive mt-2">{errors.attribution}</p>}
        {attribution && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="Portfolio Return" value={`${(attribution.portfolio_return * 100).toFixed(2)}%`} accent={attribution.portfolio_return >= 0 ? 'text-green-600' : 'text-red-600'} />
              <StatCard label="Benchmark Return" value={`${(attribution.benchmark_return * 100).toFixed(2)}%`} />
              <StatCard label="Active Return" value={`${(attribution.active_return * 100).toFixed(2)}%`} accent={attribution.active_return >= 0 ? 'text-green-600' : 'text-red-600'} />
              <StatCard label="Selection Effect" value={`${(attribution.selection_effect * 100).toFixed(2)}%`} />
            </div>
            <div className="rounded-lg border overflow-hidden overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Sector</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">Port. Wt</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">Bench. Wt</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">Alloc.</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">Select.</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {attribution.sector_attribution.map(s => (
                    <tr key={s.sector} className="hover:bg-muted/20">
                      <td className="px-3 py-2 font-medium">{s.sector}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{(s.portfolio_weight * 100).toFixed(1)}%</td>
                      <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{(s.benchmark_weight * 100).toFixed(1)}%</td>
                      <td className={cn('px-3 py-2 text-right tabular-nums', s.allocation_effect >= 0 ? 'text-green-600' : 'text-red-600')}>
                        {(s.allocation_effect * 100).toFixed(3)}%
                      </td>
                      <td className={cn('px-3 py-2 text-right tabular-nums', s.selection_effect >= 0 ? 'text-green-600' : 'text-red-600')}>
                        {(s.selection_effect * 100).toFixed(3)}%
                      </td>
                      <td className={cn('px-3 py-2 text-right tabular-nums font-medium', s.total_effect >= 0 ? 'text-green-600' : 'text-red-600')}>
                        {(s.total_effect * 100).toFixed(3)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Disclaimer text={attribution.disclaimer} />
          </div>
        )}
      </Section>

      {/* Portfolio Stress Test */}
      <Section title="Multi-Scenario Stress Test" icon={Shield}>
        <p className="text-sm text-muted-foreground mb-4">
          Test your portfolio against 8 historical and hypothetical market crisis scenarios.
        </p>
        <Button
          size="sm"
          onClick={() => run('stress', async () => setStress(await runStressTest({ holdings, portfolio_value: 100000 })))}
          disabled={loading.stress}
        >
          {loading.stress ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Run Stress Test {portfolioLabel}
        </Button>
        {errors.stress && <p className="text-sm text-destructive mt-2">{errors.stress}</p>}
        {stress && (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-muted-foreground">Worst scenario: <strong className="text-destructive">{stress.max_drawdown_scenario}</strong></p>
            {stress.scenarios.map(sc => (
              <div key={sc.scenario} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                <div>
                  <p className="font-medium">{sc.scenario}</p>
                  <p className="text-xs text-muted-foreground">{sc.description}</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className={cn('font-bold tabular-nums', sc.portfolio_impact_pct < 0 ? 'text-red-600' : 'text-green-600')}>
                    {sc.portfolio_impact_pct.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground">${Math.abs(sc.portfolio_impact_usd).toLocaleString()}</p>
                </div>
              </div>
            ))}
            <Disclaimer text={stress.disclaimer} />
          </div>
        )}
      </Section>

      {/* Tax-Loss Harvesting */}
      <Section title="Tax-Loss Harvesting" icon={Leaf}>
        <p className="text-sm text-muted-foreground mb-4">
          Identify unrealized losses eligible for tax-loss harvesting. Flags wash-sale rule risks.
        </p>
        <Button
          size="sm"
          onClick={() => run('taxloss', async () => setTaxLoss(await getTaxLoss({ positions, tax_rate: 0.35 })))}
          disabled={loading.taxloss}
        >
          {loading.taxloss ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Scan for Opportunities {portfolioLabel}
        </Button>
        {errors.taxloss && <p className="text-sm text-destructive mt-2">{errors.taxloss}</p>}
        {taxLoss && (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Harvestable Loss" value={`$${Math.abs(taxLoss.total_harvestable_loss).toLocaleString()}`} accent="text-red-600" />
              <StatCard label="Potential Tax Savings" value={`$${taxLoss.total_potential_savings.toFixed(0)}`} accent="text-green-600" />
            </div>
            {taxLoss.opportunities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No loss positions found in the demo portfolio.</p>
            ) : (
              taxLoss.opportunities.map(opp => (
                <div key={opp.symbol} className="rounded-lg border p-3 text-sm space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{opp.symbol}</span>
                    <span className="text-red-600 font-mono">${opp.unrealized_loss.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{opp.notes}</p>
                  {opp.suggested_replacement && (
                    <p className="text-xs">Suggested replacement: <strong>{opp.suggested_replacement}</strong></p>
                  )}
                  {opp.wash_sale_risk && (
                    <p className="text-xs text-amber-600">⚠ Wash sale window ends {opp.wash_sale_window_end}</p>
                  )}
                </div>
              ))
            )}
            <Disclaimer text={taxLoss.disclaimer} />
          </div>
        )}
      </Section>

      {/* Correlation Analysis */}
      <Section title="Correlation & Diversification" icon={PieChart}>
        <p className="text-sm text-muted-foreground mb-4">
          Analyze pairwise correlations and portfolio diversification score.
        </p>
        <Button
          size="sm"
          onClick={() => run('corr', async () => setCorrelation(await getCorrelation(holdings.map(h => h.symbol))))}
          disabled={loading.corr}
        >
          {loading.corr ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Analyze Correlations {portfolioLabel}
        </Button>
        {errors.corr && <p className="text-sm text-destructive mt-2">{errors.corr}</p>}
        {correlation && (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Diversification Score"
                value={`${(correlation.diversification_score * 100).toFixed(0)}%`}
                accent={correlation.diversification_score > 0.6 ? 'text-green-600' : 'text-amber-600'}
                sub={`Concentration risk: ${correlation.concentration_risk}`}
              />
              <StatCard label="High Correlation Pairs" value={String(correlation.highly_correlated_pairs.length)} />
            </div>
            {correlation.highly_correlated_pairs.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">High Correlation Pairs</p>
                {correlation.highly_correlated_pairs.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-sm rounded border p-2">
                    <span>{p.pair[0]} — {p.pair[1]}</span>
                    <span className="font-mono text-amber-600">{p.correlation.toFixed(3)}</span>
                  </div>
                ))}
              </div>
            )}
            <Disclaimer text={correlation.disclaimer} />
          </div>
        )}
      </Section>

      {/* Rebalancing */}
      <Section title="Rebalancing Recommendations" icon={Shuffle}>
        <p className="text-sm text-muted-foreground mb-4">
          Calculate trades needed to rebalance your portfolio toward target weights.
        </p>
        <Button
          size="sm"
          onClick={() => {
            const equalWeight = 1 / holdings.length;
            const targetWeights = Object.fromEntries(holdings.map(h => [h.symbol, equalWeight]));
            run('rebalance', async () => setRebalance(await getRebalance({
              holdings,
              target_weights: targetWeights,
              portfolio_value: 100000,
            })));
          }}
          disabled={loading.rebalance}
        >
          {loading.rebalance ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Calculate Rebalance Trades {portfolioLabel}
        </Button>
        {errors.rebalance && <p className="text-sm text-destructive mt-2">{errors.rebalance}</p>}
        {rebalance && (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Total Turnover" value={`${rebalance.total_turnover_pct.toFixed(1)}%`} />
              <StatCard label="Estimated Cost" value={`$${rebalance.estimated_cost.toFixed(2)}`} />
            </div>
            <div className="rounded-lg border overflow-hidden overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Symbol</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">Current</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">Target</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">Action</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rebalance.trades.map(t => (
                    <tr key={t.symbol} className="hover:bg-muted/20">
                      <td className="px-3 py-2 font-medium">{t.symbol}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{(t.current_weight * 100).toFixed(1)}%</td>
                      <td className="px-3 py-2 text-right tabular-nums">{(t.target_weight * 100).toFixed(1)}%</td>
                      <td className={cn('px-3 py-2 text-right font-medium capitalize', t.action === 'buy' ? 'text-green-600' : 'text-red-600')}>{t.action}</td>
                      <td className="px-3 py-2 text-right tabular-nums">${t.estimated_value.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Disclaimer text={rebalance.disclaimer} />
          </div>
        )}
      </Section>
    </div>
  );
}

// ── Period filter ─────────────────────────────────────────────────────────────

const PERIODS: { value: PortfolioPeriod; label: string }[] = [
  { value: '1d',  label: '1D' },
  { value: '1w',  label: '1W' },
  { value: '1m',  label: '1M' },
  { value: '3m',  label: '3M' },
  { value: 'ytd', label: 'YTD' },
  { value: 'all', label: 'All' },
];

const PERIOD_PL_LABEL: Record<PortfolioPeriod, string> = {
  '1d':  '1-Day P&L',
  '1w':  '1-Week P&L',
  '1m':  '1-Month P&L',
  '3m':  '3-Month P&L',
  'ytd': 'YTD P&L',
  'all': 'Unrealized P&L',
};

const PERIOD_RETURN_LABEL: Record<PortfolioPeriod, string> = {
  '1d':  '1-Day Return',
  '1w':  '1-Week Return',
  '1m':  '1-Month Return',
  '3m':  '3-Month Return',
  'ytd': 'YTD Return',
  'all': 'Total Return',
};

// ── My Portfolio Tab ──────────────────────────────────────────────────────────

function MyPortfolioTab() {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodLoading, setPeriodLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<PortfolioPeriod>('all');

  const load = async (p: PortfolioPeriod = period, isInitial = false) => {
    if (isInitial) setLoading(true);
    else setPeriodLoading(true);
    setError(null);
    try {
      const data = await getPortfolioSummary(p);
      setSummary(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load portfolio');
    } finally {
      setLoading(false);
      setPeriodLoading(false);
    }
  };

  useEffect(() => { load(period, true); }, []);

  const handlePeriodChange = (p: PortfolioPeriod) => {
    setPeriod(p);
    load(p, false);
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (error) return <div className="flex flex-col items-center gap-3 py-12 text-center"><AlertCircle className="h-8 w-8 text-destructive" /><p className="text-sm text-destructive">{error}</p><Button size="sm" variant="outline" onClick={() => load(period, true)}>Retry</Button></div>;

  if (!summary || summary.holding_count === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="No broker connections"
        description="Connect a brokerage account to see your real portfolio here."
        action={<Button asChild size="sm"><Link href="/app/brokers">Connect Broker</Link></Button>}
      />
    );
  }

  const isProfit = summary.unrealized_pl >= 0;
  const plColor = isProfit ? 'text-green-600' : 'text-red-500';
  const activePeriod = summary.period ?? period;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          {summary.holding_count} Holdings · {summary.connections.length} Connection{summary.connections.length !== 1 ? 's' : ''}
        </h2>
        <div className="flex items-center gap-2">
          {/* Period filter */}
          <div className="flex items-center rounded-lg border bg-muted p-0.5 gap-0.5">
            {PERIODS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handlePeriodChange(value)}
                disabled={periodLoading}
                className={cn(
                  'rounded px-2.5 py-1 text-xs font-medium transition-colors',
                  activePeriod === value
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <Button size="sm" variant="ghost" onClick={() => load(period, true)} className="gap-1.5" disabled={periodLoading || loading}>
            <RefreshCw className={cn('h-3.5 w-3.5', (periodLoading || loading) && 'animate-spin')} /> Refresh
          </Button>
        </div>
      </div>

      {/* Stats — always 4 cards when cost basis is available */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Total Value"
          value={`$${summary.total_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        />
        {summary.total_cost_basis > 0 && (
          <StatCard
            label="Cost Basis"
            value={`$${summary.total_cost_basis.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          />
        )}
        <StatCard
          label={PERIOD_PL_LABEL[activePeriod]}
          value={periodLoading ? '—' : `${isProfit ? '+' : '-'}$${Math.abs(summary.unrealized_pl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          accent={periodLoading ? undefined : plColor}
        />
        <StatCard
          label={PERIOD_RETURN_LABEL[activePeriod]}
          value={periodLoading ? '—' : `${isProfit ? '+' : '-'}${Math.abs(summary.unrealized_pl_pct).toFixed(2)}%`}
          accent={periodLoading ? undefined : plColor}
        />
      </div>

      {/* Sector allocation */}
      {summary.sector_allocation.length > 0 && (
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <p className="font-semibold text-sm">Sector Allocation</p>
          <div className="space-y-2">
            {summary.sector_allocation.map(s => (
              <div key={s.sector} className="flex items-center gap-3">
                <span className="text-xs w-40 truncate text-muted-foreground">{s.sector}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(s.weight, 100)}%` }} />
                </div>
                <span className="text-xs tabular-nums w-16 text-right">{s.weight.toFixed(1)}%</span>
                <span className="text-xs tabular-nums w-20 text-right text-muted-foreground">
                  ${s.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connection breakdown */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <p className="font-semibold text-sm">Connections</p>
        <div className="space-y-2">
          {summary.connections.map(conn => (
            <div key={conn.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {conn.logo ? (
                  <img
                    src={conn.logo.startsWith('data:') ? conn.logo : `data:image/png;base64,${conn.logo}`}
                    alt={conn.display_name}
                    className="h-6 w-6 rounded object-contain bg-white"
                  />
                ) : (
                  <div className="h-6 w-6 rounded bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                    {(conn.display_name ?? '?')[0].toUpperCase()}
                  </div>
                )}
                <span className="font-medium">{conn.display_name}</span>
                <span className="text-xs text-muted-foreground">{conn.holding_count} holdings</span>
              </div>
              <div className="text-right">
                <p className="font-semibold tabular-nums">${conn.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                {conn.last_sync_at && (
                  <p className="text-xs text-muted-foreground">
                    Synced {new Date(conn.last_sync_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
        <Link href="/app/brokers" className="text-xs text-primary hover:underline">
          Manage connections →
        </Link>
      </div>

      <Disclaimer text={summary.disclaimer} />
    </div>
  );
}

// ── vs Paper Tab ──────────────────────────────────────────────────────────────

function VsPaperTab() {
  const [data, setData] = useState<RealVsPaperResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getRealVsPaperComparison());
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load comparison');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (error) return <div className="flex flex-col items-center gap-3 py-12 text-center"><AlertCircle className="h-8 w-8 text-destructive" /><p className="text-sm text-destructive">{error}</p><Button size="sm" variant="outline" onClick={load}>Retry</Button></div>;

  if (!data) return null;

  const real = data.real_portfolio;
  const paper = data.paper_portfolio;
  const realPl = real.unrealized_pl;
  const paperPl = paper.unrealized_pl;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Side-by-side comparison of your real and paper portfolios.</p>
        <Button size="sm" variant="ghost" onClick={load} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Real */}
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <p className="font-semibold text-sm">Real Portfolio</p>
          </div>
          {real.holding_count === 0 ? (
            <p className="text-xs text-muted-foreground">No connected broker accounts.</p>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Value</span>
                <span className="font-semibold tabular-nums">${real.total_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              {real.total_cost_basis > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cost Basis</span>
                    <span className="tabular-nums">${real.total_cost_basis.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Unrealized P&L</span>
                    <span className={cn('font-semibold tabular-nums', realPl >= 0 ? 'text-green-600' : 'text-red-500')}>
                      {realPl >= 0 ? '+' : '-'}${Math.abs(realPl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({realPl >= 0 ? '+' : '-'}{Math.abs(real.unrealized_pl_pct).toFixed(2)}%)
                    </span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Holdings</span>
                <span className="tabular-nums">{real.holding_count}</span>
              </div>
            </div>
          )}
        </div>

        {/* Paper */}
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-purple-500" />
            <p className="font-semibold text-sm">Paper Portfolio</p>
          </div>
          {paper.account_count === 0 ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">No paper trading accounts.</p>
              <Link href="/app/paper" className="text-xs text-primary hover:underline">Start paper trading →</Link>
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Value</span>
                <span className="font-semibold tabular-nums">${paper.total_equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Positions Value</span>
                <span className="tabular-nums">${(paper.positions_value ?? paper.total_equity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cash Available</span>
                <span className="tabular-nums">${(paper.cash_balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              {paper.total_cost_basis > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cost Basis</span>
                    <span className="tabular-nums">${paper.total_cost_basis.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Unrealized P&L</span>
                    <span className={cn('font-semibold tabular-nums', paperPl >= 0 ? 'text-green-600' : 'text-red-500')}>
                      {paperPl >= 0 ? '+' : '-'}${Math.abs(paperPl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({paperPl >= 0 ? '+' : '-'}{Math.abs(paper.unrealized_pl_pct).toFixed(2)}%)
                    </span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Positions</span>
                <span className="tabular-nums">{paper.position_count} ({paper.account_count} account{paper.account_count !== 1 ? 's' : ''})</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Shared symbols */}
      {data.shared_symbols.length > 0 && (
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <p className="font-semibold text-sm">Shared Positions ({data.shared_symbols.length})</p>
          <div className="rounded-lg border overflow-hidden overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Symbol</th>
                  <th className="px-3 py-2 text-right font-medium text-blue-500">Real Value</th>
                  <th className="px-3 py-2 text-right font-medium text-blue-500">Real Qty</th>
                  <th className="px-3 py-2 text-right font-medium text-purple-500">Paper Value</th>
                  <th className="px-3 py-2 text-right font-medium text-purple-500">Paper Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.shared_symbols.map(s => (
                  <tr key={s.symbol} className="hover:bg-muted/20">
                    <td className="px-3 py-2 font-semibold">{s.symbol}</td>
                    <td className="px-3 py-2 text-right tabular-nums">${s.real_value.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{s.real_quantity}</td>
                    <td className="px-3 py-2 text-right tabular-nums">${s.paper_value.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{s.paper_quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Disclaimer text={data.disclaimer} />
    </div>
  );
}

// ── Wash Sales Tab ────────────────────────────────────────────────────────────

function WashSalesTab() {
  const [data, setData] = useState<WashSaleScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getWashSaleScan());
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to run scan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (error) return <div className="flex flex-col items-center gap-3 py-12 text-center"><AlertCircle className="h-8 w-8 text-destructive" /><p className="text-sm text-destructive">{error}</p><Button size="sm" variant="outline" onClick={load}>Retry</Button></div>;

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Holdings with unrealized losses that could trigger wash-sale rules if sold and repurchased within 30 days.
          </p>
        </div>
        <Button size="sm" variant="ghost" onClick={load} className="gap-1.5 shrink-0">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {data.total_flagged > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Flagged Holdings" value={String(data.total_flagged)} accent="text-amber-600" />
          <StatCard
            label="Total Unrealized Loss"
            value={`-$${Math.abs(data.total_unrealized_loss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            accent="text-red-600"
          />
        </div>
      )}

      {data.total_flagged === 0 ? (
        <EmptyState
          icon={Leaf}
          title="No wash-sale risk detected"
          description="None of your current holdings have unrealized losses that would trigger wash-sale rules."
        />
      ) : (
        <div className="space-y-3">
          {data.flagged_holdings.map(h => (
            <div key={`${h.symbol}-${h.broker}`} className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{h.symbol}</span>
                  <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{h.broker}</span>
                </div>
                <span className="text-red-600 font-semibold tabular-nums">
                  -${Math.abs(h.unrealized_loss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <span className="text-xs ml-1">({h.unrealized_loss_pct.toFixed(1)}%)</span>
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                <div>Qty: <span className="font-medium text-foreground">{h.quantity}</span></div>
                <div>Cost: <span className="font-medium text-foreground">${h.cost_basis.toLocaleString()}</span></div>
                <div>Value: <span className="font-medium text-foreground">${h.institution_value.toLocaleString()}</span></div>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded px-2 py-1.5">
                ⚠ {h.notes}
              </p>
            </div>
          ))}
        </div>
      )}

      <Disclaimer text={data.disclaimer} />
    </div>
  );
}

// ── Benchmarks Tab ────────────────────────────────────────────────────────────

function BenchmarksTab() {
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [comparison, setComparison] = useState<BenchmarkComparisonResult | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [compLoading, setCompLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getBenchmarks()
      .then(setBenchmarks)
      .catch((err: any) => setError(err?.response?.data?.detail || 'Failed to load benchmarks'))
      .finally(() => setLoading(false));
  }, []);

  const runComparison = async (id: string) => {
    setSelectedId(id);
    setCompLoading(true);
    setComparison(null);
    try {
      setComparison(await getBenchmarkComparison(id));
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Comparison failed');
    } finally {
      setCompLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      {benchmarks.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No custom benchmarks"
          description="Create a custom benchmark in the Tools tab using the Portfolio Attribution tool to compare your real holdings against it."
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Select a benchmark to compare your real portfolio allocation against it.
          </p>
          <div className="space-y-2">
            {benchmarks.map(bm => (
              <div
                key={bm.id}
                className={cn(
                  'flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-muted/30 transition-colors',
                  selectedId === bm.id && 'border-primary bg-primary/5'
                )}
                onClick={() => runComparison(bm.id)}
              >
                <div>
                  <p className="font-medium text-sm">{bm.name}</p>
                  {bm.description && <p className="text-xs text-muted-foreground">{bm.description}</p>}
                  <p className="text-xs text-muted-foreground">{bm.components.length} components</p>
                </div>
                <Button size="sm" variant={selectedId === bm.id ? 'default' : 'outline'} disabled={compLoading && selectedId === bm.id}>
                  {compLoading && selectedId === bm.id ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                  Compare
                </Button>
              </div>
            ))}
          </div>

          {comparison && (
            <div className="rounded-xl border bg-card p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm">vs {comparison.benchmark_name}</p>
                <span className="text-xs text-muted-foreground">
                  Portfolio: ${comparison.total_portfolio_value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Symbol</th>
                      <th className="px-3 py-2 text-right font-medium text-muted-foreground">Your Wt</th>
                      <th className="px-3 py-2 text-right font-medium text-muted-foreground">Benchmark</th>
                      <th className="px-3 py-2 text-right font-medium text-muted-foreground">Diff</th>
                      <th className="px-3 py-2 text-right font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {comparison.comparisons.map(c => (
                      <tr key={c.symbol} className="hover:bg-muted/20">
                        <td className="px-3 py-2 font-semibold">{c.symbol}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{c.real_weight.toFixed(2)}%</td>
                        <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{c.benchmark_weight.toFixed(2)}%</td>
                        <td className={cn('px-3 py-2 text-right tabular-nums font-medium', c.difference > 0 ? 'text-blue-600' : c.difference < 0 ? 'text-red-500' : 'text-muted-foreground')}>
                          {c.difference > 0 ? '+' : ''}{c.difference.toFixed(2)}%
                        </td>
                        <td className="px-3 py-2 text-right">
                          <span className={cn('text-xs px-1.5 py-0.5 rounded font-medium',
                            c.status === 'overweight' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                            c.status === 'underweight' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' :
                            'bg-muted text-muted-foreground'
                          )}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Disclaimer text={comparison.disclaimer} />
            </div>
          )}
        </>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState<TabId>('portfolio');

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Portfolio Management</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Advanced analytics for portfolio optimization, attribution, and risk management.
        </p>
      </div>

      <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-3 text-xs text-amber-800 dark:text-amber-300">
        <strong>Disclaimer:</strong> All portfolio analysis is educational and analytical only.
        No investment advice, trade execution, or profit guarantee. Consult a qualified financial advisor.
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-lg border bg-muted p-1">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors flex-1 justify-center',
                activeTab === tab.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'tools'      && <ToolsTab />}
      {activeTab === 'portfolio'  && <MyPortfolioTab />}
      {activeTab === 'vs-paper'   && <VsPaperTab />}
      {activeTab === 'wash-sales' && <WashSalesTab />}
      {activeTab === 'benchmarks' && <BenchmarksTab />}
    </div>
  );
}

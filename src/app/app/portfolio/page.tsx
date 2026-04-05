'use client';

import { useState } from 'react';
import {
  AlertCircle,
  BarChart3,
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
  type AttributionResponse,
  type CorrelationResponse,
  type RebalanceResponse,
  type StressTestResponse,
  type TaxLossResponse,
} from '@/lib/api/portfolio';

// ── Demo helpers ──────────────────────────────────────────────────────────────

const DEMO_HOLDINGS = [
  { symbol: 'AAPL', weight: 0.25, sector: 'Technology', return_pct: 0.032 },
  { symbol: 'MSFT', weight: 0.20, sector: 'Technology', return_pct: 0.028 },
  { symbol: 'JPM',  weight: 0.15, sector: 'Financials', return_pct: 0.019 },
  { symbol: 'XOM',  weight: 0.10, sector: 'Energy',     return_pct: 0.041 },
  { symbol: 'JNJ',  weight: 0.10, sector: 'Healthcare', return_pct: 0.012 },
  { symbol: 'AMZN', weight: 0.20, sector: 'Consumer Disc.', return_pct: 0.022 },
];

const DEMO_POSITIONS = [
  { symbol: 'AAPL', cost_basis: 185.00, current_price: 172.50, quantity: 50, purchase_date: '2024-11-01' },
  { symbol: 'NFLX', cost_basis: 520.00, current_price: 445.00, quantity: 10, purchase_date: '2024-09-15' },
  { symbol: 'INTC', cost_basis: 38.00,  current_price: 21.50,  quantity: 200, purchase_date: '2024-03-10' },
  { symbol: 'PFE',  cost_basis: 32.00,  current_price: 26.80,  quantity: 100, purchase_date: '2024-06-20' },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

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
  return (
    <p className="mt-3 text-xs text-muted-foreground bg-muted/40 rounded p-2">{text}</p>
  );
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

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function PortfolioPage() {
  const [attribution, setAttribution] = useState<AttributionResponse | null>(null);
  const [rebalance, setRebalance] = useState<RebalanceResponse | null>(null);
  const [stress, setStress] = useState<StressTestResponse | null>(null);
  const [taxLoss, setTaxLoss] = useState<TaxLossResponse | null>(null);
  const [correlation, setCorrelation] = useState<CorrelationResponse | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function run(key: string, fn: () => Promise<void>) {
    setLoading(l => ({ ...l, [key]: true }));
    setErrors(e => ({ ...e, [key]: '' }));
    try { await fn(); } catch (err: any) {
      setErrors(e => ({ ...e, [key]: err?.response?.data?.detail || 'Request failed' }));
    } finally {
      setLoading(l => ({ ...l, [key]: false }));
    }
  }

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

      {/* Performance Attribution */}
      <Section title="Performance Attribution" icon={BarChart3} defaultOpen>
        <p className="text-sm text-muted-foreground mb-4">
          Decompose your portfolio's active return into allocation, selection, and interaction effects vs the S&P 500 benchmark (Brinson model).
        </p>
        <Button
          size="sm"
          onClick={() => run('attribution', async () => setAttribution(await getAttribution({ holdings: DEMO_HOLDINGS, benchmark_symbol: 'SPY', period_days: 30 })))}
          disabled={loading.attribution}
        >
          {loading.attribution ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Run Attribution (Demo Portfolio)
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
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
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
          onClick={() => run('stress', async () => setStress(await runStressTest({ holdings: DEMO_HOLDINGS, portfolio_value: 100000 })))}
          disabled={loading.stress}
        >
          {loading.stress ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Run Stress Test ($100K portfolio)
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
          onClick={() => run('taxloss', async () => setTaxLoss(await getTaxLoss({ positions: DEMO_POSITIONS, tax_rate: 0.35 })))}
          disabled={loading.taxloss}
        >
          {loading.taxloss ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Scan for Opportunities
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
          onClick={() => run('corr', async () => setCorrelation(await getCorrelation(DEMO_HOLDINGS.map(h => h.symbol))))}
          disabled={loading.corr}
        >
          {loading.corr ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Analyze Correlations
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
          onClick={() => run('rebalance', async () => setRebalance(await getRebalance({
            holdings: DEMO_HOLDINGS,
            target_weights: { AAPL: 0.20, MSFT: 0.20, JPM: 0.15, XOM: 0.10, JNJ: 0.15, AMZN: 0.20 },
            portfolio_value: 100000,
          })))}
          disabled={loading.rebalance}
        >
          {loading.rebalance ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Calculate Rebalance Trades
        </Button>
        {errors.rebalance && <p className="text-sm text-destructive mt-2">{errors.rebalance}</p>}
        {rebalance && (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Total Turnover" value={`${rebalance.total_turnover_pct.toFixed(1)}%`} />
              <StatCard label="Estimated Cost" value={`$${rebalance.estimated_cost.toFixed(2)}`} />
            </div>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
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

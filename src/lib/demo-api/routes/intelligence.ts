/**
 * Intelligence: market regime, portfolio risk, Monte Carlo simulation and the
 * strategy assistant. Regime and risk are computed from the shared price series.
 */
import { SUBSYSTEM_VERSIONS } from '../../versioning';
import { averageOffDiagonal, correlationMatrix, normalizeWeights, portfolioReturns, riskStats } from '../analytics';
import { DemoHttpError } from '../errors';
import { dailyBars, getInstrument, UNIVERSE } from '../market';
import { allHoldings, totalValue } from '../portfolio-data';
import { daysAgo, gaussian, iso, isoDay, demoNow, newId, round, seededRng, seedId } from '../prng';
import { del, get, post, type DemoRoute } from '../router';

// ── Regime ──────────────────────────────────────────────────────────────────
const stdev = (xs: number[]) => {
  const m = xs.reduce((a, b) => a + b, 0) / xs.length;
  return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / Math.max(1, xs.length - 1));
};

function regimeFor(symbol: string) {
  const bars = dailyBars(symbol, 260);
  const closes = bars.map((b) => b.close);
  const price = closes[closes.length - 1];
  const sma = (n: number) => closes.slice(-n).reduce((a, b) => a + b, 0) / n;
  const trend = Math.tanh(((price / sma(50) - 1) * 6 + (sma(50) / sma(200) - 1) * 6) / 1.5);

  const rets = closes.slice(1).map((c, i) => c / closes[i] - 1);
  const rolling: number[] = [];
  for (let i = 20; i <= rets.length; i++) rolling.push(stdev(rets.slice(i - 20, i)));
  const current = rolling[rolling.length - 1];
  const volPct = Math.round((rolling.filter((v) => v <= current).length / rolling.length) * 100);

  const breadthSyms = UNIVERSE.filter((u) => u.assetClass === 'equity').slice(0, 24).map((u) => u.symbol);
  const above = breadthSyms.filter((s) => {
    const c = dailyBars(s, 60).map((b) => b.close);
    return c[c.length - 1] > c.slice(-50).reduce((a, b) => a + b, 0) / 50;
  }).length;
  const breadth = round(above / breadthSyms.length, 2);

  const v = volPct / 100;
  const raw = {
    bull: Math.exp(2.2 * trend - 0.8 * v + (breadth - 0.5)),
    bear: Math.exp(-2.2 * trend + 0.6 * v - (breadth - 0.5)),
    sideways: Math.exp(1.0 - 2.5 * Math.abs(trend)),
    crisis: Math.exp(-2 + 3.0 * v - 1.5 * trend),
  };
  const total = Object.values(raw).reduce((a, b) => a + b, 0);
  const probs = {
    bull: round(raw.bull / total, 2),
    bear: round(raw.bear / total, 2),
    sideways: round(raw.sideways / total, 2),
    crisis: round(raw.crisis / total, 2),
  };
  const regime = (Object.entries(probs).sort((a, b) => b[1] - a[1])[0][0]) as keyof typeof probs;
  const annVol = current * Math.sqrt(252);
  return { regime, probs, confidence: round(probs[regime], 2), trend: round(trend, 2), volPct, breadth, vix: round(10 + annVol * 55, 1) };
}

const REGIME_SUMMARY: Record<string, string> = {
  bull: 'Market conditions indicate positive momentum with a supportive trend and contained volatility. This describes current conditions, not a forecast of future returns.',
  bear: 'Prices are trending lower with weak participation. This describes current conditions, not a forecast of future returns.',
  sideways: 'The market is range-bound with no clear directional trend. This describes current conditions, not a forecast of future returns.',
  crisis: 'Volatility is elevated and trend signals are deteriorating, a pattern seen during stress periods. This describes current conditions, not a forecast.',
};

// ── Simulation ──────────────────────────────────────────────────────────────
function percentile(sorted: number[], p: number): number {
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.floor(p * sorted.length)))];
}

// ── Strategy assistant state ────────────────────────────────────────────────
const agreement = { has_agreed: true, agreed_at: iso(daysAgo(25)) as string | null, agreement_version: '1.0' as string | null };

function buildAnalysis(id: string, requestedAt: string, cached: boolean) {
  const holdings = allHoldings();
  const total = totalValue();
  const weights = holdings.map((h) => ({ symbol: h.symbol, weight: h.institution_value / total }));
  const corr = averageOffDiagonal(correlationMatrix(weights.map((w) => w.symbol)));
  const stats = riskStats(weights);
  const diversification = round(Math.max(0, Math.min(1, 1 - Math.max(0, corr) * 0.9)), 2);
  const top = [...holdings].sort((a, b) => b.institution_value - a.institution_value).slice(0, 3);
  const level: 'low' | 'moderate' | 'high' = stats.volatilityAnnual < 0.13 ? 'low' : stats.volatilityAnnual < 0.22 ? 'moderate' : 'high';
  const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
  return {
    id,
    requested_at: requestedAt,
    risk_level: level,
    confidence_score: 0.78,
    diversification_score: diversification,
    key_themes: ['Equity concentration in mega-cap technology', 'Moderate use of bonds and gold as ballast', 'Several positions below cost basis', 'Rising correlation risk in a sell-off'],
    analysis_text: [
      `**Overview.** Your linked accounts hold ${holdings.length} positions worth about $${Math.round(total).toLocaleString()}. Estimated annual volatility is ${pct(stats.volatilityAnnual)} with a historical maximum drawdown near ${pct(stats.maxDrawdown)}, which places the portfolio in the **${level}** risk band.`,
      `**Concentration.** Your three largest holdings — ${top.map((t) => `${t.symbol} (${pct(t.institution_value / total)})`).join(', ')} — drive a large share of portfolio movement. Concentrated positions can add return potential but also widen the range of outcomes.`,
      `**Diversification.** The diversification score is ${(diversification * 100).toFixed(0)}%. Bonds, gold and international funds help in some regimes, but correlations among equities typically rise in sell-offs, so the stress-test page is worth reviewing alongside this.`,
      `**Things to review.** A few positions (for example INTC and PFE) are well below cost. The tax-loss harvesting tool shows how realizing those losses could offset gains, subject to wash-sale rules.`,
      `*This is a locally generated demo analysis from sample data. It is educational only and is not financial advice or a recommendation to buy or sell any security.*`,
    ].join('\n\n'),
    model_used: 'demo-analysis-v1',
    tokens_used: null as number | null,
    is_cached: cached,
    has_portfolio_data: true,
    portfolio_snapshot: {
      holdings_count: holdings.length,
      total_value: round(total),
      top_holdings: top.map((t) => ({ symbol: t.symbol, value: round(t.institution_value) })),
    },
  };
}

let history: ReturnType<typeof buildAnalysis>[] | null = null;
const getHistory = () =>
  (history ??= [
    buildAnalysis(seedId('analysis', 2), iso(daysAgo(14)), false),
    buildAnalysis(seedId('analysis', 1), iso(daysAgo(40)), false),
  ]);

export const intelligenceRoutes: DemoRoute[] = [
  get('/intelligence/v2/regime', ({ query }) => {
    const symbol = (query.symbol || 'SPY').toUpperCase();
    const r = regimeFor(symbol);
    const today = isoDay(demoNow());
    const v = SUBSYSTEM_VERSIONS.regime.version;
    return {
      regime: r.regime,
      regime_probabilities: r.probs,
      confidence: r.confidence,
      analysis_date: today,
      data_as_of: today,
      delay_applied_days: 0,
      indicators: {
        trend_score: r.trend,
        volatility_percentile: r.volPct,
        breadth_score: r.breadth,
        macro_alignment: r.trend > 0.15 ? 'expansionary' : r.trend < -0.15 ? 'contractionary' : 'neutral',
        vix_level: r.vix,
        yield_curve_slope: 0.62,
      },
      explanation: {
        summary: REGIME_SUMMARY[r.regime],
        key_factors: [
          r.trend > 0 ? 'Price trending above key moving averages' : 'Price trading below key moving averages',
          `Volatility at the ${r.volPct}th percentile of its one-year range`,
          `Estimated VIX-equivalent near ${r.vix}`,
          `${Math.round(r.breadth * 100)}% of large-cap stocks above their 50-day average`,
          `Analysis confidence: ${r.confidence >= 0.6 ? 'good' : 'moderate'} (${Math.round(r.confidence * 100)}%)`,
        ],
        model_info: {
          model_type: 'rule_based_ensemble',
          version: v,
          training_period: undefined,
          assumptions: ['US equity markets', 'Daily frequency data', 'Regime classifications are analytical, not predictive'],
        },
        limitations: [
          'Past market conditions do not predict future performance',
          'Regime transitions can occur rapidly without warning',
          'This classification reflects recent data, not a forecast',
          'This analysis is for informational purposes only',
        ],
      },
      tier: 'pro',
    };
  }),

  get('/intelligence/v2/regime/model-info', () => ({
    model_type: 'rule_based_ensemble',
    version: SUBSYSTEM_VERSIONS.regime.version,
    description: SUBSYSTEM_VERSIONS.regime.description,
    last_updated: SUBSYSTEM_VERSIONS.regime.lastUpdated,
    limitations: [
      'Classifies current conditions; it does not forecast.',
      'Uses daily data and a fixed rule set rather than a trained model.',
      'Designed for US equity markets.',
    ],
  })),

  post('/intelligence/v2/risk', ({ body }) => {
    const raw: Array<{ symbol: string; weight: number }> = body?.holdings ?? [];
    if (!raw.length) throw new DemoHttpError(422, 'At least one holding is required');
    const holdings = normalizeWeights(raw.map((h) => ({ ...h, symbol: h.symbol.toUpperCase() })));
    const value = 100_000;
    const stats = riskStats(holdings);
    const symbols = holdings.map((h) => h.symbol);
    const matrix = correlationMatrix(symbols);

    // Component contribution ∝ weight × vol × Σ(weight × vol × corr)
    const contrib = holdings.map((h, i) => {
      const vi = getInstrument(h.symbol).vol;
      const s = holdings.reduce((a, o) => a + o.weight * getInstrument(o.symbol).vol * matrix[h.symbol][o.symbol], 0);
      return { symbol: h.symbol, raw: h.weight * vi * s, weight: h.weight, i };
    });
    const totalContrib = contrib.reduce((a, c) => a + c.raw, 0) || 1;
    const var95 = stats.var95Pct / 100;
    const level = stats.volatilityAnnual < 0.12 ? 'low' : stats.volatilityAnnual < 0.2 ? 'moderate' : stats.volatilityAnnual < 0.32 ? 'high' : 'extreme';
    const today = isoDay(demoNow());
    return {
      portfolio_id: null,
      analysis_date: today,
      data_as_of: today,
      holdings_count: holdings.length,
      total_value: value.toFixed(2),
      risk_metrics: {
        volatility_annual: stats.volatilityAnnual,
        var_95_1day: (var95 * value).toFixed(2),
        var_95_1day_pct: round(var95, 4),
        cvar_95_1day: ((stats.cvar95Pct / 100) * value).toFixed(2),
        cvar_95_1day_pct: round(stats.cvar95Pct / 100, 4),
        max_drawdown_historical: stats.maxDrawdown,
        beta_to_benchmark: stats.beta,
        sharpe_ratio: stats.sharpe,
        sortino_ratio: stats.sortino,
      },
      risk_level: level,
      correlation_matrix: matrix,
      risk_contribution: contrib
        .map((c) => ({
          symbol: c.symbol,
          weight: round(c.weight, 4),
          marginal_var: (((c.raw / totalContrib) * var95) * value).toFixed(2),
          contribution_pct: round((c.raw / totalContrib) * 100, 1),
        }))
        .sort((a, b) => b.contribution_pct - a.contribution_pct),
      explanation: {
        summary: `Based on the past year of daily returns, this portfolio shows ${level} risk with annualised volatility of ${(stats.volatilityAnnual * 100).toFixed(1)}%.`,
        key_factors: [
          `1-day 95% VaR of ${(var95 * 100).toFixed(2)}% of portfolio value`,
          `Historical maximum drawdown of ${(stats.maxDrawdown * 100).toFixed(1)}%`,
          `Beta to the S&P 500 of ${stats.beta}`,
        ],
        model_info: {
          model_type: 'historical_simulation',
          version: SUBSYSTEM_VERSIONS.risk.version,
          assumptions: ['One year of daily returns', 'Constant weights (daily rebalanced)', 'Benchmark: SPY'],
        },
        limitations: [
          'Historical results do not predict future losses',
          'VaR does not describe how large losses beyond the threshold can be',
          'Correlations tend to rise in market stress',
        ],
      },
      analytics_level: 'advanced',
      tier: 'pro',
    };
  }),

  post('/intelligence/simulation', ({ body }) => {
    const raw: Array<{ symbol: string; weight: number }> = body?.holdings ?? [];
    if (!raw.length) throw new DemoHttpError(422, 'At least one holding is required');
    const holdings = normalizeWeights(raw.map((h) => ({ ...h, symbol: h.symbol.toUpperCase() })));
    const horizon = Math.min(756, Math.max(5, Number(body?.horizon_days) || 252));
    const n = Math.min(1000, Math.max(100, Number(body?.num_simulations) || 1000));
    const initial = Number(body?.initial_value) || 100_000;

    const rets = portfolioReturns(holdings);
    const mu = rets.reduce((a, b) => a + b, 0) / rets.length;
    const sigma = stdev(rets);
    const rng = seededRng(`sim:${holdings.map((h) => `${h.symbol}${h.weight.toFixed(3)}`).join('|')}:${horizon}:${n}`);

    const finals: number[] = [];
    for (let s = 0; s < n; s++) {
      let logV = 0;
      for (let d = 0; d < horizon; d++) logV += mu - 0.5 * sigma * sigma + sigma * gaussian(rng);
      finals.push(initial * Math.exp(logV));
    }
    finals.sort((a, b) => a - b);
    const worst = finals.slice(0, Math.max(1, Math.floor(n * 0.05)));
    const mean = finals.reduce((a, b) => a + b, 0) / n;
    const probLoss = finals.filter((v) => v < initial).length / n;
    const median = percentile(finals, 0.5);
    return {
      analysis_date: isoDay(demoNow()),
      horizon_days: horizon,
      simulations_run: n,
      initial_value: initial,
      results: {
        percentile_5: round(percentile(finals, 0.05)),
        percentile_25: round(percentile(finals, 0.25)),
        percentile_50: round(median),
        percentile_75: round(percentile(finals, 0.75)),
        percentile_95: round(percentile(finals, 0.95)),
        mean_value: round(mean),
        probability_of_loss: round(probLoss, 3),
        expected_shortfall: round(initial - worst.reduce((a, b) => a + b, 0) / worst.length),
      },
      simulation_limit: 1000,
      insights: [
        `Across ${n.toLocaleString()} simulated paths, the median outcome after ${horizon} trading days is about $${Math.round(median).toLocaleString()}.`,
        `${(probLoss * 100).toFixed(0)}% of simulated paths ended below the starting value.`,
        'Simulations assume past volatility and returns persist; real markets can behave very differently.',
      ],
      plan_tier: 'pro',
    };
  }),

  // ── Strategy assistant (locally generated demo analysis) ──────────────────
  get('/strategy/agreement/status', () => ({ ...agreement })),
  post('/strategy/agreement', ({ body }) => {
    agreement.has_agreed = true;
    agreement.agreed_at = iso(new Date());
    agreement.agreement_version = body?.agreement_version ?? '1.0';
    return { ...agreement };
  }),
  post('/strategy/analyze', ({ body }) => {
    const analysis = buildAnalysis(newId('analysis'), iso(new Date()), !body?.force && getHistory().length > 0);
    getHistory().unshift(analysis);
    const { portfolio_snapshot: _snapshot, ...result } = analysis;
    return result;
  }),
  get('/strategy/history', ({ query }) => {
    const page = Math.max(1, Number(query.page) || 1);
    const perPage = Math.max(1, Number(query.per_page) || 10);
    const all = getHistory();
    return { items: all.slice((page - 1) * perPage, page * perPage), total: all.length, page, per_page: perPage };
  }),
  get('/strategy/history/:id', ({ params }) => {
    const item = getHistory().find((h) => h.id === params.id);
    if (!item) throw new DemoHttpError(404, 'Analysis not found');
    return item;
  }),
  del('/strategy/history/:id', ({ params }) => {
    history = getHistory().filter((h) => h.id !== params.id);
    return { success: true };
  }),
];

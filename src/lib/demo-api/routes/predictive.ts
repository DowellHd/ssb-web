/**
 * Predictive analytics: GARCH volatility forecast, anomaly detection, text
 * sentiment (a transparent word-list model, no AI), ESG scores, and an
 * earnings-surprise estimate. All outputs are computed from the request body.
 */
import { SUBSYSTEM_VERSIONS } from '../../versioning';
import { DemoHttpError } from '../errors';
import { lastPrice } from '../market';
import { daysFromNow, hashString, isoDay, round, demoNow } from '../prng';
import { garch, mean, stdev } from '../quant';
import { post, type DemoRoute } from '../router';

const today = () => isoDay(demoNow());
const meta = (type: string, assumptions: string[]) => ({
  model_type: type,
  version: SUBSYSTEM_VERSIONS.risk.version,
  assumptions,
});
const explain = (summary: string, factors: string[], type: string, assumptions: string[], limitations: string[]) => ({
  summary,
  key_factors: factors,
  model_info: meta(type, assumptions),
  limitations,
});

const numbers = (xs: unknown): number[] => (Array.isArray(xs) ? xs.map(Number).filter((n) => Number.isFinite(n)) : []);

/** Next `n` weekdays after the demo "today". */
function nextBusinessDays(n: number): string[] {
  const out: string[] = [];
  for (let d = 1; out.length < n; d++) {
    const date = daysFromNow(d);
    if (date.getUTCDay() !== 0 && date.getUTCDay() !== 6) out.push(isoDay(date));
  }
  return out;
}

// ── Sentiment lexicon ───────────────────────────────────────────────────────
const POSITIVE = ['beat', 'beats', 'strong', 'rally', 'rallies', 'surge', 'surges', 'growth', 'gain', 'gains', 'record', 'upgrade', 'optimism', 'eases', 'ease', 'cut', 'cuts', 'rebound', 'recovery', 'boost', 'rises', 'rise', 'higher', 'bullish', 'profit', 'outperform'];
const NEGATIVE = ['miss', 'misses', 'weak', 'plunge', 'plunges', 'slump', 'fall', 'falls', 'drop', 'drops', 'recession', 'fears', 'fear', 'default', 'layoffs', 'warning', 'downgrade', 'crash', 'lawsuit', 'probe', 'inflation', 'lower', 'bearish', 'loss', 'losses', 'selloff', 'risk'];
const THEMES: Array<[string, string[]]> = [
  ['Earnings', ['earnings', 'beat', 'miss', 'revenue', 'profit', 'guidance']],
  ['Interest rates', ['fed', 'rate', 'rates', 'cuts', 'hike', 'yield']],
  ['Labor market', ['jobs', 'payrolls', 'unemployment', 'layoffs', 'hiring']],
  ['Inflation', ['inflation', 'cpi', 'prices']],
  ['Growth outlook', ['recession', 'growth', 'gdp', 'slowdown', 'expansion']],
  ['Technology', ['tech', 'ai', 'chip', 'semiconductor', 'software']],
  ['Energy', ['oil', 'crude', 'energy', 'gas']],
];

function scoreLine(line: string): { score: number; pos: number; neg: number } {
  const words = line.toLowerCase().match(/[a-z']+/g) ?? [];
  const pos = words.filter((w) => POSITIVE.includes(w)).length;
  let neg = words.filter((w) => NEGATIVE.includes(w)).length;
  // "eases ... fears" and similar de-escalation phrasing reduces the negative reading.
  if (/\b(eases|ease|calms|soothes|fades)\b/i.test(line)) neg = Math.max(0, neg - 2);
  return { score: pos + neg === 0 ? 0 : (pos - neg) / (pos + neg + 1), pos, neg };
}

function sentiment(lines: string[], subject: string) {
  const clean = lines.map((l) => l.trim()).filter(Boolean);
  if (!clean.length) throw new DemoHttpError(422, 'Provide at least one headline or some text');
  const scored = clean.map((l) => ({ line: l, ...scoreLine(l) }));
  const agg = mean(scored.map((s) => s.score));
  const posLines = scored.filter((s) => s.score > 0.1);
  const negLines = scored.filter((s) => s.score < -0.1);
  const label = posLines.length && negLines.length && Math.abs(agg) < 0.15 ? 'mixed' : agg > 0.15 ? 'bullish' : agg < -0.15 ? 'bearish' : 'neutral';
  const lower = clean.join(' ').toLowerCase();
  const themes = THEMES.filter(([, keys]) => keys.some((k) => new RegExp(`\\b${k}\\b`).test(lower))).map(([t]) => t);
  const short = (s: string) => (s.length > 90 ? `${s.slice(0, 87)}…` : s);
  return {
    analysis_date: today(),
    subject,
    aggregate_score: round(agg, 3),
    aggregate_label: label,
    confidence: round(Math.min(0.9, 0.45 + clean.length * 0.08 + Math.abs(agg) * 0.3), 2),
    dominant_themes: themes.slice(0, 4),
    top_risks: negLines.sort((a, b) => a.score - b.score).slice(0, 3).map((s) => short(s.line)),
    top_catalysts: posLines.sort((a, b) => b.score - a.score).slice(0, 3).map((s) => short(s.line)),
    source_count: clean.length,
    ai_available: false,
    model_metadata: meta('lexicon_sentiment', ['English text', 'Word-list scoring with simple negation handling']),
    explanation: explain(
      `${clean.length} item(s) read ${label} for ${subject}, with an aggregate score of ${agg >= 0 ? '+' : ''}${agg.toFixed(2)}.`,
      [`${posLines.length} positive and ${negLines.length} negative item(s)`, themes.length ? `Themes: ${themes.slice(0, 3).join(', ')}` : 'No dominant theme detected'],
      'lexicon_sentiment',
      ['Word-list scoring; no language model is used in demo mode'],
      ['Word lists miss sarcasm and context', 'Short samples give low-confidence results'],
    ),
  };
}

// ── ESG ─────────────────────────────────────────────────────────────────────
const SECTOR_ESG: Record<string, [number, number, number]> = {
  technology: [72, 66, 70],
  energy: [38, 55, 60],
  financials: [64, 62, 72],
  'health care': [66, 68, 70],
  healthcare: [66, 68, 70],
  utilities: [55, 64, 66],
  'consumer staples': [62, 64, 68],
  'consumer discretionary': [60, 58, 64],
  default: [60, 60, 65],
};

const CONTROVERSIES: Record<string, Array<[string, string, 'low' | 'medium' | 'high']>> = {
  technology: [['Data privacy', 'Regulatory scrutiny over data collection practices', 'medium'], ['Supply chain', 'Labor standards audits at overseas suppliers', 'low']],
  energy: [['Emissions', 'Scope 1–3 emissions remain above sector targets', 'high'], ['Spills', 'Historical environmental incident liabilities', 'medium']],
  financials: [['Lending practices', 'Questions about fossil-fuel financing exposure', 'medium']],
  'health care': [['Pricing', 'Public criticism of drug pricing', 'medium']],
  default: [['Disclosure', 'Limited sustainability reporting detail', 'low']],
};

function esgFor(symbol: string, sectorRaw: string) {
  const sector = sectorRaw.toLowerCase().replace(/_/g, ' ');
  const [e0, s0, g0] = SECTOR_ESG[sector] ?? SECTOR_ESG.default;
  const h = hashString(`esg:${symbol}`);
  const j = (shift: number) => ((h >>> shift) % 17) - 8;
  const clamp = (n: number) => Math.max(5, Math.min(98, n));
  const E = clamp(e0 + j(0));
  const S = clamp(s0 + j(5));
  const G = clamp(g0 + j(10));
  const composite = round(E * 0.35 + S * 0.3 + G * 0.35, 1);
  const rating = composite >= 85 ? 'AAA' : composite >= 75 ? 'AA' : composite >= 65 ? 'A' : composite >= 50 ? 'BBB' : composite >= 40 ? 'BB' : composite >= 30 ? 'B' : 'CCC';
  const pillars: Array<[string, number]> = [['Environmental', E], ['Social', S], ['Governance', G]];
  const ranked = [...pillars].sort((a, b) => a[1] - b[1]);
  const weakest = ranked[0][0];
  const strongest = ranked[2][0];
  return {
    analysis_date: today(),
    symbol,
    sector: sectorRaw === 'default' ? 'default' : sector,
    scores: { environmental: round(E, 1), social: round(S, 1), governance: round(G, 1), composite, rating, percentile: round(Math.min(97, Math.max(3, composite - 8 + j(15))), 0) },
    controversies: (CONTROVERSIES[sector] ?? CONTROVERSIES.default).map(([category, description, severity]) => ({ category, description, severity })),
    strengths: [`${strongest} practices score above sector peers`, 'Regular sustainability reporting'],
    improvement_areas: [`${weakest} metrics trail the sector median`, 'Third-party verification of targets'],
    provider: 'demo-sample',
    is_simulated: true,
    model_metadata: meta('sector_calibrated_sample', ['Scores are simulated for demonstration and are not real ESG ratings']),
    explanation: explain(
      `${symbol} receives a simulated composite ESG score of ${composite} (${rating}).`,
      [`Strongest pillar: ${strongest}`, `Weakest pillar: ${weakest}`],
      'sector_calibrated_sample',
      ['Sector-calibrated synthetic scores'],
      ['Simulated data only — not a real ESG rating'],
    ),
  };
}

export const predictiveRoutes: DemoRoute[] = [
  post('/predictive/volatility', ({ body }) => {
    const returns = numbers(body?.returns);
    if (returns.length < 30) throw new DemoHttpError(422, 'At least 30 returns are required');
    const horizon = Math.min(60, Math.max(1, Number(body?.forecast_horizon) || 10));
    const g = garch(returns, horizon);
    const regime = g.ratio < 0.8 ? 'low' : g.ratio < 1.15 ? 'normal' : g.ratio < 1.5 ? 'elevated' : 'extreme';
    const symbol = String(body?.symbol ?? '').toUpperCase();
    return {
      analysis_date: today(),
      symbol,
      parameters: {
        omega: g.omega,
        alpha: g.alpha,
        beta: g.beta,
        persistence: round(g.persistence, 4),
        long_run_annualized_vol: round(g.longRunAnnualPct, 2),
      },
      forecast: {
        horizon_days: horizon,
        current_annualized_vol_pct: round(g.currentAnnualPct, 2),
        long_run_annualized_vol_pct: round(g.longRunAnnualPct, 2),
        annualized_vol_forecast_pct: g.forecast.map((v) => round(v, 2)),
        var_95_pct: round(1.645 * g.nextDayVol * 100, 2),
        var_99_pct: round(2.326 * g.nextDayVol * 100, 2),
        vol_regime: regime,
        forecast_dates: nextBusinessDays(horizon),
      },
      model_metadata: meta('garch_1_1', ['Variance targeting', 'alpha 0.08, beta 0.90 (fixed)']),
      explanation: explain(
        `${symbol || 'The series'} is in a ${regime} volatility regime: ${g.currentAnnualPct.toFixed(1)}% now against a ${g.longRunAnnualPct.toFixed(1)}% long-run level.`,
        [`Persistence ${g.persistence.toFixed(2)}: shocks fade slowly`, `Forecast reverts toward ${g.longRunAnnualPct.toFixed(1)}% over ${horizon} days`],
        'garch_1_1',
        ['Returns are roughly mean-zero', 'Volatility clusters and mean-reverts'],
        ['Parameters are fixed rather than estimated by maximum likelihood in demo mode', 'GARCH does not predict direction'],
      ),
      converged: true,
      sample_size: returns.length,
    };
  }),

  post('/predictive/anomalies', ({ body }) => {
    const returns = numbers(body?.returns);
    if (returns.length < 30) throw new DemoHttpError(422, 'At least 30 returns are required');
    const window = 30;
    const z: number[] = returns.map((r, i) => {
      if (i < window) return 0;
      const w = returns.slice(i - window, i);
      const sd = stdev(w);
      return sd > 0 ? (r - mean(w)) / sd : 0;
    });
    const severity = (a: number) => (a >= 4.5 ? 'extreme' : a >= 3.6 ? 'severe' : a >= 3 ? 'moderate' : 'mild');
    const anomalies = z
      .map((v, i) => ({ v, i }))
      .filter(({ v }) => Math.abs(v) >= 2.5)
      .map(({ v, i }) => ({
        type: v > 0 ? 'positive_return_outlier' : 'negative_return_outlier',
        severity: severity(Math.abs(v)) as 'mild' | 'moderate' | 'severe' | 'extreme',
        z_score: round(v, 2),
        description: `${v > 0 ? 'Unusually large gain' : 'Unusually large loss'} of ${(returns[i] * 100).toFixed(2)}% (${Math.abs(v).toFixed(1)}σ from the trailing ${window}-day mean)`,
        period_index: i,
        value: round(returns[i], 5),
        expected_value: round(mean(returns.slice(i - window, i)), 5),
      }));
    const summary: Record<string, number> = { mild: 0, moderate: 0, severe: 0, extreme: 0 };
    anomalies.forEach((a) => (summary[a.severity] += 1));
    const flag =
      summary.extreme > 0 || summary.severe >= 2 ? 'critical' : summary.severe === 1 || summary.moderate >= 2 ? 'alert' : anomalies.length ? 'watch' : 'normal';
    const symbol = String(body?.symbol ?? '').toUpperCase();
    return {
      analysis_date: today(),
      symbol,
      anomaly_count: anomalies.length,
      severity_summary: summary,
      anomaly_rate_pct: round((anomalies.length / returns.length) * 100, 1),
      overall_risk_flag: flag,
      anomalies,
      rolling_z_scores: z.map((v) => round(v, 3)),
      model_metadata: meta('rolling_zscore', [`${window}-day trailing window`, 'Flag at |z| ≥ 2.5']),
      explanation: explain(
        anomalies.length
          ? `${anomalies.length} unusual move(s) found in ${returns.length} observations for ${symbol}.`
          : `No unusual moves found in ${returns.length} observations for ${symbol}.`,
        [`Anomaly rate ${((anomalies.length / returns.length) * 100).toFixed(1)}%`, `Overall flag: ${flag}`],
        'rolling_zscore',
        [`${window}-day trailing window`],
        ['A z-score assumes returns are roughly normal', 'Outliers are not necessarily errors or signals'],
      ),
    };
  }),

  post('/predictive/sentiment/headlines', ({ body }) => sentiment(body?.headlines ?? [], body?.subject ?? 'market')),
  post('/predictive/sentiment/text', ({ body }) =>
    sentiment(String(body?.text ?? '').split(/(?<=[.!?])\s+|\n+/), body?.subject ?? 'market'),
  ),

  post('/predictive/esg', ({ body }) => esgFor(String(body?.symbol ?? '').toUpperCase(), String(body?.sector ?? 'default'))),

  post('/predictive/esg/portfolio', ({ body }) => {
    const raw: Array<{ symbol: string; sector?: string; weight?: number }> = body?.holdings ?? [];
    if (!raw.length) throw new DemoHttpError(422, 'At least one holding is required');
    const reports = raw.map((h) => esgFor(String(h.symbol).toUpperCase(), h.sector ?? 'default'));
    const total = raw.reduce((s, h) => s + (h.weight ?? 1 / raw.length), 0) || 1;
    const w = (i: number) => (raw[i].weight ?? 1 / raw.length) / total;
    const avg = (pick: (r: (typeof reports)[number]) => number) => round(reports.reduce((s, r, i) => s + pick(r) * w(i), 0), 1);
    const composite = avg((r) => r.scores.composite);
    const rating = composite >= 85 ? 'AAA' : composite >= 75 ? 'AA' : composite >= 65 ? 'A' : composite >= 50 ? 'BBB' : composite >= 40 ? 'BB' : composite >= 30 ? 'B' : 'CCC';
    return {
      analysis_date: today(),
      portfolio_scores: {
        environmental: avg((r) => r.scores.environmental),
        social: avg((r) => r.scores.social),
        governance: avg((r) => r.scores.governance),
        composite,
        rating,
        percentile: avg((r) => r.scores.percentile),
      },
      holdings: reports,
      is_simulated: true,
    };
  }),

  post('/predictive/earnings-surprise', ({ body }) => {
    const symbol = String(body?.symbol ?? '').toUpperCase();
    const rets = numbers(body?.recent_returns);
    const prior = numbers(body?.prior_surprises);
    const sd = rets.length > 1 ? stdev(rets) : 0.012;
    const mom20 = rets.slice(-20).reduce((a, b) => a + b, 0);
    const momentum = mom20 > 0.02 ? 'positive' : mom20 < -0.02 ? 'negative' : 'neutral';
    const annVol = sd * Math.sqrt(252);
    const volRegime = annVol < 0.15 ? 'low' : annVol < 0.3 ? 'normal' : annVol < 0.45 ? 'elevated' : 'extreme';
    const hist = prior.length ? prior.filter((p) => p > 0).length / prior.length : 0.6 + (hashString(`beat:${symbol}`) % 25) / 100;
    const beat = Math.min(0.85, Math.max(0.35, 0.5 + (hist - 0.6) * 0.5 + (momentum === 'positive' ? 0.07 : momentum === 'negative' ? -0.08 : 0)));
    const inLine = 0.12;
    const miss = Math.max(0.03, 1 - beat - inLine);
    const total = beat + inLine + miss;
    const price = symbol ? lastPrice(symbol) : 0;
    return {
      symbol,
      beat_probability: round(beat / total, 3),
      miss_probability: round(miss / total, 3),
      in_line_probability: round(inLine / total, 3),
      implied_move_pct: round(sd * 100 * 2.6, 1),
      pre_earnings_momentum: momentum,
      vol_regime: volRegime,
      historical_beat_rate: round(hist, 2),
      analysis_notes: [
        `20-day pre-earnings drift is ${(mom20 * 100).toFixed(1)}%, a ${momentum} reading`,
        `Realised volatility of ${(annVol * 100).toFixed(0)}% annualised puts ${symbol || 'the stock'} in a ${volRegime} regime`,
        prior.length ? `Based on ${prior.length} prior surprise(s) supplied` : 'Historical beat rate is a sample figure in demo mode',
        price ? `Current price $${price.toFixed(2)}` : 'No price available',
      ],
      model_metadata: meta('heuristic_earnings_model', ['Momentum and volatility adjust a base beat rate']),
      disclaimer: 'Probabilities are a simple heuristic for illustration, not a forecast. Earnings outcomes are uncertain.',
    };
  }),
];

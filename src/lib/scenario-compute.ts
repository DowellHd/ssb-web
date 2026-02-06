/**
 * Deterministic scenario computation for what-if analysis.
 *
 * This recomputes regime probabilities based on overridden indicator values.
 * Uses the same rule-based logic as the backend ensemble model.
 *
 * RULES:
 * - No predictions
 * - Deterministic only
 * - Educational purposes
 */

import type { RegimeOverride } from '@/stores/scenario-mode-store';

export interface ScenarioIndicators {
  trend_score: number;
  volatility_percentile: number;
  breadth_score: number;
}

export interface ScenarioResult {
  regime: string;
  confidence: number;
  regime_probabilities: Record<string, number>;
}

/**
 * Computes regime classification from indicators using rule-based ensemble.
 * Mirrors the backend logic for deterministic what-if analysis.
 */
export function computeScenarioRegime(
  indicators: ScenarioIndicators,
  regimeOverride: RegimeOverride = null
): ScenarioResult {
  // If regime is manually overridden, return that with appropriate probabilities
  if (regimeOverride) {
    return {
      regime: regimeOverride,
      confidence: 0.95, // Manual override has high confidence
      regime_probabilities: {
        bull: regimeOverride === 'bull' ? 0.95 : 0.01,
        bear: regimeOverride === 'bear' ? 0.95 : 0.01,
        sideways: regimeOverride === 'sideways' ? 0.95 : 0.01,
        high_volatility: regimeOverride === 'high_volatility' ? 0.95 : 0.01,
        low_volatility: regimeOverride === 'low_volatility' ? 0.95 : 0.01,
      },
    };
  }

  const { trend_score, volatility_percentile, breadth_score } = indicators;

  // Initialize scores for each regime
  const scores: Record<string, number> = {
    bull: 0,
    bear: 0,
    sideways: 0,
    high_volatility: 0,
    low_volatility: 0,
  };

  // Trend contribution (weight: 40%)
  if (trend_score > 0.3) {
    scores.bull += 0.4 * Math.min(trend_score, 1);
  } else if (trend_score < -0.3) {
    scores.bear += 0.4 * Math.min(Math.abs(trend_score), 1);
  } else {
    scores.sideways += 0.4 * (1 - Math.abs(trend_score) * 2);
  }

  // Volatility contribution (weight: 35%)
  if (volatility_percentile > 70) {
    scores.high_volatility += 0.35 * (volatility_percentile / 100);
    scores.bear += 0.1 * ((volatility_percentile - 70) / 30);
  } else if (volatility_percentile < 30) {
    scores.low_volatility += 0.35 * ((100 - volatility_percentile) / 100);
    scores.bull += 0.1 * ((30 - volatility_percentile) / 30);
  } else {
    scores.sideways += 0.15;
  }

  // Breadth contribution (weight: 25%)
  if (breadth_score > 0.6) {
    scores.bull += 0.25 * breadth_score;
  } else if (breadth_score < 0.4) {
    scores.bear += 0.25 * (1 - breadth_score);
  } else {
    scores.sideways += 0.15;
  }

  // Cross-factor adjustments
  // Strong trend + low vol = stronger bull/bear signal
  if (Math.abs(trend_score) > 0.3 && volatility_percentile < 40) {
    if (trend_score > 0) {
      scores.bull += 0.1;
    } else {
      scores.bear += 0.1;
    }
  }

  // Weak trend + mid vol = stronger sideways signal
  if (Math.abs(trend_score) < 0.2 && volatility_percentile >= 30 && volatility_percentile <= 70) {
    scores.sideways += 0.15;
  }

  // High vol overrides everything if extreme
  if (volatility_percentile > 85) {
    scores.high_volatility += 0.2;
  }

  // Normalize to probabilities
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const probabilities: Record<string, number> = {};

  for (const [key, value] of Object.entries(scores)) {
    probabilities[key] = total > 0 ? value / total : 0.2;
  }

  // Determine winning regime
  const sortedRegimes = Object.entries(probabilities).sort(([, a], [, b]) => b - a);
  const [winningRegime, winningProb] = sortedRegimes[0];
  const [, secondProb] = sortedRegimes[1];

  // Confidence is based on margin between top two
  const confidence = Math.min(0.95, winningProb + (winningProb - secondProb) * 0.5);

  return {
    regime: winningRegime,
    confidence,
    regime_probabilities: probabilities,
  };
}

/**
 * Computes the delta between baseline and scenario results.
 */
export function computeScenarioDelta(
  baseline: ScenarioResult,
  scenario: ScenarioResult
): {
  regimeChanged: boolean;
  confidenceDelta: number;
  probabilityDeltas: Record<string, number>;
} {
  const probabilityDeltas: Record<string, number> = {};

  for (const key of Object.keys(baseline.regime_probabilities)) {
    probabilityDeltas[key] =
      (scenario.regime_probabilities[key] || 0) - (baseline.regime_probabilities[key] || 0);
  }

  return {
    regimeChanged: baseline.regime !== scenario.regime,
    confidenceDelta: scenario.confidence - baseline.confidence,
    probabilityDeltas,
  };
}

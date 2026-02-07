/**
 * Regime-aware chart context helpers.
 *
 * Provides deterministic, rule-based explanations for regime states.
 * Used for chart background shading, status labels, and hover tooltips.
 *
 * Rules:
 * - No predictions or recommendations
 * - Deterministic logic only
 * - Educational/informational purpose
 */

export type RegimeType = 'bull' | 'bear' | 'sideways' | 'high_volatility' | 'low_volatility' | 'crisis';

export interface RegimeIndicators {
  trend_score: number;
  volatility_percentile: number;
  breadth_score: number;
}

export interface RegimeContext {
  regime: RegimeType;
  confidence: number;
  indicators: RegimeIndicators;
}

/**
 * Regime display configuration for UI elements.
 */
export const REGIME_CONFIG: Record<RegimeType, {
  label: string;
  shortLabel: string;
  bgClass: string;
  bgTint: string;
  textClass: string;
  borderClass: string;
}> = {
  bull: {
    label: 'Bull regime active',
    shortLabel: 'Bull',
    bgClass: 'bg-green-500/5',
    bgTint: 'rgba(34, 197, 94, 0.03)',
    textClass: 'text-green-600 dark:text-green-400',
    borderClass: 'border-green-200 dark:border-green-800',
  },
  bear: {
    label: 'Bear regime active',
    shortLabel: 'Bear',
    bgClass: 'bg-red-500/5',
    bgTint: 'rgba(239, 68, 68, 0.03)',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-200 dark:border-red-800',
  },
  sideways: {
    label: 'Sideways market',
    shortLabel: 'Sideways',
    bgClass: 'bg-blue-500/5',
    bgTint: 'rgba(59, 130, 246, 0.03)',
    textClass: 'text-blue-600 dark:text-blue-400',
    borderClass: 'border-blue-200 dark:border-blue-800',
  },
  high_volatility: {
    label: 'High volatility environment',
    shortLabel: 'High Vol',
    bgClass: 'bg-orange-500/5',
    bgTint: 'rgba(249, 115, 22, 0.03)',
    textClass: 'text-orange-600 dark:text-orange-400',
    borderClass: 'border-orange-200 dark:border-orange-800',
  },
  low_volatility: {
    label: 'Low volatility environment',
    shortLabel: 'Low Vol',
    bgClass: 'bg-sky-500/5',
    bgTint: 'rgba(14, 165, 233, 0.03)',
    textClass: 'text-sky-600 dark:text-sky-400',
    borderClass: 'border-sky-200 dark:border-sky-800',
  },
  crisis: {
    label: 'Crisis conditions',
    shortLabel: 'Crisis',
    bgClass: 'bg-amber-500/5',
    bgTint: 'rgba(245, 158, 11, 0.04)',
    textClass: 'text-amber-600 dark:text-amber-400',
    borderClass: 'border-amber-200 dark:border-amber-800',
  },
};

/**
 * Get the primary factors driving the current regime.
 * Returns deterministic explanations based on indicator values.
 */
export function getRegimeDrivers(indicators: RegimeIndicators): {
  supporting: string[];
  opposing: string[];
} {
  const { trend_score, volatility_percentile, breadth_score } = indicators;
  const supporting: string[] = [];
  const opposing: string[] = [];

  // Trend analysis
  if (trend_score > 0.5) {
    supporting.push('Strong positive trend momentum');
  } else if (trend_score > 0.2) {
    supporting.push('Positive trend direction');
  } else if (trend_score < -0.5) {
    supporting.push('Strong negative trend momentum');
  } else if (trend_score < -0.2) {
    supporting.push('Negative trend direction');
  } else {
    supporting.push('Neutral trend suggests ranging conditions');
  }

  // Volatility analysis
  if (volatility_percentile > 80) {
    supporting.push(`Elevated volatility (${volatility_percentile}th percentile)`);
  } else if (volatility_percentile > 60) {
    supporting.push(`Above-average volatility (${volatility_percentile}th percentile)`);
  } else if (volatility_percentile < 20) {
    supporting.push(`Compressed volatility (${volatility_percentile}th percentile)`);
  } else if (volatility_percentile < 40) {
    supporting.push(`Below-average volatility (${volatility_percentile}th percentile)`);
  }

  // Breadth analysis
  if (breadth_score > 0.7) {
    supporting.push('Strong market breadth');
  } else if (breadth_score > 0.5) {
    supporting.push('Positive market participation');
  } else if (breadth_score < 0.3) {
    opposing.push('Weak market breadth');
  } else if (breadth_score < 0.5) {
    opposing.push('Mixed market participation');
  }

  // Cross-factor analysis (opposing signals)
  if (trend_score > 0.3 && volatility_percentile > 70) {
    opposing.push('Elevated volatility may limit trend persistence');
  }
  if (trend_score < -0.3 && breadth_score > 0.6) {
    opposing.push('Breadth divergence from price trend');
  }
  if (trend_score > 0.3 && breadth_score < 0.4) {
    opposing.push('Narrow participation in rally');
  }

  return { supporting, opposing };
}

/**
 * Generate a concise regime explanation for hover tooltip.
 */
export function getRegimeExplanation(
  regime: RegimeType,
  indicators: RegimeIndicators
): string {
  const { trend_score, volatility_percentile, breadth_score } = indicators;

  const trendDesc =
    trend_score > 0.3 ? 'positive momentum' :
    trend_score < -0.3 ? 'negative momentum' :
    'neutral trend';

  const volDesc =
    volatility_percentile > 70 ? 'elevated volatility' :
    volatility_percentile < 30 ? 'low volatility' :
    'moderate volatility';

  const breadthDesc =
    breadth_score > 0.6 ? 'broad participation' :
    breadth_score < 0.4 ? 'narrow participation' :
    'mixed breadth';

  switch (regime) {
    case 'bull':
      return `Driven by ${trendDesc} with ${breadthDesc}. ${volDesc.charAt(0).toUpperCase() + volDesc.slice(1)} observed.`;
    case 'bear':
      return `Driven by ${trendDesc} with ${breadthDesc}. ${volDesc.charAt(0).toUpperCase() + volDesc.slice(1)} observed.`;
    case 'sideways':
      return `Characterized by ${trendDesc} and ${volDesc}. Market showing ${breadthDesc}.`;
    case 'high_volatility':
      return `Elevated volatility (${volatility_percentile}th percentile) with ${trendDesc}. ${breadthDesc.charAt(0).toUpperCase() + breadthDesc.slice(1)}.`;
    case 'low_volatility':
      return `Compressed volatility (${volatility_percentile}th percentile) with ${trendDesc}. ${breadthDesc.charAt(0).toUpperCase() + breadthDesc.slice(1)}.`;
    case 'crisis':
      return `Extreme conditions: ${volDesc}, ${trendDesc}, and ${breadthDesc}.`;
    default:
      return 'Regime classification based on trend, volatility, and breadth indicators.';
  }
}

/**
 * Generate regime-aware risk interpretation copy.
 * Provides context without recommendations.
 */
export function getRiskInterpretation(
  regime: RegimeType,
  volatilityPercentile: number
): string {
  const volLevel =
    volatilityPercentile > 70 ? 'high' :
    volatilityPercentile < 30 ? 'low' :
    'moderate';

  const interpretations: Record<RegimeType, string> = {
    bull: `In a bull regime with ${volLevel} volatility, drawdowns may differ in character from bear market declines. Historical patterns suggest varying recovery dynamics.`,
    bear: `Bear regime conditions with ${volLevel} volatility typically exhibit different risk characteristics than bull markets. Position sizing considerations may vary.`,
    sideways: `Sideways markets with ${volLevel} volatility often display mean-reverting behavior. Range-bound dynamics influence risk interpretation.`,
    high_volatility: `High volatility environments (${volatilityPercentile}th percentile) amplify both gains and losses. Historical daily ranges tend to be wider.`,
    low_volatility: `Low volatility environments (${volatilityPercentile}th percentile) may precede regime shifts. Current conditions differ from elevated volatility periods.`,
    crisis: `Crisis conditions combine multiple risk factors. Historical precedents show varied outcomes depending on duration and catalyst.`,
  };

  return interpretations[regime];
}

/**
 * Determine if regime indicates elevated risk context.
 */
export function isElevatedRiskContext(
  regime: RegimeType,
  volatilityPercentile: number
): boolean {
  return (
    regime === 'bear' ||
    regime === 'crisis' ||
    regime === 'high_volatility' ||
    volatilityPercentile > 75
  );
}

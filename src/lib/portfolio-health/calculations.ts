/**
 * Portfolio Health calculations.
 *
 * Deterministic, rule-based calculations for portfolio health metrics.
 * All outputs are informational - no recommendations or advice.
 */

import type { RegimeType } from '@/lib/chart/regime-context';
import type {
  PortfolioHealth,
  PortfolioHealthInput,
  PositionWithSector,
  SectorExposure,
  ConcentrationWarning,
  PositionCorrelation,
  RiskScoreBreakdown,
  RiskLevel,
  Sector,
} from './types';

// ============================================================================
// Sector Configuration
// ============================================================================

/**
 * Sector display labels and regime sensitivity mapping.
 */
export const SECTOR_CONFIG: Record<
  Sector,
  {
    label: string;
    regimeSensitivity: RegimeType[];
  }
> = {
  technology: {
    label: 'Technology',
    regimeSensitivity: ['bear', 'high_volatility', 'crisis'],
  },
  healthcare: {
    label: 'Healthcare',
    regimeSensitivity: ['sideways'],
  },
  financials: {
    label: 'Financials',
    regimeSensitivity: ['bear', 'crisis'],
  },
  consumer_discretionary: {
    label: 'Consumer Discretionary',
    regimeSensitivity: ['bear', 'crisis'],
  },
  consumer_staples: {
    label: 'Consumer Staples',
    regimeSensitivity: [],
  },
  energy: {
    label: 'Energy',
    regimeSensitivity: ['high_volatility', 'crisis'],
  },
  industrials: {
    label: 'Industrials',
    regimeSensitivity: ['bear', 'crisis'],
  },
  materials: {
    label: 'Materials',
    regimeSensitivity: ['bear', 'high_volatility'],
  },
  utilities: {
    label: 'Utilities',
    regimeSensitivity: ['low_volatility'],
  },
  real_estate: {
    label: 'Real Estate',
    regimeSensitivity: ['bear', 'crisis'],
  },
  communication_services: {
    label: 'Communication Services',
    regimeSensitivity: ['bear', 'high_volatility'],
  },
  other: {
    label: 'Other',
    regimeSensitivity: [],
  },
};

/**
 * Simple symbol-to-sector mapping for demo purposes.
 * In production, this would come from market data API.
 */
export const SYMBOL_SECTOR_MAP: Record<string, Sector> = {
  // Technology
  AAPL: 'technology',
  MSFT: 'technology',
  GOOGL: 'technology',
  GOOG: 'technology',
  META: 'technology',
  NVDA: 'technology',
  AMD: 'technology',
  INTC: 'technology',
  CRM: 'technology',
  ADBE: 'technology',
  NFLX: 'technology',
  TSLA: 'consumer_discretionary',
  // Financials
  JPM: 'financials',
  BAC: 'financials',
  WFC: 'financials',
  GS: 'financials',
  MS: 'financials',
  V: 'financials',
  MA: 'financials',
  // Healthcare
  JNJ: 'healthcare',
  UNH: 'healthcare',
  PFE: 'healthcare',
  ABBV: 'healthcare',
  MRK: 'healthcare',
  LLY: 'healthcare',
  // Consumer
  AMZN: 'consumer_discretionary',
  HD: 'consumer_discretionary',
  NKE: 'consumer_discretionary',
  MCD: 'consumer_discretionary',
  SBUX: 'consumer_discretionary',
  WMT: 'consumer_staples',
  KO: 'consumer_staples',
  PEP: 'consumer_staples',
  PG: 'consumer_staples',
  COST: 'consumer_staples',
  // Energy
  XOM: 'energy',
  CVX: 'energy',
  COP: 'energy',
  // Industrials
  BA: 'industrials',
  CAT: 'industrials',
  UPS: 'industrials',
  HON: 'industrials',
  // ETFs (mapped by primary exposure)
  SPY: 'other',
  QQQ: 'technology',
  IWM: 'other',
  DIA: 'industrials',
  VTI: 'other',
  VOO: 'other',
  XLF: 'financials',
  XLK: 'technology',
  XLE: 'energy',
  XLV: 'healthcare',
};

/**
 * Get sector for a symbol, defaulting to 'other' if unknown.
 */
export function getSectorForSymbol(symbol: string): Sector {
  return SYMBOL_SECTOR_MAP[symbol.toUpperCase()] || 'other';
}

// ============================================================================
// Sector Exposure Calculations
// ============================================================================

/**
 * Calculate sector exposure breakdown from positions.
 */
export function calculateSectorExposure(positions: PositionWithSector[]): SectorExposure[] {
  const sectorWeights: Record<Sector, number> = {
    technology: 0,
    healthcare: 0,
    financials: 0,
    consumer_discretionary: 0,
    consumer_staples: 0,
    energy: 0,
    industrials: 0,
    materials: 0,
    utilities: 0,
    real_estate: 0,
    communication_services: 0,
    other: 0,
  };

  // Sum up weights by sector
  for (const position of positions) {
    sectorWeights[position.sector] += position.weight;
  }

  // Convert to array and filter out zero-weight sectors
  const exposures: SectorExposure[] = Object.entries(sectorWeights)
    .filter(([, weight]) => weight > 0)
    .map(([sector, weight]) => ({
      sector: sector as Sector,
      label: SECTOR_CONFIG[sector as Sector].label,
      weight,
      regimeSensitivity: SECTOR_CONFIG[sector as Sector].regimeSensitivity,
    }))
    .sort((a, b) => b.weight - a.weight);

  return exposures;
}

// ============================================================================
// Concentration Warning Calculations
// ============================================================================

/**
 * Calculate concentration warnings based on position weights.
 */
export function calculateConcentrationWarnings(
  positions: PositionWithSector[],
  sectorExposure: SectorExposure[]
): ConcentrationWarning[] {
  const warnings: ConcentrationWarning[] = [];

  // Single position concentration (>25% = elevated, >15% = caution, >10% = info)
  for (const position of positions) {
    if (position.weight > 0.25) {
      warnings.push({
        type: 'single_position',
        level: 'elevated',
        message: `${position.symbol} represents ${(position.weight * 100).toFixed(0)}% of portfolio`,
        details: 'Single position accounts for more than 25% of total value.',
      });
    } else if (position.weight > 0.15) {
      warnings.push({
        type: 'single_position',
        level: 'caution',
        message: `${position.symbol} at ${(position.weight * 100).toFixed(0)}% concentration`,
        details: 'Single position accounts for more than 15% of total value.',
      });
    } else if (position.weight > 0.10) {
      warnings.push({
        type: 'single_position',
        level: 'info',
        message: `${position.symbol} at ${(position.weight * 100).toFixed(0)}% of portfolio`,
      });
    }
  }

  // Sector concentration (>50% = elevated, >35% = caution)
  for (const sector of sectorExposure) {
    if (sector.weight > 0.50) {
      warnings.push({
        type: 'sector',
        level: 'elevated',
        message: `${sector.label} sector at ${(sector.weight * 100).toFixed(0)}% exposure`,
        details: 'Single sector accounts for more than half of portfolio value.',
      });
    } else if (sector.weight > 0.35) {
      warnings.push({
        type: 'sector',
        level: 'caution',
        message: `${sector.label} sector at ${(sector.weight * 100).toFixed(0)}% exposure`,
        details: 'Sector concentration above 35%.',
      });
    }
  }

  return warnings.sort((a, b) => {
    const levelOrder = { elevated: 0, caution: 1, info: 2 };
    return levelOrder[a.level] - levelOrder[b.level];
  });
}

// ============================================================================
// Correlation Calculations (Institutional+)
// ============================================================================

/**
 * Calculate simplified correlation labels based on sector similarity.
 * In production, this would use actual price correlation data.
 */
export function calculateCorrelations(positions: PositionWithSector[]): PositionCorrelation[] {
  const correlations: PositionCorrelation[] = [];

  // Only calculate for portfolios with 2+ positions
  if (positions.length < 2) return correlations;

  // Compare each pair of positions
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const posA = positions[i];
      const posB = positions[j];

      // Simplified correlation based on same sector = high positive
      const sameSector = posA.sector === posB.sector;
      const correlation = sameSector ? 0.75 : 0.25;

      // Only report meaningful correlations
      if (correlation > 0.5) {
        correlations.push({
          symbolA: posA.symbol,
          symbolB: posB.symbol,
          correlation,
          label: correlation > 0.7 ? 'high_positive' : 'moderate_positive',
        });
      }
    }
  }

  return correlations.sort((a, b) => b.correlation - a.correlation).slice(0, 5);
}

// ============================================================================
// Risk Score Calculations
// ============================================================================

/**
 * Calculate regime-weighted risk score.
 */
export function calculateRiskScore(
  positions: PositionWithSector[],
  sectorExposure: SectorExposure[],
  regime: RegimeType,
  volatilityPercentile: number,
  correlations?: PositionCorrelation[]
): RiskScoreBreakdown {
  // Base scores
  let regimeContribution = 0;
  let volatilityContribution = 0;
  let concentrationContribution = 0;
  let correlationContribution = 0;

  // Regime contribution (0-30 points)
  // Higher risk in bear/crisis regimes
  const regimeRiskMultiplier: Record<RegimeType, number> = {
    bull: 0.1,
    sideways: 0.3,
    low_volatility: 0.2,
    high_volatility: 0.6,
    bear: 0.8,
    crisis: 1.0,
  };
  regimeContribution = regimeRiskMultiplier[regime] * 30;

  // Calculate regime-sensitive exposure
  let sensitiveTotalWeight = 0;
  for (const sector of sectorExposure) {
    if (sector.regimeSensitivity.includes(regime)) {
      sensitiveTotalWeight += sector.weight;
    }
  }
  // Adjust regime contribution by sensitive exposure
  regimeContribution *= 1 + sensitiveTotalWeight;

  // Volatility contribution (0-30 points)
  volatilityContribution = (volatilityPercentile / 100) * 30;

  // Concentration contribution (0-25 points)
  const maxPositionWeight = Math.max(...positions.map((p) => p.weight), 0);
  const maxSectorWeight = Math.max(...sectorExposure.map((s) => s.weight), 0);
  concentrationContribution = ((maxPositionWeight + maxSectorWeight) / 2) * 25;

  // Correlation contribution (0-15 points) - only for Institutional+
  if (correlations && correlations.length > 0) {
    const avgHighCorrelation =
      correlations.filter((c) => c.correlation > 0.6).length / Math.max(positions.length, 1);
    correlationContribution = avgHighCorrelation * 15;
  }

  // Calculate total score (0-100)
  const score = Math.min(
    100,
    Math.round(
      regimeContribution + volatilityContribution + concentrationContribution + correlationContribution
    )
  );

  // Determine risk level
  let level: RiskLevel;
  if (score < 35) {
    level = 'low';
  } else if (score < 65) {
    level = 'moderate';
  } else {
    level = 'elevated';
  }

  return {
    score,
    level,
    regimeContribution: Math.round(regimeContribution),
    volatilityContribution: Math.round(volatilityContribution),
    concentrationContribution: Math.round(concentrationContribution),
    correlationContribution: correlations ? Math.round(correlationContribution) : undefined,
  };
}

// ============================================================================
// Summary Text Generation
// ============================================================================

/**
 * Generate informational summary text (no recommendations).
 */
function generateSummaryText(
  riskLevel: RiskLevel,
  sectorExposure: SectorExposure[],
  concentrationWarnings: ConcentrationWarning[],
  regime: RegimeType,
  sensitivePct: number,
  isScenarioAdjusted: boolean
): string {
  const parts: string[] = [];

  // Main risk statement
  const levelText =
    riskLevel === 'low' ? 'Low' :
    riskLevel === 'moderate' ? 'Moderate' :
    'Elevated';
  parts.push(`Portfolio Health: ${levelText} Risk`);

  // Regime sensitivity
  if (sensitivePct > 0.3) {
    parts.push(
      `${(sensitivePct * 100).toFixed(0)}% exposed to ${regime.replace('_', ' ')}-sensitive assets`
    );
  }

  // High correlations if present
  const elevatedWarnings = concentrationWarnings.filter((w) => w.level === 'elevated');
  if (elevatedWarnings.length > 0) {
    parts.push('High concentration observed');
  }

  // Top sector exposure
  if (sectorExposure.length > 0 && sectorExposure[0].weight > 0.3) {
    parts.push(`Primary exposure: ${sectorExposure[0].label}`);
  }

  // Scenario indicator
  if (isScenarioAdjusted) {
    parts.push('(Scenario-adjusted)');
  }

  return parts.join(' • ');
}

// ============================================================================
// Main Calculation Function
// ============================================================================

/**
 * Calculate complete portfolio health metrics.
 */
export function calculatePortfolioHealth(
  input: PortfolioHealthInput,
  includeCorrelations: boolean = false
): PortfolioHealth {
  const { positions, regime, volatilityPercentile, isScenarioMode } = input;

  // Early return for empty portfolio
  if (positions.length === 0) {
    return {
      riskLevel: 'low',
      riskScore: 0,
      sectorExposure: [],
      concentrationWarnings: [],
      regime,
      regimeSensitiveExposure: 0,
      isScenarioAdjusted: isScenarioMode,
      summaryText: 'No positions to analyze.',
    };
  }

  // Calculate sector exposure
  const sectorExposure = calculateSectorExposure(positions);

  // Calculate concentration warnings
  const concentrationWarnings = calculateConcentrationWarnings(positions, sectorExposure);

  // Calculate correlations (only if requested - Institutional+)
  const correlations = includeCorrelations ? calculateCorrelations(positions) : undefined;

  // Calculate regime-sensitive exposure
  let regimeSensitiveExposure = 0;
  for (const sector of sectorExposure) {
    if (sector.regimeSensitivity.includes(regime)) {
      regimeSensitiveExposure += sector.weight;
    }
  }

  // Calculate risk score
  const riskBreakdown = calculateRiskScore(
    positions,
    sectorExposure,
    regime,
    volatilityPercentile,
    correlations
  );

  // Generate summary text
  const summaryText = generateSummaryText(
    riskBreakdown.level,
    sectorExposure,
    concentrationWarnings,
    regime,
    regimeSensitiveExposure,
    isScenarioMode
  );

  return {
    riskLevel: riskBreakdown.level,
    riskScore: riskBreakdown.score,
    riskBreakdown,
    sectorExposure,
    concentrationWarnings,
    correlations,
    regime,
    regimeSensitiveExposure,
    isScenarioAdjusted: isScenarioMode,
    summaryText,
  };
}

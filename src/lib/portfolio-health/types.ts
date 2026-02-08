/**
 * Portfolio Health types and interfaces.
 *
 * Defines the data structures for portfolio health analysis.
 * All metrics are informational only - no recommendations or advice.
 */

import type { RegimeType } from '@/lib/chart/regime-context';

/**
 * Risk level classification for portfolio health.
 */
export type RiskLevel = 'low' | 'moderate' | 'elevated';

/**
 * Sector classification for portfolio exposure analysis.
 */
export type Sector =
  | 'technology'
  | 'healthcare'
  | 'financials'
  | 'consumer_discretionary'
  | 'consumer_staples'
  | 'energy'
  | 'industrials'
  | 'materials'
  | 'utilities'
  | 'real_estate'
  | 'communication_services'
  | 'other';

/**
 * Sector exposure data for a portfolio.
 */
export interface SectorExposure {
  sector: Sector;
  label: string;
  weight: number; // 0-1 (percentage of portfolio)
  regimeSensitivity: RegimeType[]; // Regimes this sector tends to be sensitive to
}

/**
 * Concentration warning for portfolio positions.
 */
export interface ConcentrationWarning {
  type: 'single_position' | 'sector' | 'correlation_cluster';
  level: 'info' | 'caution' | 'elevated';
  message: string;
  details?: string;
}

/**
 * Correlation data between two positions.
 */
export interface PositionCorrelation {
  symbolA: string;
  symbolB: string;
  correlation: number; // -1 to 1
  label: 'high_positive' | 'moderate_positive' | 'low' | 'moderate_negative' | 'high_negative';
}

/**
 * Regime-weighted risk score breakdown.
 */
export interface RiskScoreBreakdown {
  /** Overall risk score 0-100 */
  score: number;
  /** Risk level classification */
  level: RiskLevel;
  /** Contribution from current regime */
  regimeContribution: number;
  /** Contribution from volatility exposure */
  volatilityContribution: number;
  /** Contribution from concentration */
  concentrationContribution: number;
  /** Contribution from correlation (Institutional+ only) */
  correlationContribution?: number;
}

/**
 * Complete portfolio health summary.
 */
export interface PortfolioHealth {
  /** Overall risk level */
  riskLevel: RiskLevel;
  /** Risk score 0-100 */
  riskScore: number;
  /** Detailed risk breakdown (Pro+) */
  riskBreakdown?: RiskScoreBreakdown;
  /** Sector exposure breakdown */
  sectorExposure: SectorExposure[];
  /** Concentration warnings */
  concentrationWarnings: ConcentrationWarning[];
  /** Position correlations (Institutional+) */
  correlations?: PositionCorrelation[];
  /** Regime context */
  regime: RegimeType;
  /** Percentage exposed to regime-sensitive assets */
  regimeSensitiveExposure: number;
  /** Whether values are scenario-adjusted */
  isScenarioAdjusted: boolean;
  /** Summary copy for display */
  summaryText: string;
}

/**
 * Position with sector information for health calculations.
 */
export interface PositionWithSector {
  symbol: string;
  marketValue: number;
  weight: number; // 0-1
  sector: Sector;
  unrealizedPLPct: number;
}

/**
 * Input data for portfolio health calculations.
 */
export interface PortfolioHealthInput {
  positions: PositionWithSector[];
  totalValue: number;
  regime: RegimeType;
  volatilityPercentile: number;
  /** Whether scenario mode is active */
  isScenarioMode: boolean;
}

/**
 * Portfolio Health entitlements by tier.
 *
 * Defines what portfolio health features each tier has access to.
 * Pro+: Full health summary, sector exposure, concentration warnings, risk score
 * Institutional+: All Pro features plus correlation analysis and granular breakdown
 */

import { type PlanKey } from '../plan-config';

export interface PortfolioHealthEntitlements {
  /** Whether portfolio health features are enabled */
  enabled: boolean;
  /** Whether the "Health at a Glance" widget is visible */
  widgetEnabled: boolean;
  /** Whether sector exposure breakdown is available */
  sectorExposureEnabled: boolean;
  /** Whether concentration warnings are shown */
  concentrationWarningsEnabled: boolean;
  /** Whether regime-weighted risk score is available */
  riskScoreEnabled: boolean;
  /** Whether correlation analysis is available (Institutional+) */
  correlationAnalysisEnabled: boolean;
  /** Whether granular risk breakdown is available (Institutional+) */
  granularRiskBreakdown: boolean;
  /** Whether enhanced explanatory copy is shown (Institutional+) */
  enhancedCopy: boolean;
  /** Tier label for UI display */
  tierLabel: string;
}

/**
 * Portfolio health entitlements by plan tier.
 */
const PORTFOLIO_HEALTH_ENTITLEMENTS: Record<PlanKey, PortfolioHealthEntitlements> = {
  free: {
    enabled: false,
    widgetEnabled: false,
    sectorExposureEnabled: false,
    concentrationWarningsEnabled: false,
    riskScoreEnabled: false,
    correlationAnalysisEnabled: false,
    granularRiskBreakdown: false,
    enhancedCopy: false,
    tierLabel: 'Free',
  },
  starter: {
    enabled: false,
    widgetEnabled: false,
    sectorExposureEnabled: false,
    concentrationWarningsEnabled: false,
    riskScoreEnabled: false,
    correlationAnalysisEnabled: false,
    granularRiskBreakdown: false,
    enhancedCopy: false,
    tierLabel: 'Starter',
  },
  pro: {
    enabled: true,
    widgetEnabled: true,
    sectorExposureEnabled: true,
    concentrationWarningsEnabled: true,
    riskScoreEnabled: true,
    correlationAnalysisEnabled: false,
    granularRiskBreakdown: false,
    enhancedCopy: false,
    tierLabel: 'Pro',
  },
  institutional: {
    enabled: true,
    widgetEnabled: true,
    sectorExposureEnabled: true,
    concentrationWarningsEnabled: true,
    riskScoreEnabled: true,
    correlationAnalysisEnabled: true,
    granularRiskBreakdown: true,
    enhancedCopy: true,
    tierLabel: 'Institutional',
  },
  founder: {
    enabled: true,
    widgetEnabled: true,
    sectorExposureEnabled: true,
    concentrationWarningsEnabled: true,
    riskScoreEnabled: true,
    correlationAnalysisEnabled: true,
    granularRiskBreakdown: true,
    enhancedCopy: true,
    tierLabel: 'Unlimited',
  },
  full_access: {
    enabled: true,
    widgetEnabled: true,
    sectorExposureEnabled: true,
    concentrationWarningsEnabled: true,
    riskScoreEnabled: true,
    correlationAnalysisEnabled: true,
    granularRiskBreakdown: true,
    enhancedCopy: true,
    tierLabel: 'Unlimited',
  },
};

/**
 * Get portfolio health entitlements for a given plan.
 * Falls back to free tier for unknown plans.
 */
export function getPortfolioHealthEntitlements(planName: string | undefined): PortfolioHealthEntitlements {
  const key = (planName?.toLowerCase() || 'free') as PlanKey;
  return PORTFOLIO_HEALTH_ENTITLEMENTS[key] || PORTFOLIO_HEALTH_ENTITLEMENTS.free;
}

/**
 * Check if a user has access to portfolio health features.
 */
export function hasPortfolioHealthAccess(planName: string | undefined): boolean {
  return getPortfolioHealthEntitlements(planName).enabled;
}

/**
 * Check if a user has access to correlation analysis (Institutional+).
 */
export function hasCorrelationAccess(planName: string | undefined): boolean {
  return getPortfolioHealthEntitlements(planName).correlationAnalysisEnabled;
}

/**
 * Centralized Scenario Mode entitlements.
 *
 * Defines what scenario capabilities each tier has access to.
 * This is the single source of truth for scenario feature gating.
 */

import { type PlanKey } from './plan-config';

export interface ScenarioEntitlements {
  /** Whether scenario mode is available at all */
  enabled: boolean;
  /** Maximum number of simultaneous overrides (Free=1, others=3) */
  maxActiveOverrides: number;
  /** Whether to show baseline vs scenario comparison */
  showBaselineCompare: boolean;
  /** Whether to show delta indicators (+/-) */
  showDeltas: boolean;
  /** Whether preset scenarios are available */
  presetsEnabled: boolean;
  /** Whether export functionality is available */
  exportEnabled: boolean;
  /** Whether scenario labeling is available */
  labelsEnabled: boolean;
  /** Tier display name for UI */
  tierLabel: 'Lite' | 'Plus' | 'Advanced' | 'Unlimited';
}

/**
 * Scenario entitlements by plan tier.
 */
const SCENARIO_ENTITLEMENTS: Record<PlanKey, ScenarioEntitlements> = {
  free: {
    enabled: true,
    maxActiveOverrides: 1,
    showBaselineCompare: false,
    showDeltas: false,
    presetsEnabled: false,
    exportEnabled: false,
    labelsEnabled: false,
    tierLabel: 'Lite',
  },
  starter: {
    enabled: true,
    maxActiveOverrides: 3,
    showBaselineCompare: true,
    showDeltas: true,
    presetsEnabled: true,
    exportEnabled: false,
    labelsEnabled: false,
    tierLabel: 'Plus',
  },
  pro: {
    enabled: true,
    maxActiveOverrides: 3,
    showBaselineCompare: true,
    showDeltas: true,
    presetsEnabled: true,
    exportEnabled: false,
    labelsEnabled: false,
    tierLabel: 'Plus',
  },
  founding_pro: {
    enabled: true,
    maxActiveOverrides: 3,
    showBaselineCompare: true,
    showDeltas: true,
    presetsEnabled: true,
    exportEnabled: false,
    labelsEnabled: false,
    tierLabel: 'Plus',
  },
  institutional: {
    enabled: true,
    maxActiveOverrides: 3,
    showBaselineCompare: true,
    showDeltas: true,
    presetsEnabled: true,
    exportEnabled: true,
    labelsEnabled: true,
    tierLabel: 'Advanced',
  },
  founder: {
    enabled: true,
    maxActiveOverrides: 999, // Effectively unlimited
    showBaselineCompare: true,
    showDeltas: true,
    presetsEnabled: true,
    exportEnabled: true,
    labelsEnabled: true,
    tierLabel: 'Unlimited',
  },
  full_access: {
    enabled: true,
    maxActiveOverrides: 999, // Effectively unlimited
    showBaselineCompare: true,
    showDeltas: true,
    presetsEnabled: true,
    exportEnabled: true,
    labelsEnabled: true,
    tierLabel: 'Unlimited',
  },
};

/**
 * Get scenario entitlements for a given plan.
 * Falls back to free tier for unknown plans.
 */
export function getScenarioEntitlements(planName: string | undefined): ScenarioEntitlements {
  const key = (planName?.toLowerCase() || 'free') as PlanKey;
  return SCENARIO_ENTITLEMENTS[key] || SCENARIO_ENTITLEMENTS.free;
}

/**
 * Count the number of active overrides in the current scenario state.
 */
export function countActiveOverrides(overrides: {
  volatilityPercentile: number | null;
  trendScore: number | null;
  breadthScore: number | null;
}): number {
  let count = 0;
  if (overrides.volatilityPercentile !== null) count++;
  if (overrides.trendScore !== null) count++;
  if (overrides.breadthScore !== null) count++;
  return count;
}

/**
 * Check if adding another override would exceed the tier limit.
 */
export function canAddOverride(
  currentOverrides: {
    volatilityPercentile: number | null;
    trendScore: number | null;
    breadthScore: number | null;
  },
  planName: string | undefined
): boolean {
  const entitlements = getScenarioEntitlements(planName);
  const currentCount = countActiveOverrides(currentOverrides);
  return currentCount < entitlements.maxActiveOverrides;
}

/**
 * Scenario presets available for Plus+ tiers.
 */
export interface ScenarioPreset {
  id: string;
  label: string;
  description: string;
  overrides: {
    volatilityPercentile?: number;
    trendScore?: number;
    breadthScore?: number;
  };
}

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: 'low_vol_expansion',
    label: 'Low Vol Expansion',
    description: 'Calm markets with positive trend',
    overrides: {
      volatilityPercentile: 20,
      trendScore: 0.6,
      breadthScore: 0.75,
    },
  },
  {
    id: 'high_rate_stress',
    label: 'High Rate Stress',
    description: 'Elevated volatility with weak breadth',
    overrides: {
      volatilityPercentile: 75,
      trendScore: -0.2,
      breadthScore: 0.35,
    },
  },
  {
    id: 'recession_shock',
    label: 'Recession Shock',
    description: 'High volatility bear scenario',
    overrides: {
      volatilityPercentile: 90,
      trendScore: -0.7,
      breadthScore: 0.2,
    },
  },
];

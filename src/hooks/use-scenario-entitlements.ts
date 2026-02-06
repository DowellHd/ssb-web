/**
 * React hook for accessing scenario mode entitlements.
 */

import { useMemo } from 'react';
import {
  getScenarioEntitlements,
  countActiveOverrides,
  type ScenarioEntitlements,
} from '@/lib/scenario-entitlements';
import { useScenarioModeStore } from '@/stores/scenario-mode-store';

interface UseScenarioEntitlementsResult extends ScenarioEntitlements {
  /** Number of currently active overrides */
  activeOverrideCount: number;
  /** Whether another override can be added */
  canAddMoreOverrides: boolean;
  /** Number of remaining overrides allowed */
  remainingOverrides: number;
}

/**
 * Hook to get scenario entitlements for the current user's plan.
 *
 * @param planName - The user's current plan name
 * @returns Scenario entitlements with current state info
 */
export function useScenarioEntitlements(planName: string | undefined): UseScenarioEntitlementsResult {
  const overrides = useScenarioModeStore((state) => state.overrides);

  return useMemo(() => {
    const entitlements = getScenarioEntitlements(planName);
    const activeCount = countActiveOverrides(overrides);
    const remaining = Math.max(0, entitlements.maxActiveOverrides - activeCount);

    return {
      ...entitlements,
      activeOverrideCount: activeCount,
      canAddMoreOverrides: activeCount < entitlements.maxActiveOverrides,
      remainingOverrides: remaining,
    };
  }, [planName, overrides]);
}

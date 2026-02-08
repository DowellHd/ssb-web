/**
 * React hook for portfolio health calculations.
 *
 * Integrates with:
 * - Paper trading positions
 * - Scenario mode state
 * - Regime data
 * - Tier entitlements
 */

'use client';

import { useMemo } from 'react';
import { usePositions } from './use-paper-trading';
import { useScenarioModeStore, useIsScenarioMode } from '@/stores/scenario-mode-store';
import { usePlan } from '@/stores/plan-store';
import {
  calculatePortfolioHealth,
  getPortfolioHealthEntitlements,
  getSectorForSymbol,
  type PortfolioHealth,
  type PortfolioHealthInput,
  type PositionWithSector,
} from '@/lib/portfolio-health';
import type { RegimeType } from '@/lib/chart/regime-context';

interface UsePortfolioHealthOptions {
  /** Live regime data (or scenario-adjusted) */
  regime?: RegimeType;
  /** Live volatility percentile (or scenario-adjusted) */
  volatilityPercentile?: number;
}

interface UsePortfolioHealthResult {
  /** Calculated portfolio health metrics */
  health: PortfolioHealth | null;
  /** Whether data is loading */
  isLoading: boolean;
  /** Tier entitlements for portfolio health */
  entitlements: ReturnType<typeof getPortfolioHealthEntitlements>;
  /** Whether user has access to portfolio health features */
  hasAccess: boolean;
  /** Whether scenario mode is affecting calculations */
  isScenarioAdjusted: boolean;
}

/**
 * Hook to calculate portfolio health with tier-aware features.
 */
export function usePortfolioHealth(
  options: UsePortfolioHealthOptions = {}
): UsePortfolioHealthResult {
  const plan = usePlan();
  const { data: positionsData, isLoading } = usePositions();
  const isScenarioMode = useIsScenarioMode();
  const scenarioOverrides = useScenarioModeStore((state) => state.overrides);

  // Get entitlements for current plan
  const entitlements = useMemo(() => {
    return getPortfolioHealthEntitlements(plan);
  }, [plan]);

  // Determine effective regime and volatility (live or scenario-adjusted)
  const effectiveRegime: RegimeType = useMemo(() => {
    if (isScenarioMode && scenarioOverrides.regimeOverride) {
      return scenarioOverrides.regimeOverride;
    }
    return options.regime || 'sideways';
  }, [isScenarioMode, scenarioOverrides.regimeOverride, options.regime]);

  const effectiveVolatility = useMemo(() => {
    if (isScenarioMode && scenarioOverrides.volatilityPercentile !== null) {
      return scenarioOverrides.volatilityPercentile;
    }
    return options.volatilityPercentile ?? 50;
  }, [isScenarioMode, scenarioOverrides.volatilityPercentile, options.volatilityPercentile]);

  // Convert positions to format with sector information
  const positionsWithSector: PositionWithSector[] = useMemo(() => {
    if (!positionsData?.positions) return [];

    const totalValue = positionsData.total_value || 1;

    return positionsData.positions.map((position) => ({
      symbol: position.symbol,
      marketValue: position.market_value,
      weight: position.market_value / totalValue,
      sector: getSectorForSymbol(position.symbol),
      unrealizedPLPct: position.unrealized_pl_pct,
    }));
  }, [positionsData]);

  // Calculate portfolio health
  const health = useMemo(() => {
    if (!entitlements.enabled || positionsWithSector.length === 0) {
      return null;
    }

    const input: PortfolioHealthInput = {
      positions: positionsWithSector,
      totalValue: positionsData?.total_value || 0,
      regime: effectiveRegime,
      volatilityPercentile: effectiveVolatility,
      isScenarioMode,
    };

    // Include correlations only for Institutional+ tiers
    return calculatePortfolioHealth(input, entitlements.correlationAnalysisEnabled);
  }, [
    entitlements.enabled,
    entitlements.correlationAnalysisEnabled,
    positionsWithSector,
    positionsData?.total_value,
    effectiveRegime,
    effectiveVolatility,
    isScenarioMode,
  ]);

  return {
    health,
    isLoading,
    entitlements,
    hasAccess: entitlements.enabled,
    isScenarioAdjusted: isScenarioMode,
  };
}

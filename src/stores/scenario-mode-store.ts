/**
 * Zustand store for Scenario Mode (what-if simulation).
 *
 * Allows users to explore how changing assumptions affects regime classification.
 * NO persistence - resets on page refresh. NO execution. Educational only.
 */
import { create } from 'zustand';

export type RegimeOverride = 'bull' | 'bear' | 'sideways' | 'high_volatility' | 'low_volatility' | null;

interface ScenarioOverrides {
  volatilityPercentile: number | null;
  trendScore: number | null;
  breadthScore: number | null;
  regimeOverride: RegimeOverride;
}

interface ScenarioModeState {
  /** Whether scenario mode is active */
  isEnabled: boolean;

  /** Override values (null = use live data) */
  overrides: ScenarioOverrides;

  /** Actions */
  enable: () => void;
  disable: () => void;
  toggle: () => void;
  setVolatilityPercentile: (value: number | null) => void;
  setTrendScore: (value: number | null) => void;
  setBreadthScore: (value: number | null) => void;
  setRegimeOverride: (value: RegimeOverride) => void;
  resetOverrides: () => void;
}

const DEFAULT_OVERRIDES: ScenarioOverrides = {
  volatilityPercentile: null,
  trendScore: null,
  breadthScore: null,
  regimeOverride: null,
};

export const useScenarioModeStore = create<ScenarioModeState>()((set) => ({
  isEnabled: false,
  overrides: { ...DEFAULT_OVERRIDES },

  enable: () => set({ isEnabled: true }),
  disable: () => set({ isEnabled: false, overrides: { ...DEFAULT_OVERRIDES } }),
  toggle: () =>
    set((state) => ({
      isEnabled: !state.isEnabled,
      // Reset overrides when disabling
      overrides: state.isEnabled ? { ...DEFAULT_OVERRIDES } : state.overrides,
    })),

  setVolatilityPercentile: (value) =>
    set((state) => ({
      overrides: { ...state.overrides, volatilityPercentile: value },
    })),

  setTrendScore: (value) =>
    set((state) => ({
      overrides: { ...state.overrides, trendScore: value },
    })),

  setBreadthScore: (value) =>
    set((state) => ({
      overrides: { ...state.overrides, breadthScore: value },
    })),

  setRegimeOverride: (value) =>
    set((state) => ({
      overrides: { ...state.overrides, regimeOverride: value },
    })),

  resetOverrides: () => set({ overrides: { ...DEFAULT_OVERRIDES } }),
}));

/**
 * Hook to check if scenario mode is active.
 */
export function useIsScenarioMode(): boolean {
  return useScenarioModeStore((state) => state.isEnabled);
}

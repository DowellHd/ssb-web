/**
 * Centralized plan/entitlements store.
 *
 * Single source of truth for user plan, tier, and entitlements across the app.
 * Handles normalization and precedence rules for founder/full_access tiers.
 */

import { create } from 'zustand';
import { getIntelligenceEntitlements, type EntitlementsInfo } from '@/lib/api/intelligence';
import { getPlanConfig, hasUnlimitedAccess, type PlanKey } from '@/lib/plan-config';

export interface NormalizedPlan {
  /** Raw plan name from API (e.g., 'free', 'pro', 'founder', 'full_access') */
  plan: PlanKey;
  /** Display name for UI (e.g., 'Free', 'Pro', 'Founder', 'Full Access') */
  planDisplayName: string;
  /** Badge label for UI (e.g., 'Free', 'Pro', 'All Access') */
  badgeLabel: string;
  /** Whether user has unlimited/all-access tier */
  isAllAccess: boolean;
  /** Whether user is founder specifically */
  isFounder: boolean;
  /** Whether user has full_access specifically */
  isFullAccess: boolean;
}

interface PlanState {
  /** Raw entitlements from API */
  entitlements: EntitlementsInfo | null;
  /** Normalized plan info with precedence applied */
  normalized: NormalizedPlan;
  /** Whether entitlements have been loaded */
  isLoaded: boolean;
  /** Whether entitlements are currently loading */
  isLoading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Fetch and store entitlements */
  fetchEntitlements: () => Promise<void>;
  /** Clear entitlements (e.g., on logout) */
  clear: () => void;
}

/**
 * Default normalized plan for unauthenticated/free users.
 */
const DEFAULT_NORMALIZED: NormalizedPlan = {
  plan: 'free',
  planDisplayName: 'Free',
  badgeLabel: 'Free',
  isAllAccess: false,
  isFounder: false,
  isFullAccess: false,
};

/**
 * Normalize entitlements with precedence rules:
 * - If is_founder flag is true OR plan_name is 'founder', treat as founder
 * - If is_full_access flag is true OR plan_name is 'full_access', treat as full_access
 * - founder and full_access both grant all-access privileges
 */
function normalizeEntitlements(entitlements: EntitlementsInfo): NormalizedPlan {
  const planLower = entitlements.plan_name?.toLowerCase() || 'free';

  // Check for founder (flag takes precedence)
  const isFounder = entitlements.is_founder === true || planLower === 'founder';

  // Check for full_access (flag takes precedence)
  const isFullAccess = entitlements.is_full_access === true || planLower === 'full_access';

  // Determine canonical plan with precedence
  let plan: PlanKey;
  if (isFounder) {
    plan = 'founder';
  } else if (isFullAccess) {
    plan = 'full_access';
  } else {
    // Map to known plan keys, default to free
    const knownPlans: PlanKey[] = ['free', 'starter', 'pro', 'founding_pro', 'institutional'];
    plan = knownPlans.includes(planLower as PlanKey) ? (planLower as PlanKey) : 'free';
  }

  const config = getPlanConfig(plan);

  return {
    plan,
    planDisplayName: config.displayName,
    badgeLabel: config.badgeLabel,
    isAllAccess: isFounder || isFullAccess,
    isFounder,
    isFullAccess,
  };
}

export const usePlanStore = create<PlanState>((set, get) => ({
  entitlements: null,
  normalized: DEFAULT_NORMALIZED,
  isLoaded: false,
  isLoading: false,
  error: null,

  fetchEntitlements: async () => {
    // Skip if already loading or loaded
    if (get().isLoading || get().isLoaded) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const entitlements = await getIntelligenceEntitlements();
      const normalized = normalizeEntitlements(entitlements);

      set({
        entitlements,
        normalized,
        isLoaded: true,
        isLoading: false,
      });

      // Log mismatch detection (non-verbose, for debugging)
      if (process.env.NODE_ENV === 'development') {
        const rawPlan = entitlements.plan_name?.toLowerCase();
        if (rawPlan !== normalized.plan) {
          console.debug(
            `[plan-store] Plan normalized: ${rawPlan} -> ${normalized.plan} (isFounder=${entitlements.is_founder}, isFullAccess=${entitlements.is_full_access})`
          );
        }
      }
    } catch (err: any) {
      set({
        error: err?.message || 'Failed to load entitlements',
        isLoading: false,
        // Keep default normalized values for free tier fallback
      });
    }
  },

  clear: () => {
    set({
      entitlements: null,
      normalized: DEFAULT_NORMALIZED,
      isLoaded: false,
      isLoading: false,
      error: null,
    });
  },
}));

/**
 * Hook to get the normalized plan name.
 * Convenience wrapper for common use case.
 */
export function usePlan(): PlanKey {
  return usePlanStore((state) => state.normalized.plan);
}

/**
 * Hook to get the plan display name.
 * Convenience wrapper for common use case.
 */
export function usePlanDisplayName(): string {
  return usePlanStore((state) => state.normalized.planDisplayName);
}

/**
 * Hook to check if user has all-access tier.
 * Convenience wrapper for common use case.
 */
export function useIsAllAccess(): boolean {
  return usePlanStore((state) => state.normalized.isAllAccess);
}

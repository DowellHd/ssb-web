'use client';

/**
 * Video/feature-tier access helper for the Learn module.
 *
 * Maps the application's PlanKey to the catalog's TierRequired values.
 * Uses usePlanStore (Zustand) — no React context provider required, so it
 * works on any page under /app regardless of route group.
 */

import { useCallback } from 'react';
import { usePlan } from '@/stores/plan-store';
import type { PlanKey } from '@/lib/plan-config';
import type { TierRequired } from './catalog';

export interface LearnVideoAccess {
  /**
   * Returns true if the current user's plan covers the given tier requirement.
   *
   * Tier hierarchy (ascending access):
   *   free < starter < pro < institutional
   *
   * founder and full_access grant access to all tiers.
   */
  canAccessTier: (tierRequired: TierRequired) => boolean;
  /** Convenience: current user is on a free plan. */
  isFree: boolean;
}

/** Numeric access level for each catalog TierRequired value. */
const REQUIRED_LEVEL: Record<TierRequired, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  institutional: 3,
};

/** Numeric access level granted by each application PlanKey. */
function planAccessLevel(plan: PlanKey): number {
  switch (plan) {
    case 'free':         return 0;
    case 'starter':      return 1;
    case 'pro':          return 2;
    case 'institutional': return 3;
    case 'founder':
    case 'full_access':  return 4; // all-access
    default:             return 0;
  }
}

export function useLearnVideoAccess(): LearnVideoAccess {
  const plan = usePlan();
  const level = planAccessLevel(plan);
  const isFree = plan === 'free';

  const canAccessTier = useCallback(
    (tierRequired: TierRequired): boolean => level >= REQUIRED_LEVEL[tierRequired],
    [level]
  );

  return { canAccessTier, isFree };
}

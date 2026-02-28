'use client';

/**
 * Video-tier access helper for the Learn module.
 *
 * Maps the application's UserTier to the catalog's TierRequired values.
 * Keeps all gating logic in one place so UI components stay thin.
 */

import { useCallback } from 'react';
import { useIntelligence } from '@/contexts/intelligence-context';
import type { TierRequired } from './catalog';

export interface LearnVideoAccess {
  /**
   * Returns true if the current user's plan covers the given tier requirement.
   *
   * Tier hierarchy (ascending access):
   *   free < starter < pro < institutional
   *
   * Note: the app's UserTier has no explicit 'starter' value — 'starter'
   * catalog content is treated as requiring pro-or-higher.
   */
  canAccessTier: (tierRequired: TierRequired) => boolean;
  /** Convenience: current user is on a free plan. */
  isFree: boolean;
}

export function useLearnVideoAccess(): LearnVideoAccess {
  const { tier, isProOrHigher, isInstitutional } = useIntelligence();

  const isFree = tier === 'free';

  const canAccessTier = useCallback(
    (tierRequired: TierRequired): boolean => {
      switch (tierRequired) {
        case 'free':
          return true;
        case 'starter':
          // Starter content requires at least a pro plan in this app's tier model
          return isProOrHigher;
        case 'pro':
          return isProOrHigher;
        case 'institutional':
          return isInstitutional;
        default:
          return false;
      }
    },
    [isProOrHigher, isInstitutional]
  );

  return { canAccessTier, isFree };
}

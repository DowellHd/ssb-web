/**
 * Centralized plan display configuration.
 * Single source of truth for plan names, badges, and styling.
 */

export type PlanKey = 'free' | 'starter' | 'pro' | 'institutional' | 'founder';

export interface PlanConfig {
  displayName: string;
  badgeLabel: string;
  badgeClassName: string;
  iconClassName: string;
}

/**
 * Plan display configuration mapping.
 * All plan display properties are defined here.
 */
export const PLAN_CONFIG: Record<PlanKey, PlanConfig> = {
  free: {
    displayName: 'Free',
    badgeLabel: 'Free',
    badgeClassName: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    iconClassName: 'text-slate-500',
  },
  starter: {
    displayName: 'Starter',
    badgeLabel: 'Starter',
    badgeClassName: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    iconClassName: 'text-emerald-500',
  },
  pro: {
    displayName: 'Pro',
    badgeLabel: 'Pro',
    badgeClassName: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    iconClassName: 'text-blue-500',
  },
  institutional: {
    displayName: 'Institutional',
    badgeLabel: 'Institutional',
    badgeClassName: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    iconClassName: 'text-purple-500',
  },
  founder: {
    displayName: 'Founder',
    badgeLabel: 'All Access',
    badgeClassName: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
    iconClassName: 'text-amber-500',
  },
};

/**
 * Get plan configuration by plan name.
 * Falls back to free plan config for unknown plans.
 */
export function getPlanConfig(planName: string | undefined): PlanConfig {
  const key = (planName?.toLowerCase() || 'free') as PlanKey;
  return PLAN_CONFIG[key] || PLAN_CONFIG.free;
}

/**
 * Get display name for a plan.
 */
export function getPlanDisplayName(planName: string | undefined): string {
  return getPlanConfig(planName).displayName;
}

/**
 * Check if a plan is the founder plan.
 */
export function isFounderPlan(planName: string | undefined): boolean {
  return planName?.toLowerCase() === 'founder';
}

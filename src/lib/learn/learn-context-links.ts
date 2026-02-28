/**
 * "Explore in SSB" feature link configuration.
 *
 * Maps the string IDs stored in CatalogModule.relatedFeatures to rich
 * display metadata used by the ContextLinksPanel component.
 */

import type { TierRequired } from './catalog';

export interface FeatureLinkConfig {
  /** Matches the string ID used in CatalogModule.relatedFeatures. */
  id: string;
  title: string;
  /** One-sentence description shown on the context link card. */
  description: string;
  /** App-internal href (relative path). */
  href: string;
  tierRequired: TierRequired;
  /**
   * Lucide icon name — resolved in the component to keep this file
   * free of React/JSX dependencies.
   */
  iconName: 'LayoutDashboard' | 'ShieldAlert' | 'Activity' | 'FlaskConical';
}

export const FEATURE_LINK_CONFIGS: Record<string, FeatureLinkConfig> = {
  dashboard: {
    id: 'dashboard',
    title: 'Portfolio Dashboard',
    description:
      "View your portfolio's performance, allocation breakdown, and key metrics in one place.",
    href: '/app',
    tierRequired: 'free',
    iconName: 'LayoutDashboard',
  },
  risk: {
    id: 'risk',
    title: 'Risk Analytics',
    description:
      'Apply volatility, VaR, CVaR, and drawdown measures to your actual portfolio holdings.',
    href: '/app/risk',
    tierRequired: 'pro',
    iconName: 'ShieldAlert',
  },
  regime: {
    id: 'regime',
    title: 'Market Regime Analysis',
    description:
      'Identify the current market regime and review historical regime transitions with live signals.',
    href: '/app/regime',
    tierRequired: 'pro',
    iconName: 'Activity',
  },
  backtests: {
    id: 'backtests',
    title: 'Backtesting Tool',
    description:
      'Run and review strategy backtests — test rules on historical data and analyze out-of-sample results.',
    href: '/app/backtests',
    tierRequired: 'pro',
    iconName: 'FlaskConical',
  },
};

/**
 * Returns ordered FeatureLinkConfig entries for a module's relatedFeatures array.
 * Unknown feature IDs are silently skipped.
 */
export function getFeatureLinksForModule(
  relatedFeatures: string[]
): FeatureLinkConfig[] {
  return relatedFeatures
    .map((id) => FEATURE_LINK_CONFIGS[id])
    .filter((cfg): cfg is FeatureLinkConfig => cfg !== undefined);
}

/**
 * Central subsystem version registry.
 *
 * Every SSB subsystem (regime, risk, charting, etc.) tracks its own
 * semantic version here. Bump the relevant version whenever the
 * subsystem's logic, model, or output format changes.
 *
 * These versions serve as the frontend's source of truth when the
 * backend model-info endpoint is unreachable or doesn't exist yet
 * for a given subsystem.
 */

export interface SubsystemVersion {
  /** Semantic version (major.minor.patch) */
  version: string;
  /** ISO-8601 date of the last meaningful change */
  lastUpdated: string;
  /** Short human-readable description */
  description: string;
}

export const SUBSYSTEM_VERSIONS = {
  regime: {
    version: '1.2.0',
    lastUpdated: '2026-02-05',
    description: 'Rule-based ensemble regime classification with long-term insights',
  },
  risk: {
    version: '1.1.0',
    lastUpdated: '2026-02-05',
    description: 'Parametric VaR risk analysis with long-term framing',
  },
  stress: {
    version: '1.0.0',
    lastUpdated: '2026-02-04',
    description: 'Historical stress testing',
  },
  chart: {
    version: '1.3.0',
    lastUpdated: '2026-02-05',
    description: 'Price chart with view mode support',
  },
  viewMode: {
    version: '1.0.0',
    lastUpdated: '2026-02-05',
    description: 'Global short-term/long-term view mode toggle',
  },
} as const satisfies Record<string, SubsystemVersion>;

export type SubsystemKey = keyof typeof SUBSYSTEM_VERSIONS;

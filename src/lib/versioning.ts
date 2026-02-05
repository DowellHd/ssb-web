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
    version: '1.1.0',
    lastUpdated: '2026-02-04',
    description: 'Rule-based ensemble regime classification',
  },
  risk: {
    version: '1.0.0',
    lastUpdated: '2026-02-04',
    description: 'Parametric VaR risk analysis',
  },
  stress: {
    version: '1.0.0',
    lastUpdated: '2026-02-04',
    description: 'Historical stress testing',
  },
  chart: {
    version: '1.2.0',
    lastUpdated: '2026-02-04',
    description: 'Price chart with technical overlays',
  },
} as const satisfies Record<string, SubsystemVersion>;

export type SubsystemKey = keyof typeof SUBSYSTEM_VERSIONS;

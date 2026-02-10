/**
 * Changelog entries for SSB platform updates.
 *
 * All entries are factual and refer to shipped work only.
 * No future dates, no commitments, no marketing language.
 */

export interface ChangelogEntry {
  /** Subsystem or area name */
  subsystem: string;
  /** Version tag (semantic or descriptive) */
  version: string;
  /** ISO-8601 date of release */
  date: string;
  /** Factual list of changes */
  changes: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    subsystem: 'Platform',
    version: '1.1.0',
    date: '2026-02-08',
    changes: [
      'Added changelog and roadmap views',
      'Added paper trade execution pipeline',
      'Added execution audit logging',
      'Enforced MFA on high-privilege actions',
    ],
  },
  {
    subsystem: 'Charting',
    version: '1.3.0',
    date: '2026-02-05',
    changes: [
      'Added short-term and long-term view mode support',
      'Improved price chart rendering',
    ],
  },
  {
    subsystem: 'Regime Analysis',
    version: '1.2.0',
    date: '2026-02-05',
    changes: [
      'Added interpretability explanations for regime classifications',
      'Improved confidence calculation transparency',
      'Added long-term regime insights',
    ],
  },
  {
    subsystem: 'Risk Analytics',
    version: '1.1.0',
    date: '2026-02-05',
    changes: [
      'Added long-term risk framing',
      'Improved parametric VaR analysis',
    ],
  },
  {
    subsystem: 'View Mode',
    version: '1.0.0',
    date: '2026-02-05',
    changes: [
      'Introduced global short-term and long-term view toggle',
    ],
  },
  {
    subsystem: 'Stress Testing',
    version: '1.0.0',
    date: '2026-02-04',
    changes: [
      'Launched historical stress testing',
    ],
  },
];

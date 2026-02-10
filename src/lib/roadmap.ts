/**
 * Roadmap focus areas for SSB.
 *
 * Informational only. No dates, no commitments, no delivery guarantees.
 * Subject to change at any time.
 */

export type RoadmapStatus = 'active' | 'planned' | 'exploring';

export interface RoadmapArea {
  /** High-level area name */
  title: string;
  /** Short directional description */
  description: string;
  /** Current status */
  status: RoadmapStatus;
}

export const ROADMAP_AREAS: RoadmapArea[] = [
  {
    title: 'Simulation & Backtesting',
    description:
      'Expanding historical backtesting capabilities and scenario simulation across asset classes.',
    status: 'active',
  },
  {
    title: 'Risk Context & Transparency',
    description:
      'Deepening risk analytics with additional factor exposures, correlation insights, and interpretability layers.',
    status: 'active',
  },
  {
    title: 'Portfolio Intelligence',
    description:
      'Developing portfolio-level health scoring, allocation analysis, and concentration detection.',
    status: 'planned',
  },
  {
    title: 'Data Coverage',
    description:
      'Broadening market data coverage to include additional exchanges, asset classes, and historical depth.',
    status: 'planned',
  },
  {
    title: 'Execution Infrastructure',
    description:
      'Improving paper trade execution reliability, audit trails, and policy controls.',
    status: 'exploring',
  },
];

export const ROADMAP_DISCLAIMER =
  'This roadmap is informational and subject to change. It does not represent commitments or delivery timelines.';

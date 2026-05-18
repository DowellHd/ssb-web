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
  learn: {
    version: '1.0.0',
    lastUpdated: '2026-02-20',
    description: '14 educational modules, 4 learning paths, 38-term glossary',
  },
  options: {
    version: '1.1.0',
    lastUpdated: '2026-03-08',
    description: 'Options chain viewer with Black-Scholes simulated data and paper trading',
  },
  tradeIdeas: {
    version: '1.0.0',
    lastUpdated: '2026-03-25',
    description: 'Signal-based trade idea generation across 5 strategy types',
  },
  signals: {
    version: '1.0.0',
    lastUpdated: '2026-04-23',
    description: 'Assisted Trading: live signal feed, pre-trade intelligence, trade logging, performance tracking',
  },
  globalMarkets: {
    version: '2.0.0',
    lastUpdated: '2026-04-12',
    description: 'Sovereign debt, FX hedging, ADRs, sector rotation, and country risk',
  },
  fixedIncome: {
    version: '2.0.0',
    lastUpdated: '2026-04-12',
    description: 'Bond screener, YTM/YTC calculator, tax tools, and bond ladder',
  },
  alternatives: {
    version: '2.0.0',
    lastUpdated: '2026-04-12',
    description: 'REITs, commodities, PE/VC, hedge funds, and hard assets',
  },
  advisorCrm: {
    version: '2.1.0',
    lastUpdated: '2026-04-13',
    description: 'CRM + Practice Analytics: lead scoring, revenue forecasting, pipeline BI, schedule & reports tabs',
  },
  strategyInsights: {
    version: '1.0.0',
    lastUpdated: '2026-04-23',
    description: 'AI Strategy Insights: LLM portfolio analysis, risk profiling, diversification scoring, educational themes',
  },
  portfolioManagement: {
    version: '1.2.0',
    lastUpdated: '2026-05-18',
    description: 'Portfolio Management: manual positions CRUD, risk profile DB persistence, real Monte Carlo simulation',
  },
} as const satisfies Record<string, SubsystemVersion>;

export type SubsystemKey = keyof typeof SUBSYSTEM_VERSIONS;

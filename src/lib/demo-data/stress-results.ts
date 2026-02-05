/**
 * Demo data for stress testing.
 * Matches API response shape from /api/v1/intelligence/v2/stress
 *
 * DEMO DATA - FOR DEMONSTRATION PURPOSES ONLY
 */

import type { Explanation } from './regime-analysis';
import { SUBSYSTEM_VERSIONS } from '@/lib/versioning';

export interface AssetImpact {
  symbol: string;
  impact_pct: number;
}

export interface ScenarioImpact {
  estimated_loss: string;
  estimated_loss_pct: number;
  worst_day_loss_pct?: number;
  recovery_days_historical?: number;
}

export interface ScenarioResult {
  scenario_id: string;
  scenario_name: string;
  scenario_type: 'historical' | 'hypothetical' | 'user_defined';
  period: string | null;
  portfolio_impact: ScenarioImpact;
  asset_impacts: AssetImpact[];
  parameters?: Record<string, unknown>;
}

export interface StressResultResponse {
  portfolio_id: string | null;
  analysis_date: string;
  scenarios: ScenarioResult[];
  explanation: Explanation;
  tier: string;
}

export interface StressScenario {
  id: string;
  name: string;
  type: 'historical' | 'hypothetical';
  period: string | null;
  description: string;
  market_impact_pct: number;
}

export const demoStressScenarios: StressScenario[] = [
  {
    id: '2008_financial_crisis',
    name: '2008 Financial Crisis',
    type: 'historical',
    period: 'Sep 2008 - Mar 2009',
    description: 'Global financial crisis triggered by subprime mortgage collapse',
    market_impact_pct: 57,
  },
  {
    id: '2020_covid_crash',
    name: 'COVID-19 Market Crash',
    type: 'historical',
    period: 'Feb 2020 - Mar 2020',
    description: 'Rapid market decline due to global pandemic fears',
    market_impact_pct: 34,
  },
  {
    id: '2022_tech_selloff',
    name: '2022 Tech Selloff',
    type: 'historical',
    period: 'Jan 2022 - Oct 2022',
    description: 'Technology sector decline amid rising interest rates',
    market_impact_pct: 25,
  },
  {
    id: '2000_dotcom_bust',
    name: 'Dot-Com Bubble Burst',
    type: 'historical',
    period: 'Mar 2000 - Oct 2002',
    description: 'Technology bubble collapse',
    market_impact_pct: 49,
  },
  {
    id: 'rate_shock_200bp',
    name: 'Interest Rate Shock (+200bp)',
    type: 'hypothetical',
    period: null,
    description: 'Sudden 200 basis point increase in interest rates',
    market_impact_pct: 15,
  },
  {
    id: 'recession_moderate',
    name: 'Moderate Recession',
    type: 'hypothetical',
    period: null,
    description: 'GDP decline of 2-3% over 6 months',
    market_impact_pct: 25,
  },
  {
    id: 'stagflation',
    name: 'Stagflation Scenario',
    type: 'hypothetical',
    period: null,
    description: 'High inflation combined with economic stagnation',
    market_impact_pct: 20,
  },
];

export const demoStressResults: StressResultResponse = {
  portfolio_id: 'demo-portfolio-001',
  analysis_date: new Date().toISOString().split('T')[0],
  scenarios: [
    {
      scenario_id: '2008_financial_crisis',
      scenario_name: '2008 Financial Crisis',
      scenario_type: 'historical',
      period: 'Sep 2008 - Mar 2009',
      portfolio_impact: {
        estimated_loss: '53125.00',
        estimated_loss_pct: 42.5,
        worst_day_loss_pct: 9.0,
        recovery_days_historical: 1412,
      },
      asset_impacts: [
        { symbol: 'AAPL', impact_pct: -49.0 },
        { symbol: 'MSFT', impact_pct: -49.0 },
        { symbol: 'GOOGL', impact_pct: -49.0 },
        { symbol: 'JPM', impact_pct: -83.0 },
        { symbol: 'XOM', impact_pct: -47.0 },
        { symbol: 'JNJ', impact_pct: -38.0 },
      ],
      parameters: { description: 'Global financial crisis triggered by subprime mortgage collapse' },
    },
    {
      scenario_id: '2020_covid_crash',
      scenario_name: 'COVID-19 Market Crash',
      scenario_type: 'historical',
      period: 'Feb 2020 - Mar 2020',
      portfolio_impact: {
        estimated_loss: '37500.00',
        estimated_loss_pct: 30.0,
        worst_day_loss_pct: 12.0,
        recovery_days_historical: 148,
      },
      asset_impacts: [
        { symbol: 'AAPL', impact_pct: -27.0 },
        { symbol: 'MSFT', impact_pct: -27.0 },
        { symbol: 'GOOGL', impact_pct: -27.0 },
        { symbol: 'JPM', impact_pct: -42.0 },
        { symbol: 'XOM', impact_pct: -62.0 },
        { symbol: 'JNJ', impact_pct: -22.0 },
      ],
      parameters: { description: 'Rapid market decline due to global pandemic fears' },
    },
    {
      scenario_id: '2022_tech_selloff',
      scenario_name: '2022 Tech Selloff',
      scenario_type: 'historical',
      period: 'Jan 2022 - Oct 2022',
      portfolio_impact: {
        estimated_loss: '31250.00',
        estimated_loss_pct: 25.0,
        worst_day_loss_pct: 5.0,
        recovery_days_historical: undefined,
      },
      asset_impacts: [
        { symbol: 'AAPL', impact_pct: -38.0 },
        { symbol: 'MSFT', impact_pct: -38.0 },
        { symbol: 'GOOGL', impact_pct: -38.0 },
        { symbol: 'JPM', impact_pct: -15.0 },
        { symbol: 'XOM', impact_pct: 45.0 },
        { symbol: 'JNJ', impact_pct: -10.0 },
      ],
      parameters: { description: 'Technology sector decline amid rising interest rates' },
    },
    {
      scenario_id: 'rate_shock_200bp',
      scenario_name: 'Interest Rate Shock (+200bp)',
      scenario_type: 'hypothetical',
      period: null,
      portfolio_impact: {
        estimated_loss: '18750.00',
        estimated_loss_pct: 15.0,
        worst_day_loss_pct: undefined,
        recovery_days_historical: undefined,
      },
      asset_impacts: [
        { symbol: 'AAPL', impact_pct: -18.0 },
        { symbol: 'MSFT', impact_pct: -18.0 },
        { symbol: 'GOOGL', impact_pct: -18.0 },
        { symbol: 'JPM', impact_pct: -8.0 },
        { symbol: 'XOM', impact_pct: -5.0 },
        { symbol: 'JNJ', impact_pct: -10.0 },
      ],
      parameters: { description: 'Sudden 200 basis point increase in interest rates' },
    },
    {
      scenario_id: 'recession_moderate',
      scenario_name: 'Moderate Recession',
      scenario_type: 'hypothetical',
      period: null,
      portfolio_impact: {
        estimated_loss: '28125.00',
        estimated_loss_pct: 22.5,
        worst_day_loss_pct: undefined,
        recovery_days_historical: undefined,
      },
      asset_impacts: [
        { symbol: 'AAPL', impact_pct: -22.0 },
        { symbol: 'MSFT', impact_pct: -22.0 },
        { symbol: 'GOOGL', impact_pct: -22.0 },
        { symbol: 'JPM', impact_pct: -30.0 },
        { symbol: 'XOM', impact_pct: -20.0 },
        { symbol: 'JNJ', impact_pct: -15.0 },
      ],
      parameters: { description: 'GDP decline of 2-3% over 6 months' },
    },
  ],
  explanation: {
    summary:
      'Stress tests show how the portfolio might behave under historical and hypothetical adverse scenarios. These are illustrative, not predictive.',
    key_factors: [
      'Worst case: 2008 Financial Crisis with 42.5% estimated loss',
      '2 scenario(s) show >30% potential drawdown',
      '2 scenario(s) show 15-30% potential drawdown',
      'High concentration (63%) in technology sector',
    ],
    model_info: {
      model_type: 'historical_stress_test',
      version: SUBSYSTEM_VERSIONS.stress.version,
      training_period: null,
      assumptions: [
        'Historical scenarios use actual market drawdowns',
        'Hypothetical scenarios use sector-based estimates',
        'Impact estimates assume no rebalancing during stress',
        'Correlations may increase during market stress',
      ],
    },
    limitations: [
      'Past stress events do not predict future crises',
      'Actual losses may differ significantly from estimates',
      'New types of market stress may not match historical patterns',
      'This analysis is for informational purposes only',
    ],
  },
  tier: 'pro',
};

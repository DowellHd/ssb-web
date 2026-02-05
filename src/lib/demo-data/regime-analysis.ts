/**
 * Demo data for regime analysis.
 * Matches API response shape from /api/v1/intelligence/v2/regime
 *
 * DEMO DATA - FOR DEMONSTRATION PURPOSES ONLY
 */

import { SUBSYSTEM_VERSIONS } from '@/lib/versioning';

export interface RegimeIndicators {
  trend_score: number;
  volatility_percentile: number;
  breadth_score: number;
  macro_alignment: 'expansionary' | 'contractionary' | 'neutral';
  vix_level?: number;
  yield_curve_slope?: number;
}

export interface ModelMetadata {
  model_type: string;
  version: string;
  training_period?: string | null;
  assumptions: string[];
}

export interface Explanation {
  summary: string;
  key_factors: string[];
  model_info: ModelMetadata;
  limitations: string[];
}

export interface RegimeAnalysisResponse {
  regime: 'bull' | 'bear' | 'sideways' | 'crisis';
  regime_probabilities: {
    bull: number;
    bear: number;
    sideways: number;
    crisis: number;
  };
  confidence: number;
  analysis_date: string;
  data_as_of: string;
  delay_applied_days: number;
  indicators: RegimeIndicators;
  explanation: Explanation;
  tier: string;
}

export const demoRegimeAnalysis: RegimeAnalysisResponse = {
  regime: 'bull',
  regime_probabilities: {
    bull: 0.52,
    bear: 0.18,
    sideways: 0.22,
    crisis: 0.08,
  },
  confidence: 0.73,
  analysis_date: new Date().toISOString().split('T')[0],
  data_as_of: new Date().toISOString().split('T')[0],
  delay_applied_days: 0,
  indicators: {
    trend_score: 0.65,
    volatility_percentile: 35,
    breadth_score: 0.42,
    macro_alignment: 'expansionary',
    vix_level: 18.5,
    yield_curve_slope: 1.2,
  },
  explanation: {
    summary:
      'Market conditions indicate positive momentum with supportive trend and volatility characteristics. This reflects current conditions, not a forecast of future performance.',
    key_factors: [
      'Price trending above key moving averages',
      'Volatility at 35th percentile (below average)',
      'VIX at 18.5',
      'Yield curve positive (T10Y2Y: 1.20%)',
      'Broad market participation (positive breadth)',
      'Analysis confidence: good (73%)',
    ],
    model_info: {
      model_type: 'rule_based_ensemble',
      version: SUBSYSTEM_VERSIONS.regime.version,
      training_period: null,
      assumptions: [
        'US equity markets',
        'Daily frequency data',
        'Regime classifications are analytical, not predictive',
      ],
    },
    limitations: [
      'Past market conditions do not predict future performance',
      'Regime transitions can occur rapidly without warning',
      'This classification reflects recent data, not a forecast',
      'This analysis is for informational purposes only',
    ],
  },
  tier: 'pro',
};

// Free tier version with delay
export const demoRegimeAnalysisFree: RegimeAnalysisResponse = {
  ...demoRegimeAnalysis,
  delay_applied_days: 7,
  data_as_of: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  tier: 'free',
  explanation: {
    ...demoRegimeAnalysis.explanation,
    key_factors: [
      ...demoRegimeAnalysis.explanation.key_factors,
      'Note: Data delayed by 7 day(s) for Free tier',
    ],
    limitations: [
      ...demoRegimeAnalysis.explanation.limitations,
      'Analysis uses 7-day delayed data (Free tier)',
    ],
  },
};

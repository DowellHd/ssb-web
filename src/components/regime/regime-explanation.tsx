'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Lightbulb, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useIsLongTerm } from '@/stores/view-mode-store';
import { LongTermInsights } from './long-term-insights';

interface RegimeIndicators {
  trend_score: number;
  volatility_percentile: number;
  breadth_score: number;
  macro_alignment?: number;
  vix_level?: number;
  yield_curve_slope?: number;
}

interface RegimeExplanationProps {
  regime: string;
  confidence: number;
  indicators: RegimeIndicators;
}

interface ExplanationPoint {
  text: string;
  direction: 'supporting' | 'opposing' | 'neutral';
}

/**
 * Generates deterministic explanations for regime classification.
 * Based on the rule-based ensemble logic.
 */
function generateExplanations(
  regime: string,
  confidence: number,
  indicators: RegimeIndicators
): { supporting: string[]; opposing: string[]; confidenceReason: string } {
  const supporting: string[] = [];
  const opposing: string[] = [];

  const { trend_score, volatility_percentile, breadth_score, vix_level, yield_curve_slope } = indicators;

  // Trend analysis
  const trendStrength = Math.abs(trend_score);
  const isBullishTrend = trend_score > 0.2;
  const isBearishTrend = trend_score < -0.2;
  const isNeutralTrend = !isBullishTrend && !isBearishTrend;

  // Volatility analysis
  const isHighVol = volatility_percentile > 70;
  const isLowVol = volatility_percentile < 30;
  const isMidVol = !isHighVol && !isLowVol;

  // Breadth analysis
  const isStrongBreadth = breadth_score > 0.6;
  const isWeakBreadth = breadth_score < 0.4;

  // VIX analysis
  const isHighVix = vix_level !== undefined && vix_level > 25;
  const isLowVix = vix_level !== undefined && vix_level < 15;

  // Yield curve analysis
  const isInvertedCurve = yield_curve_slope !== undefined && yield_curve_slope < 0;
  const isNormalCurve = yield_curve_slope !== undefined && yield_curve_slope > 0.5;

  // Generate explanations based on regime
  switch (regime.toLowerCase()) {
    case 'bull':
      // Supporting factors for bull
      if (isBullishTrend) {
        supporting.push(`Trend score positive (+${trend_score.toFixed(2)}) indicating upward momentum`);
      }
      if (isLowVol) {
        supporting.push(`Low volatility (${volatility_percentile}th percentile) supports stable uptrend`);
      }
      if (isStrongBreadth) {
        supporting.push(`Strong market breadth (${(breadth_score * 100).toFixed(0)}%) shows broad participation`);
      }
      if (isLowVix) {
        supporting.push(`VIX at ${vix_level?.toFixed(1)} indicates low fear`);
      }
      if (isNormalCurve) {
        supporting.push(`Normal yield curve (+${yield_curve_slope?.toFixed(2)}%) suggests healthy economy`);
      }

      // Opposing factors for bull
      if (isBearishTrend) {
        opposing.push(`Trend score negative (${trend_score.toFixed(2)}) conflicts with bull classification`);
      }
      if (isHighVol) {
        opposing.push(`Elevated volatility (${volatility_percentile}th percentile) adds uncertainty`);
      }
      if (isWeakBreadth) {
        opposing.push(`Weak breadth (${(breadth_score * 100).toFixed(0)}%) suggests narrow rally`);
      }
      if (isHighVix) {
        opposing.push(`VIX elevated at ${vix_level?.toFixed(1)} indicates lingering fear`);
      }
      if (isInvertedCurve) {
        opposing.push(`Inverted yield curve (${yield_curve_slope?.toFixed(2)}%) is a warning signal`);
      }
      break;

    case 'bear':
      // Supporting factors for bear
      if (isBearishTrend) {
        supporting.push(`Trend score negative (${trend_score.toFixed(2)}) indicating downward pressure`);
      }
      if (isHighVol) {
        supporting.push(`Elevated volatility (${volatility_percentile}th percentile) typical of bear markets`);
      }
      if (isWeakBreadth) {
        supporting.push(`Weak market breadth (${(breadth_score * 100).toFixed(0)}%) shows widespread selling`);
      }
      if (isHighVix) {
        supporting.push(`VIX at ${vix_level?.toFixed(1)} reflects high fear levels`);
      }
      if (isInvertedCurve) {
        opposing.push(`Inverted yield curve (${yield_curve_slope?.toFixed(2)}%) historically precedes recessions`);
      }

      // Opposing factors for bear
      if (isBullishTrend) {
        opposing.push(`Trend score positive (+${trend_score.toFixed(2)}) suggests potential reversal`);
      }
      if (isLowVol) {
        opposing.push(`Low volatility (${volatility_percentile}th percentile) unusual for bear market`);
      }
      if (isStrongBreadth) {
        opposing.push(`Strong breadth (${(breadth_score * 100).toFixed(0)}%) contradicts bearish thesis`);
      }
      if (isLowVix) {
        opposing.push(`Low VIX at ${vix_level?.toFixed(1)} suggests complacency`);
      }
      break;

    case 'sideways':
      // Supporting factors for sideways
      if (isNeutralTrend) {
        supporting.push(`Trend score near zero (${trend_score > 0 ? '+' : ''}${trend_score.toFixed(2)}) indicates no clear direction`);
      }
      if (isMidVol) {
        supporting.push(`Moderate volatility (${volatility_percentile}th percentile) typical of ranging markets`);
      }

      // Opposing factors for sideways
      if (isBullishTrend) {
        opposing.push(`Positive trend score (+${trend_score.toFixed(2)}) may signal breakout potential`);
      }
      if (isBearishTrend) {
        opposing.push(`Negative trend score (${trend_score.toFixed(2)}) may signal breakdown risk`);
      }
      if (isHighVol) {
        opposing.push(`High volatility (${volatility_percentile}th percentile) suggests impending move`);
      }
      break;

    case 'high_volatility':
      // Supporting factors for high volatility
      if (isHighVol) {
        supporting.push(`Volatility at ${volatility_percentile}th percentile, well above normal`);
      }
      if (isHighVix) {
        supporting.push(`VIX at ${vix_level?.toFixed(1)} confirms elevated fear`);
      }
      if (isWeakBreadth) {
        supporting.push(`Weak breadth (${(breadth_score * 100).toFixed(0)}%) during high vol suggests stress`);
      }

      // Opposing factors
      if (isLowVol) {
        opposing.push(`Volatility percentile (${volatility_percentile}th) below expected for this classification`);
      }
      if (isLowVix) {
        opposing.push(`VIX at ${vix_level?.toFixed(1)} contradicts high volatility regime`);
      }
      break;

    case 'low_volatility':
      // Supporting factors for low volatility
      if (isLowVol) {
        supporting.push(`Volatility at ${volatility_percentile}th percentile, well below normal`);
      }
      if (isLowVix) {
        supporting.push(`VIX at ${vix_level?.toFixed(1)} confirms calm markets`);
      }
      if (isStrongBreadth) {
        supporting.push(`Strong breadth (${(breadth_score * 100).toFixed(0)}%) supports stability`);
      }

      // Opposing factors
      if (isHighVol) {
        opposing.push(`Volatility percentile (${volatility_percentile}th) higher than expected`);
      }
      break;

    default:
      supporting.push('Regime classification based on weighted indicator ensemble');
  }

  // Ensure we always have at least one point
  if (supporting.length === 0) {
    supporting.push('Multiple indicators aligned with this regime classification');
  }

  // Generate confidence explanation
  let confidenceReason: string;
  const confPct = (confidence * 100).toFixed(0);

  if (confidence >= 0.8) {
    confidenceReason = `High confidence (${confPct}%) because indicators strongly align with ${regime.replace('_', ' ')} characteristics`;
  } else if (confidence >= 0.6) {
    confidenceReason = `Moderate confidence (${confPct}%) as most indicators support this classification, with some mixed signals`;
  } else if (confidence >= 0.4) {
    confidenceReason = `Lower confidence (${confPct}%) due to conflicting indicator signals; market may be transitioning`;
  } else {
    confidenceReason = `Low confidence (${confPct}%) indicates high uncertainty; indicators are sending mixed messages`;
  }

  // Add specific detail about what's limiting confidence
  if (opposing.length >= 2 && confidence < 0.8) {
    confidenceReason += `. ${opposing.length} opposing factors reduce certainty`;
  }

  return { supporting, opposing, confidenceReason };
}

export function RegimeExplanation({ regime, confidence, indicators }: RegimeExplanationProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const isLongTerm = useIsLongTerm();

  const { supporting, opposing, confidenceReason } = generateExplanations(regime, confidence, indicators);

  const regimeLabel = regime.replace('_', ' ');
  const confidencePct = (confidence * 100).toFixed(0);

  return (
    <div className="rounded-lg border bg-card">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          <span className="font-semibold">
            Why {regimeLabel} ({confidencePct}%)?
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Supporting factors */}
          {supporting.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ThumbsUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  Supporting Factors
                </span>
              </div>
              <ul className="space-y-1.5 ml-6">
                {supporting.map((point, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Opposing factors */}
          {opposing.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ThumbsDown className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-700 dark:text-red-400">
                  Opposing Factors
                </span>
              </div>
              <ul className="space-y-1.5 ml-6">
                {opposing.map((point, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Confidence explanation */}
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Confidence:</span> {confidenceReason}
            </p>
          </div>

          {/* Long-term insights (only in long-term mode) */}
          {isLongTerm && (
            <LongTermInsights
              regime={regime}
              confidence={confidence}
              indicators={indicators}
            />
          )}

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground/70 italic">
            This explanation is derived from the rule-based ensemble model. It describes indicator relationships, not predictions.
          </p>
        </div>
      )}
    </div>
  );
}

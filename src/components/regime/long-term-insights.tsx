'use client';

import { Calendar, TrendingDown, Shield, Scale } from 'lucide-react';

interface RegimeIndicators {
  trend_score: number;
  volatility_percentile: number;
  breadth_score: number;
  macro_alignment?: number;
  vix_level?: number;
  yield_curve_slope?: number;
}

interface LongTermInsightsProps {
  regime: string;
  confidence: number;
  indicators: RegimeIndicators;
}

/**
 * Generates long-term interpretations of regime data.
 * Focuses on regime persistence, drawdown implications, and diversification context.
 * No stock picking, no buy/sell language, purely informational.
 */
function generateLongTermInsights(
  regime: string,
  confidence: number,
  indicators: RegimeIndicators
): string[] {
  const insights: string[] = [];
  const { volatility_percentile, breadth_score } = indicators;

  const regimeLower = regime.toLowerCase();

  // Volatility implications for long-term
  if (volatility_percentile > 70) {
    insights.push(
      'Elevated volatility historically implies wider potential drawdowns over multi-month periods'
    );
  } else if (volatility_percentile < 30) {
    insights.push(
      'Low volatility periods can persist but historically precede volatility expansion'
    );
  }

  // Regime persistence insights
  switch (regimeLower) {
    case 'bear':
      insights.push(
        'Bear regimes historically tend to persist longer than bull regimes on average'
      );
      insights.push(
        'Recovery timing is historically unpredictable; outcomes depend more on asset allocation than entry timing'
      );
      break;
    case 'bull':
      insights.push(
        'Bull regimes can extend for years but are interspersed with corrections'
      );
      insights.push(
        'Long-term outcomes are more sensitive to staying invested than to regime timing'
      );
      break;
    case 'sideways':
      insights.push(
        'Sideways regimes historically resolve in either direction; duration is unpredictable'
      );
      break;
    case 'high_volatility':
      insights.push(
        'High volatility regimes historically see larger price swings in both directions'
      );
      insights.push(
        'Volatility clustering means elevated volatility often persists for weeks to months'
      );
      break;
    case 'low_volatility':
      insights.push(
        'Extended low volatility periods historically end with volatility spikes'
      );
      break;
  }

  // Breadth implications
  if (breadth_score < 0.3) {
    insights.push(
      'Narrow market breadth suggests concentration risk; diversification reduces single-stock exposure'
    );
  } else if (breadth_score > 0.7) {
    insights.push(
      'Broad market participation historically supports regime persistence'
    );
  }

  // Confidence implications for long-term
  if (confidence < 0.5) {
    insights.push(
      'Low regime confidence suggests transitional period; long-term allocations are less sensitive to regime timing'
    );
  }

  // Universal long-term framing
  insights.push(
    'Regime context frames risk environment, not expected returns'
  );

  return insights;
}

export function LongTermInsights({ regime, confidence, indicators }: LongTermInsightsProps) {
  const insights = generateLongTermInsights(regime, confidence, indicators);

  return (
    <div className="rounded-lg border bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h4 className="font-semibold text-blue-900 dark:text-blue-100">
          What does this mean long-term?
        </h4>
      </div>
      <ul className="space-y-2">
        {insights.map((insight, index) => (
          <li
            key={index}
            className="flex items-start gap-2 text-sm text-blue-800 dark:text-blue-200"
          >
            <span className="text-blue-500 mt-0.5">•</span>
            <span>{insight}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700 text-xs text-blue-600 dark:text-blue-400 italic">
        Long-term view emphasizes regime persistence and risk framing over short-term signals.
      </p>
    </div>
  );
}

/**
 * Informational copy for long-term risk framing.
 * Displayed on risk-related pages when in long-term mode.
 */
export function LongTermRiskFraming({ className }: { className?: string }) {
  return (
    <div className={`rounded-lg border bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 p-4 ${className || ''}`}>
      <div className="flex items-center gap-2 mb-3">
        <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        <h4 className="font-semibold text-amber-900 dark:text-amber-100">
          Long-Term Risk Perspective
        </h4>
      </div>
      <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
        <li className="flex items-start gap-2">
          <TrendingDown className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <span>
            Volatility affects drawdown depth more than final outcome over multi-year horizons
          </span>
        </li>
        <li className="flex items-start gap-2">
          <Scale className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <span>
            Regime context frames the risk environment, not expected returns
          </span>
        </li>
      </ul>
      <p className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-700 text-xs text-amber-600 dark:text-amber-400 italic">
        Risk metrics describe historical behavior. Past performance does not predict future results.
      </p>
    </div>
  );
}

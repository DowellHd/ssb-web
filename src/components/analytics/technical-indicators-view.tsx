'use client';

import { cn } from '@/lib/utils';
import type { TechnicalAnalysisResponse, IndicatorValue } from '@/lib/api/analytics';

interface TechnicalIndicatorsViewProps {
  result: TechnicalAnalysisResponse;
  className?: string;
}

const SIGNAL_COLORS: Record<string, string> = {
  bullish:  'text-green-600 dark:text-green-400',
  bearish:  'text-red-600 dark:text-red-400',
  neutral:  'text-muted-foreground',
  overbought: 'text-orange-600 dark:text-orange-400',
  oversold:   'text-blue-600 dark:text-blue-400',
};

const BIAS_COLORS: Record<string, string> = {
  bullish: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  bearish: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  neutral: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

function IndicatorRow({ indicator }: { indicator: IndicatorValue }) {
  const signalColor = indicator.signal ? SIGNAL_COLORS[indicator.signal] ?? 'text-muted-foreground' : 'text-muted-foreground';
  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="px-3 py-2 font-medium text-xs">{indicator.name}</td>
      <td className="px-3 py-2 text-right font-mono text-xs">
        {indicator.value != null ? indicator.value.toFixed(4) : '—'}
      </td>
      <td className="px-3 py-2 text-right">
        {indicator.signal && (
          <span className={cn('text-xs font-medium capitalize', signalColor)}>
            {indicator.signal}
          </span>
        )}
      </td>
    </tr>
  );
}

const INDICATOR_GROUPS: Record<string, string[]> = {
  'Trend': ['SMA_20', 'SMA_50', 'SMA_200', 'EMA_12', 'EMA_26', 'EMA_50', 'DEMA', 'HMA', 'KAMA'],
  'Momentum': ['RSI', 'MACD', 'Stoch_K', 'Stoch_D', 'Williams_R', 'ROC', 'CCI', 'PPO'],
  'Volatility': ['BB_Upper', 'BB_Mid', 'BB_Lower', 'BB_Width', 'BB_Pct', 'ATR'],
  'Volume': ['OBV', 'CMF', 'MFI'],
  'Trend Strength': ['ADX', 'Aroon_Up', 'Aroon_Down'],
};

export function TechnicalIndicatorsView({ result, className }: TechnicalIndicatorsViewProps) {
  const indicatorMap = Object.fromEntries(result.indicators.map((i) => [i.name, i]));

  const grouped: Record<string, IndicatorValue[]> = {};
  const seen = new Set<string>();

  for (const [group, names] of Object.entries(INDICATOR_GROUPS)) {
    const matching = names.map((n) => indicatorMap[n]).filter(Boolean);
    if (matching.length > 0) {
      grouped[group] = matching;
      matching.forEach((i) => seen.add(i.name));
    }
  }

  // Any indicators not in known groups go into "Other"
  const other = result.indicators.filter((i) => !seen.has(i.name));
  if (other.length > 0) grouped['Other'] = other;

  return (
    <div className={cn('space-y-5', className)}>
      {/* Summary row */}
      <div className="flex items-center flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Trend Bias:</span>
          <span className={cn('text-sm font-semibold px-2 py-0.5 rounded-full capitalize', BIAS_COLORS[result.trend_bias] ?? BIAS_COLORS.neutral)}>
            {result.trend_bias}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Signal Strength:</span>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full',
                  result.signal_strength >= 70 ? 'bg-green-500' :
                  result.signal_strength >= 40 ? 'bg-amber-500' : 'bg-red-500'
                )}
                style={{ width: `${result.signal_strength}%` }}
              />
            </div>
            <span className="text-sm font-medium">{result.signal_strength}/100</span>
          </div>
        </div>
        <span className="text-xs text-muted-foreground ml-auto">
          {result.indicators.length} indicators · {result.tier} tier
        </span>
      </div>

      {/* Indicator tables by group */}
      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(grouped).map(([group, indicators]) => (
          <div key={group} className="rounded-lg border overflow-hidden">
            <div className="bg-muted/50 px-3 py-2 border-b">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {group}
              </h4>
            </div>
            <table className="w-full">
              <tbody className="divide-y">
                {indicators.map((ind) => (
                  <IndicatorRow key={ind.name} indicator={ind} />
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}

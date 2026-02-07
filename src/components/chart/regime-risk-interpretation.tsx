'use client';

import { AlertTriangle, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getRiskInterpretation,
  isElevatedRiskContext,
  REGIME_CONFIG,
  type RegimeType,
} from '@/lib/chart/regime-context';

interface RegimeRiskInterpretationProps {
  regime: RegimeType;
  volatilityPercentile: number;
  className?: string;
  /** Compact mode for smaller displays */
  compact?: boolean;
}

/**
 * Regime-aware risk interpretation copy that adapts to current market conditions.
 * Provides educational context without recommendations.
 */
export function RegimeRiskInterpretation({
  regime,
  volatilityPercentile,
  className,
  compact = false,
}: RegimeRiskInterpretationProps) {
  const interpretation = getRiskInterpretation(regime, volatilityPercentile);
  const isElevated = isElevatedRiskContext(regime, volatilityPercentile);
  const config = REGIME_CONFIG[regime];

  // Icon based on regime
  const Icon =
    regime === 'bull' ? TrendingUp :
    regime === 'bear' ? TrendingDown :
    regime === 'high_volatility' || regime === 'crisis' ? AlertTriangle :
    Activity;

  if (compact) {
    return (
      <p className={cn('text-[10px] text-muted-foreground', className)}>
        <span className={cn('font-medium', config.textClass)}>
          {config.shortLabel}:
        </span>{' '}
        {interpretation.split('.')[0]}.
      </p>
    );
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg',
        isElevated ? 'bg-amber-50/50 dark:bg-amber-950/20' : 'bg-muted/30',
        className
      )}
    >
      <div
        className={cn(
          'flex-shrink-0 p-1.5 rounded',
          isElevated
            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
            : 'bg-muted text-muted-foreground'
        )}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground mb-1">
          Regime Context
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {interpretation}
        </p>
        <p className="text-[10px] text-muted-foreground/70 mt-2 italic">
          This is informational context, not a recommendation.
        </p>
      </div>
    </div>
  );
}

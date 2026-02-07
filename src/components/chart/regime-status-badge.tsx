'use client';

import { useState, useRef } from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  REGIME_CONFIG,
  getRegimeExplanation,
  getRegimeDrivers,
  type RegimeType,
  type RegimeIndicators,
} from '@/lib/chart/regime-context';

interface RegimeStatusBadgeProps {
  regime: RegimeType;
  indicators: RegimeIndicators;
  confidence?: number;
  className?: string;
}

/**
 * Regime status badge with hover tooltip explaining the classification.
 * Non-clickable, informational only.
 */
export function RegimeStatusBadge({
  regime,
  indicators,
  confidence,
  className,
}: RegimeStatusBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const config = REGIME_CONFIG[regime] || REGIME_CONFIG.sideways;
  const explanation = getRegimeExplanation(regime, indicators);
  const { supporting, opposing } = getRegimeDrivers(indicators);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsHovered(false), 150);
  };

  return (
    <div
      className={cn('relative inline-flex', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {/* Badge */}
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border',
          'bg-background/80 backdrop-blur-sm',
          config.textClass,
          config.borderClass
        )}
        role="status"
        aria-label={`Current market regime: ${config.label}`}
        tabIndex={0}
      >
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            regime === 'bull' && 'bg-green-500',
            regime === 'bear' && 'bg-red-500',
            regime === 'sideways' && 'bg-blue-500',
            regime === 'high_volatility' && 'bg-orange-500',
            regime === 'low_volatility' && 'bg-sky-500',
            regime === 'crisis' && 'bg-amber-500'
          )}
          aria-hidden="true"
        />
        <span>{config.label}</span>
        <Info className="h-3 w-3 opacity-60" aria-hidden="true" />
      </div>

      {/* Hover tooltip */}
      {isHovered && (
        <div
          className={cn(
            'absolute top-full left-0 mt-2 z-50',
            'w-72 p-3 rounded-lg shadow-lg',
            'bg-popover border text-popover-foreground',
            'animate-in fade-in-0 zoom-in-95 duration-150'
          )}
          role="tooltip"
        >
          {/* Confidence */}
          {confidence !== undefined && (
            <div className="flex items-center justify-between mb-2 pb-2 border-b">
              <span className="text-xs text-muted-foreground">Confidence</span>
              <span className="text-xs font-medium">{(confidence * 100).toFixed(0)}%</span>
            </div>
          )}

          {/* Explanation */}
          <p className="text-xs text-muted-foreground mb-3">{explanation}</p>

          {/* Supporting factors */}
          {supporting.length > 0 && (
            <div className="mb-2">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Supporting Factors
              </p>
              <ul className="space-y-0.5">
                {supporting.slice(0, 3).map((factor, i) => (
                  <li key={i} className="text-xs flex items-start gap-1.5">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Opposing factors */}
          {opposing.length > 0 && (
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Opposing Signals
              </p>
              <ul className="space-y-0.5">
                {opposing.slice(0, 2).map((factor, i) => (
                  <li key={i} className="text-xs flex items-start gap-1.5">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-[10px] text-muted-foreground/70 mt-3 pt-2 border-t italic">
            Classification based on rule-based analysis. Not investment advice.
          </p>
        </div>
      )}
    </div>
  );
}

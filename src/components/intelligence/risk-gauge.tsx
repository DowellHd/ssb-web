'use client';

import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type RiskLevel = 'low' | 'moderate' | 'high' | 'extreme';

interface RiskGaugeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const riskConfig: Record<
  RiskLevel,
  { label: string; color: string; bgColor: string; position: number }
> = {
  low: {
    label: 'Low Risk',
    color: 'bg-green-500',
    bgColor: 'text-green-600 dark:text-green-500',
    position: 12.5,
  },
  moderate: {
    label: 'Moderate',
    color: 'bg-yellow-500',
    bgColor: 'text-yellow-600 dark:text-yellow-500',
    position: 37.5,
  },
  high: {
    label: 'High Risk',
    color: 'bg-orange-500',
    bgColor: 'text-orange-600 dark:text-orange-500',
    position: 62.5,
  },
  extreme: {
    label: 'Extreme',
    color: 'bg-red-500',
    bgColor: 'text-red-600 dark:text-red-500',
    position: 87.5,
  },
};

const sizeClasses = {
  sm: { gauge: 'h-2', indicator: 'h-4 w-1', text: 'text-xs' },
  md: { gauge: 'h-3', indicator: 'h-6 w-1.5', text: 'text-sm' },
  lg: { gauge: 'h-4', indicator: 'h-8 w-2', text: 'text-base' },
};

export function RiskGauge({
  level,
  size = 'md',
  showLabel = true,
  className,
}: RiskGaugeProps) {
  const config = riskConfig[level];
  const sizes = sizeClasses[size];

  return (
    <div className={cn('space-y-2', className)}>
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className={cn('font-medium', sizes.text, config.bgColor)}>
            {config.label}
          </span>
        </div>
      )}
      <div className="relative">
        {/* Gauge background */}
        <div
          className={cn(
            'w-full rounded-full overflow-hidden flex',
            sizes.gauge
          )}
        >
          <div className="flex-1 bg-green-200 dark:bg-green-900/50" />
          <div className="flex-1 bg-yellow-200 dark:bg-yellow-900/50" />
          <div className="flex-1 bg-orange-200 dark:bg-orange-900/50" />
          <div className="flex-1 bg-red-200 dark:bg-red-900/50" />
        </div>

        {/* Indicator */}
        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full',
            sizes.indicator,
            config.color
          )}
          style={{ left: `${config.position}%` }}
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>Low</span>
        <span>Moderate</span>
        <span>High</span>
        <span>Extreme</span>
      </div>
    </div>
  );
}

interface RiskLevelBadgeProps {
  level: RiskLevel;
  showTooltip?: boolean;
  className?: string;
}

const riskDescriptions: Record<RiskLevel, string> = {
  low: 'Portfolio volatility and drawdown potential are below historical averages for this asset mix.',
  moderate:
    'Portfolio risk is within typical ranges. Some positions may contribute disproportionately to overall risk.',
  high: 'Elevated volatility detected. The portfolio may experience larger swings than historical norms.',
  extreme:
    'Risk metrics are significantly elevated. Historical drawdowns suggest substantial loss potential.',
};

export function RiskLevelBadge({
  level,
  showTooltip = true,
  className,
}: RiskLevelBadgeProps) {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const config = riskConfig[level];

  const badgeClasses: Record<RiskLevel, string> = {
    low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    moderate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    extreme: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div className={cn('relative inline-flex items-center', className)}>
      <span
        className={cn(
          'inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full',
          badgeClasses[level]
        )}
      >
        {config.label}
        {showTooltip && (
          <button
            type="button"
            onMouseEnter={() => setIsTooltipVisible(true)}
            onMouseLeave={() => setIsTooltipVisible(false)}
            onFocus={() => setIsTooltipVisible(true)}
            onBlur={() => setIsTooltipVisible(false)}
            className="outline-none ml-0.5"
            aria-label="What does this risk level mean?"
          >
            <HelpCircle className="h-3 w-3" />
          </button>
        )}
      </span>

      {/* Tooltip */}
      {showTooltip && isTooltipVisible && (
        <div
          className="absolute left-0 top-full z-50 mt-2 w-64 rounded-lg border bg-popover p-3 shadow-lg"
          role="tooltip"
        >
          <div className="space-y-1.5">
            <p className={cn('text-xs font-medium', config.bgColor)}>{config.label}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {riskDescriptions[level]}
            </p>
          </div>
          {/* Arrow */}
          <div className="absolute -top-1.5 left-4 h-3 w-3 rotate-45 border-l border-t bg-popover" />
        </div>
      )}
    </div>
  );
}

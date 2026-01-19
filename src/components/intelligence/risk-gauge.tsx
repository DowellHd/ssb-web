'use client';

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
  className?: string;
}

export function RiskLevelBadge({ level, className }: RiskLevelBadgeProps) {
  const config = riskConfig[level];

  const badgeClasses: Record<RiskLevel, string> = {
    low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    moderate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    extreme: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full',
        badgeClasses[level],
        className
      )}
    >
      {config.label}
    </span>
  );
}

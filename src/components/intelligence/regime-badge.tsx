'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, HelpCircle } from 'lucide-react';

type Regime = 'bull' | 'bear' | 'sideways' | 'crisis';

interface RegimeBadgeProps {
  regime: Regime;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const regimeConfig: Record<
  Regime,
  { label: string; icon: typeof TrendingUp; bgClass: string; textClass: string }
> = {
  bull: {
    label: 'Bull Market',
    icon: TrendingUp,
    bgClass: 'bg-green-100 dark:bg-green-900/30',
    textClass: 'text-green-700 dark:text-green-400',
  },
  bear: {
    label: 'Bear Market',
    icon: TrendingDown,
    bgClass: 'bg-red-100 dark:bg-red-900/30',
    textClass: 'text-red-700 dark:text-red-400',
  },
  sideways: {
    label: 'Sideways',
    icon: Minus,
    bgClass: 'bg-gray-100 dark:bg-gray-800',
    textClass: 'text-gray-700 dark:text-gray-300',
  },
  crisis: {
    label: 'Crisis',
    icon: AlertTriangle,
    bgClass: 'bg-orange-100 dark:bg-orange-900/30',
    textClass: 'text-orange-700 dark:text-orange-400',
  },
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-3 py-1 text-sm gap-1.5',
  lg: 'px-4 py-1.5 text-base gap-2',
};

const iconSizes = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export function RegimeBadge({
  regime,
  size = 'md',
  showIcon = true,
  className,
}: RegimeBadgeProps) {
  const config = regimeConfig[regime];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        sizeClasses[size],
        config.bgClass,
        config.textClass,
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </span>
  );
}

interface ConfidenceBadgeProps {
  confidence: number;
  size?: 'sm' | 'md';
  showTooltip?: boolean;
  className?: string;
}

function getConfidenceInfo(percentage: number) {
  if (percentage >= 85) {
    return {
      label: 'High',
      colorClass: 'text-green-600 dark:text-green-400',
      bgClass: 'bg-green-100 dark:bg-green-900/30',
      description:
        'Strong agreement across indicators. The regime classification is well-supported by current market data.',
    };
  }
  if (percentage >= 65) {
    return {
      label: 'Moderate',
      colorClass: 'text-amber-600 dark:text-amber-400',
      bgClass: 'bg-amber-100 dark:bg-amber-900/30',
      description:
        'Mixed signals from indicators. Some uncertainty in the regime classification; markets may be in transition.',
    };
  }
  return {
    label: 'Low',
    colorClass: 'text-red-600 dark:text-red-400',
    bgClass: 'bg-red-100 dark:bg-red-900/30',
    description:
      'Conflicting signals across indicators. The current regime is unclear; exercise caution when interpreting results.',
  };
}

export function ConfidenceBadge({
  confidence,
  size = 'sm',
  showTooltip = true,
  className,
}: ConfidenceBadgeProps) {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  // Handle both 0-1 and 0-100 scale inputs
  const percentage = confidence <= 1 ? Math.round(confidence * 100) : Math.round(confidence);
  const info = getConfidenceInfo(percentage);

  return (
    <div className={cn('relative inline-flex items-center', className)}>
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium',
          info.bgClass,
          info.colorClass,
          size === 'sm' ? 'text-xs' : 'text-sm'
        )}
      >
        <span>{percentage}%</span>
        <span>confidence</span>
        {showTooltip && (
          <button
            type="button"
            onMouseEnter={() => setIsTooltipVisible(true)}
            onMouseLeave={() => setIsTooltipVisible(false)}
            onFocus={() => setIsTooltipVisible(true)}
            onBlur={() => setIsTooltipVisible(false)}
            className="outline-none ml-0.5"
            aria-label="What does this confidence score mean?"
          >
            <HelpCircle className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
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
            <p className={cn('text-xs font-medium', info.colorClass)}>
              {info.label} Confidence
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {info.description}
            </p>
          </div>
          {/* Arrow */}
          <div className="absolute -top-1.5 left-4 h-3 w-3 rotate-45 border-l border-t bg-popover" />
        </div>
      )}
    </div>
  );
}

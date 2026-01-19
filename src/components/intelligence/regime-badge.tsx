'use client';

import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';

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
  className?: string;
}

export function ConfidenceBadge({
  confidence,
  size = 'sm',
  className,
}: ConfidenceBadgeProps) {
  const percentage = Math.round(confidence * 100);

  const getConfidenceLevel = () => {
    if (percentage >= 80) return { label: 'High', class: 'text-green-600' };
    if (percentage >= 60) return { label: 'Good', class: 'text-blue-600' };
    if (percentage >= 40) return { label: 'Moderate', class: 'text-yellow-600' };
    return { label: 'Low', class: 'text-red-600' };
  };

  const level = getConfidenceLevel();

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-muted-foreground',
        size === 'sm' ? 'text-xs' : 'text-sm',
        className
      )}
    >
      <span className={level.class}>{percentage}%</span>
      <span>confidence</span>
    </span>
  );
}

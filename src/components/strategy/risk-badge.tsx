'use client';

import { cn } from '@/lib/utils';

type RiskLevel = 'low' | 'moderate' | 'high';

const RISK_CONFIG: Record<RiskLevel, { label: string; className: string }> = {
  low: {
    label: 'Low Risk',
    className:
      'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
  },
  moderate: {
    label: 'Moderate Risk',
    className:
      'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
  },
  high: {
    label: 'High Risk',
    className:
      'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
  },
};

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
}

export function RiskBadge({ level, className }: RiskBadgeProps) {
  const config = RISK_CONFIG[level] ?? RISK_CONFIG.moderate;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}

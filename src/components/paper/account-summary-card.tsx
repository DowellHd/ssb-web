'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccountSummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'danger' | 'muted';
}

export function AccountSummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
}: AccountSummaryCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{title}</span>
        <Icon
          className={cn(
            'h-4 w-4',
            variant === 'success' && 'text-green-500',
            variant === 'danger' && 'text-red-500',
            variant === 'muted' && 'text-muted-foreground',
            variant === 'default' && 'text-primary'
          )}
        />
      </div>
      <div className="mt-2">
        <span
          className={cn(
            'text-2xl font-bold',
            variant === 'success' && 'text-green-500',
            variant === 'danger' && 'text-red-500'
          )}
        >
          {value}
        </span>
        {subtitle && (
          <span
            className={cn(
              'ml-2 text-sm',
              variant === 'success' && 'text-green-500',
              variant === 'danger' && 'text-red-500',
              variant === 'default' && 'text-muted-foreground',
              variant === 'muted' && 'text-muted-foreground'
            )}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}

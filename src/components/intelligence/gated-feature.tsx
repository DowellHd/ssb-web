'use client';

import { ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { useIntelligence, UserTier } from '@/contexts/intelligence-context';
import { cn } from '@/lib/utils';

interface GatedFeatureProps {
  children: ReactNode;
  requiredTier: UserTier;
  fallback?: ReactNode;
  className?: string;
  blurContent?: boolean;
}

/**
 * Wraps content that requires a specific tier level.
 * Shows upgrade CTA for users below the required tier.
 * Founder tier has access to everything.
 */
export function GatedFeature({
  children,
  requiredTier,
  fallback,
  className,
  blurContent = true,
}: GatedFeatureProps) {
  const { tier, isFounder } = useIntelligence();

  // Founder has access to everything
  if (isFounder) {
    return <>{children}</>;
  }

  // Tier order for comparison (founder handled above)
  const tierOrder: UserTier[] = ['free', 'pro', 'institutional', 'founder'];
  const userTierIndex = tierOrder.indexOf(tier);
  const requiredTierIndex = tierOrder.indexOf(requiredTier);

  const hasAccess = userTierIndex >= requiredTierIndex;

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className={cn('relative', className)}>
      {blurContent && (
        <div className="blur-sm pointer-events-none select-none">{children}</div>
      )}
      <div
        className={cn(
          'absolute inset-0 flex flex-col items-center justify-center',
          'bg-background/80 backdrop-blur-[2px] rounded-lg'
        )}
      >
        <div className="flex flex-col items-center gap-2 text-center p-4">
          <div className="p-3 rounded-full bg-muted">
            <Lock className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="font-medium text-sm">
            Upgrade to {requiredTier === 'pro' ? 'Pro' : 'Institutional'}
          </p>
          <p className="text-xs text-muted-foreground max-w-[200px]">
            {requiredTier === 'pro'
              ? 'Get real-time data and advanced analytics'
              : 'Access institutional-grade features'}
          </p>
          <button className="mt-2 px-4 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
}

interface TierBadgeProps {
  delayDays?: number;
  className?: string;
}

/**
 * Shows a badge indicating data delay for free tier users.
 */
export function DelayBadge({ delayDays = 7, className }: TierBadgeProps) {
  const { hasRealtimeData } = useIntelligence();

  if (hasRealtimeData) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full',
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500',
        className
      )}
    >
      {delayDays}-day delay
    </span>
  );
}

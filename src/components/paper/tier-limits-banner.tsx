'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TierLimits } from '@/lib/api/paper';

interface TierLimitsBannerProps {
  limits: TierLimits;
}

export function TierLimitsBanner({ limits }: TierLimitsBannerProps) {
  const isPositionsLow = limits.positions_remaining <= 1 && limits.positions_remaining < limits.max_positions;
  const isOrdersLow = limits.orders_remaining_today <= 2;
  const showWarning = isPositionsLow || isOrdersLow;

  if (limits.is_unlimited) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2">
            {showWarning && <AlertTriangle className="h-4 w-4 text-amber-500" />}
            <span className="font-medium">
              {limits.plan_name.charAt(0).toUpperCase() + limits.plan_name.slice(1)} Plan Limits
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {/* Positions */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Positions</span>
                <span>
                  {limits.current_positions} / {limits.max_positions}
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: `${Math.min(100, (limits.current_positions / limits.max_positions) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Orders Today */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Orders Today</span>
                <span>
                  {limits.orders_today} / {limits.orders_per_day}
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: `${Math.min(100, (limits.orders_today / limits.orders_per_day) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* History */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">History</span>
                <span>{limits.history_days} days</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary w-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade CTA */}
        <Link href="/app/billing">
          <Button variant="outline" size="sm" className="flex-shrink-0">
            Upgrade
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

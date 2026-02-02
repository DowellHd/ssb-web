'use client';

import Link from 'next/link';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OverlayType } from '@/lib/api/paper';
import { OVERLAY_CONFIGS, getAllOverlayTypes } from '@/lib/chart/overlays';

interface OverlayTogglesProps {
  enabledOverlays: OverlayType[];
  allowedOverlays: OverlayType[];
  onToggle: (overlay: OverlayType) => void;
  className?: string;
}

export function OverlayToggles({
  enabledOverlays,
  allowedOverlays,
  onToggle,
  className,
}: OverlayTogglesProps) {
  const allOverlays = getAllOverlayTypes();
  const hasLockedOverlays = allOverlays.some((o) => !allowedOverlays.includes(o));

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap gap-2">
        {allOverlays.map((overlay) => {
          const config = OVERLAY_CONFIGS[overlay];
          const isAllowed = allowedOverlays.includes(overlay);
          const isEnabled = enabledOverlays.includes(overlay);

          return (
            <button
              key={overlay}
              onClick={() => isAllowed && onToggle(overlay)}
              disabled={!isAllowed}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 text-xs rounded-md border transition-colors',
                isAllowed
                  ? isEnabled
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50 hover:bg-muted'
                  : 'border-border bg-muted/50 text-muted-foreground cursor-not-allowed'
              )}
              title={
                isAllowed
                  ? config.description
                  : `Upgrade to unlock ${config.label}`
              }
            >
              {!isAllowed && <Lock className="h-3 w-3" />}
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: isAllowed ? config.color : '#9ca3af' }}
              />
              <span>{config.label}</span>
            </button>
          );
        })}
      </div>
      {hasLockedOverlays && (
        <p className="text-[10px] text-muted-foreground">
          Some overlays require a higher plan.{' '}
          <Link href="/app/billing" className="text-primary hover:underline">
            View plans
          </Link>
        </p>
      )}
    </div>
  );
}

interface OverlayLegendProps {
  enabledOverlays: OverlayType[];
  className?: string;
}

export function OverlayLegend({ enabledOverlays, className }: OverlayLegendProps) {
  if (enabledOverlays.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-3 text-xs', className)}>
      {enabledOverlays.map((overlay) => {
        const config = OVERLAY_CONFIGS[overlay];
        return (
          <div key={overlay} className="flex items-center gap-1.5">
            <span
              className="w-3 h-0.5 rounded"
              style={{ backgroundColor: config.color }}
            />
            <span className="text-muted-foreground">{config.label}</span>
          </div>
        );
      })}
    </div>
  );
}

'use client';

import Link from 'next/link';
import { Lock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OverlayType } from '@/lib/api/paper';
import { OVERLAY_CONFIGS, getAllOverlayTypes } from '@/lib/chart/overlays';

// Minimum number of data points each overlay needs to render
const MIN_DATA_REQUIRED: Partial<Record<OverlayType, number>> = {
  sma20: 20,
  sma50: 50,
  sma200: 200,
  regression: 50,
};

interface OverlayTogglesProps {
  enabledOverlays: OverlayType[];
  allowedOverlays: OverlayType[];
  onToggle: (overlay: OverlayType) => void;
  dataLength?: number;
  className?: string;
}

export function OverlayToggles({
  enabledOverlays,
  allowedOverlays,
  onToggle,
  dataLength,
  className,
}: OverlayTogglesProps) {
  const allOverlays = getAllOverlayTypes();
  const hasLockedOverlays = allOverlays.some((o) => !allowedOverlays.includes(o));

  // Overlays that are toggled on but can't render due to insufficient data
  const insufficientOverlays = enabledOverlays.filter((o) => {
    const min = MIN_DATA_REQUIRED[o];
    return min !== undefined && dataLength !== undefined && dataLength < min;
  });

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap gap-2">
        {allOverlays.map((overlay) => {
          const config = OVERLAY_CONFIGS[overlay];
          const isAllowed = allowedOverlays.includes(overlay);
          const isEnabled = enabledOverlays.includes(overlay);
          const minRequired = MIN_DATA_REQUIRED[overlay];
          const hasInsufficientData =
            isEnabled &&
            minRequired !== undefined &&
            dataLength !== undefined &&
            dataLength < minRequired;

          return (
            <button
              key={overlay}
              onClick={() => isAllowed && onToggle(overlay)}
              disabled={!isAllowed}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-all',
                isAllowed
                  ? isEnabled
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-border text-muted-foreground hover:border-primary/60 hover:text-foreground hover:bg-muted'
                  : 'border-border bg-muted/50 text-muted-foreground cursor-not-allowed opacity-60'
              )}
              title={
                !isAllowed
                  ? `Upgrade to unlock ${config.label}`
                  : hasInsufficientData
                  ? `${config.label} needs ${minRequired} bars — select a longer range`
                  : config.description
              }
            >
              {!isAllowed && <Lock className="h-3 w-3 shrink-0" />}
              {hasInsufficientData && (
                <AlertTriangle className="h-3 w-3 shrink-0 text-amber-400" />
              )}
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{
                  backgroundColor: isAllowed
                    ? isEnabled
                      ? 'white'
                      : config.color
                    : '#9ca3af',
                }}
              />
              <span>{config.label}</span>
            </button>
          );
        })}
      </div>

      {/* Insufficient data warning */}
      {insufficientOverlays.length > 0 && (
        <p className="text-[10px] text-amber-500 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3 shrink-0" />
          {insufficientOverlays.map((o) => OVERLAY_CONFIGS[o].label).join(', ')}{' '}
          {insufficientOverlays.length === 1 ? 'needs' : 'need'} more data — select 1Y or 2Y.
        </p>
      )}

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

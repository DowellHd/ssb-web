'use client';

import { cn } from '@/lib/utils';
import { REGIME_CONFIG, type RegimeType } from '@/lib/chart/regime-context';

interface RegimeChartWrapperProps {
  regime: RegimeType | null;
  children: React.ReactNode;
  className?: string;
  /** Disable background tint (e.g., for minimal views) */
  disableTint?: boolean;
}

/**
 * Wrapper component that applies subtle regime-aware background tinting to charts.
 * The tint is very low opacity to avoid overpowering chart elements.
 */
export function RegimeChartWrapper({
  regime,
  children,
  className,
  disableTint = false,
}: RegimeChartWrapperProps) {
  const config = regime ? REGIME_CONFIG[regime] : null;

  return (
    <div
      className={cn(
        'relative rounded-lg overflow-hidden',
        className
      )}
      style={
        !disableTint && config
          ? { backgroundColor: config.bgTint }
          : undefined
      }
    >
      {/* Subtle gradient overlay for depth */}
      {!disableTint && regime && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(to bottom, transparent 0%, ${config?.bgTint || 'transparent'} 100%)`,
            opacity: 0.5,
          }}
          aria-hidden="true"
        />
      )}

      {/* Chart content */}
      <div className="relative">{children}</div>
    </div>
  );
}

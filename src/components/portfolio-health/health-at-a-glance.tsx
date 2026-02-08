'use client';

import { useState } from 'react';
import { ChevronRight, Activity, AlertTriangle, ShieldCheck, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PortfolioHealth, RiskLevel } from '@/lib/portfolio-health';

interface HealthAtAGlanceProps {
  health: PortfolioHealth | null;
  hasAccess: boolean;
  isScenarioAdjusted: boolean;
  onExpand?: () => void;
  className?: string;
}

/**
 * Risk level display configuration.
 */
const RISK_LEVEL_CONFIG: Record<
  RiskLevel,
  {
    label: string;
    icon: typeof Activity;
    bgClass: string;
    textClass: string;
    dotClass: string;
  }
> = {
  low: {
    label: 'Low',
    icon: ShieldCheck,
    bgClass: 'bg-green-50 dark:bg-green-950/30',
    textClass: 'text-green-700 dark:text-green-400',
    dotClass: 'bg-green-500',
  },
  moderate: {
    label: 'Moderate',
    icon: Activity,
    bgClass: 'bg-amber-50 dark:bg-amber-950/30',
    textClass: 'text-amber-700 dark:text-amber-400',
    dotClass: 'bg-amber-500',
  },
  elevated: {
    label: 'Elevated',
    icon: AlertTriangle,
    bgClass: 'bg-red-50 dark:bg-red-950/30',
    textClass: 'text-red-700 dark:text-red-400',
    dotClass: 'bg-red-500',
  },
};

/**
 * Compact "Portfolio Health at a Glance" widget for dashboards.
 *
 * Shows:
 * - Simple risk label (Low / Moderate / Elevated)
 * - Regime-aware context indicator
 * - Scenario mode indicator when active
 *
 * Pro+ only. Below Pro shows upgrade prompt.
 */
export function HealthAtAGlance({
  health,
  hasAccess,
  isScenarioAdjusted,
  onExpand,
  className,
}: HealthAtAGlanceProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Show upgrade prompt for users below Pro
  if (!hasAccess) {
    return (
      <div
        className={cn(
          'rounded-lg border bg-card p-4',
          'flex items-center justify-between',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <Lock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">Portfolio Health</p>
            <p className="text-xs text-muted-foreground">Available with Pro</p>
          </div>
        </div>
        <button className="px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
          Upgrade
        </button>
      </div>
    );
  }

  // No health data available
  if (!health) {
    return (
      <div
        className={cn(
          'rounded-lg border bg-card p-4',
          'flex items-center gap-3',
          className
        )}
      >
        <div className="p-2 rounded-lg bg-muted">
          <Activity className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">Portfolio Health</p>
          <p className="text-xs text-muted-foreground">Add positions to view health</p>
        </div>
      </div>
    );
  }

  const config = RISK_LEVEL_CONFIG[health.riskLevel];
  const Icon = config.icon;

  return (
    <button
      onClick={onExpand}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'w-full rounded-lg border bg-card p-4 text-left',
        'transition-all duration-200',
        'hover:border-primary/50 hover:shadow-sm',
        'focus:outline-none focus:ring-2 focus:ring-primary/20',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Icon with risk level color */}
          <div className={cn('p-2 rounded-lg', config.bgClass)}>
            <Icon className={cn('h-4 w-4', config.textClass)} />
          </div>

          <div className="space-y-0.5">
            {/* Title with risk badge */}
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Portfolio Health</p>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
                  config.bgClass,
                  config.textClass
                )}
              >
                <span className={cn('w-1.5 h-1.5 rounded-full', config.dotClass)} />
                {config.label} Risk
              </span>
            </div>

            {/* Summary line */}
            <p className="text-xs text-muted-foreground line-clamp-1">
              {health.sectorExposure.length > 0 && (
                <>
                  {health.sectorExposure[0].label}
                  {health.sectorExposure[0].weight > 0.3 &&
                    ` (${(health.sectorExposure[0].weight * 100).toFixed(0)}%)`}
                  {health.concentrationWarnings.length > 0 && ' • '}
                </>
              )}
              {health.concentrationWarnings.length > 0 && (
                <span className="text-amber-600 dark:text-amber-400">
                  {health.concentrationWarnings.length} warning
                  {health.concentrationWarnings.length > 1 ? 's' : ''}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Scenario indicator */}
          {isScenarioAdjusted && (
            <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
              Scenario
            </span>
          )}

          {/* Expand arrow */}
          <ChevronRight
            className={cn(
              'h-4 w-4 text-muted-foreground transition-transform',
              isHovered && 'translate-x-0.5'
            )}
          />
        </div>
      </div>
    </button>
  );
}

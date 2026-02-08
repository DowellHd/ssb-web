'use client';

import { useState } from 'react';
import {
  ChevronDown,
  Activity,
  PieChart,
  AlertTriangle,
  Link2,
  Info,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { REGIME_CONFIG } from '@/lib/chart/regime-context';
import type {
  PortfolioHealth,
  PortfolioHealthEntitlements,
  RiskLevel,
  SectorExposure,
  ConcentrationWarning,
  PositionCorrelation,
  RiskScoreBreakdown,
} from '@/lib/portfolio-health';

interface PortfolioHealthPanelProps {
  health: PortfolioHealth | null;
  entitlements: PortfolioHealthEntitlements;
  hasAccess: boolean;
  isScenarioAdjusted: boolean;
  className?: string;
}

// ============================================================================
// Risk Level Configuration
// ============================================================================

const RISK_LEVEL_CONFIG: Record<
  RiskLevel,
  {
    label: string;
    bgClass: string;
    textClass: string;
    barClass: string;
  }
> = {
  low: {
    label: 'Low Risk',
    bgClass: 'bg-green-50 dark:bg-green-950/30',
    textClass: 'text-green-700 dark:text-green-400',
    barClass: 'bg-green-500',
  },
  moderate: {
    label: 'Moderate Risk',
    bgClass: 'bg-amber-50 dark:bg-amber-950/30',
    textClass: 'text-amber-700 dark:text-amber-400',
    barClass: 'bg-amber-500',
  },
  elevated: {
    label: 'Elevated Risk',
    bgClass: 'bg-red-50 dark:bg-red-950/30',
    textClass: 'text-red-700 dark:text-red-400',
    barClass: 'bg-red-500',
  },
};

// ============================================================================
// Sub-components
// ============================================================================

function UpgradePrompt({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border bg-card', className)}>
      <div className="p-6 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Portfolio Health Insights</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
          Get sector exposure analysis, concentration warnings, and regime-weighted risk scores
          with a Pro subscription.
        </p>
        <button className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
          Upgrade to Pro
        </button>
      </div>
    </div>
  );
}

function EmptyState({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border bg-card p-6 text-center', className)}>
      <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
      <h3 className="text-sm font-medium mb-1">No Positions to Analyze</h3>
      <p className="text-xs text-muted-foreground">
        Add positions to your portfolio to see health insights.
      </p>
    </div>
  );
}

function RiskScoreCard({
  breakdown,
  level,
  showGranular,
}: {
  breakdown: RiskScoreBreakdown;
  level: RiskLevel;
  showGranular: boolean;
}) {
  const config = RISK_LEVEL_CONFIG[level];

  return (
    <div className="space-y-3">
      {/* Score header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className={cn('h-4 w-4', config.textClass)} />
          <span className="text-sm font-medium">Risk Score</span>
        </div>
        <div className={cn('px-2 py-0.5 rounded text-xs font-medium', config.bgClass, config.textClass)}>
          {config.label}
        </div>
      </div>

      {/* Score bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Overall Score</span>
          <span className="font-medium">{breakdown.score}/100</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all', config.barClass)}
            style={{ width: `${breakdown.score}%` }}
          />
        </div>
      </div>

      {/* Granular breakdown (Institutional+) */}
      {showGranular && (
        <div className="pt-2 space-y-2 border-t">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
            Score Breakdown
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Regime</span>
              <span className="font-medium">{breakdown.regimeContribution}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Volatility</span>
              <span className="font-medium">{breakdown.volatilityContribution}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Concentration</span>
              <span className="font-medium">{breakdown.concentrationContribution}</span>
            </div>
            {breakdown.correlationContribution !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Correlation</span>
                <span className="font-medium">{breakdown.correlationContribution}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SectorExposureSection({ sectors }: { sectors: SectorExposure[] }) {
  if (sectors.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <PieChart className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Sector Exposure</span>
      </div>

      <div className="space-y-2">
        {sectors.slice(0, 5).map((sector) => (
          <div key={sector.sector} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{sector.label}</span>
              <span className="font-medium">{(sector.weight * 100).toFixed(1)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary/70 transition-all"
                style={{ width: `${sector.weight * 100}%` }}
              />
            </div>
          </div>
        ))}
        {sectors.length > 5 && (
          <p className="text-[10px] text-muted-foreground">
            +{sectors.length - 5} more sector{sectors.length - 5 > 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
}

function ConcentrationWarningsSection({ warnings }: { warnings: ConcentrationWarning[] }) {
  if (warnings.length === 0) return null;

  const getLevelStyles = (level: ConcentrationWarning['level']) => {
    switch (level) {
      case 'elevated':
        return 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400';
      case 'caution':
        return 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400';
      default:
        return 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <span className="text-sm font-medium">Concentration Observations</span>
      </div>

      <div className="space-y-2">
        {warnings.slice(0, 4).map((warning, idx) => (
          <div
            key={idx}
            className={cn('p-2 rounded border text-xs', getLevelStyles(warning.level))}
          >
            <p className="font-medium">{warning.message}</p>
            {warning.details && (
              <p className="mt-0.5 opacity-80">{warning.details}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CorrelationSection({ correlations }: { correlations: PositionCorrelation[] }) {
  if (correlations.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Link2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Position Correlations</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
          Institutional
        </span>
      </div>

      <div className="space-y-2">
        {correlations.map((corr, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between text-xs p-2 rounded bg-muted/50"
          >
            <span className="font-medium">
              {corr.symbolA} ↔ {corr.symbolB}
            </span>
            <span
              className={cn(
                'px-1.5 py-0.5 rounded',
                corr.label === 'high_positive'
                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              )}
            >
              {corr.label === 'high_positive' ? 'High' : 'Moderate'} ({(corr.correlation * 100).toFixed(0)}%)
            </span>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground italic">
        High correlation between positions may amplify portfolio volatility.
      </p>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Full Portfolio Health Panel with all metrics.
 *
 * Shows:
 * - Regime-weighted risk score
 * - Sector exposure breakdown
 * - Concentration warnings
 * - Position correlations (Institutional+)
 *
 * All outputs are informational - no recommendations or advice.
 */
export function PortfolioHealthPanel({
  health,
  entitlements,
  hasAccess,
  isScenarioAdjusted,
  className,
}: PortfolioHealthPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Show upgrade prompt for users below Pro
  if (!hasAccess) {
    return <UpgradePrompt className={className} />;
  }

  // No health data available
  if (!health) {
    return <EmptyState className={className} />;
  }

  const regimeConfig = REGIME_CONFIG[health.regime];

  return (
    <div className={cn('rounded-lg border bg-card', className)}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 border-b hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <ChevronDown
            className={cn(
              'h-4 w-4 text-muted-foreground transition-transform',
              !isExpanded && '-rotate-90'
            )}
          />
          <Activity className="h-5 w-5 text-muted-foreground" />
          <span className="font-semibold">Portfolio Health</span>

          {/* Regime badge */}
          <span
            className={cn(
              'px-2 py-0.5 rounded text-xs font-medium border',
              regimeConfig.bgClass,
              regimeConfig.textClass,
              regimeConfig.borderClass
            )}
          >
            {regimeConfig.shortLabel}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Scenario indicator */}
          {isScenarioAdjusted && (
            <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
              Scenario Mode
            </span>
          )}

          {/* Risk level badge */}
          <span
            className={cn(
              'px-2 py-0.5 rounded text-xs font-medium',
              RISK_LEVEL_CONFIG[health.riskLevel].bgClass,
              RISK_LEVEL_CONFIG[health.riskLevel].textClass
            )}
          >
            {RISK_LEVEL_CONFIG[health.riskLevel].label}
          </span>
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-5">
          {/* Scenario notice */}
          {isScenarioAdjusted && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
              <Info className="h-4 w-4 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-purple-700 dark:text-purple-300">
                Portfolio Health metrics reflect the current scenario assumptions.
              </p>
            </div>
          )}

          {/* Risk Score */}
          {entitlements.riskScoreEnabled && health.riskBreakdown && (
            <RiskScoreCard
              breakdown={health.riskBreakdown}
              level={health.riskLevel}
              showGranular={entitlements.granularRiskBreakdown}
            />
          )}

          {/* Divider */}
          <div className="border-t" />

          {/* Sector Exposure */}
          {entitlements.sectorExposureEnabled && (
            <SectorExposureSection sectors={health.sectorExposure} />
          )}

          {/* Regime-sensitive exposure note */}
          {health.regimeSensitiveExposure > 0.3 && (
            <div className="flex items-start gap-2 p-2 rounded bg-muted/50 text-xs">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
              <span className="text-muted-foreground">
                {(health.regimeSensitiveExposure * 100).toFixed(0)}% of portfolio exposed to{' '}
                <span className={regimeConfig.textClass}>{regimeConfig.shortLabel}</span>
                -sensitive sectors.
              </span>
            </div>
          )}

          {/* Divider */}
          {entitlements.concentrationWarningsEnabled && health.concentrationWarnings.length > 0 && (
            <div className="border-t" />
          )}

          {/* Concentration Warnings */}
          {entitlements.concentrationWarningsEnabled && (
            <ConcentrationWarningsSection warnings={health.concentrationWarnings} />
          )}

          {/* Divider */}
          {entitlements.correlationAnalysisEnabled && health.correlations && health.correlations.length > 0 && (
            <div className="border-t" />
          )}

          {/* Correlations (Institutional+) */}
          {entitlements.correlationAnalysisEnabled && health.correlations && (
            <CorrelationSection correlations={health.correlations} />
          )}

          {/* Disclaimer */}
          <div className="pt-2 border-t">
            <p className="text-[10px] text-muted-foreground text-center italic">
              Portfolio health metrics are informational only. This is not financial advice.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

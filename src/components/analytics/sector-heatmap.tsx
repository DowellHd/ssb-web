'use client';

import { cn } from '@/lib/utils';

export interface SectorCell {
  name: string;
  returnPct: number;    // Performance % (positive or negative)
  weight?: number;      // Optional portfolio weight (0–1)
}

interface SectorHeatmapProps {
  sectors: SectorCell[];
  title?: string;
  className?: string;
}

/**
 * Sector performance heatmap.
 * Colors cells on a red→green scale based on return magnitude.
 */
export function SectorHeatmap({ sectors, title, className }: SectorHeatmapProps) {
  if (sectors.length === 0) return null;

  const maxAbs = Math.max(...sectors.map((s) => Math.abs(s.returnPct)), 0.01);

  return (
    <div className={cn('space-y-3', className)}>
      {title && <p className="text-sm font-semibold">{title}</p>}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {sectors
          .slice()
          .sort((a, b) => b.returnPct - a.returnPct)
          .map((sector) => (
            <HeatCell key={sector.name} sector={sector} maxAbs={maxAbs} />
          ))}
      </div>

      <ColorScaleLegend />
    </div>
  );
}

function HeatCell({
  sector,
  maxAbs,
}: {
  sector: SectorCell;
  maxAbs: number;
}) {
  const normalized = sector.returnPct / maxAbs; // -1 to +1
  const opacity = Math.abs(normalized);

  const bgClass =
    sector.returnPct >= 0
      ? 'bg-emerald-500'
      : 'bg-red-500';

  const textClass =
    opacity > 0.5
      ? 'text-white'
      : sector.returnPct >= 0
      ? 'text-emerald-800 dark:text-emerald-300'
      : 'text-red-800 dark:text-red-300';

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center rounded-lg p-3 transition-all',
        bgClass,
      )}
      style={{ opacity: 0.3 + opacity * 0.7 }}
      title={
        sector.weight !== undefined
          ? `Weight: ${(sector.weight * 100).toFixed(1)}%`
          : undefined
      }
    >
      <p className={cn('text-center text-xs font-medium leading-tight', textClass)}>
        {sector.name}
      </p>
      <p className={cn('mt-1 text-sm font-bold tabular-nums', textClass)}>
        {sector.returnPct > 0 ? '+' : ''}
        {sector.returnPct.toFixed(2)}%
      </p>
      {sector.weight !== undefined && (
        <p className={cn('text-[10px] opacity-80', textClass)}>
          {(sector.weight * 100).toFixed(0)}% wt
        </p>
      )}
    </div>
  );
}

function ColorScaleLegend() {
  return (
    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
      <div className="h-2 w-16 rounded bg-gradient-to-r from-red-500 to-emerald-500" />
      <span>Bearish → Bullish</span>
    </div>
  );
}

// ============================================================================
// Sector heatmap with predefined S&P 500 sectors for demo
// ============================================================================

export const SP500_SECTORS = [
  'Information Technology',
  'Health Care',
  'Financials',
  'Consumer Discretionary',
  'Communication Services',
  'Industrials',
  'Consumer Staples',
  'Energy',
  'Utilities',
  'Real Estate',
  'Materials',
] as const;

/**
 * Generates demo sector returns for display when real data isn't available.
 * Returns are seeded from a deterministic pseudo-random sequence.
 */
export function getDemoSectorData(): SectorCell[] {
  // Deterministic values representative of a typical trading week
  const returns = [1.8, -0.6, 0.9, 2.3, 0.4, -1.1, 0.2, -2.4, -0.8, 0.7, -0.3];
  return SP500_SECTORS.map((name, i) => ({
    name,
    returnPct: returns[i] ?? 0,
  }));
}

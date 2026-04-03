'use client';

import { cn } from '@/lib/utils';
import type { ESGReportResponse } from '@/lib/api/predictive';

const RATING_COLORS: Record<string, string> = {
  AAA: 'text-emerald-600 dark:text-emerald-400',
  AA:  'text-green-600 dark:text-green-400',
  A:   'text-lime-600 dark:text-lime-400',
  BBB: 'text-yellow-600 dark:text-yellow-400',
  BB:  'text-amber-600 dark:text-amber-400',
  B:   'text-orange-600 dark:text-orange-400',
  CCC: 'text-red-600 dark:text-red-400',
};

const PILLAR_COLORS = {
  E: { bar: 'bg-emerald-500', label: 'Environmental' },
  S: { bar: 'bg-blue-500',    label: 'Social' },
  G: { bar: 'bg-violet-500',  label: 'Governance' },
};

const CONTROVERSY_SEVERITY: Record<string, string> = {
  low:    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  high:   'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

interface ESGScoresProps {
  result: ESGReportResponse;
  className?: string;
}

export function ESGScores({ result, className }: ESGScoresProps) {
  const { scores, controversies, strengths, improvement_areas } = result;
  const ratingColor = RATING_COLORS[scores.rating] ?? 'text-foreground';

  const pillars: Array<{ key: 'E' | 'S' | 'G'; value: number }> = [
    { key: 'E', value: scores.environmental },
    { key: 'S', value: scores.social },
    { key: 'G', value: scores.governance },
  ];

  return (
    <div className={cn('space-y-5', className)}>
      {/* Header row */}
      <div className="flex items-start gap-4">
        <div className="text-center">
          <p className={cn('text-4xl font-bold tabular-nums', ratingColor)}>
            {scores.rating}
          </p>
          <p className="text-xs text-muted-foreground">ESG Rating</p>
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-xl font-semibold tabular-nums">
              {scores.composite.toFixed(1)}
            </p>
            <p className="text-sm text-muted-foreground">/ 100 composite</p>
          </div>
          <p className="text-xs text-muted-foreground">
            ~{scores.percentile.toFixed(0)}th sector percentile &middot; {result.sector.replace(/_/g, ' ')}
          </p>
          {result.is_simulated && (
            <span className="inline-block rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
              Simulated data &mdash; educational only
            </span>
          )}
        </div>
      </div>

      {/* Pillar bars */}
      <div className="space-y-3">
        {pillars.map(({ key, value }) => {
          const cfg = PILLAR_COLORS[key];
          return (
            <div key={key}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium">{cfg.label}</span>
                <span className="tabular-nums text-muted-foreground">
                  {value.toFixed(1)} / 100
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn('h-full rounded-full transition-all', cfg.bar)}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Controversies */}
      {controversies.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold text-muted-foreground">
            Controversy Flags
          </p>
          <div className="space-y-2">
            {controversies.map((c, i) => (
              <div key={i} className="flex items-start gap-2 rounded-md border bg-card px-3 py-2">
                <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase', CONTROVERSY_SEVERITY[c.severity])}>
                  {c.severity}
                </span>
                <div>
                  <p className="text-xs font-medium capitalize">{c.category}</p>
                  <p className="text-[11px] text-muted-foreground">{c.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths */}
      {strengths.length > 0 && !(strengths.length === 1 && strengths[0].startsWith('No exceptional')) && (
        <div>
          <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Strengths</p>
          <ul className="space-y-1">
            {strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs">
                <span className="mt-0.5 text-emerald-500">&#10003;</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvement areas */}
      {improvement_areas.length > 0 && !(improvement_areas.length === 1 && improvement_areas[0].startsWith('No significant')) && (
        <div>
          <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Areas to Watch</p>
          <ul className="space-y-1">
            {improvement_areas.map((a, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <span className="mt-0.5 text-amber-500">&#9679;</span>
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-muted-foreground">{result.explanation.summary}</p>
    </div>
  );
}

'use client';

import { cn } from '@/lib/utils';
import type { SentimentResponse } from '@/lib/api/predictive';

const LABEL_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  bullish: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', label: 'Bullish' },
  bearish: { bg: 'bg-red-100 dark:bg-red-900/30',         text: 'text-red-700 dark:text-red-400',         label: 'Bearish' },
  neutral: { bg: 'bg-muted',                               text: 'text-muted-foreground',                  label: 'Neutral' },
  mixed:   { bg: 'bg-amber-100 dark:bg-amber-900/30',     text: 'text-amber-700 dark:text-amber-400',     label: 'Mixed' },
};

interface SentimentViewProps {
  result: SentimentResponse;
  className?: string;
}

export function SentimentView({ result, className }: SentimentViewProps) {
  const style = LABEL_STYLES[result.aggregate_label] ?? LABEL_STYLES.neutral;

  // Score bar: -1 → 0 → +1 mapped to 0% → 50% → 100%
  const barPct = ((result.aggregate_score + 1) / 2) * 100;
  const barColor = result.aggregate_score > 0.1 ? 'bg-emerald-500' : result.aggregate_score < -0.1 ? 'bg-red-500' : 'bg-muted-foreground';

  return (
    <div className={cn('space-y-4', className)}>
      {/* Label and score */}
      <div className="flex items-center gap-3">
        <span className={cn('rounded-full px-3 py-1 text-sm font-semibold', style.bg, style.text)}>
          {style.label}
        </span>
        <span className="tabular-nums text-muted-foreground text-sm">
          Score: {result.aggregate_score > 0 ? '+' : ''}{result.aggregate_score.toFixed(3)}
        </span>
        <span className="text-xs text-muted-foreground ml-auto">
          Confidence: {(result.confidence * 100).toFixed(0)}%
        </span>
      </div>

      {/* Score bar */}
      <div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
          {/* Center divider */}
          <div className="absolute left-1/2 top-0 h-full w-px bg-border" />
          {/* Score indicator */}
          <div
            className={cn('absolute h-full w-1.5 -translate-x-1/2 rounded-full', barColor)}
            style={{ left: `${barPct}%` }}
          />
        </div>
        <div className="mt-0.5 flex justify-between text-[10px] text-muted-foreground">
          <span>Bearish</span>
          <span>Neutral</span>
          <span>Bullish</span>
        </div>
      </div>

      {/* Themes / risks / catalysts */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <TagList label="Themes" tags={result.dominant_themes} color="bg-muted text-muted-foreground" />
        <TagList label="Risk Factors" tags={result.top_risks} color="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" />
        <TagList label="Catalysts" tags={result.top_catalysts} color="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" />
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span>{result.source_count} source(s) analyzed</span>
        <span>&middot;</span>
        <span>{result.ai_available ? 'AI-powered (GPT-4o-mini)' : 'Lexicon fallback'}</span>
        <span>&middot;</span>
        <span>Subject: {result.subject}</span>
      </div>

      <p className="text-xs text-muted-foreground">{result.explanation.summary}</p>
    </div>
  );
}

function TagList({
  label,
  tags,
  color,
}: {
  label: string;
  tags: string[];
  color: string;
}) {
  if (tags.length === 0) return null;
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-1">
        {tags.map((t, i) => (
          <span
            key={i}
            className={cn('rounded px-2 py-0.5 text-[11px] font-medium', color)}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

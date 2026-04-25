'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { RiskBadge } from './risk-badge';
import type { StrategyHistoryItem } from '@/lib/api/strategy';

interface HistoryPanelProps {
  items: StrategyHistoryItem[];
  total: number;
  onLoadMore?: () => void;
  loadingMore?: boolean;
}

function HistoryRow({ item }: { item: StrategyHistoryItem }) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(item.requested_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const time = new Date(item.requested_at).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={() => setExpanded((p) => !p)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-accent/30 transition-colors"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {date} <span className="text-muted-foreground font-normal">{time}</span>
            </span>
            {item.key_themes.length > 0 && (
              <span className="text-xs text-muted-foreground truncate max-w-xs">
                {item.key_themes[0]}
                {item.key_themes.length > 1 && ` +${item.key_themes.length - 1} more`}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <RiskBadge level={item.risk_level} />
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {item.key_themes.map((t) => (
              <span
                key={t}
                className="rounded-full border bg-muted/40 px-2.5 py-0.5 text-xs text-foreground"
              >
                {t}
              </span>
            ))}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{item.analysis_text}</p>
          {item.portfolio_snapshot && (
            <p className="text-xs text-muted-foreground">
              Portfolio: {item.portfolio_snapshot.holdings_count} holdings
              {' · '}${item.portfolio_snapshot.total_value.toLocaleString()} total value
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function HistoryPanel({ items, total, onLoadMore, loadingMore }: HistoryPanelProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <Clock className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No analysis history yet.</p>
        <p className="text-xs text-muted-foreground mt-1">
          Run your first analysis to see results here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="text-sm font-semibold">Analysis History</h3>
        <span className="text-xs text-muted-foreground">{total} total</span>
      </div>
      {items.map((item) => (
        <HistoryRow key={item.id} item={item} />
      ))}
      {items.length < total && onLoadMore && (
        <div className="px-4 py-3 border-t text-center">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="text-xs text-primary hover:underline disabled:opacity-50"
          >
            {loadingMore ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
}

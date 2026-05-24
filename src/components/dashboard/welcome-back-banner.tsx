'use client';

import { useEffect, useState } from 'react';
import { TrendingDown, TrendingUp, Minus, Sparkles, X, BarChart2, Newspaper } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RegimeResult } from '@/lib/api/intelligence';
import type { MarketSummaryResponse } from '@/lib/api/news';
import type { PortfolioSummary } from '@/lib/api/portfolio';

const LAST_VISIT_KEY = 'ssb_last_visit_date';
const SESSION_DISMISSED_KEY = 'ssb_wb_dismissed';

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

// ── Regime helpers ────────────────────────────────────────────────────────────

const REGIME_LABELS: Record<string, string> = {
  bull: 'Bull Market',
  bear: 'Bear Market',
  neutral: 'Neutral',
  risk_off: 'Risk-Off',
};

const REGIME_COLORS: Record<string, string> = {
  bull: 'text-green-600 dark:text-green-400',
  bear: 'text-red-500 dark:text-red-400',
  neutral: 'text-muted-foreground',
  risk_off: 'text-amber-600 dark:text-amber-400',
};

const REGIME_BG: Record<string, string> = {
  bull: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800',
  bear: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
  neutral: 'bg-muted/40 border-border',
  risk_off: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
};

// ── Chip component ────────────────────────────────────────────────────────────

function Chip({
  icon,
  label,
  value,
  colorClass,
  bgClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  colorClass?: string;
  bgClass?: string;
}) {
  return (
    <div className={cn(
      'flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs shrink-0',
      bgClass ?? 'bg-muted/40 border-border'
    )}>
      <span className={cn('shrink-0', colorClass)}>{icon}</span>
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('font-semibold', colorClass)}>{value}</span>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface WelcomeBackBannerProps {
  userName?: string | null;
  regime?: RegimeResult | null;
  marketSummary?: MarketSummaryResponse | null;
  portfolioSummary?: PortfolioSummary | null;
}

export function WelcomeBackBanner({
  userName,
  regime,
  marketSummary,
  portfolioSummary,
}: WelcomeBackBannerProps) {
  const [show, setShow] = useState(false);
  const [lastVisit, setLastVisit] = useState<string | null>(null);

  useEffect(() => {
    const today = getTodayStr();
    const dismissed = sessionStorage.getItem(SESSION_DISMISSED_KEY) === today;
    if (dismissed) return;

    const stored = localStorage.getItem(LAST_VISIT_KEY);
    if (stored && stored !== today) {
      setLastVisit(stored);
      setShow(true);
    }
    localStorage.setItem(LAST_VISIT_KEY, today);
  }, []);

  function dismiss() {
    sessionStorage.setItem(SESSION_DISMISSED_KEY, getTodayStr());
    setShow(false);
  }

  if (!show || !lastVisit) return null;

  const displayName = userName?.split(' ')[0] ?? null;
  const visitDate = new Date(lastVisit + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - visitDate.getTime()) / 86400000);
  const sinceLabel =
    diffDays === 1 ? 'yesterday' :
    diffDays <= 7 ? `${diffDays} days ago` :
    visitDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  // ── Build chips from available data ─────────────────────────────────────────

  const chips: React.ReactNode[] = [];

  if (regime) {
    const key = regime.regime.toLowerCase();
    const label = REGIME_LABELS[key] ?? regime.regime;
    const color = REGIME_COLORS[key] ?? 'text-muted-foreground';
    const bg = REGIME_BG[key] ?? 'bg-muted/40 border-border';
    const confPct = Math.round(regime.confidence * 100);

    const regimeIcon =
      key === 'bull' ? <TrendingUp className="h-3.5 w-3.5" /> :
      key === 'bear' ? <TrendingDown className="h-3.5 w-3.5" /> :
      <BarChart2 className="h-3.5 w-3.5" />;

    chips.push(
      <Chip
        key="regime"
        icon={regimeIcon}
        label="Regime:"
        value={`${label} · ${confPct}%`}
        colorClass={color}
        bgClass={bg}
      />
    );
  }

  if (marketSummary) {
    const s = marketSummary.summary.sentiment_overview;
    const sentimentColor =
      s === 'bullish' ? 'text-green-600 dark:text-green-400' :
      s === 'bearish' ? 'text-red-500 dark:text-red-400' :
      'text-muted-foreground';
    const sentimentBg =
      s === 'bullish' ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800' :
      s === 'bearish' ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800' :
      'bg-muted/40 border-border';
    const sentimentIcon =
      s === 'bullish' ? <TrendingUp className="h-3.5 w-3.5" /> :
      s === 'bearish' ? <TrendingDown className="h-3.5 w-3.5" /> :
      <Minus className="h-3.5 w-3.5" />;

    chips.push(
      <Chip
        key="sentiment"
        icon={sentimentIcon}
        label="Sentiment:"
        value={s.charAt(0).toUpperCase() + s.slice(1)}
        colorClass={sentimentColor}
        bgClass={sentimentBg}
      />
    );
  }

  if (portfolioSummary && portfolioSummary.holding_count > 0) {
    const pct = portfolioSummary.unrealized_pl_pct;
    const sign = pct >= 0 ? '+' : '';
    const isUp = pct >= 0;
    const pfColor = isUp ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400';
    const pfBg = isUp
      ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
      : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800';

    chips.push(
      <Chip
        key="portfolio"
        icon={isUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
        label="Portfolio:"
        value={`${sign}${pct.toFixed(2)}%`}
        colorClass={pfColor}
        bgClass={pfBg}
      />
    );
  }

  // Show market headline only if we have no other chips (fallback context)
  if (chips.length === 0 && marketSummary?.summary.headline) {
    chips.push(
      <Chip
        key="headline"
        icon={<Newspaper className="h-3.5 w-3.5" />}
        label=""
        value={marketSummary.summary.headline.length > 60
          ? marketSummary.summary.headline.slice(0, 57) + '…'
          : marketSummary.summary.headline}
      />
    );
  }

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10 px-4 py-3 mb-2">
      {/* Top row: greeting + dismiss */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <p className="text-sm">
            <span className="font-semibold">
              Welcome back{displayName ? `, ${displayName}` : ''}!
            </span>{' '}
            <span className="text-muted-foreground">Away since {sinceLabel}.</span>
          </p>
        </div>
        <button
          onClick={dismiss}
          className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Data chips row */}
      {chips.length > 0 && (
        <div className="mt-2.5 flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-hidden">
          {chips}
        </div>
      )}
    </div>
  );
}

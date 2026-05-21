'use client';

import { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Data — simulated upcoming / recent earnings events
// ============================================================================

type BeforeAfterMarket = 'BMO' | 'AMC' | 'TBD';
type Surprise = 'beat' | 'miss' | 'inline' | null;

interface EarningsEvent {
  symbol: string;
  company: string;
  date: string; // YYYY-MM-DD relative to 2026-05-20
  time: BeforeAfterMarket;
  epsEstimate: number | null;
  epsActual: number | null;
  revenueEstimateBn: number | null;
  revenueActualBn: number | null;
  surprise: Surprise;
}

// Dates relative to 2026-05-20 (today)
const EARNINGS_DATA: EarningsEvent[] = [
  // Past (last 7 days)
  { symbol: 'NVDA', company: 'NVIDIA Corp',           date: '2026-05-19', time: 'AMC', epsEstimate: 5.88, epsActual: 6.14, revenueEstimateBn: 43.1, revenueActualBn: 44.1, surprise: 'beat' },
  { symbol: 'LOW',  company: "Lowe's Companies",      date: '2026-05-19', time: 'BMO', epsEstimate: 3.01, epsActual: 2.87, revenueEstimateBn: 21.1, revenueActualBn: 20.7, surprise: 'miss' },
  { symbol: 'BABA', company: 'Alibaba Group',         date: '2026-05-18', time: 'BMO', epsEstimate: 1.27, epsActual: 1.27, revenueEstimateBn: 31.4, revenueActualBn: 31.8, surprise: 'inline' },
  { symbol: 'CSCO', company: 'Cisco Systems',         date: '2026-05-14', time: 'AMC', epsEstimate: 0.92, epsActual: 0.96, revenueEstimateBn: 14.0, revenueActualBn: 14.1, surprise: 'beat' },
  { symbol: 'DE',   company: 'Deere & Company',       date: '2026-05-16', time: 'BMO', epsEstimate: 6.11, epsActual: 5.77, revenueEstimateBn: 14.3, revenueActualBn: 13.7, surprise: 'miss' },
  // Upcoming (next 14 days)
  { symbol: 'TGT',  company: 'Target Corp',           date: '2026-05-21', time: 'BMO', epsEstimate: 1.68, epsActual: null, revenueEstimateBn: 24.5, revenueActualBn: null, surprise: null },
  { symbol: 'ADI',  company: 'Analog Devices',        date: '2026-05-21', time: 'BMO', epsEstimate: 1.73, epsActual: null, revenueEstimateBn: 2.7,  revenueActualBn: null, surprise: null },
  { symbol: 'INTU', company: 'Intuit Inc',            date: '2026-05-22', time: 'AMC', epsEstimate: 9.52, epsActual: null, revenueEstimateBn: 6.6,  revenueActualBn: null, surprise: null },
  { symbol: 'SNOW', company: 'Snowflake Inc',         date: '2026-05-22', time: 'AMC', epsEstimate: 0.22, epsActual: null, revenueEstimateBn: 0.9,  revenueActualBn: null, surprise: null },
  { symbol: 'MRVL', company: 'Marvell Technology',    date: '2026-05-29', time: 'AMC', epsEstimate: 0.60, epsActual: null, revenueEstimateBn: 1.8,  revenueActualBn: null, surprise: null },
  { symbol: 'CRM',  company: 'Salesforce Inc',        date: '2026-05-28', time: 'AMC', epsEstimate: 2.60, epsActual: null, revenueEstimateBn: 9.8,  revenueActualBn: null, surprise: null },
  { symbol: 'COST', company: 'Costco Wholesale',      date: '2026-06-01', time: 'AMC', epsEstimate: 3.85, epsActual: null, revenueEstimateBn: 63.1, revenueActualBn: null, surprise: null },
  { symbol: 'LULU', company: 'Lululemon Athletica',   date: '2026-06-02', time: 'AMC', epsEstimate: 2.58, epsActual: null, revenueEstimateBn: 2.2,  revenueActualBn: null, surprise: null },
  { symbol: 'DOCU', company: 'DocuSign Inc',          date: '2026-06-02', time: 'AMC', epsEstimate: 0.98, epsActual: null, revenueEstimateBn: 0.8,  revenueActualBn: null, surprise: null },
];

// ============================================================================
// Helpers
// ============================================================================

const TODAY = '2026-05-20';

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const today = new Date(TODAY);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function surpriseBadge(surprise: Surprise) {
  if (!surprise) return null;
  const cfg = {
    beat:   { label: 'Beat',   cls: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
    miss:   { label: 'Miss',   cls: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
    inline: { label: 'In-line', cls: 'bg-muted text-muted-foreground' },
  }[surprise];
  return <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded', cfg.cls)}>{cfg.label}</span>;
}

function surpriseIcon(surprise: Surprise) {
  if (surprise === 'beat') return <TrendingUp className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />;
  if (surprise === 'miss') return <TrendingDown className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />;
  return null;
}

// ============================================================================
// Row
// ============================================================================

function EarningsRow({ event }: { event: EarningsEvent }) {
  const days = daysUntil(event.date);
  const isPast = days < 0;
  const isToday = days === 0;
  const isSoon = days > 0 && days <= 3;

  const epsSurprisePct =
    event.epsActual !== null && event.epsEstimate !== null && event.epsEstimate !== 0
      ? ((event.epsActual - event.epsEstimate) / Math.abs(event.epsEstimate)) * 100
      : null;

  return (
    <tr className={cn(
      'border-b last:border-0 text-sm transition-colors hover:bg-muted/30',
      isToday && 'bg-primary/5',
    )}>
      {/* Symbol + Company */}
      <td className="px-4 py-3">
        <div className="font-semibold">{event.symbol}</div>
        <div className="text-xs text-muted-foreground truncate max-w-[180px]">{event.company}</div>
      </td>

      {/* Date + time */}
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span>{formatDate(event.date)}</span>
          {isToday && <span className="text-[10px] font-semibold text-primary px-1.5 py-0.5 rounded bg-primary/10">TODAY</span>}
          {isSoon && <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30">SOON</span>}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
          <Clock className="h-3 w-3" />
          {event.time === 'BMO' ? 'Before market open' : event.time === 'AMC' ? 'After market close' : 'Time TBD'}
        </div>
      </td>

      {/* EPS */}
      <td className="px-4 py-3 text-right tabular-nums">
        <div className="text-xs text-muted-foreground">Est.</div>
        <div>{event.epsEstimate !== null ? `$${event.epsEstimate.toFixed(2)}` : '—'}</div>
        {event.epsActual !== null && (
          <div className={cn(
            'text-xs font-medium flex items-center justify-end gap-1',
            (event.epsActual ?? 0) >= (event.epsEstimate ?? 0) ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
          )}>
            {surpriseIcon(event.surprise)}
            ${event.epsActual.toFixed(2)}
            {epsSurprisePct !== null && (
              <span className="text-[10px]">({epsSurprisePct > 0 ? '+' : ''}{epsSurprisePct.toFixed(1)}%)</span>
            )}
          </div>
        )}
        {isPast && event.epsActual === null && <div className="text-xs text-muted-foreground">N/A</div>}
      </td>

      {/* Revenue */}
      <td className="px-4 py-3 text-right tabular-nums hidden sm:table-cell">
        <div className="text-xs text-muted-foreground">Est.</div>
        <div>{event.revenueEstimateBn !== null ? `$${event.revenueEstimateBn.toFixed(1)}B` : '—'}</div>
        {event.revenueActualBn !== null && (
          <div className={cn(
            'text-xs font-medium',
            event.revenueActualBn >= (event.revenueEstimateBn ?? 0) ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
          )}>
            ${event.revenueActualBn.toFixed(1)}B
          </div>
        )}
        {isPast && event.revenueActualBn === null && <div className="text-xs text-muted-foreground">N/A</div>}
      </td>

      {/* Surprise */}
      <td className="px-4 py-3 text-center hidden md:table-cell">
        {event.surprise ? surpriseBadge(event.surprise) : <span className="text-muted-foreground text-xs">—</span>}
      </td>
    </tr>
  );
}

// ============================================================================
// Page
// ============================================================================

type SortKey = 'date' | 'symbol' | 'surprise';

export default function EarningsCalendarPage() {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = useMemo(() => {
    return EARNINGS_DATA.filter((e) => {
      const days = daysUntil(e.date);
      if (filter === 'upcoming') return days >= 0;
      if (filter === 'past') return days < 0;
      return true;
    });
  }, [filter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'date') cmp = a.date.localeCompare(b.date);
      else if (sortKey === 'symbol') cmp = a.symbol.localeCompare(b.symbol);
      else if (sortKey === 'surprise') cmp = (a.surprise ?? '').localeCompare(b.surprise ?? '');
      return sortAsc ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortAsc]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((v) => !v);
    else { setSortKey(key); setSortAsc(true); }
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return null;
    return sortAsc ? <ChevronUp className="h-3 w-3 inline ml-0.5" /> : <ChevronDown className="h-3 w-3 inline ml-0.5" />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Earnings Calendar</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upcoming and recent earnings for major symbols.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 px-4 py-3 text-sm">
        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
        <p className="text-amber-800 dark:text-amber-300">
          <strong>Simulated data.</strong> Earnings dates and estimates are illustrative only and not sourced from live financial data feeds.
          Verify dates with official investor relations pages before trading.
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'upcoming', 'past'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize',
              filter === f
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground',
            )}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">{sorted.length} events</span>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b text-xs text-muted-foreground">
              <th className="px-4 py-3 text-left">
                <button onClick={() => toggleSort('symbol')} className="hover:text-foreground transition-colors">
                  Company <SortIcon k="symbol" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button onClick={() => toggleSort('date')} className="hover:text-foreground transition-colors">
                  Date <SortIcon k="date" />
                </button>
              </th>
              <th className="px-4 py-3 text-right">EPS</th>
              <th className="px-4 py-3 text-right hidden sm:table-cell">Revenue</th>
              <th className="px-4 py-3 text-center hidden md:table-cell">
                <button onClick={() => toggleSort('surprise')} className="hover:text-foreground transition-colors">
                  Surprise <SortIcon k="surprise" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((e) => <EarningsRow key={`${e.symbol}-${e.date}`} event={e} />)}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No earnings events for the selected filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

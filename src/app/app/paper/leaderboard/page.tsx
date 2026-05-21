'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  Crown,
  Loader2,
  Medal,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { getLeaderboard, type LeaderboardEntry } from '@/lib/api/paper';
import { cn } from '@/lib/utils';

// ============================================================================
// Rank medal
// ============================================================================

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="h-4 w-4 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-4 w-4 text-slate-400" />;
  if (rank === 3) return <Medal className="h-4 w-4 text-amber-600" />;
  return <span className="text-sm font-mono text-muted-foreground w-4 text-center">{rank}</span>;
}

// ============================================================================
// Row
// ============================================================================

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  const positive = entry.gain_loss >= 0;

  return (
    <tr
      className={cn(
        'border-b last:border-0 text-sm transition-colors',
        entry.is_you
          ? 'bg-primary/5 hover:bg-primary/10'
          : 'hover:bg-muted/30',
      )}
    >
      {/* Rank */}
      <td className="px-4 py-3 text-center w-10">
        <div className="flex justify-center">
          <RankBadge rank={entry.rank} />
        </div>
      </td>

      {/* Handle */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-medium font-mono">{entry.handle}</span>
          {entry.is_you && (
            <span className="text-[10px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded">
              You
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground">{entry.account_name}</div>
      </td>

      {/* Return % */}
      <td className="px-4 py-3 text-right tabular-nums">
        <div className={cn(
          'flex items-center justify-end gap-1 font-semibold',
          positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
        )}>
          {positive
            ? <TrendingUp className="h-3.5 w-3.5" />
            : <TrendingDown className="h-3.5 w-3.5" />}
          {positive ? '+' : ''}{entry.return_pct.toFixed(2)}%
        </div>
      </td>

      {/* Gain / Loss */}
      <td className="px-4 py-3 text-right tabular-nums hidden sm:table-cell">
        <span className={positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
          {positive ? '+' : ''}${Math.abs(entry.gain_loss).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </td>

      {/* Current cash */}
      <td className="px-4 py-3 text-right tabular-nums hidden md:table-cell text-muted-foreground">
        ${entry.current_cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </td>
    </tr>
  );
}

// ============================================================================
// Page
// ============================================================================

export default function PaperLeaderboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['paper', 'leaderboard'],
    queryFn: () => getLeaderboard(25),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <Link
          href="/app/paper"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Paper Trading
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Crown className="h-6 w-6 text-yellow-500" />
          Leaderboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Top paper traders ranked by total return on their $100,000 starting balance.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 px-4 py-3 text-sm">
        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
        <p className="text-amber-800 dark:text-amber-300">
          <strong>Simulated only.</strong> Rankings reflect simulated paper trading performance. No real money is involved. Past simulated performance does not predict real trading outcomes.
        </p>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading leaderboard…
          </div>
        )}

        {isError && (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Unable to load leaderboard. Please try again later.
          </div>
        )}

        {data && (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="px-4 py-3 text-center w-10">#</th>
                  <th className="px-4 py-3 text-left">Trader</th>
                  <th className="px-4 py-3 text-right">Return</th>
                  <th className="px-4 py-3 text-right hidden sm:table-cell">Gain / Loss</th>
                  <th className="px-4 py-3 text-right hidden md:table-cell">Balance</th>
                </tr>
              </thead>
              <tbody>
                {data.leaderboard.map((entry) => (
                  <LeaderboardRow key={entry.handle + entry.rank} entry={entry} />
                ))}
                {data.leaderboard.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-16 text-center text-sm text-muted-foreground">
                      No paper trading accounts yet. Be the first to start trading!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {data.leaderboard.length > 0 && (
              <div className="border-t px-4 py-3 text-xs text-muted-foreground">
                {data.disclaimer}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

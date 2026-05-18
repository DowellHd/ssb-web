'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { cn } from '@/lib/utils';

interface NPSSummary {
  nps_score: number | null;
  total_responses: number;
  promoters: number;
  passives: number;
  detractors: number;
  promoter_pct: number;
  detractor_pct: number;
  average_score: number | null;
  responses_last_30_days: number;
}

interface NPSResponse {
  id: string;
  email: string;
  score: number;
  category: string;
  feedback: string | null;
  user_plan: string | null;
  dismissed: boolean;
  submitted_at: string;
}

const CATEGORY_STYLE: Record<string, string> = {
  promoter: 'text-green-400 bg-green-500/10 border-green-500/30',
  passive: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  detractor: 'text-red-400 bg-red-500/10 border-red-500/30',
  dismissed: 'text-muted-foreground bg-muted/30 border-border/40',
};

function npsScoreColor(score: number): string {
  if (score >= 50) return 'text-green-400';
  if (score >= 0) return 'text-yellow-400';
  return 'text-red-400';
}

export default function NPSAdminPage() {
  const [summary, setSummary] = useState<NPSSummary | null>(null);
  const [responses, setResponses] = useState<NPSResponse[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (activeFilter: string) => {
    setError(null);
    try {
      const [summaryRes, responsesRes] = await Promise.all([
        apiClient.get('/feedback/nps/admin/summary'),
        apiClient.get(
          `/feedback/nps/admin/responses?limit=100${
            activeFilter !== 'all' ? `&category=${activeFilter}` : ''
          }`,
        ),
      ]);
      setSummary(summaryRes.data);
      setResponses(responsesRes.data.responses);
    } catch (err) {
      setError('Failed to load NPS data. Admin access required.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData(filter);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData(filter);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4 animate-pulse">
        <div className="h-7 w-40 rounded bg-muted" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted" />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-muted" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Link
              href="/app/admin"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              Admin
            </Link>
          </div>
          <h1 className="text-2xl font-bold">NPS Responses</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Net Promoter Score feedback from SSB users
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Summary cards */}
      {summary && (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {/* NPS score */}
            <div className="col-span-2 rounded-xl border border-border/70 bg-card p-4 md:col-span-1">
              <p className="mb-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                NPS Score
              </p>
              <p
                className={cn(
                  'text-4xl font-bold',
                  summary.nps_score !== null
                    ? npsScoreColor(summary.nps_score)
                    : 'text-muted-foreground',
                )}
              >
                {summary.nps_score !== null
                  ? summary.nps_score > 0
                    ? `+${summary.nps_score}`
                    : summary.nps_score
                  : '—'}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">−100 to +100 scale</p>
            </div>

            {/* Total */}
            <div className="rounded-xl border border-border/70 bg-card p-4">
              <p className="mb-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                Total
              </p>
              <p className="text-2xl font-bold">{summary.total_responses}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {summary.responses_last_30_days} in last 30 days
              </p>
            </div>

            {/* Promoters */}
            <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
              <div className="mb-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-400" />
                <p className="text-[11px] uppercase tracking-wider text-green-400">Promoters</p>
              </div>
              <p className="text-2xl font-bold text-green-400">{summary.promoters}</p>
              <p className="mt-1 text-[11px] text-green-400/70">
                {summary.promoter_pct}% of responses
              </p>
            </div>

            {/* Detractors */}
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <div className="mb-1 flex items-center gap-1">
                <TrendingDown className="h-3 w-3 text-red-400" />
                <p className="text-[11px] uppercase tracking-wider text-red-400">Detractors</p>
              </div>
              <p className="text-2xl font-bold text-red-400">{summary.detractors}</p>
              <p className="mt-1 text-[11px] text-red-400/70">
                {summary.detractor_pct}% of responses
              </p>
            </div>
          </div>

          {/* Breakdown bar */}
          {summary.nps_score !== null && (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-border/70 bg-card/50 px-4 py-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400" />
                <span className="text-muted-foreground">
                  Promoters (9–10):{' '}
                  <span className="font-medium text-foreground">{summary.promoters}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-yellow-400" />
                <span className="text-muted-foreground">
                  Passives (7–8):{' '}
                  <span className="font-medium text-foreground">{summary.passives}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-400" />
                <span className="text-muted-foreground">
                  Detractors (0–6):{' '}
                  <span className="font-medium text-foreground">{summary.detractors}</span>
                </span>
              </div>
              <div className="ml-auto text-xs text-muted-foreground">
                Avg score:{' '}
                <span className="font-medium text-foreground">
                  {summary.average_score ?? '—'}
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {['all', 'promoter', 'passive', 'detractor', 'dismissed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition-colors',
              filter === f
                ? 'border-[#1A2478] bg-[#1A2478] text-white'
                : 'border-border/50 text-muted-foreground hover:text-foreground',
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Response list */}
      <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
        {responses.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {filter === 'all'
                ? 'No responses yet. The NPS widget appears to eligible users after 7 days.'
                : `No ${filter} responses.`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {responses.map((r) => (
              <div key={r.id} className="p-4 transition-colors hover:bg-muted/20">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    {!r.dismissed && (
                      <div
                        className={cn(
                          'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border text-sm font-bold',
                          CATEGORY_STYLE[r.category] ?? CATEGORY_STYLE.dismissed,
                        )}
                      >
                        {r.score}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-medium">{r.email}</span>
                        <span
                          className={cn(
                            'rounded border px-1.5 py-0.5 text-[10px] font-medium capitalize',
                            CATEGORY_STYLE[r.category] ?? CATEGORY_STYLE.dismissed,
                          )}
                        >
                          {r.category}
                        </span>
                        {r.user_plan && (
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] capitalize text-muted-foreground">
                            {r.user_plan}
                          </span>
                        )}
                      </div>
                      {r.feedback && (
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                          &ldquo;{r.feedback}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="flex-shrink-0 text-xs text-muted-foreground">
                    {new Date(r.submitted_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

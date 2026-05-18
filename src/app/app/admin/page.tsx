'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart3, Link2, MessageSquare, ShieldCheck } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { cn } from '@/lib/utils';

interface NPSSummary {
  nps_score: number | null;
  total_responses: number;
}

function npsColor(score: number): string {
  if (score >= 50) return 'text-green-500';
  if (score >= 0) return 'text-yellow-500';
  return 'text-red-500';
}

export default function AdminHubPage() {
  const [nps, setNps] = useState<NPSSummary | null>(null);

  useEffect(() => {
    apiClient
      .get('/feedback/nps/admin/summary')
      .then((r) => setNps(r.data))
      .catch(() => null);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-bold">
          <ShieldCheck className="h-7 w-7 text-slate-600" />
          Admin
        </h1>
        <p className="mt-1 text-muted-foreground">
          Internal tools for platform management.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/app/admin/analytics"
          className="rounded-lg border bg-card p-6 transition-colors hover:bg-muted/40"
        >
          <div className="mb-3 flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-semibold">User Analytics</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Total user counts segmented by subscription plan and status.
            Founder access only.
          </p>
        </Link>

        <Link
          href="/app/admin/links"
          className="rounded-lg border bg-card p-6 transition-colors hover:bg-muted/40"
        >
          <div className="mb-3 flex items-center gap-3">
            <Link2 className="h-6 w-6 text-green-600" />
            <h2 className="text-lg font-semibold">Link Checker</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Verify all external URLs and video links in the educational content
            catalog. Identify and report broken links.
          </p>
        </Link>

        {/* NPS card */}
        <Link
          href="/app/admin/nps"
          className="rounded-lg border bg-card p-6 transition-colors hover:bg-muted/40"
        >
          <div className="mb-3 flex items-center gap-3">
            <MessageSquare className="h-6 w-6 text-purple-500" />
            <h2 className="text-lg font-semibold">NPS Responses</h2>
          </div>
          {nps ? (
            <div className="flex items-baseline gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  NPS Score
                </p>
                <p
                  className={cn(
                    'text-3xl font-bold',
                    nps.nps_score !== null
                      ? npsColor(nps.nps_score)
                      : 'text-muted-foreground',
                  )}
                >
                  {nps.nps_score !== null
                    ? nps.nps_score > 0
                      ? `+${nps.nps_score}`
                      : nps.nps_score
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Responses
                </p>
                <p className="text-3xl font-bold">{nps.total_responses}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              User satisfaction survey results. 7-day eligibility window,
              90-day cooldown between surveys.
            </p>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            View all responses →
          </p>
        </Link>
      </div>
    </div>
  );
}

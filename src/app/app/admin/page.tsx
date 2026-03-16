'use client';

import Link from 'next/link';
import { BarChart3, Link2, ShieldCheck } from 'lucide-react';

export default function AdminHubPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <ShieldCheck className="h-7 w-7 text-slate-600" />
          Admin
        </h1>
        <p className="text-muted-foreground mt-1">
          Internal tools for platform management.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/app/admin/analytics"
          className="rounded-lg border bg-card p-6 hover:bg-muted/40 transition-colors"
        >
          <div className="flex items-center gap-3 mb-3">
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
          className="rounded-lg border bg-card p-6 hover:bg-muted/40 transition-colors"
        >
          <div className="flex items-center gap-3 mb-3">
            <Link2 className="h-6 w-6 text-green-600" />
            <h2 className="text-lg font-semibold">Link Checker</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Verify all external URLs and video links in the educational content
            catalog. Identify and report broken links.
          </p>
        </Link>
      </div>
    </div>
  );
}

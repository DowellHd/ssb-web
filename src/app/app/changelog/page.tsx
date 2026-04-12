'use client';

import { History, Package } from 'lucide-react';
import { CHANGELOG } from '@/lib/changelog';
import { SUBSYSTEM_VERSIONS, type SubsystemKey } from '@/lib/versioning';

const subsystemLabels: Record<SubsystemKey, string> = {
  regime: 'Regime Analysis',
  risk: 'Risk Analytics',
  stress: 'Stress Testing',
  chart: 'Charting',
  viewMode: 'View Mode',
  learn: 'Learn',
  options: 'Options',
  tradeIdeas: 'Trade Ideas',
  globalMarkets: 'Global Markets',
  fixedIncome: 'Fixed Income',
  alternatives: 'Alternatives',
};

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ChangelogPage() {
  const subsystemKeys = Object.keys(SUBSYSTEM_VERSIONS) as SubsystemKey[];

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <History className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">What&apos;s New</h1>
        </div>
        <p className="text-muted-foreground">
          Recent updates to the SSB platform and its subsystems.
        </p>
      </div>

      {/* Subsystem Versions Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Subsystem Versions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subsystemKeys.map((key) => {
            const info = SUBSYSTEM_VERSIONS[key];
            return (
              <div
                key={key}
                className="rounded-lg border bg-card p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">
                    {subsystemLabels[key]}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-mono font-semibold">
                    v{info.version}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(info.lastUpdated)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {info.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Changelog Entries */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Changelog</h2>
        <div className="space-y-6">
          {CHANGELOG.map((entry, i) => (
            <div
              key={`${entry.subsystem}-${entry.version}-${i}`}
              className="rounded-lg border bg-card p-5"
            >
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
                  {entry.subsystem}
                </span>
                <span className="font-mono text-sm font-semibold">
                  v{entry.version}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(entry.date)}
                </span>
              </div>
              <ul className="space-y-1.5">
                {entry.changes.map((change, j) => (
                  <li
                    key={j}
                    className="flex items-start gap-2 text-sm text-foreground"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                    {change}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center pb-4">
        All information on this page is factual and refers to shipped updates only.
        SSB does not provide investment advice.
      </p>
    </div>
  );
}

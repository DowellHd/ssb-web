'use client';

import { AlertTriangle, Map } from 'lucide-react';
import { ROADMAP_AREAS, ROADMAP_DISCLAIMER, type RoadmapStatus } from '@/lib/roadmap';

const statusStyles: Record<RoadmapStatus, { label: string; className: string }> = {
  active: {
    label: 'Active',
    className: 'bg-green-500/10 text-green-600 dark:text-green-400',
  },
  planned: {
    label: 'Planned',
    className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  exploring: {
    label: 'Exploring',
    className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
};

export default function RoadmapPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Map className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Roadmap</h1>
        </div>
        <p className="text-muted-foreground">
          High-level areas of focus for the SSB platform.
        </p>
      </div>

      {/* Disclaimer Banner */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          {ROADMAP_DISCLAIMER}
        </p>
      </div>

      {/* Focus Areas */}
      <div className="grid gap-4 sm:grid-cols-2">
        {ROADMAP_AREAS.map((area) => {
          const style = statusStyles[area.status];
          return (
            <div
              key={area.title}
              className="rounded-lg border bg-card p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{area.title}</h3>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style.className}`}
                >
                  {style.label}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {area.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Footer Disclaimer */}
      <p className="text-xs text-muted-foreground text-center pb-4">
        {ROADMAP_DISCLAIMER} SSB does not provide investment advice.
      </p>
    </div>
  );
}

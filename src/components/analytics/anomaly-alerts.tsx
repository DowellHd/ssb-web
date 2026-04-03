'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { AlertTriangle, ShieldCheck, AlertCircle, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnomalyReportResponse, AnomalyEvent } from '@/lib/api/predictive';

const RISK_FLAG_CONFIG = {
  normal:   { icon: ShieldCheck, color: 'text-green-600 dark:text-green-400',  bg: 'bg-green-50 dark:bg-green-950/30',  label: 'Normal' },
  watch:    { icon: AlertCircle, color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-950/30',    label: 'Watch' },
  alert:    { icon: AlertTriangle, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30', label: 'Alert' },
  critical: { icon: Flame,          color: 'text-red-600 dark:text-red-400',    bg: 'bg-red-50 dark:bg-red-950/30',     label: 'Critical' },
};

const SEVERITY_BADGE: Record<string, string> = {
  mild:     'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  moderate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  severe:   'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  extreme:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

interface AnomalyAlertsProps {
  result: AnomalyReportResponse;
  className?: string;
}

export function AnomalyAlerts({ result, className }: AnomalyAlertsProps) {
  const flagConfig = RISK_FLAG_CONFIG[result.overall_risk_flag] ?? RISK_FLAG_CONFIG.normal;
  const FlagIcon = flagConfig.icon;

  // Z-score chart data (last 30 points)
  const zData = result.rolling_z_scores.map((z, i) => ({
    i,
    z,
    abs: Math.abs(z),
  }));

  const topAnomalies = result.anomalies.slice(0, 8);

  return (
    <div className={cn('space-y-5', className)}>
      {/* Risk flag banner */}
      <div className={cn('flex items-center gap-3 rounded-lg px-4 py-3', flagConfig.bg)}>
        <FlagIcon className={cn('h-5 w-5 shrink-0', flagConfig.color)} />
        <div className="flex-1 min-w-0">
          <p className={cn('font-semibold', flagConfig.color)}>
            {flagConfig.label} &mdash; {result.anomaly_count} anomaly event(s) detected
          </p>
          <p className="text-xs text-muted-foreground">
            Anomaly rate: {result.anomaly_rate_pct.toFixed(1)}% of observations
          </p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <div>Extreme: {result.severity_summary.extreme ?? 0}</div>
          <div>Severe: {result.severity_summary.severe ?? 0}</div>
        </div>
      </div>

      {/* Rolling Z-score chart */}
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Rolling Z-Score (last 30 periods)
        </p>
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={zData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="i" hide />
              <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" />
              <Tooltip
                formatter={(v: number) => [v.toFixed(2), 'Z-Score']}
                contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              />
              <ReferenceLine y={2}  stroke="#f59e0b" strokeDasharray="4 4" />
              <ReferenceLine y={-2} stroke="#f59e0b" strokeDasharray="4 4" />
              <ReferenceLine y={3}  stroke="#ef4444" strokeDasharray="4 4" />
              <ReferenceLine y={-3} stroke="#ef4444" strokeDasharray="4 4" />
              <Line
                type="monotone"
                dataKey="z"
                stroke="var(--primary)"
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">
          Dashed lines: ±2σ (amber) and ±3σ (red) thresholds
        </p>
      </div>

      {/* Anomaly list */}
      {topAnomalies.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Top anomaly events (most severe first)
          </p>
          {topAnomalies.map((a, i) => (
            <AnomalyRow key={i} anomaly={a} />
          ))}
          {result.anomalies.length > 8 && (
            <p className="text-xs text-muted-foreground">
              +{result.anomalies.length - 8} more events not shown
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No significant anomalies detected.</p>
      )}

      {/* Explanation */}
      <p className="text-xs text-muted-foreground">{result.explanation.summary}</p>
    </div>
  );
}

function AnomalyRow({ anomaly }: { anomaly: AnomalyEvent }) {
  const badge = SEVERITY_BADGE[anomaly.severity] ?? '';
  const typeLabel = anomaly.type.replace(/_/g, ' ');

  return (
    <div className="flex items-start gap-3 rounded-md border bg-card px-3 py-2.5">
      <span className={cn('mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase', badge)}>
        {anomaly.severity}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium capitalize">{typeLabel}</p>
        <p className="text-[11px] text-muted-foreground">{anomaly.description}</p>
      </div>
      {anomaly.z_score !== null && (
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
          {anomaly.z_score > 0 ? '+' : ''}{anomaly.z_score.toFixed(1)}σ
        </span>
      )}
    </div>
  );
}

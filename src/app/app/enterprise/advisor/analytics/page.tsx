'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, RefreshCw, TrendingUp, DollarSign, Users, Target,
  BarChart3, PieChart, Award, AlertTriangle, CheckCircle2,
  Clock, ArrowUpRight, Zap,
} from 'lucide-react';
import { advisorApi, type AdvisorClient } from '@/lib/api/enterprise';
import { usePlanStore } from '@/stores/plan-store';

import { calcLeadScore, scoreLabel } from '@/lib/advisor/scoring';

// ── Revenue Estimation ────────────────────────────────────────────────────────

function estimateAnnualRevenue(c: AdvisorClient): number {
  const aum = c.aum_usd ? parseFloat(c.aum_usd as string) : 0;
  const val = c.fee_value ? parseFloat(c.fee_value as string) : 0;
  if (!val) return 0;
  if (c.fee_type === 'aum_pct') return (aum * val) / 100;
  if (c.fee_type === 'flat')    return val;
  if (c.fee_type === 'hourly')  return val * 10; // estimate 10 hrs/yr
  return 0;
}

// ── Formatters ────────────────────────────────────────────────────────────────

function fmtMoney(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000)     return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)         return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function fmtPct(n: number): string { return `${n.toFixed(1)}%`; }

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, sub, subColor }: {
  icon: React.ElementType; label: string; value: string | number;
  sub?: string; subColor?: string;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-4 flex items-start gap-3 elevation-1">
      <div className="p-2 rounded-lg bg-muted/60 mt-0.5 shrink-0">
        <Icon className="h-4 w-4 text-foreground/70" />
      </div>
      <div className="min-w-0">
        <p className="stat-label">{label}</p>
        <p className="text-xl font-bold truncate num">{value}</p>
        {sub && <p className={`text-xs mt-0.5 ${subColor ?? 'text-muted-foreground'}`}>{sub}</p>}
      </div>
    </div>
  );
}

// ── Bar Progress ──────────────────────────────────────────────────────────────

function Bar({ pct, color = 'bg-primary' }: { pct: number; color?: string }) {
  return (
    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, pct)}%` }} />
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function AdvisorAnalyticsPage() {
  const { normalized, isLoaded } = usePlanStore();
  const isInstitutional = normalized.isAllAccess || normalized.plan === 'institutional';

  const [clients, setClients] = useState<AdvisorClient[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try { setClients(await advisorApi.listClients()); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  // ── Computed metrics ───────────────────────────────────────────────────────

  const metrics = useMemo(() => {
    const total = clients.length;
    const active = clients.filter(c => c.status === 'active').length;
    const prospects = clients.filter(c => c.status === 'prospect').length;
    const inactive = clients.filter(c => c.status === 'inactive').length;
    const terminated = clients.filter(c => c.status === 'terminated').length;

    const totalAum = clients.reduce((s, c) => s + (c.aum_usd ? parseFloat(c.aum_usd as string) : 0), 0);
    const avgAum = total > 0 ? totalAum / total : 0;

    const estRevenue = clients.reduce((s, c) => s + estimateAnnualRevenue(c), 0);

    // Segment breakdown
    const segments: Record<string, { count: number; aum: number }> = {};
    for (const c of clients) {
      const seg = c.segment ?? 'unassigned';
      if (!segments[seg]) segments[seg] = { count: 0, aum: 0 };
      segments[seg].count++;
      segments[seg].aum += c.aum_usd ? parseFloat(c.aum_usd as string) : 0;
    }

    // KYC breakdown
    const kyc = { pending: 0, approved: 0, rejected: 0 };
    for (const c of clients) kyc[c.kyc_status]++;

    // Lead scores
    const scored = clients
      .filter(c => c.status === 'prospect' || c.status === 'active')
      .map(c => ({ ...c, score: calcLeadScore(c) }))
      .sort((a, b) => b.score - a.score);

    // Top clients by AUM
    const topByAum = [...clients]
      .filter(c => c.aum_usd)
      .sort((a, b) => parseFloat(b.aum_usd as string) - parseFloat(a.aum_usd as string))
      .slice(0, 5);

    // Pipeline value (prospects AUM)
    const pipelineAum = clients
      .filter(c => c.status === 'prospect')
      .reduce((s, c) => s + (c.aum_usd ? parseFloat(c.aum_usd as string) : 0), 0);

    // Fee type breakdown
    const feeTypes = { aum_pct: 0, flat: 0, hourly: 0, none: 0 };
    for (const c of clients) {
      if (c.fee_type === 'aum_pct') feeTypes.aum_pct++;
      else if (c.fee_type === 'flat') feeTypes.flat++;
      else if (c.fee_type === 'hourly') feeTypes.hourly++;
      else feeTypes.none++;
    }

    return { total, active, prospects, inactive, terminated, totalAum, avgAum, estRevenue, segments, kyc, scored, topByAum, pipelineAum, feeTypes };
  }, [clients]);

  // ── Render ─────────────────────────────────────────────────────────────────

  if (isLoaded && !isInstitutional) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <BarChart3 className="h-10 w-10 text-muted-foreground mx-auto" />
        <h1 className="text-xl font-bold">Advisor Analytics</h1>
        <p className="text-muted-foreground text-sm">Available on the Institutional plan.</p>
        <Link href="/app/billing" className="inline-flex items-center gap-2 px-5 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
          Upgrade to Institutional
        </Link>
      </div>
    );
  }

  if (loading || !isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const SEGMENT_LABELS: Record<string, string> = {
    mass_market: 'Mass Market', affluent: 'Affluent', hnw: 'HNW', uhnw: 'UHNW', unassigned: 'Unassigned',
  };
  const SEGMENT_COLORS: Record<string, string> = {
    uhnw: 'bg-purple-500', hnw: 'bg-blue-500', affluent: 'bg-green-500', mass_market: 'bg-yellow-500', unassigned: 'bg-muted-foreground',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/app/enterprise/advisor" className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Practice Analytics
            </h1>
            <p className="text-sm text-muted-foreground">Business intelligence &amp; performance metrics</p>
          </div>
        </div>
        <button onClick={load} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Top KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Users}      label="Total Clients"      value={metrics.total}               sub={`${metrics.active} active · ${metrics.prospects} prospects`} />
        <KpiCard icon={DollarSign} label="Total AUM"          value={fmtMoney(metrics.totalAum)}  sub={`Avg ${fmtMoney(metrics.avgAum)}`} />
        <KpiCard icon={TrendingUp} label="Est. Annual Revenue" value={fmtMoney(metrics.estRevenue)} sub={metrics.estRevenue > 0 ? 'From fee schedules' : 'Add fee data to clients'} subColor={metrics.estRevenue > 0 ? 'text-green-400' : 'text-yellow-400'} />
        <KpiCard icon={Target}     label="Pipeline AUM"       value={fmtMoney(metrics.pipelineAum)} sub={`${metrics.prospects} prospects`} subColor={metrics.pipelineAum > 0 ? 'text-blue-400' : undefined} />
      </div>

      {/* Pipeline Funnel + Revenue Forecast */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Pipeline Funnel */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-400" /> Client Pipeline
          </h3>
          {[
            { label: 'Prospect', count: metrics.prospects, color: 'bg-yellow-500' },
            { label: 'Active',   count: metrics.active,    color: 'bg-green-500' },
            { label: 'Inactive', count: metrics.inactive,  color: 'bg-muted-foreground' },
            { label: 'Terminated', count: metrics.terminated, color: 'bg-red-500' },
          ].map(({ label, count, color }) => (
            <div key={label} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{count} ({metrics.total > 0 ? fmtPct((count / metrics.total) * 100) : '0%'})</span>
              </div>
              <Bar pct={metrics.total > 0 ? (count / metrics.total) * 100 : 0} color={color} />
            </div>
          ))}
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Conversion rate: <span className="font-medium text-foreground">
                {metrics.total > 0 ? fmtPct((metrics.active / metrics.total) * 100) : '0%'}
              </span> prospect → active
            </p>
          </div>
        </div>

        {/* Revenue Forecast */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-400" /> Revenue Forecast
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Monthly',   value: metrics.estRevenue / 12 },
              { label: 'Quarterly', value: metrics.estRevenue / 4 },
              { label: 'Annual',    value: metrics.estRevenue },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground">{label} Revenue</span>
                <span className="font-semibold text-sm">{fmtMoney(value)}</span>
              </div>
            ))}
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
            Based on fee schedules set on client profiles. Add fee type &amp; value to clients for accurate projections.
          </div>
          {/* Fee type breakdown */}
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground font-medium">Fee Structure Mix</p>
            {[
              { label: 'AUM %',  count: metrics.feeTypes.aum_pct },
              { label: 'Flat',   count: metrics.feeTypes.flat },
              { label: 'Hourly', count: metrics.feeTypes.hourly },
              { label: 'None',   count: metrics.feeTypes.none },
            ].filter(f => f.count > 0).map(({ label, count }) => (
              <div key={label} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{label}</span>
                <span>{count} client{count !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Segment AUM Breakdown + KYC Status */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Segment AUM */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <PieChart className="h-4 w-4 text-blue-400" /> AUM by Client Segment
          </h3>
          {Object.entries(metrics.segments).length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No segment data — assign segments to clients</p>
          ) : (
            Object.entries(metrics.segments)
              .sort(([, a], [, b]) => b.aum - a.aum)
              .map(([seg, { count, aum }]) => (
                <div key={seg} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{SEGMENT_LABELS[seg] ?? seg}</span>
                    <span className="font-medium">{count} client{count !== 1 ? 's' : ''} · {fmtMoney(aum)}</span>
                  </div>
                  <Bar pct={metrics.totalAum > 0 ? (aum / metrics.totalAum) * 100 : 0} color={SEGMENT_COLORS[seg] ?? 'bg-primary'} />
                </div>
              ))
          )}
        </div>

        {/* KYC Status */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-400" /> KYC / Compliance Status
          </h3>
          {[
            { label: 'Approved', count: metrics.kyc.approved, icon: CheckCircle2, color: 'text-green-400', bar: 'bg-green-500' },
            { label: 'Pending',  count: metrics.kyc.pending,  icon: Clock,         color: 'text-yellow-400', bar: 'bg-yellow-500' },
            { label: 'Rejected', count: metrics.kyc.rejected, icon: AlertTriangle, color: 'text-red-400', bar: 'bg-red-500' },
          ].map(({ label, count, icon: Icon, color, bar }) => (
            <div key={label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <Icon className={`h-3.5 w-3.5 ${color}`} />
                  <span className="text-muted-foreground">{label}</span>
                </span>
                <span className="font-medium">{count} ({metrics.total > 0 ? fmtPct((count / metrics.total) * 100) : '0%'})</span>
              </div>
              <Bar pct={metrics.total > 0 ? (count / metrics.total) * 100 : 0} color={bar} />
            </div>
          ))}
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              {metrics.kyc.pending > 0
                ? <span className="text-yellow-400">{metrics.kyc.pending} client{metrics.kyc.pending !== 1 ? 's' : ''} awaiting KYC approval</span>
                : <span className="text-green-400">All active clients KYC compliant</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Lead Scores + Top Clients by AUM */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Hot Leads */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Award className="h-4 w-4 text-orange-400" /> Lead Scores (Top Prospects)
          </h3>
          {metrics.scored.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No prospects or active clients yet</p>
          ) : (
            <div className="space-y-2">
              {metrics.scored.slice(0, 6).map((c) => {
                const { label, color } = scoreLabel(c.score);
                return (
                  <Link key={c.id} href={`/app/enterprise/advisor/${c.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group">
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold shrink-0">
                      {c.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.aum_usd ? fmtMoney(parseFloat(c.aum_usd as string)) : '—'} AUM</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-xs font-bold ${color}`}>{label}</p>
                      <p className="text-xs text-muted-foreground">{c.score}/100</p>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Clients by AUM */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" /> Top Clients by AUM
          </h3>
          {metrics.topByAum.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No AUM data — add AUM to clients</p>
          ) : (
            <div className="space-y-2">
              {metrics.topByAum.map((c, i) => {
                const aum = parseFloat(c.aum_usd as string);
                const rev = estimateAnnualRevenue(c);
                return (
                  <Link key={c.id} href={`/app/enterprise/advisor/${c.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group">
                    <div className="text-xs font-bold text-muted-foreground w-4 text-center shrink-0">#{i + 1}</div>
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold shrink-0">
                      {c.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{rev > 0 ? `~${fmtMoney(rev)}/yr` : 'No fee schedule'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold">{fmtMoney(aum)}</p>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Practice Health Summary */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" /> Practice Health Summary
        </h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              label: 'Client Retention',
              value: metrics.total > 0 ? fmtPct(((metrics.active + metrics.inactive) / metrics.total) * 100) : '—',
              sub: 'Active + inactive vs total',
              color: 'text-green-400',
            },
            {
              label: 'KYC Compliance',
              value: metrics.total > 0 ? fmtPct((metrics.kyc.approved / metrics.total) * 100) : '—',
              sub: 'Approved / total clients',
              color: metrics.kyc.rejected > 0 ? 'text-red-400' : 'text-green-400',
            },
            {
              label: 'Avg Revenue / Client',
              value: metrics.active > 0 ? fmtMoney(metrics.estRevenue / metrics.active) : '—',
              sub: 'Annual estimate (active only)',
              color: 'text-blue-400',
            },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="rounded-lg bg-muted/30 p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center pb-4">
        All metrics are computed from client profile data entered in the CRM.
        Revenue projections are estimates based on fee schedules and should not be considered financial guarantees.
      </p>
    </div>
  );
}

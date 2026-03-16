'use client';

import { useEffect, useState } from 'react';
import {
  Activity,
  AlertCircle,
  BarChart3,
  CreditCard,
  DollarSign,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  UserCheck,
  UserMinus,
  Users,
  UserX,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getUserAnalytics, type UserAnalyticsResponse } from '@/lib/api/admin';

// ── Helpers ──────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  highlight?: 'good' | 'warn' | 'neutral';
}) {
  const colours = {
    good: 'text-green-700',
    warn: 'text-red-600',
    neutral: '',
  };
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-center gap-2 mb-1 text-muted-foreground">{icon}<p className="text-sm">{label}</p></div>
      <p className={`text-3xl font-bold ${colours[highlight ?? 'neutral']}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold mt-6 mb-3">{children}</h2>;
}

const PLAN_ORDER = ['free', 'starter', 'pro', 'institutional'];
const sortPlans = <T extends { plan_name: string }>(arr: T[]): T[] =>
  [...arr].sort((a, b) => PLAN_ORDER.indexOf(a.plan_name) - PLAN_ORDER.indexOf(b.plan_name));

// Simple CSS bar: width proportional to max value
function MiniBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
        <div className="bg-primary h-full rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function UserAnalyticsPage() {
  const [data, setData] = useState<UserAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getUserAnalytics());
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="text-muted-foreground">Loading analytics…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-destructive">{error}</p>
        <Button onClick={load} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  if (!data) return null;

  const { user_status, plan_breakdown, subscription_lifecycle, monthly_registrations, revenue_estimate, activity, churn } = data;
  const sortedPlans = sortPlans(plan_breakdown);
  const sortedLifecycle = sortPlans(subscription_lifecycle);

  const paidPct = data.total_users > 0 ? Math.round((data.paid_users / data.total_users) * 100) : 0;
  const maxMonthly = Math.max(...monthly_registrations.map((m) => m.new_users), 1);

  return (
    <div className="space-y-2 pb-12">

      {/* ── Header ── */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <BarChart3 className="h-7 w-7 text-slate-600" />
            User Analytics
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Comprehensive lifecycle metrics for all registered users.
            {data.cached && (
              <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                Cached
              </span>
            )}
          </p>
        </div>
        <Button onClick={load} variant="ghost" size="icon" disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* ── Top-level summary ── */}
      <SectionTitle>Overview</SectionTitle>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label="Total Current Users"
          value={data.total_users}
          sub={`${user_status.total_ever_registered.toLocaleString()} ever registered`}
        />
        <StatCard
          icon={<CreditCard className="h-4 w-4" />}
          label="Paid Users"
          value={data.paid_users}
          sub={`${paidPct}% conversion rate`}
          highlight="good"
        />
        <StatCard
          icon={<UserX className="h-4 w-4" />}
          label="Free / Unpaid"
          value={data.unpaid_users}
          sub={`${100 - paidPct}% of current users`}
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="New (30d / 7d)"
          value={data.new_users_last_30_days}
          sub={`${data.new_users_last_7_days.toLocaleString()} in last 7 days`}
        />
      </div>

      {/* ── User status breakdown ── */}
      <SectionTitle>User Status Breakdown</SectionTitle>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label="Ever Registered"
          value={user_status.total_ever_registered}
          sub="All time, including deleted"
        />
        <StatCard
          icon={<UserCheck className="h-4 w-4" />}
          label="Active Accounts"
          value={user_status.total_active}
          highlight="good"
        />
        <StatCard
          icon={<UserMinus className="h-4 w-4" />}
          label="Inactive Accounts"
          value={user_status.total_inactive}
          sub="Not deleted, is_active=false"
        />
        <StatCard
          icon={<UserX className="h-4 w-4" />}
          label="Deleted Accounts"
          value={user_status.total_deleted}
          sub="Soft-deleted"
          highlight={user_status.total_deleted > 0 ? 'warn' : 'neutral'}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          icon={<UserCheck className="h-4 w-4" />}
          label="Email Verified"
          value={user_status.total_email_verified}
          sub={`${data.total_users > 0 ? Math.round(user_status.total_email_verified / data.total_users * 100) : 0}% of current users`}
        />
        <StatCard
          icon={<UserCheck className="h-4 w-4" />}
          label="MFA Enabled"
          value={user_status.total_mfa_enabled}
          sub={`${data.total_users > 0 ? Math.round(user_status.total_mfa_enabled / data.total_users * 100) : 0}% of current users`}
        />
      </div>

      {/* ── Revenue estimate ── */}
      <SectionTitle>Revenue Estimate</SectionTitle>
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 mb-2">
        Estimate only — headcount × plan price. Does not reflect discounts, yearly billing,
        trials, or actual Stripe charges.
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          icon={<DollarSign className="h-4 w-4" />}
          label="Estimated MRR"
          value={`$${revenue_estimate.mrr_usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          highlight="good"
        />
        <StatCard
          icon={<DollarSign className="h-4 w-4" />}
          label="Estimated ARR"
          value={`$${revenue_estimate.arr_usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          sub="MRR × 12"
          highlight="good"
        />
      </div>
      {revenue_estimate.paying_plan_breakdown.length > 0 && (
        <div className="rounded-lg border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium text-muted-foreground">Plan</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Active</th>
                <th className="text-right p-4 font-medium text-muted-foreground">MRR Contribution</th>
              </tr>
            </thead>
            <tbody>
              {revenue_estimate.paying_plan_breakdown.map((row) => (
                <tr key={row.plan_name} className="border-t hover:bg-muted/30">
                  <td className="p-4 font-medium capitalize">{row.plan_name}</td>
                  <td className="p-4 text-right">{row.active_count.toLocaleString()}</td>
                  <td className="p-4 text-right text-green-700 font-mono">
                    ${row.mrr_contribution.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Activity (DAU/MAU) ── */}
      <SectionTitle>Activity Metrics</SectionTitle>
      <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-800 mb-2">
        Derived from <code>users.last_login_at</code>. Reflects authentication activity,
        not per-page session data (session duration is not tracked in the current schema).
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Activity className="h-4 w-4" />}
          label="DAU (24 h)"
          value={activity.dau}
          sub="Users who logged in today"
        />
        <StatCard
          icon={<Activity className="h-4 w-4" />}
          label="MAU (30 d)"
          value={activity.mau}
          sub="Users active this month"
        />
        <StatCard
          icon={<Activity className="h-4 w-4" />}
          label="DAU/MAU Ratio"
          value={`${(activity.dau_mau_ratio * 100).toFixed(1)}%`}
          sub="Stickiness proxy"
          highlight={activity.dau_mau_ratio > 0.1 ? 'good' : 'neutral'}
        />
        <StatCard
          icon={<UserX className="h-4 w-4" />}
          label="Never Logged In"
          value={activity.users_never_logged_in}
          sub="Registered but inactive"
          highlight={activity.users_never_logged_in > 0 ? 'warn' : 'neutral'}
        />
      </div>

      {/* ── Churn signals ── */}
      <SectionTitle>Churn &amp; Deletion</SectionTitle>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<TrendingDown className="h-4 w-4" />}
          label="Cancellations (30d)"
          value={churn.subscriptions_canceled_30d}
          highlight={churn.subscriptions_canceled_30d > 0 ? 'warn' : 'neutral'}
        />
        <StatCard
          icon={<TrendingDown className="h-4 w-4" />}
          label="Cancellations (90d)"
          value={churn.subscriptions_canceled_90d}
          highlight={churn.subscriptions_canceled_90d > 0 ? 'warn' : 'neutral'}
        />
        <StatCard
          icon={<UserX className="h-4 w-4" />}
          label="Deleted Accounts (30d)"
          value={churn.users_deleted_30d}
          highlight={churn.users_deleted_30d > 0 ? 'warn' : 'neutral'}
        />
        <StatCard
          icon={<UserX className="h-4 w-4" />}
          label="Deleted Accounts (90d)"
          value={churn.users_deleted_90d}
          highlight={churn.users_deleted_90d > 0 ? 'warn' : 'neutral'}
        />
      </div>

      {/* ── Subscription lifecycle ── */}
      <SectionTitle>Subscription Lifecycle</SectionTitle>
      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-medium text-muted-foreground">Plan</th>
              <th className="text-right p-4 font-medium text-muted-foreground">Ever Subscribed</th>
              <th className="text-right p-4 font-medium text-muted-foreground">Active Now</th>
              <th className="text-right p-4 font-medium text-muted-foreground">Churned</th>
              <th className="text-right p-4 font-medium text-muted-foreground">Churn Rate</th>
              <th className="text-right p-4 font-medium text-muted-foreground">Avg Duration</th>
            </tr>
          </thead>
          <tbody>
            {sortedLifecycle.map((lc) => (
              <tr key={lc.plan_name} className="border-t hover:bg-muted/30">
                <td className="p-4 font-medium capitalize">{lc.plan_name}</td>
                <td className="p-4 text-right">{lc.ever_subscribed.toLocaleString()}</td>
                <td className="p-4 text-right text-green-700">{lc.currently_active.toLocaleString()}</td>
                <td className="p-4 text-right text-red-600">{lc.churned.toLocaleString()}</td>
                <td className={`p-4 text-right font-medium ${lc.churn_rate_pct > 20 ? 'text-red-600' : lc.churn_rate_pct > 10 ? 'text-yellow-600' : 'text-slate-700'}`}>
                  {lc.churn_rate_pct.toFixed(1)}%
                </td>
                <td className="p-4 text-right text-muted-foreground">
                  {lc.avg_subscription_days != null
                    ? `${Math.round(lc.avg_subscription_days)}d`
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Plan breakdown (current) ── */}
      <SectionTitle>Current Plan Breakdown</SectionTitle>
      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-medium text-muted-foreground">Plan</th>
              <th className="text-right p-4 font-medium text-muted-foreground">Price/mo</th>
              <th className="text-right p-4 font-medium text-muted-foreground">Total</th>
              <th className="text-right p-4 font-medium text-muted-foreground">Active</th>
              <th className="text-right p-4 font-medium text-muted-foreground">Trialing</th>
              <th className="text-right p-4 font-medium text-muted-foreground">Past Due</th>
              <th className="text-right p-4 font-medium text-muted-foreground">Canceled</th>
              <th className="text-right p-4 font-medium text-muted-foreground">Cancel Soon</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlans.map((pb) => (
              <tr key={pb.plan_name} className="border-t hover:bg-muted/30">
                <td className="p-4 font-medium capitalize">{pb.plan_name}</td>
                <td className="p-4 text-right text-muted-foreground">
                  {pb.price_monthly_usd > 0 ? `$${pb.price_monthly_usd}` : 'Free'}
                </td>
                <td className="p-4 text-right">{pb.total_subscribers.toLocaleString()}</td>
                <td className="p-4 text-right text-green-700">{pb.active_subscriptions.toLocaleString()}</td>
                <td className="p-4 text-right text-blue-700">{pb.trialing_subscriptions.toLocaleString()}</td>
                <td className="p-4 text-right text-yellow-700">{pb.past_due_subscriptions.toLocaleString()}</td>
                <td className="p-4 text-right text-slate-500">{pb.canceled_subscriptions.toLocaleString()}</td>
                <td className="p-4 text-right text-orange-600">{pb.cancel_at_period_end_count.toLocaleString()}</td>
              </tr>
            ))}
            {data.users_without_subscription > 0 && (
              <tr className="border-t bg-muted/20">
                <td className="p-4 italic text-muted-foreground">No subscription</td>
                <td className="p-4 text-right text-muted-foreground">—</td>
                <td className="p-4 text-right text-muted-foreground">{data.users_without_subscription.toLocaleString()}</td>
                <td colSpan={5} />
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Monthly registrations ── */}
      {monthly_registrations.length > 0 && (
        <>
          <SectionTitle>Monthly Registrations (Last 12 Months)</SectionTitle>
          <div className="rounded-lg border bg-card p-4 space-y-2">
            {monthly_registrations.map((m) => (
              <div key={m.month} className="flex items-center gap-3">
                <span className="text-xs font-mono text-muted-foreground w-16">{m.month}</span>
                <div className="flex-1">
                  <MiniBar value={m.new_users} max={maxMonthly} />
                </div>
                <span className="text-sm font-medium w-10 text-right">{m.new_users}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Footer ── */}
      <p className="text-xs text-muted-foreground pt-4">
        As of {new Date(data.as_of).toLocaleString()}.
        {data.cached ? ' Results cached for up to 5 minutes.' : ' Live data.'}
        {' '}Not tracked: geographic distribution, acquisition source, feature usage, session duration.
      </p>
    </div>
  );
}

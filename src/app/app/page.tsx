'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Shield,
  LineChart,
  ClipboardList,
  CreditCard,
  Settings,
  ArrowRight,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getDashboardSummary, getCapabilities, type DashboardSummary, type Capabilities } from '@/lib/api/meta';
import { getIntelligenceEntitlements, type EntitlementsInfo } from '@/lib/api/intelligence';

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function AppDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [capabilities, setCapabilities] = useState<Capabilities | null>(null);
  const [entitlements, setEntitlements] = useState<EntitlementsInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashboardData, capabilitiesData, entitlementsData] = await Promise.all([
        getDashboardSummary(),
        getCapabilities(),
        getIntelligenceEntitlements(),
      ]);
      setDashboard(dashboardData);
      setCapabilities(capabilitiesData);
      setEntitlements(entitlementsData);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const features = [
    {
      title: 'Regime Analysis',
      description: 'Market regime classification with confidence scores',
      icon: TrendingUp,
      href: '/app/regime',
      color: 'text-blue-500',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Risk Analytics',
      description: 'Portfolio risk metrics and VaR analysis',
      icon: Shield,
      href: '/app/risk',
      color: 'text-green-500',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Backtesting',
      description: 'Strategy simulation with historical data',
      icon: LineChart,
      href: '/app/backtests',
      color: 'text-purple-500',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Audit Log',
      description: 'Security events and activity history',
      icon: ClipboardList,
      href: '/app/audit',
      color: 'text-slate-500',
      bgColor: 'bg-slate-100',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="text-muted-foreground">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-destructive">{error}</p>
        <Button onClick={loadData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome{dashboard?.full_name ? `, ${dashboard.full_name.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Your AI-powered financial intelligence dashboard
          </p>
        </div>
        <Button onClick={loadData} variant="ghost" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link
              key={feature.title}
              href={feature.href}
              className="rounded-lg border bg-card p-6 relative overflow-hidden hover:border-primary/50 transition-colors group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={cn('p-2 rounded-lg', feature.bgColor, feature.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {feature.description}
              </p>
              <span className="inline-flex items-center gap-1 text-sm text-primary">
                Open <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          );
        })}
      </div>

      {/* Account status */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Account Status</h2>
        <div className="grid gap-6 md:grid-cols-5">
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{dashboard?.email || '—'}</p>
            {dashboard && !dashboard.email_verified && (
              <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Not verified
              </p>
            )}
            {dashboard?.email_verified && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Verified
              </p>
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Analysis as of</p>
            <p className="font-medium">
              {new Date().toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Plan</p>
            <p className="font-medium">{entitlements?.plan_display_name || 'Free'}</p>
            {entitlements?.can_upgrade && (
              <Link href="/app/billing" className="text-xs text-primary hover:underline">
                Upgrade
              </Link>
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">MFA</p>
            <p className="font-medium">
              {dashboard?.mfa_enabled ? (
                <span className="text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" /> Enabled
                </span>
              ) : (
                <span className="text-muted-foreground">Disabled</span>
              )}
            </p>
            {!dashboard?.mfa_enabled && capabilities?.mfa_enabled && (
              <Link href="/app/settings" className="text-xs text-primary hover:underline">
                Enable MFA
              </Link>
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Member Since</p>
            <p className="font-medium">
              {dashboard?.member_since
                ? new Date(dashboard.member_since).toLocaleDateString()
                : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Activity summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <LineChart className="h-5 w-5 text-purple-500" />
            <h3 className="font-semibold">Backtests</h3>
          </div>
          <p className="text-3xl font-bold">{dashboard?.backtests_count || 0}</p>
          <p className="text-sm text-muted-foreground">Total backtests created</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <ClipboardList className="h-5 w-5 text-slate-500" />
            <h3 className="font-semibold">Recent Logins</h3>
          </div>
          <p className="text-3xl font-bold">{dashboard?.recent_login_count || 0}</p>
          <p className="text-sm text-muted-foreground">Last 30 days</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold">Risk Level</h3>
          </div>
          <p className="text-3xl font-bold capitalize">{entitlements?.risk_analytics_level || 'basic'}</p>
          <p className="text-sm text-muted-foreground">Analytics tier</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href="/app/settings" className="gap-2">
            <Settings className="h-4 w-4" /> Settings
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/app/billing" className="gap-2">
            <CreditCard className="h-4 w-4" /> Billing
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/app/audit" className="gap-2">
            <ClipboardList className="h-4 w-4" /> Audit Log
          </Link>
        </Button>
      </div>

      {/* Disclaimer */}
      <div className="rounded-lg bg-amber-50 border border-amber-300 p-4 text-sm text-slate-800">
        <strong>Important:</strong> This platform is a read-only analytical tool.
        It does not execute trades, provide buy/sell recommendations, or guarantee
        profits. All outputs are for educational and informational purposes only.
      </div>
    </div>
  );
}

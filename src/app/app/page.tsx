'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
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
  Mail,
  Newspaper,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getDashboardSummary, getCapabilities, type DashboardSummary, type Capabilities } from '@/lib/api/meta';
import { getIntelligenceEntitlements, type EntitlementsInfo } from '@/lib/api/intelligence';
import { getMarketSummary, type MarketSummaryResponse } from '@/lib/api/news';
import { resendVerification } from '@/lib/api/auth';
import { getPlanDisplayName } from '@/lib/plan-config';

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function AppDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [capabilities, setCapabilities] = useState<Capabilities | null>(null);
  const [entitlements, setEntitlements] = useState<EntitlementsInfo | null>(null);
  const [marketSummary, setMarketSummary] = useState<MarketSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verificationSending, setVerificationSending] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationCooldown, setVerificationCooldown] = useState(0);

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

      // Load market summary separately (don't fail dashboard on this)
      try {
        const summaryData = await getMarketSummary();
        setMarketSummary(summaryData);
      } catch {
        // Silently fail - market summary is optional
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Cooldown timer for verification resend
  useEffect(() => {
    if (verificationCooldown > 0) {
      const timer = setTimeout(() => setVerificationCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [verificationCooldown]);

  const handleResendVerification = async () => {
    if (!dashboard?.email || verificationSending || verificationCooldown > 0) return;

    setVerificationSending(true);
    setVerificationError(null);
    setVerificationSent(false);

    try {
      await resendVerification(dashboard.email);
      setVerificationSent(true);
      setVerificationCooldown(30); // 30 second cooldown
      toast.success('Verification email sent! Check your inbox.');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || 'Failed to send verification email';
      setVerificationError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setVerificationSending(false);
    }
  };

  const features = [
    {
      title: 'Market News',
      description: 'Latest market intelligence and analysis',
      icon: Newspaper,
      href: '/app/news',
      color: 'text-orange-500',
      bgColor: 'bg-orange-100',
    },
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
      title: 'Learn',
      description: 'Educational modules and glossary',
      icon: BookOpen,
      href: '/app/learn',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-100',
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

      {/* Daily Market Summary */}
      {marketSummary && (
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Daily Market Summary</h2>
              {marketSummary.is_delayed && (
                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                  {marketSummary.delay_minutes}min delay
                </span>
              )}
            </div>
            <Link href="/app/news" className="text-sm text-primary hover:underline">
              View all news →
            </Link>
          </div>
          <p className="text-lg font-medium mb-2">{marketSummary.summary.headline}</p>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {marketSummary.summary.overview}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-2 text-green-600">Top Gainers</h3>
              <div className="space-y-1">
                {marketSummary.summary.top_gainers.slice(0, 3).map((mover) => (
                  <div key={mover.symbol} className="flex justify-between text-sm">
                    <span className="font-medium">{mover.symbol}</span>
                    <span className="text-green-600">+{mover.change_percent.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2 text-red-600">Top Losers</h3>
              <div className="space-y-1">
                {marketSummary.summary.top_losers.slice(0, 3).map((mover) => (
                  <div key={mover.symbol} className="flex justify-between text-sm">
                    <span className="font-medium">{mover.symbol}</span>
                    <span className="text-red-600">{mover.change_percent.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account status */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Account Status</h2>
        <div className="grid gap-6 md:grid-cols-5">
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium text-sm" style={{ overflowWrap: 'break-word' }}>{dashboard?.email ? dashboard.email.replace('@', '\u200B@') : '—'}</p>
            {dashboard && !dashboard.email_verified && (
              <div className="mt-2 space-y-2">
                <p className="text-xs text-yellow-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Not verified
                </p>
                <button
                  onClick={handleResendVerification}
                  disabled={verificationSending || verificationCooldown > 0}
                  className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Mail className="h-3 w-3" />
                  {verificationSending
                    ? 'Sending...'
                    : verificationCooldown > 0
                      ? `Resend in ${verificationCooldown}s`
                      : 'Resend verification email'}
                </button>
                {verificationSent && (
                  <p className="text-xs text-green-600">Check your inbox!</p>
                )}
                {verificationError && (
                  <p className="text-xs text-red-600">{verificationError}</p>
                )}
              </div>
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
              {new Date().toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                timeZoneName: 'short',
              })}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Plan</p>
            <p className="font-medium">{getPlanDisplayName(entitlements?.plan_name)}</p>
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
          <Link href="/app/backtests" className="gap-2">
            <LineChart className="h-4 w-4" /> Backtests
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/app/audit" className="gap-2">
            <ClipboardList className="h-4 w-4" /> Audit Log
          </Link>
        </Button>
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

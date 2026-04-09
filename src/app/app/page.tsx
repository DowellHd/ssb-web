'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Activity,
  AlertCircle,
  BarChart3,
  Bitcoin,
  BookOpen,
  Building2,
  Calculator,
  Calendar,
  CandlestickChart,
  CheckCircle,
  ClipboardList,
  CreditCard,
  Layers,
  Leaf,
  Lightbulb,
  LineChart,
  Lock,
  Mail,
  Map,
  MessageSquare,
  Newspaper,
  PieChart,
  RefreshCw,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  Wifi,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getDashboardSummary, getCapabilities, type DashboardSummary, type Capabilities } from '@/lib/api/meta';
import { getIntelligenceEntitlements, type EntitlementsInfo } from '@/lib/api/intelligence';
import { getMarketSummary, type MarketSummaryResponse } from '@/lib/api/news';
import { resendVerification } from '@/lib/api/auth';
import { getPlanDisplayName } from '@/lib/plan-config';
import { cn } from '@/lib/utils';
import { useCommandPaletteStore } from '@/stores/command-palette-store';

// ============================================================================
// Capability map data
// ============================================================================

interface FeatureTile {
  label: string;
  description: string;
  href: string;
  icon: React.ElementType;
  tier?: 'starter' | 'pro' | 'institutional';
  isNew?: boolean;
}

interface FeatureSection {
  title: string;
  icon: React.ElementType;
  color: string;         // Tailwind accent color class
  features: FeatureTile[];
}

const CAPABILITY_MAP: FeatureSection[] = [
  {
    title: 'Analysis',
    icon: BarChart3,
    color: 'text-blue-500',
    features: [
      { label: 'Regime Analysis',      description: 'Market cycle classification',          href: '/app/regime',    icon: TrendingUp },
      { label: 'Risk Analytics',       description: 'VaR, drawdown, correlation',            href: '/app/risk',      icon: Shield },
      { label: 'Portfolio Optimizer',  description: 'Efficient frontier & Sharpe',           href: '/app/analytics', icon: BarChart3,   tier: 'starter' as const },
      { label: 'Technical Analysis',   description: '30+ indicators',                         href: '/app/analytics', icon: Activity },
      { label: 'Portfolio Management', description: 'Attribution, rebalancing, stress tests', href: '/app/portfolio', icon: PieChart,    isNew: true },
      { label: 'Correlation Analysis', description: 'Diversification & concentration risk',  href: '/app/portfolio', icon: Sparkles,    tier: 'starter' as const },
    ],
  },
  {
    title: 'AI & Predictive',
    icon: Sparkles,
    color: 'text-violet-500',
    features: [
      { label: 'GARCH Volatility',     description: 'Volatility forecast & VaR',           href: '/app/analytics', icon: Zap,         tier: 'pro',     isNew: true },
      { label: 'Anomaly Detection',    description: 'Statistical market anomalies',         href: '/app/analytics', icon: ShieldAlert, tier: 'starter', isNew: true },
      { label: 'Sentiment Analysis',   description: 'NLP on news headlines',                href: '/app/analytics', icon: Newspaper,   tier: 'pro',     isNew: true },
      { label: 'ESG Scoring',          description: 'E/S/G ratings & controversy flags',   href: '/app/analytics', icon: Leaf,        tier: 'starter', isNew: true },
      { label: 'Earnings Surprise',    description: 'Beat/miss probability model',          href: '/app/analytics', icon: Calendar,    tier: 'pro',     isNew: true },
      { label: 'Factor Analysis',      description: 'Fama-French multi-factor model',       href: '/app/analytics', icon: BarChart3,   tier: 'pro' },
    ],
  },
  {
    title: 'Trading',
    icon: CandlestickChart,
    color: 'text-emerald-500',
    features: [
      { label: 'Paper Trading',        description: 'Simulated order management',           href: '/app/paper',      icon: CandlestickChart },
      { label: 'Options Chain',        description: 'Greeks, IV, expiration viewer',        href: '/app/options',    icon: Layers,      tier: 'starter' as const },
      { label: 'Backtests',            description: 'Historical strategy testing',          href: '/app/backtests',  icon: LineChart,   tier: 'starter' as const },
      { label: 'Trade Ideas',          description: 'Signal-based idea generation',         href: '/app/trade-ideas', icon: Lightbulb,  isNew: true },
      { label: 'Order Preparation',    description: 'TCA, order tickets & broker links',    href: '/app/order-prep', icon: ClipboardList, isNew: true },
      { label: 'Broker Connections',   description: 'Read-only multi-broker dashboard',     href: '/app/brokers',    icon: Wifi,        isNew: true },
    ],
  },
  {
    title: 'Learn & Tools',
    icon: BookOpen,
    color: 'text-orange-500',
    features: [
      { label: 'Learning Hub',         description: '14 modules across 4 paths',            href: '/app/learn',       icon: BookOpen },
      { label: 'Market News',          description: 'Latest financial intelligence',         href: '/app/news',        icon: Newspaper },
      { label: 'Calculators',          description: 'Compound interest, CAGR & more',       href: '/app/calculators', icon: Calculator },
      { label: 'Style Quiz',           description: 'Discover your risk profile',           href: '/app/onboarding',  icon: UserCheck },
      { label: 'DCF Valuation',        description: 'Intrinsic value models',               href: '/app/analytics',   icon: Calculator, tier: 'pro' },
      { label: 'Roadmap',              description: "What's coming next",                    href: '/app/roadmap',     icon: Map },
    ],
  },
  {
    title: 'Community',
    icon: Users,
    color: 'text-pink-500',
    features: [
      { label: 'Social Feed',          description: 'Ideas and market discussion',          href: '/app/community',                  icon: MessageSquare },
      { label: 'Share Idea',           description: 'Post your market thesis',              href: '/app/community/ideas/new',        icon: TrendingUp },
      { label: 'Compliance Tools',     description: 'Wash sale, journal & 13F prep',        href: '/app/investment-compliance',      icon: ShieldCheck, isNew: true },
    ],
  },
  {
    title: 'Enterprise',
    icon: Building2,
    color: 'text-amber-500',
    features: [
      { label: 'Advisor CRM',          description: 'Client relationship management',       href: '/app/enterprise/advisor',     icon: Users,      tier: 'institutional' },
      { label: 'Algo Strategies',      description: 'Systematic trading strategies',        href: '/app/enterprise/strategies',  icon: TrendingUp, tier: 'institutional' },
      { label: 'Compliance Center',    description: 'Regulatory monitoring & reporting',    href: '/app/enterprise/compliance',  icon: ShieldCheck, tier: 'institutional' },
      { label: 'Webhooks',             description: 'Real-time event integration',          href: '/app/enterprise/webhooks',    icon: Zap,        tier: 'institutional' },
      { label: 'API Keys',             description: 'Programmatic access management',       href: '/app/enterprise/api-keys',    icon: Shield,     tier: 'institutional' },
      { label: 'Alternatives',         description: 'Private equity & hedge fund data',     href: '/app/enterprise/alternatives', icon: Layers,    tier: 'institutional' },
    ],
  },
];

const TIER_LABEL: Record<string, string> = {
  starter: 'Starter',
  pro: 'Pro',
  institutional: 'Enterprise',
};

const TIER_BADGE: Record<string, string> = {
  starter:       'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  pro:           'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400',
  institutional: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
};

function canAccessTier(tier: string, planName: string | undefined): boolean {
  const plan = (planName ?? 'free').toLowerCase();
  if (['founder', 'full_access', 'institutional'].includes(plan)) return true;
  if (plan === 'pro') return tier === 'starter' || tier === 'pro';
  if (plan === 'starter') return tier === 'starter';
  return false;
}

// ============================================================================
// Sub-components
// ============================================================================

function FeatureTileCard({ feature, planName }: { feature: FeatureTile; planName: string | undefined }) {
  const Icon = feature.icon;
  const locked = feature.tier ? !canAccessTier(feature.tier, planName) : false;

  return (
    <Link
      href={feature.href}
      className={cn(
        'group flex items-center gap-3 rounded-lg border p-3 transition-all',
        locked
          ? 'bg-muted/20 hover:bg-muted/30 hover:border-border/80'
          : 'bg-card/50 hover:border-primary/40 hover:bg-card',
      )}
    >
      <Icon className={cn(
        'h-4 w-4 shrink-0 transition-colors',
        locked ? 'text-muted-foreground/40' : 'text-muted-foreground group-hover:text-primary',
      )} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className={cn('text-sm font-medium leading-tight truncate', locked && 'text-muted-foreground/60')}>
            {feature.label}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {feature.isNew && !locked && (
              <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                NEW
              </span>
            )}
            {locked && feature.tier && (
              <span className={cn('flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase', TIER_BADGE[feature.tier])}>
                <Lock className="h-2.5 w-2.5" />
                {TIER_LABEL[feature.tier]}
              </span>
            )}
          </div>
        </div>
        <p className={cn('mt-0.5 text-xs leading-tight', locked ? 'text-muted-foreground/40' : 'text-muted-foreground')}>
          {feature.description}
        </p>
      </div>
    </Link>
  );
}

function CapabilitySection({ section, planName }: { section: FeatureSection; planName: string | undefined }) {
  const Icon = section.icon;
  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center gap-2.5 border-b px-4 py-3">
        <Icon className={cn('h-4 w-4', section.color)} />
        <h3 className="font-semibold text-sm">{section.title}</h3>
        <span className="ml-auto text-xs text-muted-foreground">
          {section.features.length} tools
        </span>
      </div>
      <div className="grid grid-cols-1 gap-1.5 p-3 sm:grid-cols-2">
        {section.features.map((f) => (
          <FeatureTileCard key={f.href + f.label} feature={f} planName={planName} />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Dashboard page
// ============================================================================

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

  const openPalette = useCommandPaletteStore((s) => s.openPalette);

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

      try {
        const summaryData = await getMarketSummary();
        setMarketSummary(summaryData);
      } catch {
        // Market summary is optional
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (verificationCooldown > 0) {
      const timer = setTimeout(() => setVerificationCooldown((c) => c - 1), 1000);
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
      setVerificationCooldown(30);
      toast.success('Verification email sent! Check your inbox.');
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Failed to send verification email';
      setVerificationError(msg);
      toast.error(msg);
    } finally {
      setVerificationSending(false);
    }
  };

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
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome{dashboard?.full_name ? `, ${dashboard.full_name.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-muted-foreground mt-1">
            {getPlanDisplayName(entitlements?.plan_name)} plan
            {entitlements?.can_upgrade && (
              <> &middot; <Link href="/app/billing" className="text-primary hover:underline">Upgrade for more</Link></>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={openPalette} className="gap-2 hidden sm:flex">
            <Search className="h-3.5 w-3.5" />
            Search features
            <kbd className="ml-1 hidden sm:inline-flex h-4 items-center rounded border bg-muted px-1 text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </Button>
          <Button onClick={loadData} variant="ghost" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Email verification banner */}
      {dashboard && !dashboard.email_verified && (
        <div className="flex items-start gap-3 rounded-lg border border-yellow-300 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30 p-4">
          <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
          <div className="flex-1 text-sm">
            <p className="font-medium text-yellow-800 dark:text-yellow-400">Email not verified</p>
            <p className="text-yellow-700 dark:text-yellow-500 text-xs mt-0.5">
              Verify your email to unlock all features.
            </p>
          </div>
          <button
            onClick={handleResendVerification}
            disabled={verificationSending || verificationCooldown > 0}
            className="shrink-0 inline-flex items-center gap-1.5 text-xs bg-yellow-600 text-white px-3 py-1.5 rounded hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Mail className="h-3 w-3" />
            {verificationSending ? 'Sending…' : verificationCooldown > 0 ? `Resend in ${verificationCooldown}s` : 'Resend'}
          </button>
          {verificationSent && <p className="text-xs text-green-600">Sent!</p>}
          {verificationError && <p className="text-xs text-red-600">{verificationError}</p>}
        </div>
      )}

      {/* Quick stats row */}
      <div className="grid grid-cols-2 gap-3">
        <QuickStat label="Backtests" value={String(dashboard?.backtests_count ?? 0)} icon={LineChart} />
        <QuickStat
          label="Risk Level"
          value={entitlements?.risk_analytics_level ?? 'basic'}
          icon={Shield}
          accent="text-emerald-500"
          capitalize
        />
      </div>

      {/* Market summary — compact */}
      {marketSummary && (
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-sm">Daily Market Summary</span>
              {marketSummary.is_delayed && (
                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                  {marketSummary.delay_minutes}min delay
                </span>
              )}
            </div>
            <Link href="/app/news" className="text-xs text-primary hover:underline">
              All news →
            </Link>
          </div>
          <p className="text-sm font-medium mb-3">{marketSummary.summary.headline}</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-green-600 mb-1.5">Top Gainers</p>
              <div className="space-y-1">
                {marketSummary.summary.top_gainers.slice(0, 3).map((m) => (
                  <div key={m.symbol} className="flex justify-between text-xs">
                    <span className="font-medium">{m.symbol}</span>
                    <span className="text-green-600">+{m.change_percent.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-red-600 mb-1.5">Top Losers</p>
              <div className="space-y-1">
                {marketSummary.summary.top_losers.slice(0, 3).map((m) => (
                  <div key={m.symbol} className="flex justify-between text-xs">
                    <span className="font-medium">{m.symbol}</span>
                    <span className="text-red-600">{m.change_percent.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Capability Map ──────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Platform Capabilities</h2>
          <button
            onClick={openPalette}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            Search
            <kbd className="hidden sm:inline-flex h-4 items-center rounded border bg-muted px-1.5 text-[10px] font-medium">
              ⌘K
            </kbd>
          </button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {CAPABILITY_MAP.map((section) => (
            <CapabilitySection key={section.title} section={section} planName={entitlements?.plan_name} />
          ))}
        </div>
      </div>

      {/* Account status — collapsed to a single row */}
      <div className="rounded-xl border bg-card p-4">
        <h3 className="text-sm font-semibold mb-3">Account Status</h3>
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
          <AccountStat label="Plan" value={getPlanDisplayName(entitlements?.plan_name)} />
          <AccountStat
            label="Email"
            value={dashboard?.email_verified ? 'Verified' : 'Unverified'}
            valueClass={dashboard?.email_verified ? 'text-green-600' : 'text-yellow-600'}
            icon={dashboard?.email_verified ? CheckCircle : AlertCircle}
          />
          <AccountStat
            label="MFA"
            value={dashboard?.mfa_enabled ? 'Enabled' : 'Disabled'}
            valueClass={dashboard?.mfa_enabled ? 'text-green-600' : 'text-muted-foreground'}
            icon={dashboard?.mfa_enabled ? ShieldCheck : undefined}
          />
          <AccountStat
            label="Member Since"
            value={dashboard?.member_since ? new Date(dashboard.member_since).toLocaleDateString() : '—'}
          />
          <div className="flex items-center gap-3 ml-auto">
            <Button asChild variant="ghost" size="sm">
              <Link href="/app/settings" className="gap-1.5">
                <Settings className="h-3.5 w-3.5" /> Settings
              </Link>
            </Button>
            {entitlements?.can_upgrade && (
              <Button asChild variant="outline" size="sm">
                <Link href="/app/billing">Upgrade Plan</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 p-4 text-sm text-slate-800 dark:text-amber-200">
        <strong>Important:</strong> This platform is a read-only analytical tool. It does not execute trades,
        provide buy/sell recommendations, or guarantee profits. All outputs are for educational and
        informational purposes only.
      </div>
    </div>
  );
}

// ── Small helpers ──────────────────────────────────────────────────────────────

function QuickStat({
  label,
  value,
  icon: Icon,
  accent = 'text-muted-foreground',
  capitalize = false,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  accent?: string;
  capitalize?: boolean;
}) {
  return (
    <div className="rounded-lg border bg-card p-4 flex items-center gap-3">
      <Icon className={cn('h-5 w-5 shrink-0', accent)} />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn('font-bold text-lg tabular-nums leading-tight', capitalize && 'capitalize')}>
          {value}
        </p>
      </div>
    </div>
  );
}

function AccountStat({
  label,
  value,
  valueClass,
  icon: Icon,
}: {
  label: string;
  value: string;
  valueClass?: string;
  icon?: React.ElementType;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('font-medium flex items-center gap-1', valueClass)}>
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {value}
      </p>
    </div>
  );
}

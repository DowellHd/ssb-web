'use client';

import Link from 'next/link';
import {
  Webhook,
  Key,
  Users,
  BarChart3,
  Bot,
  FileText,
  Lock,
  ChevronRight,
  Building2,
  TrendingUp,
  Shield,
} from 'lucide-react';

interface EnterpriseFeature {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  badge: string;
  requiredTier: 'pro' | 'institutional';
  available: boolean;
}

const FEATURES: EnterpriseFeature[] = [
  {
    icon: Bot,
    title: 'Algorithmic Strategies',
    description: 'Build and backtest rule-based trading strategies using 5 professional templates.',
    href: '/app/enterprise/strategies',
    badge: 'Pro',
    requiredTier: 'pro',
    available: true,
  },
  {
    icon: BarChart3,
    title: 'Alternative Investments',
    description: 'Track REITs, commodities, forex, private equity, DeFi yield, and more in one portfolio.',
    href: '/app/enterprise/alternatives',
    badge: 'Pro',
    requiredTier: 'pro',
    available: true,
  },
  {
    icon: Webhook,
    title: 'Webhooks',
    description: 'Receive real-time event notifications via HTTPS with HMAC-signed payloads.',
    href: '/app/enterprise/webhooks',
    badge: 'Pro',
    requiredTier: 'pro',
    available: true,
  },
  {
    icon: Key,
    title: 'API Keys',
    description: 'Generate scoped API keys for programmatic access and third-party integrations.',
    href: '/app/enterprise/api-keys',
    badge: 'Institutional',
    requiredTier: 'institutional',
    available: true,
  },
  {
    icon: Users,
    title: 'Advisor Platform',
    description: 'Manage client portfolios, create model portfolios, and track AUM across all clients.',
    href: '/app/enterprise/advisor',
    badge: 'Institutional',
    requiredTier: 'institutional',
    available: true,
  },
  {
    icon: FileText,
    title: 'Compliance Reports',
    description: 'Export detailed audit logs and compliance reports for regulatory purposes.',
    href: '/app/enterprise/compliance',
    badge: 'Institutional',
    requiredTier: 'institutional',
    available: true,
  },
];

const TIER_COLORS: Record<string, string> = {
  Pro: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  Institutional: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
};

export default function EnterprisePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Building2 className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Enterprise</h1>
              <p className="text-sm text-muted-foreground">
                Professional tools for institutional investors and financial advisors.
              </p>
            </div>
          </div>
        </div>

        {/* Feature grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.href}
                href={feature.href}
                className="group relative flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-border/80 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-muted p-2.5">
                    <Icon className="h-5 w-5 text-foreground/70" />
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TIER_COLORS[feature.badge]}`}>
                    {feature.badge}
                  </span>
                </div>

                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold leading-tight">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                  <span>Open</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Upgrade callout */}
        <div className="rounded-xl border border-border bg-gradient-to-br from-purple-500/5 to-blue-500/5 p-6 flex items-start gap-4">
          <div className="p-2 rounded-lg bg-purple-500/10 shrink-0">
            <Shield className="h-5 w-5 text-purple-400" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold">Institutional-grade access</h3>
            <p className="text-sm text-muted-foreground">
              API keys, advisor client management, and compliance reports are available on the{' '}
              <strong>Institutional</strong> plan. Algorithmic strategies, alternative investments,
              and webhooks are available on <strong>Pro</strong> and above.
            </p>
            <Link
              href="/app/billing"
              className="inline-flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors mt-2"
            >
              View plans
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

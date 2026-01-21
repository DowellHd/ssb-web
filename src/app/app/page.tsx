'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Shield,
  LineChart,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCurrentUser, type User } from '@/lib/api/auth';

export default function AppDashboardPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getCurrentUser().then(setUser).catch(() => {});
  }, []);

  const features = [
    {
      title: 'Regime Analysis',
      description: 'Market regime classification with confidence scores',
      icon: TrendingUp,
      href: '/app/regime',
      color: 'text-blue-500',
      available: true,
    },
    {
      title: 'Risk Analytics',
      description: 'Portfolio risk metrics and VaR analysis',
      icon: Shield,
      href: '/app/risk',
      color: 'text-green-500',
      available: false,
    },
    {
      title: 'Backtesting',
      description: 'Strategy simulation with historical data',
      icon: LineChart,
      href: '/app/backtests',
      color: 'text-purple-500',
      available: false,
    },
    {
      title: 'Stress Testing',
      description: 'Portfolio stress scenarios and impact analysis',
      icon: AlertTriangle,
      href: '/app/stress',
      color: 'text-orange-500',
      available: false,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Your AI-powered financial intelligence dashboard
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="rounded-lg border bg-card p-6 relative overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={cn('p-2 rounded-lg bg-muted', feature.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {feature.description}
              </p>
              {feature.available ? (
                <Button asChild size="sm" variant="outline">
                  <Link href={feature.href} className="gap-2">
                    Open <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  Coming Soon
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Account status */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Account Status</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{user?.email || '—'}</p>
            {user && !user.email_verified && (
              <p className="text-xs text-yellow-600 mt-1">Not verified</p>
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Plan</p>
            <p className="font-medium capitalize">{user?.role || 'Free'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">MFA</p>
            <p className="font-medium">
              {user?.mfa_enabled ? (
                <span className="text-green-600">Enabled</span>
              ) : (
                <span className="text-muted-foreground">Disabled</span>
              )}
            </p>
          </div>
        </div>
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

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

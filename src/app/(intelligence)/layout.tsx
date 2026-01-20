'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  TrendingUp,
  Shield,
  AlertTriangle,
  LineChart,
  ChevronLeft,
} from 'lucide-react';
import { IntelligenceProvider } from '@/contexts/intelligence-context';
import { DemoBanner, TierNotice } from '@/components/intelligence';
import { cn } from '@/lib/utils';

const navItems = [
  {
    href: '/intelligence',
    label: 'Overview',
    icon: BarChart3,
  },
  {
    href: '/intelligence/regime',
    label: 'Regime Analysis',
    icon: TrendingUp,
  },
  {
    href: '/intelligence/risk',
    label: 'Risk Analytics',
    icon: Shield,
  },
  {
    href: '/intelligence/stress',
    label: 'Stress Testing',
    icon: AlertTriangle,
  },
  {
    href: '/intelligence/simulations',
    label: 'Simulations',
    icon: LineChart,
  },
];

function IntelligenceNavigation() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide">
      {navItems.map((item) => {
        const isActive =
          item.href === '/intelligence'
            ? pathname === '/intelligence'
            : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function IntelligenceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <IntelligenceProvider>
        <div className="min-h-screen bg-background">
          <DemoBanner />

          {/* Header */}
          <header className="border-b">
            <div className="container mx-auto px-4">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center gap-4">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <div className="h-4 w-px bg-border" />
                  <h1 className="text-lg font-semibold">Intelligence</h1>
                </div>
              </div>

              {/* Navigation tabs */}
              <div className="py-2">
                <IntelligenceNavigation />
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="container mx-auto px-4 py-6">
            {/* Tier notice for free users */}
            <TierNotice className="mb-6" />
            {children}
          </main>
        </div>
      </IntelligenceProvider>
    </Suspense>
  );
}

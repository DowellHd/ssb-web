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
} from 'lucide-react';
import { IntelligenceProvider } from '@/contexts/intelligence-context';
import { TierNotice } from '@/components/intelligence';
import { cn } from '@/lib/utils';

const navItems = [
  {
    href: '/app/intelligence',
    label: 'Overview',
    icon: BarChart3,
  },
  {
    href: '/app/intelligence/regime',
    label: 'Regime Analysis',
    icon: TrendingUp,
  },
  {
    href: '/app/intelligence/risk',
    label: 'Risk Analytics',
    icon: Shield,
  },
  {
    href: '/app/intelligence/stress',
    label: 'Stress Testing',
    icon: AlertTriangle,
  },
  {
    href: '/app/intelligence/simulations',
    label: 'Simulations',
    icon: LineChart,
  },
];

function IntelligenceNavigation() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide border-b mb-6">
      {navItems.map((item) => {
        const isActive =
          item.href === '/app/intelligence'
            ? pathname === '/app/intelligence'
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
        <TierNotice className="mb-4" />
        <IntelligenceNavigation />
        {children}
      </IntelligenceProvider>
    </Suspense>
  );
}

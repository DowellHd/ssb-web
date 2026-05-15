'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  BookOpen,
  CandlestickChart,
  LayoutDashboard,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS: { href: string; label: string; icon: React.ElementType; exact?: boolean }[] = [
  { href: '/app',        label: 'Home',     icon: LayoutDashboard, exact: true },
  { href: '/app/regime', label: 'Analysis', icon: BarChart3 },
  { href: '/app/paper',  label: 'Trading',  icon: CandlestickChart },
  { href: '/app/learn',  label: 'Learn',    icon: BookOpen },
];

interface MobileNavProps {
  onMenuOpen: () => void;
}

export function MobileNav({ onMenuOpen }: MobileNavProps) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Mobile navigation"
    >
      <ul className="flex h-14 items-stretch">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-full flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors',
                  active
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 transition-transform',
                    active && 'scale-110',
                  )}
                />
                {label}
              </Link>
            </li>
          );
        })}

        {/* More — opens the sidebar */}
        <li className="flex-1">
          <button
            onClick={onMenuOpen}
            aria-label="Open menu"
            className="flex h-full w-full flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Menu className="h-5 w-5" />
            More
          </button>
        </li>
      </ul>
    </nav>
  );
}

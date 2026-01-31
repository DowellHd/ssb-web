'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  TrendingUp,
  Shield,
  AlertTriangle,
  LineChart,
  ClipboardList,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Crown,
  CandlestickChart,
} from 'lucide-react';
import { ChatBubble } from '@/components/assistant';
import { Button } from '@/components/ui/button';
import { getCurrentUser, logout, type User } from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { PLAN_CONFIG } from '@/lib/plan-config';
import { useAssistantStore } from '@/stores/assistant-store';

const navItems = [
  { href: '/app', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/app/regime', label: 'Regime Analysis', icon: TrendingUp },
  { href: '/app/risk', label: 'Risk Analytics', icon: Shield },
  { href: '/app/paper', label: 'Paper Trading', icon: CandlestickChart },
  { href: '/app/backtests', label: 'Backtests', icon: LineChart },
  { href: '/app/audit', label: 'Audit Log', icon: ClipboardList },
  { href: '/app/billing', label: 'Billing', icon: CreditCard },
  { href: '/app/settings', label: 'Settings', icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync page context with assistant store
  const setCurrentPage = useAssistantStore((state) => state.setCurrentPage);
  const setUserTier = useAssistantStore((state) => state.setUserTier);

  useEffect(() => {
    loadUser();
  }, []);

  // Update assistant context when page changes
  useEffect(() => {
    setCurrentPage(pathname);
  }, [pathname, setCurrentPage]);

  // Update assistant context when user tier is known
  useEffect(() => {
    if (user) {
      // For now, default to free unless founder. Full tier detection can be added via billing API
      const tier = user.is_founder ? 'founder' : 'free';
      setUserTier(tier);
    }
  }, [user, setUserTier]);

  const loadUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      toast.error('Please sign in to continue');
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isActive = (href: string) => {
    if (href === '/app') {
      return pathname === '/app';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 bg-card border-r transform transition-transform duration-200 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b px-4">
            <Link href="/app" className="font-bold text-lg">
              SSB
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                        active
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User section */}
          <div className="border-t p-4">
            <div className="mb-3 px-3">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">{user.full_name || user.email}</p>
                {user.is_founder && (
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${PLAN_CONFIG.founder.badgeClassName}`}>
                    <Crown className="h-3 w-3" />
                    {PLAN_CONFIG.founder.badgeLabel}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar (mobile) */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur px-4 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-bold">Smart Strategies Builder</span>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>

      {/* SSB Assistant Chat Widget */}
      <ChatBubble />
    </div>
  );
}

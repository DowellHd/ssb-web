'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  AlertTriangle,
  BarChart3,
  Bitcoin,
  BookOpen,
  Calculator,
  CandlestickChart,
  ChevronDown,
  ClipboardList,
  CreditCard,
  Crown,
  FileText,
  History,
  LayoutDashboard,
  Layers,
  LineChart,
  LogOut,
  Map,
  Menu,
  MessageSquare,
  MoreHorizontal,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { ChatBubble } from '@/components/assistant';
import { BRAND_NAME_TM } from '@/components/ui/brand-name';
import { Button } from '@/components/ui/button';
import { getCurrentUser, logout, type User } from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { PLAN_CONFIG } from '@/lib/plan-config';
import { useAssistantStore } from '@/stores/assistant-store';
import { usePlanStore } from '@/stores/plan-store';

// ============================================================================
// Nav data
// ============================================================================

const ANALYSIS_CHILDREN = [
  { href: '/app/regime', label: 'Regime Analysis', icon: TrendingUp },
  { href: '/app/risk', label: 'Risk Analytics', icon: Shield },
  { href: '/app/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/app/screening', label: 'Screener', icon: Search },
];

const TRADING_CHILDREN = [
  { href: '/app/paper', label: 'Paper Trading', icon: CandlestickChart },
  { href: '/app/options', label: 'Options', icon: Layers },
  { href: '/app/crypto', label: 'Crypto', icon: Bitcoin },
];

const LEARN_CHILDREN = [
  { href: '/app/learn', label: 'Learning Hub', icon: BookOpen },
  { href: '/app/onboarding', label: 'Investment Style Quiz', icon: UserCheck },
  { href: '/app/calculators', label: 'Calculators', icon: Calculator },
];

const COMMUNITY_CHILDREN = [
  { href: '/app/community', label: 'Feed', icon: MessageSquare },
  { href: '/app/community/ideas/new', label: 'Share Idea', icon: TrendingUp },
  { href: '/app/community/watchlists', label: 'Watchlists', icon: BookOpen },
  { href: '/app/community/clubs', label: 'Clubs', icon: Users },
];

const MORE_CHILDREN = [
  { href: '/app/backtests', label: 'Backtests', icon: LineChart },
  { href: '/app/audit', label: 'Audit Log', icon: ClipboardList },
  { href: '/app/changelog', label: 'Changelog', icon: History },
  { href: '/app/roadmap', label: 'Roadmap', icon: Map },
];

const ACCOUNT_ITEMS = [
  { href: '/app/billing', label: 'Billing', icon: CreditCard },
  { href: '/app/settings', label: 'Settings', icon: Settings },
];

// ============================================================================
// NavLink — single leaf item
// ============================================================================

interface NavLinkProps {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  indent?: boolean;
  onClick?: () => void;
}

function NavLink({ href, label, icon: Icon, active, indent = false, onClick }: NavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 text-sm transition-colors',
        indent ? 'py-2 ml-3 pl-3 border-l border-border' : 'py-2.5',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
      aria-current={active ? 'page' : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  );
}

// ============================================================================
// NavGroup — expandable section with child links
// ============================================================================

interface NavGroupProps {
  label: string;
  icon: React.ElementType;
  items: { href: string; label: string; icon: React.ElementType }[];
  isOpen: boolean;
  hasActiveChild: boolean;
  onToggle: () => void;
  isActive: (href: string) => boolean;
  onNavClick: () => void;
}

function NavGroup({
  label,
  icon: Icon,
  items,
  isOpen,
  hasActiveChild,
  onToggle,
  isActive,
  onNavClick,
}: NavGroupProps) {
  return (
    <li>
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
          hasActiveChild && !isOpen
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">{label}</span>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      {/* Children — animated with max-height */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0',
        )}
        aria-hidden={!isOpen}
      >
        <ul className="mt-1 space-y-0.5 pb-2">
          {items.map((item) => (
            <li key={item.href}>
              <NavLink
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={isActive(item.href)}
                indent
                onClick={onNavClick}
              />
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

// ============================================================================
// UserMenu — bottom profile area with dropdown
// ============================================================================

interface UserMenuProps {
  user: User;
  onLogout: () => void;
  isActive: (href: string) => boolean;
  onNavClick: () => void;
}

function UserMenu({ user, onLogout, isActive, onNavClick }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative border-t p-3">
      {/* Dropdown panel — renders above the trigger */}
      {open && (
        <div className="absolute bottom-full left-3 right-3 mb-1 rounded-lg border bg-popover shadow-lg overflow-hidden">
          {ACCOUNT_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => { setOpen(false); onNavClick(); }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 text-sm transition-colors',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-muted',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
          <div className="border-t" />
          <button
            onClick={() => { setOpen(false); onLogout(); }}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </div>
      )}

      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Account menu"
        className="flex w-full items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted transition-colors group"
      >
        {/* Avatar initials */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
          {(user.full_name || user.email).charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium truncate leading-tight">
              {user.full_name || user.email}
            </p>
            {user.is_founder && (
              <span
                className={cn(
                  'shrink-0 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                  PLAN_CONFIG.founder.badgeClassName,
                )}
              >
                <Crown className="h-2.5 w-2.5" />
                {PLAN_CONFIG.founder.badgeLabel}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate leading-tight">{user.email}</p>
        </div>

        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>
    </div>
  );
}

// ============================================================================
// Sidebar content
// ============================================================================

interface SidebarProps {
  user: User;
  pathname: string;
  onClose: () => void;
  onLogout: () => void;
}

function Sidebar({ user, pathname, onClose, onLogout }: SidebarProps) {
  const isActive = (href: string) => {
    if (href === '/app') return pathname === '/app';
    return pathname.startsWith(href);
  };

  const analysisActive = ANALYSIS_CHILDREN.some((c) => isActive(c.href));
  const tradingActive = TRADING_CHILDREN.some((c) => isActive(c.href));
  const learnActive = LEARN_CHILDREN.some((c) => isActive(c.href));
  const communityActive = pathname.startsWith('/app/community');
  const moreActive = MORE_CHILDREN.some((c) => isActive(c.href));

  // Auto-expand the section that contains the current route
  const [analysisOpen, setAnalysisOpen] = useState(analysisActive);
  const [tradingOpen, setTradingOpen] = useState(tradingActive);
  const [learnOpen, setLearnOpen] = useState(learnActive);
  const [communityOpen, setCommunityOpen] = useState(communityActive);
  const [moreOpen, setMoreOpen] = useState(moreActive);

  useEffect(() => {
    if (analysisActive) setAnalysisOpen(true);
    if (tradingActive) setTradingOpen(true);
    if (learnActive) setLearnOpen(true);
    if (communityActive) setCommunityOpen(true);
    if (moreActive) setMoreOpen(true);
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        <Link href="/app" className="font-bold text-lg" onClick={onClose}>
          SSB
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3" aria-label="Main navigation">
        <ul className="space-y-1">
          {/* Dashboard */}
          <li>
            <NavLink
              href="/app"
              label="Dashboard"
              icon={LayoutDashboard}
              active={isActive('/app')}
              onClick={onClose}
            />
          </li>

          {/* Analysis group */}
          <NavGroup
            label="Analysis"
            icon={BarChart3}
            items={ANALYSIS_CHILDREN}
            isOpen={analysisOpen}
            hasActiveChild={analysisActive}
            onToggle={() => setAnalysisOpen((v) => !v)}
            isActive={isActive}
            onNavClick={onClose}
          />

          {/* Trading group */}
          <NavGroup
            label="Trading"
            icon={CandlestickChart}
            items={TRADING_CHILDREN}
            isOpen={tradingOpen}
            hasActiveChild={tradingActive}
            onToggle={() => setTradingOpen((v) => !v)}
            isActive={isActive}
            onNavClick={onClose}
          />

          {/* Learn & Tools group */}
          <NavGroup
            label="Learn & Tools"
            icon={BookOpen}
            items={LEARN_CHILDREN}
            isOpen={learnOpen}
            hasActiveChild={learnActive}
            onToggle={() => setLearnOpen((v) => !v)}
            isActive={isActive}
            onNavClick={onClose}
          />

          {/* Community group */}
          <NavGroup
            label="Community"
            icon={Users}
            items={COMMUNITY_CHILDREN}
            isOpen={communityOpen}
            hasActiveChild={communityActive}
            onToggle={() => setCommunityOpen((v) => !v)}
            isActive={isActive}
            onNavClick={onClose}
          />

          {/* More group */}
          <NavGroup
            label="More"
            icon={MoreHorizontal}
            items={MORE_CHILDREN}
            isOpen={moreOpen}
            hasActiveChild={moreActive}
            onToggle={() => setMoreOpen((v) => !v)}
            isActive={isActive}
            onNavClick={onClose}
          />

          {/* Admin — founder / admin role only */}
          {(user.is_founder || user.role === 'admin') && (
            <li>
              <NavLink
                href="/app/admin"
                label="Admin"
                icon={ShieldCheck}
                active={isActive('/app/admin')}
                onClick={onClose}
              />
            </li>
          )}
        </ul>
      </nav>

      {/* Legal footer */}
      <div className="border-t px-4 py-3">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <a
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <FileText className="h-3 w-3" />
            Terms
          </a>
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <ShieldCheck className="h-3 w-3" />
            Privacy
          </a>
          <a
            href="/disclaimer"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <AlertTriangle className="h-3 w-3" />
            Disclaimer
          </a>
        </div>
      </div>

      {/* User menu with dropdown */}
      <UserMenu
        user={user}
        onLogout={onLogout}
        isActive={isActive}
        onNavClick={onClose}
      />
    </div>
  );
}

// ============================================================================
// Layout
// ============================================================================

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const setCurrentPage = useAssistantStore((state) => state.setCurrentPage);
  const setUserTier = useAssistantStore((state) => state.setUserTier);
  const fetchEntitlements = usePlanStore((state) => state.fetchEntitlements);
  const normalizedPlan = usePlanStore((state) => state.normalized);

  useEffect(() => {
    loadUser();
    fetchEntitlements();
  }, [fetchEntitlements]);

  useEffect(() => {
    setCurrentPage(pathname);
  }, [pathname, setCurrentPage]);

  useEffect(() => {
    if (normalizedPlan.plan) {
      setUserTier(normalizedPlan.plan);
    }
  }, [normalizedPlan.plan, setUserTier]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const loadUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch {
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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 bg-card border-r transform transition-transform duration-200 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Sidebar"
      >
        <Sidebar
          user={user}
          pathname={pathname}
          onClose={() => setSidebarOpen(false)}
          onLogout={handleLogout}
        />
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur px-4 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-bold">{BRAND_NAME_TM}</span>
        </header>

        <main className="p-6">{children}</main>
      </div>

      <ChatBubble />
    </div>
  );
}

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
  Building2,
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
import { CommandPalette } from '@/components/command-palette';
import { BRAND_NAME_TM } from '@/components/ui/brand-name';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/user-avatar';
import { getCurrentUser, logout, type User } from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { PLAN_CONFIG } from '@/lib/plan-config';
import { useAssistantStore } from '@/stores/assistant-store';
import { usePlanStore } from '@/stores/plan-store';
import { useCommandPaletteStore } from '@/stores/command-palette-store';

// ============================================================================
// Nav data
// ============================================================================

const ANALYSIS_CHILDREN = [
  { href: '/app/regime',    label: 'Regime Analysis',  icon: TrendingUp },
  { href: '/app/risk',      label: 'Risk Analytics',   icon: Shield },
  { href: '/app/analytics', label: 'Analytics',        icon: BarChart3 },
  { href: '/app/screening', label: 'Screener',         icon: Search },
];

const TRADING_CHILDREN = [
  { href: '/app/paper',     label: 'Paper Trading', icon: CandlestickChart },
  { href: '/app/backtests', label: 'Backtests',     icon: LineChart },
  { href: '/app/options',   label: 'Options',       icon: Layers },
  { href: '/app/crypto',    label: 'Crypto',        icon: Bitcoin },
];

const LEARN_CHILDREN = [
  { href: '/app/learn',       label: 'Learning Hub',          icon: BookOpen },
  { href: '/app/onboarding',  label: 'Investment Style Quiz', icon: UserCheck },
  { href: '/app/calculators', label: 'Calculators',           icon: Calculator },
];

const COMMUNITY_CHILDREN = [
  { href: '/app/community',           label: 'Feed',        icon: MessageSquare },
  { href: '/app/community/ideas/new', label: 'Share Idea',  icon: TrendingUp },
];

const ENTERPRISE_CHILDREN = [
  { href: '/app/enterprise/advisor',     label: 'Advisor CRM',    icon: Users },
  { href: '/app/enterprise/alternatives',label: 'Alternatives',   icon: BarChart3 },
  { href: '/app/enterprise/strategies',  label: 'Algo Strategies',icon: TrendingUp },
  { href: '/app/enterprise/webhooks',    label: 'Webhooks',       icon: FileText },
  { href: '/app/enterprise/api-keys',    label: 'API Keys',       icon: Shield },
  { href: '/app/enterprise/compliance',  label: 'Compliance',     icon: ShieldCheck },
];

// Items shown only in the UserMenu dropdown
const USER_MENU_ITEMS = [
  { href: '/app/settings', label: 'Settings', icon: Settings },
  { href: '/app/billing',  label: 'Billing',  icon: CreditCard },
];

// Secondary / utility links — collapsed under "More"
const MORE_CHILDREN = [
  { href: '/app/audit',     label: 'Audit Log', icon: ClipboardList },
  { href: '/app/changelog', label: 'Changelog', icon: History },
  { href: '/app/roadmap',   label: 'Roadmap',   icon: Map },
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
  badge?: string;    // e.g. "NEW"
  onClick?: () => void;
}

function NavLink({ href, label, icon: Icon, active, indent = false, badge, onClick }: NavLinkProps) {
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
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
          {badge}
        </span>
      )}
    </Link>
  );
}

// ============================================================================
// NavGroup — expandable section with child links
// ============================================================================

interface NavGroupProps {
  label: string;
  icon: React.ElementType;
  items: { href: string; label: string; icon: React.ElementType; badge?: string }[];
  isOpen: boolean;
  hasActiveChild: boolean;
  onToggle: () => void;
  isActive: (href: string) => boolean;
  onNavClick: () => void;
  count?: number;
}

function NavGroup({
  label, icon: Icon, items, isOpen, hasActiveChild,
  onToggle, isActive, onNavClick, count,
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
        {count !== undefined && !isOpen && (
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {count}
          </span>
        )}
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          isOpen ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0',
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
                badge={item.badge}
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

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative border-t p-3">
      {open && (
        <div className="absolute bottom-full left-3 right-3 mb-1 rounded-lg border bg-popover shadow-lg overflow-hidden">
          {USER_MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => { setOpen(false); onNavClick(); }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 text-sm transition-colors',
                  isActive(item.href) ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
          {(user.is_founder || user.role === 'admin') && (
            <Link
              href="/app/admin"
              onClick={() => { setOpen(false); onNavClick(); }}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 text-sm transition-colors',
                isActive('/app/admin') ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted',
              )}
            >
              <ShieldCheck className="h-4 w-4 shrink-0" />
              Admin
            </Link>
          )}
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

      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Account menu"
        className="flex w-full items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted transition-colors"
      >
        <UserAvatar avatarUrl={user.avatar_url} name={user.full_name || user.email} size={32} />
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium truncate leading-tight">
              {user.full_name || user.email}
            </p>
            {user.is_founder && (
              <span className={cn('shrink-0 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold', PLAN_CONFIG.founder.badgeClassName)}>
                <Crown className="h-2.5 w-2.5" />
                {PLAN_CONFIG.founder.badgeLabel}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate leading-tight">{user.email}</p>
        </div>
        <ChevronDown className={cn('h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200', open && 'rotate-180')} />
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
  const openPalette = useCommandPaletteStore((s) => s.openPalette);

  const isActive = (href: string) => {
    if (href === '/app') return pathname === '/app';
    return pathname.startsWith(href);
  };

  const analysisActive   = ANALYSIS_CHILDREN.some((c) => isActive(c.href));
  const tradingActive    = TRADING_CHILDREN.some((c) => isActive(c.href));
  const learnActive      = LEARN_CHILDREN.some((c) => isActive(c.href));
  const communityActive  = pathname.startsWith('/app/community');
  const moreActive       = MORE_CHILDREN.some((c) => isActive(c.href));
  const enterpriseActive = pathname.startsWith('/app/enterprise');

  const [analysisOpen,  setAnalysisOpen]  = useState(analysisActive);
  const [tradingOpen,   setTradingOpen]   = useState(tradingActive);
  const [learnOpen,     setLearnOpen]     = useState(learnActive);
  const [communityOpen, setCommunityOpen] = useState(communityActive);
  const [moreOpen,      setMoreOpen]      = useState(moreActive);
  const [enterpriseOpen,setEnterpriseOpen]= useState(enterpriseActive);

  useEffect(() => {
    if (analysisActive)   setAnalysisOpen(true);
    if (tradingActive)    setTradingOpen(true);
    if (learnActive)      setLearnOpen(true);
    if (communityActive)  setCommunityOpen(true);
    if (moreActive)       setMoreOpen(true);
    if (enterpriseActive) setEnterpriseOpen(true);
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        <Link href="/app" className="font-bold text-lg" onClick={onClose}>
          SSB
        </Link>
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose} aria-label="Close menu">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Search / Command palette trigger */}
      <div className="px-3 pt-3 pb-1">
        <button
          onClick={() => { openPalette(); onClose(); }}
          className="flex w-full items-center gap-2.5 rounded-lg border bg-muted/50 px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1 text-left text-xs">Search features…</span>
          <kbd className="hidden sm:inline-flex h-4 items-center rounded border bg-background px-1.5 text-[10px] font-medium">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3" aria-label="Main navigation">
        <ul className="space-y-1">
          {/* Dashboard */}
          <li>
            <NavLink href="/app" label="Dashboard" icon={LayoutDashboard} active={isActive('/app')} onClick={onClose} />
          </li>

          {/* Analysis */}
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

          {/* Trading — now includes Backtests */}
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

          {/* Learn & Tools */}
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

          {/* Community */}
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

          {/* Enterprise — founders and admins only */}
          {(user.is_founder || user.role === 'admin') && (
            <NavGroup
              label="Enterprise"
              icon={Building2}
              items={ENTERPRISE_CHILDREN}
              isOpen={enterpriseOpen}
              hasActiveChild={enterpriseActive}
              onToggle={() => setEnterpriseOpen((v) => !v)}
              isActive={isActive}
              onNavClick={onClose}
            />
          )}

          {/* More — secondary utility links */}
          <NavGroup
            label="More"
            icon={LayoutDashboard}
            items={MORE_CHILDREN}
            isOpen={moreOpen}
            hasActiveChild={moreActive}
            onToggle={() => setMoreOpen((v) => !v)}
            isActive={isActive}
            onNavClick={onClose}
          />
        </ul>
      </nav>

      {/* Legal footer */}
      <div className="border-t px-4 py-3">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <a href="/terms"      target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-foreground transition-colors">
            <FileText className="h-3 w-3" /> Terms
          </a>
          <a href="/privacy"    target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-foreground transition-colors">
            <ShieldCheck className="h-3 w-3" /> Privacy
          </a>
          <a href="/disclaimer" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-foreground transition-colors">
            <AlertTriangle className="h-3 w-3" /> Disclaimer
          </a>
        </div>
      </div>

      {/* User menu — Settings, Billing, Admin, Sign out */}
      <UserMenu user={user} onLogout={onLogout} isActive={isActive} onNavClick={onClose} />
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

  const setCurrentPage    = useAssistantStore((s) => s.setCurrentPage);
  const setUserTier       = useAssistantStore((s) => s.setUserTier);
  const fetchEntitlements = usePlanStore((s) => s.fetchEntitlements);
  const normalizedPlan    = usePlanStore((s) => s.normalized);
  const togglePalette     = useCommandPaletteStore((s) => s.togglePalette);

  useEffect(() => { loadUser(); fetchEntitlements(); }, [fetchEntitlements]);
  useEffect(() => { setCurrentPage(pathname); }, [pathname, setCurrentPage]);
  useEffect(() => { if (normalizedPlan.plan) setUserTier(normalizedPlan.plan); }, [normalizedPlan.plan, setUserTier]);

  // Close sidebar on route change (mobile)
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        togglePalette();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [togglePalette]);

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
      {/* Command palette — global, rendered above everything */}
      <CommandPalette />

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
        <Sidebar user={user} pathname={pathname} onClose={() => setSidebarOpen(false)} onLogout={handleLogout} />
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur px-4 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-bold flex-1">{BRAND_NAME_TM}</span>
          <Button variant="ghost" size="icon" onClick={() => togglePalette()} aria-label="Search">
            <Search className="h-4 w-4" />
          </Button>
        </header>

        <main className="p-6">{children}</main>
      </div>

      <ChatBubble />
    </div>
  );
}

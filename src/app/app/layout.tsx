'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bitcoin,
  BookOpen,
  Brain,
  Building2,
  Calculator,
  CalendarDays,
  CandlestickChart,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  CreditCard,
  Crown,
  FileText,
  Globe,
  Gift,
  History,
  Newspaper,
  LayoutDashboard,
  Layers,
  Lightbulb,
  LineChart,
  LogOut,
  Map,
  Menu,
  MessageSquare,
  PieChart,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
  Wifi,
  X,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import { ChatBubble } from '@/components/assistant';
import { EmailVerificationBanner } from '@/components/email-verification-banner';
import { NpsWidget } from '@/components/nps-widget';
import { BetaBanner } from '@/components/beta-banner';
import { DemoBanner } from '@/components/demo-banner';
import { CommandPalette } from '@/components/command-palette';
import { MobileNav } from '@/components/mobile-nav';
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

const IS_DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
const IS_BETA_MODE = process.env.NEXT_PUBLIC_BETA_MODE === 'true';

// ============================================================================
// Nav data
// ============================================================================

const ANALYSIS_CHILDREN = [
  { href: '/app/regime',    label: 'Regime Analysis',  icon: TrendingUp },
  { href: '/app/risk',      label: 'Risk Analytics',   icon: Shield },
  { href: '/app/analytics', label: 'Analytics',        icon: BarChart3 },
  { href: '/app/screening', label: 'Screener',         icon: Search },
  { href: '/app/portfolio', label: 'Portfolio Mgmt',   icon: PieChart,    badge: 'NEW' },
  { href: '/app/trade-ideas', label: 'Trade Ideas',    icon: Lightbulb },
  { href: '/app/signals',     label: 'Signal Feed',    icon: Zap,         badge: 'NEW' },
  { href: '/app/strategy',    label: 'AI Strategy',    icon: Brain,       badge: 'NEW' },
];

const TRADING_CHILDREN = [
  { href: '/app/paper',             label: 'Paper Trading',      icon: CandlestickChart },
  { href: '/app/paper/leaderboard', label: 'Leaderboard',        icon: Crown,            badge: 'NEW' },
  { href: '/app/backtests',         label: 'Backtests',          icon: LineChart },
  { href: '/app/simulations',       label: 'Simulations',        icon: Activity,         badge: 'NEW' },
  { href: '/app/options',           label: 'Options',            icon: Layers },
  { href: '/app/crypto',            label: 'Crypto',             icon: Bitcoin },
  { href: '/app/order-prep',        label: 'Order Prep',         icon: ClipboardList,    badge: 'NEW' },
  { href: '/app/brokers',           label: 'Broker Connections', icon: Wifi,             badge: 'NEW' },
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

const MARKETS_CHILDREN = [
  { href: '/app/news',           label: 'Market News',       icon: Newspaper },
  { href: '/app/earnings',       label: 'Earnings Calendar', icon: CalendarDays, badge: 'NEW' },
  { href: '/app/global-markets', label: 'Global Markets',    icon: Globe,        badge: 'NEW' },
  { href: '/app/fixed-income',   label: 'Fixed Income',      icon: BarChart3,    badge: 'NEW' },
  { href: '/app/alternatives',   label: 'Alternatives',      icon: TrendingUp,   badge: 'NEW' },
];

const ENTERPRISE_CHILDREN = [
  { href: '/app/enterprise/advisor',           label: 'Advisor CRM',        icon: Users },
  { href: '/app/enterprise/advisor/analytics', label: 'Practice Analytics', icon: BarChart3, badge: 'NEW' },
  { href: '/app/enterprise/alternatives',      label: 'Alternatives',       icon: TrendingUp },
  { href: '/app/enterprise/strategies',        label: 'Algo Strategies',    icon: TrendingUp },
  { href: '/app/enterprise/webhooks',          label: 'Webhooks',           icon: FileText },
  { href: '/app/enterprise/api-keys',          label: 'API Keys',           icon: Shield },
  { href: '/app/enterprise/compliance',        label: 'Compliance',         icon: ShieldCheck },
];

const ADMIN_CHILDREN = [
  { href: '/app/admin',            label: 'Admin Dashboard', icon: ShieldCheck },
  { href: '/app/founder/trading',  label: 'Trading Console', icon: Zap },
];

// Items shown only in the UserMenu dropdown
const USER_MENU_ITEMS = [
  { href: '/app/settings', label: 'Settings', icon: Settings },
  { href: '/app/billing',  label: 'Billing',  icon: CreditCard },
];

// Secondary / utility links — collapsed under "More"
const MORE_CHILDREN = [
  { href: '/app/referral',              label: 'Refer Friends',      icon: Gift,        badge: 'NEW' },
  { href: '/app/billing',               label: 'Billing & Plans',    icon: CreditCard },
  { href: '/app/settings/privacy',      label: 'Privacy & Data',     icon: ShieldCheck, badge: 'NEW' },
  { href: '/app/investment-compliance', label: 'Compliance Tools',   icon: ShieldCheck },
  { href: '/app/audit',                 label: 'Audit Log',          icon: ClipboardList },
  { href: '/app/changelog',             label: 'Changelog',          icon: History },
  { href: '/app/roadmap',               label: 'Roadmap',            icon: Map },
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
  badge?: string;
  onClick?: () => void;
  collapsed?: boolean;
}

function NavLink({ href, label, icon: Icon, active, indent = false, badge, onClick, collapsed }: NavLinkProps) {
  if (collapsed) {
    return (
      <Link
        href={href}
        onClick={onClick}
        title={label}
        className={cn(
          'flex items-center justify-center rounded-lg p-2.5 transition-colors duration-150',
          active
            ? 'bg-accent text-foreground'
            : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
        )}
        aria-current={active ? 'page' : undefined}
        aria-label={label}
      >
        <Icon className="h-5 w-5 shrink-0" />
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 text-sm transition-colors duration-150',
        indent ? 'py-1.5 ml-3 pl-3 border-l border-border/60' : 'py-2',
        active
          ? 'bg-accent text-foreground font-medium'
          : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
      )}
      aria-current={active ? 'page' : undefined}
    >
      <Icon className={cn('h-4 w-4 shrink-0', active && 'text-foreground')} />
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="badge-new">{badge}</span>
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
  collapsed?: boolean;
  onCollapsedClick?: () => void;
}

function NavGroup({
  label, icon: Icon, items, isOpen, hasActiveChild,
  onToggle, isActive, onNavClick, count, collapsed, onCollapsedClick,
}: NavGroupProps) {
  if (collapsed) {
    return (
      <li>
        <button
          onClick={() => onCollapsedClick?.()}
          title={label}
          aria-label={label}
          className={cn(
            'flex w-full items-center justify-center rounded-lg p-2.5 transition-colors duration-150',
            hasActiveChild
              ? 'bg-accent/80 text-foreground'
              : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
          )}
        >
          <Icon className="h-5 w-5 shrink-0" />
        </button>
      </li>
    );
  }

  return (
    <li>
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-150',
          hasActiveChild && !isOpen
            ? 'bg-accent/60 text-foreground'
            : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
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
  collapsed?: boolean;
}

function UserMenu({ user, onLogout, isActive, onNavClick, collapsed }: UserMenuProps) {
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
        className={cn(
          'flex w-full items-center rounded-lg px-2 py-2 hover:bg-muted transition-colors',
          collapsed ? 'justify-center' : 'gap-3',
        )}
      >
        <UserAvatar avatarUrl={user.avatar_url} name={user.full_name || user.email} size={32} />
        {!collapsed && (
          <>
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
          </>
        )}
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
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  onExpand?: () => void;
}

function Sidebar({ user, pathname, onClose, onLogout, collapsed, onToggleCollapsed, onExpand }: SidebarProps) {
  const openPalette = useCommandPaletteStore((s) => s.openPalette);

  const isActive = (href: string) => {
    if (href === '/app') return pathname === '/app';
    return pathname.startsWith(href);
  };

  const analysisActive   = ANALYSIS_CHILDREN.some((c) => isActive(c.href));
  const tradingActive    = TRADING_CHILDREN.some((c) => isActive(c.href));
  const learnActive      = LEARN_CHILDREN.some((c) => isActive(c.href));
  const communityActive  = pathname.startsWith('/app/community');
  const marketsActive    = MARKETS_CHILDREN.some((c) => isActive(c.href));
  const moreActive       = MORE_CHILDREN.some((c) => isActive(c.href));
  const enterpriseActive = pathname.startsWith('/app/enterprise');
  const adminActive      = pathname.startsWith('/app/admin') || pathname.startsWith('/app/founder/trading');

  const [analysisOpen,  setAnalysisOpen]  = useState(analysisActive);
  const [tradingOpen,   setTradingOpen]   = useState(tradingActive);
  const [learnOpen,     setLearnOpen]     = useState(learnActive);
  const [communityOpen, setCommunityOpen] = useState(communityActive);
  const [marketsOpen,   setMarketsOpen]   = useState(marketsActive);
  const [moreOpen,      setMoreOpen]      = useState(moreActive);
  const [enterpriseOpen,setEnterpriseOpen]= useState(enterpriseActive);
  const [adminOpen,     setAdminOpen]     = useState(adminActive);

  useEffect(() => {
    if (analysisActive)   setAnalysisOpen(true);
    if (tradingActive)    setTradingOpen(true);
    if (learnActive)      setLearnOpen(true);
    if (communityActive)  setCommunityOpen(true);
    if (marketsActive)    setMarketsOpen(true);
    if (moreActive)       setMoreOpen(true);
    if (enterpriseActive) setEnterpriseOpen(true);
    if (adminActive)      setAdminOpen(true);
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // When clicking a group icon while collapsed: expand sidebar, close all
  // other groups, and open only the clicked one.
  const expandGroup = (openSetter: React.Dispatch<React.SetStateAction<boolean>>) => {
    onExpand?.();
    setAnalysisOpen(false);
    setTradingOpen(false);
    setLearnOpen(false);
    setCommunityOpen(false);
    setMarketsOpen(false);
    setMoreOpen(false);
    setEnterpriseOpen(false);
    openSetter(true);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Logo + collapse toggle — height grows to clear the Dynamic Island */}
      <div
        className={cn(
          'flex items-center border-b',
          collapsed ? 'justify-center px-2' : 'justify-between px-4',
        )}
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          height: 'calc(2.75rem + env(safe-area-inset-top, 0px))',
        }}
      >
        {!collapsed && (
          <Link href="/app" className="flex items-center gap-2" onClick={onClose}>
            <Image src="/icon.png" alt="SSB logo" width={28} height={28} className="rounded-md shrink-0" />
            <span className="font-bold text-lg">SSB</span>
            {IS_BETA_MODE && (
              <span className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-blue-600 text-white">
                Beta
              </span>
            )}
          </Link>
        )}
        {/* Mobile close */}
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose} aria-label="Close menu">
          <X className="h-5 w-5" />
        </Button>
        {/* Desktop collapse toggle */}
        {onToggleCollapsed && (
          <button
            onClick={onToggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:flex items-center justify-center rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            {collapsed
              ? <ChevronsRight className="h-4 w-4" />
              : <ChevronsLeft className="h-4 w-4" />
            }
          </button>
        )}
      </div>

      {/* Search / Command palette trigger */}
      {!collapsed && (
        <div className="px-3 pt-3 pb-1">
          <button
            onClick={() => { openPalette(); onClose(); }}
            className="flex w-full items-center gap-2.5 rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-sm text-muted-foreground hover:bg-background/60 hover:border-border hover:text-foreground transition-colors duration-150"
          >
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span className="flex-1 text-left text-xs">Quick access…</span>
            <kbd className="hidden sm:inline-flex h-4 items-center rounded border border-border/60 bg-muted/50 px-1.5 text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </button>
        </div>
      )}
      {collapsed && (
        <div className="px-2 pt-3 pb-1">
          <button
            onClick={() => { openPalette(); onClose(); }}
            title="Quick access (⌘K)"
            aria-label="Quick access"
            className="flex w-full items-center justify-center rounded-lg border bg-muted/50 p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Search className="h-4 w-4 shrink-0" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav
        className={cn('flex-1 overflow-y-auto p-3', collapsed && 'px-2')}
        aria-label="Main navigation"
      >
        <ul className="space-y-1">
          {/* Dashboard */}
          <li>
            <NavLink
              href="/app"
              label="Dashboard"
              icon={LayoutDashboard}
              active={isActive('/app')}
              onClick={onClose}
              collapsed={collapsed}
            />
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
            collapsed={collapsed}
            onCollapsedClick={() => expandGroup(setAnalysisOpen)}
          />

          {/* Trading */}
          <NavGroup
            label="Trading"
            icon={CandlestickChart}
            items={TRADING_CHILDREN}
            isOpen={tradingOpen}
            hasActiveChild={tradingActive}
            onToggle={() => setTradingOpen((v) => !v)}
            isActive={isActive}
            onNavClick={onClose}
            collapsed={collapsed}
            onCollapsedClick={() => expandGroup(setTradingOpen)}
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
            collapsed={collapsed}
            onCollapsedClick={() => expandGroup(setLearnOpen)}
          />

          {/* Global Markets */}
          <NavGroup
            label="Global Markets"
            icon={Globe}
            items={MARKETS_CHILDREN}
            isOpen={marketsOpen}
            hasActiveChild={marketsActive}
            onToggle={() => setMarketsOpen((v) => !v)}
            isActive={isActive}
            onNavClick={onClose}
            collapsed={collapsed}
            onCollapsedClick={() => expandGroup(setMarketsOpen)}
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
            collapsed={collapsed}
            onCollapsedClick={() => expandGroup(setCommunityOpen)}
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
              collapsed={collapsed}
              onCollapsedClick={() => expandGroup(setEnterpriseOpen)}
            />
          )}

          {/* Admin — founders and admins only */}
          {(user.is_founder || user.role === 'admin') && (
            <NavGroup
              label="Admin"
              icon={ShieldCheck}
              items={ADMIN_CHILDREN}
              isOpen={adminOpen}
              hasActiveChild={adminActive}
              onToggle={() => setAdminOpen((v) => !v)}
              isActive={isActive}
              onNavClick={onClose}
              collapsed={collapsed}
              onCollapsedClick={() => expandGroup(setAdminOpen)}
            />
          )}

          {/* More */}
          <NavGroup
            label="More"
            icon={LayoutDashboard}
            items={MORE_CHILDREN}
            isOpen={moreOpen}
            hasActiveChild={moreActive}
            onToggle={() => setMoreOpen((v) => !v)}
            isActive={isActive}
            onNavClick={onClose}
            collapsed={collapsed}
            onCollapsedClick={() => expandGroup(setMoreOpen)}
          />
        </ul>
      </nav>

      {/* Legal footer — hidden when collapsed */}
      {!collapsed && (
        <div className="border-t px-4 py-3">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <a href="/about" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-foreground transition-colors">
              <Users className="h-3 w-3" /> About
            </a>
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
      )}

      {/* User menu */}
      <UserMenu
        user={user}
        onLogout={onLogout}
        isActive={(href) => pathname.startsWith(href)}
        onNavClick={onClose}
        collapsed={collapsed}
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });

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

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed((v) => {
      const next = !v;
      localStorage.setItem('sidebar-collapsed', String(next));
      return next;
    });
  };

  const expandSidebar = () => {
    setSidebarCollapsed(false);
    localStorage.setItem('sidebar-collapsed', 'false');
  };

  const loadUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
      if (IS_BETA_MODE) {
        const key = `beta-welcome-shown-${userData.id}`;
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, '1');
          toast.success('Welcome to SSB Early Access — everything is free during Beta!', { duration: 6000 });
        }
      }
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
          'fixed left-0 top-0 z-50 h-full sidebar-surface transform transition-all duration-200 lg:translate-x-0',
          sidebarCollapsed ? 'w-16' : 'w-64',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Sidebar"
      >
        <Sidebar
          user={user}
          pathname={pathname}
          onClose={() => setSidebarOpen(false)}
          onLogout={handleLogout}
          collapsed={sidebarCollapsed}
          onToggleCollapsed={toggleSidebarCollapsed}
          onExpand={expandSidebar}
        />
      </aside>

      {/* Main content */}
      <div className={cn('transition-all duration-200', sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64')}>
        {/* Mobile top bar — padding-top clears the Dynamic Island */}
        <header
          className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur-md elevation-1 lg:hidden"
          style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
          <div className="flex h-11 items-center gap-4 px-4">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
            <span className="font-bold flex-1">{BRAND_NAME_TM}</span>
            <Button variant="ghost" size="icon" onClick={() => togglePalette()} aria-label="Search">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {IS_DEMO_MODE && (
          <div
            className="sticky lg:top-0 z-20 flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-xs font-semibold text-amber-950"
            style={{ top: 'calc(2.75rem + env(safe-area-inset-top, 0px))' }}
          >
            <span>DEMO MODE — all data is simulated. No real trades or accounts.</span>
          </div>
        )}
        {IS_BETA_MODE && !IS_DEMO_MODE && (
          <div
            className="sticky lg:top-0 z-20"
            style={{ top: 'calc(2.75rem + env(safe-area-inset-top, 0px))' }}
          >
            <BetaBanner />
          </div>
        )}
        <div
          className="sticky lg:top-0 z-20"
          style={{ top: 'calc(2.75rem + env(safe-area-inset-top, 0px))' }}
        >
          <DemoBanner />
        </div>
        <EmailVerificationBanner />
        <main className="p-6 pb-safe-bottom lg:pb-6">{children}</main>
      </div>

      <MobileNav onMenuOpen={() => setSidebarOpen(true)} />
      <ChatBubble />
      {user && <NpsWidget />}
    </div>
  );
}

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  BarChart3,
  Bitcoin,
  BookOpen,
  Building2,
  Calculator,
  Calendar,
  CandlestickChart,
  ClipboardList,
  CreditCard,
  FileText,
  History,
  Leaf,
  Layers,
  LineChart,
  Lock,
  Map,
  MessageSquare,
  Newspaper,
  PieChart,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCommandPaletteStore } from '@/stores/command-palette-store';
import { usePlanStore } from '@/stores/plan-store';

// ============================================================================
// Feature registry — the single source of truth for all SSB features
// ============================================================================

export type FeatureTier = 'free' | 'starter' | 'pro' | 'institutional';

export interface PaletteItem {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: React.ElementType;
  category: string;
  tier: FeatureTier;   // Minimum tier required
  isNew?: boolean;     // Show "NEW" badge
  keywords?: string[]; // Extra search terms
}

export const ALL_FEATURES: PaletteItem[] = [
  // ── Dashboard ──────────────────────────────────────────────────────────
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Home — capability map and market summary',
    href: '/app',
    icon: BarChart3,
    category: 'Navigation',
    tier: 'free',
    keywords: ['home', 'overview'],
  },

  // ── Analysis ───────────────────────────────────────────────────────────
  {
    id: 'regime',
    label: 'Regime Analysis',
    description: 'Market regime classification with confidence scores',
    href: '/app/regime',
    icon: TrendingUp,
    category: 'Analysis',
    tier: 'free',
    keywords: ['bull', 'bear', 'sideways', 'market cycle'],
  },
  {
    id: 'risk',
    label: 'Risk Analytics',
    description: 'Portfolio risk metrics, VaR, and stress testing',
    href: '/app/risk',
    icon: Shield,
    category: 'Analysis',
    tier: 'free',
    keywords: ['var', 'volatility', 'drawdown', 'correlation'],
  },
  {
    id: 'analytics-optimize',
    label: 'Portfolio Optimizer',
    description: 'Efficient frontier and maximum Sharpe ratio allocation',
    href: '/app/analytics',
    icon: BarChart3,
    category: 'Analysis',
    tier: 'starter',
    keywords: ['efficient frontier', 'sharpe', 'allocation', 'mpt'],
  },
  {
    id: 'analytics-technical',
    label: 'Technical Analysis',
    description: '30+ indicators: RSI, MACD, Bollinger Bands, and more',
    href: '/app/analytics',
    icon: Activity,
    category: 'Analysis',
    tier: 'free',
    keywords: ['rsi', 'macd', 'bollinger', 'moving average', 'indicators'],
  },
  {
    id: 'analytics-sector',
    label: 'Sector Rotation',
    description: 'RRG quadrant analysis and market cycle positioning',
    href: '/app/analytics',
    icon: Map,
    category: 'Analysis',
    tier: 'starter',
    keywords: ['rrg', 'rotation', 'sectors', 'cycle'],
  },
  {
    id: 'analytics-monte-carlo',
    label: 'Monte Carlo Simulation',
    description: 'Probabilistic portfolio outcome simulation (1000 paths)',
    href: '/app/simulations',
    icon: Sparkles,
    category: 'Analysis',
    tier: 'starter',
    keywords: ['simulation', 'probability', 'gbm', 'paths'],
  },
  {
    id: 'analytics-garch',
    label: 'GARCH Volatility Forecast',
    description: 'GARCH(1,1) volatility forecasting with VaR estimates',
    href: '/app/analytics',
    icon: Zap,
    category: 'Analysis',
    tier: 'pro',
    isNew: true,
    keywords: ['garch', 'volatility', 'var', 'forecast', 'regime'],
  },
  {
    id: 'analytics-anomaly',
    label: 'Anomaly Detection',
    description: 'Statistical detection of unusual price and volume events',
    href: '/app/analytics',
    icon: ShieldAlert,
    category: 'Analysis',
    tier: 'starter',
    isNew: true,
    keywords: ['anomaly', 'spike', 'outlier', 'zscore', 'unusual'],
  },
  {
    id: 'analytics-sentiment',
    label: 'Sentiment Analysis',
    description: 'NLP-powered market sentiment from news headlines',
    href: '/app/analytics',
    icon: Newspaper,
    category: 'Analysis',
    tier: 'pro',
    isNew: true,
    keywords: ['sentiment', 'nlp', 'news', 'bullish', 'bearish', 'ai'],
  },
  {
    id: 'analytics-esg',
    label: 'ESG Scoring',
    description: 'Environmental, Social, Governance ratings with controversy flags',
    href: '/app/analytics',
    icon: Leaf,
    category: 'Analysis',
    tier: 'starter',
    isNew: true,
    keywords: ['esg', 'environmental', 'social', 'governance', 'sustainability'],
  },
  {
    id: 'analytics-earnings',
    label: 'Earnings Surprise Probability',
    description: 'Beat/miss probability from pre-earnings momentum signals',
    href: '/app/analytics',
    icon: Calendar,
    category: 'Analysis',
    tier: 'pro',
    isNew: true,
    keywords: ['earnings', 'surprise', 'beat', 'miss', 'probability'],
  },
  {
    id: 'sector-heatmap',
    label: 'Sector Heatmap',
    description: 'Visual heatmap of S&P 500 sector performance',
    href: '/app/analytics',
    icon: Map,
    category: 'Analysis',
    tier: 'free',
    isNew: true,
    keywords: ['heatmap', 'sectors', 'sp500', 'performance'],
  },
  {
    id: 'screener',
    label: 'Stock Screener',
    description: 'Multi-factor stock screening with custom filters',
    href: '/app/screening',
    icon: Search,
    category: 'Analysis',
    tier: 'free',
    keywords: ['screen', 'filter', 'stocks', 'scan'],
  },
  {
    id: 'portfolio-management',
    label: 'Portfolio Management',
    description: 'Real portfolio analytics, P&L, attribution, rebalancing, and wash-sale scanner',
    href: '/app/portfolio',
    icon: PieChart,
    category: 'Analysis',
    tier: 'free',
    isNew: true,
    keywords: ['portfolio', 'p&l', 'unrealized', 'rebalance', 'attribution', 'sector', 'broker', 'holdings', 'cost basis', 'wash sale', 'benchmark'],
  },

  // ── Intelligence ────────────────────────────────────────────────────────
  {
    id: 'factor-analysis',
    label: 'Factor Analysis',
    description: 'Multi-factor model: market, size, momentum, value, quality',
    href: '/app/analytics',
    icon: BarChart3,
    category: 'Intelligence',
    tier: 'pro',
    keywords: ['factor', 'fama french', 'alpha', 'beta', 'momentum'],
  },
  {
    id: 'simulations',
    label: 'Scenario Simulations',
    description: 'Macro scenario and stress simulation engine',
    href: '/app/intelligence/simulations',
    icon: Sparkles,
    category: 'Intelligence',
    tier: 'pro',
    keywords: ['scenario', 'stress', 'macro', 'simulation'],
  },
  {
    id: 'benchmark',
    label: 'Benchmark Comparison',
    description: 'Alpha, beta, tracking error vs benchmark indices',
    href: '/app/analytics',
    icon: TrendingUp,
    category: 'Intelligence',
    tier: 'starter',
    keywords: ['benchmark', 'alpha', 'tracking error', 'spy', 'comparison'],
  },
  {
    id: 'dcf',
    label: 'DCF Valuation',
    description: 'Discounted cash flow and relative valuation models',
    href: '/app/analytics',
    icon: Calculator,
    category: 'Intelligence',
    tier: 'pro',
    keywords: ['dcf', 'valuation', 'intrinsic value', 'pe', 'fair value'],
  },

  // ── Trading ────────────────────────────────────────────────────────────
  {
    id: 'paper',
    label: 'Paper Trading',
    description: 'Simulated trading with full order management',
    href: '/app/paper',
    icon: CandlestickChart,
    category: 'Trading',
    tier: 'free',
    keywords: ['paper', 'simulate', 'practice', 'orders'],
  },
  {
    id: 'options',
    label: 'Options Chain',
    description: 'Options chain viewer with Greeks and IV analysis',
    href: '/app/options',
    icon: Layers,
    category: 'Trading',
    tier: 'starter',
    keywords: ['options', 'calls', 'puts', 'greeks', 'delta', 'iv'],
  },
  {
    id: 'crypto',
    label: 'Crypto',
    description: 'Cryptocurrency market data and analytics',
    href: '/app/crypto',
    icon: Bitcoin,
    category: 'Trading',
    tier: 'free',
    keywords: ['crypto', 'bitcoin', 'ethereum', 'defi'],
  },
  {
    id: 'backtests',
    label: 'Backtests',
    description: 'Strategy backtesting with performance attribution',
    href: '/app/backtests',
    icon: LineChart,
    category: 'Trading',
    tier: 'starter',
    keywords: ['backtest', 'strategy', 'historical', 'performance'],
  },

  // ── Learn & Tools ──────────────────────────────────────────────────────
  {
    id: 'learn',
    label: 'Learning Hub',
    description: '14 modules across 4 structured learning paths',
    href: '/app/learn',
    icon: BookOpen,
    category: 'Learn & Tools',
    tier: 'free',
    keywords: ['learn', 'modules', 'education', 'courses'],
  },
  {
    id: 'quiz',
    label: 'Investment Style Quiz',
    description: 'Discover your risk profile and investment style',
    href: '/app/onboarding',
    icon: UserCheck,
    category: 'Learn & Tools',
    tier: 'free',
    keywords: ['quiz', 'risk profile', 'style', 'onboarding'],
  },
  {
    id: 'calculators',
    label: 'Calculators',
    description: 'Compound interest, CAGR, and investment calculators',
    href: '/app/calculators',
    icon: Calculator,
    category: 'Learn & Tools',
    tier: 'free',
    keywords: ['calculator', 'compound', 'cagr', 'math'],
  },
  {
    id: 'news',
    label: 'Market News',
    description: 'Latest financial news and market intelligence',
    href: '/app/news',
    icon: Newspaper,
    category: 'Learn & Tools',
    tier: 'free',
    keywords: ['news', 'headlines', 'market', 'earnings'],
  },

  // ── Community ──────────────────────────────────────────────────────────
  {
    id: 'community-feed',
    label: 'Community Feed',
    description: 'Investment ideas and market discussion',
    href: '/app/community',
    icon: MessageSquare,
    category: 'Community',
    tier: 'free',
    keywords: ['community', 'feed', 'social', 'ideas'],
  },
  {
    id: 'community-idea',
    label: 'Share Investment Idea',
    description: 'Post your market analysis and trade ideas',
    href: '/app/community/ideas/new',
    icon: TrendingUp,
    category: 'Community',
    tier: 'free',
    keywords: ['idea', 'share', 'post', 'trade'],
  },

  // ── Enterprise ─────────────────────────────────────────────────────────
  {
    id: 'enterprise-advisor',
    label: 'Advisor CRM',
    description: 'Client relationship management for advisors',
    href: '/app/enterprise/advisor',
    icon: Users,
    category: 'Enterprise',
    tier: 'institutional',
    keywords: ['advisor', 'crm', 'clients', 'wealth'],
  },
  {
    id: 'enterprise-strategies',
    label: 'Algo Strategies',
    description: 'Systematic algorithmic trading strategies',
    href: '/app/enterprise/strategies',
    icon: TrendingUp,
    category: 'Enterprise',
    tier: 'institutional',
    keywords: ['algo', 'systematic', 'strategy', 'quant'],
  },
  {
    id: 'enterprise-webhooks',
    label: 'Webhooks',
    description: 'Real-time event webhooks for external integrations',
    href: '/app/enterprise/webhooks',
    icon: Zap,
    category: 'Enterprise',
    tier: 'institutional',
    keywords: ['webhook', 'api', 'integration', 'events'],
  },
  {
    id: 'enterprise-api-keys',
    label: 'API Keys',
    description: 'Manage API keys for programmatic access',
    href: '/app/enterprise/api-keys',
    icon: ShieldCheck,
    category: 'Enterprise',
    tier: 'institutional',
    keywords: ['api', 'keys', 'token', 'access'],
  },
  {
    id: 'enterprise-compliance',
    label: 'Compliance Center',
    description: 'Regulatory compliance monitoring and reporting',
    href: '/app/enterprise/compliance',
    icon: Building2,
    category: 'Enterprise',
    tier: 'institutional',
    keywords: ['compliance', 'regulatory', 'audit', 'report'],
  },
  {
    id: 'enterprise-alternatives',
    label: 'Alternative Investments',
    description: 'Private equity, hedge fund, and alternatives analytics',
    href: '/app/enterprise/alternatives',
    icon: Layers,
    category: 'Enterprise',
    tier: 'institutional',
    keywords: ['alternatives', 'private equity', 'hedge', 'real assets'],
  },

  // ── Account ────────────────────────────────────────────────────────────
  {
    id: 'billing',
    label: 'Billing & Plans',
    description: 'Manage subscription, upgrade plan',
    href: '/app/billing',
    icon: CreditCard,
    category: 'Account',
    tier: 'free',
    keywords: ['billing', 'plan', 'upgrade', 'subscription', 'payment'],
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'Profile, security, MFA, and notification preferences',
    href: '/app/settings',
    icon: Settings,
    category: 'Account',
    tier: 'free',
    keywords: ['settings', 'profile', 'mfa', 'notifications', 'password'],
  },
  {
    id: 'audit',
    label: 'Audit Log',
    description: 'Full activity and security event log',
    href: '/app/audit',
    icon: ClipboardList,
    category: 'Account',
    tier: 'free',
    keywords: ['audit', 'log', 'activity', 'history', 'security'],
  },
  {
    id: 'changelog',
    label: 'Changelog',
    description: "What's new in SSB",
    href: '/app/changelog',
    icon: History,
    category: 'Account',
    tier: 'free',
    keywords: ['changelog', "what's new", 'updates', 'releases'],
  },
  {
    id: 'roadmap',
    label: 'Roadmap',
    description: 'Upcoming features and product direction',
    href: '/app/roadmap',
    icon: Map,
    category: 'Account',
    tier: 'free',
    keywords: ['roadmap', 'upcoming', 'features', 'plans'],
  },
  {
    id: 'privacy',
    label: 'Privacy & Data Management',
    description: 'Data transparency, export, preferences, and account deletion',
    href: '/app/settings/privacy',
    icon: FileText,
    category: 'Account',
    tier: 'free',
    keywords: ['privacy', 'data', 'gdpr', 'ccpa', 'delete', 'export', 'download', 'consent', 'plaid'],
  },
];

const TIER_LABEL: Record<FeatureTier, string> = {
  free: '',
  starter: 'Starter',
  pro: 'Pro',
  institutional: 'Enterprise',
};

const TIER_BADGE: Record<FeatureTier, string> = {
  free: '',
  starter: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  pro: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400',
  institutional: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
};

const CATEGORY_ORDER = [
  'Analysis', 'Intelligence', 'Trading', 'Learn & Tools',
  'Community', 'Enterprise', 'Account', 'Navigation',
];

// Tier hierarchy: higher index = higher tier
const TIER_RANK: Record<string, number> = {
  free: 0, starter: 1, pro: 2, institutional: 3,
  // founder / full_access get max rank (all access)
  founder: 99, full_access: 99,
};

function userHasAccess(userPlan: string, requiredTier: FeatureTier): boolean {
  const userRank = TIER_RANK[userPlan] ?? 0;
  const reqRank  = TIER_RANK[requiredTier] ?? 0;
  return userRank >= reqRank;
}

// ============================================================================
// Command Palette component
// ============================================================================

export function CommandPalette() {
  const router = useRouter();
  const { open, closePalette } = useCommandPaletteStore();
  const userPlan = usePlanStore((s) => s.normalized.plan);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // ── Filtering ──────────────────────────────────────────────────────────
  const filtered = query.trim()
    ? ALL_FEATURES.filter((f) => {
        const q = query.toLowerCase();
        return (
          f.label.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q) ||
          (f.keywords ?? []).some((k) => k.includes(q))
        );
      })
    : ALL_FEATURES;

  // Group by category in the defined order
  const grouped = CATEGORY_ORDER.reduce<Record<string, PaletteItem[]>>((acc, cat) => {
    const items = filtered.filter((f) => f.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {});

  const flatList = Object.values(grouped).flat();

  // ── Reset on open ──────────────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // ── Scroll active item into view ───────────────────────────────────────
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  // ── Keyboard navigation ────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, flatList.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = flatList[activeIndex];
        if (item) navigate(item);
      } else if (e.key === 'Escape') {
        closePalette();
      }
    },
    [flatList, activeIndex, closePalette]
  );

  const navigate = (item: PaletteItem) => {
    closePalette();
    router.push(item.href);
  };

  if (!open) return null;

  let flatIndex = 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={closePalette}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-label="Command palette"
        aria-modal="true"
        className="fixed left-1/2 top-[15%] z-50 w-full max-w-xl -translate-x-1/2 rounded-xl border bg-card shadow-2xl overflow-hidden"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            id="command-palette-search"
            name="command-palette-search"
            autoComplete="off"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Search features, tools, pages…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            aria-label="Search"
          />
          <kbd className="hidden sm:inline-flex h-5 items-center rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <ul
          ref={listRef}
          className="max-h-96 overflow-y-auto py-2"
          role="listbox"
        >
          {flatList.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-muted-foreground">
              No results for &ldquo;{query}&rdquo;
            </li>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <li key={category}>
                <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {category}
                </p>
                <ul>
                  {items.map((item) => {
                    const currentIndex = flatIndex++;
                    const isActive = currentIndex === activeIndex;
                    const Icon = item.icon;
                    const tierLabel = TIER_LABEL[item.tier];
                    const tierBadge = TIER_BADGE[item.tier];

                    return (
                      <li key={item.id} data-index={currentIndex} role="option" aria-selected={isActive}>
                        <button
                          onClick={() => navigate(item)}
                          onMouseEnter={() => setActiveIndex(currentIndex)}
                          className={cn(
                            'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
                            isActive ? 'bg-primary/10' : 'hover:bg-muted/50'
                          )}
                        >
                          <div className={cn(
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                            isActive ? 'bg-primary/15' : 'bg-muted'
                          )}>
                            <Icon className={cn('h-4 w-4', isActive ? 'text-primary' : 'text-muted-foreground')} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={cn('text-sm font-medium', isActive && 'text-primary')}>
                                {item.label}
                              </span>
                              {item.isNew && (
                                <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                                  NEW
                                </span>
                              )}
                              {tierLabel && (
                                <span className={cn('rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase flex items-center gap-0.5', tierBadge)}>
                                  {!userHasAccess(userPlan, item.tier) && <Lock className="h-2 w-2" />}
                                  {tierLabel}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                          </div>

                          {isActive && (
                            <kbd className="shrink-0 hidden sm:inline-flex h-5 items-center rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
                              ↵
                            </kbd>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))
          )}
        </ul>

        {/* Footer hint */}
        <div className="flex items-center justify-between border-t px-4 py-2">
          <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <kbd className="rounded border bg-muted px-1 py-0.5">↑↓</kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border bg-muted px-1 py-0.5">↵</kbd> open
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border bg-muted px-1 py-0.5">ESC</kbd> close
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground">
            {flatList.length} feature{flatList.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </>
  );
}

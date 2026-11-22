/**
 * Account-level endpoints: billing (Stripe stubbed), entitlements, settings,
 * user preferences, and meta. The demo account is on the Pro plan so every
 * feature is visible; change DEMO_PLAN to see gated states.
 */
import { generateMockPlans } from '../../mock-data';
import { daysAgo, daysFromNow, iso, newId } from '../prng';
import { get, patch, post, put, type DemoRoute } from '../router';

export const DEMO_PLAN = 'pro' as const;

const plans = () => generateMockPlans();
const currentPlan = () => plans().find((p) => p.name === DEMO_PLAN)!;

// ── Subscription state (in memory, resets on reload) ────────────────────────
const sub = { cancelAtPeriodEnd: false };

const subscription = () => ({
  id: 'sub-demo-001',
  user_id: 'demo-user-001',
  plan: currentPlan(),
  status: 'active' as const,
  billing_cycle: 'monthly' as const,
  current_period_start: iso(daysAgo(7)),
  current_period_end: iso(daysFromNow(23)),
  cancel_at_period_end: sub.cancelAtPeriodEnd,
  created_at: iso(daysAgo(30)),
});

// ── Preferences (in memory) ─────────────────────────────────────────────────
const notificationPrefs = {
  email_security_alerts: true,
  email_billing: true,
  email_portfolio_summary: true,
  email_signal_alerts: false,
  email_price_alerts: true,
  email_news_digest: false,
  email_paper_trade_fills: true,
  email_product_updates: true,
  push_signal_alerts: true,
  push_portfolio_alerts: true,
  push_paper_trade_fills: false,
  push_earnings_reminders: true,
  push_community_activity: false,
  thresholds: { portfolio_drawdown_pct: 10, position_loss_pct: 15, paper_drawdown_pct: 12 },
  updated_at: iso(daysAgo(3)),
};

const tradingPrefs = {
  user_id: 'demo-user-001',
  preferred_broker: null as string | null,
  risk_tolerance: 'moderate',
  max_position_pct: 10,
  min_confidence_threshold: 0.6,
  alert_email: true,
  alert_push: false,
  updated_at: iso(daysAgo(3)) as string | null,
};

const disclaimer = { has_accepted: true, accepted_at: iso(daysAgo(30)) as string | null, disclaimer_version: '1.0' as string | null };

export const accountRoutes: DemoRoute[] = [
  // ── Billing (Stripe is never contacted) ───────────────────────────────────
  get('/billing/plans', () => ({ plans: plans() })),
  get('/billing/subscription', () => ({ subscription: subscription() })),
  post('/billing/checkout', () => ({
    // Stay on-site: the billing page shows its own "payment successful" banner.
    checkout_url: '/app/billing?success=1',
    session_id: newId('cs_demo'),
  })),
  post('/billing/cancel', () => {
    sub.cancelAtPeriodEnd = true;
    return { message: 'Subscription will cancel at the end of the billing period (demo).', subscription: subscription() };
  }),
  post('/billing/portal', () => ({ portal_url: '/app/billing' })),

  // ── Entitlements: the demo account is fully entitled ──────────────────────
  get('/intelligence/entitlements', () => ({
    user_id: 'demo-user-001',
    plan_name: DEMO_PLAN,
    plan_display_name: 'Pro',
    regime_insights_delay_days: 0,
    risk_analytics_level: 'advanced',
    asset_classes: ['equities', 'etfs', 'fixed_income', 'commodities', 'crypto'],
    simulation_limit: 1000,
    stress_test_enabled: true,
    stress_test_tier: 'full',
    api_access_level: 'standard',
    daily_api_requests_limit: 10000,
    daily_api_requests_used: 142,
    can_upgrade: false,
    upgrade_benefits: [],
    is_founder: false,
    is_full_access: false,
  })),
  get('/backtests/entitlements', () => ({
    monthly_limit: 50,
    monthly_used: 3,
    monthly_remaining: 47,
    max_date_range_days: 3650,
    allowed_asset_classes: ['equities', 'etfs', 'crypto'],
    can_use_limit_orders: true,
    can_export: true,
  })),
  get('/community/entitlements', () => ({
    can_access_community: true,
    can_post: true,
    can_create_trade_ideas: true,
    can_create_watchlists: true,
    can_join_clubs: true,
    can_rate_stocks: true,
    tier: DEMO_PLAN,
  })),
  get('/crypto/entitlements', () => ({
    full_list_enabled: true,
    watchlist_enabled: true,
    portfolio_enabled: true,
    max_watchlist_items: 50,
    access_tier: 'full',
    plan_name: DEMO_PLAN,
  })),
  get('/options/entitlements', () => ({
    chain_viewer_enabled: true,
    paper_trading_enabled: true,
    analytics_enabled: true,
    max_contracts: 100,
    access_tier: 'full',
  })),
  get('/learn/entitlements', () => ({
    can_access_learn: true,
    can_access_premium_modules: true,
    can_track_progress: true,
    available_categories: [
      'fundamentals',
      'technical_analysis',
      'risk_management',
      'portfolio_theory',
      'market_mechanics',
      'derivatives',
      'behavioral_finance',
      'quantitative',
    ],
    max_difficulty: 'advanced',
    tier: DEMO_PLAN,
  })),
  get('/news/entitlements', () => ({
    can_access_news: true,
    can_access_premium_news: true,
    news_delay_minutes: 0,
    daily_news_limit: 1000,
    daily_news_used: 12,
    can_access_market_summary: true,
    can_access_sentiment: true,
    categories_available: [
      'market_overview',
      'earnings',
      'economic',
      'sector',
      'company',
      'crypto',
      'commodities',
      'forex',
      'regulatory',
      'breaking',
    ],
    tier: DEMO_PLAN,
  })),

  // ── Meta ──────────────────────────────────────────────────────────────────
  get('/meta/capabilities', () => ({
    email_enabled: false, // no emails are sent from a local demo
    billing_enabled: true, // shows plans/checkout UI (Stripe is stubbed)
    mfa_enabled: true,
    live_trading_enabled: false, // SSB never executes real trades
    backtests_enabled: true,
  })),
  get('/meta/dashboard', () => ({
    user_id: 'demo-user-001',
    email: 'demo@example.com',
    full_name: 'Demo User',
    email_verified: true,
    mfa_enabled: false,
    plan_name: DEMO_PLAN,
    plan_display_name: 'Pro',
    backtests_count: 3,
    recent_login_count: 5,
    member_since: iso(daysAgo(30)),
  })),
  get('/meta/audit-logs', () => ({
    logs: [
      { action: 'login', hours: 2 },
      { action: 'paper_order_placed', hours: 26 },
      { action: 'backtest_run', hours: 50 },
      { action: 'login', hours: 74 },
      { action: 'password_changed', hours: 24 * 12 },
    ].map((e, i) => ({
      id: `audit-${i + 1}`,
      action: e.action,
      ip_address: '127.0.0.1',
      user_agent: 'Demo Browser',
      success: true,
      metadata: {},
      created_at: iso(new Date(daysAgo(0).getTime() - e.hours * 3_600_000)),
    })),
    total: 5,
    page: 1,
    page_size: 20,
    has_more: false,
  })),

  // ── Settings & preferences ────────────────────────────────────────────────
  get('/settings/notifications', () => ({ ...notificationPrefs })),
  put('/settings/notifications', ({ body }) => {
    Object.assign(notificationPrefs, body, {
      thresholds: { ...notificationPrefs.thresholds, ...(body?.thresholds ?? {}) },
      updated_at: iso(new Date(daysAgo(0))),
    });
    return { ...notificationPrefs };
  }),
  patch('/settings/profile', ({ body }) => ({ success: true, ...body })),

  get('/user/trading-preferences', () => ({ ...tradingPrefs })),
  put('/user/trading-preferences', ({ body }) => {
    Object.assign(tradingPrefs, body, { updated_at: iso(daysAgo(0)) });
    return { ...tradingPrefs };
  }),
  get('/user/disclaimer-status', () => ({ ...disclaimer })),
  post('/user/disclaimer-acceptance', ({ body }) => {
    disclaimer.has_accepted = true;
    disclaimer.accepted_at = iso(daysAgo(0));
    disclaimer.disclaimer_version = body?.disclaimer_version ?? '1.0';
    return { ...disclaimer };
  }),
];


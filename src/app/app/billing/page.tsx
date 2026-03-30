'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CreditCard, RefreshCw, AlertCircle, CheckCircle, Zap, Crown, Building, ExternalLink, Loader2, X, Check, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCapabilities, type Capabilities } from '@/lib/api/meta';
import { getSubscription, listPlans, createCheckoutSession, getBillingPortal, type SubscriptionResponse, type PlanListResponse } from '@/lib/api/billing';
import { getIntelligenceEntitlements, type EntitlementsInfo } from '@/lib/api/intelligence';
import { getPlanConfig, getPlanDisplayName, isFounderPlan, hasUnlimitedAccess } from '@/lib/plan-config';
import { isUnlimited, formatLimit } from '@/lib/utils';
import { usePlanStore } from '@/stores/plan-store';

// Feature bullets for each plan (qualitative labels only - no numeric limits)
const PLAN_FEATURES: Record<string, string[]> = {
  free: [
    'Delayed regime data',
    'Basic risk analytics',
    'Limited paper trading',
    'Community access',
    'Learning hub (4 modules)',
    'Community support',
  ],
  starter: [
    'Reduced data delay',
    'Standard risk analytics',
    'Standard paper trading',
    'Options chain viewer',
    'Crypto portfolio tracker',
    'All learning modules',
    'Email support',
  ],
  pro: [
    'Real-time regime data',
    'Advanced risk analytics',
    'Advanced paper trading + options',
    'Webhooks (up to 20)',
    'Alternative investments tracker',
    'Algo strategies (up to 5)',
    'Backtesting engine',
    'Priority support',
  ],
  institutional: [
    'Real-time + priority data',
    'Full risk analytics suite',
    'Unlimited paper trading',
    'API keys + webhooks (unlimited)',
    'Advisor CRM platform',
    'Unlimited algo strategies',
    'Compliance & audit reports',
    'Dedicated support',
  ],
};

// Comparison table data - grouped by category with qualitative labels
interface ComparisonFeature {
  label: string;
  free: string | boolean;
  starter: string | boolean;
  pro: string | boolean;
  institutional: string | boolean;
}

interface ComparisonSection {
  section: string;
  features: ComparisonFeature[];
}

const COMPARISON_SECTIONS: ComparisonSection[] = [
  {
    section: 'Data & Analytics',
    features: [
      { label: 'Regime Data', free: 'Delayed', starter: 'Reduced delay', pro: 'Real-time', institutional: 'Real-time' },
      { label: 'Risk Analytics', free: 'Basic', starter: 'Standard', pro: 'Advanced', institutional: 'Full Suite' },
      { label: 'Stock Screener', free: 'Basic', starter: 'Standard', pro: 'Advanced', institutional: 'Advanced' },
      { label: 'Stress Testing', free: false, starter: false, pro: true, institutional: true },
      { label: 'Scenario Mode', free: 'Lite', starter: 'Standard', pro: 'Standard', institutional: 'Advanced' },
      { label: 'Scenario Export', free: false, starter: false, pro: false, institutional: true },
    ],
  },
  {
    section: 'Paper Trading & Options',
    features: [
      { label: 'Paper Positions & Orders', free: 'Limited', starter: 'Standard', pro: 'Advanced', institutional: 'Unlimited' },
      { label: 'Chart Overlays', free: 'Basic', starter: 'Standard', pro: 'Advanced', institutional: 'Advanced' },
      { label: 'Options Chain Viewer', free: false, starter: true, pro: true, institutional: true },
      { label: 'Options Paper Trading', free: false, starter: false, pro: true, institutional: true },
    ],
  },
  {
    section: 'Crypto',
    features: [
      { label: 'Crypto Watchlist', free: true, starter: true, pro: true, institutional: true },
      { label: 'Crypto Portfolio', free: false, starter: true, pro: true, institutional: true },
    ],
  },
  {
    section: 'Learning',
    features: [
      { label: 'Learning Hub', free: '4 free modules', starter: 'All modules', pro: 'All modules', institutional: 'All modules' },
      { label: 'Learning Paths', free: 'Beginner only', starter: 'All paths', pro: 'All paths', institutional: 'All paths' },
    ],
  },
  {
    section: 'Community',
    features: [
      { label: 'Community Feed', free: true, starter: true, pro: true, institutional: true },
      { label: 'Trade Ideas & Posts', free: true, starter: true, pro: true, institutional: true },
      { label: 'Investment Clubs', free: 'View only', starter: 'Standard', pro: 'Standard', institutional: 'Unlimited' },
    ],
  },
  {
    section: 'Enterprise',
    features: [
      { label: 'Backtesting', free: false, starter: false, pro: 'Standard', institutional: 'Advanced' },
      { label: 'Alternative Investments', free: false, starter: false, pro: true, institutional: true },
      { label: 'Algo Strategies', free: false, starter: false, pro: 'Up to 5', institutional: 'Unlimited' },
      { label: 'Webhooks', free: false, starter: false, pro: 'Up to 20', institutional: 'Unlimited' },
      { label: 'API Keys', free: false, starter: false, pro: false, institutional: true },
      { label: 'Advisor CRM', free: false, starter: false, pro: false, institutional: true },
      { label: 'Compliance Reports', free: false, starter: false, pro: false, institutional: true },
    ],
  },
  {
    section: 'Platform Access',
    features: [
      { label: 'API Access', free: false, starter: 'Limited', pro: 'Full', institutional: 'Priority' },
      { label: 'Data Export', free: false, starter: 'Basic', pro: 'Standard', institutional: 'Full' },
      { label: 'Audit Log', free: true, starter: true, pro: true, institutional: true },
      { label: 'Support', free: 'Community', starter: 'Email', pro: 'Priority', institutional: 'Dedicated' },
    ],
  },
];

export default function BillingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [plans, setPlans] = useState<PlanListResponse | null>(null);
  const [entitlements, setEntitlements] = useState<EntitlementsInfo | null>(null);
  const [capabilities, setCapabilities] = useState<Capabilities | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [canceledMessage, setCanceledMessage] = useState<string | null>(null);

  // Use normalized plan from centralized store for consistent display
  const normalizedPlan = usePlanStore((state) => state.normalized);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [subscriptionData, plansData, entitlementsData, capabilitiesData] = await Promise.all([
        getSubscription().catch(() => ({ subscription: undefined })),
        listPlans().catch(() => ({ plans: [] })),
        getIntelligenceEntitlements(),
        getCapabilities(),
      ]);
      setSubscription(subscriptionData);
      setPlans(plansData);
      setEntitlements(entitlementsData);
      setCapabilities(capabilitiesData);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load billing information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle success/canceled query params from Stripe redirect
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (success === '1') {
      setSuccessMessage('Payment successful! Your subscription is now active. It may take a moment to update.');
      // Clear the query params from URL
      router.replace('/app/billing', { scroll: false });
      // Reload data to get updated subscription
      loadData();
    } else if (canceled === '1') {
      setCanceledMessage('Payment was canceled. No charges were made.');
      router.replace('/app/billing', { scroll: false });
    }
  }, [searchParams, router]);

  const handleUpgrade = async (planName: string) => {
    setCheckoutLoading(planName);
    setError(null);
    try {
      const result = await createCheckoutSession({
        plan_name: planName,
        billing_cycle: 'monthly',
      });
      // Redirect to Stripe Checkout
      window.location.href = result.checkout_url;
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to create checkout session');
      setCheckoutLoading(null);
    }
  };

  const handleManageBilling = async () => {
    setPortalLoading(true);
    setError(null);
    try {
      const result = await getBillingPortal();
      // Redirect to Stripe Customer Portal
      window.location.href = result.portal_url;
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to open billing portal');
      setPortalLoading(false);
    }
  };

  const getPlanIcon = (planName: string) => {
    const config = getPlanConfig(planName);
    switch (planName.toLowerCase()) {
      case 'founder':
        return <Crown className={`h-6 w-6 ${config.iconClassName}`} />;
      case 'pro':
        return <Zap className={`h-6 w-6 ${config.iconClassName}`} />;
      case 'institutional':
        return <Building className={`h-6 w-6 ${config.iconClassName}`} />;
      default:
        return <Crown className={`h-6 w-6 ${config.iconClassName}`} />;
    }
  };

  const PlanBadge = ({ planName }: { planName: string }) => {
    const config = getPlanConfig(planName);
    const isFounder = isFounderPlan(planName);
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.badgeClassName}`}>
        {isFounder && <Crown className="h-3 w-3" />}
        {config.badgeLabel}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="text-muted-foreground">Loading billing...</span>
        </div>
      </div>
    );
  }

  if (error && !subscription && !plans) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-destructive">{error}</p>
        <Button onClick={loadData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  const billingEnabled = capabilities?.billing_enabled;
  const hasActiveSubscription = subscription?.subscription?.status === 'active';
  // Use store's normalized plan for UI consistency across app
  const currentPlanName = normalizedPlan.plan;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <CreditCard className="h-7 w-7 text-blue-600" />
            Billing & Subscription
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your plan and view your subscription details.
          </p>
        </div>
        <Button onClick={loadData} variant="ghost" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Early Access Banner */}
      <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-4 py-3">
        <div className="flex items-start gap-3">
          <FlaskConical className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
                Early Access
              </span>
            </div>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              SSB is currently in early access. <strong>All plans are free during this period</strong> and
              no real charges will occur. When you test the checkout flow, use Stripe test card{' '}
              <code className="px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-xs font-mono">
                4242 4242 4242 4242
              </code>{' '}
              with any future expiry and CVC. Pricing will apply after general availability.
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="rounded-lg bg-green-50 border border-green-300 p-4 text-sm text-green-800 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div className="flex-1">{successMessage}</div>
          <Button variant="ghost" size="sm" onClick={() => setSuccessMessage(null)}>Dismiss</Button>
        </div>
      )}

      {/* Canceled Message */}
      {canceledMessage && (
        <div className="rounded-lg bg-amber-50 border border-amber-300 p-4 text-sm text-amber-800 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <div className="flex-1">{canceledMessage}</div>
          <Button variant="ghost" size="sm" onClick={() => setCanceledMessage(null)}>Dismiss</Button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-300 p-4 text-sm text-red-800 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div className="flex-1">{error}</div>
          <Button variant="ghost" size="sm" onClick={() => setError(null)}>Dismiss</Button>
        </div>
      )}

      {/* Billing not enabled banner */}
      {!billingEnabled && (
        <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-800 p-4 text-sm text-amber-800 dark:text-amber-200">
          <strong>Note:</strong> Billing is currently in test mode.
          All features are available during early access. No real charges will occur.
        </div>
      )}

      {/* Current Plan */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Current Plan</h2>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${hasUnlimitedAccess(currentPlanName) ? 'bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30' : 'bg-primary/10'}`}>
            {getPlanIcon(currentPlanName)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xl font-bold">{getPlanDisplayName(currentPlanName)}</p>
              <PlanBadge planName={currentPlanName} />
            </div>
            <p className="text-sm text-muted-foreground">
              {hasUnlimitedAccess(currentPlanName)
                ? 'Full access - All features unlocked'
                : hasActiveSubscription
                  ? 'Active subscription'
                  : 'No active paid subscription'}
            </p>
          </div>
          {subscription?.subscription && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Next billing</p>
              <p className="font-medium">
                {subscription.subscription.current_period_end
                  ? new Date(subscription.subscription.current_period_end).toLocaleDateString()
                  : '—'}
              </p>
            </div>
          )}
        </div>

        {/* Manage Billing Button for paid users */}
        {hasActiveSubscription && billingEnabled && (
          <div className="mt-4 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleManageBilling}
              disabled={portalLoading}
            >
              {portalLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4 mr-2" />
              )}
              Manage Billing
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Update payment method, view invoices, or cancel subscription
            </p>
          </div>
        )}
      </div>

      {/* Plan Features */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Your Plan Features</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium">Regime Analysis</p>
              <p className="text-sm text-muted-foreground">
                {entitlements?.regime_insights_delay_days === 0 || entitlements?.is_founder || entitlements?.is_full_access
                  ? 'Real-time access'
                  : `${entitlements?.regime_insights_delay_days || 7}-day delayed data`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium">Risk Analytics</p>
              <p className="text-sm text-muted-foreground capitalize">
                {(entitlements?.is_founder || entitlements?.is_full_access) ? 'Full' : (entitlements?.risk_analytics_level || 'basic')} tier
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium">Simulations</p>
              <p className="text-sm text-muted-foreground">
                {entitlements?.is_founder || entitlements?.is_full_access || isUnlimited(entitlements?.simulation_limit)
                  ? 'Unlimited'
                  : `Up to ${formatLimit(entitlements?.simulation_limit)} runs`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium">Stress Testing</p>
              <p className="text-sm text-muted-foreground">
                {entitlements?.stress_test_enabled || entitlements?.is_founder || entitlements?.is_full_access
                  ? ((entitlements?.is_founder || entitlements?.is_full_access) ? 'Full access' : `${entitlements?.stress_test_tier} tier`)
                  : 'Requires Pro plan'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium">Asset Classes</p>
              <p className="text-sm text-muted-foreground">
                {(entitlements?.is_founder || entitlements?.is_full_access) ? 'All' : `${entitlements?.asset_classes?.length || 1} available`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium">API Requests</p>
              <p className="text-sm text-muted-foreground">
                {entitlements?.is_founder || entitlements?.is_full_access || isUnlimited(entitlements?.daily_api_requests_limit)
                  ? 'Unlimited'
                  : `${formatLimit(entitlements?.daily_api_requests_limit)}/day`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Benefits */}
      {entitlements?.can_upgrade && entitlements?.upgrade_benefits && entitlements.upgrade_benefits.length > 0 && (
        <div className="rounded-lg border bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            Upgrade Benefits
          </h2>
          <ul className="space-y-2 mb-4">
            {entitlements.upgrade_benefits.map((benefit, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Available Plans */}
      {plans && plans.plans.length > 0 && (
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-2">Available Plans</h2>
          <p className="text-sm text-muted-foreground mb-4">
            During early access, all features are available at no cost.
            Select a plan to set your feature tier—no real charges will occur.
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {plans.plans.map((plan) => {
              const isCurrentPlan = plan.name.toLowerCase() === currentPlanName.toLowerCase();
              const canUpgrade = !isCurrentPlan && plan.price_monthly > 0;
              const isLoading = checkoutLoading === plan.name;
              const features = PLAN_FEATURES[plan.name.toLowerCase()] || [];

              return (
                <div
                  key={plan.id}
                  className={`rounded-lg border p-4 flex flex-col ${
                    isCurrentPlan
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'hover:border-primary/50'
                  }`}
                >
                  {isCurrentPlan && (
                    <div className="text-xs font-medium text-primary mb-2">Current Plan</div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    {getPlanIcon(plan.name)}
                    <h3 className="font-semibold">{getPlanDisplayName(plan.name)}</h3>
                  </div>
                  <p className="text-2xl font-bold mb-1">
                    {plan.price_monthly === 0 ? (
                      'Free'
                    ) : (
                      <>
                        ${plan.price_monthly}
                        <span className="text-sm font-normal text-muted-foreground">/mo</span>
                      </>
                    )}
                  </p>
                  {plan.description && (
                    <p className="text-xs text-muted-foreground mb-3">{plan.description}</p>
                  )}

                  {/* Feature bullets */}
                  {features.length > 0 && (
                    <ul className="text-xs space-y-1.5 mb-4 flex-1">
                      {features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Action button */}
                  <div className="mt-auto pt-2">
                    {isCurrentPlan ? (
                      <div className="text-sm text-primary font-medium text-center py-1.5">
                        ✓ Active
                      </div>
                    ) : canUpgrade ? (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!billingEnabled || isLoading}
                        className="w-full"
                        onClick={() => handleUpgrade(plan.name)}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : billingEnabled ? (
                          'Upgrade'
                        ) : (
                          'Coming Soon'
                        )}
                      </Button>
                    ) : (
                      <div className="text-sm text-muted-foreground text-center py-1.5">
                        Free forever
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Feature Comparison Table - Grouped by Category */}
      <div className="rounded-lg border bg-card p-6 overflow-x-auto">
        <h2 className="text-lg font-semibold mb-4">Feature Comparison</h2>
        <table className="table-compare">
          <thead>
            <tr className="border-b border-border">
              <th>Feature</th>
              <th className={currentPlanName.toLowerCase() === 'free' ? 'bg-primary/10' : ''}>Free</th>
              <th className={currentPlanName.toLowerCase() === 'starter' ? 'bg-primary/10' : ''}>Starter</th>
              <th className={currentPlanName.toLowerCase() === 'pro' ? 'bg-primary/10' : ''}>Pro</th>
              <th className={currentPlanName.toLowerCase() === 'institutional' ? 'bg-primary/10' : ''}>Institutional</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_SECTIONS.map((section) => (
              <>
                {/* Section Header Row */}
                <tr key={section.section} className="bg-muted/50">
                  <td colSpan={5} className="font-semibold text-xs uppercase tracking-wide text-muted-foreground py-2">
                    {section.section}
                  </td>
                </tr>
                {/* Feature Rows */}
                {section.features.map((row) => (
                  <tr key={row.label}>
                    <td className="pl-4">{row.label}</td>
                    <td className={currentPlanName.toLowerCase() === 'free' ? 'bg-primary/5' : ''}>
                      {typeof row.free === 'boolean' ? (
                        row.free ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                      ) : (
                        row.free
                      )}
                    </td>
                    <td className={currentPlanName.toLowerCase() === 'starter' ? 'bg-primary/5' : ''}>
                      {typeof row.starter === 'boolean' ? (
                        row.starter ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                      ) : (
                        row.starter
                      )}
                    </td>
                    <td className={currentPlanName.toLowerCase() === 'pro' ? 'bg-primary/5' : ''}>
                      {typeof row.pro === 'boolean' ? (
                        row.pro ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                      ) : (
                        row.pro
                      )}
                    </td>
                    <td className={currentPlanName.toLowerCase() === 'institutional' ? 'bg-primary/5' : ''}>
                      {typeof row.institutional === 'boolean' ? (
                        row.institutional ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                      ) : (
                        row.institutional
                      )}
                    </td>
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Early Access FAQ */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="font-semibold mb-4">Early Access FAQ</h3>
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-medium text-foreground">Is SSB free right now?</p>
            <p className="text-muted-foreground mt-1">
              Yes. During early access, all plan features are available at no cost.
              No real payments are processed.
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">Will I be charged automatically later?</p>
            <p className="text-muted-foreground mt-1">
              No. When billing goes live after general availability, you will be notified in advance
              and must explicitly choose a paid plan. There are no automatic charges.
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">Why show pricing during early access?</p>
            <p className="text-muted-foreground mt-1">
              Displaying plan tiers helps us test feature gating, gather feedback on value perception,
              and prepare for launch. Your input during this phase is valuable.
            </p>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-4 text-sm text-slate-800 dark:text-slate-200">
        <strong>Secure Payments:</strong> All payments are processed securely through Stripe.
        We never store your payment information on our servers.
      </div>
    </div>
  );
}

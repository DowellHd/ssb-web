'use client';

import { useEffect, useState } from 'react';
import { CreditCard, RefreshCw, AlertCircle, CheckCircle, Zap, Crown, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCapabilities, type Capabilities } from '@/lib/api/meta';
import { getSubscription, listPlans, type SubscriptionResponse, type PlanListResponse } from '@/lib/api/billing';
import { getIntelligenceEntitlements, type EntitlementsInfo } from '@/lib/api/intelligence';

export default function BillingPage() {
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [plans, setPlans] = useState<PlanListResponse | null>(null);
  const [entitlements, setEntitlements] = useState<EntitlementsInfo | null>(null);
  const [capabilities, setCapabilities] = useState<Capabilities | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'pro':
        return <Zap className="h-6 w-6 text-blue-500" />;
      case 'institutional':
        return <Building className="h-6 w-6 text-purple-500" />;
      default:
        return <Crown className="h-6 w-6 text-slate-500" />;
    }
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

  if (error) {
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

  return (
    <div className="space-y-6 max-w-4xl">
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

      {/* Billing not enabled banner */}
      {!billingEnabled && (
        <div className="rounded-lg bg-amber-50 border border-amber-300 p-4 text-sm text-slate-800">
          <strong>Note:</strong> Billing integration is not yet configured.
          You are currently on the Free plan with all basic features available.
          Upgrade options will be available soon.
        </div>
      )}

      {/* Current Plan */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Current Plan</h2>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            {getPlanIcon(entitlements?.plan_name || 'free')}
          </div>
          <div className="flex-1">
            <p className="text-xl font-bold">{entitlements?.plan_display_name || 'Free'}</p>
            <p className="text-sm text-muted-foreground">
              {subscription?.subscription?.status === 'active'
                ? `Active subscription`
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
                {entitlements?.regime_insights_delay_days === 0
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
                {entitlements?.risk_analytics_level || 'basic'} tier
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium">Simulations</p>
              <p className="text-sm text-muted-foreground">
                Up to {entitlements?.simulation_limit?.toLocaleString() || '100'} runs
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {entitlements?.stress_test_enabled ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">Stress Testing</p>
              <p className="text-sm text-muted-foreground">
                {entitlements?.stress_test_enabled
                  ? `${entitlements?.stress_test_tier} tier`
                  : 'Requires Pro plan'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium">Asset Classes</p>
              <p className="text-sm text-muted-foreground">
                {entitlements?.asset_classes?.length || 1} available
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium">API Requests</p>
              <p className="text-sm text-muted-foreground">
                {entitlements?.daily_api_requests_limit?.toLocaleString() || '100'}/day
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Benefits */}
      {entitlements?.can_upgrade && entitlements?.upgrade_benefits && entitlements.upgrade_benefits.length > 0 && (
        <div className="rounded-lg border bg-gradient-to-r from-blue-50 to-purple-50 p-6">
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
          <Button disabled={!billingEnabled}>
            {billingEnabled ? 'Upgrade Now' : 'Upgrade Coming Soon'}
          </Button>
        </div>
      )}

      {/* Available Plans */}
      {plans && plans.plans.length > 0 && (
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Available Plans</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {plans.plans.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-lg border p-4 ${
                  plan.name === entitlements?.plan_name
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {getPlanIcon(plan.name)}
                  <h3 className="font-semibold">{plan.display_name}</h3>
                </div>
                <p className="text-2xl font-bold mb-2">
                  ${plan.price_monthly}
                  <span className="text-sm font-normal text-muted-foreground">/mo</span>
                </p>
                {plan.description && (
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                )}
                {plan.name === entitlements?.plan_name ? (
                  <span className="text-sm text-primary font-medium">Current Plan</span>
                ) : (
                  <Button variant="outline" size="sm" disabled={!billingEnabled} className="w-full">
                    {billingEnabled ? 'Select' : 'Coming Soon'}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info banner */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-slate-800">
        <strong>Secure Payments:</strong> All payments are processed securely through Stripe.
        We never store your payment information on our servers.
      </div>
    </div>
  );
}

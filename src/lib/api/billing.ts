/**
 * Billing API functions.
 */
import { apiClient } from '../api-client';

// ============================================================================
// Types
// ============================================================================

export interface PlanFeature {
  id: string;
  name: string;
  description?: string;
  value: string;
  is_enabled: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  price_monthly: number;
  price_yearly?: number;
  features: PlanFeature[];
  is_popular?: boolean;
}

export interface PlanListResponse {
  plans: SubscriptionPlan[];
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  billing_cycle: 'monthly' | 'yearly';
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  created_at: string;
}

export interface SubscriptionResponse {
  subscription?: UserSubscription;
  message?: string;
}

export interface CheckoutResponse {
  checkout_url: string;
  session_id: string;
}

export interface BillingPortalResponse {
  portal_url: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * List all subscription plans (public endpoint).
 */
export async function listPlans(): Promise<PlanListResponse> {
  const response = await apiClient.get('/billing/plans');
  return response.data;
}

/**
 * Get current user's subscription.
 */
export async function getSubscription(): Promise<SubscriptionResponse> {
  const response = await apiClient.get('/billing/subscription');
  return response.data;
}

/**
 * Create a checkout session for upgrading.
 */
export async function createCheckoutSession(params: {
  plan_name: string;
  billing_cycle: 'monthly' | 'yearly';
  success_url?: string;
  cancel_url?: string;
}): Promise<CheckoutResponse> {
  const response = await apiClient.post('/billing/checkout', params);
  return response.data;
}

/**
 * Cancel current subscription.
 */
export async function cancelSubscription(): Promise<{ message: string; subscription: UserSubscription }> {
  const response = await apiClient.post('/billing/cancel');
  return response.data;
}

/**
 * Get billing portal URL.
 */
export async function getBillingPortal(): Promise<BillingPortalResponse> {
  const response = await apiClient.post('/billing/portal');
  return response.data;
}

/**
 * Admin API client functions.
 *
 * Link checker endpoints require admin role.
 * User analytics endpoint requires founder role (admin + FOUNDER_EMAILS).
 */
import { apiClient } from '../api-client';

// ============================================================================
// Types — Link Checker
// ============================================================================

export type LinkStatus = 'unchecked' | 'active' | 'broken' | 'redirected' | 'timeout';
export type ResourceType = 'video' | 'external';

export interface LinkCheckResult {
  id: string;
  module_id: string;
  resource_type: ResourceType;
  resource_label: string;
  url: string;
  link_status: LinkStatus;
  http_status_code: number | null;
  last_checked_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface LinkChecksListResponse {
  items: LinkCheckResult[];
  total: number;
  broken_count: number;
  active_count: number;
  unchecked_count: number;
}

export interface LinkCheckRunResponse {
  checked: number;
  active: number;
  broken: number;
  redirected: number;
  timeout: number;
  errors: number;
}

export interface SingleRecheckResponse {
  id: string;
  url: string;
  link_status: LinkStatus;
  http_status_code: number | null;
  error_message: string | null;
  checked_at: string;
}

// ============================================================================
// Types — User Analytics
// ============================================================================

export interface UserStatusBreakdown {
  total_ever_registered: number;
  total_current: number;
  total_active: number;
  total_inactive: number;
  total_deleted: number;
  total_email_verified: number;
  total_mfa_enabled: number;
}

export interface PlanBreakdown {
  plan_name: string;
  price_monthly_usd: number;
  total_subscribers: number;
  active_subscriptions: number;
  trialing_subscriptions: number;
  past_due_subscriptions: number;
  canceled_subscriptions: number;
  paused_subscriptions: number;
  cancel_at_period_end_count: number;
}

export interface SubscriptionLifecycle {
  plan_name: string;
  ever_subscribed: number;
  currently_active: number;
  churned: number;
  churn_rate_pct: number;
  avg_subscription_days: number | null;
}

export interface MonthlyRegistration {
  month: string;
  new_users: number;
}

export interface RevenueEstimate {
  mrr_usd: number;
  arr_usd: number;
  paying_plan_breakdown: Array<{
    plan_name: string;
    active_count: number;
    mrr_contribution: number;
  }>;
}

export interface ActivityMetrics {
  dau: number;
  mau: number;
  dau_mau_ratio: number;
  users_never_logged_in: number;
}

export interface ChurnMetrics {
  subscriptions_canceled_30d: number;
  subscriptions_canceled_90d: number;
  users_deleted_30d: number;
  users_deleted_90d: number;
}

export interface UserAnalyticsResponse {
  // Top-level (backward compat)
  total_users: number;
  paid_users: number;
  unpaid_users: number;
  users_without_subscription: number;
  new_users_last_30_days: number;
  new_users_last_7_days: number;
  // Enhanced breakdowns
  user_status: UserStatusBreakdown;
  plan_breakdown: PlanBreakdown[];
  subscription_lifecycle: SubscriptionLifecycle[];
  monthly_registrations: MonthlyRegistration[];
  revenue_estimate: RevenueEstimate;
  activity: ActivityMetrics;
  churn: ChurnMetrics;
  // Metadata
  cached: boolean;
  as_of: string;
}

// ============================================================================
// API Functions — Link Checker
// ============================================================================

export interface LinkChecksParams {
  link_status?: LinkStatus;
  resource_type?: ResourceType;
  module_id?: string;
}

export async function getLinkChecks(
  params: LinkChecksParams = {}
): Promise<LinkChecksListResponse> {
  const response = await apiClient.get<LinkChecksListResponse>('/admin/link-checks', {
    params,
  });
  return response.data;
}

export async function runAllLinkChecks(): Promise<LinkCheckRunResponse> {
  const response = await apiClient.post<LinkCheckRunResponse>('/admin/link-checks/run');
  return response.data;
}

export async function recheckLink(linkId: string): Promise<SingleRecheckResponse> {
  const response = await apiClient.post<SingleRecheckResponse>(
    `/admin/link-checks/${linkId}/recheck`
  );
  return response.data;
}

// ============================================================================
// API Functions — User Analytics
// ============================================================================

export async function getUserAnalytics(): Promise<UserAnalyticsResponse> {
  const response = await apiClient.get<UserAnalyticsResponse>('/admin/user-analytics');
  return response.data;
}

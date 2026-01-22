/**
 * Meta API functions for capabilities, audit logs, and dashboard data.
 */
import { apiClient } from '../api-client';

// ============================================================================
// Types
// ============================================================================

export interface Capabilities {
  email_enabled: boolean;
  billing_enabled: boolean;
  mfa_enabled: boolean;
  live_trading_enabled: boolean;
  backtests_enabled: boolean;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  ip_address?: string;
  user_agent?: string;
  success: boolean;
  error_message?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface AuditLogListResponse {
  logs: AuditLogEntry[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export interface DashboardSummary {
  user_id: string;
  email: string;
  full_name?: string;
  email_verified: boolean;
  mfa_enabled: boolean;
  plan_name: string;
  plan_display_name: string;
  backtests_count: number;
  recent_login_count: number;
  member_since: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get system capabilities (public endpoint).
 */
export async function getCapabilities(): Promise<Capabilities> {
  const response = await apiClient.get('/meta/capabilities');
  return response.data;
}

/**
 * Get audit logs for the current user.
 */
export async function getAuditLogs(params?: {
  page?: number;
  page_size?: number;
  action?: string;
}): Promise<AuditLogListResponse> {
  const response = await apiClient.get('/meta/audit-logs', { params });
  return response.data;
}

/**
 * Get dashboard summary for the current user.
 */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await apiClient.get('/meta/dashboard');
  return response.data;
}

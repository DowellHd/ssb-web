/**
 * Privacy and data management API client.
 *
 * Endpoints map to /api/v1/privacy/* on the backend.
 * The backend privacy service is fully implemented — this file provides
 * the typed frontend interface.
 */
import { apiClient } from '../api-client';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PrivacyPreferences {
  /** Consent for analytics and usage tracking */
  analytics_consent: boolean;
  /** Enable transactional email notifications */
  email_notifications: boolean;
  /** Email confirmations for paper/live trades */
  trade_confirmations: boolean;
  /** Receive marketing and product update emails */
  marketing_emails: boolean;
  /** UI theme preference */
  theme: 'light' | 'dark';
}

export type PrivacyPreferencesUpdate = Partial<PrivacyPreferences>;

export interface DataExportSession {
  id: string;
  device_info: {
    ip_address?: string;
    user_agent?: string;
    device_name?: string;
  };
  last_used_at: string;
  created_at: string;
  is_current: boolean;
}

export interface DataExportAuditLog {
  action: string;
  success: boolean;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown> | null;
  error_message: string | null;
  created_at: string;
}

export interface DataExport {
  export_metadata: {
    exported_at: string;
    user_id: string;
    format_version: string;
  };
  profile: {
    email: string;
    full_name: string | null;
    phone_number: string | null;
    email_verified: boolean;
    role: string;
    is_active: boolean;
    is_locked: boolean;
    created_at: string;
    updated_at: string;
    last_login_at: string | null;
  };
  security: {
    mfa_enabled: boolean;
    unused_backup_codes_count: number;
    failed_login_attempts: number;
    locked_until: string | null;
  };
  permissions: {
    paper_trading_approved: boolean;
    live_trading_approved: boolean;
  };
  preferences: PrivacyPreferences;
  sessions: DataExportSession[];
  audit_logs: DataExportAuditLog[];
}

// ── API calls ─────────────────────────────────────────────────────────────────

export async function getPrivacyPreferences(): Promise<PrivacyPreferences> {
  const res = await apiClient.get<PrivacyPreferences>('/privacy/preferences');
  return res.data;
}

export async function updatePrivacyPreferences(
  updates: PrivacyPreferencesUpdate
): Promise<PrivacyPreferences> {
  const res = await apiClient.put<PrivacyPreferences>('/privacy/preferences', updates);
  return res.data;
}

export async function exportUserData(): Promise<DataExport> {
  const res = await apiClient.get<DataExport>('/privacy/export');
  return res.data;
}

export async function deleteAccount(): Promise<{ message: string }> {
  const res = await apiClient.delete<{ message: string }>('/privacy/account');
  return res.data;
}

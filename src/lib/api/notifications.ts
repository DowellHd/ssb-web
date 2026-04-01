/**
 * User notification preferences API client.
 */
import { apiClient } from '../api-client';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AlertThresholds {
  portfolio_drawdown_pct: number;
  position_loss_pct: number;
  paper_drawdown_pct: number;
}

export interface NotificationPreferences {
  // Email
  email_security_alerts: boolean;
  email_billing: boolean;
  email_portfolio_summary: boolean;
  email_signal_alerts: boolean;
  email_price_alerts: boolean;
  email_news_digest: boolean;
  email_paper_trade_fills: boolean;
  email_product_updates: boolean;
  // In-app
  push_signal_alerts: boolean;
  push_portfolio_alerts: boolean;
  push_paper_trade_fills: boolean;
  push_earnings_reminders: boolean;
  push_community_activity: boolean;
  // Thresholds
  thresholds: AlertThresholds;
  updated_at: string;
}

export type NotificationPreferencesUpdate = Partial<
  Omit<NotificationPreferences, 'updated_at'>
>;

// ── API calls ─────────────────────────────────────────────────────────────────

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const res = await apiClient.get<NotificationPreferences>('/settings/notifications');
  return res.data;
}

export async function updateNotificationPreferences(
  update: NotificationPreferencesUpdate
): Promise<NotificationPreferences> {
  const res = await apiClient.put<NotificationPreferences>(
    '/settings/notifications',
    update
  );
  return res.data;
}

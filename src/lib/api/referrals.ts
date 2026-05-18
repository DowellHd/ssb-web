/**
 * Referrals API functions.
 */
import { apiClient } from '../api-client';

// ============================================================================
// Types
// ============================================================================

export interface ReferralStats {
  referral_code: string | null;
  total_referrals: number;
  converted: number;
  pending: number;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get the current user's referral code and stats.
 */
export async function getMyReferralCode(): Promise<ReferralStats> {
  const response = await apiClient.get('/referrals/my-code');
  return response.data;
}

/**
 * Apply a referral code for the current user.
 */
export async function applyReferralCode(code: string): Promise<void> {
  await apiClient.post('/referrals/apply', { code });
}

/**
 * NPS (Net Promoter Score) API functions.
 */
import { apiClient } from '../api-client';

// ============================================================================
// Types
// ============================================================================

export interface NpsStatus {
  has_responded: boolean;
  days_since_signup: number;
  should_show: boolean;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get NPS survey status for the current user.
 */
export async function getNpsStatus(): Promise<NpsStatus> {
  const response = await apiClient.get('/nps/status');
  return response.data;
}

/**
 * Submit an NPS score and optional comment.
 */
export async function submitNps(score: number, comment?: string): Promise<void> {
  await apiClient.post('/nps', { score, comment });
}

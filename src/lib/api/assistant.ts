/**
 * Assistant API functions for SSB Assistant chat.
 */
import { apiClient } from '../api-client';

// ============================================================================
// Types
// ============================================================================

export interface Citation {
  source: string;
  url: string | null;
  snippet: string | null;
}

export interface ChatRequest {
  message: string;
  thread_id?: string | null;
}

export interface ChatResponse {
  reply: string;
  thread_id: string;
  citations: Citation[];
  safety_flags: string[];
  disclaimer: string;
}

export interface AccountSummary {
  plan_name: string;
  plan_display_name: string;
  billing_portal_url: string | null;
  last_invoice_date: string | null;
  last_invoice_amount: number | null;
  subscription_status: string | null;
  current_period_end: string | null;
}

export interface ClearThreadResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Send a message to the SSB Assistant.
 */
export async function sendMessage(data: ChatRequest): Promise<ChatResponse> {
  const response = await apiClient.post('/assistant/chat', data);
  return response.data;
}

/**
 * Clear a conversation thread.
 */
export async function clearThread(threadId: string): Promise<ClearThreadResponse> {
  const response = await apiClient.delete(`/assistant/thread/${threadId}`);
  return response.data;
}

/**
 * Get account summary for support queries.
 */
export async function getAccountSummary(): Promise<AccountSummary> {
  const response = await apiClient.get('/assistant/account-summary');
  return response.data;
}

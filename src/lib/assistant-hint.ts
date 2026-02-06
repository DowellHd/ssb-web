/**
 * Helper utilities for the SSB Assistant onboarding hint.
 * Manages localStorage persistence for first-time user detection.
 */

export const ASSISTANT_HINT_STORAGE_KEY = 'ssb.assistant_hint.v1.seen';

/**
 * Check if the user has already seen the assistant hint.
 * Returns false if localStorage is unavailable (SSR).
 */
export function hasSeenAssistantHint(): boolean {
  if (typeof window === 'undefined') return true; // SSR: assume seen
  try {
    return localStorage.getItem(ASSISTANT_HINT_STORAGE_KEY) === 'true';
  } catch {
    // localStorage blocked or unavailable
    return true;
  }
}

/**
 * Mark the assistant hint as seen in localStorage.
 * Safe to call during SSR (no-op).
 */
export function markAssistantHintSeen(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ASSISTANT_HINT_STORAGE_KEY, 'true');
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[assistant-hint] marked as seen');
    }
  } catch {
    // localStorage blocked or unavailable
  }
}

/**
 * Reset the assistant hint so it shows again.
 * Dev-only utility for testing.
 */
export function resetAssistantHint(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ASSISTANT_HINT_STORAGE_KEY);
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[assistant-hint] reset - will show on next page load');
    }
  } catch {
    // localStorage blocked or unavailable
  }
}

/**
 * Expose dev-only reset function on window for console testing.
 * Only runs in non-production environments.
 */
export function initAssistantHintDevTools(): void {
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV !== 'production') {
    (window as any).__SSB_RESET_ASSISTANT_HINT__ = () => {
      resetAssistantHint();
      console.log('Assistant hint reset. Refresh the page to see it again.');
    };
  }
}

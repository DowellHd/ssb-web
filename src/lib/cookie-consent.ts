/**
 * Cookie consent utilities.
 * localStorage is the source of truth for whether analytics fires.
 * Consent expires after 12 months and re-asks the user.
 */

export const CONSENT_KEY = 'ssb_cookie_consent';
export const CONSENT_TS_KEY = 'ssb_cookie_consent_ts';

const CONSENT_TTL_MS = 365 * 24 * 60 * 60 * 1000; // 12 months

export type ConsentDecision = 'accepted' | 'declined';

/**
 * Returns the stored consent decision, or null if the user has not decided
 * (first visit or consent has expired).
 */
export function getCookieConsent(): ConsentDecision | null {
  if (typeof window === 'undefined') return null;
  try {
    const decision = localStorage.getItem(CONSENT_KEY) as ConsentDecision | null;
    if (!decision) return null;

    const ts = localStorage.getItem(CONSENT_TS_KEY);
    if (ts && Date.now() - parseInt(ts, 10) > CONSENT_TTL_MS) {
      localStorage.removeItem(CONSENT_KEY);
      localStorage.removeItem(CONSENT_TS_KEY);
      return null;
    }
    return decision;
  } catch {
    return null;
  }
}

/**
 * Persists the consent decision and notifies other components via a custom
 * window event so the PostHog provider and privacy settings page stay in sync.
 */
export function setCookieConsent(decision: ConsentDecision): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CONSENT_KEY, decision);
    localStorage.setItem(CONSENT_TS_KEY, Date.now().toString());
    window.dispatchEvent(
      new CustomEvent('ssb:consent-changed', { detail: { decision } })
    );
  } catch { /* storage unavailable — silent fail */ }
}

export function clearCookieConsent(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CONSENT_KEY);
    localStorage.removeItem(CONSENT_TS_KEY);
  } catch { /* ignore */ }
}

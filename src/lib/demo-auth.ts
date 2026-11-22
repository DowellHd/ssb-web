/**
 * Demo session utilities.
 * Handles one-click demo login, session storage, and expiry.
 */

import { ASSISTANT_HINT_STORAGE_KEY } from '@/lib/assistant-hint';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX || '/api/v1';

/**
 * Local demo build (NEXT_PUBLIC_DEMO_MODE=true): no backend exists, so the demo
 * session is created locally and never expires. With the flag off, behaviour is
 * unchanged and the real /auth/demo-login endpoint is used.
 */
const IS_DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export async function startDemoSession(): Promise<void> {
  let data: { access_token: string };

  if (IS_DEMO_MODE) {
    data = { access_token: 'demo-token-not-a-real-credential' };
  } else {
    const response = await fetch(`${API_URL}${API_PREFIX}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Too many demo requests. Please try again in a moment.');
      }
      if (response.status === 404) {
        throw new Error('Demo is not available right now.');
      }
      throw new Error('Demo is temporarily unavailable. Please try again.');
    }

    data = await response.json();
  }

  if (typeof window !== 'undefined') {
    sessionStorage.setItem('access_token', data.access_token);
    localStorage.setItem('is_demo_session', 'true');
    localStorage.setItem('demo_start_time', Date.now().toString());
    // Reset hint so every new demo session sees the assistant popup
    localStorage.removeItem(ASSISTANT_HINT_STORAGE_KEY);
    // Clear any stale logged-in cookie from a previous session
    document.cookie = `ssb_logged_in=demo; path=/; SameSite=Lax; Max-Age=${IS_DEMO_MODE ? 604800 : 1800}`;
  }

  if (typeof window !== 'undefined' && (window as any).posthog) {
    (window as any).posthog.capture('demo_session_started');
  }
}

export function clearDemoSession(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('access_token');
  localStorage.removeItem('is_demo_session');
  localStorage.removeItem('demo_start_time');
  document.cookie = 'ssb_logged_in=; path=/; SameSite=Lax; Max-Age=0';
}

export function isDemoSession(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('is_demo_session') === 'true';
}

export function getDemoTimeLeftMinutes(): number | null {
  if (typeof window === 'undefined') return null;
  // A local demo has no server-side session to expire.
  if (IS_DEMO_MODE) return null;
  const startTime = localStorage.getItem('demo_start_time');
  if (!startTime) return null;
  const elapsed = Date.now() - parseInt(startTime, 10);
  const remaining = Math.max(0, 30 * 60 * 1000 - elapsed);
  return Math.floor(remaining / 1000 / 60);
}

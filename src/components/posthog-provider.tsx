'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { getCookieConsent, type ConsentDecision } from '@/lib/cookie-consent';

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com';

// Track whether posthog.init() has been called. init() must only run once per
// page load. After that, use opt_in/opt_out to toggle capturing.
let _initialized = false;

/**
 * Initialize PostHog and begin capturing. Safe to call multiple times —
 * subsequent calls just opt back in after a previous decline.
 */
export function initPostHog(): void {
  if (!POSTHOG_KEY || typeof window === 'undefined') return;

  if (_initialized) {
    posthog.opt_in_capturing();
    return;
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: false, // captured manually in PageviewTracker
    capture_pageleave: true,
    persistence: 'localStorage',
    opt_out_capturing_by_default: false,
  });
  _initialized = true;
}

/**
 * Stop all PostHog capturing and clear any stored identity.
 * Called when the user declines consent or revokes it in settings.
 */
export function teardownPostHog(): void {
  if (typeof window === 'undefined') return;
  try {
    posthog.opt_out_capturing();
    posthog.reset();
    // Remove PostHog keys from localStorage
    Object.keys(localStorage)
      .filter((k) => k.startsWith('ph_') || k.startsWith('__ph_'))
      .forEach((k) => localStorage.removeItem(k));
  } catch { /* ignore */ }
}

function PageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!POSTHOG_KEY) return;
    // Only fire if the user has accepted — consent may change between renders
    if (getCookieConsent() !== 'accepted') return;
    const url =
      pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    posthog.capture('$pageview', { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize on mount if the user has already accepted
    if (getCookieConsent() === 'accepted') {
      initPostHog();
    }

    // React to banner/settings changes in the same tab
    const handler = (e: Event) => {
      const { decision } = (e as CustomEvent<{ decision: ConsentDecision }>).detail;
      if (decision === 'accepted') {
        initPostHog();
      } else {
        teardownPostHog();
      }
    };
    window.addEventListener('ssb:consent-changed', handler);
    return () => window.removeEventListener('ssb:consent-changed', handler);
  }, []);

  if (!POSTHOG_KEY) return <>{children}</>;

  return (
    <PHProvider client={posthog}>
      <PageviewTracker />
      {children}
    </PHProvider>
  );
}

export { posthog };

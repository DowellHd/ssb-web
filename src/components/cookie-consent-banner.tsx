'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  getCookieConsent,
  setCookieConsent,
} from '@/lib/cookie-consent';
import { initPostHog, teardownPostHog } from '@/components/posthog-provider';

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show the banner only if no decision has been made (first visit or expired)
    if (getCookieConsent() === null) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const accept = () => {
    setCookieConsent('accepted');
    initPostHog();
    setVisible(false);
  };

  const decline = () => {
    setCookieConsent('declined');
    teardownPostHog();
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className={cn(
        'fixed bottom-0 left-0 right-0 z-[100]',
        'border-t border-border/60 bg-card/95 backdrop-blur-sm',
        'px-4 py-3 shadow-[0_-4px_24px_rgba(0,0,0,0.4)]',
        'motion-safe:animate-in motion-safe:slide-in-from-bottom motion-safe:duration-300',
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
        <p className="flex-1 text-sm text-muted-foreground leading-relaxed">
          We use cookies to improve your experience and analyze usage.{' '}
          <Link
            href="/privacy"
            className="text-foreground underline underline-offset-2 hover:no-underline"
          >
            See our Privacy Policy.
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={decline}
            className="text-muted-foreground hover:text-foreground"
          >
            Decline
          </Button>
          <Button size="sm" onClick={accept}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}

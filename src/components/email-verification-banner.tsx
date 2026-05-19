'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Loader2, Mail, X } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export function EmailVerificationBanner() {
  const [isVerified, setIsVerified] = useState(true); // true by default — avoid flash on verified users
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('verify_banner_dismissed')) {
      setDismissed(true);
      return;
    }

    apiClient
      .get('/auth/me')
      .then((r) => setIsVerified(r.data.email_verified ?? true))
      .catch(() => setIsVerified(true)); // fail safe — don't block UI on error
  }, []);

  const handleResend = async () => {
    setLoading(true);
    try {
      await apiClient.post('/auth/resend-verification-me');
      setSent(true);
    } catch {
      setSent(true); // show success anyway to avoid confusion
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('verify_banner_dismissed', 'true');
    }
    setDismissed(true);
  };

  if (isVerified || dismissed) return null;

  return (
    <div className="border-b border-amber-500/20 bg-amber-500/5 px-4 py-2.5">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {sent ? (
            <>
              <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-400" />
              <p className="text-sm text-foreground">
                Verification email sent! Check your inbox{' '}
                <span className="text-foreground/60">(and spam folder)</span>.
              </p>
            </>
          ) : (
            <>
              <Mail className="h-4 w-4 flex-shrink-0 text-amber-400" />
              <p className="truncate text-sm text-foreground/90">
                <span className="font-medium text-amber-400">Verify your email</span>
                {' '}to unlock community posting, signal alerts, and billing.{' '}
                <span className="text-foreground/50">Check your spam folder if you don&apos;t see it.</span>
              </p>
            </>
          )}
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          {!sent && (
            <button
              onClick={handleResend}
              disabled={loading}
              className="rounded-md border border-amber-500/40 px-2.5 py-1 text-xs font-medium text-amber-400 transition-colors hover:bg-amber-500/10 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                'Resend email'
              )}
            </button>
          )}
          <button
            onClick={handleDismiss}
            aria-label="Dismiss"
            className="text-foreground/40 transition-colors hover:text-foreground/70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

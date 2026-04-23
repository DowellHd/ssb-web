'use client';

import { useState } from 'react';
import { AlertTriangle, BookOpen, CheckCircle, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { acceptDisclaimer } from '@/lib/api/signals';

interface OnboardingModalProps {
  onAccepted: () => void;
}

export function SignalsOnboardingModal({ onAccepted }: OnboardingModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    setLoading(true);
    setError(null);
    try {
      await acceptDisclaimer('1.0');
      onAccepted();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border bg-card shadow-2xl">
        {/* Header */}
        <div className="border-b px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Welcome to SSB Signals</h2>
              <p className="text-sm text-muted-foreground">Please read before continuing</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* What SSB is */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">What SSB Signals is</h3>
            <ul className="space-y-2">
              {[
                'An educational and analytical intelligence platform',
                'A tool that surfaces technical setups for your own research',
                'Similar to TradingView signals, Finviz alerts, or Koyfin analytics',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* What SSB is NOT */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">What SSB Signals is NOT</h3>
            <ul className="space-y-2">
              {[
                'A licensed broker-dealer or registered investment adviser',
                'A source of personalised financial advice or recommendations',
                'A service that executes or manages trades on your behalf',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Disclaimer block */}
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950/30">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
              <p className="text-xs leading-relaxed text-amber-900 dark:text-amber-200">
                All signals are for <strong>informational and educational purposes only</strong>.
                They do not constitute financial advice. Investing involves risk, including possible
                loss of principal. You are solely responsible for all trading decisions.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" aria-hidden="true" />
            <span>
              By clicking &quot;I Understand, Continue&quot; you acknowledge that you have read and
              agree to these terms (disclaimer v1.0). Your acceptance is recorded with a timestamp.
            </span>
          </div>

          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end gap-3">
          <Button onClick={handleAccept} disabled={loading} className="min-w-[180px]">
            {loading ? 'Saving…' : 'I Understand, Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}

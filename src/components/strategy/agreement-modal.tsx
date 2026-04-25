'use client';

import { useState } from 'react';
import { AlertTriangle, Brain, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { acceptAgreement } from '@/lib/api/strategy';

interface AgreementModalProps {
  onAccepted: () => void;
}

export function StrategyAgreementModal({ onAccepted }: AgreementModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    setLoading(true);
    setError(null);
    try {
      await acceptAgreement('1.0');
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
        <div className="border-b px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30">
              <Brain className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">AI Strategy Insights</h2>
              <p className="text-sm text-muted-foreground">Please read before continuing</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">What this feature does</h3>
            <ul className="space-y-2">
              {[
                'Uses AI to analyze your portfolio composition patterns',
                'Identifies concentration, diversification, and thematic characteristics',
                'Provides educational observations — not investment recommendations',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">What this feature does NOT do</h3>
            <ul className="space-y-2">
              {[
                'Provide personalised financial advice or recommendations',
                'Tell you what to buy, sell, or hold',
                'Guarantee any outcome or predict market performance',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950/30">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
              <p className="text-xs leading-relaxed text-amber-900 dark:text-amber-200">
                AI-generated insights are for <strong>educational purposes only</strong> and do not constitute
                financial advice. The analysis may be inaccurate, incomplete, or outdated.
                Always consult a qualified financial adviser before making investment decisions.
              </p>
            </div>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <div className="border-t px-6 py-4 flex justify-end gap-3">
          <Button onClick={handleAccept} disabled={loading} className="min-w-[180px]">
            {loading ? 'Saving…' : 'I Understand, Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}

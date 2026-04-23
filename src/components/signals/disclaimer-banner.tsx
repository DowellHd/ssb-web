'use client';

import { AlertTriangle } from 'lucide-react';

interface DisclaimerBannerProps {
  className?: string;
}

export function DisclaimerBanner({ className }: DisclaimerBannerProps) {
  return (
    <div
      role="note"
      className={`rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 dark:border-amber-700 dark:bg-amber-950/30 ${className ?? ''}`}
    >
      <div className="flex items-start gap-2.5">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-amber-900 dark:text-amber-200">
          <strong className="font-semibold">Disclaimer:</strong>{' '}
          SSB signals are for informational and educational purposes only and do not constitute
          financial advice. SSB is not a licensed broker-dealer or registered investment adviser.
          All trading decisions are solely yours. Always do your own research before investing.
        </p>
      </div>
    </div>
  );
}

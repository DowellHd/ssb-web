'use client';

import { AlertCircle } from 'lucide-react';

export function DisclaimerBanner() {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900">
      <AlertCircle className="h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-500" />
      <p className="text-xs text-amber-700 dark:text-amber-400">
        Educational only. Not financial advice. No trade execution.
      </p>
    </div>
  );
}

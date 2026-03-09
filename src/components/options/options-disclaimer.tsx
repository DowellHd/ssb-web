/**
 * Options disclaimer banner.
 *
 * Must be rendered on every page that displays options data, simulated
 * or otherwise. This component is not optional.
 */

import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OptionsDisclaimerProps {
  /** Include the simulated-data callout (default: true). */
  showSimulatedWarning?: boolean;
  className?: string;
}

export function OptionsDisclaimer({
  showSimulatedWarning = true,
  className,
}: OptionsDisclaimerProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-amber-200 bg-amber-50 px-4 py-3',
        'dark:border-amber-900 dark:bg-amber-950/30',
        className,
      )}
    >
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <div className="space-y-1 text-sm text-amber-700 dark:text-amber-400">
          <p>
            <strong>Options are complex instruments</strong> that carry
            significant risk, including the potential loss of the entire premium
            paid. This platform is for{' '}
            <strong>educational and simulation purposes only</strong>. No
            information presented here constitutes investment advice, a
            recommendation to buy or sell any security, or an offer to execute
            any transaction.
          </p>
          {showSimulatedWarning && (
            <p>
              <strong>Simulated data:</strong> All options chain data, pricing,
              and Greeks displayed are generated using an educational model and{' '}
              <strong>do not reflect real market prices</strong>. Values are
              approximations for learning purposes only.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useDemoSession } from '@/hooks/use-demo-session';

interface DemoRestrictedProps {
  /** Short description of the action, e.g. "save watchlists" or "connect your broker" */
  action: string;
  children: React.ReactNode;
}

/**
 * Wraps any interactive element that should be blocked in demo mode.
 * Clicking shows a "Sign up to continue" prompt instead of performing the action.
 *
 * Usage:
 *   <DemoRestricted action="connect your broker">
 *     <button onClick={handleConnect}>Connect Brokerage</button>
 *   </DemoRestricted>
 */
export function DemoRestricted({ action, children }: DemoRestrictedProps) {
  const { isDemo } = useDemoSession();
  const router = useRouter();
  const [showPrompt, setShowPrompt] = useState(false);

  if (!isDemo) return <>{children}</>;

  return (
    <>
      {/* Intercept clicks when in demo mode */}
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowPrompt(true);
        }}
        className="cursor-pointer"
      >
        {children}
      </div>

      {/* Inline modal prompt */}
      {showPrompt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowPrompt(false)}
        >
          <div
            className="bg-card border rounded-xl p-6 max-w-sm mx-4 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center mb-3">
              <div className="p-3 rounded-full bg-yellow-400/10">
                <Sparkles className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
            <h3 className="font-semibold text-base mb-1">Create a free account</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Sign up to {action} and unlock your full SSB experience.
            </p>
            <div className="flex flex-col gap-2">
              <button
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-yellow-400 text-black font-semibold text-sm hover:bg-yellow-300 transition-colors w-full"
                onClick={() => router.push('/auth/signup')}
              >
                Sign up free — takes 30 seconds
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                className="text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
                onClick={() => setShowPrompt(false)}
              >
                Continue exploring demo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

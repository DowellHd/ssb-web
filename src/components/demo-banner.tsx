'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { getDemoTimeLeftMinutes, isDemoSession, clearDemoSession } from '@/lib/demo-auth';

export function DemoBanner() {
  const router = useRouter();
  const [isDemo, setIsDemo] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!isDemoSession()) return;
    setIsDemo(true);
    setTimeLeft(getDemoTimeLeftMinutes());

    const interval = setInterval(() => {
      const mins = getDemoTimeLeftMinutes();
      setTimeLeft(mins);
      if (mins !== null && mins <= 0) {
        clearDemoSession();
        window.location.href = '/?demo_expired=true';
      }
    }, 30_000);

    return () => clearInterval(interval);
  }, []);

  if (!isDemo || dismissed) return null;

  return (
    <div className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-yellow-500/30">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Sparkles className="h-4 w-4 text-yellow-400 flex-shrink-0" />
          <p className="text-sm text-white truncate">
            <span className="font-semibold text-yellow-400">Demo Mode</span>
            {' '}— Exploring with sample data.
            {timeLeft !== null && timeLeft > 0 && (
              <span className="text-white/60 ml-1 hidden sm:inline">
                Session expires in {timeLeft} min.
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-yellow-400 text-black text-xs font-semibold hover:bg-yellow-300 transition-colors"
            onClick={() => router.push('/auth/signup')}
          >
            Sign up free
            <ArrowRight className="h-3 w-3" />
          </button>
          <button
            className="text-white/50 hover:text-white transition-colors p-1"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss demo banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

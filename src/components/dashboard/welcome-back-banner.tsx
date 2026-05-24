'use client';

import { useEffect, useState } from 'react';
import { Sparkles, X } from 'lucide-react';

const LAST_VISIT_KEY = 'ssb_last_visit_date';
const SESSION_DISMISSED_KEY = 'ssb_wb_dismissed';

function getTodayStr() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

interface WelcomeBackBannerProps {
  userName?: string | null;
}

export function WelcomeBackBanner({ userName }: WelcomeBackBannerProps) {
  const [show, setShow] = useState(false);
  const [lastVisit, setLastVisit] = useState<string | null>(null);

  useEffect(() => {
    const today = getTodayStr();
    const dismissed = sessionStorage.getItem(SESSION_DISMISSED_KEY) === today;
    if (dismissed) return;

    const stored = localStorage.getItem(LAST_VISIT_KEY);
    if (stored && stored !== today) {
      setLastVisit(stored);
      setShow(true);
    }
    // Always update last visit to today
    localStorage.setItem(LAST_VISIT_KEY, today);
  }, []);

  function dismiss() {
    sessionStorage.setItem(SESSION_DISMISSED_KEY, getTodayStr());
    setShow(false);
  }

  if (!show || !lastVisit) return null;

  const displayName = userName?.split(' ')[0] ?? null;
  const visitDate = new Date(lastVisit + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - visitDate.getTime()) / 86400000);

  const sinceLabel =
    diffDays === 1 ? 'yesterday' :
    diffDays <= 7 ? `${diffDays} days ago` :
    visitDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10 px-4 py-3 mb-2">
      <Sparkles className="h-4 w-4 text-primary shrink-0" />
      <p className="flex-1 text-sm">
        <span className="font-semibold">
          Welcome back{displayName ? `, ${displayName}` : ''}!
        </span>{' '}
        <span className="text-muted-foreground">Last visit: {sinceLabel}.</span>
      </p>
      <button
        onClick={dismiss}
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const STORAGE_KEY = 'beta-banner-dismissed-at';
const RESET_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function BetaBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) { setVisible(true); return; }
      const dismissedAt = parseInt(raw, 10);
      if (Date.now() - dismissedAt > RESET_INTERVAL_MS) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch {}
  };

  if (!visible) return null;

  return (
    <div className="relative flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-sm">
      <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-white/80" />
      <span>
        Early Access — <strong>all features are free during Beta.</strong> No credit card required, no charges.
      </span>
      <button
        onClick={dismiss}
        aria-label="Dismiss beta banner"
        className="absolute right-3 rounded p-0.5 hover:bg-white/20 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

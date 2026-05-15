'use client';

import { useEffect, useState } from 'react';
import { X, Share, PlusSquare } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type Platform = 'android' | 'ios' | null;

function detectPlatform(): Platform {
  if (typeof window === 'undefined') return null;
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return 'android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  return null;
}

function isInStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true)
  );
}

const DISMISSED_KEY = 'ssb_pwa_prompt_dismissed';

export function PWAInstallPrompt() {
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<Platform>(null);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isInStandaloneMode()) return;
    if (sessionStorage.getItem(DISMISSED_KEY)) return;

    const p = detectPlatform();
    setPlatform(p);

    if (p === 'android') {
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setShow(true);
      };
      window.addEventListener('beforeinstallprompt', handler);
      return () => window.removeEventListener('beforeinstallprompt', handler);
    }

    if (p === 'ios') {
      // Show after a 3s delay so it doesn't appear on every visit
      const timer = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem(DISMISSED_KEY, '1');
  };

  const handleInstallAndroid = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') dismiss();
    setDeferredPrompt(null);
  };

  if (!show) return null;

  return (
    <div
      className="fixed bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] left-0 right-0 z-50 mx-auto max-w-sm px-4 animate-in slide-in-from-bottom duration-300 md:bottom-6"
      role="dialog"
      aria-label="Install SSB app"
    >
      <div className="rounded-2xl border border-border bg-card shadow-xl p-4">
        <div className="flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/icon-72x72.png" alt="SSB" className="h-12 w-12 rounded-xl shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Install SSB</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Add to your home screen for a native app experience
            </p>
          </div>
          <button
            onClick={dismiss}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {platform === 'android' && (
          <button
            onClick={handleInstallAndroid}
            className="mt-3 w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Install app
          </button>
        )}

        {platform === 'ios' && !showIOSInstructions && (
          <button
            onClick={() => setShowIOSInstructions(true)}
            className="mt-3 w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            How to install
          </button>
        )}

        {platform === 'ios' && showIOSInstructions && (
          <ol className="mt-3 space-y-2 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">
              <Share className="h-3.5 w-3.5 shrink-0 text-blue-400" />
              Tap the <strong className="text-foreground">Share</strong> button in Safari
            </li>
            <li className="flex items-center gap-2">
              <PlusSquare className="h-3.5 w-3.5 shrink-0 text-blue-400" />
              Select <strong className="text-foreground">Add to Home Screen</strong>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 shrink-0 text-center text-[10px] font-bold text-blue-400">✓</span>
              Tap <strong className="text-foreground">Add</strong> to confirm
            </li>
          </ol>
        )}
      </div>
    </div>
  );
}

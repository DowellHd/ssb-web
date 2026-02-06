'use client';

import { X } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import {
  hasSeenAssistantHint,
  markAssistantHintSeen,
  initAssistantHintDevTools,
} from '@/lib/assistant-hint';

const HINT_DELAY_MS = 2500; // Delay before showing hint to let user orient
const DISPLAY_DURATION = 5000; // How long the hint stays visible
const FADE_OUT_DURATION = 400;

interface AssistantHintProps {
  /** Called when user clicks the hint body to open assistant */
  onOpenAssistant?: () => void;
}

export function AssistantHint({ onOpenAssistant }: AssistantHintProps) {
  const [shouldShow, setShouldShow] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const hasMarkedSeen = useRef(false);

  // Initialize dev tools on mount
  useEffect(() => {
    initAssistantHintDevTools();
  }, []);

  // Check if hint was already seen and show if not
  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    // Check if already seen
    if (hasSeenAssistantHint()) {
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[assistant-hint] suppressed - already seen');
      }
      return;
    }

    // Mark as seen IMMEDIATELY to prevent re-showing on navigation
    if (!hasMarkedSeen.current) {
      hasMarkedSeen.current = true;
      markAssistantHintSeen();
    }

    // Delay before showing to let user orient on the page
    const showTimer = setTimeout(() => {
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[assistant-hint] shown');
      }
      setShouldShow(true);
      // Trigger fade-in after mount
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    }, HINT_DELAY_MS);

    return () => clearTimeout(showTimer);
  }, []);

  // Auto-hide after display duration
  useEffect(() => {
    if (!isVisible || isFadingOut) return;

    const hideTimer = setTimeout(() => {
      startFadeOut();
    }, DISPLAY_DURATION);

    return () => clearTimeout(hideTimer);
  }, [isVisible, isFadingOut]);

  const startFadeOut = useCallback(() => {
    if (isFadingOut) return;

    setIsFadingOut(true);

    // Remove from DOM after fade-out
    setTimeout(() => {
      setShouldShow(false);
      setIsVisible(false);
    }, FADE_OUT_DURATION);
  }, [isFadingOut]);

  const handleClick = useCallback(() => {
    setShouldShow(false);
    onOpenAssistant?.();
  }, [onOpenAssistant]);

  const handleClose = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    startFadeOut();
  }, [startFadeOut]);

  if (!shouldShow) return null;

  return (
    <div
      role="tooltip"
      aria-label="SSB Assistant introduction"
      onClick={handleClick}
      className={cn(
        // Positioning: above and to the left of the bubble button
        'fixed bottom-[calc(1.5rem+4rem+0.75rem)] right-6 z-50',
        // Sizing
        'max-w-[260px] w-max',
        // Appearance
        'bg-card border border-border rounded-xl',
        'shadow-lg',
        'p-3',
        // Cursor
        'cursor-pointer',
        // Transitions (respects reduced motion via CSS)
        'motion-safe:transition-all',
        isVisible && !isFadingOut
          ? 'opacity-100 motion-safe:translate-y-0'
          : 'opacity-0 motion-safe:translate-y-2',
        // Fade-in/out timing
        isFadingOut
          ? 'motion-safe:duration-[400ms]'
          : 'motion-safe:duration-[250ms]'
      )}
      style={{
        // Ensure pointer events work during fade
        pointerEvents: isFadingOut ? 'none' : 'auto',
      }}
    >
      {/* Close button */}
      <button
        onClick={handleClose}
        className={cn(
          'absolute top-2 right-2',
          'h-5 w-5 rounded-full',
          'flex items-center justify-center',
          'text-muted-foreground hover:text-foreground',
          'hover:bg-muted',
          'transition-colors',
          'focus:outline-none focus:ring-1 focus:ring-primary'
        )}
        aria-label="Dismiss hint"
      >
        <X className="h-3 w-3" />
      </button>

      {/* Content */}
      <div className="pr-4">
        <p className="text-sm font-medium text-foreground mb-1">
          Need help?
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          SSB Assistant can explain charts, regimes, and risk metrics — anytime.
        </p>
        <p className="text-[10px] text-muted-foreground/70 mt-2">
          Click the icon to open.
        </p>
      </div>

      {/* Small arrow pointer toward the button */}
      <div
        className={cn(
          'absolute -bottom-1.5 right-8',
          'w-3 h-3',
          'bg-card border-r border-b border-border',
          'rotate-45',
          'rounded-br-sm'
        )}
        aria-hidden="true"
      />
    </div>
  );
}
